import { supabase } from "@/supabase/client";

export async function getCurrentRole() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // 1. Check Auth Metadata
  if (user.user_metadata?.role) {
    return user.user_metadata.role;
  }

  // 2. Check profiles table in Supabase
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching user profile role:", profileError);
  }

  if (profile?.role) {
    return profile.role;
  }

  return null;
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