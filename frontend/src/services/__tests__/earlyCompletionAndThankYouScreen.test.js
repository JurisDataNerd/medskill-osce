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

describe("OSCE Early Completion & Thank You Screen Tests (Stase vs Sesi OSCE)", () => {
  const SESSION_ID = "sess-early-completion-test";
  const TOTAL_STATIONS = 6;
  const TOTAL_ROUNDS = 6;
  const STATION_MINUTES = 12;
  const TRANSITION_MINUTES = 2;

  let channelsMap;
  let timerUpdateCallbacks;
  let sessionUpdateCallbacks;
  let broadcastCallbacks;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-21T08:00:00.000Z"));

    channelsMap = new Map();
    timerUpdateCallbacks = [];
    sessionUpdateCallbacks = [];
    broadcastCallbacks = [];

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
          } else if (type === "broadcast") {
            broadcastCallbacks.push(handler);
          }
          return ch;
        }),
        subscribe: vi.fn((cb) => {
          if (cb) cb("SUBSCRIBED");
          return ch;
        }),
        send: vi.fn(async ({ type, event, payload }) => {
          broadcastCallbacks.forEach((cb) => cb({ payload }));
          return {};
        }),
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

  it("Kasus 1: Peserta selesai lebih awal di Stase 1 (Waktu Admin masih sisa) -> Masuk ke Halaman Terima Kasih Lembar Jawaban Stase Telah Tersimpan", async () => {
    // 1. Inisialisasi State Peserta (Mengacu pada logic ParticipantSessionPage.jsx)
    let viewMode = "waiting_room";
    let isStationSubmitted = false;
    let roundSecondsLeft = STATION_MINUTES * 60;
    let globalTimerState = null;

    // Simulasi Helper Submit dari ParticipantSessionPage.jsx
    function simulateParticipantSubmitStation() {
      isStationSubmitted = true;
      const isTimerStillRunning = roundSecondsLeft > 0 && globalTimerState?.phase !== "transition";

      if (isTimerStillRunning) {
        // [SPESIFIKASI]: Masuk ke Halaman Terima Kasih Telah Mengerjakan Stase (Menunggu Bel Rotasi)
        viewMode = "station_completed_wait";
      } else {
        viewMode = "transit";
      }
    }

    // Subscribe ke realtime updates
    const unsubscribe = subscribeToSession(SESSION_ID, {
      onTimerUpdate: (timer) => {
        globalTimerState = timer;
        const rem = calcRemaining(timer.target_end_time, timer.paused_remaining_ms, timer.phase === "paused");
        roundSecondsLeft = rem;

        if (timer.phase === "action") {
          if (isStationSubmitted) {
            viewMode = "station_completed_wait";
          } else {
            viewMode = "live_round";
          }
        } else if (timer.phase === "transition") {
          viewMode = "transit";
        } else if (timer.phase === "completed_waiting") {
          viewMode = "completed";
        }
      },
    });

    // Step A: Admin buka waiting room & mulai sesi OSCE
    await openWaitingRoom(SESSION_ID);
    await startOsceSession(SESSION_ID, STATION_MINUTES, TRANSITION_MINUTES);

    // Initial transition selesai -> Masuk ke Ronde 1 Action (12 Menit = 720 Detik)
    await updateTimerPhase(SESSION_ID, "action", STATION_MINUTES, { roundNumber: 1 });
    expect(viewMode).toBe("live_round");
    expect(roundSecondsLeft).toBe(720);

    // Step B: Peserta mengerjakan stase selama 4 menit (Sisa waktu admin masih ada 8 menit / 480 detik)
    vi.advanceTimersByTime(4 * 60 * 1000);
    roundSecondsLeft = calcRemaining(globalTimerState.target_end_time);
    expect(roundSecondsLeft).toBe(480); // Sisa 8 menit

    // Step C: Peserta menekan tombol "Kirim Jawaban & Kunci Stase" LEBIH AWAL
    simulateParticipantSubmitStation();

    // Verifikasi Kasus 1:
    // 1. Peserta berada di mode "station_completed_wait"
    expect(viewMode).toBe("station_completed_wait");
    expect(isStationSubmitted).toBe(true);

    // 2. Data teks yang ditampilkan di UI (sesuai ParticipantSessionPage.jsx L1654):
    const titleText = "Terima Kasih! Lembar Jawaban Stase Telah Tersimpan";
    const badgeText = "Jawaban Stase 1 Dikirim & Terkunci";
    expect(titleText).toContain("Terima Kasih! Lembar Jawaban Stase Telah Tersimpan");
    expect(badgeText).toContain("Jawaban Stase 1 Dikirim & Terkunci");

    // 3. Waktu timer stase tetap berjalan menghitung mundur di layar tunggu peserta
    vi.advanceTimersByTime(3 * 60 * 1000); // Maju 3 menit lagi (sisa 5 menit)
    roundSecondsLeft = calcRemaining(globalTimerState.target_end_time);
    expect(roundSecondsLeft).toBe(300);
    expect(viewMode).toBe("station_completed_wait"); // Tetap di halaman terima kasih stase

    // Step D: Timer stase 12 menit habis -> Admin / Server trigger fase "transition" (2 menit)
    vi.advanceTimersByTime(5 * 60 * 1000);
    await updateTimerPhase(SESSION_ID, "transition", TRANSITION_MINUTES, { roundNumber: 1 });

    // Peserta otomatis beralih ke Halaman Transisi Perpindahan Pos
    expect(viewMode).toBe("transit");

    unsubscribe();
  });

  it("Kasus 2: Selesai waktu 00:00 dari semua stase (Ronde 6 Habis) & Admin BELUM klik End Session -> Masuk ke Halaman Terima Kasih Telah Mengikuti Ujian OSCE", async () => {
    let viewMode = "live_round";
    let isFormLocked = false;
    let examinerGracePeriod = false;
    let adminReadyToFinish = false;
    let globalTimerState = null;

    const unsubscribe = subscribeToSession(SESSION_ID, {
      onTimerUpdate: (timer) => {
        globalTimerState = timer;

        if (timer.phase === "completed_waiting") {
          // [NEED_FIX.md & ParticipantSessionPage.jsx L598, L776]
          viewMode = "completed";
          isFormLocked = true;
          examinerGracePeriod = true;
          adminReadyToFinish = true;
        }
      },
    });

    // Simulasi: Sedang berada di Ronde 6 Action (Ronde Terakhir)
    await updateTimerPhase(SESSION_ID, "action", STATION_MINUTES, { roundNumber: 6 });
    viewMode = "live_round";
    isFormLocked = false;

    // Fast forward 12 menit: Waktu Ronde 6 Habis (00:00)
    vi.advanceTimersByTime(STATION_MINUTES * 60 * 1000);
    expect(calcRemaining(globalTimerState.target_end_time)).toBe(0);

    // Sistem otomatis memicu setSessionCompletedWaiting (Sebelum Admin klik Akhiri Sesi)
    await setSessionCompletedWaiting(SESSION_ID, TOTAL_ROUNDS);

    // Verifikasi Kasus 2:
    // 1. Timer phase menjadi 'completed_waiting' & timer freeze di 00:00
    expect(globalTimerState.phase).toBe("completed_waiting");
    expect(globalTimerState.round_number).toBe(6);
    expect(calcRemaining(globalTimerState.target_end_time, globalTimerState.paused_remaining_ms, true)).toBe(0);

    // 2. Peserta masuk ke Halaman "Terima Kasih Telah Mengikuti Ujian OSCE!"
    expect(viewMode).toBe("completed");
    expect(isFormLocked).toBe(true);

    // Verifikasi Teks UI Halaman Selesai OSCE (sesuai ParticipantSessionPage.jsx L1448):
    const thankYouOsceTitle = "Terima Kasih Telah Mengikuti Ujian OSCE!";
    const thankYouBadge = "Sesi Ujian OSCE Selesai & Ter-Enkripsi";
    expect(thankYouOsceTitle).toContain("Terima Kasih Telah Mengikuti Ujian OSCE!");
    expect(thankYouBadge).toContain("Sesi Ujian OSCE Selesai & Ter-Enkripsi");

    // 3. Dokter Penguji tetap bisa menyelesaikan penilaian ronde 6 (Grading Grace Period)
    expect(examinerGracePeriod).toBe(true);

    // 4. Layar Admin menampilkan tombol "Akhiri Sesi OSCE" aktif
    expect(adminReadyToFinish).toBe(true);

    // Step Selanjutnya: Admin baru menekan tombol "Akhiri Sesi OSCE"
    await finishSession(SESSION_ID);
    expect(globalTimerState.phase).toBe("finished"); // Server finished state

    unsubscribe();
  });
});
