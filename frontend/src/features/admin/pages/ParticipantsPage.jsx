import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import {
  Clock,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  FileText,
  Award,
  Calendar,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  getParticipantsWithHistory,
} from "@/services/session.service";

export default function ParticipantsPage() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'lulus' | 'remidi' | 'pending'

  useEffect(() => {
    load();

    const channel = supabase
      .channel("participants-realtime-page")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "osce",
          table: "session_participants",
        },
        () => load()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "osce",
          table: "examiner_evaluations",
        },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getParticipantsWithHistory();
      setParticipants(data ?? []);
    } catch (err) {
      console.error("Error loading participants history from Supabase:", err);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id, sessionId) {
    try {
      await approveParticipant(id, 1, sessionId);
      load();
    } catch (err) {
      console.error("Error approving participant:", err);
    }
  }

  async function handleReject(id, sessionId) {
    try {
      await rejectParticipant(id, sessionId);
      load();
    } catch (err) {
      console.error("Error rejecting participant:", err);
    }
  }

  // Filter participants by search query and status filter
  const filteredParticipants = participants.filter((p) => {
    const nameMatch = (p.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const nimMatch = (p.nim || "").toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (p.email || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = nameMatch || nimMatch || emailMatch;

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "lulus") return p.overall_avg_score >= 70;
    if (statusFilter === "remidi") return p.overall_avg_score < 70;
    if (statusFilter === "pending") return p.status === "pending";

    return true;
  });

  // Calculate institution summary stats
  const totalStudents = participants.length;
  const totalSessionsTaken = participants.reduce((acc, p) => acc + (p.total_sessions || 0), 0);
  const evaluatedStudents = participants.filter((p) => (p.evaluated_sessions_count || 0) > 0);
  const overallAvgScore = evaluatedStudents.length > 0 ? (evaluatedStudents.reduce((acc, p) => acc + (p.overall_avg_score || 0), 0) / evaluatedStudents.length) : 0;
  const passedStudentsCount = evaluatedStudents.filter((p) => (p.overall_avg_score || 0) >= 70).length;
  const passRate = evaluatedStudents.length > 0 ? (passedStudentsCount / evaluatedStudents.length) * 100 : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[450px] flex-col items-center justify-center text-xs font-semibold text-slate-500 space-y-2">
          <Loader2 size={28} className="animate-spin text-blue-600" />
          <span>Memuat Data Transkrip & History Peserta OSCE...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider">
                PORTAL ADMIN INSTITUSI
              </span>
              <h1 className="text-xl font-black text-slate-900">
                Rekap Data & Transkrip Nilai Peserta OSCE
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Pantau rekapitulasi nilai, riwayat sesi ujian OSCE yang pernah diikuti, dan transkrip resmi mahasiswa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => load()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <Sparkles size={14} className="text-blue-600" />
              Refresh Realtime Data
            </button>
          </div>
        </div>

        {/* Institution Overall Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Peserta</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Users size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{totalStudents}</p>
            <span className="text-[11px] text-slate-500 font-medium">Mahasiswa Terdaftar</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Sesi OSCE</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Calendar size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{totalSessionsTaken}</p>
            <span className="text-[11px] text-slate-500 font-medium">Riwayat Ujian Terlaksana</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Rata-Rata Nilai</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Award size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 font-mono">
              {evaluatedStudents.length > 0 ? `${overallAvgScore.toFixed(1)}%` : "0.0%"}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">
              {evaluatedStudents.length > 0 ? `Dari ${evaluatedStudents.length} Peserta Dievaluasi` : "Belum Ada Nilai Ujian"}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Tingkat Kelulusan</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-teal-700 font-mono">{passRate.toFixed(0)}%</p>
            <span className="text-[11px] text-slate-500 font-medium">{passedStudentsCount} Lulus Dari {totalStudents} Peserta</span>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama Mahasiswa, NIM, atau Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Semua Status Peserta ({participants.length})</option>
              <option value="lulus">Status: LULUS (≥ 70%)</option>
              <option value="remidi">Status: REMIDI (&lt; 70%)</option>
              <option value="pending">Status: Registrasi Pending</option>
            </select>
          </div>
        </div>

        {/* Main Participants Table Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              Daftar Peserta & Rekap History Sesi OSCE ({filteredParticipants.length} Mahasiswa)
            </h2>
          </div>

          {filteredParticipants.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 space-y-2">
              <Users size={32} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">Tidak Ada Data Peserta yang Sesuai Filter</p>
              <p>Coba ubah kata kunci pencarian atau reset filter status peserta.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase">
                    <th className="py-3.5 px-4">Nama Mahasiswa</th>
                    <th className="py-3.5 px-4">NIM / Email</th>
                    <th className="py-3.5 px-4 text-center">Total Sesi Diikuti</th>
                    <th className="py-3.5 px-4 text-center">Rata-Rata Nilai</th>
                    <th className="py-3.5 px-4 text-right font-bold">Aksi & Detail Transkrip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredParticipants.map((p, idx) => {
                    const evaluatedCount = p.evaluated_sessions_count || 0;
                    const hasEvals = evaluatedCount > 0;
                    const avg = Number(p.overall_avg_score) || 0;
                    const isPassed = hasEvals && avg >= 70;
                    const sessions = p.sessions_taken || [];

                    return (
                      <tr key={p.id || idx} className="hover:bg-slate-50/80 transition">
                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-black text-white shrink-0">
                              {(p.full_name || "M").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {p.full_name || "Mahasiswa Peserta"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Registered: Active Student
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* NIM / Email */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold text-slate-800 block">
                            {p.nim || "-"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono truncate max-w-[180px] block">
                            {p.email || "-"}
                          </span>
                        </td>

                        {/* Total Sessions */}
                        <td className="py-3.5 px-4 text-center font-bold text-blue-700">
                          <span className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-extrabold text-blue-800">
                            {p.total_sessions || sessions.length || 0} Sesi Ujian
                          </span>
                        </td>

                        {/* Average Score */}
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span
                            className={`rounded-xl px-2.5 py-1 text-xs font-black font-mono inline-block border ${
                              hasEvals
                                ? isPassed
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : "bg-rose-100 text-rose-900 border-rose-300"
                                : "bg-amber-50 text-amber-900 border-amber-300"
                            }`}
                          >
                            {hasEvals ? `${avg.toFixed(1)}%` : "Belum Dinilai"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/participants/${p.id || p.nim || p.user_id}`)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition cursor-pointer"
                          >
                            <FileText size={14} />
                            Detail Transkrip & Rekap Nilai
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}