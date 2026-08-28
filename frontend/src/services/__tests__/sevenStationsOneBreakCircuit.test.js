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
import {
  AUDIO_ASSETS,
  NOTIFICATION_CONFIG,
  normalizeOsceEventKey,
  stopAllAudio,
  playOsceAudio,
  playOsceFeedback,
  triggerWelcomeNotice,
  triggerReadScenarioNotice,
  triggerStartExamNotice,
  triggerWarning3MinNotice,
  triggerStopTransitNotice,
  triggerRestBreakNotice,
  triggerFinishExamNotice,
  triggerPauseNotice,
  triggerResumeNotice,
  triggerCountdownNotice,
} from "@/services/audioService";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// Mock Sonner toast notifications
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe("OSCE Circuit Simulation: 7 Stations (6 Exam + 1 Rest in Middle), 7 Candidates, 7 Stationary Examiners & Audio Engine", () => {
  const SESSION_ID = "sess-circuit-6exam-1rest-middle";
  const TOTAL_STATIONS = 7;
  const TOTAL_ROUNDS = 7;
  const STATION_MINUTES = 12;
  const TRANSITION_MINUTES = 2;

  // Station definitions: 6 Exam Stations + 1 Rest Station in the Middle (Station 4)
  const STATIONS = [
    { id: "st-1", station_number: 1, is_break: false, title: "Stase 1: Kardiovaskular", case_title: "STEMI Anteroseptal" },
    { id: "st-2", station_number: 2, is_break: false, title: "Stase 2: Respirologi", case_title: "Asma Akut Berat" },
    { id: "st-3", station_number: 3, is_break: false, title: "Stase 3: Gastroenterohepatologi", case_title: "Perdarahan Saluran Cerna" },
    { id: "st-4", station_number: 4, is_break: true, title: "Stase 4: Istirahat Sirkuit (Tengah)", case_title: "Rest Station (Middle)" },
    { id: "st-5", station_number: 5, is_break: false, title: "Stase 5: Neurologi", case_title: "Stroke Iskemik Akut" },
    { id: "st-6", station_number: 6, is_break: false, title: "Stase 6: Penyakit Dalam", case_title: "Ketoasidosis Diabetik" },
    { id: "st-7", station_number: 7, is_break: false, title: "Stase 7: Pediatri & Emergensi", case_title: "Kejang Demam Kompleks" },
  ];

  // 7 Examiners: 6 Clinical Examiners (at stations 1, 2, 3, 5, 6, 7) and 1 Rest Supervisor (at station 4)
  const EXAMINERS = [
    { id: "ex-1", full_name: "dr. Andi, Sp.JP", assigned_station: 1, is_break_station: false },
    { id: "ex-2", full_name: "dr. Budi, Sp.P", assigned_station: 2, is_break_station: false },
    { id: "ex-3", full_name: "dr. Citra, Sp.PD-KGEH", assigned_station: 3, is_break_station: false },
    { id: "ex-4", full_name: "dr. Doni (Pengawas Stase Istirahat)", assigned_station: 4, is_break_station: true },
    { id: "ex-5", full_name: "dr. Eko, Sp.S", assigned_station: 5, is_break_station: false },
    { id: "ex-6", full_name: "dr. Fajar, Sp.PD", assigned_station: 6, is_break_station: false },
    { id: "ex-7", full_name: "dr. Gita, Sp.A", assigned_station: 7, is_break_station: false },
  ];

  // 7 Participants starting at stations 1 through 7
  const PARTICIPANTS = [
    { id: "p-1", full_name: "Ahmad Dahlan", nim: "MED-001", starting_station: 1 },
    { id: "p-2", full_name: "Bintang Pratama", nim: "MED-002", starting_station: 2 },
    { id: "p-3", full_name: "Chandra Wijaya", nim: "MED-003", starting_station: 3 },
    { id: "p-4", full_name: "Dian Permata", nim: "MED-004", starting_station: 4 }, // Starts at rest station!
    { id: "p-5", full_name: "Erlangga Putra", nim: "MED-005", starting_station: 5 },
    { id: "p-6", full_name: "Farhan Maulana", nim: "MED-006", starting_station: 6 },
    { id: "p-7", full_name: "Gilang Ramadhan", nim: "MED-007", starting_station: 7 },
  ];

  let channelsMap;
  let timerUpdateCallbacks;
  let sessionUpdateCallbacks;
  let mockAudioInstances;

  class MockAudio {
    constructor(src) {
      this.src = src;
      this.volume = 1;
      this.currentTime = 0;
      this.paused = true;
      this.play = vi.fn().mockImplementation(() => {
        this.paused = false;
        return Promise.resolve();
      });
      this.pause = vi.fn().mockImplementation(() => {
        this.paused = true;
      });
      mockAudioInstances.push(this);
    }
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T08:00:00.000Z"));

    mockAudioInstances = [];
    global.window = {};
    global.Audio = MockAudio;

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

  // Pure rotation formula helper: ((starting_station - 1 + (round_number - 1)) % TOTAL_STATIONS) + 1
  function getParticipantStationNumber(startingStation, roundNumber) {
    return ((startingStation - 1 + (roundNumber - 1)) % TOTAL_STATIONS) + 1;
  }

  // ─────────────────────────────────────────────────────────────────
  // BAGIAN 1: PEMBUKTIAN MATEMATIS ROTASI SIRKUIT 7 STASE (6 UJIAN + 1 ISTIRAHAT DITENGAH)
  // ─────────────────────────────────────────────────────────────────
  describe("1. Mathematical Rotation Logic & Station Balance", () => {
    it("should verify station distribution across all 7 rounds: exactly 6 candidates in exam stations and 1 in middle rest station per round", () => {
      for (let round = 1; round <= TOTAL_ROUNDS; round++) {
        let examCount = 0;
        let breakCount = 0;

        const roundStationMap = PARTICIPANTS.map((participant) => {
          const stationNum = getParticipantStationNumber(participant.starting_station, round);
          const station = STATIONS.find((s) => s.station_number === stationNum);

          if (station.is_break) {
            breakCount++;
          } else {
            examCount++;
          }

          return {
            participantId: participant.id,
            round,
            stationNumber: stationNum,
            isBreak: station.is_break,
          };
        });

        // Verify exact balance per round: 6 clinical exam candidates, 1 rest candidate
        expect(examCount).toBe(6);
        expect(breakCount).toBe(1);

        // Verify zero collision: all 7 candidates are assigned to 7 unique stations
        const occupiedStations = roundStationMap.map((r) => r.stationNumber);
        expect(new Set(occupiedStations).size).toBe(7);
      }
    });

    it("should verify that each participant completes all 6 clinical exam stations and visits the 1 rest station in the middle (Station 4) after 7 rounds", () => {
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

        // Every participant visits all 7 stations (1..7) exactly once
        expect(visitedStations.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
        // Exactly 6 clinical exam stations (1, 2, 3, 5, 6, 7)
        expect(visitedExamStations.sort((a, b) => a - b)).toEqual([1, 2, 3, 5, 6, 7]);
        // Exactly 1 middle rest station (Station 4)
        expect(visitedBreakStations).toEqual([4]);
      });
    });

    it("should verify that each clinical examiner stays stationary and assesses all 6 rotating candidates across 7 rounds", () => {
      const clinicalExaminers = EXAMINERS.filter((e) => !e.is_break_station);
      expect(clinicalExaminers.length).toBe(6);

      clinicalExaminers.forEach((examiner) => {
        const testedCandidates = [];

        for (let round = 1; round <= TOTAL_ROUNDS; round++) {
          const candidateInRoom = PARTICIPANTS.find(
            (p) => getParticipantStationNumber(p.starting_station, round) === examiner.assigned_station
          );

          expect(candidateInRoom).toBeDefined();
          testedCandidates.push(candidateInRoom.id);
        }

        // Across 7 rounds, all 7 rotating candidates pass through this clinical examiner's station (1 per round)
        const uniqueCandidatesAssessed = new Set(testedCandidates);
        expect(uniqueCandidatesAssessed.size).toBe(7);
      });
    });

    it("should confirm candidate starting at Station 4 (Rest Station) begins at rest and then completes all 6 exam stations in rounds 2 to 7", () => {
      const pRestStart = PARTICIPANTS.find((p) => p.starting_station === 4);
      expect(pRestStart).toBeDefined();

      const sequence = [];
      for (let round = 1; round <= TOTAL_ROUNDS; round++) {
        sequence.push(getParticipantStationNumber(pRestStart.starting_station, round));
      }

      // Round 1: Station 4 (Rest), Round 2: Station 5, Round 3: Station 6, Round 4: Station 7, Round 5: Station 1, Round 6: Station 2, Round 7: Station 3
      expect(sequence).toEqual([4, 5, 6, 7, 1, 2, 3]);
      expect(sequence[0]).toBe(4); // Starts at Rest station
      expect(sequence.slice(1)).toEqual([5, 6, 7, 1, 2, 3]); // Followed by 6 exam stations
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // BAGIAN 2: SIMULASI REALTIME STATE MACHINE & VIEW MODE / FORM LOCKING
  // ─────────────────────────────────────────────────────────────────
  describe("2. Realtime State Machine & Dynamic UI View Simulation", () => {
    it("should simulate full 7-round OSCE session with middle rest station and verify correct phase transitions and form locks", async () => {
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

      const unsubscribe = subscribeToSession(SESSION_ID, {
        onTimerUpdate: (timer) => {
          if (!timer) return;
          adminPhase = timer.phase;
          const currentRound = timer.round_number || 1;

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
              p.isFormLocked = stObj.is_break; // Rest station form is locked
            } else if (timer.phase === "completed_waiting") {
              p.viewMode = "completed";
              p.isFormLocked = true;
            }
          });

          examinerStates.forEach((e) => {
            const candidateInStation = PARTICIPANTS.find(
              (p) => getParticipantStationNumber(p.starting_station, currentRound) === e.assignedStation
            );
            e.currentCandidate = candidateInStation;

            if (timer.phase === "completed_waiting") {
              e.gracePeriodActive = true;
              e.formUnlocked = true; // Examiners grace period unlocked
            }
          });
        },
      });

      // Step 1: Waiting room
      await openWaitingRoom(SESSION_ID);
      expect(adminPhase).toBe("standby");
      participantStates.forEach((p) => expect(p.viewMode).toBe("waiting_room"));

      // Step 2: Start session
      await startOsceSession(SESSION_ID, STATION_MINUTES, TRANSITION_MINUTES);
      expect(adminPhase).toBe("initial_transition");
      participantStates.forEach((p) => expect(p.viewMode).toBe("transit"));

      vi.advanceTimersByTime(TRANSITION_MINUTES * 60 * 1000);

      // Step 3: Run 7 rounds
      for (let round = 1; round <= TOTAL_ROUNDS; round++) {
        await updateTimerPhase(SESSION_ID, "action", STATION_MINUTES, { roundNumber: round });
        expect(adminPhase).toBe("action");

        const examParticipants = participantStates.filter((p) => !p.isCurrentStationBreak);
        const breakParticipants = participantStates.filter((p) => p.isCurrentStationBreak);

        // Verify balance in action phase: 6 exam candidates, 1 rest candidate
        expect(examParticipants.length).toBe(6);
        expect(breakParticipants.length).toBe(1);

        // Candidate at rest station (Station 4) has locked form
        expect(breakParticipants[0].currentStation).toBe(4);
        expect(breakParticipants[0].isFormLocked).toBe(true);

        // Candidates at exam stations have unlocked forms
        examParticipants.forEach((p) => expect(p.isFormLocked).toBe(false));

        vi.advanceTimersByTime(STATION_MINUTES * 60 * 1000);

        if (round < TOTAL_ROUNDS) {
          await updateTimerPhase(SESSION_ID, "transition", TRANSITION_MINUTES, { roundNumber: round });
          expect(adminPhase).toBe("transition");
          participantStates.forEach((p) => expect(p.viewMode).toBe("transit"));
          vi.advanceTimersByTime(TRANSITION_MINUTES * 60 * 1000);
        }
      }

      // Step 4: Final Round 7 Expiry & End-of-Exam State
      await setSessionCompletedWaiting(SESSION_ID, TOTAL_ROUNDS);
      expect(adminPhase).toBe("completed_waiting");

      // Candidates redirected to completed view with locked forms
      participantStates.forEach((p) => {
        expect(p.viewMode).toBe("completed");
        expect(p.isFormLocked).toBe(true);
      });

      // Clinical examiners enter grading grace period with unlocked forms
      const clinicalExaminers = examinerStates.filter((e) => !e.isBreakStation);
      clinicalExaminers.forEach((e) => {
        expect(e.gracePeriodActive).toBe(true);
        expect(e.formUnlocked).toBe(true);
      });

      // Step 5: Finish session
      await finishSession(SESSION_ID);
      unsubscribe();
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // BAGIAN 3: VERIFIKASI UNIFIED AUDIO ENGINE & TOAST NOTIFICATION
  // ─────────────────────────────────────────────────────────────────
  describe("3. Unified Audio Engine & Sound Cues Verification", () => {
    it("should correctly normalize event keys and aliases in normalizeOsceEventKey", () => {
      expect(normalizeOsceEventKey("welcome")).toBe("welcome");
      expect(normalizeOsceEventKey("waiting_room")).toBe("welcome");
      expect(normalizeOsceEventKey("waiting")).toBe("welcome");

      expect(normalizeOsceEventKey("read_scenario")).toBe("read_scenario");
      expect(normalizeOsceEventKey("transit")).toBe("read_scenario");
      expect(normalizeOsceEventKey("reading")).toBe("read_scenario");

      expect(normalizeOsceEventKey("start_exam")).toBe("start_exam");
      expect(normalizeOsceEventKey("start")).toBe("start_exam");

      expect(normalizeOsceEventKey("warning_3min")).toBe("warning_3min");
      expect(normalizeOsceEventKey("warning")).toBe("warning_3min");

      expect(normalizeOsceEventKey("stop_transit")).toBe("stop_transit");
      expect(normalizeOsceEventKey("rotation")).toBe("stop_transit");

      expect(normalizeOsceEventKey("rest_break")).toBe("rest_break");
      expect(normalizeOsceEventKey("rest")).toBe("rest_break");
      expect(normalizeOsceEventKey("break")).toBe("rest_break");

      expect(normalizeOsceEventKey("finish_exam")).toBe("finish_exam");
      expect(normalizeOsceEventKey("finish")).toBe("finish_exam");

      expect(normalizeOsceEventKey("pause")).toBe("pause");
      expect(normalizeOsceEventKey("resume")).toBe("resume");
      expect(normalizeOsceEventKey("countdown")).toBe("countdown");
      expect(normalizeOsceEventKey("admin_broadcast")).toBe("broadcast");
      expect(normalizeOsceEventKey("broadcast")).toBe("broadcast");
    });

    it("should play correct audio assets and respect 5-second throttle rules via playOsceAudio", () => {
      playOsceAudio("start_exam");
      expect(mockAudioInstances.length).toBe(1);
      expect(mockAudioInstances[0].src).toBe("/sounds/audio_03_start_exam.mp3");
      expect(mockAudioInstances[0].play).toHaveBeenCalled();

      // Rapid call within 5 seconds without force flag should be throttled
      playOsceAudio("start_exam");
      expect(mockAudioInstances.length).toBe(1); // No new Audio instance created

      // Call with force = true should bypass throttle
      playOsceAudio("start_exam", true);
      expect(mockAudioInstances.length).toBe(2);
      expect(mockAudioInstances[1].src).toBe("/sounds/audio_03_start_exam.mp3");

      // Advance time by 6 seconds -> throttle resets
      vi.advanceTimersByTime(6000);
      playOsceAudio("rest_break");
      expect(mockAudioInstances.length).toBe(3);
      expect(mockAudioInstances[2].src).toBe("/sounds/audio_06_rest_break.mp3");
    });

    it("should stop playing audio when stopAllAudio is invoked", () => {
      playOsceAudio("read_scenario");
      const currentAudio = mockAudioInstances[mockAudioInstances.length - 1];
      expect(currentAudio.paused).toBe(false);

      stopAllAudio();
      expect(currentAudio.pause).toHaveBeenCalled();
      expect(currentAudio.currentTime).toBe(0);
    });

    it("should trigger combined sound playback and role-tailored toast feedback via playOsceFeedback", () => {
      // 1. Welcome Feedback
      playOsceFeedback("welcome", "participant", true);
      expect(toast.info).toHaveBeenCalledWith(
        "Ujian OSCE Dimulai: Selamat Datang di OSCE MedSkill",
        expect.objectContaining({ id: "osce-bell-status" })
      );

      // 2. Read Scenario Feedback
      playOsceFeedback("read_scenario", "participant", true);
      expect(toast.info).toHaveBeenCalledWith(
        "Waktu Membaca Skenario Kasus",
        expect.objectContaining({ id: "osce-bell-status" })
      );

      // 3. Start Exam Feedback
      playOsceFeedback("start_exam", "participant", true);
      expect(toast.success).toHaveBeenCalledWith(
        "Waktu Membaca Selesai! Ujian Stase Dimulai",
        expect.objectContaining({ id: "osce-bell-status" })
      );

      // 4. Warning 3 Min Feedback
      playOsceFeedback("warning_3min", "examiner", true);
      expect(toast.warning).toHaveBeenCalledWith(
        "Peringatan Waktu: Sisa Waktu Stase 3 Menit!",
        expect.objectContaining({ id: "osce-bell-status" })
      );

      // 5. Rest Break Feedback (Specific for middle rest station)
      playOsceFeedback("rest_break", "participant", true);
      expect(toast.info).toHaveBeenCalledWith(
        "Stase Istirahat Sirkuit",
        expect.objectContaining({
          description: "Anda memasuki stase istirahat. Silakan memulihkan stamina di area sirkuit.",
        })
      );

      // 6. Finish Exam Feedback
      playOsceFeedback("finish_exam", "admin", true);
      expect(toast.dismiss).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "Seluruh Rangkaian Ujian OSCE Selesai!",
        expect.objectContaining({ id: "osce-bell-status" })
      );
    });

    it("should support quick-access helper functions for all major OSCE bell events", () => {
      triggerWelcomeNotice("participant");
      triggerReadScenarioNotice("participant");
      triggerStartExamNotice("participant");
      triggerWarning3MinNotice("participant");
      triggerStopTransitNotice("participant");
      triggerRestBreakNotice("participant");
      triggerFinishExamNotice("participant");
      triggerPauseNotice("participant");
      triggerResumeNotice("participant");
      triggerCountdownNotice("participant");

      // Verify that Audio instances were created for sound notices
      expect(mockAudioInstances.length).toBeGreaterThanOrEqual(8);
    });

    it("should broadcast bell audio event over Supabase Realtime WebSocket using sendBellBroadcast", async () => {
      const result = await sendBellBroadcast(SESSION_ID, "rest_break");
      expect(result).toBeDefined();

      const activeChannel = channelsMap.get(`realtime:osce-session:${SESSION_ID}`);
      expect(activeChannel).toBeDefined();
      expect(activeChannel.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "broadcast",
          event: "play_bell",
          payload: expect.objectContaining({
            bell_type: "rest_break",
            message: "BEL AUDIO: Waktu Istirahat Sirkuit.",
          }),
        })
      );
    });
  });
});
