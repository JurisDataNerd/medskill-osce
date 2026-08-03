import { supabase } from "@/supabase/client";

export async function login(email, password, selectedRole = "participant") {
  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!result.error && result.data.user) {
    const user = result.data.user;

    // Check if profile exists in Supabase DB
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    // If role in Supabase profiles is missing, write selectedRole directly to Supabase DB
    const effectiveRole = profile?.role || user.user_metadata?.role || selectedRole;

    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Pengguna OSCE",
      role: effectiveRole,
      is_online: true,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return result;
}

export async function signUp(email, password, role = "participant", fullName = "") {
  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName || email.split("@")[0],
      },
    },
  });

  if (!result.error && result.data.user) {
    const user = result.data.user;
    // Directly write user profile into Supabase database table
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: fullName || email.split("@")[0],
      role: role,
      is_online: true,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
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