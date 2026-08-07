import { supabase } from "@/lib/supabaseClient";

/**
 * Subscribe to realtime timer and session events for a specific OSCE session
 */
export function subscribeToSessionRealtime(sessionId, { onTimerUpdate, onBroadcastMessage, onRotationAdvance }) {
  const channel = supabase.channel(`session:${sessionId}`, {
    config: {
      broadcast: { self: true },
    },
  });

  // Listen to Timer State DB changes
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "osce",
      table: "session_timer_state",
      filter: `session_id=eq.${sessionId}`,
    },
    (payload) => {
      if (onTimerUpdate) onTimerUpdate(payload.new);
    }
  );

  // Listen to Broadcast Messages
  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "osce",
      table: "broadcast_messages",
      filter: `session_id=eq.${sessionId}`,
    },
    (payload) => {
      if (onBroadcastMessage) onBroadcastMessage(payload.new);
    }
  );

  // Listen to Rotation State changes
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "osce",
      table: "rotation_states",
      filter: `session_id=eq.${sessionId}`,
    },
    (payload) => {
      if (onRotationAdvance) onRotationAdvance(payload.new);
    }
  );

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Admin action: Start/Update Timer Phase using Future Timestamp Pattern
 */
export async function updateSessionTimerPhase(sessionId, phase, durationMinutes, userId) {
  const targetEndTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

  const payload = {
    session_id: sessionId,
    phase,
    target_end_time: targetEndTime,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .schema("osce")
    .from("session_timer_state")
    .upsert([payload], { onConflict: "session_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Admin action: Send broadcast announcement
 */
export async function sendBroadcastMessage(sessionId, message, priority = "info", targetRole = "all", userId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("broadcast_messages")
    .insert([
      {
        session_id: sessionId,
        message,
        priority,
        target_role: targetRole,
        sent_by: userId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
