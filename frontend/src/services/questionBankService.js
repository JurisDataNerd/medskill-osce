import { supabase } from "@/lib/supabaseClient";

/**
 * Fetch all standardized cases in the Question Bank library
 */
export async function fetchQuestionBankCatalog() {
  try {
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
      console.warn("Schema 'osce.question_bank' query notice, trying fallback:", error.message);
      const { data: fallbackData } = await supabase
        .from("cases")
        .select("*");
      return fallbackData ?? [];
    }

    return data ?? [];
  } catch (err) {
    console.error("Error fetching question bank catalog:", err);
    return [];
  }
}

/**
 * Fetch a single Question Bank case by ID
 */
export async function fetchQuestionBankCaseById(caseId) {
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
  return data;
}

/**
 * Apply/Import a Question Bank case to a specific station
 */
export async function importCaseToStation(stationId, questionBankCase) {
  // 1. Update Station Content
  const { data: updatedStation, error: stationErr } = await supabase
    .schema("osce")
    .from("stations")
    .update({
      case_title: questionBankCase.case_title,
      system_organ: questionBankCase.system_organ,
      skdi_level: questionBankCase.skdi_level,
      scenario: questionBankCase.scenario,
      participant_instructions: questionBankCase.participant_instructions,
      examiner_instructions: questionBankCase.examiner_instructions,
      answer_key_wdx: questionBankCase.answer_key_wdx || questionBankCase.wdx || questionBankCase.gold_standard_keys?.wdx || null,
      answer_key_ddx1: questionBankCase.answer_key_ddx1 || (Array.isArray(questionBankCase.gold_standard_keys?.ddx) ? questionBankCase.gold_standard_keys.ddx[0] : null) || null,
      answer_key_ddx2: questionBankCase.answer_key_ddx2 || (Array.isArray(questionBankCase.gold_standard_keys?.ddx) ? questionBankCase.gold_standard_keys.ddx[1] : null) || null,
      answer_key_ddx3: questionBankCase.answer_key_ddx3 || (Array.isArray(questionBankCase.gold_standard_keys?.ddx) ? questionBankCase.gold_standard_keys.ddx[2] : null) || null,
      answer_key_ddx: questionBankCase.answer_key_ddx || (Array.isArray(questionBankCase.gold_standard_keys?.ddx) ? questionBankCase.gold_standard_keys.ddx.join(", ") : null) || null,
      answer_key_diagnosis: questionBankCase.answer_key_diagnosis || null,
      answer_key_prescription: questionBankCase.answer_key_prescription || null,
      question_bank_id: questionBankCase.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stationId)
    .select()
    .single();

  if (stationErr) throw stationErr;

  // 2. Clear old rubric items & insert new ones
  await supabase.schema("osce").from("rubric_items").delete().eq("station_id", stationId);

  const rubricItemsToInsert = (questionBankCase.question_bank_rubric_items || []).map((item, idx) => ({
    station_id: stationId,
    question_number: idx + 1,
    question: item.question,
    answer_key: item.answer_key,
    max_points: item.max_points || 3,
    weight: item.weight || 1.0,
    competency_area: item.competency_area || "ANAMNESIS",
    descriptors: item.descriptors || {},
    sort_order: idx,
  }));

  if (rubricItemsToInsert.length > 0) {
    const { error: rubricErr } = await supabase
      .schema("osce")
      .from("rubric_items")
      .insert(rubricItemsToInsert);

    if (rubricErr) throw rubricErr;
  }

  // 3. Clear old auxiliary configs & insert new ones
  await supabase.schema("osce").from("station_auxiliary_configs").delete().eq("station_id", stationId);

  const auxConfigsToInsert = (questionBankCase.question_bank_auxiliary_configs || []).map((cfg) => ({
    station_id: stationId,
    item_id: cfg.item_id,
    name: cfg.name,
    category: cfg.category,
    image_storage_path: cfg.image_storage_path || null,
    report_text: cfg.report_text || null,
  }));

  if (auxConfigsToInsert.length > 0) {
    const { error: auxErr } = await supabase
      .schema("osce")
      .from("station_auxiliary_configs")
      .insert(auxConfigsToInsert);

    if (auxErr) throw auxErr;
  }

  return updatedStation;
}
