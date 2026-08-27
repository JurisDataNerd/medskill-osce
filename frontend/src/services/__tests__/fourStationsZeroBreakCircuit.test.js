import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  openWaitingRoom,
  startOsceSession,
  updateTimerPhase,
  setSessionCompletedWaiting,
  finishSession,
  calcRemaining,
} from "@/services/realtimeTimerService";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const supabaseUrl = "https://djigelqahkzfmwvpncvr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWdlbHFhaGt6Zm13dnBuY3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODY3MzUsImV4cCI6MjA3NTY2MjczNX0.YPdfVwwW4VbrZ8fkteErd_canO1NUWrT0DYJHE1N4DI";

describe("4 Exam Stations Circuit Simulation (0 Rest Stations) - Mathematical & Live Supabase E2E", { timeout: 60000 }, () => {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  let testSessionId = null;
  const createdStationIds = [];

  // ==========================================================================
  // BAGIAN 1: PEMBUKTIAN MATEMATIS ROTASI SIRKUIT 4 STASE MURNI UJIAN (0 ISTIRAHAT)
  // ==========================================================================
  it("Math Verification: 4 Exam Stations, 4 Candidates, 4 Stationary Examiners across 4 Rounds", () => {
    const TOTAL_STATIONS = 4;
    const TOTAL_ROUNDS = 4;

    // 4 Stase Ujian (Semua is_break: false)
    const stations = [
      { id: "st-1", station_number: 1, title: "Stase 1: Kardiologi (ACS & EKG)", is_break: false },
      { id: "st-2", station_number: 2, title: "Stase 2: Respirologi (Asma Akut)", is_break: false },
      { id: "st-3", station_number: 3, title: "Stase 3: Gastroenterohepatologi (Dispepsia)", is_break: false },
      { id: "st-4", station_number: 4, title: "Stase 4: Neurologi (Stroke Iskemik)", is_break: false },
    ];

    // 4 Peserta dengan nomor awal 1 s/d 4
    const candidates = [
      { id: "cand-1", name: "Peserta 1 (dr. Ahmad)", starting_station: 1, stationHistory: [] },
      { id: "cand-2", name: "Peserta 2 (dr. Bella)", starting_station: 2, stationHistory: [] },
      { id: "cand-3", name: "Peserta 3 (dr. Citra)", starting_station: 3, stationHistory: [] },
      { id: "cand-4", name: "Peserta 4 (dr. Dion)", starting_station: 4, stationHistory: [] },
    ];

    // 4 Penguji yang bertugas tetap di posnya masing-masing
    const examiners = [
      { id: "ex-1", name: "dr. Sp.JP (Penguji Pos 1)", assigned_station: 1, evaluatedCandidates: [] },
      { id: "ex-2", name: "dr. Sp.P (Penguji Pos 2)", assigned_station: 2, evaluatedCandidates: [] },
      { id: "ex-3", name: "dr. Sp.PD (Penguji Pos 3)", assigned_station: 3, evaluatedCandidates: [] },
      { id: "ex-4", name: "dr. Sp.S (Penguji Pos 4)", assigned_station: 4, evaluatedCandidates: [] },
    ];

    // Formula pergerakan rotasi peserta
    function getCandidateStation(startingStation, roundNumber) {
      return ((startingStation - 1 + (roundNumber - 1)) % TOTAL_STATIONS) + 1;
    }

    // Jalankan Simulasi 4 Ronde Penuh
    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
      const activeExamCount = candidates.filter(
        (c) => !stations.find((s) => s.station_number === getCandidateStation(c.starting_station, round)).is_break
      ).length;

      const restCount = candidates.filter(
        (c) => stations.find((s) => s.station_number === getCandidateStation(c.starting_station, round)).is_break
      ).length;

      // 1. Validasi Beban Stase: HARUS selalu tepat 4 ujian aktif dan 0 istirahat
      expect(activeExamCount).toBe(4);
      expect(restCount).toBe(0);

      // 2. Collision Check: Tidak ada 2 peserta di stase yang sama pada ronde ini
      const occupiedStations = candidates.map((c) => getCandidateStation(c.starting_station, round));
      expect(new Set(occupiedStations).size).toBe(4);

      // Catat riwayat stase peserta & penugasan penguji
      candidates.forEach((cand) => {
        const stNum = getCandidateStation(cand.starting_station, round);
        cand.stationHistory.push(stNum);

        const examiner = examiners.find((e) => e.assigned_station === stNum);
        examiner.evaluatedCandidates.push(cand.name);
      });
    }

    // 3. Validasi Lengkap (Setiap peserta telah menyelesaikan SEMUA 4 stase tanpa duplikasi)
    candidates.forEach((cand) => {
      expect(cand.stationHistory).toHaveLength(4);
      expect(new Set(cand.stationHistory).size).toBe(4);
    });

    // 4. Validasi Penguji (Setiap penguji telah menguji SEMUA 4 peserta berbeda)
    examiners.forEach((ex) => {
      expect(ex.evaluatedCandidates).toHaveLength(4);
      expect(new Set(ex.evaluatedCandidates).size).toBe(4);
    });

    // Tabel Matriks Hasil Rotasi 4 Ronde
    console.log("\n📊 [MATRIKS ROTASI 4 STASE UJIAN (0 ISTIRAHAT)]");
    console.table([
      { Pos: "Pos 1 (Kardio)", Ronde1: "Peserta 1", Ronde2: "Peserta 4", Ronde3: "Peserta 3", Ronde4: "Peserta 2" },
      { Pos: "Pos 2 (Respi)", Ronde1: "Peserta 2", Ronde2: "Peserta 1", Ronde3: "Peserta 4", Ronde4: "Peserta 3" },
      { Pos: "Pos 3 (Gastro)", Ronde1: "Peserta 3", Ronde2: "Peserta 2", Ronde3: "Peserta 1", Ronde4: "Peserta 4" },
      { Pos: "Pos 4 (Neuro)", Ronde1: "Peserta 4", Ronde2: "Peserta 3", Ronde3: "Peserta 2", Ronde4: "Peserta 1" },
    ]);
  });

  // ==========================================================================
  // BAGIAN 2: PENGUJIAN LIVE LANGSUNG KE SUPABASE DATABASE (4 STASE REALTIME)
  // ==========================================================================
  beforeAll(async () => {
    console.log("\n[4-STATION LIVE TEST] Setting up 4 Exam Stations on Supabase PostgreSQL...");

    // 1. Insert master sesi 4 stase
    const { data: session, error: sessErr } = await supabase
      .schema("osce")
      .from("sessions")
      .insert({
        title: `[TEST 4-STATIONS NO-BREAK] Sirkuit 4 Stase Ujian ${Date.now()}`,
        status: "scheduled",
        session_date: new Date().toISOString().split("T")[0],
        start_time: "08:00:00",
        end_time: "10:00:00",
        total_stations: 4,
        total_rounds: 4,
        station_duration_minutes: 2,
        transition_duration_minutes: 1,
        break_duration_minutes: 0,
      })
      .select()
      .single();

    if (sessErr) throw sessErr;
    testSessionId = session.id;

    // 2. Insert 4 Pos Stase Ujian (Semua is_break: false)
    const stationsPayload = [
      { session_id: testSessionId, station_number: 1, title: "Stase 1: Kardiologi", is_break: false },
      { session_id: testSessionId, station_number: 2, title: "Stase 2: Respirologi", is_break: false },
      { session_id: testSessionId, station_number: 3, title: "Stase 3: Gastroenterohepatologi", is_break: false },
      { session_id: testSessionId, station_number: 4, title: "Stase 4: Neurologi", is_break: false },
    ];

    const { data: insertedStations, error: stErr } = await supabase
      .schema("osce")
      .from("stations")
      .insert(stationsPayload)
      .select();

    if (stErr) throw stErr;
    insertedStations.forEach((s) => createdStationIds.push(s.id));
    console.log(`[4-STATION LIVE TEST] Created session ${testSessionId} with 4 stations.`);
  });

  afterAll(async () => {
    if (testSessionId) {
      console.log("[4-STATION LIVE TEST] Cleaning up 4 stations and test session from Supabase...");
      await supabase.schema("osce").from("stations").delete().eq("session_id", testSessionId);
      await supabase.schema("osce").from("session_timer_state").delete().eq("session_id", testSessionId);
      await supabase.schema("osce").from("sessions").delete().eq("id", testSessionId);
      console.log("[4-STATION LIVE TEST] Cleanup complete.");
    }
  });

  it("Live Supabase E2E: Runs full 4-Round lifecycle with accurate Total Global Timer sync", async () => {
    // Formula Total Global Timer Sesi di Admin Dashboard:
    function calcTotalRemaining(timerState, remSec, totalRounds = 4, stationMin = 2, transMin = 1) {
      const stationSec = stationMin * 60;
      const transSec = transMin * 60;
      const currentPhase = timerState?.phase;
      const currentRound = timerState?.round_number || 1;

      if (currentPhase === "completed_waiting" || currentPhase === "finished") return 0;
      if (currentPhase === "initial_transition") {
        const futureRoundsCount = Math.max(0, totalRounds - 1);
        return remSec + stationSec + futureRoundsCount * (stationSec + transSec);
      }
      if (currentPhase === "action" || currentPhase === "running") {
        const futureRoundsCount = Math.max(0, totalRounds - currentRound);
        return remSec + futureRoundsCount * (stationSec + transSec);
      }
      if (currentPhase === "transition") {
        const nextRound = currentRound + 1;
        const futureRoundsCount = Math.max(0, totalRounds - nextRound);
        return remSec + stationSec + futureRoundsCount * (stationSec + transSec);
      }
      return (totalRounds * stationSec) + (totalRounds * transSec);
    }

    // 1. Open Waiting Room
    console.log("\n▶️ [STEP 1] Open Waiting Room untuk sesi 4 stase...");
    const waitingRes = await openWaitingRoom(testSessionId);
    expect(waitingRes.status).toBe("waiting_room");

    // 2. Start Live OSCE (Initial Transition 1m)
    console.log("▶️ [STEP 2] Start Live OSCE (Persiapan Stase 1 selama 1 menit)...");
    const startRes = await startOsceSession(testSessionId, 2, 1);
    expect(startRes.timer.phase).toBe("initial_transition");
    expect(startRes.timer.round_number).toBe(1);

    let subRem = calcRemaining(startRes.timer.target_end_time);
    let totalRem = calcTotalRemaining(startRes.timer, subRem, 4, 2, 1);
    // Total Timer: 1m transisi awal + 4x (2m action) + 3x (1m transisi) = 1m + 8m + 3m = 12m = 720 detik (12:00)
    console.log(`⏱️ Sub-Timer: ${subRem}s | Total Global Timer: ${totalRem}s (${Math.ceil(totalRem / 60)} Mnt)`);
    expect(totalRem).toBeGreaterThanOrEqual(717);
    expect(totalRem).toBeLessThanOrEqual(720);

    // 3. Ronde 1: Action (2 Menit)
    console.log("▶️ [STEP 3] Ronde 1 Action (2 Menit)...");
    const r1 = await updateTimerPhase(testSessionId, "action", 2, { roundNumber: 1 });
    expect(r1.phase).toBe("action");
    expect(r1.round_number).toBe(1);
    subRem = calcRemaining(r1.target_end_time);
    totalRem = calcTotalRemaining(r1, subRem, 4, 2, 1);
    // Total Timer saat Ronde 1 mulai: 2m + 3x(3m) = 11m = 660 detik
    expect(totalRem).toBeGreaterThanOrEqual(657);
    expect(totalRem).toBeLessThanOrEqual(660);

    // 4. Transisi 1 -> 2 (1 Menit)
    console.log("▶️ [STEP 4] Transisi Ronde 1 -> 2 (1 Menit)...");
    const t1 = await updateTimerPhase(testSessionId, "transition", 1, { roundNumber: 1 });
    expect(t1.phase).toBe("transition");
    subRem = calcRemaining(t1.target_end_time);
    totalRem = calcTotalRemaining(t1, subRem, 4, 2, 1);
    // Total: 1m (transisi) + 2m (R2) + 2x(3m R3-R4) = 9m = 540 detik
    expect(totalRem).toBeGreaterThanOrEqual(537);
    expect(totalRem).toBeLessThanOrEqual(540);

    // 5. Ronde 2: Action (2 Menit)
    console.log("▶️ [STEP 5] Ronde 2 Action (2 Menit)...");
    const r2 = await updateTimerPhase(testSessionId, "action", 2, { roundNumber: 2 });
    subRem = calcRemaining(r2.target_end_time);
    totalRem = calcTotalRemaining(r2, subRem, 4, 2, 1);
    expect(totalRem).toBeGreaterThanOrEqual(470);
    expect(totalRem).toBeLessThanOrEqual(480); // 8 Menit

    // 6. Transisi 2 -> 3 (1 Menit)
    console.log("▶️ [STEP 6] Transisi Ronde 2 -> 3 (1 Menit)...");
    const t2 = await updateTimerPhase(testSessionId, "transition", 1, { roundNumber: 2 });
    subRem = calcRemaining(t2.target_end_time);
    totalRem = calcTotalRemaining(t2, subRem, 4, 2, 1);
    expect(totalRem).toBeGreaterThanOrEqual(350);
    expect(totalRem).toBeLessThanOrEqual(360); // 6 Menit

    // 7. Ronde 3: Action (2 Menit)
    console.log("▶️ [STEP 7] Ronde 3 Action (2 Menit)...");
    const r3 = await updateTimerPhase(testSessionId, "action", 2, { roundNumber: 3 });
    subRem = calcRemaining(r3.target_end_time);
    totalRem = calcTotalRemaining(r3, subRem, 4, 2, 1);
    expect(totalRem).toBeGreaterThanOrEqual(290);
    expect(totalRem).toBeLessThanOrEqual(300); // 5 Menit

    // 8. Transisi 3 -> 4 (1 Menit)
    console.log("▶️ [STEP 8] Transisi Ronde 3 -> 4 (1 Menit)...");
    const t3 = await updateTimerPhase(testSessionId, "transition", 1, { roundNumber: 3 });
    subRem = calcRemaining(t3.target_end_time);
    totalRem = calcTotalRemaining(t3, subRem, 4, 2, 1);
    expect(totalRem).toBeGreaterThanOrEqual(170);
    expect(totalRem).toBeLessThanOrEqual(180); // 3 Menit

    // 9. Ronde 4 (Ronde Terakhir): Action (2 Menit)
    console.log("▶️ [STEP 9] Ronde 4 (Terakhir) Action (2 Menit)...");
    const r4 = await updateTimerPhase(testSessionId, "action", 2, { roundNumber: 4 });
    subRem = calcRemaining(r4.target_end_time);
    totalRem = calcTotalRemaining(r4, subRem, 4, 2, 1);
    // Saat ronde terakhir berjalan: Sub-timer 2m === Total Timer 2m (120s)! Sinkron 1:1!
    expect(totalRem).toBeGreaterThanOrEqual(110);
    expect(totalRem).toBeLessThanOrEqual(120);
    expect(totalRem).toBe(subRem);

    // 10. Ronde 4 Selesai -> Completed Waiting (Grace Period Penguji)
    console.log("▶️ [STEP 10] Ronde 4 Selesai -> Masuk ke completed_waiting (00:00)...");
    const compWait = await setSessionCompletedWaiting(testSessionId, 4);
    expect(compWait.phase).toBe("completed_waiting");
    expect(compWait.round_number).toBe(4);
    totalRem = calcTotalRemaining(compWait, 0, 4, 2, 1);
    expect(totalRem).toBe(0);

    // 11. Finalize Session (finishSession)
    console.log("▶️ [STEP 11] Finish OSCE Session...");
    await finishSession(testSessionId);

    const { data: finalSession } = await supabase
      .schema("osce")
      .from("sessions")
      .select("status, finished_at")
      .eq("id", testSessionId)
      .single();

    expect(finalSession.status).toBe("completed");
    expect(finalSession.finished_at).not.toBeNull();
    console.log("🎉 [4-STATION LIVE TEST SUCCESS] Seluruh siklus 4 stase ujian berhasil 100%!");
  });
});
