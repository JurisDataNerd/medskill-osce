import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import {
  Activity,
  ArrowLeft,
  Clock,
  Users,
  Play,
  Pause,
  RotateCw,
  Square,
  Send,
  Grid,
  CheckCircle2,
  Coffee,
  ChevronRight,
  X,
  BellRing,
  AlertTriangle,
  Megaphone,
  Calendar,
  Building2,
  Loader2,
  XCircle,
} from "lucide-react";
import {
  subscribeToSession,
  joinPresence,
  openWaitingRoom,
  startOsceSession,
  updateTimerPhase,
  setSessionCompletedWaiting,
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
import { toast } from "sonner";
import SessionRotationScheduleView from "@/features/admin/components/SessionRotationScheduleView";
import LiveSessionPicker from "@/features/admin/components/live/LiveSessionPicker";
import LiveWaitingRoomCard from "@/features/admin/components/live/LiveWaitingRoomCard";
import LiveTimerControlHeader from "@/features/admin/components/live/LiveTimerControlHeader";
import LiveOnlinePresenceGrid from "@/features/admin/components/live/LiveOnlinePresenceGrid";
import LiveStationMonitorGrid from "@/features/admin/components/live/LiveStationMonitorGrid";
import LiveBroadcastModal from "@/features/admin/components/live/LiveBroadcastModal";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionIdFromUrl = searchParams.get("sessionId") || searchParams.get("session_id");

  // Supabase State
  const [loading, setLoading] = useState(true);
  const [dbSessions, setDbSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [liveStations, setLiveStations] = useState([]);

  // Live Timer State
  const [activeTab, setActiveTab] = useState("grid");
  const [remainingSeconds, setRemainingSeconds] = useState(720);
  const [timerState, setTimerState] = useState(null);
  const isPhaseTransitioningRef = useRef(false);
  const [isBreak, setIsBreak] = useState(false);
  const [viewRound, setViewRound] = useState(1);
  const [logs, setLogs] = useState([]);
  const [stationSearch, setStationSearch] = useState("");

  const isTimerRunning = Boolean(
    timerState &&
      timerState.target_end_time &&
      timerState.phase !== "paused" &&
      !timerState.phase?.startsWith("paused") &&
      timerState.phase !== "standby" &&
      timerState.phase !== "finished" &&
      activeSession?.status !== "paused"
  );

  const currentRound = Number(timerState?.round_number || activeSession?.current_round || 1);

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
  const totalRoundsCount = Number(activeSession?.total_rounds || activeSession?.total_stations || activeSession?.stations?.length || 6);
  const stationDurationSec = Number(activeSession?.station_duration_minutes ?? 12) * 60;
  const transitionDurationSec = Number(activeSession?.transition_duration_minutes ?? 2) * 60;
  const breakDurationSec = Number(activeSession?.break_duration_minutes ?? 0) * 60;

  // Total session includes action times + transitions (1 initial + (total-1) inter-round = total transitions) + breaks
  const totalSessionDurationSec = (totalRoundsCount * stationDurationSec) + (totalRoundsCount * transitionDurationSec) + breakDurationSec;
  const totalSessionMinutes = Math.ceil(totalSessionDurationSec / 60);

  // Synchronized Total Remaining Overall Seconds
  let totalRemainingSec = 0;
  const rawPhase = timerState?.phase || "standby";
  const isSessionPaused = !isTimerRunning || rawPhase === "paused" || rawPhase.startsWith("paused") || activeSession?.status === "paused";
  const currentPhase = rawPhase.startsWith("paused_") ? rawPhase.replace("paused_", "") : (rawPhase === "paused" ? "action" : rawPhase);

  if (currentPhase === "completed_waiting" || currentPhase === "finished" || activeSession?.status === "completed") {
    totalRemainingSec = 0;
  } else if (currentPhase === "initial_transition") {
    const futureRoundsCount = Math.max(0, totalRoundsCount - 1);
    const futureRoundsSec = futureRoundsCount * (stationDurationSec + transitionDurationSec);
    totalRemainingSec = remainingSeconds + stationDurationSec + futureRoundsSec;
  } else if (currentPhase === "action" || currentPhase === "running" || currentPhase === "reading") {
    const futureRoundsCount = Math.max(0, totalRoundsCount - (currentRound || 1));
    const futureRoundsSec = futureRoundsCount * (stationDurationSec + transitionDurationSec);
    totalRemainingSec = remainingSeconds + futureRoundsSec;
  } else if (currentPhase === "transition") {
    const nextRound = (currentRound || 1) + 1;
    const futureRoundsCount = Math.max(0, totalRoundsCount - nextRound);
    const futureRoundsSec = futureRoundsCount * (stationDurationSec + transitionDurationSec);
    totalRemainingSec = remainingSeconds + stationDurationSec + futureRoundsSec;
  } else if (currentPhase === "break") {
    const futureRoundsCount = Math.max(0, totalRoundsCount - (currentRound || 1));
    const futureRoundsSec = futureRoundsCount * (stationDurationSec + transitionDurationSec);
    totalRemainingSec = remainingSeconds + futureRoundsSec;
  } else {
    totalRemainingSec = totalSessionDurationSec;
  }

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
  async function loadLiveMonitorData(targetId = null) {
    try {
      setLoading(true);
      const rawSessions = await fetchSessions();
      const activeSessions = (rawSessions || [])
        .filter((s) => {
          const st = String(s.status || "").toLowerCase();
          return (
            st === "scheduled" ||
            st === "published" ||
            st === "waiting_room" ||
            st === "ongoing" ||
            st === "running" ||
            st === "paused"
          );
        })
        .sort((a, b) => {
          const aIsLive = ["ongoing", "running", "paused", "waiting_room"].includes(a.status);
          const bIsLive = ["ongoing", "running", "paused", "waiting_room"].includes(b.status);
          if (aIsLive && !bIsLive) return -1;
          if (!aIsLive && bIsLive) return 1;
          return 0;
        });
      setDbSessions(activeSessions);

      const activeId = targetId !== null && targetId !== undefined ? targetId : sessionIdFromUrl;

      if (activeId) {
        const fullDetail = await fetchSessionById(activeId);
        if (fullDetail && fullDetail.status !== "completed" && fullDetail.status !== "finished") {
          setActiveSession(fullDetail);

          const { stations: fetchedStations } = await getLiveStations(fullDetail.id);
          setLiveStations(fetchedStations && fetchedStations.length > 0 ? fetchedStations : fullDetail.stations || []);

          const stateData = await getSessionTimerState(fullDetail.id);
          if (stateData) {
            setTimerState(stateData);
            setViewRound(stateData.round_number || 1);
            setIsBreak(stateData.phase === "break");
            const isStandbyOrWaiting = fullDetail.status === "waiting_room" || stateData.phase === "standby";
            const isPaused = stateData.phase === "paused" || fullDetail.status === "paused";
            const rem = calcRemaining(stateData.target_end_time, stateData.paused_remaining_ms, isPaused);
            setRemainingSeconds(
              isStandbyOrWaiting
                ? (fullDetail.transition_duration_minutes || 1) * 60
                : rem
            );
          } else if (fullDetail.status === "ongoing" || fullDetail.status === "running") {
            const stationDur = fullDetail.station_duration_minutes || 12;
            const transDur = fullDetail.transition_duration_minutes || 2;
            const res = await startOsceSession(fullDetail.id, stationDur, transDur);
            if (res?.timer) {
              setTimerState(res.timer);
              setViewRound(res.timer.round_number || 1);
              const rem = calcRemaining(res.timer.target_end_time, null, false);
              setRemainingSeconds(rem);
            }
          } else {
            setRemainingSeconds((fullDetail.transition_duration_minutes || 1) * 60);
          }
        } else {
          setActiveSession(null);
          setLiveStations([]);
          setTimerState(null);
          setSearchParams({});
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
    loadLiveMonitorData(sessionIdFromUrl);
  }, [sessionIdFromUrl]);

  // Realtime subscription for sessions list when no session is selected
  useEffect(() => {
    if (activeSession) return;

    const channel = supabase
      .channel("live_monitor_sessions_list")
      .on(
        "postgres_changes",
        { event: "*", schema: "osce", table: "sessions" },
        () => {
          loadLiveMonitorData("");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession]);

  function handleSelectSession(sessId) {
    setSearchParams({ sessionId: sessId });
    loadLiveMonitorData(sessId);
  }

  function handleBackToList() {
    setActiveSession(null);
    setTimerState(null);
    setSearchParams({});
    loadLiveMonitorData("");
  }

  // Realtime Subscription for Active Session (DB changes)
  useEffect(() => {
    if (!activeSession?.id || !isConnectableStatus(activeSession?.status)) return;

    const unsubscribe = subscribeToSession(activeSession.id, {
      onTimerUpdate: (newTimerState) => {
        if (!newTimerState) return;
        setTimerState(newTimerState);
        setViewRound(newTimerState.round_number || 1);
        setIsBreak(newTimerState.phase === "break");
        const isStandbyOrWaiting = activeSession?.status === "waiting_room" || newTimerState.phase === "standby";
        const isPaused = newTimerState.phase === "paused";
        const rem = calcRemaining(
          newTimerState.target_end_time,
          newTimerState.paused_remaining_ms,
          isPaused
        );
        setRemainingSeconds(
          isStandbyOrWaiting
            ? (activeSession?.transition_duration_minutes || 1) * 60
            : rem
        );
      },
      onSessionUpdate: (sess) => {
        if (!sess) return;
        if (sess.status === "completed" || sess.status === "finished") {
          setActiveSession(null);
          setTimerState(null);
          setOnlineUsers([]);
          setSearchParams({});
          navigate("/admin/live", { replace: true });
          loadLiveMonitorData("");
          return;
        }
        setActiveSession((prev) => (prev ? { ...prev, ...sess } : sess));
        if (sess.status === "ongoing" || sess.status === "running") {
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

      if (
        timerState?.target_end_time &&
        timerState.phase !== "standby" &&
        timerState.phase !== "completed_waiting" &&
        timerState.phase !== "finished"
      ) {
        const rem = calcRemaining(timerState.target_end_time, null, false);
        setRemainingSeconds(rem);

        if (rem > 0) {
          isPhaseTransitioningRef.current = false;
        }

        if (rem === 120 && timerState.phase === "action") {
          playOsceBell("warning");
          addLog("warning", "BEL AUTOMATIC: Sisa Waktu Stase 2 Menit!");
        }

        if (rem <= 0 && isTimerRunning) {
          if (isPhaseTransitioningRef.current) return;
          isPhaseTransitioningRef.current = true;

          const currentPhase = timerState.phase || "action";
          const stationDuration = activeSession.station_duration_minutes || 12;
          const transitionDuration = activeSession.transition_duration_minutes || 2;
          const totalRounds = activeSession.total_rounds || activeSession.stations?.length || 6;

          if (currentPhase === "initial_transition") {
            playOsceBell("start");
            addLog(
              "info",
              `BEL MULAI: Masuk ke Stase Ujian Ronde ${currentRound} dari ${totalRounds} (${stationDuration} Mnt).`
            );
            updateTimerPhase(activeSession.id, "action", stationDuration, { roundNumber: currentRound })
              .then((res) => {
                if (res) setTimerState(res);
                isPhaseTransitioningRef.current = false;
              })
              .catch((err) => {
                console.error(err);
                isPhaseTransitioningRef.current = false;
              });
          } else if (currentPhase === "action" || currentPhase === "running" || currentPhase === "reading") {
            if (transitionDuration > 0) {
              playOsceBell("rotation");
              addLog(
                "warning",
                `BEL ROTASI: Stase Ronde ${currentRound} Selesai. Masuk ke Waktu Transisi Perpindahan Pos (${transitionDuration} Mnt).`
              );
              updateTimerPhase(activeSession.id, "transition", transitionDuration, { roundNumber: currentRound })
                .then((res) => {
                  if (res) setTimerState(res);
                  isPhaseTransitioningRef.current = false;
                })
                .catch((err) => {
                  console.error(err);
                  isPhaseTransitioningRef.current = false;
                });
            } else {
              advanceRound();
            }
          } else if (currentPhase === "transition" || currentPhase === "break") {
            advanceRound();
          } else {
            advanceRound();
          }

          function advanceRound() {
            if (currentRound >= totalRounds) {
              setRemainingSeconds(0);
              playOsceBell("rotation");
              addLog(
                "success",
                `BEL SESI SELESAI: Entire circuit completed (Ronde ${currentRound}/${totalRounds})! Timer frozen at 00:00. Menunggu Pengajuan Nilai Penguji & Penutupan Admin.`
              );
              setSessionCompletedWaiting(activeSession.id, totalRounds)
                .then((res) => {
                  if (res) setTimerState(res);
                })
                .catch((err) => {
                  console.error(err);
                  isPhaseTransitioningRef.current = false;
                });
              return;
            }
            const nextRound = currentRound + 1;
            setViewRound(nextRound);
            playOsceBell("start");
            addLog(
              "info",
              `BEL MULAI: Rolling Otomatis! Masuk ke Stase Ujian Ronde ${nextRound} dari ${totalRounds} (${stationDuration} Mnt).`
            );
            updateTimerPhase(activeSession.id, "action", stationDuration, { roundNumber: nextRound })
              .then((res) => {
                if (res) setTimerState(res);
                isPhaseTransitioningRef.current = false;
              })
              .catch((err) => {
                console.error(err);
                isPhaseTransitioningRef.current = false;
              });
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, currentRound, activeSession, timerState]);



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
      const stationDuration = activeSession.station_duration_minutes || 12;
      const transitionDuration = activeSession.transition_duration_minutes || 2;
      const res = await startOsceSession(activeSession.id, stationDuration, transitionDuration);
      addLog("success", "Admin memulai Sesi Ujian OSCE! Memasuki Fase Transisi Persiapan Pos Stase 1.");
      if (res?.timer) {
        setTimerState(res.timer);
        const rem = calcRemaining(res.timer.target_end_time, null, false);
        setRemainingSeconds(rem);
      }
      if (res?.session) {
        setActiveSession(res.session);
      } else {
        setActiveSession((prev) => ({ ...prev, status: "ongoing" }));
      }
      toast.success("Sesi Ujian OSCE Resmi Dimulai!");
      await loadLiveMonitorData(activeSession.id);
    } catch (err) {
      console.error("Failed to start OSCE session:", err);
      toast.error(`Gagal memulai sesi: ${err.message}`);
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
          const targetId = activeSession.id;
          setActiveSession(null);
          setTimerState(null);
          setOnlineUsers([]);
          setSearchParams({});
          navigate("/admin/live", { replace: true });
          await finishSession(targetId);
          toast.success("Sesi OSCE telah diakhiri. Seluruh pengguna telah dialihkan kembali ke Dashboard.");
          await loadLiveMonitorData("");
        } catch (err) {
          console.error("Failed to finish session:", err);
        }
      },
    });
  }

  async function handleTogglePause() {
    if (!activeSession) return;
    try {
      // If timer is not started yet or standby, clicking start will start the session!
      if (!timerState || (!timerState.target_end_time && !timerState.paused_remaining_ms) || timerState.phase === "standby") {
        await handleStartOsce();
        return;
      }

      if (isTimerRunning) {
        const res = await pauseTimer(activeSession.id, remainingSeconds, {
          activePhase: timerState?.phase || "action",
          roundNumber: currentRound || timerState?.round_number || 1,
          waveNumber: timerState?.wave_number || 1,
        });
        if (res) setTimerState(res);
        const phaseName = currentPhase === "initial_transition"
          ? "Transisi Awal (Persiapan Pos Stase 1)"
          : currentPhase === "transition"
          ? `Transisi Rotasi Pos (Ronde ${currentRound} → ${currentRound + 1})`
          : currentPhase === "break"
          ? `Jeda Istirahat (Ronde ${currentRound})`
          : `Stase Ujian (Ronde ${currentRound})`;
        addLog("warning", `Admin menghentikan sementara (Pause) timer global OSCE pada ${phaseName}.`);
        toast.info("Timer sesi ujian dihentikan sementara (Paused)");
      } else {
        const res = await resumeTimer(activeSession.id, remainingSeconds, {
          activePhase: timerState?.phase,
          roundNumber: currentRound || timerState?.round_number || 1,
          waveNumber: timerState?.wave_number || 1,
        });
        if (res) {
          setTimerState(res);
          const rem = calcRemaining(res.target_end_time, null, false);
          setRemainingSeconds(rem);
        }
        const resumedPhaseName = (res?.phase === "initial_transition" || currentPhase === "initial_transition")
          ? "Transisi Awal (Persiapan Pos Stase 1)"
          : (res?.phase === "transition" || currentPhase === "transition")
          ? `Transisi Rotasi Pos (Ronde ${currentRound} → ${currentRound + 1})`
          : (res?.phase === "break" || currentPhase === "break")
          ? `Jeda Istirahat (Ronde ${currentRound})`
          : `Stase Ujian (Ronde ${currentRound})`;
        addLog("info", `Admin melanjutkan timer global OSCE pada ${resumedPhaseName}.`);
        toast.success("Timer sesi ujian dilanjutkan (Resumed)");
      }
    } catch (err) {
      console.error("Error toggling pause timer:", err);
      toast.error(`Gagal mengubah status timer: ${err.message}`);
    }
  }

  async function handleSkipPhase() {
    if (!activeSession) return;
    const totalRounds = activeSession.total_rounds || activeSession.stations?.length || 6;

    const currentPhase = timerState?.phase || "running";
    const currentRoundNum = timerState?.round_number || currentRound || 1;
    const stationDur = activeSession.station_duration_minutes || 12;
    const transitionDur = activeSession.transition_duration_minutes || 2;

    try {
      if (currentPhase === "initial_transition") {
        const res = await updateTimerPhase(activeSession.id, "action", stationDur, {
          roundNumber: 1,
        });
        if (res) setTimerState(res);
        addLog("info", `Admin melompati transisi awal ke Stase Ujian Ronde 1.`);
      } else if (currentPhase === "running" || currentPhase === "action" || currentPhase === "reading") {
        if (transitionDur > 0) {
          const res = await updateTimerPhase(activeSession.id, "transition", transitionDur, {
            roundNumber: currentRoundNum,
          });
          if (res) setTimerState(res);
          addLog("warning", `Admin melompati (skip) stase ke Fase Transisi ${transitionDur} Menit (Ronde ${currentRoundNum}).`);
        } else {
          await advanceOrFinish();
        }
      } else if (currentPhase === "transition" || currentPhase === "break") {
        await advanceOrFinish();
      } else {
        await advanceOrFinish();
      }

      async function advanceOrFinish() {
        if (currentRoundNum >= totalRounds) {
          await setSessionCompletedWaiting(activeSession.id, totalRounds);
          addLog("success", `BEL SESI SELESAI: All rounds completed.`);
        } else {
          const nextR = currentRoundNum + 1;
          const res = await updateTimerPhase(activeSession.id, "action", stationDur, {
            roundNumber: nextR,
          });
          if (res) setTimerState(res);
          addLog("success", `Admin melompati ke Stase Ujian Ronde ${nextR} / ${totalRounds}.`);
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
    toast.success(`[BEL MANUAL] ${bellNames[bellType]}`, {
      description: `Target: Semua Layar (Peserta & Penguji) • ${new Date().toLocaleTimeString("id-ID")}`,
      duration: 6000,
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
    toast.success(`Broadcast Terkirim: "${broadcastMessage}"`, {
      description: `Target: ${targetLabel} • ${new Date().toLocaleTimeString("id-ID")}`,
      duration: 6000,
    });

    setIsBroadcastModalOpen(false);
    setBroadcastMessage("");
  }

  function formatMinutesSeconds(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
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
      {/* STATE A: NO SESSION SELECTED */}
      {!activeSession ? (
        <LiveSessionPicker dbSessions={dbSessions} onSelectSession={handleSelectSession} />
      ) : activeSession.status === "waiting_room" || activeSession.status === "published" || activeSession.status === "scheduled" ? (
        /* STATE B: WAITING ROOM / PRE-START OPEN */
        <LiveWaitingRoomCard
          activeSession={activeSession}
          onlineUsers={onlineUsers}
          liveStations={liveStations}
          handleBackToList={handleBackToList}
          handleCloseWaitingRoom={handleCloseWaitingRoom}
          handleStartOsce={handleStartOsce}
        />
      ) : (
        /* STATE C: SESSION IS ONGOING / LIVE / PAUSED */
        <div className="space-y-6 min-w-0 max-w-full">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar Live Monitor</span>
          </button>

          {/* Hero / Timer Control Header */}
          <LiveTimerControlHeader
            activeSession={activeSession}
            timerState={timerState}
            isTimerRunning={isTimerRunning}
            remainingSeconds={remainingSeconds}
            currentRound={currentRound}
            totalRoundsCount={totalRoundsCount}
            isBellMenuOpen={isBellMenuOpen}
            setIsBellMenuOpen={setIsBellMenuOpen}
            handleTriggerBell={handleTriggerBell}
            handleTogglePause={handleTogglePause}
            handleSkipPhase={handleSkipPhase}
            handleFinishOSCE={handleFinishOSCE}
            setIsBroadcastModalOpen={setIsBroadcastModalOpen}
            formatMinutesSeconds={formatMinutesSeconds}
          />

          {/* Realtime Online Users Presence Grid */}
          <LiveOnlinePresenceGrid onlineUsers={onlineUsers} sessionId={activeSession.id} />

          {/* Matriks Live Station Pos Grid */}
          <LiveStationMonitorGrid liveStations={liveStations} />

          {/* Matriks Live Rotasi Stase & Peserta-Dokter Schedule */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <SessionRotationScheduleView sessionId={activeSession.id} activeRound={currentRound} timerState={timerState} />
          </div>
        </div>
      )}

      {/* Broadcast Modal Overlay */}
      <LiveBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        broadcastMessage={broadcastMessage}
        setBroadcastMessage={setBroadcastMessage}
        broadcastTarget={broadcastTarget}
        setBroadcastTarget={setBroadcastTarget}
        handleSendBroadcast={handleSendBroadcast}
      />

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