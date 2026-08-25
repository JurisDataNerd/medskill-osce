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
    ...c,
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
    answer_key_ddx: c.answer_key_ddx,
    gold_standard_keys: c.gold_standard_keys,
    auxiliary_answer_key: c.auxiliary_answer_key,
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
    ...data,
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
    answer_key_ddx: data.answer_key_ddx || "",
    gold_standard_keys: data.gold_standard_keys || null,
    auxiliary_answer_key: data.auxiliary_answer_key || "",
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

/**
 * Export all question bank cases to JSON file
 */
export async function exportQuestionBankToJson() {
  const cases = await getCases();
  const exportData = cases.map((c) => ({
    title: c.title || c.case_title,
    system_organ: c.system_organ || "Kardiovaskular",
    skdi_level: c.skdi_level || "4A (Tuntas Mandiri)",
    scenario: c.scenario || "",
    participant_instructions: c.participant_instructions || "",
    examiner_instructions: c.examiner_instructions || "",
    wdx: c.gold_standard_keys?.wdx || c.answer_key_diagnosis || "",
    ddx: Array.isArray(c.gold_standard_keys?.ddx) ? c.gold_standard_keys.ddx : (c.answer_key_ddx ? [c.answer_key_ddx] : []),
    prescription: c.gold_standard_keys?.recipe || c.answer_key_prescription || "",
    auxiliary_answer_key: c.auxiliary_answer_key || "",
    auxiliary_configs: (c.auxiliary_exam_configs || []).map((a) => ({
      name: a.name || "Berkas Penunjang",
      category: a.category || "PEMERIKSAAN",
      matched_key: a.matched_key !== false,
      imageUrl: a.image_storage_path || a.imageUrl || "",
      reportText: a.report_text || a.reportText || "",
    })),
    rubric_items: (c.checklist_items || []).map((r, rIdx) => ({
      question_number: r.question_number || rIdx + 1,
      question: r.question || "",
      answer_key: r.answer_key || "",
      weight: Number(r.weight) || 1.0,
      max_points: Number(r.max_points) || 3,
      competency_area: r.competency_area || "ANAMNESIS",
      descriptors: r.descriptors || {
        score_0: "",
        score_1: "",
        score_2: "",
        score_3: "",
      },
    })),
  }));

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `praxis_bank_soal_export_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return exportData;
}

/**
 * Download sample JSON template for bulk import
 */
export function downloadQuestionBankTemplateJson() {
  const template = [
    {
      title: "STEMI Anteroseptal Akut",
      system_organ: "Kardiovaskular",
      skdi_level: "4A (Tuntas Mandiri)",
      scenario: "Laki-laki 54 tahun datang ke IGD dengan keluhan nyeri dada kiri rasa tertekan menjalar ke rahang dan lengan kiri sejak 2 jam lalu disertai keringat dingin dan mual.",
      participant_instructions: "1. Lakukan anamnesis terarah\n2. Lakukan pemeriksaan fisik kardiovaskular\n3. Ajukan pemeriksaan penunjang yang berindikasi\n4. Tentukan diagnosis kerja (WDx), diagnosis banding (DDx), dan tuliskan resep medis awal",
      examiner_instructions: "Amati keterampilan anamnesis PQRST faktor risiko, interpretasi EKG ST elevasi V1-V4, dan ketepatan dosis loading DAPT (Aspirin + Clopidogrel).",
      wdx: "STEMI Anteroseptal Akut (ICD-10: I21.0)",
      ddx: [
        "NSTEMI",
        "Angina Pektoris Tidak Stabil (UAP)",
        "Perikarditis Akut"
      ],
      prescription: "R/ Aspirin tab 80mg No. IV S 1 dd tab IV (chewed)\nR/ Clopidogrel tab 75mg No. IV S 1 dd tab IV\nR/ ISDN tab 5mg No. III S 1 dd tab I sublingual",
      auxiliary_answer_key: "EKG 12 Lead: ST Elevasi pada V1-V4; Enzim Jantung: Troponin T Kualitatif Positif",
      auxiliary_configs: [
        {
          name: "EKG 12 Lead",
          category: "EKG",
          matched_key: true,
          imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
          reportText: "Irama Sinus, Heart Rate 90 bpm, ST Elevasi >2mm pada Lead V1-V4"
        },
        {
          name: "Enzim Jantung (Troponin T / I)",
          category: "Laboratorium",
          matched_key: true,
          imageUrl: "",
          reportText: "Troponin T Kualitatif: Positif (>0.1 ng/mL)"
        }
      ],
      rubric_items: [
        {
          question: "Komunikasi & Membina Sambung Rasa",
          competency_area: "COMMUNICATION",
          weight: 2.0,
          max_points: 3,
          answer_key: "Menyapa pasien, memperkenalkan diri, konfirmasi identitas, dan empati pada rasa nyeri dada",
          descriptors: {
            score_0: "Tidak menyapa dan tidak memperkenalkan diri",
            score_1: "Menyapa namun tidak konfirmasi identitas dan tidak empati",
            score_2: "Menyapa, memperkenalkan diri dan empati cukup baik",
            score_3: "Sempurna: Komunikasi terapeutik, empati aktif, dan menenangkan pasien"
          }
        },
        {
          question: "Anamnesis Terarah & Riwayat Penyakit Sekarang (PQRST)",
          competency_area: "ANAMNESIS",
          weight: 3.0,
          max_points: 3,
          answer_key: "Eksplorasi nyeri dada iskemik >20 menit dan faktor risiko kardiovaskular",
          descriptors: {
            score_0: "Tidak melakukan anamnesis nyeri dada",
            score_1: "Anamnesis sangat minimal (hanya lokasi)",
            score_2: "Anamnesis PQRST cukup lengkap namun faktor risiko terlewat",
            score_3: "Sempurna: Eksplorasi PQRST lengkap, onset, penjalaran, serta faktor risiko PJK"
          }
        },
        {
          question: "Diagnosis Kerja (WDx) & Diagnosis Banding (DDx)",
          competency_area: "DIAGNOSIS_DDX",
          weight: 4.0,
          max_points: 3,
          answer_key: "WDx: STEMI Anteroseptal; DDx: NSTEMI, UAP",
          descriptors: {
            score_0: "Diagnosis keliru total",
            score_1: "Diagnosis menyebutkan PJK tanpa klasifikasi spesifik",
            score_2: "WDx tepat (STEMI) namun DDx tidak disebutkan",
            score_3: "Sempurna: WDx STEMI Anteroseptal dan minimal 2 DDx tepat"
          }
        },
        {
          question: "Tatalaksana Farmakoterapi & Resep Medis",
          competency_area: "PHARMACOTHERAPY",
          weight: 4.0,
          max_points: 3,
          answer_key: "Resep loading dose Aspirin 320mg, Clopidogrel 300mg, ISDN 5mg SL",
          descriptors: {
            score_0: "Resep salah total atau tidak meresepkan",
            score_1: "Hanya meresepkan 1 jenis obat atau dosis kurang tepat",
            score_2: "Meresepkan DAPT namun aturan pakai/signa kurang lengkap",
            score_3: "Sempurna: Resep DAPT loading dose lengkap, tepat dosis, signa dan format baku"
          }
        }
      ]
    }
  ];

  const jsonStr = JSON.stringify(template, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "praxis_template_bank_soal.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Bulk import question bank cases to Supabase
 */
export async function importQuestionBankBulk(casesArray) {
  if (!Array.isArray(casesArray) || casesArray.length === 0) {
    throw new Error("File JSON tidak berisi array kasus yang valid.");
  }

  const mapToValidCompetency = (comp) => {
    if (!comp) return "ANAMNESIS";
    const upper = String(comp).toUpperCase();
    if (upper.includes("ANAMNES")) return "ANAMNESIS";
    if (upper.includes("FISIK") || upper.includes("PHYSICAL")) return "PHYSICAL_EXAM";
    if (upper.includes("PENUNJANG") || upper.includes("AUXILIARY") || upper.includes("LAB") || upper.includes("RADIO")) return "AUXILIARY_EXAM";
    if (upper.includes("DIAGNOS") || upper.includes("DDX") || upper.includes("WDX")) return "DIAGNOSIS_DDX";
    if (upper.includes("FARMAKO") || upper.includes("RESEP") || upper.includes("OBAT") || upper.includes("PHARMACO")) return "PHARMACOTHERAPY";
    if (upper.includes("NON_FARMAKO") || upper.includes("EDUKASI") || upper.includes("NON_PHARMACO")) return "NON_PHARMACOTHERAPY";
    if (upper.includes("KOMUNIKASI") || upper.includes("COMMUNIC") || upper.includes("SAMBUNG")) return "COMMUNICATION";
    if (upper.includes("PROFES") || upper.includes("ETIK") || upper.includes("MORAL")) return "PROFESSIONALISM";
    return "ANAMNESIS";
  };

  let successCount = 0;
  const errors = [];

  for (let i = 0; i < casesArray.length; i++) {
    const c = casesArray[i];
    try {
      const title = c.title || c.case_title || `Kasus Impor #${i + 1}`;
      const wdxVal = c.wdx || c.answer_key_diagnosis || "";
      const ddxArr = Array.isArray(c.ddx) ? c.ddx : (c.answer_key_ddx ? [c.answer_key_ddx] : []);
      const recipeVal = c.prescription || c.answer_key_prescription || "";

      const casePayload = {
        title,
        case_title: title,
        system_organ: c.system_organ || "Kardiovaskular",
        skdi_level: c.skdi_level || "4A (Tuntas Mandiri)",
        scenario: c.scenario || c.chief_complaint || "",
        participant_instructions: c.participant_instructions || "",
        examiner_instructions: c.examiner_instructions || "",
        answer_key_diagnosis: wdxVal,
        answer_key_prescription: recipeVal,
        answer_key_ddx: ddxArr.filter(Boolean).join(", "),
        auxiliary_answer_key: c.auxiliary_answer_key || "",
        gold_standard_keys: {
          wdx: wdxVal,
          ddx: ddxArr.filter(Boolean),
          recipe: recipeVal,
        },
      };

      const { data: newCase, error: caseErr } = await supabase
        .schema("osce")
        .from("question_bank")
        .insert([casePayload])
        .select()
        .single();

      if (caseErr) throw caseErr;

      const caseId = newCase.id;

      // 1. Insert rubric items
      const rawRubrics = c.rubric_items || c.checklist_items || [];
      if (rawRubrics.length > 0) {
        const formattedRubrics = rawRubrics.map((r, rIdx) => ({
          question_bank_id: caseId,
          question_number: r.question_number || rIdx + 1,
          question: r.question || `Item Penilaian #${rIdx + 1}`,
          answer_key: r.answer_key || "",
          max_points: Number(r.max_points) || 3,
          weight: Number(r.weight) || 1.0,
          competency_area: mapToValidCompetency(r.competency_area || r.competency),
          descriptors: {
            score_0: r.descriptors?.score_0 || r.descriptors?.[0] || "",
            score_1: r.descriptors?.score_1 || r.descriptors?.[1] || "",
            score_2: r.descriptors?.score_2 || r.descriptors?.[2] || "",
            score_3: r.descriptors?.score_3 || r.descriptors?.[3] || "",
          },
          sort_order: rIdx,
        }));

        await supabase.schema("osce").from("question_bank_rubric_items").insert(formattedRubrics);
      }

      // 2. Insert auxiliary configs
      const rawAux = c.auxiliary_configs || c.auxiliary_exam_configs || [];
      if (rawAux.length > 0) {
        const formattedAux = rawAux.map((a, aIdx) => ({
          question_bank_id: caseId,
          item_id: a.itemId || a.item_id || `aux-${aIdx + 1}`,
          name: a.name || a.title || "Berkas Penunjang",
          category: a.category || "PEMERIKSAAN",
          image_storage_path: a.imageUrl || a.image_url || a.image_storage_path || null,
          report_text: a.reportText || a.report_text || null,
          matched_key: a.matched_key !== false,
          sort_order: aIdx,
        }));

        await supabase.schema("osce").from("question_bank_auxiliary_configs").insert(formattedAux);
      }

      successCount++;
    } catch (err) {
      console.error(`Error importing case index ${i}:`, err);
      errors.push({ index: i + 1, title: c.title || `Item #${i + 1}`, error: err.message });
    }
  }

  return {
    total: casesArray.length,
    successCount,
    failedCount: errors.length,
    errors,
  };
}