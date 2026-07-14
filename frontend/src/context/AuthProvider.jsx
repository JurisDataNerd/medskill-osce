import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { getProfile } from "@/services/profile.service";
import { updatePresence } from "@/services/presence.service";
import { logout as logoutService } from "@/services/auth.service";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  async function logout() {
    try {
      await updatePresence("offline");
    } catch (err) {
      console.error(err);
    }

    await logoutService();
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}