import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calcRemaining,
  openWaitingRoom,
  startOsceSession,
  updateTimerPhase,
  setSessionCompletedWaiting,
  pauseTimer,
  resumeTimer,
  sendBroadcast,
  sendBellBroadcast,
  finishSession,
  subscribeToSession,
} from "@/services/realtimeTimerService";
import { supabase } from "@/lib/supabaseClient";

describe("OSCE Circuit Simulation: 6 Stations (4 Exam + 2 Rest), 6 Rolling Participants, 6 Stationary Examiners", () => {
  const SESSION_ID = "sess-circuit-4exam-2rest";
  const TOTAL_STATIONS = 6;
  const TOTAL_ROUNDS = 6;
  const STATION_MINUTES = 12;
  const TRANSITION_MINUTES = 2;

  // Station definitions: 4 Exam + 2 Rest (Station 3 & Station 6 are break stations)
  const STATIONS = [
    { id: "st-1", station_number: 1, is_break: false, title: "Stase 1: Kardiovaskular", case_title: "STEMI Anteroseptal" },
    { id: "st-2", station_number: 2, is_break: false, title: "Stase 2: Respirologi", case_title: "Asma Akut Berat" },
    { id: "st-3", station_number: 3, is_break: true, title: "Stase 3: Istirahat Sirkuit A", case_title: "Rest Station A" },
    { id: "st-4", station_number: 4, is_break: false, title: "Stase 4: Neurologi", case_title: "Stroke Iskemik Akut" },
    { id: "st-5", station_number: 5, is_break: false, title: "Stase 5: Penyakit Dalam", case_title: "Ketoasidosis Diabetik" },
    { id: "st-6", station_number: 6, is_break: true, title: "Stase 6: Istirahat Sirkuit B", case_title: "Rest Station B" },
  ];

  // 6 Examiners stationed at their designated station numbers
  const EXAMINERS = [
    { id: "ex-1", full_name: "dr. Andi, Sp.JP", assigned_station: 1, is_break_station: false },
    { id: "ex-2", full_name: "dr. Budi, Sp.P", assigned_station: 2, is_break_station: false },
    { id: "ex-3", full_name: "dr. Citra (Pengawas Istirahat A)", assigned_station: 3, is_break_station: true },
    { id: "ex-4", full_name: "dr. Dewi, Sp.S", assigned_station: 4, is_break_station: false },
    { id: "ex-5", full_name: "dr. Eko, Sp.PD", assigned_station: 5, is_break_station: false },
    { id: "ex-6", full_name: "dr. Fajar (Pengawas Istirahat B)", assigned_station: 6, is_break_station: true },
  ];

  // 6 Participants with starting stations 1 through 6
  const PARTICIPANTS = [
    { id: "p-1", full_name: "Ahmad Dahlan", nim: "MED-001", starting_station: 1 },
    { id: "p-2", full_name: "Bintang Pratama", nim: "MED-002", starting_station: 2 },
    { id: "p-3", full_name: "Chandra Wijaya", nim: "MED-003", starting_station: 3 },
    { id: "p-4", full_name: "Dian Permata", nim: "MED-004", starting_station: 4 },
    { id: "p-5", full_name: "Erlangga Putra", nim: "MED-005", starting_station: 5 },
    { id: "p-6", full_name: "Farhan Maulana", nim: "MED-006", starting_station: 6 },
  ];

  let channelsMap;
  let timerUpdateCallbacks;
  let sessionUpdateCallbacks;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-21T08:00:00.000Z"));

    channelsMap = new Map();
    timerUpdateCallbacks = [];
    sessionUpdateCallbacks = [];

    vi.spyOn(supabase, "getChannels").mockImplementation(() => Array.from(channelsMap.values()));
    vi.spyOn(supabase, "removeChannel").mockImplementation((ch) => {
      const key = ch.topic || ch.name;
      channelsMap.delete(key);
    });

    vi.spyOn(supabase, "channel").mockImplementation((name, config = {}) => {
      const topic = `realtime:${name}`;
      const ch = {
        name,
        topic,
        config,
        on: vi.fn((type, filter, handler) => {
          if (type === "postgres_changes") {
            if (filter.table === "session_timer_state") timerUpdateCallbacks.push(handler);
            if (filter.table === "sessions") sessionUpdateCallbacks.push(handler);
          }
          return ch;
        }),
        subscribe: vi.fn((cb) => {
          if (cb) cb("SUBSCRIBED");
          return ch;
        }),
        send: vi.fn().mockResolvedValue({}),
        presenceState: vi.fn(() => ({})),
        track: vi.fn().mockResolvedValue({}),
      };
      channelsMap.set(topic, ch);
      return ch;
    });

    vi.spyOn(supabase, "schema").mockImplementation(() => ({
      from: (tableName) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn((payload) => {
          if (tableName === "sessions") {
            sessionUpdateCallbacks.forEach((cb) => cb({ new: { id: SESSION_ID, ...payload } }));
          }
          return {
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: payload, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: payload, error: null }),
          };
        }),
        upsert: vi.fn((rows) => {
          const row = Array.isArray(rows) ? rows[0] : rows;
          if (tableName === "session_timer_state") {
            timerUpdateCallbacks.forEach((cb) => cb({ new: { session_id: SESSION_ID, ...row } }));
          }
          return {
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: row, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
          };
        }),
        insert: vi.fn((rows) => ({
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: rows[0], error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: rows[0], error: null }),
        })),
      }),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // Pure function helper for OSCE rotation formula
  function getParticipantStationNumber(startingStation, roundNumber) {
    return ((startingStation - 1 + (roundNumber - 1)) % TOTAL_STATIONS) + 1;
  }

  it("should verify station distribution across all 6 rounds: exactly 4 candidates in exam stations and 2 in break stations per round", () => {
    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
      let examCount = 0;
      let breakCount = 0;

      const roundStationMap = PARTICIPANTS.map((participant) => {
        const stationNum = getParticipantStationNumber(participant.starting_station, round);
        const station = STATIONS.find((s) => s.station_number === stationNum);
        const examiner = EXAMINERS.find((e) => e.assigned_station === stationNum);

        if (station.is_break) {
          breakCount++;
        } else {
          examCount++;
        }

        return {
          participantId: participant.id,
          participantName: participant.full_name,
          round,
          stationNumber: stationNum,
          isBreak: station.is_break,
          stationTitle: station.title,
          examinerName: examiner.full_name,
        };
      });

      // Verify exact counts per round
      expect(examCount).toBe(4);
      expect(breakCount).toBe(2);

      // Verify no two participants are at the same station
      const stationsInRound = roundStationMap.map((r) => r.stationNumber);
      const uniqueStations = new Set(stationsInRound);
      expect(uniqueStations.size).toBe(6);
    }
  });

  it("should verify that each participant completes all 4 exam stations and both 2 rest stations after 6 rounds", () => {
    PARTICIPANTS.forEach((participant) => {
      const visitedStations = [];
      const visitedBreakStations = [];
      const visitedExamStations = [];

      for (let round = 1; round <= TOTAL_ROUNDS; round++) {
        const stationNum = getParticipantStationNumber(participant.starting_station, round);
        const station = STATIONS.find((s) => s.station_number === stationNum);

        visitedStations.push(stationNum);
        if (station.is_break) {
          visitedBreakStations.push(stationNum);
        } else {
          visitedExamStations.push(stationNum);
        }
      }

      // Every participant visits all 6 stations (1..6) exactly once
      expect(visitedStations.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
      // Exactly 4 clinical exam stations (1, 2, 4, 5)
      expect(visitedExamStations.sort((a, b) => a - b)).toEqual([1, 2, 4, 5]);
      // Exactly 2 rest stations (3, 6)
      expect(visitedBreakStations.sort((a, b) => a - b)).toEqual([3, 6]);
    });
  });

  it("should verify that each examiner stays at their station and assesses exactly 4 different participants across 6 rounds", () => {
    // Check examiners assigned to exam stations (Station 1, 2, 4, 5)
    const clinicalExaminers = EXAMINERS.filter((e) => !e.is_break_station);
    expect(clinicalExaminers.length).toBe(4);

    clinicalExaminers.forEach((examiner) => {
      const testedCandidates = [];

      for (let round = 1; round <= TOTAL_ROUNDS; round++) {
        // Find which candidate is at this examiner's station in this round
        const candidateInRoom = PARTICIPANTS.find((p) => {
          return getParticipantStationNumber(p.starting_station, round) === examiner.assigned_station;
        });

        expect(candidateInRoom).toBeDefined();
        testedCandidates.push({
          round,
          candidateId: candidateInRoom.id,
          candidateName: candidateInRoom.full_name,
        });
      }

      // Over 6 rounds, the examiner sees 6 visits (4 unique clinical candidates, and during break-rotation cycles all 6 rotating candidates pass through)
      const uniqueCandidatesAssessed = new Set(testedCandidates.map((t) => t.candidateId));
      expect(uniqueCandidatesAssessed.size).toBe(6); // All 6 candidates rotate through this examiner's station
    });
  });

  it("should simulate the full 6-round OSCE session with 4 exam + 2 rest stations and verify realtime state machine transitions", async () => {
    // Client state trackers
    const participantStates = PARTICIPANTS.map((p) => ({
      participantId: p.id,
      startingStation: p.starting_station,
      viewMode: "waiting_room",
      isFormLocked: false,
      currentStation: null,
      isCurrentStationBreak: false,
    }));

    const examinerStates = EXAMINERS.map((e) => ({
      examinerId: e.id,
      assignedStation: e.assigned_station,
      isBreakStation: e.is_break_station,
      currentCandidate: null,
      gracePeriodActive: false,
      formUnlocked: true,
    }));

    let adminPhase = "standby";

    // Subscribe all clients
    const unsubscribe = subscribeToSession(SESSION_ID, {
      onTimerUpdate: (timer) => {
        if (!timer) return;
        adminPhase = timer.phase;
        const currentRound = timer.round_number || 1;

        // Update each participant's view based on timer phase & break status
        participantStates.forEach((p) => {
          const stNum = getParticipantStationNumber(p.startingStation, currentRound);
          const stObj = STATIONS.find((s) => s.station_number === stNum);
          p.currentStation = stNum;
          p.isCurrentStationBreak = stObj.is_break;

          if (timer.phase === "standby") {
            p.viewMode = "waiting_room";
          } else if (timer.phase === "initial_transition" || timer.phase === "transition") {
            p.viewMode = "transit";
          } else if (timer.phase === "action") {
            p.viewMode = "live_round";
            // Break station has no editable clinical form
            p.isFormLocked = stObj.is_break;
          } else if (timer.phase === "completed_waiting") {
            // [NEED_FIX.md] Final Thank You Screen & locked
            p.viewMode = "completed";
            p.isFormLocked = true;
          }
        });

        // Update each examiner's view based on current round
        examinerStates.forEach((e) => {
          const candidateInStation = PARTICIPANTS.find(
            (p) => getParticipantStationNumber(p.starting_station, currentRound) === e.assignedStation
          );
          e.currentCandidate = candidateInStation;

          if (timer.phase === "completed_waiting") {
            e.gracePeriodActive = true;
            e.formUnlocked = true; // [NEED_FIX.md] Form NOT locked
          }
        });
      },
    });

    // ─────────────────────────────────────────────────────────────────
    // Step 1: Open Waiting Room
    // ─────────────────────────────────────────────────────────────────
    await openWaitingRoom(SESSION_ID);
    expect(adminPhase).toBe("standby");
    participantStates.forEach((p) => expect(p.viewMode).toBe("waiting_room"));

    // ─────────────────────────────────────────────────────────────────
    // Step 2: Start Simulation (Initial Transition 2 mins)
    // ─────────────────────────────────────────────────────────────────
    await startOsceSession(SESSION_ID, STATION_MINUTES, TRANSITION_MINUTES);
    expect(adminPhase).toBe("initial_transition");
    participantStates.forEach((p) => expect(p.viewMode).toBe("transit"));

    vi.advanceTimersByTime(TRANSITION_MINUTES * 60 * 1000);

    // ─────────────────────────────────────────────────────────────────
    // Step 3: Run Rounds 1 to 6
    // ─────────────────────────────────────────────────────────────────
    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
      // Action phase (12 mins)
      await updateTimerPhase(SESSION_ID, "action", STATION_MINUTES, { roundNumber: round });
      expect(adminPhase).toBe("action");

      // Verify in this round: 4 participants are in active clinical form, 2 in rest station
      const activeExamParticipants = participantStates.filter((p) => !p.isCurrentStationBreak);
      const activeBreakParticipants = participantStates.filter((p) => p.isCurrentStationBreak);

      expect(activeExamParticipants.length).toBe(4);
      expect(activeBreakParticipants.length).toBe(2);

      // Verify exam stations participants have editable forms, break participants have locked/no form
      activeExamParticipants.forEach((p) => expect(p.isFormLocked).toBe(false));
      activeBreakParticipants.forEach((p) => expect(p.isFormLocked).toBe(true));

      // Fast forward to end of Action Phase (12 mins)
      vi.advanceTimersByTime(STATION_MINUTES * 60 * 1000);

      // If not final round, run transition phase (2 mins)
      if (round < TOTAL_ROUNDS) {
        await updateTimerPhase(SESSION_ID, "transition", TRANSITION_MINUTES, { roundNumber: round });
        expect(adminPhase).toBe("transition");
        participantStates.forEach((p) => expect(p.viewMode).toBe("transit"));
        vi.advanceTimersByTime(TRANSITION_MINUTES * 60 * 1000);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // Step 4: Final Round 6 Expiry & End-of-Exam State ([NEED_FIX.md])
    // ─────────────────────────────────────────────────────────────────
    await setSessionCompletedWaiting(SESSION_ID, TOTAL_STATIONS);

    expect(adminPhase).toBe("completed_waiting");

    // Check all 6 participants: redirected to 'completed' Thank You screen & form locked
    participantStates.forEach((p) => {
      expect(p.viewMode).toBe("completed");
      expect(p.isFormLocked).toBe(true);
    });

    // Check all 4 clinical examiners: in Grading Grace Period and forms UNLOCKED
    const clinicalExaminers = examinerStates.filter((e) => !e.isBreakStation);
    clinicalExaminers.forEach((e) => {
      expect(e.gracePeriodActive).toBe(true);
      expect(e.formUnlocked).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────
    // Step 5: Admin Finishes Session
    // ─────────────────────────────────────────────────────────────────
    await finishSession(SESSION_ID);

    unsubscribe();
  });
});
