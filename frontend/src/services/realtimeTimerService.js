import { supabase } from "@/lib/supabaseClient";

// ─────────────────────────────────────────────────────────────────
// PURE UTILITY
// ─────────────────────────────────────────────────────────────────

/**
 * Calculate remaining seconds from target_end_time (Future Timestamp Pattern).
 * Pure function – no side effects.
 */
export function calcRemaining(targetEndTime, pausedMs = null, isPaused = false) {
  if (isPaused && pausedMs != null) {
    return Math.max(0, Math.floor(pausedMs / 1000));
  }
  if (!targetEndTime) return 0;
  return Math.max(0, Math.floor((new Date(targetEndTime).getTime() - Date.now()) / 1000));
}

// Keep backward-compat alias
export const calcRemainingSeconds = calcRemaining;

/**
 * Play a broadcast notification sound chime.
 * Checks for /sounds/broadcast.mp3 in public folder, with Web Audio API synthesizer as zero-latency fallback.
 */
export function playBroadcastNotificationSound() {
  try {
    const audio = new Audio("/sounds/broadcast.mp3");
    audio.volume = 0.8;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        synthesizeChimeSound();
      });
    }
  } catch (e) {
    synthesizeChimeSound();
  }
}

function synthesizeChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const tones = [
      { freq: 880, start: 0, duration: 0.2 },
      { freq: 1174.66, start: 0.15, duration: 0.4 },
    ];

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.35, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });
  } catch (err) {
    console.warn("Audio Context playback warning:", err);
  }
}

// ─────────────────────────────────────────────────────────────────
// CHANNEL 1 — SESSION DB CHANGES  (postgres_changes)
// ─────────────────────────────────────────────────────────────────

/**
 * Clean up any existing Supabase channel by name before creating a new one.
 * Prevents "cannot add callbacks after subscribe()" errors.
 */
function cleanupChannel(channelName) {
  const existing = supabase
    .getChannels()
    .find((c) => c.topic === `realtime:${channelName}` || c.topic === channelName);
  if (existing) {
    supabase.removeChannel(existing);
  }
}

/**
 * Subscribe to all DB-driven realtime events for one OSCE session.
 *
 * Listens on tables:
 *   • osce.sessions            → status changes (waiting_room → ongoing → paused → completed)
 *   • osce.session_timer_state → timer ticks (target_end_time, phase, round)
 *   • osce.broadcast_messages  → admin announcements
 *   • osce.rotation_states     → round advance
 *
 * @param {string} sessionId
 * @param {object} callbacks
 * @param {function} [callbacks.onSessionUpdate]  — receives new session row
 * @param {function} [callbacks.onTimerUpdate]     — receives new timer_state row
 * @param {function} [callbacks.onBroadcast]       — receives new broadcast row
 * @param {function} [callbacks.onRotation]        — receives new rotation row
 * @returns {function} cleanup — call to unsubscribe
 */
