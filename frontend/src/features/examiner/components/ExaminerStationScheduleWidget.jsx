import { useEffect, useState, useMemo } from "react";
import {
  Users,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  Stethoscope,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { fetchSessionById } from "@/services/sessionService";
import { getSessionParticipants, getSessionExaminers } from "@/services/session.service";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";

export default function ExaminerStationScheduleWidget({
  sessionId,
  stationNumber,
  activeRound = 1,
}) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [stations, setStations] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const { user: authUser } = useAuth();

  async function loadData() {
    if (!sessionId) return;
    try {
      setLoading(true);
      const [sessData, dbParticipants, dbExaminers] = await Promise.all([
        fetchSessionById(sessionId).catch(() => null),
        getSessionParticipants(sessionId).catch(() => []),
        getSessionExaminers(sessionId).catch(() => []),
      ]);

      if (sessData) {
        setSession(sessData);
        setStations(sessData.stations || []);
      }
      const approvedList = (dbParticipants || []).filter((p) => {
        const st = (p.status || "").toLowerCase();
        return st === "approved" || st === "active";
      });
      setParticipants(approvedList);
      setExaminers(dbExaminers || []);
    } catch (err) {
      console.error("Error loading examiner station schedule:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [sessionId]);

  // Realtime updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`examiner_station_schedule_${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "osce", table: "session_participants", filter: `session_id=eq.${sessionId}` },
        () => loadData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "osce", table: "session_examiners", filter: `session_id=eq.${sessionId}` },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Auto-detect examiner's station if not explicitly provided
  const currentStationNum = useMemo(() => {
    if (stationNumber) return Number(stationNumber);

    if (authUser && examiners.length > 0) {
      const match = examiners.find(
        (ex) =>
          (ex.user_id && String(ex.user_id) === String(authUser.id)) ||
          (ex.email && authUser.email && String(ex.email).toLowerCase() === String(authUser.email).toLowerCase())
      );
      if (match?.assigned_station_number || match?.station_number) {
        return Number(match.assigned_station_number || match.station_number);
      }
    }
    return 1;
  }, [stationNumber, authUser, examiners]);

  const totalN = stations.length > 0 ? stations.length : (session?.total_stations || 6);
  const stationObj = stations.find((st) => Number(st.station_number) === currentStationNum);

  // Calculate incoming candidate per round R = 1..N with estimated clock times
  // Formula: Candidate starting station S0 at station S in round R is:
  // S0 = ((S - 1 - (R - 1) % N + N) % N) + 1
  const roundCandidateList = useMemo(() => {
    const stationMins = Number(session?.station_duration_minutes || 12);
    const transitMins = Number(session?.transition_duration_minutes ?? 2);

    let baseTime = new Date();
    if (session?.started_at) {
      baseTime = new Date(session.started_at);
    } else if (session?.start_time) {
      const parts = String(session.start_time).split(":");
      baseTime.setHours(parseInt(parts[0] || "8", 10), parseInt(parts[1] || "0", 10), 0, 0);
    } else {
      baseTime.setHours(8, 0, 0, 0);
    }

    const fmt = (d) => {
      const hh = d.getHours().toString().padStart(2, "0");
      const mm = d.getMinutes().toString().padStart(2, "0");
      return `${hh}:${mm}`;
    };

    let currentTime = new Date(baseTime);
    if (transitMins > 0) {
      currentTime = new Date(currentTime.getTime() + transitMins * 60 * 1000);
    }

    const list = [];
    for (let r = 1; r <= totalN; r++) {
      const targetS0 = ((currentStationNum - 1 - ((r - 1) % totalN) + totalN) % totalN) + 1;

      // Find candidate matching starting station S0
      const matchedCandidate = participants.find(
        (p) => Number(p.station_number || p.starting_station_number) === targetS0
      );

      const startTimeStr = fmt(currentTime);
      const endTimeObj = new Date(currentTime.getTime() + stationMins * 60 * 1000);
      const endTimeStr = fmt(endTimeObj);
      currentTime = new Date(endTimeObj.getTime() + transitMins * 60 * 1000);

      let roundStatus = "upcoming";
      if (r < Number(activeRound)) roundStatus = "completed";
      if (r === Number(activeRound)) roundStatus = "active";

      list.push({
        roundNum: r,
        targetS0,
        candidate: matchedCandidate || null,
        roundStatus,
        startTimeStr,
        endTimeStr,
        durationMinutes: stationMins,
      });
    }
    return list;
  }, [totalN, currentStationNum, participants, activeRound, session]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
        <RefreshCw size={20} className="mx-auto animate-spin text-blue-600 mb-2" />
        Memuat Jadwal Rotasi Peserta Pos Stase #{currentStationNum}...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white text-sm shadow-xs">
            Pos #{currentStationNum}
          </span>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              Jadwal Rotasi Peserta Diuji Pos #{currentStationNum}
            </h3>
            <p className="text-xs text-slate-500">
              Stase: <strong className="text-slate-800">{stationObj?.title || `Stase ${currentStationNum}`}</strong> • Kasus: <strong className="text-slate-800">{stationObj?.case_title || "Kasus Medis Terstandar"}</strong>
            </p>
          </div>
        </div>

        <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700 flex items-center gap-1.5">
          <Users size={14} />
          {participants.length} Peserta Terdaftar
        </span>
      </div>

      {/* Rounds List */}
      <div className="space-y-2.5">
        {roundCandidateList.map((item) => {
          const isCurrentActive = item.roundStatus === "active";
          const isCompleted = item.roundStatus === "completed";
          const cand = item.candidate;

          return (
            <div
              key={item.roundNum}
              className={`rounded-2xl border p-4 transition ${
                isCurrentActive
                  ? "border-blue-500 bg-blue-50/70 shadow-sm ring-2 ring-blue-200"
                  : isCompleted
                  ? "border-slate-200 bg-slate-50/60 opacity-85"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100/80 pb-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-lg px-2.5 py-0.5 text-xs font-extrabold ${
                      isCurrentActive
                        ? "bg-blue-600 text-white"
                        : isCompleted
                        ? "bg-slate-200 text-slate-700"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    Ronde {item.roundNum}
                  </span>

                  <span className="font-bold text-xs text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                    Pos Awal Peserta S{item.targetS0}
                  </span>

                  <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    {item.startTimeStr} - {item.endTimeStr}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {isCurrentActive ? (
                    <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black text-white uppercase animate-pulse flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      Peserta Aktif Saat Ini
                    </span>
                  ) : isCompleted ? (
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      Selesai Evaluasi
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      Ronde Ke-{item.roundNum}
                    </span>
                  )}
                </div>
              </div>

              {/* Candidate Info */}
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Identitas Peserta Diuji</span>
                {cand ? (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{cand.full_name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        NIM: {cand.nim || "-"} • Email: {cand.email || "-"}
                      </p>
                    </div>

                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                        cand.status === "approved" || cand.status === "active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {cand.status === "approved" || cand.status === "active" ? "Disetujui" : cand.status}
                    </span>
                  </div>
                ) : (
                  <p className="font-medium text-slate-400 italic text-xs">
                    Belum ada peserta berposisi awal S{item.targetS0}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
