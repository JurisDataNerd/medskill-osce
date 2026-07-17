import { supabase } from "@/supabase/client";

/**
 * Ambil semua member dari sesi yang sedang running,
 * dikelompokkan per station_number.
 * Return array of station objects:
 * {
 *   station_number,
 *   status: "running" | "waiting" | "finished",
 *   examiner: { full_name } | null,
 *   participant: { full_name } | null,
 *   started_at: string | null,
 * }
 */
export async function assignStation(stationId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Assign examiner by creating/updating osce_session_members for role 'examiner'
  // stationId here is expected to be a stage id
  const { data: stage } = await supabase
    .from("osce_stages")
    .select("*")
    .eq("id", stationId)
    .maybeSingle();

  if (!stage) {
    throw new Error("Stage not found");
  }

  // Find latest session for this stage
  const { data: session } = await supabase
    .from("osce_sessions")
    .select("*")
    .neq("status", "finished")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sessionId = session?.id ?? stage.session_id;

  // Try update existing empty examiner member
  const { data: updated, error: updateErr } = await supabase
    .from("osce_session_members")
    .update({ profile_id: user.id, status: "assigned" })
    .eq("session_id", sessionId)
    .eq("role", "examiner")
    .eq("station_number", stage.station_number)
    .is("profile_id", null)
    .select()
    .single();

  if (updated) return updated;

  // Otherwise insert a new member
  const { data: inserted, error: insertErr } = await supabase
    .from("osce_session_members")
    .insert({
      session_id: sessionId,
      profile_id: user.id,
      role: "examiner",
      station_number: stage.station_number,
      status: "assigned",
    })
    .select()
    .single();

  if (insertErr) throw insertErr;

  return inserted;
}

export async function getLiveStations() {
  // Ambil sesi yang sedang running
  const { data: sessions, error: sessionError } = await supabase
    .from("osce_sessions")
    .select("id, total_stations, started_at, status")
    .eq("status", "running")
    .limit(1);

  if (sessionError) throw sessionError;

  // Jika tidak ada sesi running, kembalikan array kosong
  if (!sessions || sessions.length === 0) {
    return { session: null, stations: [] };
  }

  const session = sessions[0];

  // Ambil semua member dari sesi ini
  const { data: members, error: memberError } = await supabase
    .from("osce_session_members")
    .select(`
      id,
      role,
      status,
      station_number,
      profiles (
        full_name
      )
    `)
    .eq("session_id", session.id)
    .in("role", ["participant", "examiner"]);

  if (memberError) throw memberError;

  const totalStations = session.total_stations ?? 0;

  // Build stations array
  const stations = Array.from({ length: totalStations }, (_, i) => {
    const stationNum = i + 1;
    const stationMembers = (members ?? []).filter(
      (m) => m.station_number === stationNum
    );

    const examiner = stationMembers.find((m) => m.role === "examiner");
    const participant = stationMembers.find((m) => m.role === "participant");

    // Tentukan status station
    let stationStatus = "waiting";
    if (participant) {
      if (participant.status === "finished" || participant.status === "done") {
        stationStatus = "finished";
      } else if (
        participant.status === "approved" ||
        participant.status === "running"
      ) {
        stationStatus = "running";
      }
    }

    return {
      station_number: stationNum,
      status: stationStatus,
      examiner: examiner?.profiles ?? null,
      participant: participant?.profiles ?? null,
      session_started_at: session.started_at,
    };
  });

  return { session, stations };
}

export async function getDashboardStats() {
  const [
    { count: participants },
    { count: examiners },
    { count: mentors },
    { count: sessions },
    { data: activeSession },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "participant"),

    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "examiner"),

    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "mentor"),

    supabase
      .from("osce_sessions")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("osce_sessions")
      .select("id, title, status, started_at, total_stations, station_duration_minutes")
      .eq("status", "running")
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    participants: participants ?? 0,
    examiners: examiners ?? 0,
    mentors: mentors ?? 0,
    sessions: sessions ?? 0,
    activeSession: activeSession ?? null,
  };
}

// Legacy function — dipakai oleh examiner LiveMonitorPage
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

  return data ?? [];
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
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "osce_sessions",
      },
      callback
    )
    .subscribe();
}