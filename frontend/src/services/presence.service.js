import { supabase } from "@/lib/supabaseClient";

export async function updatePresence(status = "online") {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: participant } = await supabase
      .schema("osce")
      .from("session_participants")
      .select("session_id, starting_station_number")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!participant) return;

    await supabase
      .schema("osce")
      .from("participant_answers")
      .upsert({
        user_id: user.id,
        session_id: participant.session_id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,session_id" });
  } catch (err) {
    // Suppress presence background heartbeat error
  }
}