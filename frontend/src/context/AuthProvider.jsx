import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { getProfile } from "@/services/profile.service";
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
      const profile = await getProfile(session.user.id);

      setProfile(profile);

      await updatePresence("online");
    } catch (err) {
      console.error(err);
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