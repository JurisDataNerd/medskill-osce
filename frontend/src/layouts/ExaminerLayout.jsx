import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  History,
  LogOut,
  UserCheck,
  Stethoscope,
  Award,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/examiner",
  },
  {
    title: "Pengujian Live",
    icon: Activity,
    path: "/examiner/stage",
  },
  {
    title: "Riwayat Pengujian",
    icon: History,
    path: "/examiner/history",
  },
  {
    title: "Profil",
    icon: User,
    path: "/examiner/profile",
  },
];

export default function ExaminerLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("examiner_sidebar_collapsed") === "true";
  });
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    localStorage.setItem("examiner_sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    async function checkActiveSession() {
      try {
        const { data } = await supabase
          .schema("osce")
          .from("sessions")
          .select("id, title, status")
          .in("status", ["ongoing", "waiting_room", "scheduled", "paused"])
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          const ongoing = data.find((s) => s.status === "ongoing" || s.status === "waiting_room");
          setActiveSession(ongoing || data[0]);
        } else {
          setActiveSession(null);
        }
      } catch (err) {
        console.error("Error checking active session for ExaminerLayout header:", err);
      }
    }

    checkActiveSession();
  }, [location.pathname]);

  function handleLogout() {
    logout();
  }

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, avatar_url, university")
          .eq("id", user.id)
          .maybeSingle();

        if (!error && data) setProfile(data);
      } catch (err) {
        // Silently handle
      }
    }
    loadProfile();
  }, [user]);

  function formatDoctorDisplayName(fullName, email) {
    if (fullName && fullName.trim()) return fullName;
    if (!email) return "Tidak ada data";
    const username = email.split("@")[0].replace(/[._]/g, " ");
    const formatted = username.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return formatted || "Tidak ada data";
  }

  const examinerName = formatDoctorDisplayName(profile?.full_name || user?.user_metadata?.full_name, user?.email);
  const examinerSpecialty = profile?.specialty || user?.user_metadata?.specialty || "Penguji OSCE";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside
        className={`flex flex-col border-r border-slate-200 bg-white shadow-xs transition-all duration-300 ease-in-out shrink-0 ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Brand Header */}
        <div className="border-b border-slate-200 p-4 flex items-center h-20">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0 px-2">
              <img src="/favicon.svg" alt="Praxis Logo" className="h-10 w-10 shrink-0 object-contain rounded-xl shadow-md" />
              <div className="min-w-0">
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none truncate">
                  Praxis <span className="text-blue-600">OSCE</span>
                </h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                  Portal Dokter Penguji
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <img src="/favicon.svg" alt="Praxis Logo" className="h-10 w-10 object-contain rounded-xl shadow-md" />
            </div>
          )}
        </div>

        {/* Examiner Info Widget */}
        <div className={`p-3 mx-2 my-3 rounded-2xl border border-slate-200 bg-slate-50/80 ${isCollapsed ? "flex justify-center" : ""}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center border-2 border-blue-500 shadow-2xs">
              <Stethoscope size={16} />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-900 truncate">
                  {examinerName}
                </p>
                <p className="text-[11px] text-blue-700 font-semibold truncate">
                  {examinerSpecialty}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1.5 p-3">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Menu Utama Penguji
            </div>
          )}

          {menus.map((menu) => {
            const Icon = menu.icon;
            const isActive =
              menu.path === "/examiner"
                ? location.pathname === "/examiner"
                : location.pathname.startsWith(menu.path);

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                title={isCollapsed ? menu.title : undefined}
                className={`flex items-center gap-3 rounded-xl py-3 text-xs font-bold transition ${
                  isCollapsed ? "justify-center px-0" : "px-4"
                } ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{menu.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Keluar" : undefined}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95 cursor-pointer ${
              isCollapsed ? "px-0" : ""
            }`}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 md:px-8 shadow-2xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shadow-2xs cursor-pointer"
              title={isCollapsed ? "Buka Sidebar" : "Kecilkan Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            {activeSession ? (
              <>
                {["ongoing", "running", "waiting_room", "paused"].includes(activeSession.status?.toLowerCase()) ? (
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    Sesi Live Berlangsung
                  </span>
                ) : ["completed", "finished", "selesai"].includes(activeSession.status?.toLowerCase()) ? (
                  <span className="rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    Sesi Ujian Selesai
                  </span>
                ) : (
                  <span className="rounded-full bg-blue-100 border border-blue-300 px-3 py-1 text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    Sesi Terjadwal
                  </span>
                )}
                <span className="text-xs text-slate-600 font-medium truncate max-w-md hidden sm:inline">
                  Sesi: <strong className="text-slate-900">{activeSession.title}</strong>
                </span>
              </>
            ) : (
              <>
                <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Sistem Standby
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Hari ini, {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto min-w-0 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}