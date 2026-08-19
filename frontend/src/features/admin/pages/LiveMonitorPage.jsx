import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import {
  Activity,
  Clock,
  User,
  UserCheck,
  Users,
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
  BellRing,
  AlertTriangle,
  Megaphone,
  Volume2,
  Calendar,
  Layers,
  Building2,
  Loader2,
  XCircle,
  LogOut,
} from "lucide-react";
import {
  subscribeToSession,
  joinPresence,
  openWaitingRoom,
  startOsceSession,
  updateTimerPhase,
  pauseTimer,
  resumeTimer,
  sendBroadcast,
  sendBellBroadcast,
  finishSession,
  calcRemaining,
  playBroadcastNotificationSound,
} from "@/services/realtimeTimerService";
import {
  getLiveStations,
  getSessionTimerState,
} from "@/services/live.service";
import { fetchSessions, fetchSessionById, updateSessionStatus } from "@/services/sessionService";
import ConfirmModal from "@/components/ConfirmModal";
import SessionRotationScheduleView from "@/features/admin/components/SessionRotationScheduleView";

// Web Audio API Bell Synthesizer (No external file dependencies needed)
function playOsceBell(type = "warning") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "start") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } else if (type === "warning") {
      [0, 0.25].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(660, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.18);
      });
    } else if (type === "rotation") {
      [0, 0.3, 0.6].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(idx === 2 ? 987.77 : 523.25, ctx.currentTime + delay);
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
  const [activeTab, setActiveTab] = useState("grid");
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(720);
  const [timerState, setTimerState] = useState(null);
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

  // Auto-dismiss Admin Broadcast Toast (5 Seconds)
  useEffect(() => {
    if (!activeNotification) return;
    const timer = setTimeout(() => {
      setActiveNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeNotification]);

  // Bell Menu State
  const [isBellMenuOpen, setIsBellMenuOpen] = useState(false);

  // Live Presence State for Online Users
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Confirm / Alert Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Ya, Lanjutkan",
    cancelText: "Batal",
    variant: "primary",
    isAlert: false,
    onConfirm: null,
  });

  // Total Overall Session Timer Calculations (Synchronized with Sub-Timer and Phase)
  const totalRoundsCount = activeSession?.total_rounds || activeSession?.total_stations || activeSession?.stations?.length || 6;
  const stationDurationSec = (activeSession?.station_duration_minutes || 12) * 60;
  const transitionDurationSec = (activeSession?.transition_duration_minutes || 2) * 60;
  const breakDurationSec = (activeSession?.break_duration_minutes || 0) * 60;
  const roundFullSec = stationDurationSec + transitionDurationSec;

  const totalSessionDurationSec = (totalRoundsCount * roundFullSec) - transitionDurationSec + breakDurationSec;
  const totalSessionMinutes = Math.ceil(totalSessionDurationSec / 60);

  // Synchronized Total Remaining Overall Seconds
  let currentRoundRemainingSec = remainingSeconds;
  const currentPhase = timerState?.phase || "action";
  if (currentPhase === "action" || currentPhase === "running" || currentPhase === "reading") {
    currentRoundRemainingSec = remainingSeconds + transitionDurationSec;
  }
  const futureRoundsCount = Math.max(0, totalRoundsCount - (currentRound || 1));
  const futureRoundsSec = futureRoundsCount * roundFullSec;

  const totalRemainingSec = Math.max(0, currentRoundRemainingSec + futureRoundsSec);
  const totalElapsedSec = Math.max(0, totalSessionDurationSec - totalRemainingSec);

  function formatHoursMinutesSeconds(sec) {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Header Top Bar Component replacing the Bell Icon with Total Global Timer
  const totalTimerHeaderAction = activeSession && ["published", "scheduled", "waiting_room", "ongoing", "running", "paused"].includes(activeSession.status) ? (
    <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/90 px-4 py-2 text-indigo-950 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
        <Clock size={18} className={isTimerRunning ? "animate-pulse text-white" : "text-amber-300"} />
      </div>
      <div className="text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
            Total Timer Global Sesi
          </span>
          {!isTimerRunning && (
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-white uppercase">
              PAUSED
            </span>
          )}
        </div>
        <span className="text-sm font-black font-mono text-indigo-950 block leading-tight">
          {formatHoursMinutesSeconds(totalRemainingSec)} <span className="text-xs text-indigo-600 font-bold">({totalSessionMinutes} Mnt)</span>
        </span>
      </div>
    </div>
  ) : null;

  // Helper check if session status is connectable to realtime WebSocket
  const isConnectableStatus = (status) =>
    ["published", "scheduled", "waiting_room", "ongoing", "running", "paused"].includes(status);

  // Real-time Presence Tracking for Admin
  useEffect(() => {
    if (!activeSession?.id || !isConnectableStatus(activeSession?.status)) {
      setOnlineUsers([]);
      return;
    }

    let cleanupPresence = null;
    async function initPresence() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const userState = {
          user_id: user?.id || user?.email || `admin-${Date.now()}`,
          full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Admin",
          role: "admin",
          email: user?.email,
        };

        cleanupPresence = joinPresence(activeSession.id, userState, (users) => {
          setOnlineUsers(users || []);
        });
      } catch (err) {
        console.error("Presence tracking error:", err);
      }
    }

    initPresence();

    return () => {
      if (cleanupPresence) cleanupPresence();
    };
  }, [activeSession?.id, activeSession?.status]);

  // Load Real Supabase Data
  async function loadLiveMonitorData() {
    try {
      setLoading(true);
      const rawSessions = await fetchSessions();
      const relevantStatuses = ["published", "scheduled", "waiting_room", "ongoing", "running", "paused"];
      const liveAndPublished = (rawSessions || []).filter((s) => relevantStatuses.includes(s.status));
      setDbSessions(liveAndPublished);

      // Find active session ONLY from allowed active statuses (Do NOT select completed/draft fallback)
      const active = (rawSessions || []).find(
        (s) => s.status === "ongoing" || s.status === "running" || s.status === "paused"
      ) || (rawSessions || []).find((s) => s.status === "waiting_room") || (rawSessions || []).find((s) => s.status === "published" || s.status === "scheduled");

      if (active) {
        const fullDetail = await fetchSessionById(active.id);
        setActiveSession(fullDetail);

        const { stations: fetchedStations } = await getLiveStations(active.id);
        setLiveStations(fetchedStations && fetchedStations.length > 0 ? fetchedStations : fullDetail.stations || []);

        const stateData = await getSessionTimerState(active.id);
        if (stateData) {
          setTimerState(stateData);
          setCurrentRound(stateData.round_number || 1);
          setViewRound(stateData.round_number || 1);
          setIsBreak(stateData.phase === "break");
          setIsTimerRunning(stateData.phase !== "paused" && active.status !== "paused");
          const rem = calcRemaining(stateData.target_end_time, stateData.paused_remaining_ms, stateData.phase === "paused");
          setRemainingSeconds(rem);
        } else {
          setIsTimerRunning(false);
          setRemainingSeconds(0);
        }
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
  }, []);

  // Realtime Subscription for Active Session (DB changes)
  useEffect(() => {
    if (!activeSession?.id || !isConnectableStatus(activeSession?.status)) return;

    const unsubscribe = subscribeToSession(activeSession.id, {
      onTimerUpdate: (newTimerState) => {
        if (!newTimerState) return;
        setTimerState(newTimerState);
        setCurrentRound(newTimerState.round_number || 1);
        setViewRound(newTimerState.round_number || 1);
        setIsBreak(newTimerState.phase === "break");
        const isPaused = newTimerState.phase === "paused";
        setIsTimerRunning(!isPaused);
        const rem = calcRemaining(
          newTimerState.target_end_time,
          newTimerState.paused_remaining_ms,
          isPaused
        );
        setRemainingSeconds(rem);
      },
      onSessionUpdate: (sess) => {
        if (!sess) return;
        if (sess.status === "completed" || sess.status === "finished") {
          setActiveSession(null);
          setTimerState(null);
          setOnlineUsers([]);
          loadLiveMonitorData();
          return;
        }
        setActiveSession((prev) => (prev ? { ...prev, ...sess } : sess));
        if (sess.status === "paused") setIsTimerRunning(false);
        if (sess.status === "ongoing" || sess.status === "running") {
          setIsTimerRunning(true);
          loadLiveMonitorData();
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [activeSession?.id, activeSession?.status]);

  // Live Timer Local 1-second Tick & Multi-Phase Auto-Rolling
  useEffect(() => {
    if (!activeSession || activeSession.status === "waiting_room") return;

    const interval = setInterval(() => {
      if (timerState && timerState.phase === "paused") {
        const rem = calcRemaining(null, timerState.paused_remaining_ms, true);
        setRemainingSeconds(rem);
        return;
      }

      if (timerState?.target_end_time) {
        const rem = calcRemaining(timerState.target_end_time, null, false);
        setRemainingSeconds(rem);

        if (rem === 120 && timerState.phase === "action") {
          playOsceBell("warning");
          addLog("warning", "BEL AUTOMATIC: Sisa Waktu Stase 2 Menit!");
        }

        if (rem <= 0 && isTimerRunning) {
          const currentPhase = timerState.phase || "action";
          const stationDuration = activeSession.station_duration_minutes || 12;
          const transitionDuration = activeSession.transition_duration_minutes || 2;
          const totalRounds = activeSession.total_rounds || activeSession.stations?.length || 6;

          if (currentPhase === "action") {
            if (transitionDuration > 0) {
              playOsceBell("rotation");
              addLog(
                "warning",
                `BEL ROTASI: Stase Ronde ${currentRound} Selesai. Masuk ke Waktu Transisi Perpindahan Pos (${transitionDuration} Mnt).`
              );
              updateTimerPhase(activeSession.id, "transition", transitionDuration, { roundNumber: currentRound }).catch(console.error);
            } else {
              advanceRound();
            }
          } else {
            advanceRound();
          }

          function advanceRound() {
            const nextRound = currentRound < totalRounds ? currentRound + 1 : 1;
            setCurrentRound(nextRound);
            setViewRound(nextRound);
            playOsceBell("start");
            addLog(
              "info",
              `BEL MULAI: Rolling Otomatis! Masuk ke Stase Ujian Ronde ${nextRound} dari ${totalRounds} (${stationDuration} Mnt).`
            );
            updateTimerPhase(activeSession.id, "action", stationDuration, { roundNumber: nextRound }).catch(console.error);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, currentRound, activeSession, timerState]);

  async function handleSkipPhase() {
    if (!activeSession || !timerState) return;
    const currentPhase = timerState.phase || "action";
    const stationDuration = activeSession.station_duration_minutes || 12;
    const transitionDuration = activeSession.transition_duration_minutes || 2;
    const totalRounds = activeSession.total_rounds || activeSession.stations?.length || 6;

    try {
      if (currentPhase === "action" && transitionDuration > 0) {
        playOsceBell("rotation");
        addLog("warning", "Admin melakukan MANUAL SKIP ke Waktu Transisi Perpindahan Pos.");
        await updateTimerPhase(activeSession.id, "transition", transitionDuration, { roundNumber: currentRound });
      } else {
        const nextRound = currentRound < totalRounds ? currentRound + 1 : 1;
        setCurrentRound(nextRound);
        setViewRound(nextRound);
        playOsceBell("start");
        addLog("info", `Admin melakukan MANUAL SKIP ke Stase Ujian Ronde ${nextRound}.`);
        await updateTimerPhase(activeSession.id, "action", stationDuration, { roundNumber: nextRound });
      }
      await loadLiveMonitorData();
    } catch (err) {
      console.error("Error skipping phase:", err);
    }
  }

  function addLog(type, text) {
    const timeStr = new Date().toLocaleTimeString("id-ID");
    setLogs((prev) => [
      { id: `log-${Date.now()}`, time: timeStr, type, text },
      ...prev,
    ]);
  }

  // Handle Opening Waiting Room (Phase 1 — like Zoom)
  async function handleOpenWaitingRoom(sessionId) {
    try {
      await openWaitingRoom(sessionId);
      addLog("success", "Admin membuka Waiting Room. Peserta & Penguji dapat bergabung.");
      await loadLiveMonitorData();
    } catch (err) {
      console.error("Failed to open waiting room:", err);
      setConfirmModal({
        isOpen: true,
        title: "Gagal Membuka Waiting Room",
        message: err.message,
        confirmText: "Mengerti",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  }

  // Handle Closing / Leaving Waiting Room (Admin cancels/resets waiting room to published)
  async function handleCloseWaitingRoom() {
    if (!activeSession) return;
    setConfirmModal({
      isOpen: true,
      title: "Tutup / Keluar dari Waiting Room?",
      message: `Apakah Anda yakin ingin menutup Waiting Room untuk sesi "${activeSession.title}" dan mengembalikan status sesi ke Published? Peserta & penguji yang terhubung di waiting room akan diputuskan.`,
      confirmText: "Ya, Tutup Waiting Room",
      cancelText: "Batal",
      variant: "danger",
      isAlert: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await updateSessionStatus(activeSession.id, "published");
          addLog("warning", "Admin menutup Waiting Room. Status sesi dikembalikan ke Published.");
          await loadLiveMonitorData();
        } catch (err) {
          console.error("Gagal menutup waiting room:", err);
          setConfirmModal({
            isOpen: true,
            title: "Gagal Menutup Waiting Room",
            message: err.message || "Terjadi kesalahan saat memperbarui status sesi.",
            confirmText: "Mengerti",
            variant: "warning",
            isAlert: true,
            onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
  }

  // Handle Starting OSCE Session (Phase 2 — Timer begins)
  async function handleStartOsce() {
    if (!activeSession) return;
    try {
      const duration = activeSession.station_duration_minutes || 12;
      const res = await startOsceSession(activeSession.id, duration);
      addLog("success", "Admin memulai Sesi Ujian OSCE! Timer global berjalan.");
      if (res?.timer) {
        setTimerState(res.timer);
        const rem = calcRemaining(res.timer.target_end_time, null, false);
        setRemainingSeconds(rem);
      }
      setIsTimerRunning(true);
      await loadLiveMonitorData();
    } catch (err) {
      console.error("Failed to start OSCE session:", err);
      setConfirmModal({
        isOpen: true,
        title: "Gagal Memulai Sesi OSCE",
        message: err.message,
        confirmText: "Mengerti",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  }

  // Handle Finishing Active Session in Supabase & Disconnecting Realtime Channels
  async function handleFinishOSCE() {
    if (!activeSession) return;
    setConfirmModal({
      isOpen: true,
      title: "Akhiri Sesi OSCE?",
      message: "Apakah Anda yakin ingin mengakhiri sesi OSCE ini? Seluruh pengerjaan stase akan ditutup di database dan koneksi realtime akan diputuskan.",
      confirmText: "Ya, Selesaikan Sesi",
      cancelText: "Batal",
      variant: "danger",
      isAlert: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await finishSession(activeSession.id);
          addLog("success", "Sesi OSCE telah diselesaikan di Supabase dan koneksi realtime diputuskan.");
          setActiveSession(null);
          setTimerState(null);
          setOnlineUsers([]);
          await loadLiveMonitorData();
        } catch (err) {
          console.error("Failed to finish session:", err);
        }
      },
    });
  }

  async function handleTogglePause() {
    if (!activeSession) return;
    try {
      if (isTimerRunning) {
        const res = await pauseTimer(activeSession.id, remainingSeconds);
        if (res) setTimerState(res);
        setIsTimerRunning(false);
        addLog("warning", "Admin menghentikan sementara (Pause) timer global OSCE.");
      } else {
        const res = await resumeTimer(activeSession.id, remainingSeconds);
        if (res) {
          setTimerState(res);
          const rem = calcRemaining(res.target_end_time, null, false);
          setRemainingSeconds(rem);
        }
        setIsTimerRunning(true);
        addLog("info", "Admin melanjutkan timer global OSCE.");
      }
    } catch (err) {
      console.error("Error toggling pause timer:", err);
    }
  }

  async function handleSkipPhase() {
    if (!activeSession) return;
    const totalRounds = activeSession.total_rounds || activeSession.stations?.length || 6;

    const currentPhase = timerState?.phase || "running";
    const currentRoundNum = timerState?.round_number || currentRound || 1;

    try {
      if (currentRoundNum >= totalRounds && (currentPhase === "transition" || currentPhase === "break")) {
        await handleFinishOSCE();
        return;
      }

      if (currentPhase === "running" || currentPhase === "action") {
        const transitionDur = activeSession.transition_duration_minutes || 2;
        const res = await updateTimerPhase(activeSession.id, "transition", transitionDur, {
          roundNumber: currentRoundNum,
        });
        if (res) setTimerState(res);
        addLog("warning", `Admin melompati (skip) stase ke Fase Transisi 2 Menit (Ronde ${currentRoundNum}).`);
      } else if (currentPhase === "transition" || currentPhase === "break") {
        if (currentRoundNum >= totalRounds) {
          await handleFinishOSCE();
        } else {
          const nextR = currentRoundNum + 1;
          const stationDur = activeSession.station_duration_minutes || 15;
          const res = await updateTimerPhase(activeSession.id, "running", stationDur, {
            roundNumber: nextR,
          });
          if (res) setTimerState(res);
          setCurrentRound(nextR);
          addLog("success", `Admin melompati ke Stase Ujian Ronde ${nextR} / ${totalRounds}.`);
        }
      } else {
        if (currentRoundNum < totalRounds) {
          const nextR = currentRoundNum + 1;
          const stationDur = activeSession.station_duration_minutes || 15;
          const res = await updateTimerPhase(activeSession.id, "running", stationDur, {
            roundNumber: nextR,
          });
          if (res) setTimerState(res);
          setCurrentRound(nextR);
        } else {
          await handleFinishOSCE();
        }
      }
    } catch (err) {
      console.error("Error skipping phase:", err);
    }
  }

  async function handleTriggerBell(bellType) {
    playOsceBell(bellType);
    const bellNames = {
      start: "Bel 1x (Mulai / Reading Time)",
      warning: "Bel 2x (Peringatan 2 Menit Tersisa)",
      rotation: "Bel 3x (Selesai & Rotasi Stase)",
    };

    if (activeSession?.id) {
      try {
        await sendBellBroadcast(activeSession.id, bellType);
      } catch (err) {
        console.warn("Error broadcasting manual bell:", err);
      }
    }

    addLog("info", `Admin memicu suara & broadcast manual: ${bellNames[bellType]}`);
    playBroadcastNotificationSound();
    setActiveNotification({
      id: Date.now(),
      message: `[BEL MANUAL] ${bellNames[bellType]}`,
      target: "Semua Layar (Peserta & Penguji)",
      time: new Date().toLocaleTimeString("id-ID"),
    });

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
      await sendBroadcast(
        activeSession?.id,
        broadcastMessage,
        "warning",
        broadcastTarget
      );
    } catch (err) {
      console.warn("Error sending broadcast to Supabase:", err);
    }

    addLog("warning", `BROADCAST ADMIN [${targetLabel}]: "${broadcastMessage}"`);
    playBroadcastNotificationSound();
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
    <AdminLayout headerAction={totalTimerHeaderAction}>
      {/* Realtime Broadcast Toast Overlay Component for Admin (Auto 5s & X Close Button) */}
      {activeNotification && (
        <div className="fixed top-5 right-5 z-[9999] max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex items-start justify-between gap-3 rounded-2xl border-2 border-indigo-500 bg-slate-900 p-4 text-white shadow-2xl backdrop-blur-md">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                <Megaphone size={20} className="animate-bounce text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-indigo-300">
                  <BellRing size={12} className="text-amber-400" />
                  <span>Broadcast Admin Terkirim</span>
                  <span>•</span>
                  <span>{activeNotification.time}</span>
                </div>
                <p className="font-bold text-xs text-slate-100 mt-1 leading-snug break-words">
                  "{activeNotification.message}"
                </p>
                <span className="text-[10px] text-slate-400 font-bold block mt-1">
                  Target: {activeNotification.target}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveNotification(null)}
              title="Tutup Pesan (Close)"
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
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
                    Standby
                  </span>
                </div>
                <h1 className="text-2xl font-black sm:text-3xl text-white">
                  Pilih Sesi Ujian
                </h1>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-medium">
                  Pilih sesi ujian di bawah untuk mengaktifkan timer dan pemantauan rotasi real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                Daftar Sesi Ujian
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
                Belum ada sesi ujian terdaftar.
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
                          <span className="text-slate-400 text-[10px] block font-bold">Total Stase</span>
                          <span className="font-black text-slate-900">{sess.total_stations || 8} Pos</span>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                          <span className="text-slate-400 text-[10px] block font-bold">Durasi Stase</span>
                          <span className="font-black text-slate-900">{sess.station_duration_minutes || 12} Mnt</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60">
                      <button
                        onClick={() => handleOpenWaitingRoom(sess.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
                      >
                        <Play size={16} />
                        Buka Waiting Room
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
      ) : activeSession.status === "waiting_room" ? (
        /* STATE B: WAITING ROOM OPEN → Participants joining, timer NOT started yet */
        <div className="space-y-6">
          {/* Waiting Room Header */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-black text-blue-300">
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    Waiting Room
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Realtime
                  </span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {activeSession.title}
                </h1>
                <p className="text-xs text-blue-200/90 font-medium leading-relaxed">
                  Waiting Room aktif. Peserta dan Dokter Penguji dapat bergabung. Tekan tombol di bawah untuk memulai sesi.
                </p>
              </div>
            </div>

            {/* Quick Session Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Lokasi & Gedung</span>
                <span className="font-extrabold text-white text-xs mt-0.5 block truncate">
                  {activeSession.location_building || "Gedung Skill Lab"}
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Durasi / Stase</span>
                <span className="font-extrabold text-white text-xs mt-0.5 block">
                  {activeSession.station_duration_minutes || 12} Menit / Rotasi
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Total Station</span>
                <span className="font-extrabold text-white text-xs mt-0.5 block">
                  {activeSession.total_stations || 6} Pos Stase
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">User Online</span>
                <span className="font-extrabold text-emerald-400 text-xs mt-0.5 block">
                  {onlineUsers.length} Terhubung
                </span>
              </div>
            </div>
          </div>

          {/* Online Users Presence Grid */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Pengguna Terhubung di Waiting Room ({onlineUsers.length} Online)
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                {onlineUsers.length} User Aktif Online
              </span>
            </div>

            {onlineUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center space-y-2">
                <p className="text-xs text-slate-500 font-bold">Belum ada peserta atau penguji yang terhubung ke Waiting Room ini.</p>
                <p className="text-[10px] text-slate-400">
                  Peserta: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">http://localhost:5173/participant/session/{activeSession.id}</code>
                </p>
                <p className="text-[10px] text-slate-400">
                  Penguji: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">http://localhost:5173/examiner/stage/{activeSession.id}</code>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {onlineUsers.map((u, i) => (
                  <div key={u.user_id || i} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-black text-sm">
                        {(u.full_name || "?")[0].toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{u.full_name || u.email}</p>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        u.role === "admin"
                          ? "bg-red-100 text-red-700"
                          : u.role === "examiner"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {u.role === "admin" ? "Admin" : u.role === "examiner" ? "Penguji" : "Peserta"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start / Exit Waiting Room Action Bar */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-emerald-900">Siap Memulai Ujian OSCE?</h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Tekan tombol di bawah untuk memulai timer global dan mengalihkan semua peserta & penguji ke layar ujian live, atau tutup waiting room.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCloseWaitingRoom}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white hover:bg-rose-100 px-5 py-3 text-xs font-bold text-rose-700 shadow-2xs active:scale-95 transition"
                >
                  <XCircle size={18} className="text-rose-600" />
                  Keluar Waiting Room
                </button>
                <button
                  onClick={handleStartOsce}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition"
                >
                  <Play size={20} />
                  Mulai Sesi
                </button>
              </div>
            </div>
          </div>

          {/* Matriks Live Station Pos Cards Grid (Always Visible) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Grid size={18} className="text-blue-600" />
                Matriks Stase ({liveStations.length} Pos)
              </h2>
              <span className="text-xs text-slate-500 font-medium">Klik "Inspect Stase" untuk memantau detail stase</span>
            </div>

            {liveStations.length > 0 ? (
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
                        Penguji: <span className="font-bold text-slate-700">{stg.examiner?.full_name || "Belum ditugaskan"}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Peserta Awal: <span className="font-bold text-slate-700">{stg.participant?.full_name || "Peserta Ujian"}</span>
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
            ) : (
              <p className="text-xs text-slate-500 font-medium italic text-center py-4">
                Tidak ada data stase pos untuk sesi ini.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* STATE C: SESSION IS ONGOING → SHOW LIVE MONITOR CONTROL ROOM */
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
                      Realtime
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300 font-medium">
                    {activeSession.title}
                  </p>
                </div>
              </div>

              {/* Master Control Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Total Session Overall Timer Badge */}
                <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-900/90 px-3.5 py-2 text-white shadow-sm">
                  <Clock size={16} className={isTimerRunning ? "text-cyan-400 animate-pulse" : "text-amber-400"} />
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-cyan-300 block leading-tight">
                        Total Timer
                      </span>
                      {!isTimerRunning && (
                        <span className="text-[8px] font-black uppercase text-amber-400 bg-amber-400/20 px-1 rounded">
                          PAUSED
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-black font-mono text-white">
                      {formatHoursMinutesSeconds(totalRemainingSec)} ({totalSessionMinutes} Mnt)
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsBellMenuOpen(!isBellMenuOpen)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm"
                  >
                    <BellRing size={16} className="text-amber-400" />
                    Bel Manual
                  </button>

                  {isBellMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in">
                      <div className="px-3 py-2 text-[10px] font-black uppercase text-slate-400 border-b border-slate-800">
                        Pilihan Bel Audio
                      </div>
                      <button
                        onClick={() => handleTriggerBell("start")}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl transition flex items-center justify-between"
                      >
                        <span>Bel 1x (Mulai)</span>
                        <Play size={12} className="text-emerald-400" />
                      </button>
                      <button
                        onClick={() => handleTriggerBell("warning")}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl transition flex items-center justify-between"
                      >
                        <span>Bel 2x (Sisa 2 Mnt)</span>
                        <AlertTriangle size={12} className="text-amber-400" />
                      </button>
                      <button
                        onClick={() => handleTriggerBell("rotation")}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl transition flex items-center justify-between"
                      >
                        <span>Bel 3x (Rotasi)</span>
                        <BellRing size={12} className="text-red-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Pause / Play Global Timer Button */}
                <button
                  onClick={handleTogglePause}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition ${
                    isTimerRunning
                      ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 animate-pulse"
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause size={16} />
                      Jeda
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      {timerState?.paused_remaining_ms ? "Lanjutkan" : "Mulai"}
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition"
                >
                  <Megaphone size={16} />
                  Broadcast
                </button>

                <button
                  onClick={handleFinishOSCE}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-600/20 px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-600 hover:text-white transition"
                >
                  <Square size={15} />
                  Akhiri Sesi
                </button>
              </div>
            </div>

            {/* Live Online Users Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Users size={16} className="text-emerald-400" />
                <span>Pengguna & Peserta Terhubung Live Online ({onlineUsers.length} User):</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 max-w-2xl">
                {onlineUsers.map((u, idx) => (
                  <span
                    key={u.user_id || idx}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/90 px-3 py-1 text-[11px] font-bold text-slate-200"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="truncate max-w-[120px]">{u.full_name}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-black">
                      ({u.role === "examiner" ? "Penguji" : u.role === "admin" ? "Admin" : "Peserta"})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

            {/* Timer Stat Display Bar */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-6">
              <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Status Ronde Live
                </span>
                <span className="text-xl font-black text-white mt-1 block">
                  Ronde {currentRound} / {totalRoundsCount}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  Sirkuit Pos Terjadwal
                </span>
              </div>

              <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Sub-Timer Fase Aktif
                  </span>
                  {!isTimerRunning && (
                    <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                      PAUSED
                    </span>
                  )}
                </div>
                <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                  {formatMinutesSeconds(remainingSeconds)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  Countdown Tersinkronisasi
                </span>
              </div>

              <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Fase Rotasi Saat Ini
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  {timerState?.phase === "transition" ? (
                    <span className="inline-flex items-center gap-1.5 text-base font-black text-amber-400">
                      <ChevronRight size={18} className="animate-ping text-amber-400" />
                      Transisi Pos ({activeSession.transition_duration_minutes || 2}m)
                    </span>
                  ) : timerState?.phase === "break" ? (
                    <span className="inline-flex items-center gap-1.5 text-base font-black text-blue-400">
                      <Coffee size={18} className="text-blue-400" />
                      Istirahat ({activeSession.break_duration_minutes || 5}m)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-base font-black text-emerald-400">
                      <Activity size={18} className="text-emerald-400 animate-pulse" />
                      Stase Ujian ({activeSession.station_duration_minutes || 12}m)
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  {timerState?.phase === "transition"
                    ? "Peserta Pindah Pos Ruangan"
                    : timerState?.phase === "break"
                    ? "Jeda Fisik Ronde"
                    : "Peserta Mengerjakan Soal"}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Fase Selanjutnya
                  </span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">
                    {currentRound >= totalRoundsCount && (timerState?.phase === "transition" || timerState?.phase === "break")
                      ? "Akhiri Sesi OSCE (Seluruh Ronde Selesai)"
                      : timerState?.phase === "running" || timerState?.phase === "action"
                      ? `Transisi Pos (${activeSession.transition_duration_minutes || 2} Menit)`
                      : `Stase Ujian Ronde ${currentRound + 1}`}
                  </span>
                </div>
                {currentRound >= totalRoundsCount && (timerState?.phase === "transition" || timerState?.phase === "break" || timerState?.phase === "action" || timerState?.phase === "running") ? (
                  <button
                    onClick={handleFinishOSCE}
                    className="mt-2 text-left text-[11px] font-extrabold underline flex items-center gap-1 text-red-400 hover:text-red-300 transition cursor-pointer"
                  >
                    <Square size={14} />
                    Akhiri Sesi OSCE (Selesai {currentRound}/{totalRoundsCount})
                  </button>
                ) : (
                  <button
                    onClick={handleSkipPhase}
                    className="mt-2 text-left text-[11px] font-extrabold underline flex items-center gap-1 text-blue-400 hover:text-blue-300 transition cursor-pointer"
                  >
                    <ChevronRight size={14} />
                    Skip Manual ke Fase Berikutnya
                  </button>
                )}
              </div>
            </div>

          {/* Section 1: Realtime Online Users Presence Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Users size={20} className="text-emerald-600" />
                  Presensi Live Online Pengguna Terhubung ({onlineUsers.length} User)
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Pantau dokter penguji dan peserta yang sedang terhubung ke channel Supabase WebSocket Realtime untuk ID Sesi: <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{activeSession.id}</code>
                </p>
              </div>

              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-black text-emerald-900 inline-flex items-center gap-1.5 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {onlineUsers.length} User Aktif Online
              </span>
            </div>

            {onlineUsers.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {onlineUsers.map((u, idx) => (
                  <div
                    key={u.user_id || idx}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5 hover:bg-white transition shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm border border-indigo-200">
                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{u.full_name}</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {u.role === "examiner"
                            ? `Dokter Penguji ${u.specialty ? `• ${u.specialty}` : ""}`
                            : u.role === "admin"
                            ? "Admin Control Room"
                            : `Peserta ${u.nim ? `(NIM: ${u.nim})` : ""}`}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase shrink-0 ${
                        u.role === "examiner"
                          ? "bg-purple-100 text-purple-900 border border-purple-300"
                          : u.role === "admin"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      }`}
                    >
                      {u.role === "examiner" ? "Penguji" : u.role === "admin" ? "Admin" : "Peserta"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500 font-medium space-y-2">
                <p>Belum ada peserta atau penguji lain yang terhubung ke ID Sesi ini.</p>
                <p className="text-[11px] text-slate-400">
                  Untuk menguji realtime, buka tab browser baru dengan URL Peserta: <code className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">http://localhost:5173/participant/session/{activeSession.id}</code>
                </p>
              </div>
            )}
          </div>

          {/* Matriks Live Station Pos Grid */}
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
                      Penguji: <span className="font-bold text-slate-700">{stg.examiner?.full_name || "Tidak ada data"}</span>
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

          {/* Matriks Live Rotasi Stase & Peserta-Dokter Schedule */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <SessionRotationScheduleView sessionId={activeSession.id} activeRound={currentRound} />
          </div>
        </div>
      )}

      {/* Broadcast Modal Overlay (Unified Single Broadcast Form) */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Megaphone size={20} className="text-indigo-600" />
                  Kirim Broadcast Peringatan Realtime (Supabase WebSocket)
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Pesan instan akan muncul sebagai banner melayang di layar Peserta & Penguji.
                </p>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Preset 1-Click Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Tombol Pengumuman Cepat (Preset 1-Klik):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastMessage("Sisa waktu stase 2 menit lagi! Persiapkan penyelesaian dan instruksi penunjang.");
                    setBroadcastTarget("all");
                  }}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition flex items-center gap-1.5"
                >
                  <BellRing size={13} className="text-amber-600" />
                  Peringatan Sisa 2 Menit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBroadcastMessage("Waktu stase ronde selesai! Dokter penguji dan peserta dipersilakan melakukan rotasi pos.");
                    setBroadcastTarget("all");
                  }}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-100 transition flex items-center gap-1.5"
                >
                  <RotateCw size={13} className="text-blue-600" />
                  Instruksi Rotasi Pos
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBroadcastMessage("Pengumuman: Waktu istirahat ronde sedang berlangsung (Break Sesi).");
                    setBroadcastTarget("all");
                  }}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition flex items-center gap-1.5"
                >
                  <Coffee size={13} className="text-emerald-600" />
                  Pengumuman Break Sesi
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Target Layar Penerima Pesan
                </label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="all">Semua Layar (Peserta & Dokter Penguji)</option>
                  <option value="examiners">Layar Dokter Penguji Saja</option>
                  <option value="participants">Layar Kiosk Peserta Saja</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Isi Pesan Broadcast Peringatan
                </label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Ketikkan pengumuman darurat atau peringatan waktu..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-medium"
                />
              </div>

              {/* Template Cepat */}
              <div>
                <span className="block text-[11px] font-extrabold text-slate-400 mb-1.5">
                  Template Pesan Tambahan:
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={!broadcastMessage.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
              >
                <Send size={14} />
                Kirim Broadcast Realtime Now
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        isAlert={confirmModal.isAlert}
      />
    </AdminLayout>
  );
}