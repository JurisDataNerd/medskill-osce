import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  openWaitingRoom,
  startOsceSession,
  updateTimerPhase,
  setSessionCompletedWaiting,
  pauseTimer,
  resumeTimer,
  sendBroadcast,
  sendBellBroadcast,
  finishSession,
  calcRemaining,
} from "@/services/realtimeTimerService";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const supabaseUrl = "https://djigelqahkzfmwvpncvr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWdlbHFhaGt6Zm13dnBuY3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODY3MzUsImV4cCI6MjA3NTY2MjczNX0.YPdfVwwW4VbrZ8fkteErd_canO1NUWrT0DYJHE1N4DI";

describe("Realtime Live Wire E2E Test on Remote Supabase (Real Seconds Waiting)", { timeout: 60000 }, () => {
  let testSessionId = null;

  // 3 Distinct Supabase Clients Simulating 3 Separate Physical Browser Devices
  const adminClient = createClient(supabaseUrl, supabaseAnonKey);
  const participantClient = createClient(supabaseUrl, supabaseAnonKey);
  const examinerClient = createClient(supabaseUrl, supabaseAnonKey);

  let channelAdmin = null;
  let channelParticipant = null;
  let channelExaminer = null;

  const adminReceived = { timers: [], sessions: [], broadcasts: [] };
  const participantReceived = { timers: [], sessions: [], broadcasts: [] };
  const examinerReceived = { timers: [], sessions: [], broadcasts: [] };

  beforeAll(async () => {
    console.log("\n[LIVE E2E] Connecting to remote Supabase database: https://djigelqahkzfmwvpncvr.supabase.co");

    // 1. Create a real test session in Supabase PostgreSQL
    const { data: session, error } = await adminClient
      .schema("osce")
      .from("sessions")
      .insert({
        title: `[LIVE-WIRE-TEST] Realtime Seconds Wait ${Date.now()}`,
        status: "scheduled",
        session_date: new Date().toISOString().split("T")[0],
        start_time: "08:00:00",
        end_time: "10:00:00",
        total_stations: 1,
        total_rounds: 1,
        station_duration_minutes: 2,
        transition_duration_minutes: 1,
        break_duration_minutes: 0,
      })
      .select()
      .single();

    if (error) throw error;
    testSessionId = session.id;
    console.log(`[LIVE E2E] Created test session ID: ${testSessionId}`);

    const channelTopic = `osce-session:${testSessionId}`;

    // 2. Client 1 (Admin Browser Tab) WebSocket Subscription
    channelAdmin = adminClient.channel(channelTopic, { config: { broadcast: { self: true } } });
    channelAdmin
      .on("postgres_changes", { event: "*", schema: "osce", table: "sessions", filter: `id=eq.${testSessionId}` }, (p) => {
        console.log(`📡 [ADMIN CLIENT WS] Session Update -> Status: ${p.new?.status}`);
        adminReceived.sessions.push(p.new);
      })
      .on("postgres_changes", { event: "*", schema: "osce", table: "session_timer_state", filter: `session_id=eq.${testSessionId}` }, (p) => {
        console.log(`📡 [ADMIN CLIENT WS] Timer Update -> Phase: ${p.new?.phase}`);
        adminReceived.timers.push(p.new);
      })
      .on("broadcast", { event: "announcement" }, (p) => {
        console.log(`📡 [ADMIN CLIENT WS] Broadcast -> Message: ${p.payload?.message}`);
        adminReceived.broadcasts.push(p.payload);
      });
    await channelAdmin.subscribe();

    // 3. Client 2 (Participant Browser Tab) WebSocket Subscription
    channelParticipant = participantClient.channel(channelTopic);
    channelParticipant
      .on("postgres_changes", { event: "*", schema: "osce", table: "sessions", filter: `id=eq.${testSessionId}` }, (p) => {
        console.log(`👤 [PARTICIPANT CLIENT WS] Session Update -> Status: ${p.new?.status}`);
        participantReceived.sessions.push(p.new);
      })
      .on("postgres_changes", { event: "*", schema: "osce", table: "session_timer_state", filter: `session_id=eq.${testSessionId}` }, (p) => {
        console.log(`👤 [PARTICIPANT CLIENT WS] Timer Update -> Phase: ${p.new?.phase}`);
        participantReceived.timers.push(p.new);
      })
      .on("broadcast", { event: "announcement" }, (p) => {
        console.log(`👤 [PARTICIPANT CLIENT WS] Broadcast -> Message: ${p.payload?.message}`);
        participantReceived.broadcasts.push(p.payload);
      });
    await channelParticipant.subscribe();

    // 4. Client 3 (Examiner Browser Tab) WebSocket Subscription
    channelExaminer = examinerClient.channel(channelTopic);
    channelExaminer
      .on("postgres_changes", { event: "*", schema: "osce", table: "sessions", filter: `id=eq.${testSessionId}` }, (p) => {
        console.log(`🩺 [EXAMINER CLIENT WS] Session Update -> Status: ${p.new?.status}`);
        examinerReceived.sessions.push(p.new);
      })
      .on("postgres_changes", { event: "*", schema: "osce", table: "session_timer_state", filter: `session_id=eq.${testSessionId}` }, (p) => {
        console.log(`🩺 [EXAMINER CLIENT WS] Timer Update -> Phase: ${p.new?.phase}`);
        examinerReceived.timers.push(p.new);
      })
      .on("broadcast", { event: "announcement" }, (p) => {
        console.log(`🩺 [EXAMINER CLIENT WS] Broadcast -> Message: ${p.payload?.message}`);
        examinerReceived.broadcasts.push(p.payload);
      });
    await channelExaminer.subscribe();

    // Wait 3.0 seconds in real time for all 3 WebSocket connections to open & handshake
    console.log("[LIVE E2E] Waiting 3.0s for 3 physical WebSocket channels to establish handshake...");
    await sleep(3000);
  });

  afterAll(async () => {
    console.log("\n[LIVE E2E] Cleaning up WebSocket channels and remote test data...");
    if (channelAdmin) await adminClient.removeChannel(channelAdmin);
    if (channelParticipant) await participantClient.removeChannel(channelParticipant);
    if (channelExaminer) await examinerClient.removeChannel(channelExaminer);

    if (testSessionId) {
      await adminClient.schema("osce").from("broadcast_messages").delete().eq("session_id", testSessionId);
      await adminClient.schema("osce").from("session_timer_state").delete().eq("session_id", testSessionId);
      await adminClient.schema("osce").from("sessions").delete().eq("id", testSessionId);
      console.log("[LIVE E2E] Test session deleted cleanly from Supabase.");
    }
  });

  it("Full Live Real-Time Lifecycle: Testing Real Seconds Delays & Multi-Client WebSocket Arrival", async () => {
    // ------------------------------------------------------------------------
    // TAHAP 1: Open Waiting Room (Menunggu 2 Detik Nyata)
    // ------------------------------------------------------------------------
    console.log("\n▶️ [STEP 1] Admin membuka Ruang Tunggu (openWaitingRoom)...");
    await openWaitingRoom(testSessionId);

    console.log("⏳ Menunggu 3.5 detik untuk propagasi realtime CDC dari Supabase...");
    await sleep(3500);

    expect(adminReceived.sessions.some((s) => s.status === "waiting_room")).toBe(true);
    expect(participantReceived.sessions.some((s) => s.status === "waiting_room")).toBe(true);
    expect(examinerReceived.sessions.some((s) => s.status === "waiting_room")).toBe(true);

    // ------------------------------------------------------------------------
    // TAHAP 2: Start OSCE Session -> Initial Transition (Menunggu 3 Detik Nyata)
    // ------------------------------------------------------------------------
    console.log("\n▶️ [STEP 2] Admin menekan Start Live Ujian (1m Transisi Awal)...");
    await startOsceSession(testSessionId, 2, 1);

    console.log("⏳ Menunggu 3 detik nyata untuk memverifikasi countdown waktu transisi...");
    await sleep(3000);

    const latestParticipantTimer = participantReceived.timers[participantReceived.timers.length - 1];
    expect(latestParticipantTimer?.phase).toBe("initial_transition");

    const remTransit = calcRemaining(latestParticipantTimer.target_end_time);
    console.log(`⏱️ Sisa waktu persiapan pos stase 1 (setelah 3s berjalan): ${remTransit} detik`);
    expect(remTransit).toBeLessThanOrEqual(58);
    expect(remTransit).toBeGreaterThanOrEqual(48);

    // ------------------------------------------------------------------------
    // TAHAP 3: Masuk ke Fase Stase Ujian (Action 2 Menit) (Menunggu 3 Detik Nyata)
    // ------------------------------------------------------------------------
    console.log("\n▶️ [STEP 3] Masuk ke Fase Stase Ujian (Action)...");
    await updateTimerPhase(testSessionId, "action", 2, { roundNumber: 1 });

    console.log("⏳ Menunggu 3 detik nyata saat ujian berlangsung...");
    await sleep(3000);

    const latestExaminerTimer = examinerReceived.timers[examinerReceived.timers.length - 1];
    expect(latestExaminerTimer?.phase).toBe("action");

    const remAction = calcRemaining(latestExaminerTimer.target_end_time);
    console.log(`⏱️ Sisa waktu stase ujian (setelah 3s berjalan): ${remAction} detik`);
    expect(remAction).toBeLessThanOrEqual(118);
    expect(remAction).toBeGreaterThanOrEqual(113);

    // ------------------------------------------------------------------------
    // TAHAP 4: Admin Pause Timer (Menunggu 3 Detik Nyata saat Freeze)
    // ------------------------------------------------------------------------
    console.log("\n▶️ [STEP 4] Admin melakukan Pause Timer pada sisa 70 detik...");
    await pauseTimer(testSessionId, 70);

    console.log("⏳ Menunggu 3 detik nyata saat sesi di-pause...");
    await sleep(3000);

    const latestAdminTimer = adminReceived.timers[adminReceived.timers.length - 1];
    expect(latestAdminTimer?.phase).toBe("paused");
    expect(latestAdminTimer?.paused_remaining_ms).toBe(70000);

    // Verifikasi timer tetap freeze di 70 detik meskipun waktu nyata telah berlalu 3 detik
    const frozenRem = calcRemaining(null, latestAdminTimer.paused_remaining_ms, true);
    console.log(`⏱️ Sisa waktu saat di-pause (tetap freeze): ${frozenRem} detik`);
    expect(frozenRem).toBe(70);

    // ------------------------------------------------------------------------
    // TAHAP 5: Admin Resume Timer (Menunggu 2.5 Detik Nyata)
    // ------------------------------------------------------------------------
    console.log("\n▶️ [STEP 5] Admin melakukan Resume Timer...");
    await resumeTimer(testSessionId, 70);

    console.log("⏳ Menunggu 2.5 detik nyata saat timer mulai jalan kembali...");
    await sleep(2500);

    const resumedTimer = participantReceived.timers[participantReceived.timers.length - 1];
    expect(resumedTimer?.phase).toBe("action");
    const remAfterResume = calcRemaining(resumedTimer.target_end_time);
    console.log(`⏱️ Sisa waktu setelah di-resume (setelah 2.5s berjalan): ${remAfterResume} detik`);
    expect(remAfterResume).toBeLessThanOrEqual(69);
    expect(remAfterResume).toBeGreaterThanOrEqual(64);

    // ------------------------------------------------------------------------
    // TAHAP 6: Admin Mengirim Broadcast Pesan & Bel Realtime
    // ------------------------------------------------------------------------
    const liveMsg = `[LIVE NOTICE ${Date.now()}] Waktu stase tersisa 1 menit lagi!`;
    console.log(`\n▶️ [STEP 6] Admin mengirim broadcast pesan: "${liveMsg}"...`);
    await sendBroadcast(testSessionId, liveMsg, "urgent", "all");
    await sendBellBroadcast(testSessionId, "warning");

    console.log("⏳ Menunggu 2 detik untuk propagasi WebSocket broadcast...");
    await sleep(2000);

    // Verifikasi pesan diterima oleh peserta dan penguji
    expect(participantReceived.broadcasts.some((b) => b.message.includes("Waktu stase tersisa 1 menit"))).toBe(true);
    expect(examinerReceived.broadcasts.some((b) => b.message.includes("Waktu stase tersisa 1 menit"))).toBe(true);

    // ------------------------------------------------------------------------
    // TAHAP 7: Waktu Habis -> Selesai & Grace Period (setSessionCompletedWaiting)
    // ------------------------------------------------------------------------
    console.log("\n▶️ [STEP 7] Waktu habis -> Masuk ke completed_waiting (Grace Period Penguji)...");
    await setSessionCompletedWaiting(testSessionId, 1);

    console.log("⏳ Menunggu 2.5 detik untuk propagasi completed_waiting...");
    await sleep(2500);

    const finalParticipantTimer = participantReceived.timers[participantReceived.timers.length - 1];
    expect(finalParticipantTimer?.phase).toBe("completed_waiting");
    expect(calcRemaining(finalParticipantTimer.target_end_time, finalParticipantTimer.paused_remaining_ms, true)).toBe(0);

    // ------------------------------------------------------------------------
    // TAHAP 8: Akhiri Sesi OSCE (finishSession)
    // ------------------------------------------------------------------------
    console.log("\n▶️ [STEP 8] Admin mengakhiri sesi OSCE secara permanen (finishSession)...");
    await finishSession(testSessionId);

    console.log("⏳ Menunggu 2 detik untuk finalisasi status...");
    await sleep(2000);

    const finalAdminSession = adminReceived.sessions[adminReceived.sessions.length - 1];
    expect(finalAdminSession?.status).toBe("completed");
    console.log("🎉 [LIVE E2E SUCCESS] Seluruh alur realtime dengan jeda detik nyata berhasil 100%!");
  });
});
