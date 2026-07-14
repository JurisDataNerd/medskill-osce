import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  CalendarDays,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/context/AuthProvider";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/examiner",
  },
  {
    title: "Sesi Saya",
    icon: CalendarDays,
    path: "/examiner/sessions",
  },
  {
    title: "Penilaian",
    icon: ClipboardCheck,
    path: "/examiner/scoring",
  },
];

export default function ExaminerLayout({ children }) {
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  return (
    <div className="flex h-screen bg-slate-100">

      <aside className="flex w-72 flex-col border-r bg-white">

        <div className="border-b p-6">

          <h1 className="text-2xl font-bold">
            MedSkill
          </h1>

          <p className="text-sm text-slate-500">
            Dashboard Penguji
          </p>

        </div>

        <nav className="flex-1 space-y-1 p-4">

          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                end={menu.path === "/examiner"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 font-medium ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={20} />
                {menu.title}
              </NavLink>
            );
          })}

        </nav>

        <div className="border-t p-4">

          <button
            onClick={handleLogout}
            className="w-full rounded-xl bg-red-600 py-3 text-white"
          >
            <div className="flex items-center justify-center gap-2">
              <LogOut size={18} />
              Logout
            </div>
          </button>

        </div>

      </aside>

      <div className="flex flex-1 flex-col">

        <header className="flex h-20 items-center justify-between border-b bg-white px-8">

          <div>

            <h2 className="text-2xl font-bold">
              Dashboard Penguji
            </h2>

            <p className="text-sm text-slate-500">
              MedSkill OSCE
            </p>

          </div>

          <div className="text-right">

            <p className="font-semibold">
              {user?.user_metadata?.full_name ?? user?.email}
            </p>

            <p className="text-sm text-slate-500">
              Penguji
            </p>

          </div>

        </header>

        <main className="flex-1 overflow-y-auto p-8">

          {children}

        </main>

      </div>

    </div>
  );
}