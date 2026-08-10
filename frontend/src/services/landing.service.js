import { supabase } from "@/lib/supabaseClient";

export async function getOpenSessions() {
  try {
    const { data, error } = await supabase
      .schema("osce")
      .from("sessions")
      .select("*")
      .in("status", ["published", "ongoing", "running"])
      .order("session_date", { ascending: true });

    if (error) {
      console.warn("Schema 'osce.sessions' query notice, trying fallback:", error.message);
      const { data: fallbackData } = await supabase
        .from("sessions")
        .select("*")
        .in("status", ["published", "ongoing", "running"]);

      return fallbackData ?? [];
    }

    return data ?? [];
  } catch (err) {
    console.error("Error fetching open sessions:", err);
    return [];
  }
}