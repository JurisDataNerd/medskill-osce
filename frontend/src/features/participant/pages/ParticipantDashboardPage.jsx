import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  LogOut,
  MapPin,
  Play,
  Stethoscope,
  User,
  Users,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";


import { useAuth } from "@/context/AuthProvider";
import {
  MOCK_PARTICIPANT_PROFILE,
  OPEN_OSCE_SESSIONS,
  MY_PAST_RESULTS,
} from "@/features/participant/data/mockParticipantData";

export default function ParticipantDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [openSessions, setOpenSessions] = useState(OPEN_OSCE_SESSIONS);
  const [activeEnrolledSession, setActiveEnrolledSession] = useState(
    OPEN_OSCE_SESSIONS.find((s) => s.is_registered) || null
  );

  async function handleLogout() {
    if (logout) await logout();
    window.location.href = "/login";
  }

  function handleEnrollSession(sessionId) {
    setOpenSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, is_registered: true } : s))
    );

    const enrolled = openSessions.find((s) => s.id === sessionId);
    setActiveEnrolledSession(enrolled);

    alert(
      `Pendaftaran berhasil! Anda telah resmi terdaftar pada "${enrolled.title}". Silakan masuk ke ruang ujian.`
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Navbar Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black shadow-md shadow-blue-600/30">
              <Stethoscope size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                Praxis <span className="text-blue-600">OSCE</span>
              </h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Portal Peserta Ujian
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
              <img
                src={MOCK_PARTICIPANT_PROFILE.avatar}
                alt={MOCK_PARTICIPANT_PROFILE.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-blue-500 shadow-2xs"
              />
              <div className="hidden sm:block">
                <p className="font-bold text-xs text-slate-900 leading-tight">
                  {MOCK_PARTICIPANT_PROFILE.name}
                </p>
                <p className="text-[11px] text-slate-500 font-semibold">
                  NIM: {MOCK_PARTICIPANT_PROFILE.nim}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={MOCK_PARTICIPANT_PROFILE.avatar}
                alt={MOCK_PARTICIPANT_PROFILE.name}
                className="h-16 w-16 rounded-full border-4 border-white/30 object-cover shadow-lg"
              />
              <div>
                <span className="rounded-full bg-blue-500/30 px-3 py-0.5 text-xs font-bold text-blue-200 border border-blue-400/30">
                  Peserta Ujian Medis
                </span>
                <h1 className="mt-1 text-2xl font-bold">{MOCK_PARTICIPANT_PROFILE.name}</h1>
                <p className="text-xs text-blue-200 mt-0.5">
                  NIM: <strong>{MOCK_PARTICIPANT_PROFILE.nim}</strong> • {MOCK_PARTICIPANT_PROFILE.institution}
                </p>
              </div>
            </div>

            {activeEnrolledSession ? (
              <button
                onClick={() => navigate(`/participant/session/${activeEnrolledSession.id}`)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-600 active:scale-95"
              >
                <Play size={18} />
                Masuk ke Ruang Ujian Live
              </button>
            ) : (
              <span className="rounded-2xl bg-amber-500/20 border border-amber-400/30 px-4 py-2.5 text-xs font-bold text-amber-200 flex items-center gap-2">
                <AlertCircle size={16} />
                Belum terdaftar pada sesi live aktif
              </span>
            )}
          </div>
        </div>

        {/* Stat Summary Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-2">
              <GraduationCap size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Status Pendaftaran</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">
              {activeEnrolledSession ? "Terdaftar Sesi Live" : "Belum Terdaftar"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeEnrolledSession ? activeEnrolledSession.title.substring(0, 25) + "..." : "Siap bergabung ke sesi"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-2">
              <CalendarDays size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Sesi OSCE Terbuka</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{openSessions.length} Sesi Tersedia</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Siap untuk diikuti</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-2">
              <CheckCircle2 size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Ujian Pernah Diikuti</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{MY_PAST_RESULTS.length} Sesi Selesai</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Rekapitulasi terverifikasi</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-2">
              <Award size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Rata-Rata Nilai Peserta</p>
            <p className="text-xl font-bold text-blue-700 mt-0.5">90.2 / 100</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Kategori: Superior</p>
          </div>
        </div>

        {/* Section 1: Daftar Sesi OSCE Terbuka & Tersedia */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-600" />
                Daftar Sesi Ujian OSCE Terbuka & Tersedia
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih sesi ujian OSCE di bawah untuk bergabung dan mengikuti penilaian keterampilan klinis.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {openSessions.length} Sesi Aktif
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {openSessions.map((sess) => (
              <div
                key={sess.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Pendaftaran Terbuka
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      {sess.total_stations} Stase Medis
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {sess.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {sess.description}
                  </p>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{sess.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span>
                        {sess.session_date} • {sess.start_time} - {sess.end_time} ({sess.duration_per_station}/stase)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">
                    Kapasitas: {sess.registered_participants}/{sess.max_participants} Peserta
                  </span>

                  {sess.is_registered ? (
                    <button
                      onClick={() => navigate(`/participant/session/${sess.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition"
                    >
                      <Play size={15} />
                      Masuk Ujian Live
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnrollSession(sess.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
                    >
                      Daftar / Ikuti Sesi Ini
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </di        {/* Section 2: Riwayat Hasil Ujian & Rekap Evaluasi Peserta */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award size={18} className="text-blue-600" />
                Hasil & Rekap Nilai Ujian OSCE Sebelumnya (Minimal 6 Stase)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Riwayat perolehan akumulasi skor 6 stase dan umpan balik dokter penguji spesialis.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-blue-700">
              1 Sesi = Minimal 6 Stase & 6 Dokter Penguji
            </span>
          </div>

          {/* Info Banner 6 Stase OSCE */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 flex items-start gap-3 text-xs text-slate-700">
            <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-900">Catatan Struktur Ujian OSCE:</p>
              <p className="mt-0.5 text-slate-600 font-medium">
                Setiap 1 Sesi Ujian OSCE terdiri dari <strong>minimal 6 Stase Keterampilan Medis</strong> yang berjalan secara rotasi. Setiap stase diuji secara independen oleh Dokter Penguji Spesialis yang berbeda dengan rubrik penilaian baku. Nilai akhir merupakan akumulasi rata-rata perolehan dari seluruh 6 stase.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-100/80 font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nama Sesi OSCE</th>
                  <th className="px-4 py-3">Jumlah Stase</th>
                  <th className="px-4 py-3">Lokasi Ujian</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Rata-Rata Skor (6 Stase)</th>
                  <th className="px-4 py-3">Global Rating</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {MY_PAST_RESULTS.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {res.title}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-bold text-slate-700">
                        {res.evaluated_stations || res.total_stations} Stase Selesai
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {res.location}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {res.session_date}
                    </td>
                    <td className="px-4 py-3.5 font-black text-blue-700 text-sm">
                      {res.avg_score || res.score} / 100
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${
                          (res.final_global_rating || res.global_rating) === "SUPERIOR"
                            ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {res.final_global_rating || res.global_rating}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/participant/results/${res.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-600 transition active:scale-95"
                      >
                        Detail 6 Stase & PDF
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
div>
      </main>
    </div>
  );
}