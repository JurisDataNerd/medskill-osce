import { supabase } from "@/lib/supabaseClient";

/**
 * Get dashboard statistics for Admin Control Room
 */
export async function getDashboardStats() {
  try {
    const [
      { count: participants },
      { count: examiners },
      { count: mentors },
      { count: sessions },
      { count: questionBankCount },
      { data: recentSessions },
      { data: activeSession },
    ] = await Promise.all([
      supabase
        .schema("public")
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "participant"),

      supabase
        .schema("public")
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "examiner"),

      supabase
        .schema("public")
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "mentor"),

      supabase
        .schema("osce")
        .from("sessions")
        .select("id", { count: "exact", head: true }),

      supabase
        .schema("osce")
        .from("question_bank")
        .select("id", { count: "exact", head: true }),

      supabase
        .schema("osce")
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4),

      supabase
        .schema("osce")
        .from("sessions")
        .select("id, title, status, started_at, total_stations, station_duration_minutes, location_building")
        .in("status", ["ongoing", "waiting_room"])
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      participants: participants ?? 0,
      examiners: examiners ?? 0,
      mentors: mentors ?? 0,
      sessions: sessions ?? 0,
      questionBankCount: questionBankCount ?? 0,
      recentSessions: recentSessions ?? [],
      activeSession: activeSession ?? null,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      participants: 0,
      examiners: 0,
      mentors: 0,
      sessions: 0,
      questionBankCount: 0,
      recentSessions: [],
      activeSession: null,
    };
  }
}

/**
 * Get live station status for ongoing session
 */
export async function getLiveStations(targetSessionId = null) {
  try {
    let session = null;
    if (targetSessionId) {
      const { data, error } = await supabase
        .schema("osce")
        .from("sessions")
        .select("id, total_stations, started_at, status, current_round, current_wave")
        .eq("id", targetSessionId)
        .maybeSingle();
      if (!error && data) session = data;
    }

    if (!session) {
      const { data, error } = await supabase
        .schema("osce")
        .from("sessions")
        .select("id, total_stations, started_at, status, current_round, current_wave")
        .in("status", ["ongoing", "waiting_room"])
        .limit(1)
        .maybeSingle();
      if (!error && data) session = data;
    }

    if (!session) {
      return { session: null, stations: [] };
    }

    const [
      { data: stationsData },
      { data: participantsData },
      { data: examinersData },
    ] = await Promise.all([
      supabase
        .schema("osce")
        .from("stations")
        .select("*")
        .eq("session_id", session.id)
        .order("station_number", { ascending: true }),

      supabase
        .schema("osce")
        .from("session_participants")
        .select("*")
        .eq("session_id", session.id),

      supabase
        .schema("osce")
        .from("session_examiners")
        .select("*")
        .eq("session_id", session.id),
    ]);

    const formattedStations = (stationsData || []).map((st) => {
      const examiner = (examinersData || []).find(
        (e) => e.assigned_station_number === st.station_number
      );
      const participant = (participantsData || []).find(
        (p) => p.starting_station_number === st.station_number
      );

      return {
        id: st.id,
        station_number: st.station_number,
        title: st.title,
        is_break: st.is_break,
        case_title: st.case_title,
        examiner: examiner ? { full_name: examiner.full_name, specialty: examiner.specialty } : null,
        participant: participant ? { full_name: participant.full_name, nim: participant.nim } : null,
        status: st.is_break ? "break" : "running",
      };
    });

    return { session, stations: formattedStations };
  } catch (error) {
    console.error("Error fetching live stations:", error);
    return { session: null, stations: [] };
  }
}

/**
 * Legacy compatibility helper for assigned stations
 */
export async function assignStation(stationId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthenticated");

  const { data: station } = await supabase
    .schema("osce")
    .from("stations")
    .select("*")
    .eq("id", stationId)
    .single();

  if (!station) throw new Error("Station not found");

  const { data: inserted, error } = await supabase
    .schema("osce")
    .from("session_examiners")
    .insert({
      session_id: station.session_id,
      user_id: user.id,
      full_name: user.email || "Dokter Penguji",
      assigned_station_number: station.station_number,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

/**
 * Helper to fetch live participants for examiner monitor
 */
export async function getLiveParticipants() {
  try {
    const { data, error } = await supabase
      .schema("osce")
      .from("session_participants")
      .select("*");

    if (error) throw error;
    return (data || []).map((p) => ({
      id: p.id,
      status: p.status || "active",
      station_number: p.starting_station_number,
      participant_order: p.starting_station_number,
      profiles: {
        full_name: p.full_name,
      },
      osce_sessions: {
        title: "Sesi OSCE Active",
      },
    }));
  } catch (err) {
    console.warn("Could not fetch live participants:", err);
    return [];
  }
}

/**
 * Fetch or initialize session timer state
 */
export async function getSessionTimerState(sessionId) {
  try {
    const { data, error } = await supabase
      .schema("osce")
      .from("session_timer_state")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching session timer state:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// Compatibility export for general dashboard live updates
// ─────────────────────────────────────────────────────────────────
export function subscribeLive(callback) {
  return supabase
    .channel("osce-general-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "osce", table: "sessions" },
      callback
    )
    .subscribe();
}