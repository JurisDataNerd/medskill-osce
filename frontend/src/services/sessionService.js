import { supabase } from "@/lib/supabaseClient";

/**
 * Fetch all OSCE sessions
 */
export async function fetchSessions() {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single session with its stations and rubric items
 */
export async function fetchSessionById(sessionId) {
  const { data: session, error: sessionErr } = await supabase
    .schema("osce")
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionErr) throw sessionErr;

  const { data: stations, error: stationErr } = await supabase
    .schema("osce")
    .from("stations")
    .select(`
      *,
      rubric_items (*),
      station_auxiliary_configs (*)
    `)
    .eq("session_id", sessionId)
    .order("sort_order", { ascending: true });

  if (stationErr) throw stationErr;

  const { data: examiners } = await supabase
    .schema("osce")
    .from("session_examiners")
    .select("*")
    .eq("session_id", sessionId);

  const formattedStations = (stations || []).map((st) => {
    const matchedExaminer = examiners?.find(
      (ex) => ex.assigned_station_number === st.station_number
    );
    const examinerName =
      st.assigned_examiner ||
      st.examiner_name ||
      matchedExaminer?.full_name ||
      null;
    const examinerSpecialty =
      st.examiner_specialty || matchedExaminer?.specialty || null;
    const examinerUserId =
      st.examiner_user_id || matchedExaminer?.user_id || null;

    return {
      ...st,
      assigned_examiner: examinerName,
      examiner_name: examinerName,
      examiner_specialty: examinerSpecialty,
      examiner_user_id: examinerUserId,
    };
  });

  return {
    ...session,
    stations: formattedStations,
  };
}

/**
 * Create a new OSCE session with initial stations
 */
export async function createSession(sessionPayload, stationsPayload = []) {
  const { data: newSession, error: sessionErr } = await supabase
    .schema("osce")
    .from("sessions")
    .insert([sessionPayload])
    .select()
    .single();

  if (sessionErr) throw sessionErr;

  if (stationsPayload.length > 0) {
    const formattedStations = stationsPayload.map((st, idx) => ({
      session_id: newSession.id,
      station_number: idx + 1,
      is_break: st.is_break || false,
      title: st.title || `Stase ${idx + 1}`,
      case_title: st.case_title || null,
      system_organ: st.system_organ || null,
      skdi_level: st.skdi_level || st.competency_level || null,
      scenario: st.scenario || null,
      participant_instructions: st.participant_instructions || st.participant_instruction || null,
      examiner_instructions: st.examiner_instructions || st.examiner_instruction || null,
      answer_key_diagnosis: st.answer_key_diagnosis || null,
      answer_key_prescription: st.answer_key_prescription || null,
      answer_key_physical_exam: st.answer_key_physical_exam || st.auxiliary_answer_key || null,
      question_bank_id: st.question_bank_id || st.case_id || null,
      assigned_examiner: st.assigned_examiner || st.examiner_name || null,
      examiner_name: st.assigned_examiner || st.examiner_name || null,
      examiner_specialty: st.examiner_specialty || null,
      examiner_user_id: st.examiner_user_id || null,
      sort_order: idx,
    }));

    const { data: createdStations, error: stationsErr } = await supabase
      .schema("osce")
      .from("stations")
      .insert(formattedStations)
      .select();

    if (stationsErr) console.warn("Error inserting stations:", stationsErr);

    // Save rubric_items and station_auxiliary_configs for each created station
    const stationsToProcess = createdStations || [];
    for (let i = 0; i < stationsToProcess.length; i++) {
      const createdSt = stationsToProcess[i];
      const origSt = stationsPayload[i] || {};
      await saveStationChildren(createdSt.id, origSt);
    }

    // Save examiner assignments to osce.session_examiners
    const examinersPayload = [];
    stationsPayload.forEach((st, idx) => {
      const examinerName = st.assigned_examiner || st.examiner_name;
      if (!st.is_break && examinerName) {
        examinersPayload.push({
          session_id: newSession.id,
          user_id: st.examiner_user_id || null,
          full_name: examinerName,
          specialty: st.examiner_specialty || st.system_organ || "Spesialis Medis",
          assigned_station_number: idx + 1,
          status: "active",
        });
      }
    });

    if (examinersPayload.length > 0) {
      await supabase
        .schema("osce")
        .from("session_examiners")
        .delete()
        .eq("session_id", newSession.id);

      const { error: examinersErr } = await supabase
        .schema("osce")
        .from("session_examiners")
        .insert(examinersPayload);

      if (examinersErr) {
        console.warn("Error inserting session examiners:", examinersErr);
      }
    }

    return {
      ...newSession,
      stations: createdStations || formattedStations,
    };
  }

  return newSession;
}

