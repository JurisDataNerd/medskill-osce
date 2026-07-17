import { supabase } from "@/supabase/client";

export async function getStages(sessionId) {
  const { data, error } = await supabase
    .from("osce_stages")
    .select(`
      *,
      osce_stage_questions(
        id,
        duration_minutes
      )
    `)
    .eq("session_id", sessionId)
    .order("station_number");

  if (error) throw error;

  return data ?? [];
}

export async function getStageById(stageId) {
  const { data, error } = await supabase
    .from("osce_stages")
    .select(`
      *,
      osce_sessions(
        id,
        title
      ),
      osce_stage_questions(*)
    `)
    .eq("id", stageId)
    .single();

  if (error) throw error;

  return data;
}

export async function createStage(sessionId, payload) {
  const { data, error } = await supabase
    .from("osce_stages")
    .insert({
      session_id: sessionId,
      station_number: payload.station_number,
      title: payload.title,
    })
    .select()
    .single();

  if (error) throw error;

  const { error: questionError } =
    await supabase
      .from("osce_stage_questions")
      .insert({
        stage_id: data.id,
        scenario: "",
        participant_instruction: "",
        examiner_instruction: "",
        duration_minutes: 10,
        checklist: [],
      });

  if (questionError) throw questionError;

  return data;
}

export async function updateStage(stageId, payload) {
  const { error } = await supabase
    .from("osce_stages")
    .update({
      station_number: payload.station_number,
      title: payload.title,
    })
    .eq("id", stageId);

  if (error) throw error;
}

export async function deleteStage(stageId) {
  await supabase
    .from("osce_stage_questions")
    .delete()
    .eq("stage_id", stageId);

  const { error } = await supabase
    .from("osce_stages")
    .delete()
    .eq("id", stageId);

  if (error) throw error;
}

export async function updateStageQuestion(
  stageId,
  payload
) {
  const { data: exist } =
    await supabase
      .from("osce_stage_questions")
      .select("id")
      .eq("stage_id", stageId)
      .maybeSingle();

  if (!exist) {
    const { error } = await supabase
      .from("osce_stage_questions")
      .insert({
        stage_id: stageId,
        ...payload,
      });

    if (error) throw error;

    return;
  }

  const { error } = await supabase
    .from("osce_stage_questions")
    .update(payload)
    .eq("stage_id", stageId);

  if (error) throw error;
}