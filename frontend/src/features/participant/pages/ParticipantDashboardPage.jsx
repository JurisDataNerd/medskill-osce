import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  LogOut,
  MapPin,
  Play,
  Info,
  Hourglass,
  XCircle,
  PlayCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  FileCheck2,
  Loader2,
  Building2,
  Activity,
  Layers,
  Zap,
} from "lucide-react";

import { useAuth } from "@/context/AuthProvider";
import { fetchSessions } from "@/services/sessionService";
import { getSessionParticipants } from "@/services/session.service";
import { supabase } from "@/lib/supabaseClient";

import ParticipantNavbar from "@/features/participant/components/ParticipantNavbar";

export default function ParticipantDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [registrationStatuses, setRegistrationStatuses] = useState({});
  const [activeTab, setActiveTab] = useState("enrolled"); // "enrolled" | "history"
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadParticipantDashboard(isInitial = false) {
      try {
        if (isInitial) setLoading(true);
        const data = await fetchSessions();
        setSessions(data || []);

        const statusMap = {};
        if (data && data.length > 0) {
          for (const s of data) {
            try {
              const list = await getSessionParticipants(s.id);
              const p = list.find(
                (item) =>
                  item.nim === "2026-MED-0982" ||
                  item.nim === "20200710042" ||
                  item.full_name?.toLowerCase().includes("kairav")
              );
              if (p) {
                statusMap[s.id] = p.status || "pending";
              } else {
                statusMap[s.id] = "pending";
              }
            } catch (e) {
              statusMap[s.id] = "pending";
            }
          }
        }
        setRegistrationStatuses(statusMap);
      } catch (err) {
        console.error("Error loading participant sessions from Supabase:", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    }

    loadParticipantDashboard(true);

    const interval = setInterval(() => {
      loadParticipantDashboard(false);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const ongoingSession = sessions.find((s) => s.status === "ongoing" || s.status === "running");
  const availableSessions = sessions.filter((s) => s.status === "published" || s.status === "scheduled" || s.status === "ongoing" || s.status === "running");

  const filteredSessions = availableSessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.location_building && s.location_building.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 text-xs font-semibold text-slate-500">
        <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
        Memuat Portal Peserta Mahasiswa Supabase...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Top Navigation Bar */}
      <ParticipantNavbar />

      {/* Main Container */}
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        {/* ACTIVE ONGOING SESSION LIVE BANNER */}
        {ongoingSession ? (
          <div className="rounded-3xl border border-emerald-300 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-7 text-white shadow-xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1 text-xs font-black text-emerald-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                    SESI UJIAN OSCE SEDANG BERLANGSUNG (LIVE)
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white sm:text-3xl">
                  {ongoingSession.title}
                </h2>

                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Sesi ujian sirkuit telah diaktifkan oleh Admin Control Room. Silakan segera masuk ke Kiosk Ujian untuk melihat posisi stase awal dan petunjuk skenario klinis.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1">
                    <Building2 size={14} className="text-emerald-400" />
                    {ongoingSession.location_building || "Gedung Skill Lab RS Pendidikan"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Layers size={14} className="text-emerald-400" />
                    {ongoingSession.total_stations || 8} Pos Rotasi
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => navigate(`/participant/session/${ongoingSession.id}`)}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-6 py-4 text-sm font-black text-slate-950 shadow-xl transition active:scale-95 animate-bounce"
                >
                  <PlayCircle size={20} />
                  Masuk ke Kiosk Ujian OSCE Live
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 text-white shadow-lg flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-bold text-blue-300 mb-2">
                <Info size={14} />
                Sistem Standby • Tidak Ada Sesi Ujian Aktif Saat Ini
              </div>
              <h2 className="text-xl font-extrabold text-white">Selamat Datang di Portal Ujian OSCE</h2>
              <p className="text-xs text-slate-300 mt-1">
                Jadwal ujian sirkuit Anda akan muncul di bawah ini ketika Admin memulai sesi ujian secara live.
              </p>
            </div>
          </div>
        )}

        {/* Registered Sessions List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-600" />
              Daftar Sesi Ujian Sirkuit Terdaftar ({filteredSessions.length} Sesi)
            </h3>

            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari sesi ujian..."
                className="rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {filteredSessions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredSessions.map((sess) => {
                const userRegStatus = registrationStatuses[sess.id] || "pending";

                return (
                  <div
                    key={sess.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 shadow-2xs hover:border-blue-300 hover:bg-white transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                            sess.status === "ongoing" || sess.status === "running"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-indigo-100 text-indigo-900 border border-indigo-300"
                          }`}
                        >
                          {sess.status === "ongoing" || sess.status === "running" ? (
                            <>
                              <Zap size={11} className="text-emerald-700 animate-pulse fill-emerald-500" />
                              Live Berlangsung
                            </>
                          ) : (
                            "Dipublikasikan (Terjadwal)"
                          )}
                        </span>

                        {/* Status Approval Pendaftaran Peserta Saya */}
                        {userRegStatus === "approved" ? (
                          <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-900 inline-flex items-center gap-1 uppercase">
                            <CheckCircle2 size={11} className="text-emerald-700" />
                            Disetujui Admin
                          </span>
                        ) : userRegStatus === "rejected" ? (
                          <span className="rounded-md bg-red-100 border border-red-300 px-2 py-0.5 text-[10px] font-black text-red-900 inline-flex items-center gap-1 uppercase">
                            <XCircle size={11} className="text-red-700" />
                            Pendaftaran Ditolak
                          </span>
                        ) : (
                          <span className="rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-900 inline-flex items-center gap-1 uppercase">
                            <Hourglass size={11} className="text-amber-700 animate-pulse" />
                            Menunggu Approval
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{sess.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {sess.description || "Sesi evaluasi sirkuit terpadu 6 stase aktif."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                          <span className="text-slate-400 text-[10px] block font-bold">Total Stase</span>
                          <span className="font-black text-slate-900">{sess.total_stations || 6} Pos</span>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                          <span className="text-slate-400 text-[10px] block font-bold">Durasi / Pos</span>
                          <span className="font-black text-slate-900">{sess.station_duration_minutes || 12} Mnt</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60">
                      {userRegStatus === "approved" ? (
                        <button
                          onClick={() => navigate(`/participant/session/${sess.id}`)}
                          className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 ${
                            sess.status === "ongoing" || sess.status === "running"
                              ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 animate-pulse"
                              : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
                          }`}
                        >
                          {sess.status === "ongoing" || sess.status === "running" ? (
                            <>
                              <PlayCircle size={16} />
                              Masuk Sesi Live Ujian
                            </>
                          ) : (
                            <>
                              <Play size={15} />
                              Buka Kiosk Standby Sesi
                            </>
                          )}
                        </button>
                      ) : userRegStatus === "rejected" ? (
                        <button
                          disabled
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-100 border border-red-300 px-4 py-2.5 text-xs font-bold text-red-700 opacity-80 cursor-not-allowed"
                        >
                          <XCircle size={15} />
                          Pendaftaran Ditolak Admin
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            alert(
                              "Pendaftaran Anda pada sesi ini masih MENUNGGU APPROVAL ADMIN. Kiosk Ujian hanya dapat diakses setelah Admin menyetujui pendaftaran Anda di Dashboard Administrator."
                            )
                          }
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md transition active:scale-95"
                        >
                          <Hourglass size={15} className="animate-spin" />
                          Menunggu Approval Admin
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center space-y-4 animate-in fade-in duration-200">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs">
                <CalendarDays size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-slate-900">
                  Belum Ada Sesi Ujian Aktif / Terdaftar Saat Ini
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                  Sesi ujian sirkuit yang dipublikasikan oleh Admin Control Room akan secara otomatis muncul di sini saat sesi ujian diaktifkan. Silakan klik tombol di bawah ini untuk memuat ulang status jadwal.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
                >
                  <Activity size={15} />
                  Refresh Jadwal Ujian
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}