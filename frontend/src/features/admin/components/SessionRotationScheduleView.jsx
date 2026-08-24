import { useEffect, useState, useMemo, useRef } from "react";
import {
  Table,
  LayoutGrid,
  Users,
  Search,
  Filter,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  Printer,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Sparkles,
  Layers,
  Award,
  RefreshCw,
  CheckCircle2,
  Hourglass,
  Pause,
  Download,
  Loader2,
} from "lucide-react";
import { fetchSessionById } from "@/services/sessionService";
import { getSessionParticipants, getSessionExaminers } from "@/services/session.service";
import { supabase } from "@/lib/supabaseClient";
import { exportElementToPdf } from "@/services/pdfExportService";

export default function SessionRotationScheduleView({ sessionId, activeRound = null, timerState = null }) {
  const scheduleContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [stations, setStations] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [participants, setParticipants] = useState([]);

  // Controls
  const [viewMode, setViewMode] = useState("timeline"); // 'timeline' | 'table' | 'cards_participant' | 'cards_round'
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("approved"); // 'all' | 'approved' | 'pending'
  const [selectedRoundTab, setSelectedRoundTab] = useState(activeRound ? Number(activeRound) : 1);

  useEffect(() => {
    if (activeRound) {
      setSelectedRoundTab(Number(activeRound));
    }
  }, [activeRound]);

  async function loadData() {
    if (!sessionId) return;
    try {
      setLoading(true);
      const [sessResult, dbParticipants, dbExaminers] = await Promise.all([
        fetchSessionById(sessionId).catch(() => null),
        getSessionParticipants(sessionId).catch(() => []),
        getSessionExaminers(sessionId).catch(() => []),
      ]);

      if (sessResult) {
        setSessionData(sessResult);
        setStations(sessResult.stations || []);
      }
      setParticipants(dbParticipants || []);
      setExaminers(dbExaminers || []);
    } catch (err) {
      console.error("Error loading rotation schedule view data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [sessionId]);

  // Real-time listener for live updates to session_participants and session_examiners
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`rotation_schedule_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "osce",
          table: "session_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        () => loadData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "osce",
          table: "session_examiners",
          filter: `session_id=eq.${sessionId}`,
        },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const totalStationsCount = stations.length > 0 ? stations.length : (sessionData?.total_stations || 6);
  const roundsCount = totalStationsCount;

  // Filter participants
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && (p.status === "approved" || p.status === "active" || p.status === "running" || p.status === "finished")) ||
        (statusFilter === "pending" && p.status === "pending");

      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        p.full_name?.toLowerCase().includes(query) ||
        p.nim?.toLowerCase().includes(query) ||
        String(p.station_number || p.starting_station_number).includes(query);

      return matchStatus && matchQuery;
    });
  }, [participants, statusFilter, searchQuery]);

  // Map station number -> Assigned Examiner
  const stationExaminerMap = useMemo(() => {
    const map = {};
    stations.forEach((st) => {
      const stNum = Number(st.station_number);
      // Priority: examiner from session_examiners DB table, fallback to st.assigned_examiner
      const dbEx = examiners.find(
        (ex) => Number(ex.station_number || ex.assigned_station_number) === stNum
      );

      const doctorName = dbEx?.full_name || dbEx?.profiles?.full_name || st.assigned_examiner || st.examiner_name || null;
      const doctorSpecialty = dbEx?.specialty || dbEx?.profiles?.specialty || st.examiner_specialty || "Spesialis Medis";

      map[stNum] = {
        doctorName,
        doctorSpecialty,
        isAssigned: Boolean(doctorName),
      };
    });
    return map;
  }, [stations, examiners]);

  // Helper: calculate station reached at Round R for candidate with starting station S0
  // Formula: Station S = ((S0 - 1 + R - 1) mod N) + 1
  function getStationForCandidateAtRound(startingStationNum, roundNum, totalN) {
    const s0 = Number(startingStationNum || 1);
    const r = Number(roundNum || 1);
    const n = Number(totalN || 6);
    return ((s0 - 1 + (r - 1)) % n) + 1;
  }

  // Count unassigned doctors
  const unassignedDoctorsCount = useMemo(() => {
    let count = 0;
    for (let s = 1; s <= totalStationsCount; s++) {
      const st = stations.find((item) => Number(item.station_number) === s);
      const isBreak = st?.is_break || st?.title?.toLowerCase().includes("istirahat");
      if (!isBreak && !stationExaminerMap[s]?.doctorName) {
        count++;
      }
    }
    return count;
  }, [totalStationsCount, stations, stationExaminerMap]);

  // Generate Chronological Timeline Steps with Transitions, Clock Times, and Done Status
  const timelineSteps = useMemo(() => {
    if (!sessionData) return [];

    const stationMins = Number(sessionData.station_duration_minutes || 12);
    const transitionMins = Number(sessionData.transition_duration_minutes ?? 2);
    const totalR = Number(roundsCount || 4);

    let baseTime = new Date();
    if (sessionData.started_at) {
      baseTime = new Date(sessionData.started_at);
    } else if (sessionData.start_time) {
      const parts = String(sessionData.start_time).split(":");
      baseTime.setHours(parseInt(parts[0] || "8", 10), parseInt(parts[1] || "0", 10), 0, 0);
    } else {
      baseTime.setHours(8, 0, 0, 0);
    }

    const steps = [];
    let currentTime = new Date(baseTime);

    const rawPhase = timerState?.phase || "standby";
    const isPaused = rawPhase === "paused" || rawPhase.startsWith("paused") || sessionData.status === "paused";
    const livePhase = rawPhase.startsWith("paused_") ? rawPhase.replace("paused_", "") : (rawPhase === "paused" ? "action" : rawPhase);
    const liveRound = Number(timerState?.round_number || activeRound || 1);

    const fmt = (d) => {
      const hh = d.getHours().toString().padStart(2, "0");
      const mm = d.getMinutes().toString().padStart(2, "0");
      return `${hh}:${mm}`;
    };

    // 1. Initial Transition (Transisi Awal Persiapan Pos Stase 1)
    if (transitionMins > 0) {
      const startTimeStr = fmt(currentTime);
      const endTimeObj = new Date(currentTime.getTime() + transitionMins * 60 * 1000);
      const endTimeStr = fmt(endTimeObj);
      currentTime = endTimeObj;

      let status = "upcoming";
      if (livePhase === "initial_transition") {
        status = isPaused ? "paused" : "live";
      } else if (
        sessionData.status === "completed" ||
        sessionData.status === "finished" ||
        ((sessionData.status === "ongoing" || sessionData.status === "paused") && livePhase !== "standby" && livePhase !== "initial_transition")
      ) {
        status = "done";
      }

      steps.push({
        id: "step-init-trans",
        type: "transition",
        isInitial: true,
        title: "Transisi Awal & Persiapan Pos Stase 1",
        description: "Peserta memasuki gedung skill lab & persiapan di depan Pos Stase 1",
        durationMinutes: transitionMins,
        startTimeStr,
        endTimeStr,
        roundNumber: 1,
        status,
      });
    }

    // 2. Loop per Ronde (Exam Action + Inter-station Transition)
    for (let r = 1; r <= totalR; r++) {
      // 2a. Exam Action Step
      const examStart = fmt(currentTime);
      const examEndObj = new Date(currentTime.getTime() + stationMins * 60 * 1000);
      const examEnd = fmt(examEndObj);
      currentTime = examEndObj;

      let examStatus = "upcoming";
      if (sessionData.status === "completed" || sessionData.status === "finished") {
        examStatus = "done";
      } else if (sessionData.status === "ongoing" || sessionData.status === "running" || sessionData.status === "paused") {
        if (r < liveRound) {
          examStatus = "done";
        } else if (r === liveRound) {
          if (livePhase === "action" || livePhase === "reading" || livePhase === "running") {
            examStatus = isPaused ? "paused" : "live";
          } else if (livePhase === "transition" || livePhase === "break" || livePhase === "completed_waiting") {
            examStatus = "done";
          }
        }
      }

      steps.push({
        id: `step-round-${r}-exam`,
        type: "exam",
        title: `Ronde ${r}: Sesi Ujian Stase`,
        description: `Peserta mengerjakan kasus medis & evaluasi oleh Dokter Penguji (Ronde ${r}/${totalR})`,
        durationMinutes: stationMins,
        startTimeStr: examStart,
        endTimeStr: examEnd,
        roundNumber: r,
        status: examStatus,
      });

      // 2b. Inter-station Transition Step (Transisi Sela Pos / Transisi Akhir)
      if (transitionMins > 0) {
        const transStart = fmt(currentTime);
        const transEndObj = new Date(currentTime.getTime() + transitionMins * 60 * 1000);
        const transEnd = fmt(transEndObj);
        currentTime = transEndObj;

        let transStatus = "upcoming";
        const isFinalRound = r === totalR;

        if (sessionData.status === "completed" || sessionData.status === "finished") {
          transStatus = "done";
        } else if (sessionData.status === "ongoing" || sessionData.status === "running" || sessionData.status === "paused") {
          if (r < liveRound) {
            transStatus = "done";
          } else if (r === liveRound) {
            if (livePhase === "transition" || livePhase === "break" || livePhase === "completed_waiting") {
              transStatus = isPaused ? "paused" : "live";
            }
          }
        }

        steps.push({
          id: `step-round-${r}-trans`,
          type: "transition",
          isFinal: isFinalRound,
          title: isFinalRound ? "Transisi Akhir & Rekapitulasi Nilai" : `Transisi Rotasi Stase (Ronde ${r} → ${r + 1})`,
          description: isFinalRound
            ? "Seluruh ronde ujian selesai. Peserta keluar pos & Penguji menyelesaikan penginputan nilai"
            : `Peserta berjalan berpindah ke pos stase berikutnya untuk Ronde ${r + 1}`,
          durationMinutes: transitionMins,
          startTimeStr: transStart,
          endTimeStr: transEnd,
          roundNumber: r,
          status: transStatus,
        });
      }
    }

    return steps;
  }, [sessionData, roundsCount, timerState, activeRound]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <RefreshCw size={28} className="mx-auto animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700">Memuat Jadwal Mapping Rotasi Peserta & Penguji...</p>
        <p className="text-xs text-slate-400 mt-1">Mengalkulasi sirkuit {totalStationsCount} stase</p>
      </div>
    );
  }

  async function handleDownloadSchedulePdf() {
    if (!scheduleContainerRef.current) return;
    try {
      setDownloadingPdf(true);
      await exportElementToPdf(scheduleContainerRef.current, {
        filename: `Matriks_Rotasi_OSCE_${(sessionData?.title || "Jadwal").replace(/\s+/g, "_")}.pdf`,
        format: "a4",
        orientation: "landscape",
      });
    } catch (err) {
      console.error("Gagal mengunduh PDF Jadwal:", err);
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <div ref={scheduleContainerRef} className="space-y-6 min-w-0 max-w-full">
      {/* Top Header & Quick Metrics Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-100 p-2 text-blue-700">
                <Layers size={20} />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Jadwal Mapping Rotasi Peserta & Dokter Penguji
                </h2>
                <p className="text-xs text-slate-500">
                  Pemetaan sirkuit rotasi otomatis per ronde stase dari awal (Ronde 1) hingga akhir (Ronde {roundsCount}).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  viewMode === "timeline"
                    ? "bg-white text-blue-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Clock size={15} />
                Timeline Kegiatan
              </button>

              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  viewMode === "table"
                    ? "bg-white text-blue-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Table size={15} />
                Matriks Tabel
              </button>

              <button
                type="button"
                onClick={() => setViewMode("cards_participant")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  viewMode === "cards_participant"
                    ? "bg-white text-blue-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users size={15} />
                Kartu Per Peserta
              </button>

              <button
                type="button"
                onClick={() => setViewMode("cards_round")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  viewMode === "cards_round"
                    ? "bg-white text-blue-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid size={15} />
                Kartu Per Ronde
              </button>
            </div>

            {/* Print & PDF Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDownloadSchedulePdf}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Membuat PDF...
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    Cetak / Unduh Jadwal (PDF)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary Pills */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <span className="text-[11px] font-medium text-slate-500 block">Total Peserta Mapped</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">
              {participants.filter((p) => p.status === "approved" || p.status === "active").length} Peserta
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <span className="text-[11px] font-medium text-slate-500 block">Jumlah Pos Stase</span>
            <span className="text-base font-bold text-blue-700 mt-0.5 block">
              {totalStationsCount} Stase ({roundsCount} Ronde)
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <span className="text-[11px] font-medium text-slate-500 block">Status Dokter Penguji</span>
            <span className={`text-base font-bold mt-0.5 block ${unassignedDoctorsCount > 0 ? "text-amber-600" : "text-emerald-700"}`}>
              {totalStationsCount - unassignedDoctorsCount} / {totalStationsCount} Terisi
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <span className="text-[11px] font-medium text-slate-500 block">Status Rotasi Sesi</span>
            <span className="text-base font-bold text-slate-800 capitalize mt-0.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {sessionData?.status || "Draft"}
            </span>
          </div>
        </div>

        {/* Warning if any doctor is unassigned */}
        {unassignedDoctorsCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>
              Terdapat <strong>{unassignedDoctorsCount} Stase</strong> yang belum memiliki Dokter Penguji. Peserta yang masuk ke stase tersebut belum terhubung dengan penguji.
            </span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama peserta, NIM, atau nomor pos stase..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Filter size={13} />
              Status:
            </span>
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("approved")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  statusFilter === "approved" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Disetujui ({participants.filter((p) => p.status === "approved" || p.status === "active").length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  statusFilter === "all" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua ({participants.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  statusFilter === "pending" ? "bg-white text-amber-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending ({participants.filter((p) => p.status === "pending").length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 0: TIMELINE KANBAN / KRONOLOGIS KEGIATAN SIRKUIT */}
      {/* ------------------------------------------------------------- */}
      {viewMode === "timeline" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="text-blue-600" size={18} />
                Timeline Rangkaian Kegiatan Sirkuit OSCE ({timelineSteps.length} Tahapan)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Urutan kronologis lengkap mencakup <strong>Transisi Awal</strong>, <strong>Sesi Ujian Stase</strong>, <strong>Transisi Sela Pos</strong>, serta <strong>Status Selesai (DONE)</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <CheckCircle2 size={14} /> DONE (Selesai)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">
                <Pause size={12} /> PAUSED (Dihentikan)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2.5 py-1 rounded-lg animate-pulse">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> LIVE (Berlangsung)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                <Clock size={14} /> Menunggu
              </span>
            </div>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6">
            {timelineSteps.map((step, idx) => {
              const isDone = step.status === "done";
              const isLive = step.status === "live";
              const isStepPaused = step.status === "paused";

              return (
                <div key={step.id || idx} className="relative group">
                  {/* Timeline Dot Icon */}
                  <div
                    className={`absolute -left-[37px] sm:-left-[45px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${
                      isDone
                        ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-2xs"
                        : isStepPaused
                        ? "border-amber-500 bg-amber-500 text-white shadow-md animate-pulse"
                        : isLive
                        ? "border-blue-600 bg-blue-600 text-white shadow-md animate-bounce"
                        : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={15} />
                    ) : isStepPaused ? (
                      <Pause size={13} />
                    ) : isLive ? (
                      <Sparkles size={14} />
                    ) : step.type === "transition" ? (
                      <Hourglass size={13} />
                    ) : (
                      <Stethoscope size={13} />
                    )}
                  </div>

                  {/* Step Card Content */}
                  <div
                    className={`rounded-2xl border p-4.5 transition shadow-2xs ${
                      isStepPaused
                        ? "border-amber-400 bg-amber-50/80 shadow-md ring-2 ring-amber-300"
                        : isLive
                        ? "border-blue-400 bg-blue-50/70 shadow-md ring-2 ring-blue-200"
                        : isDone
                        ? "border-slate-200 bg-slate-50/60 opacity-85 hover:opacity-100"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                            isStepPaused
                              ? "bg-amber-500 text-white"
                              : step.type === "transition"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {step.type === "transition"
                            ? step.isInitial
                              ? "Transisi Awal"
                              : step.isFinal
                              ? "Transisi Akhir"
                              : "Transisi Pos"
                            : `Sesi Ujian Ronde ${step.roundNumber}`}
                        </span>

                        <h4 className="text-sm font-black text-slate-900">{step.title}</h4>
                      </div>

                      {/* Time Range Badge */}
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          <Clock size={13} className="text-slate-500" />
                          {step.startTimeStr} - {step.endTimeStr} ({step.durationMinutes} Mnt)
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-black uppercase flex items-center gap-1 ${
                            isDone
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : isStepPaused
                              ? "bg-amber-500 text-white shadow-xs"
                              : isLive
                              ? "bg-emerald-500 text-white shadow-xs animate-pulse"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 size={12} /> DONE (SELESAI)
                            </>
                          ) : isStepPaused ? (
                            <>
                              <Pause size={12} /> DIHENTIKAN (PAUSED)
                            </>
                          ) : isLive ? (
                            <>
                              <span className="h-2 w-2 rounded-full bg-white" /> BERLANGSUNG (LIVE)
                            </>
                          ) : (
                            "MENUNGGU"
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 font-medium">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 1: MATRIX TABLE VIEW */}
      {/* ------------------------------------------------------------- */}
      {viewMode === "table" && (
        <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="w-full max-w-full overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4 min-w-[50px] text-center">Pos S0</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Peserta Ujian</th>
                  {Array.from({ length: roundsCount }).map((_, rIdx) => {
                    const roundNum = rIdx + 1;
                    const isLive = activeRound && Number(activeRound) === roundNum;
                    return (
                      <th
                        key={roundNum}
                        className={`py-3.5 px-4 min-w-[210px] border-l border-slate-200 text-center transition ${
                          isLive ? "bg-blue-100/70 text-blue-900 border-blue-400" : ""
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`block font-extrabold text-xs ${isLive ? "text-blue-900" : "text-blue-700"}`}>
                            Ronde {roundNum}
                          </span>
                          {isLive && (
                            <span className="rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-black text-white uppercase animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-normal text-slate-500">Giliran Stase {roundNum}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={2 + roundsCount} className="py-12 text-center text-slate-400">
                      Tidak ada data peserta yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p, pIdx) => {
                    const startStationNum = Number(p.station_number || p.starting_station_number || ((pIdx % totalStationsCount) + 1));

                    return (
                      <tr key={p.id || pIdx} className="hover:bg-slate-50/80 transition">
                        {/* Starting Station S0 */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 font-extrabold text-blue-800 text-xs shadow-2xs">
                            S{startStationNum}
                          </span>
                        </td>

                        {/* Candidate Name & Info */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs">{p.full_name || p.profiles?.full_name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>NIM: {p.nim || "-"}</span>
                            <span
                              className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                                p.status === "approved" || p.status === "active"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {p.status === "approved" || p.status === "active" ? "Disetujui" : p.status}
                            </span>
                          </div>
                        </td>

                        {/* Round Columns */}
                        {Array.from({ length: roundsCount }).map((_, rIdx) => {
                          const roundNum = rIdx + 1;
                          const currentStationNum = getStationForCandidateAtRound(startStationNum, roundNum, totalStationsCount);
                          const stObj = stations.find((st) => Number(st.station_number) === currentStationNum);
                          const exInfo = stationExaminerMap[currentStationNum] || {};
                          const isBreak = stObj?.is_break || stObj?.title?.toLowerCase().includes("istirahat");

                          return (
                            <td key={roundNum} className="py-3 px-3 border-l border-slate-100 align-top">
                              <div
                                className={`rounded-xl border p-2.5 space-y-1.5 transition ${
                                  isBreak
                                    ? "border-amber-200 bg-amber-50/60"
                                    : exInfo.isAssigned
                                    ? "border-slate-200 bg-white hover:border-blue-300 shadow-2xs"
                                    : "border-amber-300 bg-amber-50/30"
                                }`}
                              >
                                {/* Station Badge & Title */}
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                                      isBreak ? "bg-amber-200 text-amber-900" : "bg-blue-600 text-white"
                                    }`}
                                  >
                                    Stase {currentStationNum}
                                  </span>

                                  <span className="text-[10px] font-medium text-slate-400 truncate max-w-[110px]" title={stObj?.title || `Stase ${currentStationNum}`}>
                                    {stObj?.title || `Stase ${currentStationNum}`}
                                  </span>
                                </div>

                                {/* Case Name */}
                                {stObj?.case_title && !isBreak && (
                                  <div className="text-[11px] font-semibold text-slate-800 truncate" title={stObj.case_title}>
                                    {stObj.case_title}
                                  </div>
                                )}

                                {/* Doctor Examiner */}
                                {isBreak ? (
                                  <div className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                                    ISTIRAHAT
                                  </div>
                                ) : exInfo.isAssigned ? (
                                  <div className="pt-1 border-t border-slate-100">
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900 truncate" title={exInfo.doctorName}>
                                      <span className="truncate">{exInfo.doctorName}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                      {exInfo.doctorSpecialty}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="pt-1 border-t border-amber-200 text-[10px] font-bold text-amber-700 flex items-center gap-1">
                                    <span>Belum Ada Dokter</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 2: PARTICIPANT CARDS TIMELINE */}
      {/* ------------------------------------------------------------- */}
      {viewMode === "cards_participant" && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredParticipants.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              Tidak ada data peserta yang cocok.
            </div>
          ) : (
            filteredParticipants.map((p, pIdx) => {
              const startStationNum = Number(p.station_number || p.starting_station_number || ((pIdx % totalStationsCount) + 1));

              return (
                <div key={p.id || pIdx} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition space-y-4">
                  {/* Participant Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white text-sm shadow-xs">
                        S{startStationNum}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{p.full_name || p.profiles?.full_name}</h3>
                        <p className="text-xs text-slate-500">NIM: {p.nim || "-"} • Pos Awal Stase {startStationNum}</p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        p.status === "approved" || p.status === "active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {p.status === "approved" || p.status === "active" ? "Disetujui" : p.status}
                    </span>
                  </div>

                  {/* Sequential Timeline of Rounds */}
                  <div className="space-y-2.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Urutan Rotasi Stase & Dokter Penguji ({roundsCount} Ronde)
                    </span>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {Array.from({ length: roundsCount }).map((_, rIdx) => {
                        const roundNum = rIdx + 1;
                        const currentStationNum = getStationForCandidateAtRound(startStationNum, roundNum, totalStationsCount);
                        const stObj = stations.find((st) => Number(st.station_number) === currentStationNum);
                        const exInfo = stationExaminerMap[currentStationNum] || {};
                        const isBreak = stObj?.is_break || stObj?.title?.toLowerCase().includes("istirahat");

                        return (
                          <div
                            key={roundNum}
                            className={`rounded-xl border p-3 transition space-y-1 ${
                              isBreak
                                ? "border-amber-200 bg-amber-50/60"
                                : exInfo.isAssigned
                                ? "border-slate-200 bg-slate-50/80 hover:bg-white hover:border-blue-300"
                                : "border-amber-200 bg-amber-50/30"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-extrabold text-blue-700">Ronde {roundNum}</span>
                              <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                Stase {currentStationNum}
                              </span>
                            </div>

                            <div className="font-semibold text-slate-800 text-xs truncate">
                              {stObj?.title || `Stase ${currentStationNum}`}
                            </div>

                            {isBreak ? (
                              <div className="text-[10px] font-bold text-amber-800 pt-1">ISTIRAHAT</div>
                            ) : (
                              <div className="pt-1 text-[11px] text-slate-600">
                                <div className="font-bold text-slate-900 flex items-center gap-1 truncate">
                                  <span className="truncate">{exInfo.doctorName || "Belum ada penguji"}</span>
                                </div>
                                {exInfo.doctorSpecialty && (
                                  <span className="text-[10px] text-slate-400 block truncate">{exInfo.doctorSpecialty}</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 3: CARDS BY ROUND */}
      {/* ------------------------------------------------------------- */}
      {viewMode === "cards_round" && (
        <div className="space-y-4">
          {/* Round Selector Tabs */}
          <div className="flex overflow-x-auto gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
            {Array.from({ length: roundsCount }).map((_, rIdx) => {
              const roundNum = rIdx + 1;
              const isActive = selectedRoundTab === roundNum;

              return (
                <button
                  key={roundNum}
                  type="button"
                  onClick={() => setSelectedRoundTab(roundNum)}
                  className={`flex-1 min-w-[120px] rounded-xl px-4 py-2.5 text-xs font-bold transition text-center cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Ronde {roundNum}
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">Rotasi Ke-{roundNum}</span>
                </button>
              );
            })}
          </div>

          {/* Cards for each Station Room in Selected Round */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: totalStationsCount }).map((_, sIdx) => {
              const stationNum = sIdx + 1;
              const stObj = stations.find((st) => Number(st.station_number) === stationNum);
              const exInfo = stationExaminerMap[stationNum] || {};
              const isBreak = stObj?.is_break || stObj?.title?.toLowerCase().includes("istirahat");

              // Find candidate who is at this station in selectedRoundTab
              const matchedCandidate = participants.find((p, pIdx) => {
                const s0 = Number(p.station_number || p.starting_station_number || ((pIdx % totalStationsCount) + 1));
                const stationAtRound = getStationForCandidateAtRound(s0, selectedRoundTab, totalStationsCount);
                return stationAtRound === stationNum;
              });

              return (
                <div
                  key={stationNum}
                  className={`overflow-hidden rounded-2xl border p-5 transition space-y-4 ${
                    isBreak
                      ? "border-amber-200 bg-amber-50/60"
                      : "border-slate-200 bg-white shadow-xs hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg font-extrabold text-white text-xs ${
                          isBreak ? "bg-amber-600" : "bg-blue-600"
                        }`}
                      >
                        {stationNum}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{stObj?.title || `Stase ${stationNum}`}</h4>
                        <p className="text-[10px] text-slate-500">Ruang Stase Pos #{stationNum}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      Ronde {selectedRoundTab}
                    </span>
                  </div>

                  {stObj?.case_title && !isBreak && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Kasus Ujian</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{stObj.case_title}</span>
                    </div>
                  )}

                  {/* Doctor Examiner Section */}
                  <div className="rounded-xl border border-slate-100 bg-blue-50/40 p-3 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">Dokter Penguji Pos</span>
                    {isBreak ? (
                      <span className="font-bold text-amber-800 block">Stase Istirahat</span>
                    ) : exInfo.isAssigned ? (
                      <div>
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          {exInfo.doctorName}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{exInfo.doctorSpecialty}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-amber-700 block">Belum Ditugaskan</span>
                    )}
                  </div>

                  {/* Candidate Assigned Section */}
                  <div className="rounded-xl border border-slate-100 bg-emerald-50/40 p-3 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                      Peserta Diuji (Ronde {selectedRoundTab})
                    </span>
                    {matchedCandidate ? (
                      <div>
                        <span className="font-bold text-slate-900 block">{matchedCandidate.full_name}</span>
                        <span className="text-[10px] text-slate-500 block">
                          NIM: {matchedCandidate.nim || "-"} • Pos Awal S{matchedCandidate.station_number || matchedCandidate.starting_station_number}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic block">Tidak ada peserta berposisi di pos ini</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
