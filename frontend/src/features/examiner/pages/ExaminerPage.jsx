import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  History,
  MapPin,
  Play,
  PlayCircle,
  Stethoscope,
  UserCheck,
  Users,
  ChevronRight,
  Loader2,
  Building2,
  Layers,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { fetchSessions } from "@/services/sessionService";
import { supabase } from "@/lib/supabaseClient";
import { ExaminerDashboardSkeleton } from "@/components/ui/Skeleton";

export default function ExaminerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [assignedSessions, setAssignedSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [recentEvaluations, setRecentEvaluations] = useState([]);
  const [evalStats, setEvalStats] = useState({
    total: 0,
    satisfactory: 0,
    borderline: 0,
    unsatisfactory: 0,
    passRate: 0,
  });

  useEffect(() => {
    async function loadExaminerDashboard() {
      try {
        setLoading(true);

        let userProf = null;
        if (user) {
          const { data: profData } = await supabase
            .schema("public")
            .from("profiles")
            .select("full_name, email, specialty, university")
            .eq("id", user.id)
            .maybeSingle();

          if (profData) {
            setProfile(profData);
            userProf = profData;
          }
        }

        const currentName = (userProf?.full_name || user?.user_metadata?.full_name || user?.email || "").toLowerCase();
        const username = user?.email ? user.email.split("@")[0].toLowerCase() : "";

        // 1. Fetch active sessions only (published & ongoing; completed sessions belong in history)
        const rawSessions = await fetchSessions();
        const activeOnlySessions = (rawSessions || []).filter((s) => {
          const status = String(s.status || "").toLowerCase();
          return (
            status === "published" ||
            status === "scheduled" ||
            status === "ongoing" ||
            status === "running" ||
            status === "waiting_room" ||
            status === "paused"
          );
        });

        // 2. Fetch session examiners
        const { data: allExaminers } = await supabase
          .schema("osce")
          .from("session_examiners")
          .select("*");

        // 3. Fetch all stations
        const { data: allStations } = await supabase
          .schema("osce")
          .from("stations")
          .select("*")
          .order("station_number");

        const assignedList = [];

        for (const s of activeOnlySessions) {
          const sessionExs = (allExaminers || []).filter((e) => e.session_id === s.id);
          const sessionSts = (allStations || []).filter((st) => st.session_id === s.id);

          const match = sessionExs.find((e) => {
            if (user?.id && e.user_id === user.id) return true;
            if (!e.full_name) return false;
            const efName = e.full_name.toLowerCase();
            return (
              efName === currentName ||
              (username && efName.includes(username)) ||
              currentName.includes(efName) ||
              efName.replace(/dr\.?\s*/i, "").trim() === currentName.replace(/dr\.?\s*/i, "").trim()
            );
          });

          if (match) {
            const matchedSt = sessionSts.find(
              (st) => Number(st.station_number) === Number(match.assigned_station_number)
            );
            assignedList.push({
              session: s,
              assignment: match,
              station: matchedSt || sessionSts.find((st) => !st.is_break) || sessionSts[0],
              stations: sessionSts,
            });
          }
        }

        // Fallback: If no explicit match in session_examiners, show active sessions for preview
        if (assignedList.length === 0 && activeOnlySessions.length > 0) {
          for (const s of activeOnlySessions) {
            const sessionSts = (allStations || []).filter((st) => st.session_id === s.id);
            assignedList.push({
              session: s,
              assignment: { assigned_station_number: 1 },
              station: sessionSts.find((st) => !st.is_break) || sessionSts[0],
              stations: sessionSts,
            });
          }
        }

        setAssignedSessions(assignedList);

        // 4. Fetch recent evaluations by this examiner
        if (user?.id) {
          const { data: evals } = await supabase
            .schema("osce")
            .from("examiner_evaluations")
            .select(`
              *,
              session:sessions (title),
              station:stations (station_number, case_title, title)
            `)
            .eq("examiner_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);

          if (evals && evals.length > 0) {
            setRecentEvaluations(evals);
            const total = evals.length;
            const sat = evals.filter((e) => e.grs_rating === "SATISFACTORY").length;
            const bord = evals.filter((e) => e.grs_rating === "BORDERLINE").length;
            const unsat = evals.filter((e) => e.grs_rating === "UNSATISFACTORY").length;
            const passRate = total > 0 ? Math.round((sat / total) * 100) : 0;

            setEvalStats({
              total,
              satisfactory: sat,
              borderline: bord,
              unsatisfactory: unsat,
              passRate,
            });
          }
        }
      } catch (err) {
        console.error("Error loading examiner dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadExaminerDashboard();
  }, [user]);

  function formatDoctorDisplayName(fullName, email) {
    if (fullName && fullName.trim()) return fullName;
    if (!email) return "Tidak ada data";
    const username = email.split("@")[0].replace(/[._]/g, " ");
    const formatted = username.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return formatted || "Tidak ada data";
  }

  const examinerName = formatDoctorDisplayName(profile?.full_name || user?.user_metadata?.full_name, user?.email);
  const examinerSpecialty = profile?.specialty || user?.user_metadata?.specialty || "Tidak ada data";
  const examinerEmail = profile?.email || user?.email || "-";
  const examinerUniversity = profile?.university || profile?.institution || user?.user_metadata?.institution || user?.user_metadata?.university || "Tidak ada data";

  const assignedStationNum = assignedSessions[0]?.station?.station_number || assignedSessions[0]?.assignment?.assigned_station_number || 1;

  if (loading) {
    return <ExaminerDashboardSkeleton />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg border-2 border-blue-400/30 shrink-0">
              <Stethoscope size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-500/30 px-3 py-0.5 text-[10px] font-black text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                  PORTAL DOKTER PENGUJI TERVERIFIKASI
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Status: Aktif Penugasan
                </span>
              </div>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight">{examinerName}</h1>
              <p className="text-xs text-blue-200 mt-1 font-medium">
                Spesialisasi: <strong>{examinerSpecialty}</strong> • {examinerUniversity} • {examinerEmail}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/examiner/stage")}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition"
            >
              <PlayCircle size={18} />
              Masuk Pengujian Live
            </button>
            <button
              onClick={() => navigate("/examiner/history")}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 active:scale-95 transition"
            >
              <History size={16} />
              Riwayat Evaluasi
            </button>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1: Assigned Sessions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2 hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sesi Penugasan</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{assignedSessions.length}</span>
            <span className="text-xs font-bold text-blue-600">Sesi Aktif</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Sesi ujian sirkuit terdaftar</p>
        </div>

        {/* Stat 2: Total Evaluatees */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2 hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peserta Dinilai</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{evalStats.total}</span>
            <span className="text-xs font-bold text-emerald-600">Peserta</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Evaluasi tersimpan di Supabase</p>
        </div>

        {/* Stat 3: Station Assignment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2 hover:border-amber-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pos Stase Utama</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Award size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">Pos #{assignedStationNum}</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Penugasan stase evaluasi SKDI</p>
        </div>

        {/* Stat 4: Rating Satisfactory Pass Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2 hover:border-purple-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat Memuaskan</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{evalStats.passRate}%</span>
            <span className="text-xs font-bold text-purple-600">Satisfactory</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{evalStats.satisfactory} dari {evalStats.total} evaluasi</p>
        </div>
      </div>

      {/* Main Grid: Active Assigned Sessions & Quick Navigation */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2-Cols: Assigned Sessions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CalendarDays size={18} className="text-blue-600" />
                  Daftar Sesi Ujian Sirkuit Penugasan ({assignedSessions.length} Sesi)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Klik kartu sesi di bawah untuk membuka Waiting Room atau Lembar Penilaian stase Anda.
                </p>
              </div>
            </div>

            {assignedSessions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {assignedSessions.map(({ session: s, assignment: a, station: st }) => {
                  const sStatus = String(s.status || "").toLowerCase();
                  const isOngoing = ["ongoing", "running", "waiting_room", "paused"].includes(sStatus);
                  const isCompleted = ["completed", "finished", "selesai"].includes(sStatus);
                  const isPublished = ["published", "scheduled"].includes(sStatus);
                  const isDraft = sStatus === "draft";

                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 shadow-2xs hover:border-blue-300 hover:bg-white transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {isOngoing && (
                            <span className="rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                              Live Berlangsung
                            </span>
                          )}
                          {isPublished && (
                            <span className="rounded-md bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                              Dipublikasikan (Terjadwal)
                            </span>
                          )}
                          {isCompleted && (
                            <span className="rounded-md bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-slate-600" />
                              Selesai (Completed)
                            </span>
                          )}
                          {isDraft && (
                            <span className="rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                              Draft (Belum Dipublikasikan)
                            </span>
                          )}

                          <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-900 inline-flex items-center gap-1 uppercase">
                            <CheckCircle2 size={11} className="text-emerald-700" />
                            Penugasan Pos #{st?.station_number || a?.assigned_station_number || 1}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">{s.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {st
                              ? `Pos Penugasan Anda: Pos #${st.station_number} - ${st.case_title || st.title || "Kasus Medis"}`
                              : s.description || "Sesi evaluasi sirkuit terpadu stase aktif."}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                          <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                            <span className="text-slate-400 text-[10px] block font-bold">Total Stase</span>
                            <span className="font-black text-slate-900">{s.total_stations || 8} Pos</span>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                            <span className="text-slate-400 text-[10px] block font-bold">Durasi / Pos</span>
                            <span className="font-black text-slate-900">{s.station_duration_minutes || 12} Mnt</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/60">
                        {isCompleted ? (
                          <button
                            onClick={() => navigate("/examiner/history")}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition active:scale-95 shadow-sm"
                          >
                            <History size={16} />
                            Lihat Riwayat & Rekap Evaluasi
                          </button>
                        ) : isDraft ? (
                          <button
                            disabled
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-400 bg-slate-100 cursor-not-allowed border border-slate-200"
                          >
                            Belum Dipublikasikan oleh Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/examiner/session/${s.id}`)}
                            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 ${
                              isOngoing
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 animate-pulse"
                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
                            }`}
                          >
                            {isOngoing ? (
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
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4 shadow-2xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-sm">
                  <Stethoscope size={32} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Belum Ada Sesi Ujian Penugasan</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed font-medium">
                    Anda belum ditugaskan ke sesi ujian aktif. Penugasan dokter penguji akan dikonfigurasi oleh Admin Control Room.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Evaluations History Table Widget */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <History size={18} className="text-blue-600" />
                  Riwayat Evaluasi Terakhir Oleh Anda
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Daftar peserta yang baru saja Anda berikan penilaian pada sistem Supabase.
                </p>
              </div>

              <button
                onClick={() => navigate("/examiner/history")}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Lihat Semua <ChevronRight size={14} />
              </button>
            </div>

            {recentEvaluations.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Tanggal & Waktu</th>
                      <th className="px-4 py-3">Sesi Ujian</th>
                      <th className="px-4 py-3">Pos Stase</th>
                      <th className="px-4 py-3">Rating GRS</th>
                      <th className="px-4 py-3 text-right">Status Lock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {recentEvaluations.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {new Date(ev.created_at).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {ev.session?.title || "Sesi OSCE"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            Pos #{ev.station?.station_number || 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                              ev.grs_rating === "SATISFACTORY"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : ev.grs_rating === "BORDERLINE"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-rose-100 text-rose-900 border border-rose-300"
                            }`}
                          >
                            {ev.grs_rating || "SATISFACTORY"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            <ShieldCheck size={12} />
                            Terkunci
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs text-slate-500 font-medium space-y-2">
                <FileText size={28} className="mx-auto text-slate-400" />
                <p>Belum ada catatan riwayat penilaian yang dikunci pada sesi ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1-Col: Quick Nav & SOP Panduan Penguji Card */}
        <div className="space-y-6">
          {/* Quick Nav Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              Menu Pintar Dokter Penguji
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/examiner/stage")}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 hover:border-blue-300 hover:bg-blue-50/50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Activity size={16} />
                  </div>
                  <span>Pengujian Live & Waiting Room</span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition" />
              </button>

              <button
                onClick={() => navigate("/examiner/history")}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 hover:border-blue-300 hover:bg-blue-50/50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <History size={16} />
                  </div>
                  <span>Rekap Riwayat Pengujian</span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition" />
              </button>

              <button
                onClick={() => navigate("/examiner/profile")}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 hover:border-blue-300 hover:bg-blue-50/50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                    <Stethoscope size={16} />
                  </div>
                  <span>Profil & Informasi Spesialisasi</span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition" />
              </button>
            </div>
          </div>

          {/* SOP Protocol Guidance Card */}
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/80 via-white to-slate-50 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              <h4 className="text-sm font-extrabold text-slate-900">Prosedur Pengujian Standar SKDI</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-900">Verifikasi Identitas Peserta</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cocokkan foto, nama, dan NIM peserta saat peserta memasuki pos stase Anda.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-900">Penilaian Rubrik Obyektif (0-3)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Berikan skor tiap elemen rubrik sesuai performa klinis peserta pada stase.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-900">Berikan Catatan Feedback</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tuliskan catatan umpan balik konstruktif pada kolom masukan penguji.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                  4
                </span>
                <div>
                  <p className="font-bold text-slate-900">Kunci & Simpan Evaluasi</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tekan tombol Simpan Evaluasi sebelum bel tanda rotasi berikutnya berbunyi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}