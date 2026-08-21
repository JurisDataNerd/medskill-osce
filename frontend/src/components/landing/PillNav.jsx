import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";

export default function PillNav({
  logo = "/logo_biru.avif",
  logoAlt = "Praxis by Medskill Logo",
  items = [
    { label: "Kenapa Praxis", href: "#why-praxis" },
    { label: "Tentang Praxis", href: "#about" },
    { label: "Anamnesis AI", href: "#proof" },
    { label: "Jadwal Simulasi", href: "#sessions" },
    { label: "Testimoni", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ],
  activeHref = "#why-praxis",
  className = "custom-nav",
  ease = "power2.easeOut",
  baseColor = "#0D3A68",
  pillColor = "#C9A227",
  hoveredPillTextColor = "#0D3A68",
  pillTextColor = "#FFFFFF",
}) {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("participant");
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [activeItemHref, setActiveItemHref] = useState(activeHref);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const desktopDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          .select("role, full_name")
          .eq("id", session.user.id)
          .maybeSingle();

        const activeRole =
          data?.role || session.user.user_metadata?.role || "participant";
        setRole(activeRole);
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
        .select("role, full_name")
        .eq("id", session.user.id)
        .maybeSingle();

      const activeRole =
        data?.role || session.user.user_metadata?.role || "participant";
      setRole(activeRole);
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
        return "Dokter Penguji";
      default:
        return "Peserta OSCE";
    }
  }

  function scrollToSection(href) {
    setActiveItemHref(href);
    setMobileMenuOpen(false);
    const targetId = href.replace("#", "");
    const el = document.getElementById(targetId);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const userInitial = (
    displayName.charAt(0) ||
    user?.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 ${className}`}>
      <nav
        className={`mx-auto max-w-7xl rounded-3xl transition-all duration-300 ${
          scrolled
            ? "border border-[#C9A227]/50 shadow-2xl shadow-[#0D3A68]/40 backdrop-blur-md py-3 px-4 sm:px-8"
            : "border border-blue-100/90 shadow-xl shadow-slate-200/60 backdrop-blur-md py-3.5 px-4 sm:px-8"
        }`}
        style={{
          backgroundColor: scrolled ? baseColor : "rgba(255, 255, 255, 0.96)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Logo Anchor */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 shrink-0 transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-center rounded-xl bg-white p-1.5 shadow-md border border-slate-200/80 shrink-0">
              <img
                src="/logo_biru.avif"
                alt={logoAlt}
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>
            <div
              className={`flex flex-col border-l pl-2.5 transition-colors duration-200 ${
                scrolled ? "border-white/25" : "border-slate-300/80"
              }`}
            >
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider uppercase text-[#C9A227]">
                by Medskill Indonesia
              </span>
              <span
                className={`text-[10px] sm:text-[11px] font-extrabold leading-tight ${
                  scrolled ? "text-white" : "text-slate-900"
                }`}
              >
                Platform Ujian OSCE
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items with Animated Pill Background Cursor */}
          <div className="hidden lg:flex items-center gap-1.5 relative rounded-full bg-slate-100/70 p-1.5 border border-slate-200/60">
            {items.map((item, idx) => {
              const isHovered = hoveredIdx === idx;
              const isActive = activeItemHref === item.href;

              return (
                <button
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => scrollToSection(item.href)}
                  className="relative z-10 px-4 py-2 text-xs font-extrabold transition-colors duration-200 rounded-full cursor-pointer"
                  style={{
                    color: isHovered
                      ? hoveredPillTextColor
                      : scrolled
                      ? "#FFFFFF"
                      : "#0D3A68",
                  }}
                >
                  {(isHovered || (hoveredIdx === null && isActive)) && (
                    <motion.div
                      layoutId="pillNavHover"
                      className="absolute inset-0 rounded-full shadow-sm -z-10"
                      style={{ backgroundColor: pillColor }}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Right Auth Button / Profile Dropdown (Only on lg+) */}
          <div className="hidden lg:flex items-center gap-3" ref={desktopDropdownRef}>
            {!user ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: baseColor }}
              >
                <span>Login Portal</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={`flex items-center gap-2.5 rounded-full border px-4 py-2 transition cursor-pointer shadow-xs ${
                    scrolled
                      ? "border-amber-400/40 bg-white/10 text-white hover:bg-white/20"
                      : "border-amber-200/90 bg-amber-50/90 text-slate-800 hover:bg-amber-100"
                  }`}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full font-black text-white text-xs shadow-xs"
                    style={{ backgroundColor: scrolled ? "#C9A227" : baseColor }}
                  >
                    {userInitial}
                  </div>
                  <span
                    className={`text-xs font-bold truncate max-w-[120px] ${
                      scrolled ? "text-white" : "text-[#0D3A68]"
                    }`}
                  >
                    {displayName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      scrolled ? "text-amber-200" : "text-slate-500"
                    } ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-blue-100 bg-white p-2.5 shadow-2xl z-50 space-y-1.5"
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-2.5 border border-slate-100 bg-gradient-to-r from-blue-50/70 to-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.5">
                            <ShieldCheck size={11} />
                            {getRoleLabel()}
                          </span>
                        </div>
                        <p className="text-xs font-black text-slate-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Buka Dashboard */}
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:opacity-95"
                        style={{ backgroundColor: baseColor }}
                      >
                        <div className="flex items-center gap-2">
                          <LayoutDashboard size={14} />
                          <span>Buka Dashboard</span>
                        </div>
                        <ArrowRight size={13} />
                      </Link>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Keluar</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Hamburger Toggle (< lg) */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl transition duration-200 cursor-pointer shadow-xs ${
                scrolled
                  ? "bg-white/15 text-white hover:bg-white/25 border border-white/20"
                  : "bg-slate-100 text-[#0D3A68] hover:bg-slate-200 border border-slate-200/80"
              }`}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden border-t border-slate-200/60 mt-3 pt-3 lg:hidden bg-white rounded-2xl p-3 sm:p-4 shadow-xl space-y-3"
            >
              {/* If Logged In: Show Profile Card in Drawer */}
              {user && (
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-amber-50/50 p-3.5 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black text-white text-base shadow-sm border border-white/80"
                      style={{ backgroundColor: baseColor }}
                    >
                      {userInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 truncate max-w-full">
                          {displayName}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.5">
                          <ShieldCheck size={10} />
                          {getRoleLabel()}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Primary CTA: Buka Dashboard */}
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:scale-[1.01]"
                    style={{ backgroundColor: baseColor }}
                  >
                    <div className="flex items-center gap-2">
                      <LayoutDashboard size={15} />
                      <span>Buka Dashboard</span>
                    </div>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {/* Navigation Items List */}
              <div className="flex flex-col gap-1 text-xs font-bold">
                {items.map((item, idx) => {
                  const isActive = activeItemHref === item.href;
                  return (
                    <button
                      key={idx}
                      onClick={() => scrollToSection(item.href)}
                      className={`text-left py-2.5 px-3.5 rounded-xl transition flex items-center justify-between cursor-pointer ${
                        isActive
                          ? "bg-amber-50 text-[#0D3A68] font-extrabold border-l-4 border-[#C9A227]"
                          : "text-slate-700 hover:bg-slate-50 hover:text-[#0D3A68]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C9A227]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer CTA: Login / Logout */}
              <div className="pt-2 border-t border-slate-100">
                {!user ? (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold text-white shadow-md transition hover:scale-[1.01]"
                    style={{ backgroundColor: baseColor }}
                  >
                    <span>Login Portal</span>
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/70 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Keluar</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

