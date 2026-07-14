import { supabase } from "@/supabase/client";

export async function getOpenSessions() {
  const { data, error } = await supabase
    .from("osce_sessions")
    .select("*")
    .order("session_date", { ascending: true });

  console.log(data);
  console.log(error);

  if (error) throw error;

  return data ?? [];
}