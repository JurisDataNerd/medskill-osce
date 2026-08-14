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
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthProvider";
import { fetchSessions } from "@/services/sessionService";
import { getSessionParticipants, registerParticipantToSession } from "@/services/session.service";
import { supabase } from "@/lib/supabaseClient";

import ParticipantNavbar from "@/features/participant/components/ParticipantNavbar";
import SessionRegistrationModal from "@/components/landing/SessionRegistrationModal";
import ConfirmModal from "@/components/ConfirmModal";
import { ParticipantDashboardSkeleton } from "@/components/ui/Skeleton";

export default function ParticipantDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [registrationStatuses, setRegistrationStatuses] = useState({});
  const [activeTab, setActiveTab] = useState("enrolled"); // "enrolled" | "history"
  const [searchQuery, setSearchQuery] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Mengerti",
    variant: "warning",
    isAlert: true,
    onConfirm: null,
  });
  const [selectedSessionForModal, setSelectedSessionForModal] = useState(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [pendingModalSession, setPendingModalSession] = useState(null);

  useEffect(() => {
    async function loadParticipantDashboard(isInitial = false) {
      try {
        if (isInitial) setLoading(true);
        const data = await fetchSessions();
        setSessions(data || []);

        const statusMap = {};
        if (data && data.length > 0) {
          const { data: authData } = await supabase.auth.getUser();
          const currentUser = authData?.user || user;

          for (const s of data) {
            try {
              const list = await getSessionParticipants(s.id);
              const p = list.find(
                (item) =>
                  (currentUser?.id && item.user_id === currentUser.id) ||
                  (currentUser?.email && item.email === currentUser.email)
              );
              if (p) {
                statusMap[s.id] = p.status || "pending";
              } else {
                statusMap[s.id] = "not_registered";
              }
            } catch (e) {
              statusMap[s.id] = "not_registered";
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
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  function handleOpenRegisterModal(sess) {
    setSelectedSessionForModal(sess);
    setIsRegistrationModalOpen(true);
  }

  async function handleRegister(sessionId) {
    try {
      await registerParticipantToSession(sessionId, user);
      setRegistrationStatuses((prev) => ({ ...prev, [sessionId]: "pending" }));
    } catch (err) {
      console.error("Gagal mendaftar ke database Supabase:", err);
      setConfirmModal({
        isOpen: true,
        title: "Gagal Pendaftaran Sesi",
        message: err.message || "Gagal mendaftar sesi ke database Supabase.",
        confirmText: "Mengerti",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setIsRegistrationModalOpen(false);
    }
  }

  const [filterTab, setFilterTab] = useState("all"); // "all" (Sesi OSCE / belum terdaftar) | "my_sessions" | "completed"

  const ongoingSession = sessions.find((s) => s.status === "ongoing" || s.status === "running" || s.status === "waiting_room");

  const unregisteredCount = sessions.filter((s) => {
    const isComp = s.status === "completed" || s.status === "published_results" || s.status === "finished";
    const st = registrationStatuses[s.id] || "not_registered";
    return !isComp && st === "not_registered";
  }).length;

  const mySessionsCount = sessions.filter((s) => {
    const isComp = s.status === "completed" || s.status === "published_results" || s.status === "finished";
    const st = registrationStatuses[s.id];
    return !isComp && (st === "approved" || st === "pending" || st === "rejected");
  }).length;

  const completedCount = sessions.filter((s) => {
    const isComp = s.status === "completed" || s.status === "published_results" || s.status === "finished";
    const st = registrationStatuses[s.id];
    return isComp || st === "completed";
  }).length;

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.location_building && s.location_building.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    const userRegStatus = registrationStatuses[s.id] || "not_registered";
    const isComp = s.status === "completed" || s.status === "published_results" || s.status === "finished" || userRegStatus === "completed";

    if (filterTab === "all") {
      return !isComp && userRegStatus === "not_registered";
    }
    if (filterTab === "my_sessions") {
      return !isComp && (userRegStatus === "approved" || userRegStatus === "pending" || userRegStatus === "rejected");
    }
    if (filterTab === "completed") {
      return isComp;
    }
    return true;
  });

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

        {/* Registered Sessions List Header with Filter Tabs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-600" />
                Daftar Sesi Ujian Sirkuit
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Filter dan pilih sesi ujian sesuai status pendaftaran Anda.
              </p>
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari sesi ujian..."
                className="rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none transition min-w-[200px]"
              />
            </div>
          </div>

          {/* Filter Tabs Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer active:scale-95 ${
                filterTab === "all"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <Layers size={14} />
              <span>Sesi OSCE</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                filterTab === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {unregisteredCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("my_sessions")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer active:scale-95 ${
                filterTab === "my_sessions"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 size={14} />
              <span>Sesi Saya</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                filterTab === "my_sessions" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {mySessionsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("completed")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer active:scale-95 ${
                filterTab === "completed"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <Award size={14} />
              <span>Telah Selesai</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                filterTab === "completed" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {completedCount}
              </span>
            </button>
          </div>

          {filteredSessions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredSessions.map((sess) => {
                const userRegStatus = registrationStatuses[sess.id] || "not_registered";
                const isCompleted =
                  sess.status === "completed" ||
                  sess.status === "published" ||
                  sess.status === "published_results" ||
                  sess.status === "finished" ||
                  userRegStatus === "completed";

                return (
                  <div
                    key={sess.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 shadow-2xs hover:border-blue-300 hover:bg-white transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                            isCompleted
                              ? "bg-purple-100 text-purple-900 border border-purple-300"
                              : sess.status === "ongoing" || sess.status === "running"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-indigo-100 text-indigo-900 border border-indigo-300"
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 size={11} className="text-purple-700" />
                              Sesi Ujian Selesai
                            </>
                          ) : sess.status === "ongoing" || sess.status === "running" ? (
                            <>
                              <Zap size={11} className="text-emerald-700 animate-pulse fill-emerald-500" />
                              Live Berlangsung
                            </>
                          ) : (
                            "Dipublikasikan (Terjadwal)"
                          )}
                        </span>

                        {/* Status Approval Pendaftaran Peserta Saya */}
                        {isCompleted ? (
                          <span className="rounded-md bg-purple-100 border border-purple-300 px-2 py-0.5 text-[10px] font-black text-purple-900 inline-flex items-center gap-1 uppercase">
                            <Award size={11} className="text-purple-700" />
                            Hasil Nilai Terbit
                          </span>
                        ) : userRegStatus === "approved" ? (
                          <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-900 inline-flex items-center gap-1 uppercase">
                            <CheckCircle2 size={11} className="text-emerald-700" />
                            Disetujui Admin
                          </span>
                        ) : userRegStatus === "rejected" ? (
                          <span className="rounded-md bg-red-100 border border-red-300 px-2 py-0.5 text-[10px] font-black text-red-900 inline-flex items-center gap-1 uppercase">
                            <XCircle size={11} className="text-red-700" />
                            Pendaftaran Ditolak
                          </span>
                        ) : userRegStatus === "pending" ? (
                          <span className="rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-900 inline-flex items-center gap-1 uppercase">
                            <Hourglass size={11} className="text-amber-700 animate-pulse" />
                            Menunggu Approval
                          </span>
                        ) : (
                          <span className="rounded-md bg-slate-200 border border-slate-300 px-2 py-0.5 text-[10px] font-black text-slate-700 inline-flex items-center gap-1 uppercase">
                            Belum Terdaftar
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
                      {isCompleted ? (
                        <button
                          onClick={() => navigate(`/participant/results/${sess.id}`)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/30 transition active:scale-95"
                        >
                          <Award size={16} />
                          Lihat Hasil & Transkrip Nilai
                        </button>
                      ) : userRegStatus === "approved" ? (
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
                      ) : userRegStatus === "pending" ? (
                        <button
                          onClick={() => setPendingModalSession(sess)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md transition active:scale-95"
                        >
                          <Hourglass size={15} className="animate-spin" />
                          Menunggu Approval Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenRegisterModal(sess)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
                        >
                          <ArrowRight size={15} />
                          Daftar Sesi Ujian Ini
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

      {/* Modal Konfirmasi Pendaftaran Sesi */}
      <SessionRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onConfirm={handleRegister}
        session={selectedSessionForModal}
        userProfile={{
          name: user?.user_metadata?.full_name || user?.email || "dr. Kairav Mahardika",
          nim: user?.user_metadata?.nim || "20200710042",
          institution: "Fakultas Kedokteran - MedSkill Indonesia",
        }}
      />

      {/* Modal Informasi Status Menunggu Approval (Pending) */}
      {pendingModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="flex flex-col w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-200 bg-amber-500 text-slate-950 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-md">
                  <Hourglass size={20} className="animate-spin" />
                </div>
                <div>
                  <h2 className="text-base font-black leading-tight">
                    Pendaftaran Menunggu Approval
                  </h2>
                  <p className="text-xs text-slate-950 font-semibold opacity-90">
                    Verifikasi Admin Control Room
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPendingModalSession(null)}
                className="rounded-xl border border-amber-600/40 bg-amber-400 p-2 text-slate-950 hover:bg-amber-300 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 bg-slate-50/50">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                  <Info size={16} className="text-amber-700" />
                  <span>Status Pendaftaran: MENUNGGU VERIFIKASI</span>
                </div>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  Pendaftaran Anda pada sesi <strong className="font-bold">{pendingModalSession.title}</strong> saat ini masih dalam status <strong className="font-bold">Menunggu Approval Admin</strong>.
                </p>
              </div>

              {/* Details Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Informasi Sesi Terdaftar:
                </h4>
                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Nama Sesi</span>
                    <span className="font-extrabold text-slate-900 text-right max-w-[240px] truncate">{pendingModalSession.title}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Lokasi Gedung</span>
                    <span className="font-bold text-slate-800">{pendingModalSession.location_building || "Gedung Skill Lab RS"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Sirkuit Rotasi</span>
                    <span className="font-bold text-slate-800">{pendingModalSession.total_stations || 6} Pos Stase Aktif</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Akses Kiosk Live</span>
                    <span className="inline-flex items-center gap-1 text-amber-800 font-black uppercase bg-amber-100 border border-amber-300 rounded-md px-2 py-0.5 text-[10px]">
                      <Hourglass size={11} className="animate-spin" />
                      Pending Approval Admin
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 font-medium leading-relaxed">
                ℹ️ <strong>Informasi Tambahan:</strong> Kiosk Ujian dan instruksi pengerjaan stase akan secara otomatis terbuka setelah Admin Control Room menyetujui pendaftaran Anda di Dashboard Administrator.
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end">
              <button
                onClick={() => setPendingModalSession(null)}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition active:scale-95"
              >
                Saya Mengerti (Tutup)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm & Alert Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        isAlert={confirmModal.isAlert}
      />
    </div>
  );
}