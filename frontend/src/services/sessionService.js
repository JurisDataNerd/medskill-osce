import { supabase } from "@/lib/supabaseClient";

/**
 * Fetch all OSCE sessions
 */
export async function fetchSessions() {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .select(`
      *,
      session_participants (id, full_name, user_id, starting_station_number, wave_number, status),
      session_examiners (id, full_name, specialty, assigned_station_number, status)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((sess) => ({
    ...sess,
    registered_participants: sess.session_participants?.length || 0,
    total_examiners: sess.session_examiners?.length || 0,
  }));
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
      scenario: st.scenario ?? null,
      participant_instructions: st.participant_instructions ?? st.participant_instruction ?? null,
      examiner_instructions: st.examiner_instructions ?? st.examiner_instruction ?? null,
      answer_key_diagnosis: st.answer_key_diagnosis || (st.answer_key_wdx ? [st.answer_key_wdx ? `WDx: ${st.answer_key_wdx}` : "", st.answer_key_ddx1 ? `DDx 1: ${st.answer_key_ddx1}` : "", st.answer_key_ddx2 ? `DDx 2: ${st.answer_key_ddx2}` : ""].filter(Boolean).join("\n") : null),
      answer_key_prescription: st.answer_key_prescription || null,
      question_bank_id: st.question_bank_id || st.case_id || null,
      assigned_examiner: st.assigned_examiner || st.examiner_name || null,
      examiner_name: st.assigned_examiner || st.examiner_name || null,
      examiner_specialty: st.examiner_specialty || null,
      examiner_user_id: st.examiner_user_id || null,
      sort_order: idx,
    }));

    console.log("[sessionService] createSession stations payload:", JSON.stringify(formattedStations.map(s => ({
      title: s.title,
      participant_instructions: s.participant_instructions?.substring(0, 50),
      examiner_instructions: s.examiner_instructions?.substring(0, 50),
      scenario: s.scenario?.substring(0, 50),
    })), null, 2));

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

  // Valid osce.competency_area enum values
  const VALID_COMPETENCY = [
    "ANAMNESIS", "PHYSICAL_EXAM", "AUXILIARY_EXAM", "DIAGNOSIS_DDX",
    "PHARMACOTHERAPY", "NON_PHARMACOTHERAPY", "COMMUNICATION", "PROFESSIONALISM",
  ];

  function mapCompetency(raw) {
    if (!raw) return "ANAMNESIS";
    const upper = String(raw).toUpperCase().replace(/\s+/g, "_");
    // Direct match
    if (VALID_COMPETENCY.includes(upper)) return upper;
    // Fuzzy match
    if (upper.includes("ANAMN")) return "ANAMNESIS";
    if (upper.includes("FISIK") || upper.includes("PHYSICAL")) return "PHYSICAL_EXAM";
    if (upper.includes("PENUNJANG") || upper.includes("AUXILIARY") || upper.includes("RADIOLOGI") || upper.includes("EKG") || upper.includes("LAB")) return "AUXILIARY_EXAM";
    if (upper.includes("DIAGNOS") || upper.includes("DDX")) return "DIAGNOSIS_DDX";
    if (upper.includes("RESEP") || upper.includes("PHARMA") || upper.includes("FARMAKO") || upper.includes("OBAT")) return "PHARMACOTHERAPY";
    if (upper.includes("NON_PHARMA") || upper.includes("EDUKASI") || upper.includes("NON_FARMAKO")) return "NON_PHARMACOTHERAPY";
    if (upper.includes("KOMUNIKASI") || upper.includes("COMMUNIC")) return "COMMUNICATION";
    if (upper.includes("PROFES") || upper.includes("ETIK")) return "PROFESSIONALISM";
    return "ANAMNESIS";
  }

  // 1. Handle Rubric Items → osce.rubric_items
  // DB columns: station_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors (JSONB), sort_order
  const rubrics = st.rubric_items || st.checklist_items || st.checklist || [];
  if (Array.isArray(rubrics) && rubrics.length > 0) {
    try {
      await supabase.schema("osce").from("rubric_items").delete().eq("station_id", stationId);

      const rubricPayload = rubrics.map((r, idx) => {
        // Build descriptors JSONB from various input formats
        const existingDesc = typeof r.descriptors === "object" && r.descriptors ? r.descriptors : {};
        const descriptors = {
          score_0: existingDesc.score_0 || existingDesc["0"] || existingDesc[0] || "",
          score_1: existingDesc.score_1 || existingDesc["1"] || existingDesc[1] || "",
          score_2: existingDesc.score_2 || existingDesc["2"] || existingDesc[2] || "",
          score_3: existingDesc.score_3 || existingDesc["3"] || existingDesc[3] || "",
        };

        return {
          station_id: stationId,
          question_number: idx + 1,
          question: r.question || r.title || r.name || `Item Rubrik #${idx + 1}`,
          answer_key: r.answer_key || r.description || "",
          max_points: Number(r.max_points) || 3,
          weight: Number(r.weight) || 1.0,
          competency_area: mapCompetency(r.competency_area || r.competency),
          descriptors,
          sort_order: idx,
        };
      });

      const { error: rErr } = await supabase.schema("osce").from("rubric_items").insert(rubricPayload);
      if (rErr) console.warn("Error inserting rubric_items to Supabase:", rErr);
    } catch (err) {
      console.warn("Notice saving rubric_items:", err);
    }
  }

  // 2. Handle Station Auxiliary Configs (Berkas Penunjang) → osce.station_auxiliary_configs
  // DB columns: station_id, item_id, name, category, image_url, image_storage_path, report_text
  const auxFiles = st.station_auxiliary_configs || st.auxiliary_exam_configs || st.auxiliary_files || st.auxiliaryFiles || [];
  try {
    await supabase.schema("osce").from("station_auxiliary_configs").delete().eq("station_id", stationId);

    if (Array.isArray(auxFiles) && auxFiles.length > 0) {
      const auxPayload = auxFiles.map((aux, idx) => ({
        station_id: stationId,
        item_id: aux.item_id || aux.itemId || aux.id || `aux-${idx + 1}`,
        name: aux.name || aux.title || `Berkas Penunjang #${idx + 1}`,
        category: aux.category || "RADIOLOGI",
        image_url: aux.image_url || aux.imageUrl || aux.file_url || null,
        image_storage_path: aux.image_storage_path || null,
        report_text: aux.report_text || aux.reportText || "",
      }));

      const { error: auxErr } = await supabase.schema("osce").from("station_auxiliary_configs").insert(auxPayload);
      if (auxErr) console.warn("Error inserting station_auxiliary_configs to Supabase:", auxErr);
    }
  } catch (err) {
    console.warn("Notice saving station_auxiliary_configs:", err);
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
      scenario: st.scenario ?? null,
      participant_instructions: st.participant_instructions ?? st.participant_instruction ?? null,
      examiner_instructions: st.examiner_instructions ?? st.examiner_instruction ?? null,
      answer_key_diagnosis: st.answer_key_diagnosis || (st.answer_key_wdx ? [st.answer_key_wdx ? `WDx: ${st.answer_key_wdx}` : "", st.answer_key_ddx1 ? `DDx 1: ${st.answer_key_ddx1}` : "", st.answer_key_ddx2 ? `DDx 2: ${st.answer_key_ddx2}` : ""].filter(Boolean).join("\n") : null),
      answer_key_prescription: st.answer_key_prescription || null,
      question_bank_id: st.question_bank_id || st.case_id || null,
      assigned_examiner: st.assigned_examiner || st.examiner_name || null,
      examiner_name: st.assigned_examiner || st.examiner_name || null,
      examiner_specialty: st.examiner_specialty || null,
      examiner_user_id: st.examiner_user_id || null,
      sort_order: idx,
    }));

    console.log("[sessionService] updateSession stations payload:", JSON.stringify(formattedStations.map(s => ({
      title: s.title,
      participant_instructions: s.participant_instructions?.substring(0, 50),
      examiner_instructions: s.examiner_instructions?.substring(0, 50),
      scenario: s.scenario?.substring(0, 50),
    })), null, 2));

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
 * Duplicate an existing OSCE session with all stations, rubric items, auxiliary files, and examiners
 * (Participants are excluded from duplication as requested)
 */
