import { supabase } from "@/lib/supabaseClient";

export async function getSessions() {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSessionById(id) {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSession(payload) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;

  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .insert({
      ...payload,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSession(id, payload) {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSession(id) {
  const { error } = await supabase
    .schema("osce")
    .from("sessions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function startSession(id) {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .update({
      status: "ongoing",
      started_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function finishSession(id) {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .update({
      status: "completed",
      finished_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionParticipants(sessionId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_participants")
    .select("*")
    .eq("session_id", sessionId)
    .order("starting_station_number");

  if (error) {
    console.error(error);
    throw error;
  }

  return (data || []).map((p) => ({
    id: p.id,
    station_number: p.starting_station_number,
    participant_order: p.starting_station_number,
    status: p.status || "approved",
    profiles: {
      full_name: p.full_name,
      email: `${p.nim}@student.medskill.ac.id`,
      is_online: true,
    },
  }));
}

export async function getSessionExaminers(sessionId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_examiners")
    .select("*")
    .eq("session_id", sessionId)
    .order("assigned_station_number");

  if (error) {
    console.error(error);
    throw error;
  }

  return (data || []).map((e) => ({
    id: e.id,
    station_number: e.assigned_station_number,
    status: e.status || "active",
    profiles: {
      full_name: e.full_name,
      email: `${e.full_name.toLowerCase().replace(/\s+/g, ".")}@medskill.ac.id`,
      is_online: true,
    },
  }));
}

export async function approveParticipant(id) {
  const { error } = await supabase
    .schema("osce")
    .from("session_participants")
    .update({
      status: "active",
    })
    .eq("id", id);

  if (error) throw error;
}

export async function rejectParticipant(id) {
  const { error } = await supabase
    .schema("osce")
    .from("session_participants")
    .update({
      status: "absent",
    })
    .eq("id", id);

  if (error) throw error;
}

export async function getAllParticipants() {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_participants")
    .select("*");

  if (error) {
    console.error(error);
    throw error;
  }

  return (data || []).map((p) => ({
    id: p.id,
    station_number: p.starting_station_number,
    participant_order: p.starting_station_number,
    status: p.status || "approved",
    profiles: {
      full_name: p.full_name,
      email: `${p.nim}@student.medskill.ac.id`,
      is_online: true,
    },
  }));
}