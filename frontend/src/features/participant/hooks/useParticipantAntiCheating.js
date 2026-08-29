import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export function useParticipantAntiCheating(viewMode) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showCheatingWarning, setShowCheatingWarning] = useState(false);
  const lastHiddenTimeRef = useRef(null);

  // Screen Wake Lock API to prevent device screen sleep/timeout during live exam
  useEffect(() => {
    if (viewMode !== "live_round") return;

    let wakeLock = null;

    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        console.warn("Screen Wake Lock request error:", err);
      }
    }

    requestWakeLock();

    function handleReFocusWakeLock() {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    }

    document.addEventListener("visibilitychange", handleReFocusWakeLock);

    return () => {
      document.removeEventListener("visibilitychange", handleReFocusWakeLock);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [viewMode]);

  // Anti-Cheating Tab Switch & Fullscreen Mode on Live Exam with Screen Lock Grace Period
  useEffect(() => {
    if (viewMode !== "live_round") return;

    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    function handleVisibilityChange() {
      if (document.hidden) {
        lastHiddenTimeRef.current = Date.now();
      } else {
        if (lastHiddenTimeRef.current) {
          const timeAwayMs = Date.now() - lastHiddenTimeRef.current;
          lastHiddenTimeRef.current = null;

          // Grace Period (< 5000ms): Screen lock / timeout toggle, do NOT count as cheating violation
          if (timeAwayMs < 5000) {
            toast.info("Layar Anda sempat terhenti / terkunci. Sesi ujian dilanjutkan.", {
              id: "screen-lock-resume",
              duration: 3000,
            });
            return;
          }
        }
        // User left app or tab for >= 5 seconds -> trigger cheating warning
        setTabSwitchCount((prev) => prev + 1);
        setShowCheatingWarning(true);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [viewMode]);

  return {
    tabSwitchCount,
    showCheatingWarning,
    setShowCheatingWarning,
  };
}