export async function duplicateSession(sessionId) {
  const fullSession = await fetchSessionById(sessionId);
  if (!fullSession) throw new Error("Sesi asal tidak ditemukan.");

  const dateStr = new Date().toISOString().split("T")[0];

  // Strictly match Postgres osce.sessions table schema columns
  const newSessionPayload = {
    title: `Salinan ${fullSession.title}`,
    description: fullSession.description ? `(Salinan) ${fullSession.description}` : "Salinan Sesi OSCE Ujian",
    location_building: fullSession.location_building || fullSession.location || "Gedung Skill Lab Kedokteran",
    session_date: dateStr,
    start_time: fullSession.start_time || "08:00:00",
    end_time: fullSession.end_time || "12:00:00",
    status: "scheduled",
    exam_type: fullSession.exam_type || "regular",
    track_label: fullSession.track_label || "A",
    total_stations: fullSession.total_stations || fullSession.stations?.length || 6,
    total_rounds: fullSession.total_rounds || fullSession.total_stations || fullSession.stations?.length || 6,
    max_participants_per_wave: fullSession.max_participants_per_wave || 8,
    station_duration_minutes: fullSession.station_duration_minutes || 12,
    break_duration_minutes: fullSession.break_duration_minutes || 2,
    transition_duration_minutes: fullSession.transition_duration_minutes || 1,
    reading_duration_minutes: fullSession.reading_duration_minutes || 1,
  };

  // Creates session, stations, rubric_items, auxiliary_configs, and examiners (0 participants)
  const createdSession = await createSession(newSessionPayload, fullSession.stations || []);

  // Initialize clean timer state for the new duplicated session
  if (createdSession?.id) {
    const { error: tErr } = await supabase
      .schema("osce")
      .from("session_timer_state")
      .upsert(
        [{
          session_id: createdSession.id,
          phase: "standby",
          target_end_time: null,
          paused_remaining_ms: null,
          round_number: 1,
          wave_number: 1,
          updated_at: new Date().toISOString(),
        }],
        { onConflict: "session_id" }
      );
    if (tErr) console.warn("Notice initializing timer state during duplication:", tErr);
  }

  return createdSession;
}
