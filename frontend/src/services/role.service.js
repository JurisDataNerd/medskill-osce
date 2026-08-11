import { supabase } from "@/supabase/client";

/**
 * Helper to extract normalized role ('admin', 'examiner', 'participant')
 * from raw_user_meta_data JSON array (e.g. ["admin"], ["examiner"], ["user"]) or string.
 */
export function parseUserRole(roleData) {
  if (!roleData) return null;

  // Handle array from raw_user_meta_data JSON (e.g. ["admin"], ["examiner"], ["user"])
  if (Array.isArray(roleData)) {
    if (roleData.includes("admin")) return "admin";
    if (roleData.includes("examiner") || roleData.includes("mentor") || roleData.includes("penguji")) return "examiner";
    if (roleData.includes("user") || roleData.includes("participant") || roleData.includes("peserta")) return "participant";
    if (roleData.length > 0) {
      const first = String(roleData[0]).toLowerCase();
      if (first === "user") return "participant";
      return first;
    }
  }

  // Handle string (e.g. "admin", "examiner", "user", "participant")
  if (typeof roleData === "string") {
    const lower = roleData.toLowerCase();
    if (lower === "admin") return "admin";
    if (lower === "examiner" || lower === "mentor" || lower === "penguji") return "examiner";
    if (lower === "user" || lower === "participant" || lower === "peserta") return "participant";
    return lower;
  }

  return null;
}

export async function getCurrentRole(userObj = null) {
  let user = userObj;
  if (!user) {
    const {
      data: { user: fetchedUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !fetchedUser) return "participant";
    user = fetchedUser;
  }

  // 1. Check Auth Metadata (raw_user_meta_data)
  const metaRole = parseUserRole(user.user_metadata?.role || user.user_metadata?.roles);
  if (metaRole) return metaRole;

  // 2. Check profiles table in public schema in Supabase
  const { data: profile, error: profileError } = await supabase
    .schema("public")
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching user profile role:", profileError);
  }

  const dbRole = parseUserRole(profile?.role);
  if (dbRole) return dbRole;

  return "participant";
}

/**
 * Ensures user has a role assigned in profiles table.
 * If user role is null, automatically initializes/assigns the requested default role (e.g. 'participant').
 */
export async function ensureUserRole(defaultRole = "participant") {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return defaultRole;

  const existingRole = await getCurrentRole();
  if (existingRole) return existingRole;

  // Auto-initialize profile role if missing
  try {
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Peserta OSCE",
      role: defaultRole,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Could not upsert profile role to database:", err);
  }

  return defaultRole;
}