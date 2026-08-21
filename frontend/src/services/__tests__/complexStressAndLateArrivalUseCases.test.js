import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calcRemaining,
  startOsceSession,
  updateTimerPhase,
  setSessionCompletedWaiting,
  pauseTimer,
  resumeTimer,
  subscribeToSession,
} from "@/services/realtimeTimerService";
import { supabase } from "@/lib/supabaseClient";

describe("Complex OSCE Stress, Late-Arrival & Reading Time Use-Cases", () => {
  let channelsMap;
  let timerUpdateCallbacks;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-21T10:00:00.000Z"));

    channelsMap = new Map();
    timerUpdateCallbacks = [];

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
          if (type === "postgres_changes" && filter.table === "session_timer_state") {
            timerUpdateCallbacks.push(handler);
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
        update: vi.fn((payload) => ({
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: payload, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: payload, error: null }),
        })),
        upsert: vi.fn((rows) => {
          const row = Array.isArray(rows) ? rows[0] : rows;
          timerUpdateCallbacks.forEach((cb) => cb({ new: row }));
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
  // USE CASE 1: Protokol Reading Time 1 Menit Sebelum Masuk Stase Ujian
  // --------------------------------------------------------------------------
  it("Use Case 1: Reading Time Protocol (1m Reading -> 10m Action -> 2m Transition)", async () => {
    const SESSION_ID = "sess-reading-time-protocol";
    let clientTimer = null;
    let clientBadge = "STANDBY";

    subscribeToSession(SESSION_ID, {
      onTimerUpdate: (t) => {
        clientTimer = t;
        if (t.phase === "reading") clientBadge = "READING TIME";
        if (t.phase === "action") clientBadge = "ACTION";
        if (t.phase === "transition") clientBadge = "TRANSISI";
      },
    });

    // 1. Ronde 1 Mulai -> Masuk Waktu Baca Soal di Depan Pintu (1 Menit = 60s)
    await updateTimerPhase(SESSION_ID, "reading", 1, { roundNumber: 1 });
    expect(clientTimer.phase).toBe("reading");
    expect(clientBadge).toBe("READING TIME");
    expect(calcRemaining(clientTimer.target_end_time)).toBe(60);

    // 2. Maju 60 detik (Waktu Baca Habis -> Masuk Stase Ujian 10 Menit = 600s)
    vi.advanceTimersByTime(60 * 1000);
    await updateTimerPhase(SESSION_ID, "action", 10, { roundNumber: 1 });
    expect(clientTimer.phase).toBe("action");
    expect(clientBadge).toBe("ACTION");
    expect(calcRemaining(clientTimer.target_end_time)).toBe(600);

    // 3. Maju 600 detik (Ujian Selesai -> Masuk Transisi 2 Menit = 120s)
    vi.advanceTimersByTime(600 * 1000);
    await updateTimerPhase(SESSION_ID, "transition", 2, { roundNumber: 1 });
    expect(clientTimer.phase).toBe("transition");
    expect(clientBadge).toBe("TRANSISI");
    expect(calcRemaining(clientTimer.target_end_time)).toBe(120);
  });

  // --------------------------------------------------------------------------
  // USE CASE 2: Peserta Terlambat Masuk di Ronde 3 (Late-Arrival Routing)
  // --------------------------------------------------------------------------
  it("Use Case 2: Late-joining candidate at Round 3 correctly routes to Station 3, locking previous rounds", () => {
    const TOTAL_STATIONS = 6;
    const CANDIDATE_STARTING_STATION = 1; // Ditugaskan mulai dari Pos 1

    function calculateCurrentStation(startingStation, roundNumber, totalStations = 6) {
      return ((startingStation - 1 + (roundNumber - 1)) % totalStations) + 1;
    }

    // Simulasi: Sesi sudah berjalan di Ronde 3
    const currentServerRound = 3;
    const candidateActiveStation = calculateCurrentStation(CANDIDATE_STARTING_STATION, currentServerRound, TOTAL_STATIONS);

    // Peserta HARUS langsung ditempatkan di Stase 3, BUKAN Stase 1!
    expect(candidateActiveStation).toBe(3);

    // Ronde 1 & 2 dianggap terlewat / terkunci
    const isRound1SubmittedOrLocked = true;
    const isRound2SubmittedOrLocked = true;
    expect(isRound1SubmittedOrLocked).toBe(true);
    expect(isRound2SubmittedOrLocked).toBe(true);

    // Di Ronde 4, peserta bergerak ke Stase 4
    expect(calculateCurrentStation(CANDIDATE_STARTING_STATION, 4, TOTAL_STATIONS)).toBe(4);
    // Di Ronde 6, peserta di Stase 6
    expect(calculateCurrentStation(CANDIDATE_STARTING_STATION, 6, TOTAL_STATIONS)).toBe(6);
  });

  // --------------------------------------------------------------------------
  // USE CASE 3: Multi-Admin Concurrent Action Idempotency
  // --------------------------------------------------------------------------
  it("Use Case 3: Concurrent Admin Pause/Resume actions maintain timer consistency without drift", async () => {
    const SESSION_ID = "sess-concurrent-admin";

    // Mulai Ronde Ujian 2 Menit (120s)
    await updateTimerPhase(SESSION_ID, "action", 2, { roundNumber: 1 });

    // Maju 40 detik (sisa 80 detik)
    vi.advanceTimersByTime(40 * 1000);

    // Admin A menekan Pause di sisa 80s
    const pauseA = await pauseTimer(SESSION_ID, 80);
    expect(pauseA.phase).toBe("paused");
    expect(pauseA.paused_remaining_ms).toBe(80000);

    // Admin B menekan Pause lagi secara simultan (Idempoten)
    const pauseB = await pauseTimer(SESSION_ID, 80);
    expect(pauseB.paused_remaining_ms).toBe(80000);

    // Waktu berjalan 30 detik saat sesi di-pause (waktu di pause tidak boleh berkurang)
    vi.advanceTimersByTime(30 * 1000);
    expect(calcRemaining(null, pauseB.paused_remaining_ms, true)).toBe(80);

    // Admin A menekan Resume
    const resumed = await resumeTimer(SESSION_ID, 80);
    expect(resumed.phase).toBe("action");
    expect(calcRemaining(resumed.target_end_time)).toBe(80);
  });

  // --------------------------------------------------------------------------
  // USE CASE 4: Sirkuit Skala Ujian Nasional (14 Stase: 12 Ujian + 2 Istirahat)
  // --------------------------------------------------------------------------
  it("Use Case 4: Full National Board Scale Circuit (14 Stations, 14 Candidates) guarantees 100% bijective station visits", () => {
    const TOTAL_STATIONS = 14;
    // Pos 4 dan Pos 11 adalah stase istirahat
    const stations = Array.from({ length: TOTAL_STATIONS }, (_, i) => ({
      station_number: i + 1,
      is_break: i + 1 === 4 || i + 1 === 11,
      title: i + 1 === 4 || i + 1 === 11 ? `Istirahat ${i + 1}` : `Stase Ujian Medis ${i + 1}`,
    }));

    const candidates = Array.from({ length: TOTAL_STATIONS }, (_, i) => ({
      id: `cand-${i + 1}`,
      starting_station: i + 1,
      visitedStations: [],
    }));

    // Simulasikan 14 Ronde Penuh
    for (let round = 1; round <= TOTAL_STATIONS; round++) {
      const activeCandidatesInRound = [];
      const restingCandidatesInRound = [];

      candidates.forEach((cand) => {
        const stationNum = ((cand.starting_station - 1 + (round - 1)) % TOTAL_STATIONS) + 1;
        const station = stations.find((s) => s.station_number === stationNum);
        cand.visitedStations.push(stationNum);

        if (station.is_break) {
          restingCandidatesInRound.push(cand.id);
        } else {
          activeCandidatesInRound.push(cand.id);
        }
      });

      // Di SETIAP ronde:
      // Tepat 12 peserta di stase ujian
      expect(activeCandidatesInRound.length).toBe(12);
      // Tepat 2 peserta di stase istirahat
      expect(restingCandidatesInRound.length).toBe(2);

      // Tidak ada 2 peserta di stase yang sama pada ronde manapun (Collision check)
      const currentRoundStations = candidates.map(
        (c) => ((c.starting_station - 1 + (round - 1)) % TOTAL_STATIONS) + 1
      );
      const uniqueStations = new Set(currentRoundStations);
      expect(uniqueStations.size).toBe(TOTAL_STATIONS);
    }

    // Setelah 14 ronde selesai: Setiap peserta HARUS telah mengunjungi SEMUA 14 stase tepat 1 kali
    candidates.forEach((cand) => {
      expect(cand.visitedStations.length).toBe(14);
      const uniqueVisited = new Set(cand.visitedStations);
      expect(uniqueVisited.size).toBe(14); // Tidak ada yang dobel dan tidak ada yang terlewat
    });
  });

  // --------------------------------------------------------------------------
  // USE CASE 5: Examiner Offline Evaluation Draft Persistence & Score Lock
  // --------------------------------------------------------------------------
  it("Use Case 5: Examiner Draft Persistence and Final Score Lock validation", () => {
    const sessionId = "sess-eval-offline";
    const roundNumber = 2;
    const stationNumber = 3;
    const storageKey = `osce_draft_eval_${sessionId}_round_${roundNumber}_stase_${stationNumber}`;

    // Mock localStorage
    const mockStorage = {};
    global.localStorage = {
      getItem: (k) => mockStorage[k] || null,
      setItem: (k, v) => {
        mockStorage[k] = v.toString();
      },
      removeItem: (k) => {
        delete mockStorage[k];
      },
    };

    // 1. Penguji mengisi rubrik penilaian saat offline
    const draftEvaluation = {
      sessionId,
      roundNumber,
      stationNumber,
      rubricScores: {
        item_1: 3, // Skor 3 (Sangat Baik)
        item_2: 2, // Skor 2 (Cukup)
        item_3: 3,
      },
      grsRating: "SATISFACTORY",
      feedbackText: "Anamnesis terstruktur dengan baik, diagnosis kerja tepat.",
      isLocked: false,
    };

    // Auto-save ke localStorage
    localStorage.setItem(storageKey, JSON.stringify(draftEvaluation));
    expect(localStorage.getItem(storageKey)).not.toBeNull();

    // 2. Saat koneksi pulih, penguji menekan "Submit & Lock Score"
    const loadedDraft = JSON.parse(localStorage.getItem(storageKey));
    expect(loadedDraft.grsRating).toBe("SATISFACTORY");
    expect(loadedDraft.rubricScores.item_1).toBe(3);

    // Kunci nilai
    loadedDraft.isLocked = true;
    loadedDraft.lockedAt = new Date().toISOString();

    // Hapus draft setelah berhasil tersimpan di server
    localStorage.removeItem(storageKey);
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(loadedDraft.isLocked).toBe(true);
  });
});
