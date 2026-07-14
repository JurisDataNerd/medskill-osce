import { supabase } from "@/supabase/client";

export async function getSessions() {
  const { data, error } = await supabase
    .from("osce_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
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
  console.log("sessionId =", sessionId);

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
        email
      )
    `)
    .eq("session_id", sessionId)
    .eq("role", "participant");

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
        email
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