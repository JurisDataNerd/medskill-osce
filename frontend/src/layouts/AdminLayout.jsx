import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Monitor,
  CalendarDays,
  ClipboardList,
  MapPinned,
  Users,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Bell,
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
    title: "Sesi OSCE",
    icon: CalendarDays,
    path: "/admin/sessions",
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
    title: "Kasus",
    icon: ClipboardList,
    path: "/admin/cases",
  },
  {
    title: "Stase",
    icon: MapPinned,
    path: "/admin/stations",
  },
  {
    title: "Laporan",
    icon: FileText,
    path: "/admin/reports",
  },
  {
    title: "Pengaturan",
    icon: Settings,
    path: "/admin/settings",
  },
];

export default function AdminLayout({ children }) {
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  return (
    <div className="flex h-screen bg-slate-100">

      {/* Sidebar */}
      <aside className="flex w-72 flex-col border-r bg-white">

        <div className="border-b p-6">
          <h1 className="text-2xl font-bold">MedSkill</h1>

          <p className="text-sm text-slate-500">
            OSCE Control Room
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">

          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                end={menu.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={20} />
                <span>{menu.title}</span>
              </NavLink>
            );
          })}

        </nav>

        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-medium text-white transition hover:bg-red-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col">

        <header className="flex h-20 items-center justify-between border-b bg-white px-8">

          <div>
            <h2 className="text-2xl font-bold">
              Admin Dashboard
            </h2>

            <p className="text-sm text-slate-500">
              MedSkill OSCE Management
            </p>
          </div>

          <div className="flex items-center gap-6">

            <button className="relative rounded-xl bg-slate-100 p-3">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <div className="text-right">
              <p className="font-semibold">
                {user?.user_metadata?.full_name ?? user?.email}
              </p>

              <p className="text-sm capitalize text-slate-500">
                {user?.user_metadata?.role ?? "admin"}
              </p>
            </div>

            <img
              src={
                user?.user_metadata?.avatar_url ??
                "https://ui-avatars.com/api/?name=Admin"
              }
              alt="avatar"
              className="h-12 w-12 rounded-full"
            />

          </div>

        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>

      </div>

    </div>
  );
}