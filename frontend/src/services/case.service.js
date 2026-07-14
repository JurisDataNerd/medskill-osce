import { supabase } from "@/supabase/client";

export async function getCases() {
  const { data } = await supabase
    .from("osce_cases")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createCase(payload) {
  return await supabase
    .from("osce_cases")
    .insert(payload);
}

export async function updateCase(id, payload) {
  return await supabase
    .from("osce_cases")
    .update(payload)
    .eq("id", id);
}

export async function deleteCase(id) {
  return await supabase
    .from("osce_cases")
    .delete()
    .eq("id", id);
}

/* ---------- Sections ---------- */

export async function getSections(caseId) {
  const { data } = await supabase
    .from("osce_case_sections")
    .select("*")
    .eq("case_id", caseId)
    .order("section_order");

  return data ?? [];
}

export async function createSection(payload) {
  return await supabase
    .from("osce_case_sections")
    .insert(payload);
}

export async function updateSection(id, payload) {
  return await supabase
    .from("osce_case_sections")
    .update(payload)
    .eq("id", id);
}

export async function deleteSection(id) {
  return await supabase
    .from("osce_case_sections")
    .delete()
    .eq("id", id);
}

/* ---------- Checklist ---------- */

export async function getChecklist(stationId) {
  const { data } = await supabase
    .from("osce_score_items")
    .select("*")
    .eq("station_id", stationId)
    .order("item_order");

  return data ?? [];
}

export async function createChecklist(payload) {
  return await supabase
    .from("osce_score_items")
    .insert(payload);
}

export async function updateChecklist(id, payload) {
  return await supabase
    .from("osce_score_items")
    .update(payload)
    .eq("id", id);
}

export async function deleteChecklist(id) {
  return await supabase
    .from("osce_score_items")
    .delete()
    .eq("id", id);
}