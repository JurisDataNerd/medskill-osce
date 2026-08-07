import { supabase } from "@/lib/supabaseClient";

/**
 * Get all question bank cases from osce schema
 */
export async function getCases() {
  const { data, error } = await supabase
    .schema("osce")
    .from("question_bank")
    .select(`
      *,
      question_bank_rubric_items (*),
      question_bank_auxiliary_configs (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cases from osce schema:", error);
    return [];
  }

  return (data || []).map((c) => ({
    id: c.id,
    title: c.title || c.case_title,
    case_title: c.case_title || c.title,
    system_organ: c.system_organ || "Umum",
    skdi_level: c.skdi_level || "4A",
    chief_complaint: c.scenario ? c.scenario.slice(0, 120) + "..." : "Tidak ada deskripsi.",
    scenario: c.scenario,
    participant_instructions: c.participant_instructions,
    examiner_instructions: c.examiner_instructions,
    answer_key_diagnosis: c.answer_key_diagnosis,
    answer_key_prescription: c.answer_key_prescription,
    checklist_items: c.question_bank_rubric_items || [],
    auxiliary_exam_configs: c.question_bank_auxiliary_configs || [],
  }));
}

/**
 * Get single question bank case by ID
 */
export async function getCaseById(caseId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("question_bank")
    .select(`
      *,
      question_bank_rubric_items (*),
      question_bank_auxiliary_configs (*)
    `)
    .eq("id", caseId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title || data.case_title,
    case_title: data.case_title || data.title,
    system_organ: data.system_organ || "Kardiovaskular",
    skdi_level: data.skdi_level || "4A",
    scenario: data.scenario || "",
    participant_instructions: data.participant_instructions || "",
    examiner_instructions: data.examiner_instructions || "",
    answer_key_diagnosis: data.answer_key_diagnosis || "",
    answer_key_prescription: data.answer_key_prescription || "",
    checklist_items: data.question_bank_rubric_items || [],
    auxiliary_exam_configs: data.question_bank_auxiliary_configs || [],
  };
}

/**
 * Create a new question bank case in osce.question_bank
 */
export async function createCase(payload) {
  const casePayload = {
    title: payload.title || payload.case_title || "Kasus Medis Baru",
    case_title: payload.case_title || payload.title || "Kasus Medis Baru",
    system_organ: payload.system_organ || "Kardiovaskular",
    skdi_level: payload.skdi_level || "4A",
    scenario: payload.scenario || payload.chief_complaint || "",
    participant_instructions: payload.participant_instructions || payload.anamnesis_instruction || "",
    examiner_instructions: payload.examiner_instructions || payload.physical_instruction || "",
    answer_key_diagnosis: payload.answer_key_diagnosis || null,
    answer_key_prescription: payload.answer_key_prescription || null,
  };

  const { data: newCase, error } = await supabase
    .schema("osce")
    .from("question_bank")
    .insert([casePayload])
    .select()
    .single();

  if (error) throw error;
  return newCase;
}

/**
 * Update an existing question bank case
 */
export async function updateCase(id, payload) {
  const casePayload = {
    title: payload.title || payload.case_title,
    case_title: payload.case_title || payload.title,
    system_organ: payload.system_organ,
    skdi_level: payload.skdi_level,
    scenario: payload.scenario || payload.chief_complaint,
    participant_instructions: payload.participant_instructions || payload.anamnesis_instruction,
    examiner_instructions: payload.examiner_instructions || payload.physical_instruction,
    answer_key_diagnosis: payload.answer_key_diagnosis,
    answer_key_prescription: payload.answer_key_prescription,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .schema("osce")
    .from("question_bank")
    .update(casePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a question bank case
 */
export async function deleteCase(id) {
  const { data, error } = await supabase
    .schema("osce")
    .from("question_bank")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

/* ---------- Sections & Rubric Helpers ---------- */

export async function getSections(caseId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("question_bank_rubric_items")
    .select("*")
    .eq("question_bank_id", caseId)
    .order("sort_order");

  if (error) return [];
  return data ?? [];
}

export async function createSection(payload) {
  const { data, error } = await supabase
    .schema("osce")
    .from("question_bank_rubric_items")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSection(id, payload) {
  const { data, error } = await supabase
    .schema("osce")
    .from("question_bank_rubric_items")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSection(id) {
  const { data, error } = await supabase
    .schema("osce")
    .from("question_bank_rubric_items")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

export async function getChecklist(caseId) {
  return getSections(caseId);
}

export async function createChecklist(payload) {
  return createSection(payload);
}

export async function updateChecklist(id, payload) {
  return updateSection(id, payload);
}

export async function deleteChecklist(id) {
  return deleteSection(id);
}