import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  History,
  MapPin,
  Search,
  Award,
  Users,
  Eye,
} from "lucide-react";
import ExaminerLayout from "@/layouts/ExaminerLayout";
import {
  CURRENT_EXAMINER_PROFILE,
  EXAMINER_HISTORY_SESSIONS,
} from "@/features/examiner/data/mockExaminerData";

export default function ExaminerHistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHistory, setSelectedHistory] = useState(null);

  const filteredHistory = EXAMINER_HISTORY_SESSIONS.filter((hist) => {
    const q = searchQuery.toLowerCase();
    return (
      hist.title.toLowerCase().includes(q) ||
      hist.station_name.toLowerCase().includes(q) ||
      hist.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/examiner")}
              className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
            >
              <ArrowLeft size={16} />
              Kembali ke Dashboard
            </button>
            <h1 className="text-2xl font-bold text-slate-900">
              Riwayat Pengujian Sesi OSCE
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Rekapitulasi riwayat evaluasi & penilaian sesi ujian OSCE terdahulu oleh {CURRENT_EXAMINER_PROFILE.name}.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="relative min-w-[260px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama sesi atau lokasi stase..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            Total {filteredHistory.length} Sesi Terdaftar
          </span>
        </div>

        {/* History Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredHistory.map((hist) => (
            <div
              key={hist.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-blue-300 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-[11px] font-extrabold text-indigo-800">
                    Dipublikasikan
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {hist.session_date}
                  </span>
                </div>

                <h2 className="font-bold text-slate-900 text-sm leading-snug">
                  {hist.title}
                </h2>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1 text-xs">
                  <p className="font-bold text-slate-800">{hist.station_name}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {hist.location}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Rata-rata Skor</span>
                  <span className="font-black text-blue-700 text-base">{hist.avg_score} / 100</span>
                </div>

                <button
                  onClick={() => setSelectedHistory(hist)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <Eye size={14} />
                  Detail Rekap
                </button>
              </div>
            </div>
          ))}
        {/* Detail Modal */}
        {selectedHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="rounded-2xl bg-white p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="font-bold text-base text-slate-900 border-b pb-2">
                Rekapitulasi {selectedHistory.title}
              </h3>

              <div className="space-y-2 text-xs text-slate-700">
                <p>Stase: <strong>{selectedHistory.station_name}</strong></p>
                <p>Tanggal: <strong>{selectedHistory.session_date}</strong></p>
                <p>Total Peserta Diuji: <strong>{selectedHistory.evaluated_count} Peserta</strong></p>
                <p>Nilai Rata-Rata: <strong className="text-blue-700 text-sm">{selectedHistory.avg_score} / 100</strong></p>
                <p>Status: <strong className="text-indigo-700">Dipublikasikan ke Peserta</strong></p>
              </div>

              <div className="flex justify-end border-t pt-3">
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


