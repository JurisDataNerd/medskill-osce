import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { MOCK_LIVE_SESSION_DETAIL } from "@/features/admin/data/mockAdminData";
import {
  Activity,
  Clock,
  User,
  UserCheck,
  Play,
  Pause,
  RotateCw,
  Square,
  Send,
  Grid,
  ListOrdered,
  FileText,
  AlertCircle,
  CheckCircle2,
  Coffee,
  ChevronRight,
  Sparkles,
  Search,
  X,
  ExternalLink,
  Award,
  Bell,
  Megaphone,
  Volume2,
  Calendar,
  Layers,
} from "lucide-react";

// Web Audio API Bell Synthesizer (No external file dependencies needed)
function playOsceBell(type = "warning") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "start") {
      // Single High Chime Bell (Reading Time / Start)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } else if (type === "warning") {
      // Double Beep Warning (2 Minutes Remaining)
      [0, 0.25].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(660, ctx.currentTime + delay); // E5
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.18);
      });
    } else if (type === "rotation") {
      // Triple Siren Alarm (Station Rotation Time Up)
      [0, 0.3, 0.6].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(idx === 2 ? 987.77 : 523.25, ctx.currentTime + delay); // C5 - B5
        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.22);
      });
    }
  } catch (err) {
    console.error("Audio Bell playback error:", err);
  }
}

