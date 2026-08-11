import { supabase } from "@/lib/supabaseClient";

export async function getOpenSessions() {
  try {
    const { data, error } = await supabase
      .schema("osce")
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Schema 'osce.sessions' query notice, trying fallback:", error.message);
      const { data: fallbackData } = await supabase
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false });

      return (fallbackData ?? []).filter((s) => {
        if (!s || !s.status) return false;
        const st = String(s.status).toLowerCase();
        return st === "published" || st === "scheduled" || st === "ongoing" || st === "running";
      });
    }

    return (data ?? []).filter((s) => {
      if (!s || !s.status) return false;
      const st = String(s.status).toLowerCase();
      return st === "published" || st === "scheduled" || st === "ongoing" || st === "running";
    });
  } catch (err) {
    console.error("Error fetching open sessions:", err);
    return [];
  }
}