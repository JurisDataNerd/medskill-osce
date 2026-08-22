import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calcRemaining,
  startOsceSession,
  updateTimerPhase,
  setSessionCompletedWaiting,
  pauseTimer,
  resumeTimer,
  finishSession,
  subscribeToSession,
} from "@/services/realtimeTimerService";
import { supabase } from "@/lib/supabaseClient";

describe("Advanced OSCE Use Cases & Edge-Case Simulations", () => {
  let channelsMap;
  let timerUpdateCallbacks;
  let sessionUpdateCallbacks;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-21T09:00:00.000Z"));

    channelsMap = new Map();
    timerUpdateCallbacks = [];
    sessionUpdateCallbacks = [];

    vi.spyOn(supabase, "getChannels").mockImplementation(() => Array.from(channelsMap.values()));
    vi.spyOn(supabase, "removeChannel").mockImplementation((ch) => {
      channelsMap.delete(ch.topic || ch.name);
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
            sessionUpdateCallbacks.forEach((cb) => cb({ new: payload }));
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
            timerUpdateCallbacks.forEach((cb) => cb({ new: row }));
          }
          return {
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: row, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
          };
        }),
      }),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // --------------------------------------------------------------------------
  // USE CASE 1: Sesi 2 Gelombang (Multi-Wave) dengan Jeda Fisik (Break 5 Menit)
  // --------------------------------------------------------------------------
  it("Use Case 1: Multi-Wave OSCE (2 Waves x 3 Rounds) with Inter-Wave Break (5 min)", async () => {
    const SESSION_ID = "sess-multi-wave-2x3";
    const STATION_MIN = 2; // 2 menit ujian
    const TRANSITION_MIN = 1; // 1 menit transisi
    const BREAK_MIN = 5; // 5 menit istirahat antar gelombang

    let currentTimer = null;
    const unsubscribe = subscribeToSession(SESSION_ID, {
      onTimerUpdate: (t) => {
        currentTimer = t;
      },
    });

    // 1. Gelombang 1 Dimulai -> Persiapan Stase 1 (1 menit)
    await startOsceSession(SESSION_ID, STATION_MIN, TRANSITION_MIN);
    expect(currentTimer.phase).toBe("initial_transition");
    expect(currentTimer.wave_number).toBe(1);
    expect(currentTimer.round_number).toBe(1);

    // 2. Ronde 1 Action (2 menit)
    vi.advanceTimersByTime(60 * 1000);
    await updateTimerPhase(SESSION_ID, "action", STATION_MIN, { roundNumber: 1, waveNumber: 1 });
    expect(currentTimer.phase).toBe("action");
    expect(currentTimer.round_number).toBe(1);

    // 3. Transisi Ronde 1 -> 2 (1 menit)
    vi.advanceTimersByTime(120 * 1000);
    await updateTimerPhase(SESSION_ID, "transition", TRANSITION_MIN, { roundNumber: 1, waveNumber: 1 });
    expect(currentTimer.phase).toBe("transition");

    // 4. Ronde 2 Action (2 menit)
    vi.advanceTimersByTime(60 * 1000);
    await updateTimerPhase(SESSION_ID, "action", STATION_MIN, { roundNumber: 2, waveNumber: 1 });
    expect(currentTimer.round_number).toBe(2);

    // 5. Transisi Ronde 2 -> 3 (1 menit)
    vi.advanceTimersByTime(120 * 1000);
    await updateTimerPhase(SESSION_ID, "transition", TRANSITION_MIN, { roundNumber: 2, waveNumber: 1 });

    // 6. Ronde 3 Action (Ronde Terakhir Gelombang 1)
    vi.advanceTimersByTime(60 * 1000);
    await updateTimerPhase(SESSION_ID, "action", STATION_MIN, { roundNumber: 3, waveNumber: 1 });
    expect(currentTimer.round_number).toBe(3);

    // 7. Gelombang 1 Selesai -> Masuk Jeda Fisik / Break Antar Gelombang (5 Menit)
    vi.advanceTimersByTime(120 * 1000);
    await updateTimerPhase(SESSION_ID, "break", BREAK_MIN, { roundNumber: 3, waveNumber: 1 });
    expect(currentTimer.phase).toBe("break");
    let breakRem = calcRemaining(currentTimer.target_end_time);
    expect(breakRem).toBe(300); // 5 Menit = 300 detik

    // 8. Gelombang 2 Dimulai -> Persiapan Gelombang 2 (1 Menit)
    vi.advanceTimersByTime(300 * 1000);
    await updateTimerPhase(SESSION_ID, "initial_transition", TRANSITION_MIN, { roundNumber: 1, waveNumber: 2 });
    expect(currentTimer.phase).toBe("initial_transition");
    expect(currentTimer.wave_number).toBe(2);
    expect(currentTimer.round_number).toBe(1);

    unsubscribe();
  });

  // --------------------------------------------------------------------------
  // USE CASE 2: Admin Melakukan Skip Manual Fase (Fast-Forward saat peserta selesai lebih awal)
  // --------------------------------------------------------------------------
  it("Use Case 2: Admin Fast-Forward Skip Phase mid-round without breaking rotation state", async () => {
    const SESSION_ID = "sess-manual-skip-test";
    let currentTimer = null;
    subscribeToSession(SESSION_ID, {
      onTimerUpdate: (t) => {
        currentTimer = t;
      },
    });

    // Mulai Sesi Ujian (Initial Transition 1m)
    await startOsceSession(SESSION_ID, 2, 1);
    expect(currentTimer.phase).toBe("initial_transition");

    // Admin skip langsung ke Action Ronde 1 saat baru 15 detik persiapan
    vi.advanceTimersByTime(15 * 1000);
    await updateTimerPhase(SESSION_ID, "action", 2, { roundNumber: 1 });
    expect(currentTimer.phase).toBe("action");
    expect(currentTimer.round_number).toBe(1);
    expect(calcRemaining(currentTimer.target_end_time)).toBe(120);

    // Di detik ke-40 stase ujian, peserta dan penguji selesai lebih awal -> Admin klik Skip Manual ke Transisi
    vi.advanceTimersByTime(40 * 1000);
    expect(calcRemaining(currentTimer.target_end_time)).toBe(80); // Sisa 80 detik diabaikan karena di-skip

    await updateTimerPhase(SESSION_ID, "transition", 1, { roundNumber: 1 });
    expect(currentTimer.phase).toBe("transition");
    expect(calcRemaining(currentTimer.target_end_time)).toBe(60);

    // Skip Transisi langsung ke Ronde 2 Action
    await updateTimerPhase(SESSION_ID, "action", 2, { roundNumber: 2 });
    expect(currentTimer.phase).toBe("action");
    expect(currentTimer.round_number).toBe(2);
    expect(calcRemaining(currentTimer.target_end_time)).toBe(120);
  });

  // --------------------------------------------------------------------------
  // USE CASE 3: Client Disconnect & Reconnect (Tab Sleep / Browser Reload Immunity)
  // --------------------------------------------------------------------------
  it("Use Case 3: Offline Disconnect / Browser Reload recalculates exact remaining time instantly via Future Timestamp", async () => {
    const SESSION_ID = "sess-offline-recovery";
    const startTime = new Date("2026-08-21T09:00:00.000Z").getTime();

    // Start 2 minute action at 09:00:00 UTC (target_end_time = 09:02:00 UTC)
    const targetEndTime = new Date(startTime + 120 * 1000).toISOString();
    const serverTimerState = {
      session_id: SESSION_ID,
      phase: "action",
      round_number: 1,
      target_end_time: targetEndTime,
      paused_remaining_ms: null,
    };

    // Client online saat t=0s -> Sisa 120 detik
    expect(calcRemaining(serverTimerState.target_end_time)).toBe(120);

    // Client laptop ditutup / offline selama 75 detik, lalu buka browser lagi pada 09:01:15 UTC
    vi.advanceTimersByTime(75 * 1000);

    // Saat client baru reload dan memanggil calcRemaining(target_end_time) dari database:
    const recoveredRemaining = calcRemaining(serverTimerState.target_end_time);

    // Hasil harus tepat 45 detik (120s - 75s), tanpa drift, tanpa lag!
    expect(recoveredRemaining).toBe(45);

    // Client offline sampai waktu habis (melewati 09:02:00 UTC)
    vi.advanceTimersByTime(50 * 1000); // 75s + 50s = 125s (lewat 5 detik dari target)
    const expiredRemaining = calcRemaining(serverTimerState.target_end_time);

    // Math.max(0, ...) memastikan tidak pernah return nilai negatif
    expect(expiredRemaining).toBe(0);
  });

  // --------------------------------------------------------------------------
  // USE CASE 4: Sirkuit 5 Stase Ganjil dengan 2 Stase Istirahat (3 Ujian + 2 Break)
  // --------------------------------------------------------------------------
  it("Use Case 4: Odd Circuit (5 Stations: 3 Exam + 2 Rest) accurately maps participants to Rest vs Active Exam", () => {
    // Skenario 5 Pos:
    // Pos 1: Stase Ujian (Kardio)
    // Pos 2: Stase Istirahat (is_break = true)
    // Pos 3: Stase Ujian (Respi)
    // Pos 4: Stase Istirahat (is_break = true)
    // Pos 5: Stase Ujian (Saraf)
    const stations = [
      { id: "st-1", station_number: 1, is_break: false, title: "Kardiologi" },
      { id: "st-2", station_number: 2, is_break: true, title: "Pos Istirahat 1" },
      { id: "st-3", station_number: 3, is_break: false, title: "Respirologi" },
      { id: "st-4", station_number: 4, is_break: true, title: "Pos Istirahat 2" },
      { id: "st-5", station_number: 5, is_break: false, title: "Neurologi" },
    ];

    const participants = [
      { id: "p1", name: "Peserta 1", starting_station: 1 },
      { id: "p2", name: "Peserta 2", starting_station: 2 },
      { id: "p3", name: "Peserta 3", starting_station: 3 },
      { id: "p4", name: "Peserta 4", starting_station: 4 },
      { id: "p5", name: "Peserta 5", starting_station: 5 },
    ];

    function getStationForParticipant(startingStation, roundNumber, totalStations = 5) {
      const currentStationNum = ((startingStation - 1 + (roundNumber - 1)) % totalStations) + 1;
      return stations.find((s) => s.station_number === currentStationNum);
    }

    // Uji Setiap Ronde 1 s/d 5:
    for (let round = 1; round <= 5; round++) {
      const activeExamCount = participants.filter(
        (p) => !getStationForParticipant(p.starting_station, round).is_break
      ).length;

      const restCount = participants.filter(
        (p) => getStationForParticipant(p.starting_station, round).is_break
      ).length;

      // Di setiap ronde, HARUS selalu tepat 3 peserta ujian aktif dan 2 peserta istirahat
      expect(activeExamCount).toBe(3);
      expect(restCount).toBe(2);
    }

    // Validasi Spesifik: Peserta 1 (Mulai dari Pos 1)
    // Ronde 1: Pos 1 (Ujian)
    expect(getStationForParticipant(1, 1).is_break).toBe(false);
    expect(getStationForParticipant(1, 1).title).toBe("Kardiologi");

    // Ronde 2: Pos 2 (Istirahat) -> Layar peserta masuk mode Instruksi Istirahat
    expect(getStationForParticipant(1, 2).is_break).toBe(true);
    expect(getStationForParticipant(1, 2).title).toBe("Pos Istirahat 1");

    // Ronde 3: Pos 3 (Ujian)
    expect(getStationForParticipant(1, 3).is_break).toBe(false);
    expect(getStationForParticipant(1, 3).title).toBe("Respirologi");

    // Ronde 4: Pos 4 (Istirahat)
    expect(getStationForParticipant(1, 4).is_break).toBe(true);

    // Ronde 5: Pos 5 (Ujian)
    expect(getStationForParticipant(1, 5).is_break).toBe(false);
    expect(getStationForParticipant(1, 5).title).toBe("Neurologi");
  });
});