// Full Participant Database for All 6 Rounds Mapping
const MOCK_PARTICIPANTS_DATABASE = [
  { id: "part-001", nim: "2022011001", name: "Ahmad Rizky Pratama", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" },
  { id: "part-002", nim: "2022011002", name: "Budi Santoso", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80" },
  { id: "part-003", nim: "2022011003", name: "Citra Kirana", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
  { id: "part-004", nim: "2022011004", name: "Dewi Sartika", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" },
  { id: "part-005", nim: "2022011005", name: "Eko Wijaya", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  { id: "part-006", nim: "2022011006", name: "Fira Anindya", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" },
];

export default function LiveMonitorPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(MOCK_LIVE_SESSION_DETAIL);
  const [activeTab, setActiveTab] = useState("grid"); // 'grid', 'matrix', 'logs'
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(session.remaining_seconds);
  const [isBreak, setIsBreak] = useState(session.is_break);
  const [currentRound, setCurrentRound] = useState(session.current_round); // Live active round (e.g. 2)
  const [viewRound, setViewRound] = useState(session.current_round); // Selected round view (1 to 6)
  const [logs, setLogs] = useState(session.logs);
  const [stationSearch, setStationSearch] = useState("");

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all"); // 'all', 'examiners', 'participants'
  const [activeNotification, setActiveNotification] = useState(null);

  // Bell Menu State
  const [isBellMenuOpen, setIsBellMenuOpen] = useState(false);

  // Live Timer Countdown Effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        // Automatic Bell Triggering
        if (prev === 120 && !isBreak) {
          playOsceBell("warning");
          addLog("warning", "🔔 BEL AUTOMATIC: Sisa Waktu Stase 2 Menit!");
        }

        if (prev <= 1) {
          if (!isBreak) {
            setIsBreak(true);
            playOsceBell("rotation");
            addLog("warning", `🚨 BEL ROTASI: Stase Ronde ${currentRound} Selesai. Masuk ke Waktu Istirahat (Break).`);
            return session.break_duration_seconds;
          } else {
            setIsBreak(false);
            const nextRound = currentRound < session.total_rounds ? currentRound + 1 : 1;
            setCurrentRound(nextRound);
            setViewRound(nextRound);
            playOsceBell("start");
            addLog("info", `🔔 BEL MULAI: Rolling Otomatis! Masuk ke Ronde ${nextRound} dari ${session.total_rounds}.`);
            return session.station_duration_seconds;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isBreak, currentRound, session]);

  function addLog(type, text) {
    const timeStr = new Date().toLocaleTimeString("id-ID");
    setLogs((prev) => [
      { id: `log-${Date.now()}`, time: timeStr, type, text },
      ...prev,
    ]);
  }

  // Admin Control Handlers
  function handleTogglePause() {
    const nextState = !isTimerRunning;
    setIsTimerRunning(nextState);
    addLog(nextState ? "info" : "warning", nextState ? "Admin melanjutkan timer OSCE." : "Admin menghentikan sementara (Pause) timer OSCE.");
  }

  function handleTriggerBell(bellType) {
    playOsceBell(bellType);
    const bellNames = {
      start: "Bel 1x (Mulai / Reading Time)",
      warning: "Bel 2x (Peringatan 2 Menit Tersisa)",
      rotation: "Bel 3x (Selesai & Rotasi Stase)",
    };
    addLog("info", `🔊 Admin memicu suara manual: ${bellNames[bellType]}`);
    setIsBellMenuOpen(false);
  }

  function handleSendBroadcast() {
    if (!broadcastMessage.trim()) return;

    const targetLabel = broadcastTarget === "all" ? "Semua Layar (Peserta & Penguji)" : broadcastTarget === "examiners" ? "Layar Dokter Penguji" : "Layar Peserta";
    
    addLog("warning", `📢 BROADCAST ADMIN [${targetLabel}]: "${broadcastMessage}"`);
    setActiveNotification({
      id: Date.now(),
      message: broadcastMessage,
      target: targetLabel,
      time: new Date().toLocaleTimeString("id-ID"),
    });

    setIsBroadcastModalOpen(false);
    setBroadcastMessage("");
  }

  function handleFinishOSCE() {
    if (confirm("Apakah Anda yakin ingin mengakhiri sesi OSCE ini? Seluruh pengerjaan stase akan ditutup.")) {
      setSession((prev) => ({ ...prev, status: "completed" }));
      setIsTimerRunning(false);
      addLog("success", "Sesi OSCE telah diakhiri oleh Admin.");
    }
  }

  function handlePublishResult() {
    alert("Hasil Ujian OSCE berhasil dipublikasikan! Peserta kini dapat melihat nilai di dashboard mereka dan email notifikasi telah dikirim.");
    addLog("success", "Admin mempublikasikan Hasil Ujian OSCE ke Peserta & Email.");
  }

  function formatMinutesSeconds(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Derive station data dynamically based on the selected viewRound (1..6)
  const isViewingLiveRound = viewRound === currentRound;
  const isViewingPastRound = viewRound < currentRound;
  const isViewingUpcomingRound = viewRound > currentRound;

  const currentRoundMatrix = session.rolling_matrix.find((r) => r.round === viewRound);

  const dynamicStations = session.stations.map((st) => {
    // Find assignment for this station in the selected viewRound
    const assignment = currentRoundMatrix?.assignments.find((a) => a.station === st.station_number);
    const participantName = assignment ? assignment.participant : "Belum diplot";

    // Match participant detail from database
    const participantObj = MOCK_PARTICIPANTS_DATABASE.find((p) => p.name.toLowerCase().includes(participantName.toLowerCase())) || {
      id: `part-${st.station_number}`,
      nim: `202201100${st.station_number}`,
      name: participantName,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    let roundScoringStatus = "not_started";
    let roundChecklistCompleted = 0;
    let roundScorePreview = 0;

    if (isViewingPastRound) {
      roundScoringStatus = "submitted";
      roundChecklistCompleted = st.checklist_total;
      roundScorePreview = Math.floor(85 + (st.station_number * 2.5) % 15);
    } else if (isViewingLiveRound) {
      roundScoringStatus = st.scoring_status;
      roundChecklistCompleted = st.checklist_completed;
      roundScorePreview = st.score_preview;
    } else {
      roundScoringStatus = "not_started";
      roundChecklistCompleted = 0;
      roundScorePreview = 0;
    }

    return {
      ...st,
      current_participant: participantObj,
      scoring_status: roundScoringStatus,
      checklist_completed: roundChecklistCompleted,
      score_preview: roundScorePreview,
    };
  });

  const totalStations = session.stations.length;
  const submittedCount = dynamicStations.filter((s) => s.scoring_status === "submitted").length;
  const inProgressCount = dynamicStations.filter((s) => s.scoring_status === "in_progress").length;

  const filteredStations = dynamicStations.filter(
    (s) =>
      s.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
      s.case_title.toLowerCase().includes(stationSearch.toLowerCase()) ||
      s.examiner.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
      s.current_participant.name.toLowerCase().includes(stationSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Toast Notification for Admin Broadcast */}
      {activeNotification && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-400 bg-amber-500 p-4 text-slate-950 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
              <Megaphone size={20} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-950/80">
                <span>Pengumuman Broadcast Terkirim</span>
                <span>•</span>
                <span>{activeNotification.time}</span>
                <span>•</span>
                <span className="underline">{activeNotification.target}</span>
              </div>
              <p className="font-bold text-sm text-slate-950 mt-0.5">
                "{activeNotification.message}"
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveNotification(null)}
            className="rounded-lg bg-slate-950/10 p-1.5 text-slate-950 hover:bg-slate-950/20"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Top Banner Control Room Header */}
      <div className="mb-8 rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-700/60 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/90 text-white shadow-lg shadow-blue-500/30">
              <Activity size={24} />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  OSCE Control Room
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  REALTIME LIVE
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300 font-medium">
                {session.title}
              </p>
            </div>
          </div>

          {/* Master Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Bell Generator Menu */}
            <div className="relative">
              <button
                onClick={() => setIsBellMenuOpen(!isBellMenuOpen)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-md"
              >
                <Bell size={16} />
                Bunyikan Bel
              </button>

              {isBellMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Pilihan Audio Bel Manual
                  </div>
                  <button
                    onClick={() => handleTriggerBell("start")}
                    className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-indigo-600 hover:text-white transition flex items-center justify-between mt-1"
                  >
                    <span>🔔 Bel 1x (Mulai / Reading)</span>
                    <Volume2 size={14} />
                  </button>
                  <button
                    onClick={() => handleTriggerBell("warning")}
                    className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-amber-600 hover:text-white transition flex items-center justify-between"
                  >
                    <span>🔔 Bel 2x (Sisa 2 Menit)</span>
                    <Volume2 size={14} />
                  </button>
                  <button
                    onClick={() => handleTriggerBell("rotation")}
                    className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-rose-600 hover:text-white transition flex items-center justify-between"
                  >
                    <span>🚨 Bel 3x (Selesai & Rotasi)</span>
                    <Volume2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Broadcast Modal Trigger */}
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-md"
            >
              <Megaphone size={16} />
              Broadcast Pesan
            </button>

            <button
              onClick={handleTogglePause}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-md active:scale-95 ${
                isTimerRunning
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >
              {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
              {isTimerRunning ? "Pause Timer" : "Resume Timer"}
            </button>

            <button
              onClick={handleFinishOSCE}
              className="flex items-center gap-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95"
            >
              <Square size={15} />
              Akhiri OSCE
            </button>

            <button
              onClick={handlePublishResult}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <Send size={15} />
              Publish Hasil
            </button>
          </div>
        </div>

        {/* Live Timers & Status Strip */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Status Ronde Live
            </div>
            <div className="mt-2 flex items-center gap-2 text-lg font-bold text-white">
              <span className="text-blue-400">Ronde {currentRound}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{session.total_rounds}</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {isBreak ? "Masa Istirahat (Break)" : "Stase Sedang Berlangsung"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isBreak ? "Timer Istirahat (Break)" : "Timer Stase Aktif"}
            </div>
            <div
              className={`mt-2 font-mono text-3xl font-extrabold tracking-tight ${
                isBreak
                  ? "text-amber-400"
                  : remainingSeconds < 180
                  ? "text-rose-400 animate-pulse"
                  : "text-emerald-400"
              }`}
            >
              {formatMinutesSeconds(remainingSeconds)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {isBreak ? "Menunggu rolling otomatis" : "Waktu pengerjaan & penilaian"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Penilaian Penguji (Ronde {viewRound})
            </div>
            <div className="mt-2 flex items-center gap-2 text-lg font-bold text-white">
              <span className="text-emerald-400">{submittedCount} Selesai</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400">{inProgressCount} Progres</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Dari total {totalStations} Stase Aktif
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Peserta Ujian
            </div>
            <div className="mt-2 text-lg font-bold text-white">
              {session.total_participants} Peserta
            </div>
            <div className="mt-1 text-xs text-slate-400">
              6 Stase / Rotasi Berjalan
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE CIRCUIT TIMELINE CONTROL BAR FOR UI TESTING */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Simulasi Sirkuit Ujian & Control Room UI Testing
              </h2>
              <p className="text-xs text-slate-500">
                Klik pada kartu <span className="font-bold text-slate-700">Ronde Ujian</span>, <span className="font-bold text-blue-600">Transisi (2m)</span>, atau <span className="font-bold text-amber-600">Istirahat (10m)</span> untuk menguji tampilan mode simulasi live:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 border border-slate-200">
              Klik Modul Mana Saja Untuk Pengujian UI
            </span>
          </div>
        </div>

        {/* Interactive Step Timeline Cards (Ronde Ujian, Ronde Istirahat, & Transisi Jeda) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
          {[
            { type: "exam", round: 1, title: "Ronde 1" },
            { type: "transit", round: 1, title: "Transisi 2m" },
            { type: "exam", round: 2, title: "Ronde 2" },
            { type: "transit", round: 2, title: "Transisi 2m" },
            { type: "exam", round: 3, title: "Ronde 3" },
            { type: "transit", round: 3, title: "Transisi 2m" },
            { type: "break", round: 3, title: "Ronde Istirahat (10m)" },
            { type: "transit", round: 3.5, title: "Transisi 2m" },
            { type: "exam", round: 4, title: "Ronde 4" },
            { type: "transit", round: 4, title: "Transisi 2m" },
            { type: "exam", round: 5, title: "Ronde 5" },
            { type: "transit", round: 5, title: "Transisi 2m" },
            { type: "exam", round: 6, title: "Ronde 6" },
          ].map((item, index) => {
            if (item.type === "exam") {
              const roundNum = item.round;
              const isCurrent = roundNum === currentRound && !isBreak;
              const isSelected = roundNum === viewRound && !isBreak;
              const isPast = roundNum < currentRound;

              return (
                <button
                  key={`exam-${roundNum}`}
                  type="button"
                  onClick={() => {
                    setViewRound(roundNum);
                    setIsBreak(false);
                    setRemainingSeconds(15 * 60);
                  }}
                  className={`group relative flex flex-col justify-between rounded-2xl p-3 min-w-[130px] border text-left transition-all duration-200 active:scale-95 shadow-2xs ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-md ring-4 ring-blue-500/20"
                      : isCurrent
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100"
                      : isPast
                      ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      : "bg-white border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                      Stase Ujian 15m
                    </span>
                    {isCurrent && (
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </div>

                  <div className="my-1.5 flex items-center justify-between">
                    <span className="text-sm font-black">
                      Ronde {roundNum}
                    </span>
                    {isSelected ? (
                      <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Ditinjau
                      </span>
                    ) : isCurrent ? (
                      <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        LIVE
                      </span>
                    ) : isPast ? (
                      <span className="text-[10px] font-medium text-slate-400">
                        Selesai
                      </span>
                    ) : null}
                  </div>

                  <div className={`text-[10px] font-semibold flex items-center gap-1 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                    <span>Stase 1 - 6 Aktif</span>
                  </div>
                </button>
              );
            }

            if (item.type === "break") {
              const isSelectedBreak = isBreak && remainingSeconds > 3 * 60;

              return (
                <button
                  key={`break-${index}`}
                  type="button"
                  onClick={() => {
                    setViewRound(3);
                    setIsBreak(true);
                    setRemainingSeconds(10 * 60);
                  }}
                  className={`group relative flex flex-col justify-between rounded-2xl p-3 min-w-[150px] border text-left transition-all duration-200 active:scale-95 shadow-2xs ${
                    isSelectedBreak
                      ? "bg-amber-500 border-amber-500 text-amber-950 shadow-md ring-4 ring-amber-400/40"
                      : "bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100 shadow-amber-100/50"
                  }`}
                  title="Klik untuk menguji tampilan Mode Ronde Istirahat 10 Menit"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${isSelectedBreak ? "text-amber-950" : "text-amber-800"}`}>
                      <Coffee size={12} />
                      Sesi Sirkuit
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isSelectedBreak ? "bg-amber-950 text-amber-100" : "bg-amber-200 text-amber-900"}`}>
                      RONDE ISTIRAHAT
                    </span>
                  </div>
                  <div className="my-1">
                    <span className="text-sm font-black">
                      Istirahat Ronde (10m)
                    </span>
                  </div>
                  <div className={`text-[10px] font-semibold ${isSelectedBreak ? "text-amber-950" : "text-amber-800"}`}>
                    Jeda Setelah Ronde 3
                  </div>
                </button>
              );
            }

            // TYPE TRANSIT
            return (
              <button
                key={`transit-${index}`}
                type="button"
                onClick={() => {
                  setViewRound(Math.floor(item.round));
                  setIsBreak(true);
                  setRemainingSeconds(2 * 60);
                }}
                className={`group relative flex flex-col justify-center rounded-xl px-2 py-2 min-w-[72px] text-center border transition-all duration-200 active:scale-95 ${
                  isBreak && remainingSeconds <= 2 * 60 && viewRound === Math.floor(item.round)
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:border-slate-300"
                }`}
                title="Transisi Berjalan antar Ronde (2 Menit)"
              >
                <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase">
                  <Clock size={10} />
                  <span>2m</span>
                </div>
                <span className="text-[10px] font-extrabold leading-tight mt-0.5">
                  Transisi
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Preview Bar */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-bold text-slate-900">Status UI Testing:</span>
            {isBreak ? (
              <span className="rounded-lg bg-amber-100 border border-amber-300 px-2.5 py-1 font-bold text-amber-900 flex items-center gap-1.5">
                <Coffee size={14} className="text-amber-700" />
                Mode Simulasi: Waktu Istirahat / Transisi ({Math.floor(remainingSeconds / 60)} Menit)
              </span>
            ) : (
              <span className="rounded-lg bg-blue-100 border border-blue-300 px-2.5 py-1 font-bold text-blue-900 flex items-center gap-1.5">
                <Layers size={14} className="text-blue-700" />
                Meninjau Ronde {viewRound} (Stase Ujian Medis 1 - 6 Aktif)
              </span>
            )}
          </div>

          {(viewRound !== currentRound || isBreak) && (
            <button
              onClick={() => {
                setViewRound(currentRound);
                setIsBreak(false);
                setRemainingSeconds(15 * 60);
              }}
              className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-xs"
            >
              Reset ke Ronde Live Standard ({currentRound}) <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs & Search Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
          <TabButton
            active={activeTab === "grid"}
            onClick={() => setActiveTab("grid")}
            icon={<Grid size={17} />}
            label={`Stations Grid (Ronde ${viewRound})`}
          />
          <TabButton
            active={activeTab === "matrix"}
            onClick={() => setActiveTab("matrix")}
            icon={<ListOrdered size={17} />}
            label="Matriks Perputaran (All Rounds)"
          />
          <TabButton
            active={activeTab === "logs"}
            onClick={() => setActiveTab("logs")}
            icon={<FileText size={17} />}
            label="Activity Log & Audit"
            badge={logs.length}
          />
        </div>

        {activeTab === "grid" && (
          <div className="relative min-w-[280px]">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari stase, penguji, atau peserta..."
              value={stationSearch}
              onChange={(e) => setStationSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: LIVE STATIONS GRID */}
      {activeTab === "grid" && (
        <div className="space-y-6">
          {/* Global Break Alert Banner when isBreak is true and viewing live round */}
          {isBreak && isViewingLiveRound && (
            <div className="flex items-center gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-xs animate-in fade-in">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900 font-extrabold text-lg">
                <Coffee size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-900">
                  Masa Istirahat / Break Global Sedang Berlangsung!
                </h3>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  Seluruh 6 stase dijeda sementara. Peserta & penguji beristirahat selama 3 menit sebelum rotasi otomatis ke Ronde berikutnya.
                </p>
              </div>
            </div>
          )}

          {filteredStations.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              Tidak ada stase yang sesuai dengan pencarian Anda.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredStations.map((station) => (
                <StationLiveCard
                  key={station.id}
                  station={station}
                  remainingSeconds={remainingSeconds}
                  stationDurationSeconds={session.station_duration_seconds}
                  isBreak={isBreak}
                  currentRound={viewRound}
                  isLiveRound={isViewingLiveRound}
                  onViewDetail={() => navigate(`/admin/live/station/${station.id || "stase-1"}`)}
                  onViewScorecard={() => navigate(`/admin/live/participant/p1`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: MATRIKS ROLLING PESERTA */}
      {activeTab === "matrix" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ListOrdered size={20} className="text-blue-600" />
              Matriks Perputaran (Rolling) Peserta OSCE
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Visualisasi perpindahan posisi 6 peserta antar 6 stase aktif di setiap ronde. Klik baris ronde untuk beralih tampilan stase.
            </p>
          </div>

          <div className="overflow-x-auto p-6">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3">Ronde Ujian</th>
                  <th className="px-4 py-3">Status Ronde</th>
                  <th className="px-4 py-3">Stase 1</th>
                  <th className="px-4 py-3">Stase 2</th>
                  <th className="px-4 py-3">Stase 3</th>
                  <th className="px-4 py-3">Stase 4</th>
                  <th className="px-4 py-3">Stase 5</th>
                  <th className="px-4 py-3">Stase 6</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {session.rolling_matrix.map((matrixRow) => {
                  const isActiveRound = matrixRow.round === currentRound;
                  const isSelectedRound = matrixRow.round === viewRound;

                  return (
                    <tr
                      key={matrixRow.round}
                      onClick={() => setViewRound(matrixRow.round)}
                      className={`transition cursor-pointer ${
                        isSelectedRound
                          ? "bg-blue-50/90 font-semibold text-slate-900 border-l-4 border-l-blue-600"
                          : isActiveRound
                          ? isBreak
                            ? "bg-amber-50/80 text-amber-950 border-l-4 border-l-amber-500"
                            : "bg-emerald-50/50 text-slate-900 border-l-4 border-l-emerald-500"
                          : "hover:bg-slate-50/60 text-slate-700"
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap font-bold">
                        Ronde {matrixRow.round}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {isActiveRound ? (
                          isBreak ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-xs font-bold text-amber-900 animate-pulse">
                              <Coffee size={13} className="text-amber-800 shrink-0" />
                              Break (Istirahat)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-bold text-emerald-800 animate-pulse">
                              <span className="h-2 w-2 rounded-full bg-emerald-600" />
                              Aktif Sekarang
                            </span>
                          )
                        ) : matrixRow.round < currentRound ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                            Akan Datang
                          </span>
                        )}
                      </td>

                      {matrixRow.assignments.map((assignment) => (
                        <td
                          key={assignment.station}
                          className="px-4 py-4 whitespace-nowrap text-xs"
                        >
                          <div
                            className={`rounded-xl px-3 py-2 border transition ${
                              isSelectedRound
                                ? "bg-white border-blue-500 text-blue-900 shadow-sm font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <div className="font-semibold flex items-center justify-between gap-1">
                              <span>{assignment.participant}</span>
                              <Award size={12} className="text-amber-500" />
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">Stase {assignment.station}</div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: ACTIVITY LOG & AUDIT TRAIL */}
      {activeTab === "logs" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Activity Log & Audit Trail Realtime
          </h2>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-sm"
              >
                <div className="font-mono text-xs font-bold text-slate-400 pt-0.5">
                  {log.time}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{log.text}</p>
                </div>
                <LogTypeBadge type={log.type} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BROADCAST CONTROL ROOM MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Broadcast Pengumuman Live
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kirim pengumuman langsung ke layar penguji & peserta.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Penerima Pesan
                </label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">📢 Semua Layar (Dokter Penguji & Peserta)</option>
                  <option value="examiners">👨‍⚕️ Layar Dokter Penguji Saja</option>
                  <option value="participants">👨‍🎓 Layar Peserta Ujian Saja</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Preset Pesan Cepat
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {[
                    "⏱️ Sisa waktu pengerjaan 2 menit lagi!",
                    "🚨 Waktu stase habis, harap persiapkan perpindahan rotasi.",
                    "Waktu istirahat (break) berlangsung selama 3 menit.",
                    "⚠️ Mohon dokter penguji menyelesaikan penguncian nilai.",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBroadcastMessage(preset)}
                      className="rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 text-left transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Isi Pesan Broadcast Custom
                </label>
                <textarea
                  rows={3}
                  placeholder="Ketik pesan pengumuman..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2 text-xs font-bold text-white shadow-md transition active:scale-95"
              >
                <Send size={15} />
                Kirim Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function TabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
        active
          ? "bg-white text-blue-700 shadow-sm border border-slate-200"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && (
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
          {badge}
        </span>
      )}
    </button>
  );
}

function StationLiveCard({
  station,
  remainingSeconds,
  stationDurationSeconds,
  isBreak,
  currentRound,
  isLiveRound,
  onViewDetail,
  onViewScorecard,
}) {
  const isSubmitted = station.scoring_status === "submitted";

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Station Header */}
      <div className="border-b p-5 bg-slate-50/80 border-slate-100">
        <div className="flex items-center justify-between">
          <span className="rounded-lg px-3 py-1 text-xs font-extrabold bg-blue-100 text-blue-800">
            STASE {station.station_number}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${
              isSubmitted
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isLiveRound
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSubmitted ? "bg-emerald-500" : isLiveRound ? "bg-amber-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {isSubmitted ? "Nilai Terkirim" : isLiveRound ? "Sedang Menilai" : "Belum Dimulai"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900 line-clamp-1">
            {station.name}
          </h3>
          <button
            onClick={onViewDetail}
            className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 shrink-0 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
          >
            Detail Stase & Siswa <ExternalLink size={12} />
          </button>
        </div>

        <p className="mt-1 text-xs text-slate-500 line-clamp-1">
          Kasus: <span className="font-medium text-slate-700">{station.case_title}</span>
        </p>
      </div>

      {/* Body: Examiner & Participant Details */}
      <div className="p-5 space-y-4">
        {/* Penguji Info */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <img
            src={station.examiner.avatar}
            alt={station.examiner.name}
            className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-xs"
          />
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Penguji Stase
            </div>
            <div className="font-bold text-slate-800 text-sm truncate">
              {station.examiner.name}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {station.examiner.title}
            </div>
          </div>
        </div>

        {/* Peserta Info */}
        <div
          onClick={onViewScorecard}
          className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/30 p-3 cursor-pointer hover:bg-blue-50/60 transition"
        >
          <div className="flex items-center gap-3.5 overflow-hidden">
            <img
              src={station.current_participant.avatar}
              alt={station.current_participant.name}
              className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                Peserta (Ronde {currentRound})
              </div>
              <div className="font-bold text-slate-900 text-sm truncate">
                {station.current_participant.name}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                NIM: {station.current_participant.nim}
              </div>
            </div>
          </div>

          <Award size={18} className="text-blue-600 shrink-0" title="Lihat Rekap Nilai" />
        </div>

        {/* Live Assessment Checklist Progress */}
        <div className="rounded-xl border border-slate-100 p-3 bg-white">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium font-semibold">Progres Rubrik Ujian:</span>
            <span className="font-extrabold text-blue-700">
              {station.checklist_completed} / {station.checklist_total} Poin
            </span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${
                isSubmitted ? "bg-emerald-500" : "bg-blue-600"
              }`}
              style={{
                width: `${(station.checklist_completed / station.checklist_total) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer Notes Preview */}
      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500 flex items-center justify-between">
        <div className="truncate">
          <span className="font-semibold text-slate-700">Skor Preview:</span>{" "}
          <span className="font-mono font-bold text-blue-700">{station.score_preview > 0 ? `${station.score_preview} Poin` : "-"}</span>
        </div>
        <button
          onClick={onViewScorecard}
          className="text-xs font-bold text-blue-600 hover:underline shrink-0 ml-2"
        >
          Lihat Jawaban
        </button>
      </div>
    </div>
  );
}

function LogTypeBadge({ type }) {
  const configs = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
        configs[type] || configs.info
      }`}
    >
      {type.toUpperCase()}
    </span>
  );
}