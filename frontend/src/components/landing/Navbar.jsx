import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { supabase } from "@/supabase/client";
import { logout } from "@/services/auth.service";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("participant");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setRole(data?.role ?? "participant");
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (!session?.user) {
        setRole("participant");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setRole(data?.role ?? "participant");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await logout();
    window.location.reload();
  }

  function getDashboardLink() {
    switch (role) {
      case "admin":
        return "/admin";

      case "examiner":
      case "mentor":
        return "/examiner";

      default:
        return "/";
    }
  }

  function getRoleLabel() {
    switch (role) {
      case "admin":
        return "Admin";

      case "examiner":
      case "mentor":
        return "Penguji";

      default:
        return "Pengguna";
    }
  }

  const canAccessDashboard =
    role === "admin" ||
    role === "examiner" ||
    role === "mentor";

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
        <Link
          to="/"
          className="text-3xl font-black text-[#1E3A8A]"
        >
          Praxis
        </Link>

        <div className="flex items-center gap-10">
          {!user ? (
            <Link
              to="/login"
              className="rounded-xl bg-[#1E3A8A] px-5 py-3 text-white"
            >
              Login
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 rounded-xl border px-4 py-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3A8A] font-bold text-white">
                  {user.email.charAt(0).toUpperCase()}
                </div>

                <div className="text-left">
                  <p className="font-semibold">
                    {user.email.split("@")[0]}
                  </p>

                  <p className="text-xs text-slate-500">
                    {getRoleLabel()}
                  </p>
                </div>

                <ChevronDown size={18} />
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl border bg-white shadow-lg">

                  {canAccessDashboard && (
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setOpen(false)}
                      className="block px-5 py-3 hover:bg-slate-100"
                    >
                      Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block w-full px-5 py-3 text-left text-red-600 hover:bg-slate-100"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}