import { useState, useEffect } from "react";
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
  Loader2,
  Building2,
} from "lucide-react";
import { fetchSessions } from "@/services/sessionService";
import { supabase } from "@/lib/supabaseClient";
import { ExaminerHistorySkeleton } from "@/components/ui/Skeleton";

export default function ExaminerHistoryPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadExaminerHistory() {
      try {
        setLoading(true);
        const data = await fetchSessions();
        // Filter to ONLY published or completed sessions for history rekap
        const historySessions = (data || []).filter(
          (sess) => sess.status === "published" || sess.status === "completed"
        );
        setSessions(historySessions);
      } catch (err) {
        console.error("Error loading examiner history:", err);
      } finally {
        setLoading(false);
      }
    }

    loadExaminerHistory();
  }, []);

  const filteredHistory = sessions.filter((sess) => {
    const q = searchQuery.toLowerCase();
    return (
      sess.title.toLowerCase().includes(q) ||
      (sess.location_building && sess.location_building.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <ExaminerHistorySkeleton />;
  }

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
          <h1 className="text-2xl font-black text-slate-900">
            Riwayat Pengujian Sesi OSCE
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Rekapitulasi riwayat evaluasi & penilaian sesi ujian OSCE dari database Supabase.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-[260px]">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama sesi..."
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* History Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredHistory.map((sess) => (
          <div key={sess.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs hover:border-blue-300 transition">
            <div className="flex items-center justify-between">
              <span className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase border ${
                sess.status === "completed"
                  ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                  : "bg-indigo-100 border-indigo-300 text-indigo-900"
              }`}>
                {sess.status === "completed" ? "Selesai" : "Terjadwal"}
              </span>
              <span className="text-xs text-slate-500 font-bold inline-flex items-center gap-1">
                <CalendarDays size={13} className="text-slate-400" />
                {sess.session_date || "15 Agustus 2026"}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-900">{sess.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {sess.description || "Sesi evaluasi sirkuit terpadu 6 stase aktif."}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">6 Mahasiswa Evaluasi</span>
              <button
                onClick={() => navigate(`/examiner/history/${sess.id}`)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Lihat Rekap Penilaian
                <Eye size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
