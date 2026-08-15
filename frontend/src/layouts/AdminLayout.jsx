import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Monitor,
  CalendarDays,
  Users,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Bell,
  BookOpen,
  User,
  ChevronUp,
} from "lucide-react";

import { useAuth } from "@/context/AuthProvider";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  {
    title: "Monitor Langsung",
    icon: Monitor,
    path: "/admin/live",
  },
  {
    title: "Kelola Sesi OSCE",
    icon: CalendarDays,
    path: "/admin/sessions",
  },
  {
    title: "Bank Soal & Kasus",
    icon: BookOpen,
    path: "/admin/cases",
  },
  {
    title: "Peserta",
    icon: Users,
    path: "/admin/participants",
  },
  {
    title: "Penguji",
    icon: GraduationCap,
    path: "/admin/examiners",
  },
  {
    title: "Laporan",
    icon: FileText,
    path: "/admin/reports",
  },
];

export default function AdminLayout({ children, headerAction }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
  }

  return (
    <div className="flex h-screen bg-slate-100">

      {/* Sidebar */}

      <aside className="flex w-72 flex-col border-r bg-white shadow-xs">

        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Praxis Logo" className="h-10 w-10 object-contain rounded-xl shadow-md" />
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                Praxis <span className="text-blue-600">OSCE</span>
              </h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Portal Admin Institusi
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">

          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                end={menu.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={18} />
                <span>{menu.title}</span>
              </NavLink>
            );
          })}

        </nav>

        {/* Sidebar Footer with Profile & Logout */}
        <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50/50">

          {/* Interactive Profile Card */}
          <div className="relative">
            <div
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-2.5 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={
                    user?.user_metadata?.avatar_url ??
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || "Admin")}&background=2563eb&color=fff`
                  }
                  alt="Administrator"
                  className="h-9 w-9 shrink-0 rounded-xl border border-slate-200 object-cover shadow-2xs group-hover:scale-105 transition"
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {user?.user_metadata?.full_name ?? user?.email ?? "Admin Medskill"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    Administrator
                  </p>
                </div>
              </div>
              <ChevronUp size={16} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Popover Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in slide-in-from-bottom-2 duration-150 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Sesi Akun Terhubung
                  </p>
                  <p className="text-xs font-extrabold text-slate-800 truncate">
                    {user?.email || "officemedskill.idn@gmail.com"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate("/admin/profile");
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition flex items-center gap-2.5"
                >
                  <User size={15} className="text-blue-600" />
                  Pengaturan Profil Admin
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate("/admin/settings");
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition flex items-center gap-2.5"
                >
                  <Settings size={15} className="text-slate-500" />
                  Pengaturan Sistem OSCE
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-black text-white transition hover:bg-red-700 active:scale-98 shadow-md"
          >
            <LogOut size={16} />
            Keluar Sistem (Logout)
          </button>

        </div>

      </aside>

      {/* Content */}

      <div className="flex flex-1 flex-col">

        <header className="flex h-20 items-center justify-between border-b bg-white px-8">

          <div>
            <h2 className="text-2xl font-bold">
              Dashboard Administrator
            </h2>

            <p className="text-sm text-slate-500">
              Sistem Manajemen Simulasi OSCE
            </p>
          </div>

          <div className="flex items-center gap-3">
            {headerAction ? (
              headerAction
            ) : (
              <button className="relative rounded-xl bg-slate-100 p-2.5 transition hover:bg-slate-200">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </button>
            )}
          </div>

        </header>

        <main className="flex-1 overflow-y-auto p-8">

          {children}

        </main>

      </div>

    </div>
  );
}