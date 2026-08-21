import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabase } from "@/lib/supabaseClient";
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
  subscribeToSession,
} from "@/services/realtimeTimerService";
import { getSessionTimerState, getLiveStations } from "@/services/live.service";

describe("Live Supabase E2E Integration & System Function Tests (No Mock)", { timeout: 30000 }, () => {
  let testSessionId = null;
  let unsubscribeLive = null;
  const receivedTimerEvents = [];
  const receivedSessionEvents = [];
  const receivedBroadcastEvents = [];

  beforeAll(async () => {
    // 1. Verify direct connectivity to live Supabase DB
    const { data: existingSessions, error: connError } = await supabase
      .schema("osce")
      .from("sessions")
      .select("id, title, status")
      .limit(3);

    expect(connError).toBeNull();
    expect(Array.isArray(existingSessions)).toBe(true);

    // 2. Create a clean live test session in Supabase osce.sessions
    const { data: createdSession, error: createError } = await supabase
      .schema("osce")
      .from("sessions")
      .insert({
        title: `[TEST-AUTOMATION] Live Integration Test ${Date.now()}`,
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

    expect(createError).toBeNull();
    expect(createdSession?.id).toBeDefined();
    testSessionId = createdSession.id;

    // 3. Connect Live Supabase Realtime Channel via WebSocket
    unsubscribeLive = subscribeToSession(testSessionId, {
      onTimerUpdate: (timer) => {
        if (timer) receivedTimerEvents.push(timer);
      },
      onSessionUpdate: (sess) => {
        if (sess) receivedSessionEvents.push(sess);
      },
      onBroadcast: (bcast) => {
        if (bcast) receivedBroadcastEvents.push(bcast);
      },
    });

    // Allow 1.5s for WebSocket handshake
    await new Promise((r) => setTimeout(r, 1500));
  });

  afterAll(async () => {
    if (unsubscribeLive) unsubscribeLive();

    if (testSessionId) {
      // Clean up test data from live Supabase tables
      await supabase.schema("osce").from("broadcast_messages").delete().eq("session_id", testSessionId);
      await supabase.schema("osce").from("session_timer_state").delete().eq("session_id", testSessionId);
      await supabase.schema("osce").from("stations").delete().eq("session_id", testSessionId);
      await supabase.schema("osce").from("sessions").delete().eq("id", testSessionId);
    }
  });

  it("Step 1: openWaitingRoom -> Update sessions.status to 'waiting_room' & session_timer_state to 'standby'", async () => {
    const res = await openWaitingRoom(testSessionId);
    expect(res.status).toBe("waiting_room");

    // Direct DB query verification
    const { data: sessionInDb } = await supabase
      .schema("osce")
      .from("sessions")
      .select("status")
      .eq("id", testSessionId)
      .single();
    expect(sessionInDb.status).toBe("waiting_room");

    const timerInDb = await getSessionTimerState(testSessionId);
    expect(timerInDb.phase).toBe("standby");
    expect(timerInDb.target_end_time).toBeNull();
  });

  it("Step 2: startOsceSession -> Starts with initial_transition (1m) & sets sessions.status to 'ongoing'", async () => {
    const res = await startOsceSession(testSessionId, 2, 1);
    expect(res.session.status).toBe("ongoing");
    expect(res.timer.phase).toBe("initial_transition");
    expect(res.timer.round_number).toBe(1);

    // Direct DB query verification
    const timerInDb = await getSessionTimerState(testSessionId);
    expect(timerInDb.phase).toBe("initial_transition");
    expect(timerInDb.target_end_time).toBeDefined();

    // Verify calculated remaining time is approximately 60 seconds (1 minute initial transition)
    const rem = calcRemaining(timerInDb.target_end_time);
    expect(rem).toBeGreaterThanOrEqual(55);
    expect(rem).toBeLessThanOrEqual(60);
  });

  it("Step 3: updateTimerPhase -> Transitions from initial_transition to 'action' (Stase Ujian 2m)", async () => {
    const timer = await updateTimerPhase(testSessionId, "action", 2, { roundNumber: 1 });
    expect(timer.phase).toBe("action");
    expect(timer.round_number).toBe(1);

    // Direct DB query verification
    const timerInDb = await getSessionTimerState(testSessionId);
    expect(timerInDb.phase).toBe("action");

    const rem = calcRemaining(timerInDb.target_end_time);
    expect(rem).toBeGreaterThanOrEqual(115);
    expect(rem).toBeLessThanOrEqual(120);
  });

  it("Step 4: pauseTimer & resumeTimer -> Freezes timer in Supabase & resumes accurately", async () => {
    // 1. Pause timer at 45 seconds remaining
    const paused = await pauseTimer(testSessionId, 45);
    expect(paused.phase).toBe("paused");
    expect(paused.paused_remaining_ms).toBe(45000);
    expect(paused.target_end_time).toBeNull();

    const { data: sessPaused } = await supabase
      .schema("osce")
      .from("sessions")
      .select("status")
      .eq("id", testSessionId)
      .single();
    expect(sessPaused.status).toBe("paused");

    // Verify calcRemaining returns exactly 45s while paused
    expect(calcRemaining(null, 45000, true)).toBe(45);

    // 2. Resume timer
    const resumed = await resumeTimer(testSessionId, 45);
    expect(resumed.phase).toBe("action");
    expect(resumed.paused_remaining_ms).toBeNull();
    expect(resumed.target_end_time).toBeDefined();

    const { data: sessResumed } = await supabase
      .schema("osce")
      .from("sessions")
      .select("status")
      .eq("id", testSessionId)
      .single();
    expect(sessResumed.status).toBe("ongoing");

    const remResumed = calcRemaining(resumed.target_end_time);
    expect(remResumed).toBeGreaterThanOrEqual(43);
    expect(remResumed).toBeLessThanOrEqual(46);
  });

  it("Step 5: sendBroadcast & sendBellBroadcast -> Broadcasts realtime message & dispatches payload", async () => {
    const broadcastMsg = `Pengumuman Uji Live Supabase: ${Date.now()}`;
    const result = await sendBroadcast(testSessionId, broadcastMsg, "warning", "all");
    expect(result).toBeDefined();
    expect(result.message).toBe(broadcastMsg);
    expect(result.priority).toBe("warning");
    expect(result.target_role).toBe("all");

    const bellRes = await sendBellBroadcast(testSessionId, "warning");
    expect(bellRes).toBeDefined();
  });

  it("Step 6: setSessionCompletedWaiting -> Enters completed_waiting phase, freezes at 00:00 (NEED_FIX.md)", async () => {
    const timer = await setSessionCompletedWaiting(testSessionId, 1);
    expect(timer.phase).toBe("completed_waiting");
    expect(timer.target_end_time).toBeNull();
    expect(timer.paused_remaining_ms).toBe(0);

    // Direct DB query verification
    const timerInDb = await getSessionTimerState(testSessionId);
    expect(timerInDb.phase).toBe("completed_waiting");
    expect(timerInDb.round_number).toBe(1);
    expect(calcRemaining(timerInDb.target_end_time, timerInDb.paused_remaining_ms, true)).toBe(0);
  });

  it("Step 7: finishSession -> Sets sessions.status to 'completed', phase to 'finished' & cleans up", async () => {
    await finishSession(testSessionId);

    // Direct DB query verification
    const { data: sessionInDb } = await supabase
      .schema("osce")
      .from("sessions")
      .select("status, finished_at")
      .eq("id", testSessionId)
      .single();

    expect(sessionInDb.status).toBe("completed");
    expect(sessionInDb.finished_at).toBeDefined();

    const timerInDb = await getSessionTimerState(testSessionId);
    expect(timerInDb.phase).toBe("finished");
  });
});
