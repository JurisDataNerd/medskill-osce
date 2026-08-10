import { supabase } from "@/lib/supabaseClient";

/**
 * Send a broadcast message to session participants & examiners
 */
export async function sendBroadcastMessage(sessionId, message, priority = "info", targetRole = "all") {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .schema("osce")
    .from("broadcast_messages")
    .insert({
      session_id: sessionId,
      message,
      priority,
      target_role: targetRole,
      sent_by: user ? user.id : null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending broadcast message:", error);
    throw error;
  }

  return data;
}

/**
 * Fetch broadcast message history for a session
 */
export async function getBroadcastMessages(sessionId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("broadcast_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching broadcast messages:", error);
    return [];
  }

  return data || [];
}

/**
 * Subscribe to realtime broadcast messages for a session
 */
export function subscribeBroadcastMessages(sessionId, callback) {
  return supabase
    .channel(`osce-broadcast-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "osce",
        table: "broadcast_messages",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        if (callback) callback(payload.new);
      }
    )
    .subscribe();
}
