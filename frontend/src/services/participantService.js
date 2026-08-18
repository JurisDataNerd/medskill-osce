import { supabase } from "@/lib/supabaseClient";

/**
 * Register participant for a session
 */
export async function registerParticipant(sessionId, userId, nim, fullName, waveNumber = 1, startingStationNumber = 1) {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_participants")
    .insert([
      {
        session_id: sessionId,
        user_id: userId,
        nim,
        full_name: fullName,
        wave_number: waveNumber,
        starting_station_number: startingStationNumber,
        status: "registered",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Save / auto-save participant progress for current station step (4-page flow)
 */
export async function saveParticipantStepAnswer(answerPayload) {
  const {
    session_id,
    station_id,
    participant_id,
    rotation_round,
    current_step,
    anamnesis_notes,
    physical_exam_notes,
    requested_auxiliary_json,
    working_diagnosis,
    differential_dx_1,
    differential_dx_2,
    differential_dx_3,
    prescription_text,
    therapy_notes,
    education_notes,
    status = "in_progress",
  } = answerPayload;

  // Auto-resolve active user ID from Supabase Auth if logged in
  let authUser = null;
  try {
    const { data: authData } = await supabase.auth.getUser();
    authUser = authData?.user;
  } catch (e) {}

  const activeParticipantId = authUser?.id || participant_id || "anonymous-participant";

  const payload = {
    session_id,
    station_id,
    participant_id: activeParticipantId,
    rotation_round,
    current_step,
    anamnesis_notes,
    physical_exam_notes,
    requested_auxiliary_json,
    working_diagnosis,
    differential_dx_1,
    differential_dx_2,
    differential_dx_3,
    prescription_text,
    therapy_notes,
    education_notes,
    status,
    submitted_at: status === "submitted" ? new Date().toISOString() : null,
  };

  // Always save to localStorage as fail-safe backup
  try {
    const localKey = `osce_ans_${session_id}_${station_id}_${rotation_round}`;
    localStorage.setItem(localKey, JSON.stringify(payload));
  } catch (e) {}

  // Only execute Supabase API request if user is authenticated with Supabase Auth session token
  // Prevents anonymous/guest 403 Forbidden HTTP errors in Chrome DevTools
  if (!authUser) {
    return payload;
  }

  try {
    const { data, error } = await supabase
      .schema("osce")
      .from("participant_answers")
      .upsert([payload], {
        onConflict: "session_id,station_id,participant_id,rotation_round",
      })
      .select()
      .maybeSingle();

    if (error) {
      return payload;
    }
    return data || payload;
  } catch (err) {
    return payload;
  }
}

/**
 * Fetch participant active answer for a specific station & round
 */
export async function fetchParticipantAnswer(sessionId, stationId, participantId, rotationRound) {
  try {
    const { data, error } = await supabase
      .schema("osce")
      .from("participant_answers")
      .select("*")
      .eq("session_id", sessionId)
      .eq("station_id", stationId)
      .eq("rotation_round", rotationRound)
      .maybeSingle();

    if (!error && data) return data;
  } catch (e) {}

  // Fallback to localStorage
  try {
    const localKey = `osce_ans_${sessionId}_${stationId}_${rotationRound}`;
    const localData = localStorage.getItem(localKey);
    if (localData) return JSON.parse(localData);
  } catch (e) {}

  return null;
}

/**
 * Fetch participant history / transcripts for completed sessions from Supabase
 */
export async function fetchParticipantHistory(user) {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user || user;

    if (!currentUser) return [];

    // 1. Fetch user's registered sessions from osce.session_participants
    const { data: registrations, error: regErr } = await supabase
      .schema("osce")
      .from("session_participants")
      .select("*")
      .or(`user_id.eq.${currentUser.id},email.eq.${currentUser.email}`);

    if (regErr || !registrations || registrations.length === 0) {
      return [];
    }

    const sessionIds = [...new Set(registrations.map((r) => r.session_id).filter(Boolean))];

    // 2. Fetch sessions details
    const { data: sessions } = await supabase
      .schema("osce")
      .from("sessions")
      .select("*")
      .in("id", sessionIds);

    const sessionsMap = new Map((sessions || []).map((s) => [s.id, s]));

    // 3. Fetch all examiner evaluations for these sessions
    const { data: evals } = await supabase
      .schema("osce")
      .from("examiner_evaluations")
      .select("*")
      .in("session_id", sessionIds);

    const historyItems = registrations.map((reg) => {
      const sess = sessionsMap.get(reg.session_id) || {};
      const userEvals = (evals || []).filter(
        (ev) =>
          ev.session_id === reg.session_id &&
          (ev.participant_id === reg.id || ev.participant_id === reg.user_id || ev.participant_id === currentUser.id)
      );

      let finalScore = 0;
      if (userEvals.length > 0) {
        const sum = userEvals.reduce((acc, curr) => acc + Number(curr.final_score_percentage || 0), 0);
        finalScore = Math.round((sum / userEvals.length) * 10) / 10;
      }

      const nbl = Number(sess.nbl_cutoff) || 70;
      const isSessionCompleted =
        sess.status === "completed" ||
        sess.status === "published" ||
        sess.status === "published_results" ||
        sess.status === "finished";

      const passed = userEvals.length > 0 ? finalScore >= nbl : false;

      return {
        id: reg.id,
        session_id: reg.session_id,
        title: sess.title || "Sesi Ujian OSCE",
        session_date: sess.session_date || "Sesuai Jadwal",
        total_stations: sess.total_stations || 6,
        location: sess.location_building || "Gedung Skill Lab FK",
        status: isSessionCompleted ? "Selesai" : "Proses Ujian",
        final_score: finalScore,
        passed,
        has_evaluations: userEvals.length > 0,
      };
    });

    return historyItems;
  } catch (err) {
    console.error("Error fetching participant history:", err);
    return [];
  }
}
