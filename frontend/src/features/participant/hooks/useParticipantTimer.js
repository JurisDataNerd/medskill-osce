import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  getSessionTimerState,
  subscribeToSession,
  calcRemaining,
  playBroadcastNotificationSound,
} from "@/services/realtimeTimerService";
import { playOsceFeedback } from "@/services/audioService";

export function useParticipantTimer({
  sessionId,
  sessionDetail,
  setSessionDetail,
  stationDurationSeconds,
  transitDurationSeconds,
  breakDurationSeconds,
  totalRoundsInSession,
  navigate,
  activeStationInfo,
  examStep,
  setExamStep,
  performAutoSaveRef,
  handleFinishActiveRoundRef,
}) {
  const [viewMode, setViewMode] = useState(() => {
    if (!sessionId) return "waiting_room";
    return localStorage.getItem(`osce_view_mode_${sessionId}`) || "waiting_room";
  });

  useEffect(() => {
    if (sessionId && viewMode) {
      localStorage.setItem(`osce_view_mode_${sessionId}`, viewMode);
    }
  }, [sessionId, viewMode]);

  const [currentRound, setCurrentRound] = useState(() => {
    if (!sessionId) return 1;
    const savedRound = localStorage.getItem(`osce_current_round_${sessionId}`);
    return savedRound ? Number(savedRound) : 1;
  });

  useEffect(() => {
    if (sessionId && currentRound) {
      localStorage.setItem(`osce_current_round_${sessionId}`, currentRound.toString());
    }
  }, [sessionId, currentRound]);

  const [globalTimerState, setGlobalTimerState] = useState(null);
  const [activeBroadcast, setActiveBroadcast] = useState(null);

  // Broadcast Auto-dismiss Timer (5 Seconds)
  useEffect(() => {
    if (!activeBroadcast) return;
    const timer = setTimeout(() => {
      setActiveBroadcast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeBroadcast]);

  // Active timers
  const [waitingCountdown, setWaitingCountdown] = useState(30);
  const [roundSecondsLeft, setRoundSecondsLeft] = useState(stationDurationSeconds);
  const [transitSecondsLeft, setTransitSecondsLeft] = useState(transitDurationSeconds);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(breakDurationSeconds);

  const isSessionLive = useMemo(() => {
    if (
      sessionDetail &&
      (sessionDetail.status === "running" ||
        sessionDetail.status === "ongoing" ||
        sessionDetail.status === "paused")
    ) {
      return true;
    }
    if (
      globalTimerState &&
      globalTimerState.phase &&
      globalTimerState.phase !== "standby"
    ) {
      return true;
    }
    return false;
  }, [sessionDetail, globalTimerState]);

  // Real-time Timer & Session Status Subscription
  useEffect(() => {
    if (!sessionId) return;

    async function initTimer() {
      const stateData = await getSessionTimerState(sessionId);
      if (stateData) {
        setGlobalTimerState(stateData);
        if (stateData.round_number) setCurrentRound(stateData.round_number);

        const rawPhase = stateData.phase || "";
        const isPaused =
          rawPhase === "paused" || rawPhase.startsWith("paused") || sessionDetail?.status === "paused";
        const rem = calcRemaining(
          stateData.target_end_time,
          stateData.paused_remaining_ms,
          isPaused
        );
        setRoundSecondsLeft(rem);

        const activePhase = rawPhase.startsWith("paused_")
          ? rawPhase.replace("paused_", "")
          : (rawPhase === "paused" ? "action" : rawPhase);

        if (
          (sessionDetail?.status === "waiting_room" ||
            sessionDetail?.status === "published" ||
            sessionDetail?.status === "scheduled") &&
          (activePhase === "standby" || !activePhase)
        ) {
          setViewMode("waiting_room");
        } else if (activePhase === "transition" || activePhase === "initial_transition") {
          setViewMode("transit");
          setTransitSecondsLeft(rem);
        } else if (activePhase === "action" || activePhase === "reading") {
          setViewMode((prev) => {
            const isSubmitted = sessionId && localStorage.getItem(`osce_station_submitted_${sessionId}_round_${stateData.round_number || 1}`) === "true";
            if (isSubmitted && prev !== "station_completed_wait") {
              return "station_completed_wait";
            }
            return "live_round";
          });
        } else if (activePhase === "break") {
          setViewMode("round_break");
          setBreakSecondsLeft(rem);
        } else if (activePhase === "completed_waiting") {
          setViewMode("completed");
        }
      }
    }

    initTimer();

    const unsubscribe = subscribeToSession(sessionId, {
      onTimerUpdate: (newTimerState) => {
        if (!newTimerState) return;
        setGlobalTimerState(newTimerState);
        if (newTimerState.round_number) setCurrentRound(newTimerState.round_number);

        const rawPhase = newTimerState.phase || "";
        const isPaused =
          rawPhase === "paused" || rawPhase.startsWith("paused") || sessionDetail?.status === "paused";
        const rem = calcRemaining(
          newTimerState.target_end_time,
          newTimerState.paused_remaining_ms,
          isPaused
        );
        setRoundSecondsLeft(rem);

        const activePhase = rawPhase.startsWith("paused_")
          ? rawPhase.replace("paused_", "")
          : (rawPhase === "paused" ? "action" : rawPhase);

        if (
          (sessionDetail?.status === "waiting_room" ||
            sessionDetail?.status === "published" ||
            sessionDetail?.status === "scheduled") &&
          (activePhase === "standby" || !activePhase)
        ) {
          setViewMode("waiting_room");
        } else if (activePhase === "transition" || activePhase === "initial_transition") {
          setViewMode("transit");
          setTransitSecondsLeft(rem);
        } else if (activePhase === "action" || activePhase === "reading") {
          setViewMode((prev) => {
            const isSubmitted = sessionId && localStorage.getItem(`osce_station_submitted_${sessionId}_round_${newTimerState.round_number || 1}`) === "true";
            if (isSubmitted && prev !== "station_completed_wait") {
              return "station_completed_wait";
            }
            return "live_round";
          });
        } else if (activePhase === "break") {
          setViewMode("round_break");
          setBreakSecondsLeft(rem);
        } else if (activePhase === "completed_waiting") {
          setViewMode("completed");
        }
      },
      onBell: (bellData) => {
        playOsceFeedback(bellData?.bell_type, "participant");
      },
      onSessionUpdate: (sess) => {
        if (sess && sess.id === sessionId) {
          if (setSessionDetail) setSessionDetail((prev) => (prev ? { ...prev, status: sess.status } : sess));
          if (sess.status === "completed" || sess.status === "finished") {
            toast.dismiss();
            toast.info("Sesi OSCE telah diakhiri oleh Admin Control Room. Dialihkan ke Dashboard.", { duration: 5000 });
            navigate("/participant");
          } else if (sess.status === "waiting_room") {
            setViewMode("waiting_room");
          }
        }
      },
      onBroadcast: (msg) => {
        if (!msg) return;
        const target = String(msg.target_role || "all").toLowerCase();
        if (target === "all" || target === "participants" || target === "peserta") {
          playBroadcastNotificationSound();
          toast.info(msg.message || "Pemberitahuan Admin Control Room", {
            id: `broadcast-${msg.id || Date.now()}`,
            description: `Pengumuman Admin • ${new Date().toLocaleTimeString("id-ID")}`,
            duration: 8000,
          });
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId, sessionDetail?.status]);

  // Live Timer 1-second Tick
  useEffect(() => {
    if (!sessionId || !globalTimerState) return;

    const interval = setInterval(() => {
      const isPaused = globalTimerState.phase === "paused" || sessionDetail?.status === "paused";
      const rem = calcRemaining(
        globalTimerState.target_end_time,
        globalTimerState.paused_remaining_ms,
        isPaused
      );

      if (viewMode === "live_round" || viewMode === "station_completed_wait") setRoundSecondsLeft(rem);
      else if (viewMode === "transit") setTransitSecondsLeft(rem);
      else if (viewMode === "round_break") setBreakSecondsLeft(rem);
      else if (viewMode === "waiting_room") setWaitingCountdown(rem);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, globalTimerState, viewMode, sessionDetail?.status]);

  // Auto Next when timer reaches 0
  useEffect(() => {
    if (!sessionId || !isSessionLive) return;

    const isPaused =
      globalTimerState?.phase === "paused" ||
      globalTimerState?.phase?.startsWith("paused") ||
      sessionDetail?.status === "paused";

    if (isPaused) return;

    if (viewMode === "live_round" && roundSecondsLeft === 0 && globalTimerState?.target_end_time) {
      if (!activeStationInfo?.is_break) {
        if (performAutoSaveRef?.current) {
          performAutoSaveRef.current({ current_step: examStep, status: "submitted" });
        }
        if (sessionId && currentRound) {
          localStorage.setItem(`osce_station_submitted_${sessionId}_round_${currentRound}`, "true");
        }
      }
      if (handleFinishActiveRoundRef?.current) {
        handleFinishActiveRoundRef.current();
      }
    } else if (viewMode === "transit" && transitSecondsLeft === 0 && globalTimerState?.target_end_time) {
      const isInitial = globalTimerState?.phase === "initial_transition";
      const targetR = isInitial
        ? 1
        : Math.min(totalRoundsInSession, (globalTimerState?.round_number || currentRound) + 1);
      setCurrentRound(targetR);
      setViewMode("live_round");
      if (setExamStep) setExamStep(1);
    } else if (viewMode === "round_break" && breakSecondsLeft === 0 && globalTimerState?.target_end_time) {
      const nextR = currentRound + 1;
      setCurrentRound(nextR);
      setViewMode("live_round");
      if (setExamStep) setExamStep(1);
    }
  }, [
    sessionId,
    isSessionLive,
    viewMode,
    roundSecondsLeft,
    transitSecondsLeft,
    breakSecondsLeft,
    currentRound,
    totalRoundsInSession,
    globalTimerState?.phase,
    globalTimerState?.round_number,
    globalTimerState?.target_end_time,
    examStep,
    activeStationInfo?.is_break,
    sessionDetail?.status,
  ]);

  // Auto-sync candidate view & active round with Admin Global Timer State
  useEffect(() => {
    if (!globalTimerState) return;

    if (globalTimerState.current_round && Number(globalTimerState.current_round) >= 1) {
      const serverRound = Number(globalTimerState.current_round);
      if (serverRound !== currentRound) {
        if (sessionId) {
          localStorage.removeItem(`osce_station_submitted_${sessionId}_round_${serverRound}`);
        }
        setCurrentRound(serverRound);
        if (setExamStep) setExamStep(1);
      }
    }

    if (
      (sessionDetail?.status === "waiting_room" ||
        sessionDetail?.status === "published" ||
        sessionDetail?.status === "scheduled") &&
      (globalTimerState.phase === "standby" || !globalTimerState.phase)
    ) {
      setViewMode("waiting_room");
      return;
    }

    const isPaused =
      globalTimerState.phase === "paused" ||
      globalTimerState.phase?.startsWith("paused") ||
      sessionDetail?.status === "paused";

    if (isPaused) return;

    if (globalTimerState.phase === "transition" || globalTimerState.phase === "initial_transition") {
      const serverRound = Number(globalTimerState.round_number || currentRound);
      if (serverRound > totalRoundsInSession) {
        setViewMode("completed");
      } else {
        setViewMode("transit");
      }
    } else if (globalTimerState.phase === "break") {
      setViewMode("round_break");
    } else if (globalTimerState.phase === "completed_waiting") {
      setViewMode("completed");
    } else if (
      globalTimerState.phase === "finished" ||
      globalTimerState.phase === "completed" ||
      (sessionDetail?.status === "completed" && !isPaused) ||
      (sessionDetail?.status === "finished" && !isPaused)
    ) {
      toast.info("Sesi OSCE telah diakhiri oleh Admin Control Room. Dialihkan ke Dashboard.", { duration: 5000 });
      navigate("/participant");
    } else if (
      globalTimerState.phase === "action" ||
      globalTimerState.phase === "reading" ||
      globalTimerState.phase === "running"
    ) {
      setViewMode((prev) => {
        const isSubmitted = sessionId && localStorage.getItem(`osce_station_submitted_${sessionId}_round_${currentRound}`) === "true";
        if (isSubmitted && prev !== "station_completed_wait") {
          return "station_completed_wait";
        }
        return "live_round";
      });
    }
  }, [globalTimerState, sessionDetail?.status, sessionId, currentRound]);

  return {
    viewMode,
    setViewMode,
    currentRound,
    setCurrentRound,
    globalTimerState,
    isSessionLive,
    roundSecondsLeft,
    setRoundSecondsLeft,
    transitSecondsLeft,
    setTransitSecondsLeft,
    breakSecondsLeft,
    setBreakSecondsLeft,
    waitingCountdown,
    activeBroadcast,
    setActiveBroadcast,
  };
}
