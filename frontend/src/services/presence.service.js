import { supabase } from "@/supabase/client";

export async function updatePresence(status = "online") {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: member } = await supabase
    .from("osce_session_members")
    .select("session_id, role, station_number")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!member) return;

  await supabase.from("osce_presence").upsert({
    profile_id: user.id,
    session_id: member.session_id,
    role: member.role,
    current_station: member.station_number,
    status,
    last_seen: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}