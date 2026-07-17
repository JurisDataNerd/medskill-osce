import { supabase } from "@/supabase/client";

/* ============================================================
   ASSIGN PARTICIPANTS
============================================================ */

export async function assignParticipants(sessionId) {
  const { data: participants, error: participantError } =
    await supabase
      .from("osce_session_members")
      .select("*")
      .eq("session_id", sessionId)
      .eq("role", "participant")
      .eq("status", "approved")
      .order("id");

  if (participantError) throw participantError;

  const { data: stages, error: stageError } =
    await supabase
      .from("osce_stages")
      .select("*")
      .eq("session_id", sessionId)
      .order("station_number");

  if (stageError) throw stageError;

  if (!participants.length)
    throw new Error("Tidak ada peserta.");

  if (!stages.length)
    throw new Error("Tidak ada stase.");

  for (let i = 0; i < participants.length; i++) {
    const stage =
      stages[i % stages.length];

    const { error } = await supabase
      .from("osce_session_members")
      .update({
        participant_order: i + 1,
        station_number: stage.station_number,
      })
      .eq("id", participants[i].id);

    if (error) throw error;
  }
}

/* ============================================================
   START SIMULATION
============================================================ */

export async function startSimulation(sessionId) {
  await assignParticipants(sessionId);

  const { error } = await supabase
    .from("osce_sessions")
    .update({
      status: "running",
      current_rotation: 1,
      current_station: 1,
      started_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) throw error;
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
      .from("osce_session_members")
      .select("*")
      .eq("session_id", sessionId)
      .eq("role", "participant");

  if (memberError) throw memberError;

  for (const member of members) {
    let nextStation =
      member.station_number + 1;

    if (
      nextStation >
      session.total_stations
    ) {
      nextStation = 1;
    }

    const { error } = await supabase
      .from("osce_session_members")
      .update({
        station_number: nextStation,
      })
      .eq("id", member.id);

    if (error) throw error;
  }

  await supabase
    .from("osce_sessions")
    .update({
      current_rotation:
        session.current_rotation + 1,
    })
    .eq("id", sessionId);
}

/* ============================================================
   FINISH SIMULATION
============================================================ */

export async function finishSimulation(sessionId) {
  await supabase
    .from("osce_sessions")
    .update({
      status: "finished",
      finished_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  await supabase
    .from("osce_session_members")
    .update({
      status: "finished",
    })
    .eq("session_id", sessionId)
    .eq("role", "participant");
}

/* ============================================================
   GET SIMULATION
============================================================ */

export async function getSimulationState(sessionId) {
  const { data, error } =
    await supabase
      .from("osce_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

  if (error) throw error;

  return data;
}