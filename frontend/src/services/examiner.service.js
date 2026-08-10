import { supabase } from "@/lib/supabaseClient";

/* ============================================================
   ACTIVE SESSION
============================================================ */

export async function getActiveSession() {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .select("*")
    .in("status", ["running", "ongoing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;

  return data;
}

/* ============================================================
   MY STAGE
============================================================ */

export async function getMyStage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member, error } = await supabase
    .schema("osce")
    .from("session_examiners")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !member) return null;

  const { data: stage } = await supabase
    .schema("osce")
    .from("stations")
    .select("*")
    .eq("session_id", member.session_id)
    .eq("station_number", member.assigned_station_number || 1)
    .maybeSingle();

  return stage;
}

/* ============================================================
   STAGES
============================================================ */

export async function getStages(sessionId) {
  const { data, error } = await supabase
    .from("osce_stages")
    .select("*")
    .eq("session_id", sessionId)
    .order("station_number");

  if (error) throw error;

  return data ?? [];
}

/* ============================================================
   SINGLE STAGE
============================================================ */

export async function getStage(stageId) {
  const { data, error } = await supabase
    .from("osce_stages")
    .select(`
      *,
      session:osce_sessions(*)
    `)
    .eq("id", stageId)
    .single();

  if (error) throw error;

  return data;
}

/* ============================================================
   CLAIM STAGE
============================================================ */

export async function claimStage(stageId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: stage, error: stageError } = await supabase
    .schema("osce")
    .from("stations")
    .select("*")
    .eq("id", stageId)
    .maybeSingle();

  if (stageError || !stage) return null;

  const { data: existing } = await supabase
    .schema("osce")
    .from("session_examiners")
    .select("id")
    .eq("session_id", stage.session_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .schema("osce")
      .from("session_examiners")
      .update({
        assigned_station_number: stage.station_number,
      })
      .eq("id", existing.id);

    if (error) console.warn(error.message);
  } else {
    const { error } = await supabase
      .schema("osce")
      .from("session_examiners")
      .insert({
        session_id: stage.session_id,
        user_id: user.id,
        assigned_station_number: stage.station_number,
      });

    if (error) console.warn(error.message);
  }

  return stage;
}

/* ============================================================
   RELEASE STAGE
============================================================ */

export async function releaseStage(stageId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: stage, error: stageError } = await supabase
    .schema("osce")
    .from("stations")
    .select("session_id,station_number")
    .eq("id", stageId)
    .maybeSingle();

  if (stageError || !stage) return;

  const { error } = await supabase
    .schema("osce")
    .from("session_examiners")
    .delete()
    .eq("session_id", stage.session_id)
    .eq("assigned_station_number", stage.station_number)
    .eq("user_id", user.id);

  if (error) console.warn(error.message);
}

/* ============================================================
   PARTICIPANTS
============================================================ */

export async function getParticipants(stageId) {
  const { data: stage, error: stageError } = await supabase
    .from("osce_stages")
    .select("station_number")
    .eq("id", stageId)
    .single();

  if (stageError) throw stageError;

  const { data, error } = await supabase
    .from("osce_answers")
    .select(`
      *,
      participant:profiles!participant_profile_id(
        id,
        full_name,
        email
      )
    `)
    .eq("station_number", stage.station_number)
    .order("submitted_at", {
      ascending: true,
    });

  if (error) throw error;

  return data ?? [];
}

/* ============================================================
   SINGLE ANSWER
============================================================ */

export async function getAnswer(answerId) {
  const { data, error } = await supabase
    .from("osce_answers")
    .select(`
      *,
      participant:profiles!participant_profile_id(
        id,
        full_name,
        email
      )
    `)
    .eq("id", answerId)
    .single();

  if (error) throw error;

  return data;
}

export const getAnswerById = getAnswer;

/* ============================================================
   SAVE FEEDBACK
============================================================ */

export async function saveFeedback(answerId, payload) {
  const { error } = await supabase
    .from("osce_answers")
    .update({
      anamnesis: payload.anamnesis,
      pemeriksaan_fisik: payload.pemeriksaan_fisik,
      pemeriksaan_penunjang: payload.pemeriksaan_penunjang,
      diagnosis: payload.diagnosis,
      mentor_feedback: payload.mentor_feedback,
    })
    .eq("id", answerId);

  if (error) throw error;
}

/* ============================================================
   REALTIME STAGE
============================================================ */

export function subscribeStage(stageId, callback) {
  const channel = supabase
    .channel(`examiner-stage-${stageId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "osce_answers",
      },
      async () => {
        callback();
      }
    )
    .subscribe();

  return channel;
}