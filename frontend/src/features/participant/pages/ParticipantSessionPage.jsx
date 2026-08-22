import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileCheck2,
  Users,
  ChevronRight,
  ChevronDown,
  Lock,
  Hourglass,
  ShieldCheck,
  MapPin,
  Play,
  Volume2,
  AlertTriangle,
  ArrowRight,
  Activity,
  Search,
  X,
  XCircle,
  Coffee,
  RotateCw,
  LogOut,
  Award,
  Megaphone,
  BellRing,
  PauseCircle,
} from "lucide-react";
import { playOsceAudio } from "@/services/audioService";
import { AUXILIARY_EXAM_CATALOG } from "@/features/participant/data/auxiliaryExamsCatalog";
import AuxiliaryExamResultModal from "@/components/AuxiliaryExamResultModal";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";
import { fetchSessionById } from "@/services/sessionService";
import { getSessionParticipants } from "@/services/session.service";
import { getSessionTimerState } from "@/services/live.service";
import {
  subscribeToSession,
  joinPresence,
  calcRemaining,
  playBroadcastNotificationSound,
} from "@/services/realtimeTimerService";
import {
  saveParticipantStepAnswer,
  fetchParticipantAnswer,
} from "@/services/participantService";
import ParticipantPersonalScheduleWidget from "@/features/participant/components/ParticipantPersonalScheduleWidget";
import { useAuth } from "@/context/AuthProvider";

