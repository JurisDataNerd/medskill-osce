import { supabase } from "@/supabase/client";

/* ============================================================
   AUTH
============================================================ */

async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/* ============================================================
   REGISTRATION
============================================================ */

export async function getMyRegistration(sessionId) {
  const user = await getUser();

  if (!user) return null;

import { supabase } from "@/lib/supabaseClient";

  let query = supabase
    .schema("osce")
    .from("session_participants")
    .select("*")
    .eq("user_id", user.id);

  if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) return null;

  return data;
}

/* ============================================================
   SESSION
============================================================ */

export async function getMySession(sessionId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) return null;

  return data;
}

/* ============================================================
   CURRENT STAGE
============================================================ */

export async function getCurrentStage(sessionId) {
  const member = await getMyRegistration(sessionId);

  if (!member) return null;

  if (member.station_number == null) return null;

  const { data, error } = await supabase
    .from("osce_stages")
    .select("*")
    .eq("session_id", sessionId)
    .eq("station_number", member.station_number)
    .single();

  if (error) throw error;

  return data;
}

/* ============================================================
   QUESTION
============================================================ */

export async function getStationQuestion(stageId) {
  const { data, error } = await supabase
    .from("osce_stage_questions")
    .select("*")
    .eq("stage_id", stageId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

/* ============================================================
   ANSWER
============================================================ */

export async function getMyAnswer(stageId) {
  const user = await getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("osce_answers")
    .select("*")
    .eq("participant_profile_id", user.id)
    .eq("stage_id", stageId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

/* ============================================================
   SAVE DRAFT
============================================================ */

export async function saveDraft(sessionId, stageId, answer) {
  const user = await getUser();

  if (!user) return;

  const member = await getMyRegistration(sessionId);

  const existing = await getMyAnswer(stageId);

  const payload = {
    session_id: sessionId,
    participant_profile_id: user.id,
    station_number: member.station_number,
    stage_id: stageId,
    answer: {
      text: answer,
    },
  };

  let error;

  if (existing) {
    ({ error } = await supabase
      .from("osce_answers")
      .update(payload)
      .eq("id", existing.id));
  } else {
    ({ error } = await supabase
      .from("osce_answers")
      .insert(payload));
  }

  if (error) throw error;
}

/* ============================================================
   SUBMIT
============================================================ */

export async function submitAnswer(sessionId, stageId, answer) {
  const user = await getUser();

  if (!user) return;

  const member = await getMyRegistration(sessionId);

  const existing = await getMyAnswer(stageId);

  const payload = {
    session_id: sessionId,
    participant_profile_id: user.id,
    station_number: member.station_number,
    stage_id: stageId,
    answer: {
      text: answer,
    },
    submitted_at: new Date().toISOString(),
  };

  let error;

  if (existing) {
    ({ error } = await supabase
      .from("osce_answers")
      .update(payload)
      .eq("id", existing.id));
  } else {
    ({ error } = await supabase
      .from("osce_answers")
      .insert(payload));
  }

  if (error) throw error;
}

/* ============================================================
   REALTIME
============================================================ */

export function subscribeParticipant(callback) {
  return supabase
    .channel("participant-session")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "osce",
        table: "session_participants",
      },
      callback
    )
    .subscribe();
}