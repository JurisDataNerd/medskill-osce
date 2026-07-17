import { supabase } from "@/supabase/client";

export async function getSessions() {
  const { data, error } = await supabase
    .from("osce_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function getSessionById(id) {
  const { data, error } = await supabase
    .from("osce_sessions")
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
    .from("osce_sessions")
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
    .from("osce_sessions")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteSession(id) {
  const { error } = await supabase
    .from("osce_sessions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function startSession(id) {
  const { data, error } = await supabase
    .from("osce_sessions")
    .update({
      status: "running",
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
    .from("osce_sessions")
    .update({
      status: "finished",
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
    .from("osce_session_members")
    .select(`
      id,
      profile_id,
      role,
      station_number,
      participant_order,
      status,
      profiles (
        id,
        full_name,
        email,
        is_online,
        last_seen
      )
    `)
    .eq("session_id", sessionId)
    .eq("role", "participant")
    .order("station_number");

  if (error) {
    console.error(error);
    throw error;
  }

  return data ?? [];
}

export async function getSessionExaminers(sessionId) {
  const { data, error } = await supabase
    .from("osce_session_members")
    .select(`
      id,
      profile_id,
      role,
      station_number,
      status,
      profiles (
        id,
        full_name,
        email,
        is_online,
        last_seen
      )
    `)
    .eq("session_id", sessionId)
    .in("role", ["examiner", "mentor"])
    .order("station_number");

  if (error) {
    console.error(error);
    throw error;
  }

  return data ?? [];
}

export async function approveParticipant(id) {
  const { error } = await supabase
    .from("osce_session_members")
    .update({
      status: "approved",
    })
    .eq("id", id);

  if (error) throw error;
}

export async function rejectParticipant(id) {
  const { error } = await supabase
    .from("osce_session_members")
    .update({
      status: "rejected",
    })
    .eq("id", id);

  if (error) throw error;
}

export async function getAllParticipants() {
  const { data, error } = await supabase
    .from("osce_session_members")
    .select(`
      id,
      profile_id,
      session_id,
      role,
      status,
      station_number,
      participant_order,
      profiles (
        id,
        full_name,
        email,
        is_online,
        last_seen
      ),
      osce_sessions (
        id,
        title
      )
    `)
    .eq("role", "participant");

  if (error) {
    console.error(error);
    throw error;
  }

  return data ?? [];
}