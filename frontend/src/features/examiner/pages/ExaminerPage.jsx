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
  const [sessions, setSessions] = useState([]);
  const [assignedStations, setAssignedStations] = useState([]);

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadExaminerDashboard() {
      try {
        setLoading(true);
        if (user) {
          const { data: profData } = await supabase
            .from("profiles")
            .select("full_name, specialty, email")
            .eq("id", user.id)
            .maybeSingle();

          if (profData) setProfile(profData);
        }

        const rawData = await fetchSessions();
        const activeSessions = (rawData || []).filter(
          (s) => s.status === "published" || s.status === "scheduled" || s.status === "ongoing" || s.status === "running"
        );
        setSessions(activeSessions);

        // Fetch stations for active/ongoing session
        const ongoing = activeSessions.find((s) => s.status === "ongoing" || s.status === "running") || activeSessions[0];
        if (ongoing) {
          const { data: stList } = await supabase
            .schema("osce")
            .from("stations")
            .select("*")
            .eq("session_id", ongoing.id)
            .order("station_number");
          setAssignedStations(stList || []);
        }
      } catch (err) {
        console.error("Error loading examiner dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadExaminerDashboard();
  }, [user]);

  const ongoingSession = sessions.find((s) => s.status === "ongoing" || s.status === "running");
  const firstActiveStation = assignedStations.find((s) => !s.is_break) || assignedStations[0];

  function formatDoctorDisplayName(fullName, email) {
    if (fullName && fullName.trim()) return fullName;
    if (!email) return "dr. Penguji Medis";
    const username = email.split("@")[0].replace(/[._]/g, " ");
    const formatted = username.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return `dr. ${formatted}`;
  }

  const examinerName = formatDoctorDisplayName(profile?.full_name || user?.user_metadata?.full_name, user?.email);
  const examinerSpecialty = profile?.specialty || user?.user_metadata?.specialty || "Dokter Penguji Spesialis";
  const examinerEmail = profile?.email || user?.email || "";

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-xs font-semibold text-slate-500">
        <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
        Memuat Dashboard Dokter Penguji Supabase...
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
                  DOKTER PENGUJI SPESIALIS TERVERIFIKASI
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-black">{examinerName}</h1>
              <p className="text-xs text-blue-200 mt-0.5 font-medium">
                Spesialisasi: <strong>{examinerSpecialty}</strong> • {examinerEmail}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/examiner/stage/${firstActiveStation?.id || "stg-101"}`)}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-black shadow-xl transition active:scale-95 ${
              ongoingSession
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 animate-pulse"
                : "bg-slate-700 hover:bg-slate-600 text-white"
            }`}
          >
            <Play size={18} />
            {ongoingSession ? "Masuk ke Penilaian Live Stase" : "Lihat Lembar Stase (Standby)"}
          </button>
        </div>
      </div>

      {/* Active Live Session Highlight Card */}
      {ongoingSession ? (
        <div className="rounded-3xl border border-emerald-300 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-black text-emerald-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Sesi Ujian Live Berlangsung (Ongoing)
              </span>
            </div>

            <span className="rounded-md bg-blue-600 text-white px-3 py-1 text-xs font-black uppercase">
              Penugasan Penguji: STASE 1
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-3">
              <h2 className="text-xl font-black text-slate-900">
                {ongoingSession.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Building2 size={15} className="text-slate-400" />
                  {ongoingSession.location_building || "Gedung Skill Lab Ruang 101"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-slate-400" />
                  {ongoingSession.session_date || "15 Agustus 2026"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-slate-400" />
                  Durasi {ongoingSession.station_duration_minutes || 12} Menit / Stase
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-end">
              <button
                onClick={() => navigate(`/examiner/stage/${firstActiveStation?.id || "stg-101"}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
              >
                Inspect Lembar Penilaian
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <span className="rounded-md bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black text-amber-900 uppercase">
            Standby • Belum Ada Sesi Ongoing
          </span>
          <h2 className="text-base font-black text-slate-900">
            Penugasan Sesi Ujian Selanjutnya
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Jadwal pengujian Anda akan aktif secara otomatis ketika Admin Control Room memulai rotasi sirkuit live.
          </p>
        </div>
      )}

      {/* Assigned Stations Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers size={18} className="text-blue-600" />
          Daftar Pos Stase Penugasan Dokter Penguji ({assignedStations.length} Pos)
        </h3>

        {assignedStations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedStations.map((stg) => (
              <div
                key={stg.id}
                className={`rounded-2xl border p-4 space-y-3 shadow-2xs transition ${
                  stg.is_break ? "border-amber-300 bg-amber-50/70" : "border-slate-200 bg-slate-50/70 hover:border-blue-400 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase ${stg.is_break ? "bg-amber-200 text-amber-950" : "bg-blue-600 text-white"}`}>
                    {stg.title || `Stase ${stg.station_number}`}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400">Pos #{stg.station_number}</span>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{stg.case_title || "Kasus Medis Terstandar"}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Organ: {stg.system_organ || "Kardiovaskular"}</p>
                </div>

                {!stg.is_break && (
                  <button
                    onClick={() => navigate(`/examiner/stage/${stg.id}`)}
                    className="w-full flex items-center justify-center gap-1 rounded-xl bg-blue-50 border border-blue-200 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                  >
                    Buka Lembar Penilaian
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs">
              <Layers size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Belum Ada Pos Stase Penugasan Aktif</h4>
              <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                Penugasan stase penguji akan muncul secara otomatis ketika Admin Control Room mengaktifkan sirkuit live.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}