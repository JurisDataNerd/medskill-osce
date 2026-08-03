import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  History,
  LogOut,
  UserCheck,
  Stethoscope,
  Award,
} from "lucide-react";

import { useAuth } from "@/context/AuthProvider";
import { CURRENT_EXAMINER_PROFILE } from "@/features/examiner/data/mockExaminerData";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/examiner",
  },
  {
    title: "Pengujian Live",
    icon: Activity,
    path: "/examiner/stage/stage-101",
  },
  {
    title: "Riwayat Pengujian",
    icon: History,
    path: "/examiner/history",
  },
];

export default function ExaminerLayout({ children }) {
  const { logout } = useAuth();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="flex w-72 flex-col border-r border-slate-200 bg-white shadow-xs">
        {/* Brand Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black shadow-md shadow-blue-600/30">
              <Stethoscope size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Praxis <span className="text-blue-600">OSCE</span>
              </h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Portal Dokter Penguji
              </p>
            </div>
          </div>
        </div>

        {/* Examiner Info Widget */}
        <div className="p-4 mx-3 my-3 rounded-2xl border border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <img
              src={CURRENT_EXAMINER_PROFILE.avatar}
              alt={CURRENT_EXAMINER_PROFILE.name}
              className="h-10 w-10 rounded-full object-cover border-2 border-blue-500 shadow-2xs"
            />
            <div className="overflow-hidden">
              <p className="font-bold text-xs text-slate-900 truncate">
                {CURRENT_EXAMINER_PROFILE.name}
              </p>
              <p className="text-[11px] text-blue-700 font-semibold truncate">
                {CURRENT_EXAMINER_PROFILE.specialty}
              </p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1.5 p-4">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Utama Penguji
          </div>

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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                <span>{menu.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
          >
            <LogOut size={16} />
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Sesi Live Aktif
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Stase Penugasan: <strong>{CURRENT_EXAMINER_PROFILE.assigned_station_title}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Hari ini, {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}