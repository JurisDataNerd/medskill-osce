import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
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
  Building2,
  Loader2,
} from "lucide-react";
import { sendBroadcastMessage } from "@/services/broadcast.service";
import {
  getLiveStations,
  startLiveSession,
  subscribeLive,
  getSessionTimerState,
  updateSessionTimerState,
} from "@/services/live.service";
import { fetchSessions, fetchSessionById, updateSessionStatus } from "@/services/sessionService";

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

export default function LiveMonitorPage() {
  const navigate = useNavigate();

  // Supabase State
  const [loading, setLoading] = useState(true);
  const [dbSessions, setDbSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [liveStations, setLiveStations] = useState([]);

  // Live Timer State
  const [activeTab, setActiveTab] = useState("grid"); // 'grid', 'matrix', 'logs'
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(720);
  const [isBreak, setIsBreak] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [viewRound, setViewRound] = useState(1);
  const [logs, setLogs] = useState([]);
  const [stationSearch, setStationSearch] = useState("");

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all");
  const [activeNotification, setActiveNotification] = useState(null);

  // Bell Menu State
  const [isBellMenuOpen, setIsBellMenuOpen] = useState(false);

  // Load Real Supabase Data
  async function loadLiveMonitorData() {
    try {
      setLoading(true);
      const rawSessions = await fetchSessions();
      const liveAndPublished = (rawSessions || []).filter(
        (s) => s.status === "published" || s.status === "ongoing" || s.status === "running"
      );
      setDbSessions(liveAndPublished);

      const ongoing = liveAndPublished.find((s) => s.status === "ongoing" || s.status === "running");
      if (ongoing) {
        const fullDetail = await fetchSessionById(ongoing.id);
        const { stations: fetchedStations } = await getLiveStations();
        setActiveSession(fullDetail);
        setLiveStations(fetchedStations || fullDetail.stations || []);
        setIsTimerRunning(true);
      } else {
        setActiveSession(null);
        setLiveStations([]);
      }
    } catch (err) {
      console.error("Error loading live monitor data from Supabase:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLiveMonitorData();
    const channel = subscribeLive(loadLiveMonitorData);
    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Live Timer Countdown Effect
  useEffect(() => {
    if (!isTimerRunning || !activeSession) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === 120 && !isBreak) {
          playOsceBell("warning");
          addLog("warning", "BEL AUTOMATIC: Sisa Waktu Stase 2 Menit!");
        }

        if (prev <= 1) {
          if (!isBreak) {
            setIsBreak(true);
            playOsceBell("rotation");
            addLog(
              "warning",
              `BEL ROTASI: Stase Ronde ${currentRound} Selesai. Masuk ke Waktu Istirahat (Break).`
            );
            return 180; // 3 menit break
          } else {
            setIsBreak(false);
            const totalRounds = activeSession.total_rounds || activeSession.stations?.length || 8;
            const nextRound = currentRound < totalRounds ? currentRound + 1 : 1;
            setCurrentRound(nextRound);
            setViewRound(nextRound);
            playOsceBell("start");
            addLog(
              "info",
              `BEL MULAI: Rolling Otomatis! Masuk ke Ronde ${nextRound} dari ${totalRounds}.`
            );
            return (activeSession.station_duration_minutes || 12) * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isBreak, currentRound, activeSession]);

  function addLog(type, text) {
    const timeStr = new Date().toLocaleTimeString("id-ID");
    setLogs((prev) => [
      { id: `log-${Date.now()}`, time: timeStr, type, text },
      ...prev,
    ]);
  }

  // Handle Starting a Session in Supabase
  async function handleStartSession(sessionId) {
    try {
      await startLiveSession(sessionId, 12);
      addLog("success", "Admin memulai Sesi Ujian OSCE secara Live di Supabase!");
      await loadLiveMonitorData();
    } catch (err) {
      console.error("Failed to start live session:", err);
      alert("Gagal memulai sesi live: " + err.message);
    }
  }

  // Handle Finishing Active Session in Supabase
  async function handleFinishOSCE() {
    if (!activeSession) return;
    if (
      confirm(
        "Apakah Anda yakin ingin mengakhiri sesi OSCE ini? Seluruh pengerjaan stase akan ditutup di Supabase database."
      )
    ) {
      try {
        await updateSessionStatus(activeSession.id, "completed");
        addLog("success", "Sesi OSCE telah diselesaikan di Supabase.");
        await loadLiveMonitorData();
      } catch (err) {
        console.error("Failed to finish session:", err);
      }
    }
  }

  function handleTogglePause() {
    const nextState = !isTimerRunning;
    setIsTimerRunning(nextState);
    addLog(
      nextState ? "info" : "warning",
      nextState ? "Admin melanjutkan timer OSCE." : "Admin menghentikan sementara (Pause) timer OSCE."
    );
  }

  function handleTriggerBell(bellType) {
    playOsceBell(bellType);
    const bellNames = {
      start: "Bel 1x (Mulai / Reading Time)",
      warning: "Bel 2x (Peringatan 2 Menit Tersisa)",
      rotation: "Bel 3x (Selesai & Rotasi Stase)",
    };
    addLog("info", `Admin memicu suara manual: ${bellNames[bellType]}`);
    setIsBellMenuOpen(false);
  }

  async function handleSendBroadcast() {
    if (!broadcastMessage.trim()) return;

    const targetLabel =
      broadcastTarget === "all"
        ? "Semua Layar (Peserta & Penguji)"
        : broadcastTarget === "examiners"
        ? "Layar Dokter Penguji"
        : "Layar Peserta";

    try {
      await sendBroadcastMessage(
        activeSession?.id || "session-osce-001",
        broadcastMessage,
        "warning",
        broadcastTarget
      );
    } catch (err) {
      console.warn("Error sending broadcast to Supabase:", err);
    }

    addLog("warning", `BROADCAST ADMIN [${targetLabel}]: "${broadcastMessage}"`);
    setActiveNotification({
      id: Date.now(),
      message: broadcastMessage,
      target: targetLabel,
      time: new Date().toLocaleTimeString("id-ID"),
    });

    setIsBroadcastModalOpen(false);
    setBroadcastMessage("");
  }

  function formatMinutesSeconds(sec) {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[450px] items-center justify-center text-xs font-semibold text-slate-500">
          <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
          Memuat Data Live Monitor Supabase...
        </div>
      </AdminLayout>
    );
  }

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

      {/* STATE A: NO SESSION IS ONGOING -> SHOW LAUNCHER SELECTOR */}
      {!activeSession ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 p-8 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-extrabold text-amber-300">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    Sistem Standby • Tidak Ada Sesi Ongoing di Supabase
                  </span>
                </div>
                <h1 className="text-2xl font-black sm:text-3xl text-white">
                  Pilih & Jalankan Sesi Ujian OSCE Live
                </h1>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-medium">
                  Pilih salah satu sesi ujian sirkuit dari database Supabase di bawah ini untuk mengaktifkan master timer, bel audio, dan pemantauan rotasi pos secara real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                Daftar Sesi Ujian Siap Dijalankan ({dbSessions.length} Sesi Terdaftar)
              </h2>
              <button
                onClick={() => navigate("/admin/sessions/create")}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                + Buat Sesi Baru
              </button>
            </div>

            {dbSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada sesi di database Supabase.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {dbSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 shadow-2xs hover:border-blue-300 hover:bg-white transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black text-amber-900 uppercase">
                          {sess.status}
                        </span>
                        <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          {sess.session_date || "15 Agustus 2026"}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          {sess.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {sess.description || "Sesi sirkuit terpadu 6 stase aktif."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                        <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                          <span className="text-slate-400 text-[10px] block font-bold">Total Station Pos</span>
                          <span className="font-black text-slate-900">{sess.total_stations || 8} Pos</span>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                          <span className="text-slate-400 text-[10px] block font-bold">Durasi / Pos</span>
                          <span className="font-black text-slate-900">{sess.station_duration_minutes || 12} Mnt</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60">
                      <button
                        onClick={() => handleStartSession(sess.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
                      >
                        <Play size={16} />
                        Jalankan Sesi Live Ini
                      </button>
                      <button
                        onClick={() => navigate(`/admin/sessions/${sess.id}/edit`)}
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STATE B: SESSION IS ONGOING -> SHOW LIVE MONITOR CONTROL ROOM */
        <div className="space-y-6">
          {/* Top Control Room Header */}
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
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
                      REALTIME LIVE (SUPABASE ONGOING)
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300 font-medium">
                    {activeSession.title}
                  </p>
                </div>
              </div>

              {/* Master Control Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
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
                        Generator Bel Audio Manual
                      </div>
                      <button
                        onClick={() => handleTriggerBell("start")}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5"
                      >
                        <Bell size={14} className="text-indigo-400" />
                        Bel 1x (Mulai / Reading Time)
                      </button>
                      <button
                        onClick={() => handleTriggerBell("warning")}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5"
                      >
                        <AlertCircle size={14} className="text-amber-400" />
                        Bel 2x (Peringatan 2 Menit Tersisa)
                      </button>
                      <button
                        onClick={() => handleTriggerBell("rotation")}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5"
                      >
                        <AlertCircle size={14} className="text-rose-400" />
                        Bel 3x (Selesai & Rotasi Stase)
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-md"
                >
                  <Megaphone size={16} />
                  Broadcast Pesan
                </button>

                <button
                  onClick={handleTogglePause}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-md ${
                    isTimerRunning ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isTimerRunning ? "Pause Timer" : "Lanjutkan Timer"}
                </button>

                <button
                  onClick={handleFinishOSCE}
                  className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-md"
                >
                  <Square size={16} />
                  Akhiri OSCE
                </button>
              </div>
            </div>

            {/* Timer Stat Display Bar */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-6">
              <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Status Ronde Live
                </span>
                <span className="text-xl font-black text-white mt-1 block">
                  Ronde {currentRound} / {activeSession.total_rounds || 8}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Timer Stase Aktif
                </span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">
                  {formatMinutesSeconds(remainingSeconds)}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Fase Rotasi
                </span>
                <span className="text-xl font-black text-blue-400 mt-1 flex items-center gap-1.5">
                  {isBreak ? (
                    <>
                      <Coffee size={18} className="text-amber-400" />
                      Break Jeda
                    </>
                  ) : (
                    <>
                      <Activity size={18} className="text-emerald-400" />
                      Action Ujian
                    </>
                  )}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Station Pos
                </span>
                <span className="text-xl font-black text-purple-400 mt-1 block">
                  {activeSession.total_stations || 8} Pos
                </span>
              </div>
            </div>
          </div>

          {/* Station Pos Live Cards Grid */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Grid size={18} className="text-blue-600" />
                Matriks Live Station Pos ({liveStations.length} Pos)
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {liveStations.map((stg) => (
                <div
                  key={stg.id}
                  className={`rounded-2xl border p-4 space-y-3 shadow-2xs transition ${
                    stg.is_break
                      ? "border-amber-300 bg-amber-50/70"
                      : "border-slate-200 bg-slate-50/70 hover:border-blue-400 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        stg.is_break
                          ? "bg-amber-200 text-amber-950"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {stg.title || `Stase ${stg.station_number}`}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-400">
                      Pos #{stg.station_number}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                      {stg.case_title || "Kasus Medis Terstandar"}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Penguji: <span className="font-bold text-slate-700">{stg.examiner?.full_name || "dr. Spesialis"}</span>
                    </p>
                  </div>

                  {!stg.is_break && (
                    <button
                      onClick={() => navigate(`/admin/live/station/${stg.id}`)}
                      className="w-full flex items-center justify-center gap-1 rounded-xl bg-blue-50 border border-blue-200 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                    >
                      Inspect Stase
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal Overlay */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Megaphone size={18} className="text-purple-600" />
                Kirim Broadcast Pengumuman Realtime
              </h2>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Penerima Pesan
                </label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">Semua Layar (Peserta & Penguji)</option>
                  <option value="examiners">Layar Dokter Penguji Saja</option>
                  <option value="participants">Layar Kiosk Peserta Saja</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Isi Pesan Broadcast
                </label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Ketikkan pengumuman darurat atau peringatan waktu..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none font-medium"
                />
              </div>

              {/* Template Cepat */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  Template Pesan Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Waktu pengerjaan stase tersisa 2 menit!",
                    "Waktu habis! Harap seluruh peserta segera berpindah pos.",
                    "Sesi istirahat dimulai. Silakan beristirahat sejenak.",
                    "Dokter Penguji dimohon merekapitulasi nilai rubrik.",
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBroadcastMessage(tpl)}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition text-left"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 active:scale-95 transition"
              >
                <Send size={14} />
                Kirimkan Realtime
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}