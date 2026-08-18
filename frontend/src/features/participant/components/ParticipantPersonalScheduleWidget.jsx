import { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Stethoscope,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight,
  User,
} from "lucide-react";
import { fetchSessionById } from "@/services/sessionService";
import { getSessionParticipants, getSessionExaminers } from "@/services/session.service";
import { supabase } from "@/lib/supabaseClient";

export default function ParticipantPersonalScheduleWidget({
  sessionId,
  participantUserId,
  activeRound = 1,
}) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [stations, setStations] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [participants, setParticipants] = useState([]);

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
      setParticipants(dbParticipants || []);
      setExaminers(dbExaminers || []);
    } catch (err) {
      console.error("Error loading participant personal schedule:", err);
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
      .channel(`participant_personal_schedule_${sessionId}`)
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

  // Find candidate's own participant record
  const currentCandidate = useMemo(() => {
    if (!participants || participants.length === 0) return null;
    if (participantUserId) {
      const found = participants.find((p) => String(p.user_id) === String(participantUserId) || String(p.id) === String(participantUserId));
      if (found) return found;
    }
    return participants[0];
  }, [participants, participantUserId]);

  const totalN = stations.length > 0 ? stations.length : (session?.total_stations || 6);
  const startingStationNum = Number(currentCandidate?.station_number || currentCandidate?.starting_station_number || 1);

  // Map station_number -> Doctor
  const stationExaminerMap = useMemo(() => {
    const map = {};
    stations.forEach((st) => {
      const stNum = Number(st.station_number);
      const dbEx = examiners.find(
        (ex) => Number(ex.station_number || ex.assigned_station_number) === stNum
      );
      const doctorName = dbEx?.full_name || dbEx?.profiles?.full_name || st.assigned_examiner || st.examiner_name || null;
      const doctorSpecialty = dbEx?.specialty || dbEx?.profiles?.specialty || st.examiner_specialty || "Spesialis Medis";

      map[stNum] = { doctorName, doctorSpecialty, isAssigned: Boolean(doctorName) };
    });
    return map;
  }, [stations, examiners]);

  // Calculate schedule per round R = 1..N
  const roundScheduleList = useMemo(() => {
    const list = [];
    for (let r = 1; r <= totalN; r++) {
      const currentStationNum = ((startingStationNum - 1 + (r - 1)) % totalN) + 1;
      const stObj = stations.find((st) => Number(st.station_number) === currentStationNum);
      const exInfo = stationExaminerMap[currentStationNum] || {};
      const isBreak = stObj?.is_break || stObj?.title?.toLowerCase().includes("istirahat");

      let roundStatus = "upcoming";
      if (r < Number(activeRound)) roundStatus = "completed";
      if (r === Number(activeRound)) roundStatus = "active";

      list.push({
        roundNum: r,
        stationNum: currentStationNum,
        stationTitle: stObj?.title || `Stase ${currentStationNum}`,
        caseTitle: stObj?.case_title || "Kasus Medis Terstandar",
        doctorName: exInfo.doctorName,
        doctorSpecialty: exInfo.doctorSpecialty,
        isAssigned: exInfo.isAssigned,
        isBreak,
        roundStatus,
      });
    }
    return list;
  }, [totalN, startingStationNum, stations, stationExaminerMap, activeRound]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
        <RefreshCw size={20} className="mx-auto animate-spin text-blue-600 mb-2" />
        Memuat Jadwal Rotasi Personal Anda...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white text-sm shadow-xs">
            S{startingStationNum}
          </span>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              Jadwal Rotasi Saya
            </h3>
            <p className="text-xs text-slate-500">
              Peserta: <strong className="text-slate-800">{currentCandidate?.full_name || "Nama Peserta"}</strong> • Pos Awal Stase {startingStationNum}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700 flex items-center gap-1.5">
          <Layers size={14} />
          {totalN} Ronde Stase
        </span>
      </div>

      {/* Rounds Timeline List */}
      <div className="space-y-2.5">
        {roundScheduleList.map((item) => {
          const isCurrentActive = item.roundStatus === "active";
          const isCompleted = item.roundStatus === "completed";

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

                  <span className="font-bold text-xs text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                    Pos Stase {item.stationNum}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {isCurrentActive ? (
                    <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black text-white uppercase animate-pulse flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      Ronde Aktif
                    </span>
                  ) : isCompleted ? (
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      Selesai
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      Ronde Ke-{item.roundNum}
                    </span>
                  )}
                </div>
              </div>

              {/* Station Details & Assigned Doctor */}
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                {/* Station Title */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Stase</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">
                    {item.isBreak ? "Stase Istirahat" : item.caseTitle || item.stationTitle || `Stase Ujian ${item.stationNum}`}
                  </p>
                </div>

                {/* Assigned Doctor */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Dokter Penguji</span>
                  {item.isBreak ? (
                    <p className="font-bold text-amber-800 text-xs mt-0.5">☕ Stase Istirahat</p>
                  ) : item.isAssigned ? (
                    <div className="mt-0.5">
                      <p className="font-bold text-slate-900 text-xs flex items-center gap-1 truncate" title={item.doctorName}>
                        <Stethoscope size={13} className="text-blue-600 shrink-0" />
                        {item.doctorName}
                      </p>
                      {item.doctorSpecialty && (
                        <p className="text-[10px] text-slate-500 pl-4 truncate">{item.doctorSpecialty}</p>
                      )}
                    </div>
                  ) : (
                    <p className="font-semibold text-amber-700 text-xs mt-0.5 flex items-center gap-1">
                      <AlertCircle size={12} className="text-amber-600 shrink-0" />
                      Belum Ditugaskan
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