export default function ParticipantSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // View Mode: 'waiting_room', 'live_round', 'transit', 'round_break', 'completed'
  const [viewMode, setViewMode] = useState("waiting_room");

  // Loaded Session Detail from Supabase
  const [sessionDetail, setSessionDetail] = useState(null);

  // Approval Guard State: 'approved' | 'pending' | 'rejected'
  const [candidateApprovalStatus, setCandidateApprovalStatus] = useState("approved");

  // Live Presence State for Waiting Room Users
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeBroadcast, setActiveBroadcast] = useState(null);

  // Broadcast Auto-dismiss Timer (5 Seconds)
  useEffect(() => {
    if (!activeBroadcast) return;
    const timer = setTimeout(() => {
      setActiveBroadcast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeBroadcast]);

  // Anti-Cheating Security State
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showCheatingWarning, setShowCheatingWarning] = useState(false);

  // Confirm & Alert Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Mengerti",
    variant: "info",
    isAlert: true,
    onConfirm: null,
  });

  // Real-time Presence Tracking for Waiting Room
  useEffect(() => {
    if (!sessionId) return;

    let cleanupPresence = null;
    async function initPresence() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let full_name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Tidak ada data";
        let nim = user?.user_metadata?.nim || "";

        if (user?.id) {
          const { data: prof } = await supabase
            .schema("public")
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();

          if (prof?.full_name) full_name = prof.full_name;

          const { data: partData } = await supabase
            .schema("osce")
            .from("session_participants")
            .select("nim")
            .eq("session_id", sessionId)
            .or(`user_id.eq.${user.id},email.eq.${user.email}`)
            .maybeSingle();

          if (partData?.nim) nim = partData.nim;
        }

        const userState = {
          user_id: user?.id || user?.email || `participant-${Date.now()}`,
          full_name,
          role: "participant",
          nim,
          email: user?.email,
        };

        cleanupPresence = joinPresence(sessionId, userState, (users) => {
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
  }, [sessionId]);

  useEffect(() => {
    async function checkApprovalGuard() {
      if (!sessionId) return;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const list = await getSessionParticipants(sessionId);
        const p = list.find(
          (item) =>
            (user?.id && item.user_id === user.id) ||
            (user?.email && item.email === user.email)
        );
        if (p) {
          setCandidateApprovalStatus((p.status || "pending").toLowerCase());
        }
      } catch (e) {}
    }
    checkApprovalGuard();
  }, [sessionId]);

  // Anti-Cheating Tab Switch & Fullscreen Mode on Live Exam
  useEffect(() => {
    if (viewMode !== "live_round") return;

    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    function handleVisibilityChange() {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setShowCheatingWarning(true);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [viewMode]);

  const [dbStations, setDbStations] = useState([]);
  const [dbExaminers, setDbExaminers] = useState([]);
  const [myStartingStation, setMyStartingStation] = useState(1);

  // Customisable Durations (in seconds)
  const [stationDurationSeconds, setStationDurationSeconds] = useState(15 * 60); // Default 15 Menit Stase
  const [transitDurationSeconds, setTransitDurationSeconds] = useState(2 * 60);  // Default 2 Menit Transisi
  const [breakDurationSeconds, setBreakDurationSeconds] = useState(10 * 60);   // Default 10 Menit Istirahat Ronde

  // Active timers
  const [waitingCountdown, setWaitingCountdown] = useState(30);
  const [roundSecondsLeft, setRoundSecondsLeft] = useState(stationDurationSeconds);
  const [transitSecondsLeft, setTransitSecondsLeft] = useState(transitDurationSeconds);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(breakDurationSeconds);

  useEffect(() => {
    async function loadSessionData() {
      if (!sessionId) return;
      try {
        const data = await fetchSessionById(sessionId);
        if (data) {
          setSessionDetail(data);
          if (data.station_duration_minutes) {
            const dur = data.station_duration_minutes * 60;
            setStationDurationSeconds(dur);
            setRoundSecondsLeft(dur);
          }
          if (data.break_duration_minutes) {
            setBreakDurationSeconds(data.break_duration_minutes * 60);
          }
          if (data.transition_duration_minutes) {
            setTransitDurationSeconds(data.transition_duration_minutes * 60);
          }
        }

        // Fetch stations & examiners for session
        const [
          { data: stData },
          { data: exData },
          { data: { user } },
        ] = await Promise.all([
          supabase
            .schema("osce")
            .from("stations")
            .select("*")
            .eq("session_id", sessionId)
            .order("station_number", { ascending: true }),
          supabase
            .schema("osce")
            .from("session_examiners")
            .select("*")
            .eq("session_id", sessionId),
          supabase.auth.getUser(),
        ]);

        if (stData) setDbStations(stData);
        if (exData) setDbExaminers(exData);

        if (user) {
          const { data: partData } = await supabase
            .schema("osce")
            .from("session_participants")
            .select("starting_station_number")
            .eq("session_id", sessionId)
            .or(`user_id.eq.${user.id},email.eq.${user.email}`)
            .maybeSingle();

          if (partData?.starting_station_number) {
            setMyStartingStation(Number(partData.starting_station_number));
          }
        }
      } catch (err) {
        console.warn("Using default candidate schedule data:", err);
      }
    }
    loadSessionData();
  }, [sessionId]);

  // Current Active Round for candidate (Round 1 to Total Stations)
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

  const totalRoundsInSession = useMemo(() => {
    return sessionDetail?.total_stations || sessionDetail?.total_rounds || dbStations?.length || 4;
  }, [sessionDetail, dbStations]);

  // Live Stage Data loaded from Supabase / Active Session
  const [liveStageData] = useState({
    station_number: 1,
    title: "Stase 1: Kardiovaskular (STEMI Anteroseptal)",
    examiner_name: "Tidak ada data",
    scenario: "Seorang laki-laki berusia 54 tahun datang ke UGD dengan keluhan nyeri dada kiri hebat seperti ditindih beban berat sejak 2 jam lalu. Nyeri menjalar ke lengan kiri dan leher, disertai keringat dingin dan mual.",
    participant_instructions: [
      "Lakukan anamnesis terarah mengenai keluhan utama nyeri dada.",
      "Lakukan pemeriksaan fisik kardiovaskular secara terstruktur.",
      "Tentukan indikasi & mintalah pemeriksaan penunjang yang relevan.",
      "Tegakkan Diagnosis Kerja (WDx), 3 Diagnosis Banding (DDx), dan tuliskan Blangko Resep Medis."
    ],
    waiting_room_info: {
      location: "Gedung Skill Lab Ruang 101",
      wave_number: 1,
      rotation_round: 1,
      total_rounds: 6,
      rules: [
        "Peserta wajib menggunakan jas dokter dan stetoskop.",
        "Dilarang membawa alat komunikasi atau catatan apapun ke dalam ruang stase.",
        "Waktu ujian continuous 12 menit (1m reading, 10m action, 1m transition)."
      ]
    },
    patient_profile: {
      name: "Tn. Budi Santoso",
      age: 54
    }
  });

  const totalStations = sessionDetail?.total_stations || dbStations?.length || 6;

  const currentStationNum = useMemo(() => {
    return ((myStartingStation - 1 + (currentRound - 1)) % totalStations) + 1;
  }, [myStartingStation, currentRound, totalStations]);

  const activeStationInfo = useMemo(() => {
    const st = dbStations.find((s) => Number(s.station_number) === currentStationNum);
    const ex = dbExaminers.find((e) => Number(e.assigned_station_number) === currentStationNum);

    const is_break = Boolean(
      st?.is_break ||
      st?.title?.toLowerCase().includes("istirahat") ||
      st?.title?.toLowerCase().includes("break") ||
      st?.case_title?.toLowerCase().includes("istirahat")
    );

    const title = st?.title || (is_break ? `Stase ${currentStationNum}: Istirahat` : `Stase ${currentStationNum}: Klinis Terpadu`);
    const case_title = st?.case_title || (is_break ? "Stase Istirahat Sirkuit" : "Evaluasi Skenario SKDI");
    const scenario = is_break
      ? "Anda sedang berada di Stase Istirahat. Silakan gunakan waktu ini untuk memulihkan stamina sebelum menghadapi stase pengujian berikutnya."
      : (st?.scenario || liveStageData.scenario);
    const instructions = is_break
      ? [
          "1. Ini adalah Stase Istirahat (Rest Station). Tidak ada pengujian keterampilan atau pengisian formulir pada stase ini.",
          "2. Tetap berada di area stase istirahat hingga timer countdown selesai dan bel rotasi berbunyi.",
          "3. Dilarang meninggalkan area sirkuit OSCE tanpa seijin panitia."
        ]
      : (st?.participant_instructions || liveStageData.participant_instructions);

    return {
      station_number: currentStationNum,
      is_break,
      title,
      case_title,
      scenario,
      participant_instructions: Array.isArray(instructions) ? instructions : [instructions],
      examiner_name: is_break ? "Stase Istirahat (Tanpa Penguji)" : (ex?.full_name ? (ex.specialty ? `${ex.full_name}, ${ex.specialty}` : ex.full_name) : "Tidak ada data"),
      location: sessionDetail?.location_building || `Gedung Skill Lab Ruang 10${currentStationNum}`,
    };
  }, [dbStations, dbExaminers, currentStationNum, sessionDetail, liveStageData]);

  // Round Break interval configuration (Default: Istirahat setelah Ronde 3)
  const [breakAfterRound] = useState(3);

  // Multi-step exam state inside round (1: Anamnesis, 2: Pemeriksaan Fisik, 3: Penunjang, 4: Diagnosis & Resep)
  const [examStep, setExamStep] = useState(1);

  // Confirmation Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState(null);

  // Result Modal State for Tahap 3 Penunjang
  const [isAuxiliaryResultOpen, setIsAuxiliaryResultOpen] = useState(false);
  const [auxiliaryResults, setAuxiliaryResults] = useState([]);

  // Candidate Answer Sheet Form State (Clean Empty Initialization)
  const [differentialDiagnosis, setDifferentialDiagnosis] = useState("");
  const [workingDiagnosis, setWorkingDiagnosis] = useState("");
  const [prescriptionText, setPrescriptionText] = useState("");

  // Direct Checkbox Auxiliary Exams State (Halaman 3)
  const [checkedAuxiliaryIds, setCheckedAuxiliaryIds] = useState([]);

  // Auto-load candidate answer from Supabase database when station or round changes
  // Auto-load candidate answer from Supabase database or localStorage when station or round changes
  useEffect(() => {
    async function loadAnswer() {
      if (!sessionId || !currentStationNum) return;
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id || localStorage.getItem("osce_user_id") || "participant-user";

        const st = dbStations.find((s) => Number(s.station_number) === currentStationNum);
        const stationId = st?.id || `station-${currentStationNum}`;

        const ans = await fetchParticipantAnswer(sessionId, stationId, userId, currentRound);
        if (ans) {
          if (ans.current_step && Number(ans.current_step) >= 1 && Number(ans.current_step) <= 4) {
            setExamStep(Number(ans.current_step));
          } else {
            setExamStep(1);
          }
          setWorkingDiagnosis(ans.working_diagnosis || "");
          setDifferentialDiagnosis(ans.differential_dx_1 || "");
          setPrescriptionText(ans.prescription_text || "");
          setCheckedAuxiliaryIds(Array.isArray(ans.requested_auxiliary_json) ? ans.requested_auxiliary_json : []);
        } else {
          // Explicitly clear all candidate form inputs for a brand new round / station!
          setExamStep(1);
          setWorkingDiagnosis("");
          setDifferentialDiagnosis("");
          setPrescriptionText("");
          setCheckedAuxiliaryIds([]);
        }
      } catch (err) {
        console.warn("Could not load candidate answer:", err);
      }
    }
    loadAnswer();
  }, [sessionId, currentStationNum, currentRound, dbStations]);

  // Step persistence via localStorage across page reloads
  useEffect(() => {
    if (!sessionId) return;
    const savedStep = localStorage.getItem(`osce_exam_step_${sessionId}_${currentRound}`);
    if (savedStep && Number(savedStep) >= 1 && Number(savedStep) <= 4) {
      setExamStep(Number(savedStep));
    }
  }, [sessionId, currentRound]);

  useEffect(() => {
    if (sessionId && examStep) {
      localStorage.setItem(`osce_exam_step_${sessionId}_${currentRound}`, examStep.toString());
    }
  }, [sessionId, currentRound, examStep]);

  // Auto-save candidate answer to Supabase osce.participant_answers & localStorage
  const performAutoSave = async (overrides = {}) => {
    try {
      if (!sessionId || activeStationInfo.is_break) return;
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || localStorage.getItem("osce_user_id") || "participant-user";

      const st = dbStations.find((s) => Number(s.station_number) === currentStationNum);
      if (!st?.id) return;

      await saveParticipantStepAnswer({
        session_id: sessionId,
        station_id: st.id,
        participant_id: userId,
        rotation_round: currentRound,
        current_step: overrides.current_step || examStep,
        working_diagnosis: overrides.workingDiagnosis ?? workingDiagnosis,
        differential_dx_1: overrides.differentialDiagnosis ?? differentialDiagnosis,
        prescription_text: overrides.prescriptionText ?? prescriptionText,
        requested_auxiliary_json: overrides.checkedAuxiliaryIds ?? checkedAuxiliaryIds,
        status: overrides.status || "in_progress",
      });
    } catch (e) {
      console.warn("Auto-save candidate answer error:", e);
    }
  };

  // Debounced auto-save on answer change during live round
  useEffect(() => {
    if (viewMode !== "live_round") return;
    const timer = setTimeout(() => {
      performAutoSave();
    }, 1000);
    return () => clearTimeout(timer);
  }, [workingDiagnosis, differentialDiagnosis, prescriptionText, checkedAuxiliaryIds, examStep, viewMode]);

  // Auxiliary Exams Search & Filter State
  const [auxSearchQuery, setAuxSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [expandedCategories, setExpandedCategories] = useState({
    RADIOLOGI: true,
    HEMATOLOGI: true,
    ENZIM: true,
    "LAIN-LAIN": true,
  });

  const filteredCatalog = useMemo(() => {
    return (AUXILIARY_EXAM_CATALOG || [])
      .map((cat) => {
        if (
          selectedCategoryFilter !== "ALL" &&
          cat.category.toUpperCase() !== selectedCategoryFilter.toUpperCase()
        ) {
          return { ...cat, subcategories: [] };
        }

        if (!auxSearchQuery.trim()) return cat;

        const q = auxSearchQuery.toLowerCase();
        const matchingSub = (cat.subcategories || [])
          .map((sub) => {
            const matchingItems = (sub.items || []).filter(
              (item) =>
                item.name.toLowerCase().includes(q) ||
                item.id.toLowerCase().includes(q) ||
                sub.name.toLowerCase().includes(q) ||
                cat.category.toLowerCase().includes(q)
            );
            return { ...sub, items: matchingItems };
          })
          .filter((sub) => sub.items.length > 0);

        return { ...cat, subcategories: matchingSub };
      })
      .filter((cat) => cat.subcategories.length > 0);
  }, [auxSearchQuery, selectedCategoryFilter]);

  const allCatalogItems = useMemo(() => {
    const items = [];
    (AUXILIARY_EXAM_CATALOG || []).forEach((cat) => {
      (cat.subcategories || []).forEach((sub) => {
        (sub.items || []).forEach((it) => {
          items.push({
            ...it,
            category: cat.category,
          });
        });
      });
    });
    return items;
  }, []);

  // Station mapping for Candidate across 6 rounds (Example: Participant starts at Station 1 in Round 1)
  const candidateStationSchedule = {
    1: { station_number: 1, title: "Stase 1: Kardiovaskular", case_title: "Sindrom Koroner Akut (STEMI Anteroseptal)", location: "Gedung Skill Lab Ruang 101" },
    2: { station_number: 2, title: "Stase 2: Pulmonologi", case_title: "Status Asmatikus & Pneumotoraks", location: "Gedung Skill Lab Ruang 102" },
    3: { station_number: 3, title: "Stase 3: Bedah Umum", case_title: "Vulnus Laceratum & Suturing", location: "Gedung Skill Lab Ruang 103" },
    4: { station_number: 4, title: "Stase 4: Neurologi", case_title: "Stroke Iskemik Akut", location: "Gedung Skill Lab Ruang 104" },
    5: { station_number: 5, title: "Stase 5: Penyakit Dalam", case_title: "Diabetes Melitus & Insulin", location: "Gedung Skill Lab Ruang 105" },
    6: { station_number: 6, title: "Stase 6: Otolaringologi", case_title: "Ekstraksi Serumen Telinga", location: "Gedung Skill Lab Ruang 106" },
  };

  const currentStationInfo = candidateStationSchedule[currentRound] || candidateStationSchedule[1];

  const [globalTimerState, setGlobalTimerState] = useState(null);

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

  // Real-time Timer & Session Status Subscription (WebSocket + Future Timestamp Sync)
  useEffect(() => {
    if (!sessionId) return;

    async function initTimer() {
      const stateData = await getSessionTimerState(sessionId);
      if (stateData) {
        setGlobalTimerState(stateData);
        if (stateData.round_number) setCurrentRound(stateData.round_number);

        const isPaused =
          stateData.phase === "paused" || sessionDetail?.status === "paused";
        const rem = calcRemaining(
          stateData.target_end_time,
          stateData.paused_remaining_ms,
          isPaused
        );
        setRoundSecondsLeft(rem);

        if (
          (sessionDetail?.status === "waiting_room" ||
            sessionDetail?.status === "published" ||
            sessionDetail?.status === "scheduled") &&
          (stateData.phase === "standby" || !stateData.phase)
        ) {
          setViewMode("waiting_room");
        } else if (stateData.phase === "transition" || stateData.phase === "initial_transition") {
          setViewMode("transit");
          setTransitSecondsLeft(rem);
        } else if (
          stateData.phase === "action" ||
          stateData.phase === "reading" ||
          stateData.phase === "paused"
        ) {
          setViewMode((prev) => {
            const isSubmitted = sessionId && localStorage.getItem(`osce_station_submitted_${sessionId}_round_${stateData.round_number || 1}`) === "true";
            if (isSubmitted && prev !== "station_completed_wait") {
              return "station_completed_wait";
            }
            return "live_round";
          });
        } else if (stateData.phase === "break") {
          setViewMode("round_break");
          setBreakSecondsLeft(rem);
        } else if (stateData.phase === "completed_waiting") {
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

        const isPaused =
          newTimerState.phase === "paused" || sessionDetail?.status === "paused";
        const rem = calcRemaining(
          newTimerState.target_end_time,
          newTimerState.paused_remaining_ms,
          isPaused
        );
        setRoundSecondsLeft(rem);

        if (
          (sessionDetail?.status === "waiting_room" ||
            sessionDetail?.status === "published" ||
            sessionDetail?.status === "scheduled") &&
          (newTimerState.phase === "standby" || !newTimerState.phase)
        ) {
          setViewMode("waiting_room");
        } else if (newTimerState.phase === "transition" || newTimerState.phase === "initial_transition") {
          setViewMode("transit");
          setTransitSecondsLeft(rem);
        } else if (
          newTimerState.phase === "action" ||
          newTimerState.phase === "reading" ||
          newTimerState.phase === "paused"
        ) {
          setViewMode((prev) => {
            const isSubmitted = sessionId && localStorage.getItem(`osce_station_submitted_${sessionId}_round_${newTimerState.round_number || 1}`) === "true";
            if (isSubmitted && prev !== "station_completed_wait") {
              return "station_completed_wait";
            }
            return "live_round";
          });
        } else if (newTimerState.phase === "break") {
          setViewMode("round_break");
          setBreakSecondsLeft(rem);
        } else if (newTimerState.phase === "completed_waiting") {
          setViewMode("completed");
        }
      },
      onSessionUpdate: (sess) => {
        if (sess && sess.id === sessionId) {
          setSessionDetail((prev) => (prev ? { ...prev, status: sess.status } : sess));
          if (sess.status === "completed" || sess.status === "finished") {
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

  // Live Timer 1-second Tick derived from global target_end_time
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

  // Audio Playback Triggers based on timer ticks & phase changes
  useEffect(() => {
    if (!sessionId || !globalTimerState) return;

    const phase = globalTimerState.phase;
    const isPaused = phase === "paused" || sessionDetail?.status === "paused";

    if (isPaused) {
      playOsceAudio("admin_broadcast");
      return;
    }

    const currentRem = viewMode === "live_round"
      ? roundSecondsLeft
      : viewMode === "transit"
      ? transitSecondsLeft
      : viewMode === "round_break"
      ? breakSecondsLeft
      : waitingCountdown;

    if (viewMode === "live_round") {
      if (currentRem === 120) playOsceAudio("warning_2min");
      if (currentRem === 60) playOsceAudio("warning_1min");
    }
  }, [sessionId, globalTimerState, viewMode, roundSecondsLeft, transitSecondsLeft, breakSecondsLeft, waitingCountdown, sessionDetail?.status]);

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function handleStartSimulationFromWaiting() {
    if (!isSessionLive) {
      setConfirmModal({
        isOpen: true,
        title: "Sesi Ujian Belum Dimulai",
        message: "Sesi ujian sirkuit ini belum diaktifkan secara live oleh Admin Control Room. Harap tunggu hingga Admin menekan tombol Start Live Ujian di Control Room.",
        confirmText: "Saya Mengerti (Menunggu Admin)",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }
    const currentPhase = globalTimerState?.phase;
    if (currentPhase === "initial_transition" || currentPhase === "transition") {
      setViewMode("transit");
    } else if (currentPhase === "break") {
      setViewMode("round_break");
    } else if (currentPhase === "completed_waiting" || currentPhase === "finished") {
      setViewMode("completed");
    } else {
      setViewMode("live_round");
      setExamStep(1);
    }
    setCurrentRound(globalTimerState?.round_number || 1);
  }

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
        setExamStep(1);
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
      sessionDetail?.status === "completed" ||
      sessionDetail?.status === "finished"
    ) {
      toast.info("Sesi OSCE telah diakhiri oleh Admin Control Room. Dialihkan ke Dashboard.", { duration: 5000 });
      navigate("/participant");
    } else if (
      globalTimerState.phase === "action" ||
      globalTimerState.phase === "reading" ||
      globalTimerState.phase === "running" ||
      globalTimerState.phase === "paused"
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

  function handleEnterLiveSession() {
    handleStartSimulationFromWaiting();
  }

  function handleFinishActiveRound() {
    if (currentRound >= totalRoundsInSession) {
      // Seluruh 6 Ronde Selesai -> Halaman Terimakasih Ujian
      setViewMode("completed");
    } else if (currentRound === breakAfterRound) {
      // Setelah Ronde 3 -> Masuk ke Waktu Istirahat Ronde (10 Menit)
      setViewMode("round_break");
      setBreakSecondsLeft(breakDurationSeconds);
    } else {
      // Ronde biasa -> Masuk ke Transisi Perpindahan Stase (2 Menit)
      setViewMode("transit");
      setTransitSecondsLeft(transitDurationSeconds);
    }
  }

  function handleStartNextRoundFromTransit() {
    const nextR = currentRound + 1;
    setCurrentRound(nextR);
    setViewMode("live_round");
    setExamStep(1);
    setRoundSecondsLeft(stationDurationSeconds);
    setWorkingDiagnosis("");
    setDifferentialDiagnosis("");
    setPrescriptionText("");
    setCheckedAuxiliaryIds([]);
  }

  function handleStartNextRoundFromBreak() {
    const nextR = currentRound + 1;
    setCurrentRound(nextR);
    setViewMode("live_round");
    setExamStep(1);
    setRoundSecondsLeft(stationDurationSeconds);
    setWorkingDiagnosis("");
    setDifferentialDiagnosis("");
    setPrescriptionText("");
    setCheckedAuxiliaryIds([]);
  }

  function requestNextStep(nextStepNumber) {
    setPendingNextStep(nextStepNumber);
    setIsConfirmModalOpen(true);
  }

  function confirmNextStep() {
    if (pendingNextStep) {
      if (pendingNextStep === 5) {
        performAutoSave({ current_step: 4, status: "submitted" });
        if (sessionId && currentRound) {
          localStorage.setItem(`osce_station_submitted_${sessionId}_round_${currentRound}`, "true");
        }
        setPendingNextStep(null);
        setIsConfirmModalOpen(false);

        // Middleware check: Jika timer stase global masih tersisa, kunci peserta di halaman station_completed_wait
        const isTimerStillRunning = roundSecondsLeft > 0 && globalTimerState?.phase !== "transition";
        if (isTimerStillRunning) {
          setViewMode("station_completed_wait");
        } else {
          handleFinishActiveRound();
        }
        return;
      }
      setExamStep(pendingNextStep);
      performAutoSave({ current_step: pendingNextStep, status: "in_progress" });
      setPendingNextStep(null);
    }
    setIsConfirmModalOpen(false);
  }

  function toggleAuxiliaryCheckbox(id) {
    if (checkedAuxiliaryIds.includes(id)) {
      setCheckedAuxiliaryIds(checkedAuxiliaryIds.filter((item) => item !== id));
    } else {
      setCheckedAuxiliaryIds([...checkedAuxiliaryIds, id]);
    }
  }

  function handleSubmitAuxiliaryRequests() {
    if (checkedAuxiliaryIds.length === 0) {
      setExamStep(4);
      performAutoSave({ current_step: 4, status: "in_progress" });
      return;
    }

    const indicatedResults = checkedAuxiliaryIds
      .map((id) => {
        const catalogInfo = allCatalogItems.find((i) => i.id === id);
        return {
          id,
          name: catalogInfo ? catalogInfo.name : id,
          category: catalogInfo ? catalogInfo.category : "PEMERIKSAAN",
          hasData: catalogInfo ? catalogInfo.hasData : true,
          imageUrl: catalogInfo ? catalogInfo.imageUrl : "",
          reportText: catalogInfo ? catalogInfo.reportText : `Hasil pemeriksaan ${catalogInfo ? catalogInfo.name : id} dalam batas normal.`,
        };
      })
      .filter((r) => r.hasData && (r.imageUrl || r.reportText));

    if (indicatedResults.length > 0) {
      setAuxiliaryResults(indicatedResults);
      setIsAuxiliaryResultOpen(true);
    } else {
      setExamStep(4);
      performAutoSave({ current_step: 4, status: "in_progress" });
    }
  }

  function handleFinishTransit() {
    setConfirmModal({
      isOpen: true,
      title: "Transisi Stase Selanjutnya",
      message: "Anda telah berpindah ke Stase 2 (Pulmonologi)! Sesi ujian berikutnya akan dimulai.",
      confirmText: "Lanjut ke Stase 2",
      variant: "info",
      isAlert: true,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        navigate("/participant");
      },
    });
  }

  function handleExitWaitingRoom() {
    setConfirmModal({
      isOpen: true,
      title: "Keluar dari Waiting Room?",
      message: "Apakah Anda yakin ingin keluar dari Waiting Room sesi ujian ini dan kembali ke Dashboard Peserta?",
      confirmText: "Ya, Keluar Waiting Room",
      cancelText: "Batal",
      variant: "danger",
      isAlert: false,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        navigate("/participant");
      },
    });
  }

  /* ============================================================
     GUARD CHECK: PESERTA HANYA BISA MASUK KIOSK JIKA STATUS APPROVAL === 'approved'
  ============================================================ */
  if (candidateApprovalStatus === "pending" || candidateApprovalStatus === "rejected") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl text-center space-y-6 animate-in fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg">
            {candidateApprovalStatus === "rejected" ? (
              <XCircle size={32} className="text-red-400" />
            ) : (
              <Hourglass size={32} className="animate-spin" />
            )}
          </div>

          <div className="space-y-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider inline-block ${
                candidateApprovalStatus === "rejected"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              Akses Sesi Ujian Terkunci
            </span>
            <h2 className="text-xl font-extrabold text-white">
              {candidateApprovalStatus === "rejected"
                ? "Pendaftaran Ditolak Admin"
                : "Menunggu Approval Admin"}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {candidateApprovalStatus === "rejected"
                ? "Maaf, pendaftaran Anda pada sesi ini tidak disetujui oleh Panitia Ujian OSCE."
                : "Status pendaftaran Anda pada sesi ini saat ini adalah MENUNGGU VERIFIKASI ADMIN. Anda belum dapat mengakses sesi ujian sampai Admin menyetujui pendaftaran Anda di Dashboard Administrator."}
            </p>
          </div>

          <button
            onClick={() => navigate("/participant")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-600/30 transition active:scale-95"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard Portal Peserta
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER VIEW 1: RUANG TUNGGU PESERTA (PRE-EXAM WAITING ROOM)
  ============================================================ */
  if (viewMode === "waiting_room") {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col relative">

        {/* Top Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-3.5 shadow-2xs">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Waiting Room OSCE</span>
            </div>

            {isSessionLive ? (
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-900 flex items-center gap-1.5 animate-pulse">
                <Activity size={14} className="text-emerald-700" />
                Sesi Berlangsung
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Hourglass size={14} className="text-amber-700" />
                Menunggu Admin Mulai
              </span>
            )}
          </div>
        </header>

        {/* Waiting Room Body */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 my-auto space-y-6">

          {/* OSCE Session Master Overview Card */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="rounded-md bg-blue-500/30 border border-blue-400/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-200 tracking-wider">
                    Informasi Sesi
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Realtime
                  </span>
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-white mt-1.5 sm:text-2xl">
                  {sessionDetail?.title || "Ujian OSCE Terpadu Klinik - Sirkuit Terstandar"}
                </h1>
                <p className="text-xs text-blue-200/90 font-medium leading-relaxed mt-1">
                  {sessionDetail?.description || "Simulasi ujian sirkuit rotasi stase medis terpadu sesuai standar kompetensi SKDI."}
                </p>
              </div>
            </div>

            {/* Quick Session Details Pill Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Lokasi & Gedung</span>
                <span className="font-extrabold text-white text-xs mt-0.5 block truncate">
                  {sessionDetail?.location_building || "Gedung Skill Lab Kedokteran"}
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Tanggal Ujian</span>
                <span className="font-extrabold text-white text-xs mt-0.5 block">
                  {sessionDetail?.session_date || "15 Agustus 2026"}
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Jumlah Stase Pos</span>
                <span className="font-extrabold text-white text-xs mt-0.5 block">
                  {sessionDetail?.total_stations || 6} Stase Rotasi
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Durasi Stase</span>
                <span className="font-extrabold text-white text-xs mt-0.5 block">
                  {sessionDetail?.station_duration_minutes || 12} Menit / Rotasi
                </span>
              </div>
            </div>
          </div>

          {/* Embedded Participant Personal Schedule Widget */}
          <ParticipantPersonalScheduleWidget sessionId={sessionId} participantUserId={user?.id} activeRound={currentRound} />

            {/* Live Online Users List Widget */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-blue-600" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Peserta Terhubung
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-bold text-emerald-900 flex items-center gap-1.5 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {onlineUsers.length} Online
                </span>
              </div>

              {onlineUsers.length > 0 ? (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {onlineUsers.map((u, idx) => (
                    <div
                      key={u.user_id || idx}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs"
                    >
                      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-extrabold text-xs border border-blue-200">
                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">{u.full_name}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {u.role === "examiner"
                            ? `Dokter Penguji ${u.specialty ? `• ${u.specialty}` : ""}`
                            : u.role === "admin"
                            ? "Admin Control Room"
                            : "Peserta Ujian"}
                        </p>
                      </div>

                      <span
                        className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase shrink-0 ${
                          u.role === "examiner"
                            ? "bg-purple-100 text-purple-900 border border-purple-300"
                            : u.role === "admin"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-blue-100 text-blue-900 border border-blue-300"
                        }`}
                      >
                        {u.role === "examiner" ? "Penguji" : u.role === "admin" ? "Admin" : "Peserta"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium italic">
                  Memuat peserta & penguji terhubung di ruang tunggu...
                </p>
              )}
            </div>

            {/* Action CTA to Enter Live Session */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                <Volume2 size={16} className="text-blue-600 animate-pulse" />
                <span>
                  {isSessionLive
                    ? "Bel penanda ronde akan berbunyi saat waktu persiapan habis."
                    : "Sesi otomatis ter-refresh setiap 3 detik menunggu aba-aba Admin Control Room."}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleExitWaitingRoom}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100 px-6 py-3.5 text-xs font-bold text-rose-700 transition active:scale-95 shadow-2xs"
                >
                  <LogOut size={16} />
                  Keluar
                </button>
                <button
                  onClick={handleStartSimulationFromWaiting}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-xs font-bold text-white shadow-lg transition active:scale-95 ${
                    isSessionLive
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 animate-pulse"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
                  }`}
                >
                  <Play size={16} />
                  Masuk
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </main>

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
      </div>
    );
  }

  /* ============================================================
     RENDER VIEW 2: RUANG TRANSIT PERPINDAHAN STASE (TRANSIT WAITING ROOM - 2 MINS)
  ============================================================ */
  if (viewMode === "transit") {
    const isInitialStartTransition = globalTimerState?.phase === "initial_transition";

    const targetRoundNumber = isInitialStartTransition
      ? 1
      : Math.min(totalRoundsInSession, (globalTimerState?.round_number || currentRound) + 1);

    const totalStationsCount = sessionDetail?.total_stations || dbStations?.length || 4;
    const targetStationNum = ((myStartingStation - 1 + (targetRoundNumber - 1)) % totalStationsCount) + 1;

    const nextSt = dbStations.find((s) => Number(s.station_number) === targetStationNum);
    const isNextBreak = Boolean(
      nextSt?.is_break ||
      nextSt?.title?.toLowerCase().includes("istirahat") ||
      nextSt?.title?.toLowerCase().includes("break") ||
      nextSt?.case_title?.toLowerCase().includes("istirahat")
    );

    const nextStationInfo = {
      station_number: targetStationNum,
      is_break: isNextBreak,
      title: nextSt?.title || (isNextBreak ? `Stase ${targetStationNum}: Istirahat` : `Stase ${targetStationNum}: Klinis Terpadu`),
      case_title: nextSt?.case_title || (isNextBreak ? "Rotasi Istirahat (Stase Istirahat)" : "Evaluasi Skenario SKDI"),
      location: sessionDetail?.location_building ? `${sessionDetail.location_building} Ruang 10${targetStationNum}` : `Gedung Skill Lab Ruang 10${targetStationNum}`,
    };

    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-2xs">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Hourglass size={15} className="text-amber-700 animate-pulse" />
              Transisi Perpindahan Stase (Jeda 2 Menit)
            </span>

            <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-1.5 text-amber-900">
              <Clock size={16} className="text-amber-700 animate-pulse" />
              <span className="text-[11px] font-bold uppercase">Sisa Waktu Transisi:</span>
              <span className="text-base font-black font-mono">{formatTime(transitSecondsLeft)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-3xl w-full mx-auto p-6 my-auto space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <RotateCw size={32} className="animate-spin" />
            </div>

            <div>
              <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
                {targetRoundNumber === 1 ? "Persiapan Pos Stase 1" : `Ronde ${currentRound} Selesai`}
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-3">
                Waktu Transisi! Silakan Berpindah Ruangan
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Anda sedang dalam jeda transisi (2 menit). Berjalanlah menuju ruangan stase berikutnya sesuai rotasi sirkuit Anda.
              </p>
            </div>

            {/* Target Next Station Card */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <span className="rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-black text-white uppercase">
                  Target Ronde {targetRoundNumber}: Stase {nextStationInfo.station_number} {nextStationInfo.is_break ? "(ISTIRAHAT)" : ""}
                </span>
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  <MapPin size={14} className="text-blue-600" />
                  {nextStationInfo.location}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {`Stase ${nextStationInfo.station_number}${nextStationInfo.is_break ? " (Istirahat)" : ""}`}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Persiapkan diri Anda sebelum masuk ke ruang stase rotasi berikutnya.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  setCurrentRound(targetRoundNumber);
                  setViewMode("live_round");
                  setExamStep(1);
                  setRoundSecondsLeft(stationDurationSeconds);
                }}
                disabled={isSessionLive && transitSecondsLeft > 0}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-xs font-bold text-white shadow-lg transition ${
                  isSessionLive && transitSecondsLeft > 0
                    ? "bg-slate-400 cursor-not-allowed opacity-80"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 active:scale-95 cursor-pointer"
                }`}
              >
                <ArrowRight size={16} />
                {isSessionLive && transitSecondsLeft > 0
                  ? `Menunggu Bel Transisi Selesai (${formatTime(transitSecondsLeft)})`
                  : `Lanjut Masuk Ronde ${targetRoundNumber}`}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
     RENDER VIEW 3: RUANG ISTIRAHAT RONDE (ROUND BREAK - 10 MINS)
  ============================================================ */
  if (viewMode === "round_break") {
    const nextRoundNumber = currentRound + 1;
    const totalStationsCount = sessionDetail?.total_stations || dbStations?.length || 4;
    const nextStationNum = ((myStartingStation - 1 + (nextRoundNumber - 1)) % totalStationsCount) + 1;

    const nextSt = dbStations.find((s) => Number(s.station_number) === nextStationNum);
    const isNextBreak = Boolean(
      nextSt?.is_break ||
      nextSt?.title?.toLowerCase().includes("istirahat") ||
      nextSt?.title?.toLowerCase().includes("break") ||
      nextSt?.case_title?.toLowerCase().includes("istirahat")
    );

    const nextStationInfo = {
      station_number: nextStationNum,
      is_break: isNextBreak,
      title: nextSt?.title || (isNextBreak ? `Stase ${nextStationNum}: Istirahat` : `Stase ${nextStationNum}: Klinis Terpadu`),
      case_title: nextSt?.case_title || (isNextBreak ? "Rotasi Istirahat (Stase Istirahat)" : "Evaluasi Skenario SKDI"),
      location: sessionDetail?.location_building ? `${sessionDetail.location_building} Ruang 10${nextStationNum}` : `Gedung Skill Lab Ruang 10${nextStationNum}`,
    };

    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-2xs">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <span className="rounded-full bg-amber-400 text-amber-950 px-3 py-1 text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
              <Coffee size={15} />
              Sesi Istirahat Ronde (Jeda 10 Menit)
            </span>

            <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-1.5 text-amber-900">
              <Clock size={16} className="text-amber-700 animate-pulse" />
              <span className="text-[11px] font-bold uppercase">Sisa Waktu Istirahat:</span>
              <span className="text-base font-black font-mono">{formatTime(breakSecondsLeft)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-3xl w-full mx-auto p-6 my-auto space-y-6">
          <div className="rounded-3xl border border-amber-300 bg-amber-50/80 p-8 shadow-xl space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-200 text-amber-900">
              <Coffee size={34} />
            </div>

            <div>
              <span className="rounded-full bg-amber-200 text-amber-950 px-3.5 py-1 text-xs font-black uppercase tracking-wider">
                Istirahat Sirkuit Berlangsung
              </span>
              <h1 className="text-2xl font-black text-amber-950 mt-3">
                Saatnya Istirahat Sejenak (10 Menit)
              </h1>
              <p className="text-xs text-amber-900 mt-1 max-w-md mx-auto">
                Anda telah menyelesaikan 3 ronde ujian. Manfaatkan waktu ini untuk minum, relaksasi, dan bersiap menuju 3 ronde berikutnya.
              </p>
            </div>

            {/* Target Next Station Card */}
            <div className="rounded-2xl border border-amber-300 bg-white p-6 text-left space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <span className="rounded-md bg-amber-500 px-2.5 py-1 text-[10px] font-black text-amber-950 uppercase">
                  Ronde Selanjutnya: Ronde {nextRoundNumber}
                </span>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <MapPin size={14} className="text-amber-600" />
                  {nextStationInfo.location}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {nextStationInfo.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Materi Kasus: <strong>{nextStationInfo.case_title}</strong>
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={handleStartNextRoundFromBreak}
                disabled={isSessionLive && globalTimerState?.phase === "transition" && roundSecondsLeft > 0}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-xs font-extrabold text-white shadow-lg transition ${
                  isSessionLive && globalTimerState?.phase === "transition" && roundSecondsLeft > 0
                    ? "bg-slate-400 cursor-not-allowed opacity-80"
                    : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30 active:scale-95"
                }`}
              >
                <ArrowRight size={16} />
                {isSessionLive && globalTimerState?.phase === "transition" && roundSecondsLeft > 0
                  ? `Menunggu Bel Transisi Selesai (${formatTime(roundSecondsLeft)})`
                  : `Mulai Ronde ${nextRoundNumber} (${nextStationInfo.title})`}
              </button>
            </div>
          </div>
        </main>

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
      </div>
    );
  }

  /* ============================================================
     RENDER VIEW 4: HALAMAN TERIMAKASIH MENGIKUTI UJIAN (COMPLETED - DINAMIS)
  ============================================================ */
  if (viewMode === "completed" || sessionDetail?.status === "completed" || sessionDetail?.status === "finished") {
    const completedDate = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 my-auto space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xl space-y-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="relative inline-block">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30">
                <Award size={52} className="animate-bounce" />
              </div>
              <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
                <CheckCircle2 size={16} />
              </span>
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-4 py-1 text-xs font-black text-emerald-900 uppercase tracking-wider">
                <ShieldCheck size={14} className="text-emerald-700" />
                Sesi Ujian OSCE Selesai & Ter-Enkripsi
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
                Terima Kasih Telah Mengikuti Ujian OSCE!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
                Selamat! Anda telah menyelesaikan seluruh <strong className="text-slate-900">{totalRoundsInSession} ronde rotasi sirkuit stase</strong> pada sesi <strong className="text-slate-900">{sessionDetail?.title || "OSCE MedSkill"}</strong>. Seluruh lembar jawaban Anda telah tersimpan secara permanen.
              </p>
            </div>

            {/* Dynamic Session Summary Cards */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Sesi Ujian</span>
                <p className="font-extrabold text-slate-900 text-xs truncate">{sessionDetail?.title || "Ujian OSCE Sirkuit"}</p>
                <span className="text-[10px] text-slate-500 font-medium block">{sessionDetail?.code || "SKDI-2026"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Ronde Selesai</span>
                <p className="font-extrabold text-emerald-700 text-xs">{totalRoundsInSession} / {totalRoundsInSession} Stase</p>
                <span className="text-[10px] text-emerald-600 font-bold block">100% Lembar Terisi</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Waktu Selesai</span>
                <p className="font-extrabold text-slate-900 text-xs">{completedDate}</p>
                <span className="text-[10px] text-slate-500 font-medium block">{sessionDetail?.location_building || "Gedung Skill Lab"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Status Evaluasi</span>
                <p className="font-extrabold text-blue-800 text-xs">Umpan Balik Penguji</p>
                <span className="text-[10px] text-blue-600 font-medium block">Sedang Rekapitulasi</span>
              </div>
            </div>

            {/* Information Banner */}
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 max-w-2xl mx-auto text-left text-xs text-blue-900 flex items-start gap-3">
              <FileCheck2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-blue-950">Informasi Hasil & Rekapitulasi Nilai:</p>
                <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                  Nilai akhir, rubrik penguji, serta feedback spesifik tiap stase akan dipublikasikan oleh Panitia Akademik melalui menu <strong>Riwayat & Transkrip Ujian</strong> setelah proses penilaian seluruh peserta selesai disetujui.
                </p>
              </div>
            </div>

            {/* Dynamic Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/participant")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition"
              >
                <ArrowLeft size={16} />
                Kembali ke Dashboard Utama
              </button>
              <button
                onClick={() => navigate("/participant/history")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition"
              >
                <FileCheck2 size={16} className="text-blue-600" />
                Lihat Riwayat & Transkrip Ujian
              </button>
            </div>
          </div>
        </main>

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
      </div>
    );
  }

  /* ============================================================
     RENDER VIEW 5: RUANG UJIAN LIVE MULTI-STEP (LIVE ROUND EXAM)
  ============================================================ */
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Floating Broadcast Toast Overlay Component (Auto 5s & X Close Button) */}
      {activeBroadcast && (
        <div className="fixed top-5 right-5 z-[9999] max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex items-start justify-between gap-3 rounded-2xl border-2 border-indigo-500 bg-slate-900 p-4 text-white shadow-2xl backdrop-blur-md">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                <Megaphone size={20} className="animate-bounce text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-indigo-300">
                  <BellRing size={12} className="text-amber-400" />
                  <span>Pengumuman Broadcast Admin</span>
                  <span>•</span>
                  <span>{activeBroadcast.time}</span>
                </div>
                <p className="font-bold text-xs text-slate-100 mt-1 leading-snug break-words">
                  "{activeBroadcast.message}"
                </p>
                <span className="text-[10px] text-slate-400 font-bold block mt-1">
                  Target: Peserta Ujian
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveBroadcast(null)}
              title="Tutup Pesan (Close)"
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
              RONDE {currentRound} / {totalRoundsInSession}
            </span>
            <span className="text-xs font-bold text-slate-900 hidden sm:inline">
              {activeStationInfo.title}
            </span>
          </div>

          {/* Stepped Progress Indicator Banner */}
          {viewMode === "station_completed_wait" ? (
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Stase {activeStationInfo.station_number} Selesai • Menunggu Bel Rotasi
            </span>
          ) : activeStationInfo.is_break ? (
            <div className="flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1 text-xs font-black text-emerald-900 shadow-2xs">
              <Coffee size={14} className="text-emerald-600 animate-pulse" />
              <span>STASE ISTIRAHAT (TANPA LEMBAR UJIAN)</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold">
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${examStep === 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                1. Anamnesis
              </span>
              <span className="text-slate-400 font-normal">›</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${examStep === 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                2. Fisik
              </span>
              <span className="text-slate-400 font-normal">›</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${examStep === 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                3. Penunjang
              </span>
              <span className="text-slate-400 font-normal">›</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${examStep === 4 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                4. Diagnosis & Resep
              </span>
            </div>
          )}

          {/* Sub-Timer Circuit Phase Banner */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 ${
              globalTimerState?.phase === "paused" || sessionDetail?.status === "paused"
                ? "border-amber-300 bg-amber-50 text-amber-900"
                : globalTimerState?.phase === "transition"
                ? "border-amber-400 bg-amber-500 text-slate-950 font-black animate-pulse shadow-md"
                : globalTimerState?.phase === "break"
                ? "border-blue-300 bg-blue-50 text-blue-950 font-bold"
                : "border-emerald-200 bg-emerald-50 text-emerald-950 font-bold"
            }`}>
              <Clock size={16} className={globalTimerState?.phase === "paused" ? "text-amber-600" : "animate-pulse"} />
              <span className="text-[11px] font-bold uppercase hidden sm:inline">
                {globalTimerState?.phase === "paused" || sessionDetail?.status === "paused"
                  ? "Timer Paused Admin:"
                  : globalTimerState?.phase === "transition"
                  ? "Transisi Pergerakan Pos:"
                  : globalTimerState?.phase === "break"
                  ? "Waktu Istirahat Ronde:"
                  : "Stase Ujian Live:"}
              </span>
              <span className="text-sm font-black font-mono">{formatTime(roundSecondsLeft)}</span>
              {(globalTimerState?.phase === "paused" || sessionDetail?.status === "paused") && (
                <span className="rounded bg-amber-600 px-1.5 py-0.5 text-[9px] font-black text-white uppercase ml-1 animate-pulse">
                  PAUSED
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace: Clean Centered View for station_completed_wait OR Asymmetric Grid Layout for Live Exam */}
      {viewMode === "station_completed_wait" ? (
        <main className="flex-1 max-w-3xl w-full mx-auto p-6 my-auto flex items-center justify-center">
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 sm:p-12 text-center shadow-xl space-y-6 w-full">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={44} className="animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-4 py-1 text-xs font-black text-emerald-900 uppercase tracking-wider">
                <Lock size={12} className="text-emerald-700" />
                Jawaban Stase {activeStationInfo.station_number} Dikirim & Terkunci
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 pt-1">
                Terima Kasih! Lembar Jawaban Stase Telah Tersimpan
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                Anda telah menyelesaikan pengerjaan <strong className="text-slate-900">Stase {activeStationInfo.station_number}</strong>. Seluruh data jawaban Anda telah aman tersimpan di server.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-6 max-w-md mx-auto shadow-sm space-y-2 border-dashed">
              <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-slate-500">
                <Clock size={16} className="text-emerald-600 animate-pulse" />
                <span>SISA WAKTU STASE INI</span>
              </div>
              <p className="text-4xl sm:text-5xl font-black font-mono text-emerald-700">
                {formatTime(roundSecondsLeft)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Menunggu waktu sisa stase berakhir untuk perpindahan masal...
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 max-w-md mx-auto text-left text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-extrabold text-amber-950">Petunjuk Menunggu Bel Rotasi:</p>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Harap tetap berada di area stase. Saat timer sisa stase habis, sistem akan membunyikan bel transisi dan membuka Halaman Transisi Perpindahan Stase secara otomatis.
                </p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid gap-6 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN (4 COLS): COMPACT CLINICAL SCENARIO & INSTRUCTIONS REFERENCE PANEL */}
          <div className="lg:col-span-4 space-y-4">
            {/* Station Title Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Stase Ujian Live
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Penguji: <strong>{activeStationInfo.examiner_name}</strong>
                </span>
              </div>

              <h1 className="text-sm font-extrabold text-slate-900 leading-snug">
                {`Stase ${activeStationInfo.station_number}${activeStationInfo.is_break ? " (Istirahat)" : ""}`}
              </h1>
            </div>

            {/* Skenario Kasus Medis */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Skenario Kasus Medis
              </h2>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                {activeStationInfo.scenario}
              </div>
            </div>

            {/* Instruksi Peserta Ujian */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Instruksi Peserta Ujian
              </h2>
              <div className="space-y-2 text-xs text-slate-700 font-medium">
                {activeStationInfo.participant_instructions.map((inst, idx) => (
                  <div key={idx} className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 flex items-start gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] leading-snug">{inst}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (8 COLS): PRIMARY EXAM WORKSPACE (FOKUS UJIAN) */}
          <div className="lg:col-span-8 space-y-6">
            {activeStationInfo.is_break ? (
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 text-center shadow-lg space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                <Coffee size={40} className="animate-bounce text-emerald-600" />
              </div>

              <div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-1 text-xs font-black uppercase tracking-wider">
                  STASE ISTIRAHAT (REST STATION)
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-3">
                  Waktu Istirahat Ronde {currentRound}
                </h2>
                <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Anda sedang berada di Stase Istirahat. Tidak ada pengujian keterampilan atau pengisian jawaban pada stase ini. Silakan gunakan waktu ini untuk memulihkan stamina sebelum lanjut ke stase pengujian berikutnya.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-white p-5 max-w-md mx-auto shadow-2xs space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                  <Clock size={16} className="text-emerald-600" />
                  <span>SISA WAKTU ISTIRAHAT STASE</span>
                </div>
                <p className="text-4xl font-black font-mono text-emerald-700">
                  {formatTime(roundSecondsLeft)}
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleFinishActiveRound}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-8 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30 transition active:scale-95"
                >
                  <span>Selesaikan Stase Istirahat & Lanjut Transisi</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
          {examStep === 1 && (
            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    Tahap 1 dari 4
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-1 uppercase tracking-wider">
                    Pengujian Anamnesis
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Halaman pengenalan kasus dan alur pengujian anamnesis peserta secara offline.
                  </p>
                </div>
              </div>

              {/* Case Introduction & Anamnesis Protocol Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Panduan Anamnesis Peserta Ujian
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Lakukan wawancara anamnesis terarah langsung kepada Pasien Standar / Simulator di ruangan mengenai keluhan utama nyeri dada pasien (Onset, Lokasi, Kualitas, Radiasi, dan Faktor Pemberat/Peringan).
                </p>

                <div className="rounded-lg bg-blue-50 border border-blue-100 p-3.5 text-xs text-blue-900 space-y-1">
                  <p className="font-bold">Petunjuk Pengerjaan Offline:</p>
                  <p className="text-[11px] leading-relaxed">
                    Penguji akan mengamati dan menilai komunikasi klinis Anda secara langsung. Setelah selesai menyampaikan anamnesis, silakan tekan tombol di bawah ini untuk berpindah ke tahapan Pemeriksaan Fisik.
                  </p>
                </div>
              </div>

              {/* Navigation Action CTA */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => requestNextStep(2)}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
                >
                  Lanjut ke Pemeriksaan Fisik
                </button>
              </div>
            </div>
          )}

          {/* HALAMAN 2: PENGUJIAN PEMERIKSAAN FISIK */}
          {examStep === 2 && (
            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    Tahap 2 dari 4
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-1 uppercase tracking-wider">
                    Pengujian Pemeriksaan Fisik
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Instruksi soal kedua dan panduan prosedur pemeriksaan fisik pasien.
                  </p>
                </div>
              </div>

              {/* Physical Exam Instructions Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Instruksi & Prosedur Pemeriksaan Fisik
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Lakukan prosedur pemeriksaan fisik terarah sesuai instruksi kasus pada Pasien Standar di ruangan.
                </p>

                <div className="rounded-lg bg-blue-50 border border-blue-100 p-3.5 text-xs text-blue-900 space-y-1">
                  <p className="font-bold">Panduan Prosedur:</p>
                  <p className="text-[11px] leading-relaxed">
                    Sampaikan permintaan pemeriksaan fisik secara langsung kepada Pasien Standar di ruangan.
                  </p>
                </div>
              </div>

              {/* Navigation Action CTA */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => requestNextStep(3)}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
                >
                  Lanjut ke Pemeriksaan Penunjang
                </button>
              </div>
            </div>
          )}

          {/* HALAMAN 3: PENGUJIAN PEMERIKSAAN PENUNJANG (FULL GRID CHECKLIST FORM) */}
          {examStep === 3 && (
            <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-xs space-y-6">
              {/* Header Title */}
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                    Tahap 3 dari 4
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-1 uppercase tracking-wider">
                    Pengujian Pemeriksaan Penunjang
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Centang jenis pemeriksaan penunjang yang diindikasikan untuk mengajukan dan membuka berkas hasil medis.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold px-3 py-1">
                    {checkedAuxiliaryIds.length} Dipilih
                  </span>
                  {checkedAuxiliaryIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCheckedAuxiliaryIds([])}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Control Topbar (Searchbar & Dropdown Category Filter) */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                {/* Searchbar Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari pemeriksaan (Thorax, EKG, Troponin, CBC)..."
                    value={auxSearchQuery}
                    onChange={(e) => setAuxSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none transition"
                  />
                  {auxSearchQuery && (
                    <button
                      onClick={() => setAuxSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown Category Filter */}
                <div className="flex items-center gap-2 min-w-[180px]">
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-500 focus:outline-none transition cursor-pointer"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="RADIOLOGI">Radiologi</option>
                    <option value="HEMATOLOGI">Hematologi</option>
                    <option value="ENZIM">Enzim / Biomarker</option>
                    <option value="LAIN-LAIN">Lain-Lain (EKG, dll.)</option>
                  </select>
                </div>
              </div>

              {/* Full Width Grid Checklist Area */}
              <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                {filteredCatalog.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    Pemeriksaan "{auxSearchQuery}" tidak ditemukan.
                  </div>
                ) : (
                  filteredCatalog.map((cat) => {
                    const isExpanded = expandedCategories[cat.category] ?? true;

                    return (
                      <div
                        key={cat.category}
                        className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden"
                      >
                        {/* Accordion Category Header */}
                        <div
                          onClick={() =>
                            setExpandedCategories((prev) => ({
                              ...prev,
                              [cat.category]: !isExpanded,
                            }))
                          }
                          className="flex items-center justify-between bg-slate-100/80 px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            {isExpanded ? (
                              <ChevronDown size={16} className="text-slate-500" />
                            ) : (
                              <ChevronRight size={16} className="text-slate-500" />
                            )}
                            <span className="text-xs font-black tracking-wider text-slate-900">
                              {cat.category}
                            </span>
                          </div>
                        </div>

                        {/* Accordion Items Body (2-Column Grid Style) */}
                        {isExpanded && (
                          <div className="p-4 space-y-4 border-t border-slate-100 bg-slate-50/40">
                            {cat.subcategories.map((sub, sIdx) => (
                              <div key={sIdx} className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200/60 pb-1">
                                  {sub.name}
                                </span>

                                <div className="grid gap-2.5 sm:grid-cols-2">
                                  {sub.items.map((item) => {
                                    const isChecked = checkedAuxiliaryIds.includes(item.id);
                                    return (
                                      <label
                                        key={item.id}
                                        className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-medium cursor-pointer transition ${
                                          isChecked
                                            ? "border-indigo-500 bg-indigo-50/80 text-indigo-950 font-extrabold shadow-2xs"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => toggleAuxiliaryCheckbox(item.id)}
                                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                                        />
                                        <span className="leading-snug flex-1">{item.name}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Navigation Action CTA */}
              <div className="pt-2 flex justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSubmitAuxiliaryRequests}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
                >
                  <span>Lanjutkan ke Diagnosis & Resep</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* HALAMAN 4: PENGUJIAN DIAGNOSIS & RESEP (HALAMAN TERAKHIR STASE) */}
          {examStep === 4 && (
            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    Tahap 4 dari 4 (Terakhir)
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-1 uppercase tracking-wider">
                    Pengujian Diagnosis & Resep Obat
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Isi lembar jawaban diagnosis dan resep obat di bawah ini.
                  </p>
                </div>
              </div>

              {/* 1. Form Diagnosis Banding */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  1. Diagnosis Banding
                </label>
                <textarea
                  rows={4}
                  value={differentialDiagnosis}
                  onChange={(e) => setDifferentialDiagnosis(e.target.value)}
                  placeholder={"1. [Diagnosis Banding 1]\n2. [Diagnosis Banding 2]\n3. [Diagnosis Banding 3]"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition font-medium leading-relaxed"
                />
              </div>

              {/* 2. Form Diagnosis Kerja */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  2. Diagnosis Kerja
                </label>
                <textarea
                  rows={3}
                  value={workingDiagnosis}
                  onChange={(e) => setWorkingDiagnosis(e.target.value)}
                  placeholder="1. [Diagnosis Kerja Utama]"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition font-semibold leading-relaxed"
                />
              </div>

              {/* 3. Form Penulisan Resep Obat */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>3. Penulisan Resep Obat</span>
                  <span className="text-[10px] font-semibold text-slate-400">Format R/, Signa, Dosis</span>
                </label>
                <textarea
                  rows={5}
                  value={prescriptionText}
                  onChange={(e) => setPrescriptionText(e.target.value)}
                  placeholder="R/ Nama obat, dosis, jumlah&#10;S Signa cara aturan pakai..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-mono focus:border-blue-500 focus:bg-white focus:outline-none transition leading-relaxed"
                />
              </div>

              {/* Finish Station CTA Card */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                <div>
                  <p className="font-bold text-xs text-emerald-900">Selesaikan Stase {activeStationInfo.station_number}</p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Pastikan lembar jawaban diagnosis dan resep obat telah diisi dengan benar sebelum menyelesaikan stase.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => requestNextStep(5)}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
                >
                  Selesaikan Stase Ini
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </main>
  )}

      {/* MODAL 1: DISPLAY HASIL BERKAS PEMERIKSAAN PENUNJANG */}
      <AuxiliaryExamResultModal
        isOpen={isAuxiliaryResultOpen}
        onClose={() => setIsAuxiliaryResultOpen(false)}
        results={auxiliaryResults}
        onConfirmNext={() => requestNextStep(4)}
      />

      {/* MODAL 2: KONFIRMASI PERPINDAHAN TAHAP UJIAN (CLEAN MINIMALIST MODAL) */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Konfirmasi Perpindahan Tahap
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Navigasi Ujian One-Way Forward</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 space-y-2">
              <p className="font-bold text-slate-900">
                Perhatian: Anda tidak dapat kembali (no back button) ke tahap ini setelah melanjutkan.
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {pendingNextStep === 5
                  ? `Apakah Anda yakin ingin menyelesaikan Stase ${activeStationInfo.station_number} dan masuk ke Ruang Tunggu Perpindahan Stase?`
                  : `Apakah Anda sudah selesai dan yakin ingin melanjutkan ke Tahap ${pendingNextStep}?`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmNextStep}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ANTI-CHEATING TAB SWITCH & FULLSCREEN WARNING */}
      {showCheatingWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="max-w-lg w-full rounded-3xl border border-red-500 bg-slate-950 p-7 text-center space-y-5 shadow-2xl text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40">
              <AlertTriangle size={36} className="animate-bounce" />
            </div>
            <div className="space-y-2">
              <span className="rounded-full bg-red-500/20 border border-red-400/40 px-3 py-1 text-[11px] font-black text-red-300 uppercase tracking-wider">
                Peringatan Keamanan Ujian Sirkuit
              </span>
              <h3 className="text-lg font-black text-white">
                Perpindahan Tab / Window Terdeteksi!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Sistem pengawas mendeteksi Anda meninggalkan atau berpindah tab browser (Pelanggaran Ke-{tabSwitchCount}). Percobaan ini telah dicatat dan dilaporkan secara otomatis ke Sistem Pengawas Ujian OSCE.
              </p>
            </div>

            <button
              onClick={() => {
                setShowCheatingWarning(false);
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-500 px-6 py-3.5 text-xs font-bold text-white shadow-xl shadow-red-600/40 transition active:scale-95"
            >
              Saya Mengerti & Kembali ke Layar Ujian Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN NON-CLOSABLE OVERLAY WHEN OSCE SESSION IS PAUSED BY ADMIN */}
      {(globalTimerState?.phase === "paused" || globalTimerState?.phase?.startsWith("paused") || sessionDetail?.status === "paused") && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 animate-in fade-in duration-200 select-none pointer-events-auto">
          <div className="max-w-md w-full rounded-3xl border border-amber-500/50 bg-slate-900 p-8 text-center space-y-6 shadow-2xl text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
              <PauseCircle size={48} className="animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-3.5 py-1 text-[11px] font-black text-amber-300 uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                Sesi Dihentikan Sementara
              </span>
              <h2 className="text-xl font-black text-white pt-1">
                Sesi OSCE Sedang Diberhentikan Sementara
              </h2>
              <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-sm mx-auto">
                Panitia Control Room sedang mem-pause timer ujian. Harap tetap tenang, berada di posisi stase Anda, dan menunggu pengumuman selanjutnya.
              </p>
            </div>

            {/* Status Posisi Saat Ini */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left space-y-1">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                Posisi Stase & Fase Saat Ini:
              </span>
              <p className="text-sm font-extrabold text-white">
                {globalTimerState?.phase === "paused_initial_transition"
                  ? "Transisi Awal & Persiapan Pos Stase 1"
                  : globalTimerState?.phase === "paused_transition"
                  ? `Transisi Perpindahan Pos Stase (Ronde ${currentRound} → ${currentRound + 1})`
                  : globalTimerState?.phase === "paused_break"
                  ? `Jeda Istirahat Ronde ${currentRound}`
                  : `Sesi Ujian Stase: ${assignedStation?.station_name || `Stase Ronde ${currentRound}`}`}
              </p>
              <p className="text-xs text-slate-300 font-medium">
                {globalTimerState?.phase === "paused_initial_transition"
                  ? "Peserta berada di pintu masuk / depan pos stase 1 menunggu dimulainya ujian."
                  : globalTimerState?.phase === "paused_transition"
                  ? `Peserta sedang dalam proses perpindahan menuju stase ronde ${currentRound + 1}.`
                  : globalTimerState?.phase === "paused_break"
                  ? "Peserta berada di ruang jeda istirahat."
                  : `Peserta berada di pos ${assignedStation?.station_name || `Stase ${currentRound}`} (Pengerjaan kasus dihentikan sementara).`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-2">
              <Volume2 size={16} className="text-amber-400 animate-pulse shrink-0" />
              <span>Suara pengumuman & bel akan otomatis berbunyi saat dilanjutkan.</span>
            </div>
          </div>
        </div>
      )}



      {/* Auxiliary Exam Results Modal */}
      <AuxiliaryExamResultModal
        isOpen={isAuxiliaryResultOpen}
        onClose={() => setIsAuxiliaryResultOpen(false)}
        results={auxiliaryResults}
        onConfirmNext={() => {
          setIsAuxiliaryResultOpen(false);
          setExamStep(4);
          performAutoSave({ current_step: 4, status: "in_progress" });
        }}
      />

      {/* Confirm & Alert Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        isAlert={confirmModal.isAlert}
      />
    </div>
  );
}