import { supabase } from "@/supabase/client";

export async function login(email, password) {
  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!result.error && result.data.user) {
    await supabase
      .from("profiles")
      .update({
        is_online: true,
        last_seen: new Date().toISOString(),
      })
      .eq("id", result.data.user.id);
  }

  return result;
}

export async function signIn() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
}

export async function logout() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("profiles")
      .update({
        is_online: false,
        last_seen: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  return await supabase.auth.signOut();
}