/**
 * Helper to save/update rubric_items and station_auxiliary_configs in Supabase
 */
export async function saveStationChildren(stationId, st) {
  if (!stationId) return;

  // 1. Handle Rubric Items
  const rubrics = st.rubric_items || st.checklist_items || st.checklist || [];
  if (Array.isArray(rubrics) && rubrics.length > 0) {
    try {
      await supabase.schema("osce").from("rubric_items").delete().eq("station_id", stationId);

      const rubricPayload = rubrics.map((r, idx) => {
        const descObj = typeof r.descriptors === "object" && r.descriptors ? r.descriptors : {};
        return {
          station_id: stationId,
          question_number: idx + 1,
          title: r.title || r.question || r.name || `Item Rubrik #${idx + 1}`,
          question: r.question || r.title || r.name || `Item Rubrik #${idx + 1}`,
          description: r.description || r.answer_key || "",
          answer_key: r.answer_key || r.description || "",
          max_points: Number(r.max_points) || 3,
          weight: Number(r.weight) || 1.0,
          competency_area: r.competency_area || r.competency || "KLINIS",
          description_score_0: r.description_score_0 || descObj?.[0] || descObj?.["0"] || "0: Tidak Dilakukan / Salah Total",
          description_score_1: r.description_score_1 || descObj?.[1] || descObj?.["1"] || "1: Minimal / Sebagian Salah",
          description_score_2: r.description_score_2 || descObj?.[2] || descObj?.["2"] || "2: Cukup / Memadai",
          description_score_3: r.description_score_3 || descObj?.[3] || descObj?.["3"] || "3: Sempurna & Lengkap",
          sort_order: idx,
        };
      });

      const { error: rErr } = await supabase.schema("osce").from("rubric_items").insert(rubricPayload);
      if (rErr) console.warn("Error inserting rubric_items to Supabase:", rErr);
    } catch (err) {
      console.warn("Notice saving rubric_items:", err);
    }
  }

  // 2. Handle Station Auxiliary Configs (Berkas Penunjang)
  const auxFiles = st.station_auxiliary_configs || st.auxiliary_exam_configs || st.auxiliary_files || st.auxiliaryFiles || [];
  if (Array.isArray(auxFiles) && auxFiles.length > 0) {
    try {
      await supabase.schema("osce").from("station_auxiliary_configs").delete().eq("station_id", stationId);

      const auxPayload = auxFiles.map((aux, idx) => ({
        station_id: stationId,
        title: aux.title || aux.name || `Berkas Penunjang #${idx + 1}`,
        category: aux.category || "Radiologi",
        file_url: aux.file_url || aux.imageUrl || "",
        report_text: aux.report_text || aux.reportText || "",
        is_unlocked_by_default: Boolean(aux.is_unlocked_by_default ?? aux.matched_key),
        sort_order: idx,
      }));

      const { error: auxErr } = await supabase.schema("osce").from("station_auxiliary_configs").insert(auxPayload);
      if (auxErr) console.warn("Error inserting station_auxiliary_configs to Supabase:", auxErr);
    } catch (err) {
      console.warn("Notice saving station_auxiliary_configs:", err);
    }
  }
}

/**
 * Update an existing OSCE session with its stations
 */
