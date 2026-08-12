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
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { fetchSessions } from "@/services/sessionService";
import { supabase } from "@/lib/supabaseClient";

export default function ExaminerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [assignedSessions, setAssignedSessions] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadExaminerDashboard() {
      try {
        setLoading(true);

        let userProf = null;
        if (user) {
          const { data: profData } = await supabase
            .schema("public")
            .from("profiles")
            .select("full_name, email")
            .eq("id", user.id)
            .maybeSingle();

          if (profData) {
            setProfile(profData);
            userProf = profData;
          }
        }

        const currentName = (userProf?.full_name || user?.user_metadata?.full_name || user?.email || "").toLowerCase();
        const username = user?.email ? user.email.split("@")[0].toLowerCase() : "";

        // 1. Fetch sessions
        const rawSessions = await fetchSessions();
        const activeSessions = (rawSessions || []).filter(
          (s) =>
            s.status === "published" ||
            s.status === "scheduled" ||
            s.status === "waiting_room" ||
            s.status === "ongoing" ||
            s.status === "running"
        );

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

        for (const s of activeSessions) {
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

        // Fallback: If no explicit match in session_examiners, show all active sessions for examiner preview
        if (assignedList.length === 0 && activeSessions.length > 0) {
          for (const s of activeSessions) {
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
    if (!email) return "dr. Penguji Medis";
    const username = email.split("@")[0].replace(/[._]/g, " ");
    const formatted = username.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return `dr. ${formatted}`;
  }

  const examinerName = formatDoctorDisplayName(profile?.full_name || user?.user_metadata?.full_name, user?.email);
  const examinerSpecialty = profile?.specialty || user?.user_metadata?.specialty || "Dokter Penguji Spesialis";
  const examinerEmail = profile?.email || user?.email || "";

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-xs font-semibold text-slate-500">
        <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
        Memuat Portal Dokter Penguji Supabase...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg border-2 border-blue-400/30">
              <Stethoscope size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-500/30 px-3 py-0.5 text-xs font-extrabold text-blue-200 border border-blue-400/30 uppercase">
                  PORTAL DOKTER PENGUJI TERVERIFIKASI
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-black">{examinerName}</h1>
              <p className="text-xs text-blue-200 mt-0.5 font-medium">
                Spesialisasi: <strong>{examinerSpecialty}</strong> • {examinerEmail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned OSCE Sessions List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <CalendarDays size={18} className="text-blue-600" />
            Daftar Sesi Ujian Sirkuit ({assignedSessions.length} Sesi)
          </h3>
        </div>

        {assignedSessions.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {assignedSessions.map(({ session: s, assignment: a, station: st }) => {
              const isOngoing = s.status === "ongoing" || s.status === "running";

              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 shadow-2xs hover:border-blue-300 hover:bg-white transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                          isOngoing
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-indigo-100 text-indigo-900 border border-indigo-300"
                        }`}
                      >
                        {isOngoing ? "Live Berlangsung" : "Dipublikasikan (Terjadwal)"}
                      </span>

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
    </div>
  );
}