import { supabase } from "@/supabase/client";

export async function getCurrentRole() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  // ADMIN GLOBAL
  if (user?.user_metadata?.role === "admin") {
    return "admin";
  }

  // selain admin cek role OSCE
  const { data: member } = await supabase
    .from("osce_session_members")
    .select("role")
    .eq("profile_id", user.id)
    .maybeSingle();

  return member?.role ?? null;
}