import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  ArrowLeft,
  FileCheck2,
  Award,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Building2,
  Layers,
  Search,
  Download,
  Loader2,
  Activity,
  FileText,
} from "lucide-react";

import { useAuth } from "@/context/AuthProvider";
import { fetchParticipantHistory } from "@/services/participantService";

import ParticipantNavbar from "@/features/participant/components/ParticipantNavbar";
import { ParticipantHistorySkeleton } from "@/components/ui/Skeleton";

export default function ParticipantHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [historyList, setHistoryList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const participantName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Tidak ada data";

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const data = await fetchParticipantHistory(user);
        setHistoryList(data || []);
      } catch (err) {
        console.error("Error loading participant history:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [user]);

  const filteredHistory = historyList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <ParticipantHistorySkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-12">
      {/* Top Navigation Bar */}
      <ParticipantNavbar />

      {/* Main Content Container */}
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/participant")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard Utama
          </button>
        </div>

        {/* Page Banner Header */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-7 text-white shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 shadow-sm">
              <FileCheck2 size={26} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 px-3 py-0.5 text-[11px] font-bold text-blue-300">
                Transkrip Kelulusan Ujian
              </span>
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Riwayat & Transkrip Hasil Ujian OSCE
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-2xl">
            Rekapitulasi resmi perolehan nilai 6 stase aktif, predikat Global Performance Rating (GRS), umpan balik dokter penguji, serta berkas transkrip nilai resmi institusi.
          </p>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-1">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
              Total Sesi Ujian Diikuti
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{historyList.length}</span>
              <span className="text-xs text-slate-500 font-bold">Sesi OSCE</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-1">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
              Status Riwayat Penilaian
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              {(() => {
                const evs = historyList.filter((i) => i.has_evaluations);
                if (evs.length === 0) {
                  return (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                      Menunggu Penilaian Penguji
                    </span>
                  );
                }
                return (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 border border-blue-300 px-3 py-1 text-xs font-black text-blue-900">
                    <CheckCircle2 size={15} />
                    {evs.length} Sesi Terbit Penilaian
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* History List Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award size={20} className="text-blue-600" />
              Daftar Riwayat Penilaian Sesi Ujian OSCE ({filteredHistory.length} Sesi)
            </h3>

            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari riwayat ujian..."
                className="rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {filteredHistory.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 shadow-2xs hover:border-blue-400 hover:bg-white transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                          item.has_evaluations
                            ? "bg-blue-100 text-blue-900 border border-blue-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {item.has_evaluations ? (
                          <>
                            <CheckCircle2 size={12} className="text-blue-700" />
                            Penilaian Tersedia
                          </>
                        ) : (
                          <>
                            <Activity size={12} className="text-amber-700" />
                            Sedang Dinilai
                          </>
                        )}
                      </span>
                      <span className="text-xs text-slate-500 font-bold inline-flex items-center gap-1">
                        <CalendarDays size={13} className="text-slate-400" />
                        {item.session_date}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                        <Building2 size={13} className="text-slate-400" />
                        {item.location}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                        <span className="text-slate-400 text-[10px] block font-bold">Jumlah Stase</span>
                        <span className="font-black text-slate-900">{item.total_stations} Stase Rotasi</span>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                        <span className="text-slate-400 text-[10px] block font-bold">Status Sesi</span>
                        <span className="font-bold text-slate-800">{item.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/participant/results/${item.session_id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer"
                    >
                      <FileText size={15} />
                      Lihat Rincian Penilaian Stase
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center space-y-4 animate-in fade-in duration-200">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs">
                <FileCheck2 size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-slate-900">
                  Belum Ada Riwayat Ujian
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                  Transkrip nilai akan tampil di sini setelah hasil ujian dipublikasikan.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/participant")}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Dashboard
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition active:scale-95"
                >
                  <Activity size={15} />
                  Muat Ulang
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
