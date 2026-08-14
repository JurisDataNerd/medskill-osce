import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  FileCheck2,
  LayoutDashboard,
  ChevronDown,
  User,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

export default function ParticipantNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const participantName = user?.user_metadata?.full_name || user?.email || "Peserta Ujian";
  const nimNumber = user?.user_metadata?.nim || "20200710042";

  // Get User Initials for Avatar
  const initials = participantName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-3.5 shadow-2xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        {/* Brand Header */}
        <div
          onClick={() => navigate("/participant")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src="/favicon.svg" alt="Praxis Logo" className="h-10 w-10 object-contain rounded-xl shadow-md group-hover:scale-105 transition transform" />
          <div>
            <h1 className="text-base font-black text-slate-900 leading-tight group-hover:text-blue-600 transition">
              Portal Peserta OSCE MedSkill
            </h1>
            <p className="text-[11px] font-medium text-slate-500">
              Fakultas Kedokteran • Sistem Ujian Sirkuit Terpadu
            </p>
          </div>
        </div>

        {/* Right Navigation & Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* Profile Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 transition hover:bg-white hover:border-blue-300 hover:shadow-md active:scale-95"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-xs border border-white">
                {initials || "P"}
              </div>
              <div className="text-left hidden md:block max-w-[130px] truncate">
                <span className="text-xs font-extrabold text-slate-900 block truncate leading-tight">
                  {participantName.split(",")[0]}
                </span>
                <span className="text-[10px] font-bold text-blue-600 block leading-tight truncate">
                  NIM: {nimNumber}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu Modal */}
            {isOpen && (
              <div className="absolute right-0 mt-2.5 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150 z-50 space-y-2">
                {/* Profile Header Info */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm shadow-md border-2 border-white">
                    {initials || "P"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {participantName}
                    </p>
                    <p className="text-[10px] font-bold text-blue-600 truncate mt-0.5">
                      NIM: {nimNumber}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.5 mt-1">
                      <ShieldCheck size={10} />
                      Mahasiswa Klinik FK
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 my-1" />

                {/* Navigation Links */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/participant");
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                      location.pathname === "/participant"
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <LayoutDashboard size={16} className="text-blue-600" />
                    <span>Dashboard Utama</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/participant/history");
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                      location.pathname === "/participant/history"
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <FileCheck2 size={16} className="text-blue-600" />
                    <span>Riwayat & Transkrip Ujian</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/participant/profile");
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                      location.pathname === "/participant/profile"
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <User size={16} className="text-blue-600" />
                    <span>Edit Profil Saya</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 my-1" />

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                >
                  <LogOut size={16} />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
