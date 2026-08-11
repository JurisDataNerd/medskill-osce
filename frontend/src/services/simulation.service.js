import { supabase } from "@/lib/supabaseClient";

/* ============================================================
   ASSIGN PARTICIPANTS
============================================================ */

export async function assignParticipants(sessionId) {
  const { data: participants, error: participantError } =
    await supabase
      .schema("osce")
      .from("session_participants")
      .select("*")
      .eq("session_id", sessionId)
      .order("id");

  if (participantError) return;

  const { data: stages, error: stageError } =
    await supabase
      .schema("osce")
      .from("stations")
      .select("*")
      .eq("session_id", sessionId)
      .order("station_number");

  if (stageError || !participants || !stages) return;

  for (let i = 0; i < participants.length; i++) {
    const stage = stages[i % stages.length];
    const { error } = await supabase
      .schema("osce")
      .from("session_participants")
      .update({
        starting_station_number: stage.station_number,
      })
      .eq("id", participants[i].id);

    if (error) console.warn(error.message);
  }
}

/* ============================================================
   START SIMULATION
============================================================ */

export async function startSimulation(sessionId) {
  await assignParticipants(sessionId);

  const { error } = await supabase
    .schema("osce")
    .from("sessions")
    .update({
      status: "ongoing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) console.warn(error.message);
}

/* ============================================================
   NEXT ROTATION
============================================================ */

export async function nextRotation(sessionId) {
  const { data: session, error: sessionError } =
    await supabase
      .from("osce_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

  if (sessionError) throw sessionError;

  const { data: members, error: memberError } =
    await supabase
      .schema("osce")
      .from("session_participants")
      .select("*")
      .eq("session_id", sessionId);

  if (memberError || !members) return;

  for (const member of members) {
    let nextStation = (member.starting_station_number || 1) + 1;

    const { error } = await supabase
      .schema("osce")
      .from("session_participants")
      .update({
        starting_station_number: nextStation,
      })
      .eq("id", member.id);

    if (error) console.warn(error.message);
  }

  await supabase
    .schema("osce")
    .from("sessions")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
}

/* ============================================================
   FINISH SIMULATION
============================================================ */

export async function finishSimulation(sessionId) {
  await supabase
    .schema("osce")
    .from("sessions")
    .update({
      status: "completed",
    })
    .eq("id", sessionId);
}

/* ============================================================
   GET SIMULATION
============================================================ */

export async function getSimulationState(sessionId) {
  const { data, error } =
    await supabase
      .schema("osce")
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();

  if (error) return null;

  return data;
}