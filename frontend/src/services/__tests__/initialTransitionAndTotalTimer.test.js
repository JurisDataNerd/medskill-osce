import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calcRemaining,
  openWaitingRoom,
  startOsceSession,
  updateTimerPhase,
  setSessionCompletedWaiting,
  finishSession,
  subscribeToSession,
} from "@/services/realtimeTimerService";
import { supabase } from "@/lib/supabaseClient";

describe("Initial Transition (1m) & Synchronized Total Timer Match Tests", () => {
  const SESSION_ID = "sess-1round-2m-1m-trans";
  const TOTAL_ROUNDS = 1;
  const STATION_MINUTES = 2;
  const TRANSITION_MINUTES = 1;

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

  // Pure function representing LiveMonitorPage Total Session Remaining calculation
  function calculateTotalRemaining(timerState, remainingSeconds, activeSession, currentRound = 1) {
    const totalRoundsCount = Number(activeSession?.total_rounds || 1);
    const stationDurationSec = Number(activeSession?.station_duration_minutes ?? 2) * 60;
    const transitionDurationSec = Number(activeSession?.transition_duration_minutes ?? 1) * 60;
    const breakDurationSec = Number(activeSession?.break_duration_minutes ?? 0) * 60;
    const totalSessionDurationSec = (totalRoundsCount * stationDurationSec) + (totalRoundsCount * transitionDurationSec) + breakDurationSec;

    const currentPhase = timerState?.phase || "standby";

    if (currentPhase === "completed_waiting" || currentPhase === "finished") {
      return 0;
    } else if (currentPhase === "initial_transition") {
      const futureRoundsCount = Math.max(0, totalRoundsCount - 1);
      const futureRoundsSec = futureRoundsCount * (stationDurationSec + transitionDurationSec);
      return remainingSeconds + stationDurationSec + futureRoundsSec;
    } else if (currentPhase === "action" || currentPhase === "running" || currentPhase === "reading" || currentPhase === "paused") {
      const futureRoundsCount = Math.max(0, totalRoundsCount - currentRound);
      const futureRoundsSec = futureRoundsCount * (stationDurationSec + transitionDurationSec);
      return remainingSeconds + futureRoundsSec;
    } else if (currentPhase === "transition") {
      const nextRound = currentRound + 1;
      const futureRoundsCount = Math.max(0, totalRoundsCount - nextRound);
      const futureRoundsSec = futureRoundsCount * (stationDurationSec + transitionDurationSec);
      return remainingSeconds + stationDurationSec + futureRoundsSec;
    }
    return totalSessionDurationSec;
  }

  it("should accurately start with 1 minute initial transition, synchronizing Admin Total Timer, Participant Transit, and Examiner Persiapan", async () => {
    const sessionConfig = {
      id: SESSION_ID,
      total_rounds: 1,
      station_duration_minutes: 2,
      transition_duration_minutes: 1,
      break_duration_minutes: 0,
    };

    let participantView = "waiting_room";
    let examinerBadge = "STANDBY";
    let adminPhaseDisplay = "standby";
    let clientTimerState = null;

    const unsubscribe = subscribeToSession(SESSION_ID, {
      onTimerUpdate: (timer) => {
        clientTimerState = timer;
        adminPhaseDisplay = timer.phase;

        // Participant View Routing
        if (timer.phase === "initial_transition" || timer.phase === "transition") {
          participantView = "transit";
        } else if (timer.phase === "action") {
          participantView = "live_round";
        } else if (timer.phase === "completed_waiting") {
          participantView = "completed";
        }

        // Examiner Badge Text
        if (timer.phase === "initial_transition") {
          examinerBadge = "PERSIAPAN";
        } else if (timer.phase === "action") {
          examinerBadge = "ACTION";
        } else if (timer.phase === "completed_waiting") {
          examinerBadge = "SELESAI";
        }
      },
    });

    // 1. Admin Opens Waiting Room
    await openWaitingRoom(SESSION_ID);
    expect(adminPhaseDisplay).toBe("standby");
    expect(participantView).toBe("waiting_room");

    // 2. Admin Clicks Start (1 Round, 2 min station, 1 min transition)
    await startOsceSession(SESSION_ID, STATION_MINUTES, TRANSITION_MINUTES);

    // [VALIDASI FASE AWAL]: Harus masuk ke initial_transition (1 Menit), BUKAN langsung stase ujian!
    expect(clientTimerState.phase).toBe("initial_transition");
    expect(adminPhaseDisplay).toBe("initial_transition");
    expect(participantView).toBe("transit");
    expect(examinerBadge).toBe("PERSIAPAN");

    // Sub-timer sisa 60 detik (1 menit)
    let subTimerRem = calcRemaining(clientTimerState.target_end_time);
    expect(subTimerRem).toBe(60);

    // Total Global Timer: 1m (initial transition) + 2m (station action) = 3m = 180 detik
    let totalRem = calculateTotalRemaining(clientTimerState, subTimerRem, sessionConfig, 1);
    expect(totalRem).toBe(180); // 03:00

    // 3. Maju 23 detik di Initial Transition (Sisa 37 detik)
    vi.advanceTimersByTime(23 * 1000);
    subTimerRem = calcRemaining(clientTimerState.target_end_time);
    expect(subTimerRem).toBe(37);

    totalRem = calculateTotalRemaining(clientTimerState, subTimerRem, sessionConfig, 1);
    expect(totalRem).toBe(157); // 37s + 120s = 157s (02:37)

    // 4. Initial Transition selesai (60 detik tuntas) -> Masuk ke Stase Ujian (Action 2 Menit = 120s)
    vi.advanceTimersByTime(37 * 1000);
    await updateTimerPhase(SESSION_ID, "action", STATION_MINUTES, { roundNumber: 1 });

    expect(clientTimerState.phase).toBe("action");
    expect(participantView).toBe("live_round");
    expect(examinerBadge).toBe("ACTION");

    subTimerRem = calcRemaining(clientTimerState.target_end_time);
    expect(subTimerRem).toBe(120);

    // Saat Action mulai, Total Timer = 120s (02:00)
    totalRem = calculateTotalRemaining(clientTimerState, subTimerRem, sessionConfig, 1);
    expect(totalRem).toBe(120);

    // 5. Maju 83 detik di Action Phase (Sisa 37 detik di Sub-Timer)
    vi.advanceTimersByTime(83 * 1000);
    subTimerRem = calcRemaining(clientTimerState.target_end_time);
    expect(subTimerRem).toBe(37); // Sisa 00:37 di Sub-Timer!

    // [VALIDASI SINKRONISASI]: Total Timer pada 1 ronde harus TEPAT sama dengan Sub-Timer (37 detik)!
    totalRem = calculateTotalRemaining(clientTimerState, subTimerRem, sessionConfig, 1);
    expect(totalRem).toBe(37); // Sub-timer 00:37 === Total Timer 00:37!

    // 6. Action Phase selesai (Sisa 0 detik) -> Masuk ke completed_waiting (NEED_FIX.md)
    vi.advanceTimersByTime(37 * 1000);
    await setSessionCompletedWaiting(SESSION_ID, TOTAL_ROUNDS);

    expect(clientTimerState.phase).toBe("completed_waiting");
    expect(participantView).toBe("completed");
    expect(examinerBadge).toBe("SELESAI");

    totalRem = calculateTotalRemaining(clientTimerState, 0, sessionConfig, 1);
    expect(totalRem).toBe(0);

    unsubscribe();
  });
});
