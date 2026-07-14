import { supabase } from "@/supabase/client";

export async function getLiveParticipants() {
  const { data, error } = await supabase
    .from("osce_session_members")
    .select(`
      id,
      status,
      station_number,
      participant_order,
      profiles (
        full_name
      ),
      osce_sessions (
        title
      )
    `)
    .eq("role", "participant")
    .order("station_number");

  if (error) throw error;

  return data;
}

export function subscribeLive(callback) {
  return supabase
    .channel("live-monitor")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "osce_session_members",
      },
      callback
    )
    .subscribe();
}