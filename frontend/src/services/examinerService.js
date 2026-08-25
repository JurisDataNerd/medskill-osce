import { supabase } from "@/lib/supabaseClient";
import { supabase as publicSupabase } from "@/supabase/client";

/**
 * Helper to resolve the assigned station for an examiner in a session
 */
export function findExaminerAssignment(sessionExs = [], sessionSts = [], user = null, userProf = null) {
  const currentName = (userProf?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "").toLowerCase().trim();
  const currentEmail = (userProf?.email || user?.email || "").toLowerCase().trim();
  const username = currentEmail ? currentEmail.split("@")[0].toLowerCase() : "";

  const clean = (str) =>
    (str || "")
      .toLowerCase()
      .replace(/\b(dr|dok|dokter|prof|sp\.[a-z]+|sp|m\.?[a-z]+|ph\.?d|s\.?ked|m\.?kes)\b/gi, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();

  const cUserName = clean(currentName);
  const cUsername = clean(username);

  // 1. Match from osce.session_examiners table
  const matchedEx = (sessionExs || []).find((e) => {
    if (user?.id && e.user_id === user.id) return true;
    if (e.email && currentEmail && e.email.toLowerCase().trim() === currentEmail) return true;
    if (!e.full_name) return false;
    const efClean = clean(e.full_name);
    if (!efClean) return false;

    if (cUserName && (efClean === cUserName || efClean.includes(cUserName) || cUserName.includes(efClean))) return true;
    if (cUsername && cUsername.length >= 3 && (efClean.includes(cUsername) || cUsername.includes(efClean))) return true;
    return false;
  });

  if (matchedEx && matchedEx.assigned_station_number) {
    const matchedSt = (sessionSts || []).find((st) => Number(st.station_number) === Number(matchedEx.assigned_station_number));
    if (matchedSt) {
      return { assignment: matchedEx, station: matchedSt };
    }
  }

  // 2. Match directly from osce.stations table (assigned_examiner / examiner_name / examiner_user_id)
  const matchedSt = (sessionSts || []).find((st) => {
    if (st.is_break) return false;
    if (user?.id && st.examiner_user_id === user.id) return true;
    const stExName = clean(st.assigned_examiner || st.examiner_name);
    if (!stExName) return false;

    if (cUserName && (stExName === cUserName || stExName.includes(cUserName) || cUserName.includes(stExName))) return true;
    if (cUsername && cUsername.length >= 3 && (stExName.includes(cUsername) || cUsername.includes(stExName))) return true;
    return false;
  });

  if (matchedSt) {
    return {
      assignment: matchedEx || { assigned_station_number: matchedSt.station_number },
      station: matchedSt,
    };
  }

  // 3. Fallback to first non-break station
  const fallbackSt = (sessionSts || []).find((st) => !st.is_break) || (sessionSts || [])[0] || null;
  return {
    assignment: matchedEx || { assigned_station_number: fallbackSt?.station_number || 1 },
    station: fallbackSt,
  };
}

/**
 * Fetch assigned station for examiner in a session
 */
export async function fetchExaminerAssignment(sessionId, examinerUserId) {
  const { data: sessionExs } = await supabase
    .schema("osce")
    .from("session_examiners")
    .select("*")
    .eq("session_id", sessionId);

  const { data: sessionSts } = await supabase
    .schema("osce")
    .from("stations")
    .select(`
      *,
      rubric_items (*),
      station_auxiliary_configs (*)
    `)
    .eq("session_id", sessionId)
    .order("station_number");

  const { data: authUser } = await supabase.auth.getUser();

  return findExaminerAssignment(sessionExs || [], sessionSts || [], authUser?.user || { id: examinerUserId }, null);
}

/**
 * Submit examiner evaluation (GRS rating + rubric scores 0-3)
 */
export async function submitExaminerEvaluation({
  session_id,
  station_id,
  participant_id,
  examiner_id,
  rotation_round,
  grs_rating,
  examiner_notes,
  rubric_scores = [], // Array of { rubric_item_id, score_given, feedback }
  is_locked = false,
}) {
  let authUser = null;
  try {
    const { data: authData } = await supabase.auth.getUser();
    authUser = authData?.user;
  } catch (e) {}

  const activeExaminerId = authUser?.id || examiner_id || "examiner-user";

  // 1. Fetch rubric items from Supabase to calculate weighted scores
  let totalEarned = 0;
  let totalPossible = 0;
  let dbRubricItems = [];

  try {
    const { data: fetchedItems } = await supabase
      .schema("osce")
      .from("rubric_items")
      .select("*")
      .eq("station_id", station_id)
      .order("question_number", { ascending: true });

    if (fetchedItems && fetchedItems.length > 0) {
      dbRubricItems = fetchedItems;
    } else if (rubric_scores && rubric_scores.length > 0) {
      // If DB has no rubric_items for this station, insert them now so real UUIDs exist
      try {
        const itemsToInsert = rubric_scores.map((sc, idx) => ({
          station_id: station_id,
          question_number: idx + 1,
          question: sc.question || sc.title || `Item Rubrik #${idx + 1}`,
          answer_key: sc.answer_key || sc.description || "",
          max_points: Number(sc.max_points) || 3,
          weight: Number(sc.weight) || 1.0,
          sort_order: idx,
        }));

        const { data: newItems } = await supabase
          .schema("osce")
          .from("rubric_items")
          .insert(itemsToInsert)
          .select();

        if (newItems && newItems.length > 0) {
          dbRubricItems = newItems;
        }
      } catch (e) {
        console.warn("Could not auto-insert rubric_items in submitExaminerEvaluation:", e);
      }
    }
  } catch (e) {
    console.warn("Could not query rubric_items for weight calculation:", e);
  }

  if (dbRubricItems.length > 0) {
    dbRubricItems.forEach((item, idx) => {
      const weight = Number(item.weight) || 1.0;
      const maxPoints = Number(item.max_points) || 3;
      const given = (rubric_scores || []).find(
        (s) => String(s.rubric_item_id) === String(item.id)
      ) || rubric_scores[idx];

      const scoreVal = given !== undefined && given !== null && given.score_given !== undefined
        ? Number(given.score_given)
        : 0;

      totalEarned += scoreVal * weight;
      totalPossible += maxPoints * weight;
    });
  } else if (rubric_scores && rubric_scores.length > 0) {
    // Fallback calculation if rubric items aren't yet in DB
    rubric_scores.forEach((s) => {
      const weight = Number(s.weight) || 1.0;
      const maxPoints = Number(s.max_points) || 3;
      const scoreVal = Number(s.score_given) || 0;
      totalEarned += scoreVal * weight;
      totalPossible += maxPoints * weight;
    });
  }

  const finalScorePercentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

  // 2. Prepare evaluation payload
  const evalPayload = {
    session_id,
    station_id,
    participant_id,
    examiner_id: activeExaminerId,
    rotation_round,
    grs_rating,
    examiner_notes,
    total_points_earned: Math.round(totalEarned * 100) / 100,
    max_points_possible: Math.round(totalPossible * 100) / 100,
    final_score_percentage: Math.round(finalScorePercentage * 100) / 100,
    is_locked,
    submitted_at: new Date().toISOString(),
  };

  // 3. Always back up evaluation data locally (both raw array and scores map)
  try {
    const scoresMap = {};
    (rubric_scores || []).forEach((sc) => {
      if (sc.rubric_item_id) scoresMap[sc.rubric_item_id] = Number(sc.score_given);
    });

    const localKey = `osce_eval_${session_id}_${station_id}_${participant_id}_${rotation_round}`;
    const draftKey = `osce_examiner_draft_${session_id}_${station_id}_${participant_id}_${rotation_round}`;

    const backupData = {
      evaluation: evalPayload,
      rubric_scores,
      rubricScores: scoresMap,
      globalRating: grs_rating,
      feedback: examiner_notes,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(localKey, JSON.stringify(backupData));
    localStorage.setItem(draftKey, JSON.stringify(backupData));
  } catch (e) {}

  // 4. Upsert examiner_evaluations to Supabase
  try {
    const { data: evaluation, error: evalErr } = await supabase
      .schema("osce")
      .from("examiner_evaluations")
      .upsert([evalPayload], {
        onConflict: "session_id,station_id,participant_id,examiner_id,rotation_round",
      })
      .select()
      .maybeSingle();

    if (evalErr) {
      console.warn("Supabase examiner_evaluations RLS notice (saved locally):", evalErr.message);
      return evalPayload;
    }

    // 5. Upsert rubric_scores to Supabase DB (resolve non-UUID IDs to real rubric item UUIDs)
    if (evaluation?.id && rubric_scores && rubric_scores.length > 0) {
      const validUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      const scoresPayload = (rubric_scores || []).map((s, idx) => {
        let itemId = s.rubric_item_id;
        if (!validUuidRegex.test(itemId) && dbRubricItems[idx]?.id) {
          itemId = dbRubricItems[idx].id;
        }

        if (validUuidRegex.test(itemId)) {
          return {
            evaluation_id: evaluation.id,
            rubric_item_id: itemId,
            score_given: Number(s.score_given || 0),
            feedback: s.feedback || null,
            scored_at: new Date().toISOString(),
          };
        }
        return null;
      }).filter(Boolean);

      if (scoresPayload.length > 0) {
        try {
          await supabase
            .schema("osce")
            .from("rubric_scores")
            .delete()
            .eq("evaluation_id", evaluation.id);

          const { error: insErr } = await supabase
            .schema("osce")
            .from("rubric_scores")
            .insert(scoresPayload);

          if (insErr) {
            console.warn("Retrying rubric_scores upsert fallback:", insErr.message);
            await supabase
              .schema("osce")
              .from("rubric_scores")
              .upsert(scoresPayload)
              .catch((err) => console.warn("Notice saving rubric scores to Supabase:", err));
          }
        } catch (err) {
          console.warn("Notice saving rubric scores to Supabase:", err);
        }
      }
    }

    return evaluation || evalPayload;
  } catch (err) {
    console.warn("Evaluation save fallback to local storage:", err.message);
    return evalPayload;
  }
}

/**
 * Fetch existing evaluation for a examinee
 */
export async function fetchExaminerEvaluation(sessionId, stationId, participantId, rotationRound) {
  const { data, error } = await supabase
    .schema("osce")
    .from("examiner_evaluations")
    .select(`
      *,
      rubric_scores (*)
    `)
    .eq("session_id", sessionId)
    .eq("station_id", stationId)
    .eq("participant_id", participantId)
    .eq("rotation_round", rotationRound)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Fetch active ongoing session and examiner's assigned station
 */
export async function fetchActiveSessionAndStationForExaminer(examinerUserId) {
  const { data: ongoingSess, error: sessErr } = await supabase
    .schema("osce")
    .from("sessions")
    .select("*")
    .in("status", ["ongoing", "waiting_room"])
    .limit(1)
    .maybeSingle();

  if (sessErr || !ongoingSess) return { session: null, assignment: null, station: null };

  const { data: assignment } = await supabase
    .schema("osce")
    .from("session_examiners")
    .select("*")
    .eq("session_id", ongoingSess.id)
    .eq("user_id", examinerUserId)
    .maybeSingle();

  const stationNumber = assignment?.assigned_station_number || 1;

  const { data: station } = await supabase
    .schema("osce")
    .from("stations")
    .select(`
      *,
      rubric_items (*),
      station_auxiliary_configs (*)
    `)
    .eq("session_id", ongoingSess.id)
    .eq("station_number", stationNumber)
    .maybeSingle();

  return {
    session: ongoingSess,
    assignment,
    station,
  };
}

/**
 * Realtime Subscription for Participant Live Answer Sheet
 */
export function subscribeParticipantAnswer(sessionId, stationId, participantId, callback) {
  const channel = supabase
    .channel(`realtime-answers-${stationId}-${participantId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "osce",
        table: "participant_answers",
        filter: `station_id=eq.${stationId}`,
      },
      (payload) => {
        if (callback) callback(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Fetch past evaluation history for an examiner
 */
export async function fetchExaminerHistory(examinerUserId) {
  const { data: evals, error } = await supabase
    .schema("osce")
    .from("examiner_evaluations")
    .select(`
      *,
      sessions (*),
      stations (*)
    `)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return evals || [];
}

/**
 * Fetch registered doctor examiners from Supabase
 */
export async function fetchDoctorExaminers() {
  try {
    const list = [];
    const seenNames = new Set();

    // 1. Primary Source: Fetch from mentors table via publicSupabase (contains full doctor profiles & img_url)
    try {
      const { data: mentors } = await publicSupabase
        .from("mentors")
        .select("id, name, university, email, img_url, is_active")
        .order("name");

      if (mentors && mentors.length > 0) {
        mentors.forEach((m) => {
          const name = m.name;
          if (name && !seenNames.has(name.toLowerCase())) {
            seenNames.add(name.toLowerCase());
            list.push({
              id: m.id,
              name: name,
              university: m.university || "Universitas Gadjah Mada",
              specialty: m.university || "Spesialis Medis FK",
              nip: "-",
              email: m.email || "",
              img_url: m.img_url || null,
            });
          }
        });
      }
    } catch (e) {}

    // 2. Secondary Source: Fetch from public profiles where role = 'examiner'
    try {
      const { data: profiles } = await publicSupabase
        .from("profiles")
        .select("*")
        .eq("role", "examiner");

      if (profiles && profiles.length > 0) {
        profiles.forEach((p) => {
          const name = p.full_name || p.name || p.email;
          if (name && !seenNames.has(name.toLowerCase())) {
            seenNames.add(name.toLowerCase());
            list.push({
              id: p.id,
              name: name,
              university: p.university || p.specialty || "Universitas Gadjah Mada",
              specialty: p.specialty || p.university || "Dokter Penguji OSCE",
              nip: p.nip || "-",
              email: p.email || "",
              img_url: p.img_url || p.avatar_url || null,
            });
          }
        });
      }
    } catch (e) {}

    return list;
  } catch (err) {
    console.error("Error fetching doctor examiners from Supabase:", err);
    return [];
  }
}
