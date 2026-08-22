import { useState, useEffect } from "react";
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
  RotateCw,
  BookOpen,
  User,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
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
    title: "Kelola Sesi",
    icon: CalendarDays,
    path: "/admin/sessions",
  },
  {
    title: "Bank Soal",
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

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    localStorage.setItem("admin_sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  function handleLogout() {
    logout();
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">

      {/* Sidebar */}

      <aside
        className={`flex flex-col border-r bg-white shadow-xs transition-all duration-300 ease-in-out shrink-0 ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >

        {/* Brand Header */}

        <div className="border-b border-slate-200 p-4 flex items-center h-20">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 min-w-0 px-2">
              <img src="/favicon.svg" alt="Praxis Logo" className="h-10 w-10 shrink-0 object-contain rounded-xl shadow-md" />
              <div className="min-w-0">
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none truncate">
                  Praxis <span className="text-blue-600">OSCE</span>
                </h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                  Portal Admin Institusi
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <img src="/favicon.svg" alt="Praxis Logo" className="h-10 w-10 object-contain rounded-xl shadow-md" />
            </div>
          )}
        </div>

        {/* Navigation Links */}

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">

          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                end={menu.path === "/admin"}
                title={isCollapsed ? menu.title : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl py-3 transition text-xs font-bold ${
                    isCollapsed ? "justify-center px-0" : "px-4"
                  } ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{menu.title}</span>}
              </NavLink>
            );
          })}

        </nav>

        {/* Sidebar Footer with Profile & Logout */}

        <div className="border-t border-slate-200 p-3 space-y-2 bg-slate-50/50">

          {/* Interactive Profile Card */}
          <div className="relative">
            <div
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              title={isCollapsed ? (user?.user_metadata?.full_name || "Admin") : undefined}
              className={`flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-2 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer group shadow-2xs ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={
                    user?.user_metadata?.avatar_url ??
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || "Admin")}&background=2563eb&color=fff`
                  }
                  alt="Administrator"
                  className="h-8 w-8 shrink-0 rounded-xl border border-slate-200 object-cover shadow-2xs group-hover:scale-105 transition"
                />
                {!isCollapsed && (
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? "Admin"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                      Administrator
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <ChevronUp size={15} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
              )}
            </div>

            {/* Popover Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className={`absolute bottom-full mb-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in slide-in-from-bottom-2 duration-150 space-y-1 ${
                isCollapsed ? "left-full ml-2 w-48" : "left-0 right-0"
              }`}>
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
                  className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                >
                  <User size={15} className="text-blue-600" />
                  Pengaturan Profil
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate("/admin/settings");
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                >
                  <Settings size={15} className="text-slate-500" />
                  Pengaturan Sistem
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Keluar" : undefined}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-black text-white transition hover:bg-red-700 active:scale-98 shadow-md cursor-pointer ${
              isCollapsed ? "px-0" : ""
            }`}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Keluar</span>}
          </button>

        </div>

      </aside>

      {/* Content */}

      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">

        <header className="flex h-20 items-center justify-between border-b bg-white px-6 md:px-8 shrink-0">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shadow-2xs cursor-pointer"
              title={isCollapsed ? "Buka Sidebar" : "Kecilkan Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <div>
              <h2 className="text-2xl font-bold">
                Dashboard Administrator
              </h2>
              <p className="text-sm text-slate-500 hidden md:block">
                Sistem Manajemen Simulasi OSCE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {headerAction ? (
              headerAction
            ) : (
              <button
                onClick={() => {
                  setIsRefreshing(true);
                  window.location.reload();
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer active:scale-95 shadow-2xs"
                title="Refresh Halaman"
              >
                <RotateCw size={18} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
              </button>
            )}
          </div>

        </header>

        <main className="flex-1 overflow-y-auto min-w-0 p-6 md:p-8">

          {children}

        </main>

      </div>

    </div>
  );
}