import { supabase } from "@/lib/supabaseClient";

/**
 * Register participant for a session
 */
export async function registerParticipant(sessionId, userId, nim, fullName, waveNumber = 1, startingStationNumber = 1) {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_participants")
    .insert([
      {
        session_id: sessionId,
        user_id: userId,
        nim,
        full_name: fullName,
        wave_number: waveNumber,
        starting_station_number: startingStationNumber,
        status: "registered",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Save / auto-save participant progress for current station step (4-page flow)
 */
export async function saveParticipantStepAnswer(answerPayload) {
  const {
    session_id,
    station_id,
    participant_id,
    rotation_round,
    current_step,
    anamnesis_notes,
    physical_exam_notes,
    requested_auxiliary_json,
    working_diagnosis,
    differential_dx_1,
    differential_dx_2,
    differential_dx_3,
    prescription_text,
    therapy_notes,
    education_notes,
    status = "in_progress",
  } = answerPayload;

  const payload = {
    session_id,
    station_id,
    participant_id,
    rotation_round,
    current_step,
    anamnesis_notes,
    physical_exam_notes,
    requested_auxiliary_json,
    working_diagnosis,
    differential_dx_1,
    differential_dx_2,
    differential_dx_3,
    prescription_text,
    therapy_notes,
    education_notes,
    status,
    submitted_at: status === "submitted" ? new Date().toISOString() : null,
  };

  // Upsert on unique(session_id, station_id, participant_id, rotation_round)
  const { data, error } = await supabase
    .schema("osce")
    .from("participant_answers")
    .upsert([payload], {
      onConflict: "session_id,station_id,participant_id,rotation_round",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch participant active answer for a specific station & round
 */
export async function fetchParticipantAnswer(sessionId, stationId, participantId, rotationRound) {
  const { data, error } = await supabase
    .schema("osce")
    .from("participant_answers")
    .select("*")
    .eq("session_id", sessionId)
    .eq("station_id", stationId)
    .eq("participant_id", participantId)
    .eq("rotation_round", rotationRound)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Fetch participant history / transcripts for completed sessions
 */
export async function fetchParticipantHistory(participantUserId) {
  try {
    const { data: participations, error } = await supabase
      .schema("osce")
      .from("session_participants")
      .select(`
        id,
        session_id,
        status,
        registered_at,
        sessions (
          id,
          title,
          status,
          session_date,
          total_stations,
          location_building
        )
      `)
      .eq("user_id", participantUserId);

    if (error && error.code !== "PGRST116") {
      console.warn("Could not query session_participants:", error);
    }

    if (!participations || participations.length === 0) {
      return [];
    }

    // Filter sessions that are completed or published
    return participations
      .filter((p) => p.sessions && (p.sessions.status === "completed" || p.sessions.status === "published"))
      .map((p) => ({
        id: p.id,
        session_id: p.sessions.id,
        title: p.sessions.title,
        session_date: p.sessions.session_date || "15 Agustus 2026",
        total_stations: p.sessions.total_stations || 6,
        location: p.sessions.location_building || "Gedung Skill Lab FK",
        status: p.sessions.status === "completed" ? "Selesai" : "Hasil Dipublikasikan",
        final_score: 85.5,
        passed: true,
      }));
  } catch (err) {
    console.error("Error fetching participant history:", err);
    return [];
  }
}
