import { useState } from "react";
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

  const [openSessions] = useState(OPEN_OSCE_SESSIONS);
  const [activeTab, setActiveTab] = useState("enrolled"); // "enrolled" | "history"
  const [searchQuery, setSearchQuery] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const historyItemsPerPage = 5;

  // All sessions registered by the participant
  const enrolledSessions = openSessions.filter((s) => s.is_registered);
  const activeEnrolledSession =
    enrolledSessions.find((s) => s.status === "approved" || s.status === "running") ||
    enrolledSessions[0] ||
    null;

  // Filtered lists based on search query
  const filteredEnrolled = enrolledSessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = MY_PAST_RESULTS.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations for past results
  const totalHistoryPages = Math.ceil(filteredHistory.length / historyItemsPerPage) || 1;
  const historyStartIndex = (historyPage - 1) * historyItemsPerPage;
  const paginatedHistory = filteredHistory.slice(
    historyStartIndex,
    historyStartIndex + historyItemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setHistoryPage(1);
  };

  function renderStatusBadge(status, processStage) {
    if (status === "pending") {
      return (
        <span className="rounded-md bg-amber-100 border border-amber-300 px-2.5 py-1 text-[11px] font-extrabold text-amber-900 flex items-center gap-1.5">
          <Hourglass size={13} className="text-amber-700" />
          Menunggu Persetujuan Admin
        </span>
      );
    }
    if (status === "approved" || status === "assigned") {
      return (
        <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-600" />
          Disetujui Admin (ACC)
        </span>
      );
    }
    if (status === "running") {
      return (
        <span className="rounded-md bg-blue-600 text-white px-2.5 py-1 text-[11px] font-extrabold flex items-center gap-1.5 animate-pulse">
          <PlayCircle size={13} />
          Ujian Live Berlangsung
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="rounded-md bg-rose-100 border border-rose-300 px-2.5 py-1 text-[11px] font-extrabold text-rose-800 flex items-center gap-1.5">
          <XCircle size={13} className="text-rose-600" />
          Pendaftaran Ditolak
        </span>
      );
    }
    return (
      <span className="rounded-md bg-slate-100 border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-700">
        {processStage || status}
      </span>
    );
  }

  function renderActionButton(sess) {
    if (sess.status === "pending") {
      return (
        <button
          disabled
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 cursor-not-allowed opacity-90"
        >
          <Hourglass size={14} className="text-amber-700" />
          Sedang Diverifikasi Admin
        </button>
      );
    }
    if (sess.status === "approved" || sess.status === "assigned" || sess.status === "running") {
      return (
        <button
          onClick={() => navigate(`/participant/session/${sess.id}`)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
        >
          <Play size={15} />
          Masuk Ruang Ujian Live
        </button>
      );
    }
    if (sess.status === "rejected") {
      return (
        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
          <Info size={14} /> Hubungi Admin
        </span>
      );
    }
    return (
      <button
        onClick={() => navigate(`/participant/session/${sess.id}`)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
      >
        Lihat Detail
      </button>
    );
  }

  function handleLogout() {
    if (logout) logout();
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Navbar Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <span className="text-xl font-black text-white leading-none">P</span>
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-8 text-white shadow-xl">
          <div className="relative z-10 flex items-center justify-between gap-6">
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
              {activeEnrolledSession ? "Terdaftar & ACC" : "Belum Terdaftar"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {activeEnrolledSession ? activeEnrolledSession.title : "Daftar di Halaman Utama"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-2">
              <CalendarDays size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Sesi Terdaftar & ACC</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{enrolledSessions.length} Sesi Disetujui</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Siap mengikuti ujian</p>
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

        {/* Unified Tab Navigation Container */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Tab Header Bar */}
          <div className="border-b border-slate-200 bg-slate-50/70 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tabs Buttons */}
            <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-xl">
              <button
                onClick={() => {
                  setActiveTab("enrolled");
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  activeTab === "enrolled"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                }`}
              >
                <CalendarDays size={16} />
                <span>Sesi Ujian Saya</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("history");
                  setSearchQuery("");
                  setHistoryPage(1);
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  activeTab === "history"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                }`}
              >
                <Award size={16} />
                <span>Hasil & Rekap Nilai</span>
              </button>
            </div>

            {/* Search Filter Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder={
                  activeTab === "enrolled"
                    ? "Cari sesi terdaftar..."
                    : "Cari riwayat ujian..."
                }
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>
          </div>

          {/* TAB 1: Sesi Ujian Saya (Card Grid View) */}
          {activeTab === "enrolled" && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck2 size={17} className="text-blue-600" />
                    Daftar Sesi Terdaftar
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Seluruh sesi ujian yang Anda daftarkan beserta verifikasi admin & akses masuk ruang ujian.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  Katalog Sesi Utama
                  <ArrowRight size={14} />
                </button>
              </div>

              {filteredEnrolled.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredEnrolled.map((sess) => (
                    <div
                      key={sess.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-blue-300 hover:shadow-md space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          {renderStatusBadge(sess.status, sess.process_stage)}
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Sirkuit {sess.total_stations || 8} Stase
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
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{sess.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400 shrink-0" />
                            <span>
                              {sess.session_date} • {sess.start_time} - {sess.end_time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Kapasitas: {sess.registered_participants}/{sess.max_participants} Peserta
                        </span>

                        {renderActionButton(sess)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    {searchQuery ? <ListFilter size={24} /> : <CalendarDays size={24} />}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {searchQuery
                      ? `Tidak ada sesi terdaftar cocok dengan "${searchQuery}"`
                      : "Belum Ada Sesi Ujian Terdaftar"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {searchQuery
                      ? "Coba gunakan kata kunci pencarian lokasi atau nama sesi lainnya."
                      : "Anda belum terdaftar pada sesi ujian OSCE yang disetujui. Silakan kunjungi Halaman Utama untuk mendaftar."}
                  </p>
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 transition"
                    >
                      Reset Pencarian
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/")}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                    >
                      Pilih Sesi di Landing Page
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Hasil & Rekap Nilai Ujian (Table View with Pagination) */}
          {activeTab === "history" && (
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award size={17} className="text-blue-600" />
                    Riwayat Evaluasi Ujian OSCE Selesai
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rekapitulasi nilai akumulasi per stase, rating global, dan dokumen laporan evaluasi.
                  </p>
                </div>
              </div>

              {filteredHistory.length > 0 ? (
                <>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-100/80 font-bold text-slate-600 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Nama Sesi OSCE</th>
                          <th className="px-4 py-3">Stase</th>
                          <th className="px-4 py-3">Lokasi Ujian</th>
                          <th className="px-4 py-3">Tanggal</th>
                          <th className="px-4 py-3">Rata-Rata Skor</th>
                          <th className="px-4 py-3">Global Rating</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {paginatedHistory.map((res) => (
                          <tr key={res.id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-3.5 font-bold text-slate-900">
                              {res.title}
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-slate-800">
                              <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-bold text-slate-700">
                                {res.evaluated_stations || res.total_stations} Stase
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
                                Lihat Detail & PDF
                                <ArrowRight size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-slate-500 font-medium">
                      Menampilkan{" "}
                      <strong className="text-slate-800">
                        {filteredHistory.length > 0 ? historyStartIndex + 1 : 0}
                      </strong>{" "}
                      sampai{" "}
                      <strong className="text-slate-800">
                        {Math.min(historyStartIndex + historyItemsPerPage, filteredHistory.length)}
                      </strong>{" "}
                      dari <strong className="text-slate-800">{filteredHistory.length}</strong> riwayat
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={historyPage === 1}
                        onClick={() => setHistoryPage((prev) => Math.max(prev - 1, 1))}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft size={14} />
                        Sebelumnya
                      </button>

                      {Array.from({ length: totalHistoryPages }, (_, idx) => idx + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setHistoryPage(pageNum)}
                            className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                              historyPage === pageNum
                                ? "bg-blue-600 text-white shadow-xs"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      )}

                      <button
                        disabled={historyPage === totalHistoryPages}
                        onClick={() =>
                          setHistoryPage((prev) => Math.min(prev + 1, totalHistoryPages))
                        }
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Berikutnya
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    {searchQuery ? <ListFilter size={24} /> : <Award size={24} />}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {searchQuery
                      ? `Tidak ada riwayat ujian cocok dengan "${searchQuery}"`
                      : "Belum Ada Riwayat Ujian"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {searchQuery
                      ? "Silakan coba kata kunci pencarian lainnya."
                      : "Hasil dan rekapitulasi nilai ujian OSCE akan ditampilkan di sini setelah ujian diselesaikan."}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 transition"
                    >
                      Reset Pencarian
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}