export function subscribeToSession(sessionId, {
  onSessionUpdate,
  onTimerUpdate,
  onBroadcast,
  onRotation,
} = {}) {
  if (!sessionId) return () => {};

  const name = `osce-session:${sessionId}`;
  cleanupChannel(name);

  const channel = supabase.channel(name);

  // sessions table
  channel.on(
    "postgres_changes",
    { event: "*", schema: "osce", table: "sessions", filter: `id=eq.${sessionId}` },
    (payload) => {
      if (onSessionUpdate) onSessionUpdate(payload.new || payload.old);
    }
  );

  // session_timer_state table
  channel.on(
    "postgres_changes",
    { event: "*", schema: "osce", table: "session_timer_state", filter: `session_id=eq.${sessionId}` },
    (payload) => {
      if (onTimerUpdate) onTimerUpdate(payload.new || payload.old);
    }
  );

  // Direct WebSocket Broadcast Event (Instant 0ms latency)
  channel.on("broadcast", { event: "announcement" }, (payload) => {
    if (onBroadcast) onBroadcast(payload.payload || payload);
  });

  // Direct WebSocket Session Finished Event (Instant 0ms latency)
  channel.on("broadcast", { event: "session_finished" }, (payload) => {
    if (onSessionUpdate) onSessionUpdate({ status: "completed" });
    if (onTimerUpdate) onTimerUpdate({ phase: "finished" });
  });

  // broadcast_messages table (INSERT only)
  channel.on(
    "postgres_changes",
    { event: "INSERT", schema: "osce", table: "broadcast_messages", filter: `session_id=eq.${sessionId}` },
    (payload) => {
      if (onBroadcast) onBroadcast(payload.new);
    }
  );

  // rotation_states table
  channel.on(
    "postgres_changes",
    { event: "*", schema: "osce", table: "rotation_states", filter: `session_id=eq.${sessionId}` },
    (payload) => {
      if (onRotation) onRotation(payload.new);
    }
  );

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Backward-compat alias used by older code
export function subscribeToSessionRealtime(sessionId, {
  onTimerUpdate,
  onSessionStatusUpdate,
  onBroadcastMessage,
  onRotationAdvance,
} = {}) {
  return subscribeToSession(sessionId, {
    onSessionUpdate: onSessionStatusUpdate,
    onTimerUpdate,
    onBroadcast: onBroadcastMessage,
    onRotation: onRotationAdvance,
  });
}

// ─────────────────────────────────────────────────────────────────
// CHANNEL 2 — PRESENCE  (Supabase Presence API)
// ─────────────────────────────────────────────────────────────────

/**
 * Join the presence channel for a session.
 * Tracks the current user and calls `onSync` whenever the user list changes.
 *
 * @param {string} sessionId
 * @param {object} userState — { user_id, full_name, role, nim?, specialty?, email? }
 * @param {function} onSync  — receives deduplicated array of online users
 * @returns {function} cleanup
 */
export function joinPresence(sessionId, userState, onSync) {
  if (!sessionId || !userState) return () => {};

  const name = `osce-presence:${sessionId}`;
  cleanupChannel(name);

  const userKey =
    userState.user_id || userState.email || `anon-${Math.random().toString(36).substring(2, 9)}`;

  console.log(`[Supabase Realtime] Joining Presence channel "${name}" as:`, userState);

  const channel = supabase.channel(name, {
    config: { presence: { key: userKey } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const users = [];
      const seen = new Set();
      for (const key of Object.keys(state)) {
        for (const entry of state[key]) {
          const uid = entry.user_id || entry.email || key;
          if (!seen.has(uid)) {
            seen.add(uid);
            users.push(entry);
          }
        }
      }
      console.log(`[Supabase Realtime] Presence sync on "${name}" (${users.length} users online):`, users);
      if (onSync) onSync(users);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: userKey,
          full_name: userState.full_name || "Pengguna",
          role: userState.role || "participant",
          nim: userState.nim || "",
          specialty: userState.specialty || "",
          email: userState.email || "",
          online_at: new Date().toISOString(),
        });
      }
    });

  return () => {
    console.log(`[Supabase Realtime] Leaving Presence channel "${name}"`);
    supabase.removeChannel(channel);
  };
}

// Backward-compat alias
export const trackSessionPresence = joinPresence;

// ─────────────────────────────────────────────────────────────────
// ADMIN ACTIONS — write to Supabase (triggers realtime for everyone)
// ─────────────────────────────────────────────────────────────────

/**
 * Phase 1: Admin opens the Waiting Room (Zoom-like).
 * Session status changes to 'waiting_room'. No timer starts yet.
 */
