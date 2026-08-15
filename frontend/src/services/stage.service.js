import { supabase } from "@/lib/supabaseClient";
import { saveStationChildren } from "@/services/sessionService";

export async function getStages(sessionId) {
  const { data: stations, error } = await supabase
    .schema("osce")
    .from("stations")
    .select(`
      *,
      rubric_items (*),
      station_auxiliary_configs (*)
    `)
    .eq("session_id", sessionId)
    .order("station_number", { ascending: true });

  if (error) {
    console.warn("Could not fetch osce.stations:", error);
    return [];
  }

  return stations ?? [];
}

export async function getStageById(stageId) {
  if (!stageId) return null;

  const { data: st, error: stErr } = await supabase
    .schema("osce")
    .from("stations")
    .select(`
      *,
      osce_sessions:sessions (*),
      rubric_items (*),
      station_auxiliary_configs (*)
    `)
    .eq("id", stageId)
    .maybeSingle();

  if (stErr) console.warn("Error fetching station by id:", stErr);

  if (st) {
    return {
      ...st,
      participant_instruction: st.participant_instructions || st.participant_instruction || "",
      examiner_instruction: st.examiner_instructions || st.examiner_instruction || "",
      auxiliary_answer_key: st.answer_key_physical_exam || "",
      auxiliary_files: st.station_auxiliary_configs || [],
      gold_standard_keys: {
        wdx: st.answer_key_diagnosis || "",
        ddx: [],
        recipe: st.answer_key_prescription || "",
      },
      rubric_items: st.rubric_items || [],
    };
  }

  return null;
}

export async function createStage(sessionId, payload) {
  const { data, error } = await supabase
    .schema("osce")
    .from("stations")
    .insert({
      session_id: sessionId,
      station_number: payload.station_number,
      title: payload.title,
      scenario: payload.scenario || "",
      participant_instructions: payload.participant_instruction || "",
      examiner_instructions: payload.examiner_instruction || "",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStage(stageId, payload) {
  const { error } = await supabase
    .schema("osce")
    .from("stations")
    .update({
      station_number: payload.station_number,
      title: payload.title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stageId);

  if (error) throw error;
}

export async function deleteStage(stageId) {
  await supabase
    .schema("osce")
    .from("rubric_items")
    .delete()
    .eq("station_id", stageId);

  await supabase
    .schema("osce")
    .from("station_auxiliary_configs")
    .delete()
    .eq("station_id", stageId);

  const { error } = await supabase
    .schema("osce")
    .from("stations")
    .delete()
    .eq("id", stageId);

  if (error) throw error;
}

export async function updateStageQuestion(stageId, payload) {
  if (!stageId) return;

  const stationPayload = {
    case_title: payload.case_title || null,
    system_organ: payload.system_organ || null,
    skdi_level: payload.skdi_level || payload.competency_level || null,
    scenario: payload.scenario || null,
    participant_instructions: payload.participant_instruction || payload.participant_instructions || null,
    examiner_instructions: payload.examiner_instruction || payload.examiner_instructions || null,
    answer_key_diagnosis: payload.gold_standard_keys?.wdx || payload.answer_key_diagnosis || null,
    answer_key_prescription: payload.gold_standard_keys?.recipe || payload.answer_key_prescription || null,
    answer_key_physical_exam: payload.auxiliary_answer_key || payload.answer_key_physical_exam || null,
    assigned_examiner: payload.assigned_examiner || null,
    updated_at: new Date().toISOString(),
  };

  const { error: stErr } = await supabase
    .schema("osce")
    .from("stations")
    .update(stationPayload)
    .eq("id", stageId);

  if (stErr) {
    console.warn("Notice updating osce.stations:", stErr.message);
  }

  // Save rubric items and auxiliary configs to Supabase
  await saveStationChildren(stageId, {
    rubric_items: payload.rubric_items || [],
    station_auxiliary_configs: payload.auxiliary_files || payload.station_auxiliary_configs || [],
  });
}