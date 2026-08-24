import { supabase } from "@/lib/supabaseClient";
import { supabase as publicSupabase } from "@/supabase/client";

/**
 * Fetch assigned station for examiner in a session
 */
export async function fetchExaminerAssignment(sessionId, examinerUserId) {
  const { data: assignment, error: assignErr } = await supabase
    .schema("osce")
    .from("session_examiners")
    .select("*")
    .eq("session_id", sessionId)
    .eq("user_id", examinerUserId)
    .single();

  if (assignErr) throw assignErr;

  const { data: station, error: stationErr } = await supabase
    .schema("osce")
    .from("stations")
    .select(`
      *,
      rubric_items (*),
      station_auxiliary_configs (*)
    `)
    .eq("session_id", sessionId)
    .eq("station_number", assignment.assigned_station_number)
    .single();

  if (stationErr) throw stationErr;

  return {
    assignment,
    station,
  };
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

  try {
    const { data: rubricItems } = await supabase
      .schema("osce")
      .from("rubric_items")
      .select("*")
      .eq("station_id", station_id)
      .order("question_number", { ascending: true });

    if (rubricItems && rubricItems.length > 0) {
      rubricItems.forEach((item) => {
        const weight = Number(item.weight) || 1.0;
        const maxPoints = Number(item.max_points) || 3;
        const given = (rubric_scores || []).find((s) => s.rubric_item_id === item.id);
        const scoreVal = given !== undefined ? Number(given.score_given) : 0;

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
  } catch (e) {
    console.warn("Could not query rubric_items for weight calculation:", e);
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

  // 3. Always back up evaluation data locally
  try {
    const localKey = `osce_eval_${session_id}_${station_id}_${participant_id}_${rotation_round}`;
    localStorage.setItem(localKey, JSON.stringify({ evaluation: evalPayload, rubric_scores }));
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

    // 5. Upsert rubric_scores
    if (evaluation?.id && rubric_scores && rubric_scores.length > 0) {
      const validUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const scoresPayload = rubric_scores
        .filter((s) => s.rubric_item_id && validUuidRegex.test(s.rubric_item_id))
        .map((s) => ({
          evaluation_id: evaluation.id,
          rubric_item_id: s.rubric_item_id,
          score_given: Number(s.score_given),
          feedback: s.feedback || null,
          scored_at: new Date().toISOString(),
        }));

      if (scoresPayload.length > 0) {
        await supabase
          .schema("osce")
          .from("rubric_scores")
          .upsert(scoresPayload, {
            onConflict: "evaluation_id,rubric_item_id",
          })
          .catch((err) => {
            console.warn("Notice saving rubric scores to Supabase:", err);
          });
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
