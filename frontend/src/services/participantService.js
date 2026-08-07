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
