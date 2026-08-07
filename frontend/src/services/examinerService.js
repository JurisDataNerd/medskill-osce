import { supabase } from "@/lib/supabaseClient";

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
  rubric_scores, // Array of { rubric_item_id, score_given, feedback }
  is_locked = false,
}) {
  // 1. Fetch rubric items to calculate weighted scores
  const { data: rubricItems, error: itemsErr } = await supabase
    .schema("osce")
    .from("rubric_items")
    .select("*")
    .eq("station_id", station_id);

  if (itemsErr) throw itemsErr;

  let totalEarned = 0;
  let totalPossible = 0;

  (rubricItems || []).forEach((item) => {
    const weight = Number(item.weight) || 1.0;
    const maxPoints = Number(item.max_points) || 3;
    const given = rubric_scores.find((s) => s.rubric_item_id === item.id);
    const scoreVal = given ? Number(given.score_given) : 0;

    totalEarned += scoreVal * weight;
    totalPossible += maxPoints * weight;
  });

  const finalScorePercentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

  // 2. Upsert examiner_evaluations
  const evalPayload = {
    session_id,
    station_id,
    participant_id,
    examiner_id,
    rotation_round,
    grs_rating,
    examiner_notes,
    total_points_earned: totalEarned,
    max_points_possible: totalPossible,
    final_score_percentage: Math.round(finalScorePercentage * 100) / 100,
    is_locked,
    submitted_at: new Date().toISOString(),
  };

  const { data: evaluation, error: evalErr } = await supabase
    .schema("osce")
    .from("examiner_evaluations")
    .upsert([evalPayload], {
      onConflict: "session_id,station_id,participant_id,examiner_id,rotation_round",
    })
    .select()
    .single();

  if (evalErr) throw evalErr;

  // 3. Upsert rubric_scores
  if (rubric_scores && rubric_scores.length > 0) {
    const scoresPayload = rubric_scores.map((s) => ({
      evaluation_id: evaluation.id,
      rubric_item_id: s.rubric_item_id,
      score_given: s.score_given,
      feedback: s.feedback || null,
      scored_at: new Date().toISOString(),
    }));

    const { error: scoresErr } = await supabase
      .schema("osce")
      .from("rubric_scores")
      .upsert(scoresPayload, {
        onConflict: "evaluation_id,rubric_item_id",
      });

    if (scoresErr) throw scoresErr;
  }

  return evaluation;
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