export async function openWaitingRoom(sessionId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .update({
      status: "waiting_room",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Phase 2: Admin starts the OSCE exam. Timer begins.
 * Session status → 'ongoing', timer state upserted with target_end_time.
 */
export async function startOsceSession(sessionId, durationMinutes = 12) {
  const targetEndTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

  const [sessionRes, timerRes] = await Promise.all([
    supabase
      .schema("osce")
      .from("sessions")
      .update({
        status: "ongoing",
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single(),

    supabase
      .schema("osce")
      .from("session_timer_state")
      .upsert(
        [{
          session_id: sessionId,
          phase: "action",
          target_end_time: targetEndTime,
          paused_remaining_ms: null,
          round_number: 1,
          wave_number: 1,
          updated_at: new Date().toISOString(),
        }],
        { onConflict: "session_id" }
      )
      .select()
      .single(),
  ]);

  if (sessionRes.error) throw sessionRes.error;
  if (timerRes.error) throw timerRes.error;
  return { session: sessionRes.data, timer: timerRes.data };
}

/**
 * Update timer phase (e.g. action → break → action for next round).
 */
export async function updateTimerPhase(sessionId, phase, durationMinutes = 12, extra = {}) {
  const targetEndTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .schema("osce")
    .from("session_timer_state")
    .upsert(
      [{
        session_id: sessionId,
        phase,
        target_end_time: targetEndTime,
        paused_remaining_ms: null,
        round_number: extra.roundNumber || 1,
        wave_number: extra.waveNumber || 1,
        updated_at: new Date().toISOString(),
      }],
      { onConflict: "session_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Backward-compat alias
export const updateSessionTimerPhase = updateTimerPhase;

/**
 * Pause the global timer.
 */
export async function pauseTimer(sessionId, remainingSeconds) {
  const [timerRes] = await Promise.all([
    supabase
      .schema("osce")
      .from("session_timer_state")
      .upsert(
        [{
          session_id: sessionId,
          phase: "paused",
          target_end_time: null,
          paused_remaining_ms: Math.max(0, remainingSeconds * 1000),
          updated_at: new Date().toISOString(),
        }],
        { onConflict: "session_id" }
      )
      .select()
      .single(),

    supabase
      .schema("osce")
      .from("sessions")
      .update({ status: "paused", updated_at: new Date().toISOString() })
      .eq("id", sessionId),
  ]);

  if (timerRes.error) throw timerRes.error;
  return timerRes.data;
}

// Backward-compat alias
export const pauseSessionTimer = pauseTimer;

/**
 * Resume the global timer.
 */
export async function resumeTimer(sessionId, remainingSeconds) {
  const targetEndTime = new Date(Date.now() + Math.max(1000, remainingSeconds * 1000)).toISOString();

  const [timerRes] = await Promise.all([
    supabase
      .schema("osce")
      .from("session_timer_state")
      .upsert(
        [{
          session_id: sessionId,
          phase: "action",
          target_end_time: targetEndTime,
          paused_remaining_ms: null,
          updated_at: new Date().toISOString(),
        }],
        { onConflict: "session_id" }
      )
      .select()
      .single(),

    supabase
      .schema("osce")
      .from("sessions")
      .update({ status: "ongoing", updated_at: new Date().toISOString() })
      .eq("id", sessionId),
  ]);

  if (timerRes.error) throw timerRes.error;
  return timerRes.data;
}

// Backward-compat alias
export const resumeSessionTimer = resumeTimer;

/**
 * Send a broadcast message to all / specific roles.
 */
export async function sendBroadcast(sessionId, message, priority = "info", targetRole = "all", userId = null) {
  const isUuid = typeof userId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  const sentByUuid = isUuid ? userId : null;

  const payload = {
    id: `bcast_${Date.now()}`,
    session_id: sessionId,
    message,
    priority,
    target_role: targetRole,
    sent_by: sentByUuid,
    created_at: new Date().toISOString(),
  };

  // 1. Send via Supabase Realtime WebSocket Channel (Instant 0ms latency)
  try {
    const channelName = `osce-session:${sessionId}`;
    let channel = supabase.getChannels().find((c) => c.topic === channelName || c.topic === `realtime:${channelName}`);
    if (!channel) {
      channel = supabase.channel(channelName);
      await channel.subscribe();
    }
    await channel.send({
      type: "broadcast",
      event: "announcement",
      payload,
    });
  } catch (err) {
    console.warn("Direct WebSocket broadcast notice:", err);
  }

  // 2. Persist to DB osce.broadcast_messages table
  try {
    const { data } = await supabase
      .schema("osce")
      .from("broadcast_messages")
      .insert([{
        session_id: sessionId,
        message,
        priority,
        target_role: targetRole,
        sent_by: sentByUuid,
      }])
      .select()
      .maybeSingle();

    return data || payload;
  } catch (err) {
    console.warn("Broadcast DB fallback notice:", err.message);
    return payload;
  }
}

// Backward-compat alias
export const sendBroadcastMessage = sendBroadcast;

/**
 * End / finish the OSCE session.
 */
export async function finishSession(sessionId) {
  if (!sessionId) return null;

  // 1. Update osce.sessions status to 'completed'
  const sessionPromise = supabase
    .schema("osce")
    .from("sessions")
    .update({
      status: "completed",
      finished_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .maybeSingle();

  // 2. Update osce.session_timer_state phase to 'finished'
  const timerPromise = supabase
    .schema("osce")
    .from("session_timer_state")
    .upsert(
      [{
        session_id: sessionId,
        phase: "finished",
        target_end_time: null,
        paused_remaining_ms: 0,
        updated_at: new Date().toISOString(),
      }],
      { onConflict: "session_id" }
    )
    .select()
    .maybeSingle();

  const [{ data: sessionData }, { data: timerData }] = await Promise.all([
    sessionPromise.catch(() => ({ data: null })),
    timerPromise.catch(() => ({ data: null })),
  ]);

  // 3. Send Realtime WebSocket Broadcast to immediately notify all Participants & Examiners
  try {
    const channelName = `osce-session:${sessionId}`;
    let channel = supabase.getChannels().find((c) => c.topic === channelName || c.topic === `realtime:${channelName}`);
    if (!channel) {
      channel = supabase.channel(channelName);
      await channel.subscribe();
    }
    await channel.send({
      type: "broadcast",
      event: "session_finished",
      payload: { session_id: sessionId, status: "completed", phase: "finished" },
    });
  } catch (err) {
    console.warn("WebSocket session_finished broadcast notice:", err);
  }

  // 4. Cleanup & unsubscribe presence & session realtime channels after 1.5s
  setTimeout(() => {
    cleanupChannel(`osce-session:${sessionId}`);
    cleanupChannel(`osce-presence:${sessionId}`);
  }, 1500);

  return sessionData || { id: sessionId, status: "completed" };
}
