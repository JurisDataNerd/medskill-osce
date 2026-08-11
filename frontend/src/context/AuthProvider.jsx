import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { getProfile } from "@/services/profile.service";
import { parseUserRole } from "@/services/role.service";
import { updatePresence } from "@/services/presence.service";
import { logout as logoutService } from "@/services/auth.service";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal logout states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function load(session) {
    setLoading(true);

    setSession(session);
    setUser(session?.user ?? null);

    if (!session) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      let userProfile = await getProfile(session.user.id);

      // Auto-create profile in Supabase DB for OAuth / Google users if missing
      if (!userProfile && session?.user) {
        const u = session.user;
        const metaRole = parseUserRole(u.user_metadata?.role || u.user_metadata?.roles) || "participant";

        const { data: newProfile, error: upsertErr } = await supabase
          .from("profiles")
          .upsert({
            id: u.id,
            email: u.email,
            full_name:
              u.user_metadata?.full_name ||
              u.user_metadata?.name ||
              u.email?.split("@")[0] ||
              "Peserta OSCE",
            avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
            role: metaRole,
            is_online: true,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();

        if (!upsertErr && newProfile) {
          userProfile = newProfile;
        }
      }

      setProfile(userProfile);

      await updatePresence("online");
    } catch (err) {
      console.error("Error loading profile:", err);
    }

    setLoading(false);
  }

  function requestLogout() {
    setShowLogoutModal(true);
  }

  function cancelLogout() {
    if (!isLoggingOut) {
      setShowLogoutModal(false);
    }
  }

  async function performLogout(redirectUrl = "/login") {
    try {
      setIsLoggingOut(true);
      await updatePresence("offline");
    } catch (err) {
      console.error(err);
    }

    try {
      await logoutService();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      window.location.href = redirectUrl;
    }
  }

  async function logout(options = {}) {
    if (options?.force || options?.silent) {
      await performLogout(options?.redirectUrl ?? "/login");
    } else {
      requestLogout();
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      load(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      load(session);
    });

    const handleUnload = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        is_online: false,
        last_seen: new Date().toISOString(),
      })
      .eq("id", user.id);
  };

  window.addEventListener("beforeunload", handleUnload);

  return () => {
    window.removeEventListener("beforeunload", handleUnload);
  };

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        logout,
        requestLogout,
        performLogout,
      }}
    >
      {children}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={() => performLogout("/login")}
        isLoading={isLoggingOut}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}