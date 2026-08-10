import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Activity, LogOut, LayoutDashboard, Menu, X, ArrowRight, ShieldCheck, } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";

export default function Navbar() {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("participant");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          .maybeSingle();

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
        .maybeSingle();

      setRole(data?.role ?? "participant");
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleLogout() {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    if (logout) logout();
  }

  function getDashboardLink() {
    switch (role) {
      case "admin":
        return "/admin";

      case "examiner":
      case "mentor":
        return "/examiner";

      default:
        return "/participant";
    }
  }

  function getRoleLabel() {
    switch (role) {
      case "admin":
        return "Admin Institusi";

      case "examiner":
      case "mentor":
        return "Penguji OSCE";

      default:
        return "Peserta Simulasi";
    }
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 pt-4 transition-all duration-300">
      <nav
        className={`mx-auto max-w-7xl rounded-2xl transition-all duration-300 ${scrolled
          ? "border border-blue-200/80 bg-white/90 shadow-xl shadow-blue-900/5 backdrop-blur-xl"
          : "border border-white/80 bg-white/70 shadow-md shadow-slate-200/50 backdrop-blur-md"
          }`}
      >
        <div className="flex h-16 sm:h-20 items-center justify-between px-5 sm:px-8">
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1E3A8A] to-blue-600 p-[1px] shadow-md shadow-blue-900/20 transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-white">
                <Activity className="h-5 w-5 text-[#1E3A8A] transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1E3A8A] flex items-center gap-1.5">
                Praxis
                <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700/80">
                by Medskill Indonesia
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <button
              onClick={() => scrollToSection("sessions")}
              className="transition hover:text-[#1E3A8A] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Sesi Simulasi OSCE</span>
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="transition hover:text-[#1E3A8A] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Fitur Utama</span>
            </button>
            <button
              onClick={() => scrollToSection("advantages")}
              className="transition hover:text-[#1E3A8A] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Keunggulan</span>
            </button>
          </div>

          {/* Right Action / Auth Button */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#1E3A8A] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all duration-300 hover:bg-blue-900 hover:shadow-blue-900/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10">Login Portal</span>
                  <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-1.5 text-slate-800 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A8A] font-bold text-white text-xs shadow-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>

                    <div className="text-left">
                      <p className="text-xs font-bold text-[#1E3A8A] leading-tight">
                        {user.email?.split("@")[0]}
                      </p>
                      <p className="text-[10px] text-blue-600 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="h-3 w-3 inline" />
                        {getRoleLabel()}
                      </p>
                    </div>

                    <ChevronDown
                      size={15}
                      className={`text-slate-500 transition-transform duration-300 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-blue-100 bg-white p-2.5 shadow-2xl backdrop-blur-xl z-50 space-y-1.5"
                      >
                        <div className="px-3 py-2 border border-slate-100 bg-slate-50/80 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Masuk Sebagai:</p>
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {user.email}
                          </p>
                          <p className="text-[11px] font-bold text-blue-600 mt-0.5 flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Role: {getRoleLabel()}
                          </p>
                        </div>

                        {/* Always Displayed Prominent Dashboard Link Button */}
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Buka Dashboard</span>
                        </Link>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Keluar Sistem</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50/80 text-[#1E3A8A]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-blue-100/80 px-6 py-5 md:hidden"
            >
              <div className="flex flex-col gap-4 text-slate-700 text-sm font-semibold">
                <a
                  href="#sessions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#1E3A8A] transition py-1"
                >
                  Upcoming Sessions
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#1E3A8A] transition py-1"
                >
                  Fitur Utama
                </a>
                <a
                  href="#why-praxis"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#1E3A8A] transition py-1"
                >
                  Keunggulan
                </a>

                <div className="pt-3 border-t border-slate-100">
                  {!user ? (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-3 font-bold text-white shadow-lg shadow-blue-900/20"
                    >
                      <span>Login Portal</span>
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-slate-500">
                        Masuk: {user.email}
                      </p>
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-[#1E3A8A] font-bold"
                      >
                        <LayoutDashboard size={16} />
                        <span>Buka Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-red-600 font-bold"
                      >
                        <LogOut size={16} />
                        <span>Keluar Sistem</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}