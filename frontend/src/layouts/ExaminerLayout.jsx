import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
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
    title: "Live Monitor",
    icon: Activity,
    path: "/examiner/live",
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

          <h1 className="text-2xl font-bold text-blue-700">
            Praxis
          </h1>

          <p className="text-sm text-slate-500">
            MedSkill OSCE Examiner
          </p>

        </div>

        <nav className="flex-1 space-y-2 p-4">

          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                end={menu.path === "/examiner"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white"
          >
            <LogOut size={18} />
            Logout
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
              Praxis by MedSkill Indonesia
            </p>

          </div>

          <div className="text-right">

            <p className="font-semibold">
              {user?.user_metadata?.full_name ?? user?.email}
            </p>

            <p className="text-sm text-slate-500">
              Penguji OSCE
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