export async function updateSession(sessionId, sessionPayload, stationsPayload = []) {
  const { data: updatedSession, error: sessionErr } = await supabase
    .schema("osce")
    .from("sessions")
    .update({
      ...sessionPayload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (sessionErr) throw sessionErr;

  if (stationsPayload && stationsPayload.length > 0) {
    // Delete existing stations for this session to update cleanly
    await supabase
      .schema("osce")
      .from("stations")
      .delete()
      .eq("session_id", sessionId);

    const formattedStations = stationsPayload.map((st, idx) => ({
      session_id: sessionId,
      station_number: idx + 1,
      is_break: st.is_break || false,
      title: st.title || `Stase ${idx + 1}`,
      case_title: st.case_title || null,
      system_organ: st.system_organ || null,
      skdi_level: st.skdi_level || st.competency_level || null,
      scenario: st.scenario || null,
      participant_instructions: st.participant_instructions || st.participant_instruction || null,
      examiner_instructions: st.examiner_instructions || st.examiner_instruction || null,
      answer_key_diagnosis: st.answer_key_diagnosis || null,
      answer_key_prescription: st.answer_key_prescription || null,
      answer_key_physical_exam: st.answer_key_physical_exam || st.auxiliary_answer_key || null,
      question_bank_id: st.question_bank_id || st.case_id || null,
      assigned_examiner: st.assigned_examiner || st.examiner_name || null,
      examiner_name: st.assigned_examiner || st.examiner_name || null,
      examiner_specialty: st.examiner_specialty || null,
      examiner_user_id: st.examiner_user_id || null,
      sort_order: idx,
    }));

    const { data: createdStations, error: stationsErr } = await supabase
      .schema("osce")
      .from("stations")
      .insert(formattedStations)
      .select();

    if (stationsErr) console.warn("Error updating stations:", stationsErr);

    // Save rubric_items and station_auxiliary_configs for each created station
    const stationsToProcess = createdStations || [];
    for (let i = 0; i < stationsToProcess.length; i++) {
      const createdSt = stationsToProcess[i];
      const origSt = stationsPayload[i] || {};
      await saveStationChildren(createdSt.id, origSt);
    }

    // Save examiner assignments to osce.session_examiners
    const examinersPayload = [];
    stationsPayload.forEach((st, idx) => {
      const examinerName = st.assigned_examiner || st.examiner_name;
      if (!st.is_break && examinerName) {
        examinersPayload.push({
          session_id: sessionId,
          user_id: st.examiner_user_id || null,
          full_name: examinerName,
          specialty: st.examiner_specialty || st.system_organ || "Spesialis Medis",
          assigned_station_number: idx + 1,
          status: "active",
        });
      }
    });

    if (examinersPayload.length > 0) {
      await supabase
        .schema("osce")
        .from("session_examiners")
        .delete()
        .eq("session_id", sessionId);

      const { error: examinersErr } = await supabase
        .schema("osce")
        .from("session_examiners")
        .insert(examinersPayload);

      if (examinersErr) {
        console.warn("Error updating session examiners:", examinersErr);
      }
    }

    return {
      ...updatedSession,
      stations: createdStations || formattedStations,
    };
  }

  return updatedSession;
}

/**
 * Update session status (e.g. 'draft', 'scheduled', 'ongoing', 'paused', 'completed', 'archived')
 */
export async function updateSessionStatus(sessionId, status) {
  // Map UI values ('published', 'running') to valid Postgres ENUM values ('scheduled', 'ongoing')
  const validDbStatus =
    status === "published"
      ? "scheduled"
      : status === "running"
      ? "ongoing"
      : status;

  const updatePayload = { status: validDbStatus, updated_at: new Date().toISOString() };
  if (validDbStatus === "ongoing") updatePayload.started_at = new Date().toISOString();
  if (validDbStatus === "completed") updatePayload.finished_at = new Date().toISOString();

  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .update(updatePayload)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Fetch participants registered in a session
 */
export async function fetchSessionParticipants(sessionId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_participants")
    .select("*")
    .eq("session_id", sessionId)
    .order("wave_number", { ascending: true })
    .order("starting_station_number", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Fetch examiners assigned to a session
 */
export async function fetchSessionExaminers(sessionId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_examiners")
    .select("*")
    .eq("session_id", sessionId)
    .order("assigned_station_number", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Add or update session participant allocation
 */
export async function upsertSessionParticipant(participantPayload) {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_participants")
    .upsert([participantPayload], { onConflict: "session_id,user_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add or update session examiner allocation
 */
export async function upsertSessionExaminer(examinerPayload) {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_examiners")
    .upsert([examinerPayload], { onConflict: "session_id,user_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete session examiner assignment for a station
 */
export async function deleteSessionExaminer(sessionId, stationNumber) {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_examiners")
    .delete()
    .eq("session_id", sessionId)
    .eq("assigned_station_number", stationNumber)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Upload station auxiliary file to Supabase Storage osce-media bucket
 */
export async function uploadAuxiliaryImage(file, sessionId, stationId) {
  const fileExt = file.name.split(".").pop();
  const filePath = `sessions/${sessionId}/station_${stationId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("osce-media")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("osce-media")
    .getPublicUrl(filePath);

  return {
    publicUrl: publicUrlData.publicUrl,
    storagePath: filePath,
  };
}
