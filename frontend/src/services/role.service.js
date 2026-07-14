import { supabase } from "@/supabase/client";

export async function getCurrentRole() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  if (!user) return null;

  // Admin dari Auth Metadata
  if (user.user_metadata?.role === "admin") {
    return "admin";
  }

  // Ambil role dari tabel profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(profileError);
    return null;
  }

  return profile.role;
}