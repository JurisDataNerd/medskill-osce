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
import { getSessionParticipants } from "@/services/session.service";
import { supabase } from "@/lib/supabaseClient";

export default function ExaminerStationScheduleWidget({
  sessionId,
  stationNumber = 1,
  activeRound = 1,
}) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [stations, setStations] = useState([]);
  const [participants, setParticipants] = useState([]);

  async function loadData() {
    if (!sessionId) return;
    try {
      setLoading(true);
      const [sessData, dbParticipants] = await Promise.all([
        fetchSessionById(sessionId).catch(() => null),
        getSessionParticipants(sessionId).catch(() => []),
      ]);

      if (sessData) {
        setSession(sessData);
        setStations(sessData.stations || []);
      }
      setParticipants(dbParticipants || []);
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const totalN = stations.length > 0 ? stations.length : (session?.total_stations || 6);
  const currentStationNum = Number(stationNumber || 1);
  const stationObj = stations.find((st) => Number(st.station_number) === currentStationNum);

  // Calculate incoming candidate per round R = 1..N
  // Formula: Candidate starting station S0 at station S in round R is:
  // S0 = ((S - 1 - (R - 1) % N + N) % N) + 1
  const roundCandidateList = useMemo(() => {
    const list = [];
    for (let r = 1; r <= totalN; r++) {
      const targetS0 = ((currentStationNum - 1 - ((r - 1) % totalN) + totalN) % totalN) + 1;

      // Find candidate matching starting station S0
      const matchedCandidate = participants.find(
        (p) => Number(p.station_number || p.starting_station_number) === targetS0
      );

      let roundStatus = "upcoming";
      if (r < Number(activeRound)) roundStatus = "completed";
      if (r === Number(activeRound)) roundStatus = "active";

      list.push({
        roundNum: r,
        targetS0,
        candidate: matchedCandidate || null,
        roundStatus,
      });
    }
    return list;
  }, [totalN, currentStationNum, participants, activeRound]);

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
              Kasus: <strong className="text-slate-800">{stationObj?.case_title || stationObj?.title || `Stase ${currentStationNum}`}</strong>
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
                <div className="flex items-center gap-2">
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
