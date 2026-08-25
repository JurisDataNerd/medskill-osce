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
import ParticipantWaitingRoomView from "@/features/participant/components/ParticipantWaitingRoomView";
import ParticipantTransitView from "@/features/participant/components/ParticipantTransitView";
import ParticipantBreakStationView from "@/features/participant/components/ParticipantBreakStationView";
import ParticipantPauseOverlay from "@/features/participant/components/ParticipantPauseOverlay";
import ParticipantApprovalPendingView from "@/features/participant/components/ParticipantApprovalPendingView";
import ParticipantCompletedView from "@/features/participant/components/ParticipantCompletedView";
import ParticipantStationCompletedWaitView from "@/features/participant/components/ParticipantStationCompletedWaitView";
import ParticipantExamHeader from "@/features/participant/components/ParticipantExamHeader";
import ParticipantExamScenarioSidebar from "@/features/participant/components/ParticipantExamScenarioSidebar";
import ParticipantStepAnamnesis from "@/features/participant/components/steps/ParticipantStepAnamnesis";
import ParticipantStepPhysicalExam from "@/features/participant/components/steps/ParticipantStepPhysicalExam";
import ParticipantStepAuxiliaryExam from "@/features/participant/components/steps/ParticipantStepAuxiliaryExam";
import ParticipantStepDiagnosisPrescription from "@/features/participant/components/steps/ParticipantStepDiagnosisPrescription";
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

        // Fetch stations (with auxiliary configs) & examiners for session
        const [
          { data: stData },
          { data: exData },
          { data: { user } },
        ] = await Promise.all([
          supabase
            .schema("osce")
            .from("stations")
            .select(`
              *,
              station_auxiliary_configs (*)
            `)
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
      auxiliary_configs: st?.station_auxiliary_configs || [],
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
        } else if (
          activePhase === "action" ||
          activePhase === "reading"
        ) {
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
        } else if (
          activePhase === "action" ||
          activePhase === "reading"
        ) {
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

    if (viewMode === "live_round") {
      if (roundSecondsLeft === 120) playOsceAudio("warning_2min");
      if (roundSecondsLeft === 60) playOsceAudio("warning_1min");
      if (roundSecondsLeft === 0) playOsceAudio("stop_transit");
    } else if (viewMode === "transit") {
      if (transitSecondsLeft === 0) playOsceAudio("start_exam");
    } else if (viewMode === "completed") {
      playOsceAudio("finish_exam");
    }
  }, [sessionId, globalTimerState, viewMode, roundSecondsLeft, transitSecondsLeft, breakSecondsLeft, waitingCountdown, sessionDetail?.status]);

  // Auto Next when timer reaches 0 for live round, transit, or round break
  useEffect(() => {
    if (!sessionId || !isSessionLive) return;

    const isPaused =
      globalTimerState?.phase === "paused" ||
      globalTimerState?.phase?.startsWith("paused") ||
      sessionDetail?.status === "paused";

    if (isPaused) return;

    if (viewMode === "live_round" && roundSecondsLeft === 0 && globalTimerState?.target_end_time) {
      if (!activeStationInfo?.is_break) {
        performAutoSave({ current_step: examStep, status: "submitted" });
        if (sessionId && currentRound) {
          localStorage.setItem(`osce_station_submitted_${sessionId}_round_${currentRound}`, "true");
        }
      }
      handleFinishActiveRound();
    } else if (viewMode === "transit" && transitSecondsLeft === 0 && globalTimerState?.target_end_time) {
      const isInitial = globalTimerState?.phase === "initial_transition";
      const targetR = isInitial
        ? 1
        : Math.min(totalRoundsInSession, (globalTimerState?.round_number || currentRound) + 1);
      setCurrentRound(targetR);
      setViewMode("live_round");
      setExamStep(1);
    } else if (viewMode === "round_break" && breakSecondsLeft === 0 && globalTimerState?.target_end_time) {
      const nextR = currentRound + 1;
      setCurrentRound(nextR);
      setViewMode("live_round");
      setExamStep(1);
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

    const isPaused =
      globalTimerState.phase === "paused" ||
      globalTimerState.phase?.startsWith("paused") ||
      sessionDetail?.status === "paused";

    if (isPaused) {
      // When session is paused, do not transition or complete; stay in current view with Paused Overlay
      return;
    }

    if (globalTimerState.phase === "transition" || globalTimerState.phase === "initial_transition") {
      const serverRound = Number(globalTimerState.round_number || currentRound);
      if (serverRound > totalRoundsInSession) {
        setViewMode("completed");
      } else {
        if (globalTimerState.phase === "initial_transition") {
          playOsceAudio("waiting_room");
        }
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

  function handleEnterLiveSession() {
    handleStartSimulationFromWaiting();
  }

  function handleFinishActiveRound() {
    const isPaused =
      globalTimerState?.phase === "paused" ||
      globalTimerState?.phase?.startsWith("paused") ||
      sessionDetail?.status === "paused";

    if (isPaused) return;

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

    const stationConfigs = activeStationInfo.auxiliary_configs || [];
    const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const indicatedResults = [];

    checkedAuxiliaryIds.forEach((id) => {
      const catalogInfo = allCatalogItems.find((i) => i.id === id);
      const catNameNorm = catalogInfo ? norm(catalogInfo.name) : norm(id);

      // Check if matching auxiliary config exists for this station
      const matchedConfig = stationConfigs.find((cfg) => {
        if (cfg.item_id && cfg.item_id === id) return true;
        if (cfg.id && cfg.id === id) return true;
        const cfgNameNorm = norm(cfg.name || cfg.title);
        if (cfgNameNorm && (cfgNameNorm.includes(catNameNorm) || catNameNorm.includes(cfgNameNorm))) return true;
        return false;
      });

      if (matchedConfig) {
        indicatedResults.push({
          id,
          name: matchedConfig.name || catalogInfo?.name || id,
          category: matchedConfig.category || catalogInfo?.category || "PENUNJANG",
          hasData: true,
          imageUrl: matchedConfig.image_url || matchedConfig.imageUrl || matchedConfig.file_url || "",
          reportText: matchedConfig.report_text || matchedConfig.reportText || "Hasil pemeriksaan dalam batas normal / sesuai skenario klinis.",
          isMatched: true,
        });
      } else {
        indicatedResults.push({
          id,
          name: catalogInfo ? catalogInfo.name : id,
          category: catalogInfo ? catalogInfo.category : "PENUNJANG",
          hasData: true,
          imageUrl: catalogInfo?.imageUrl || "",
          reportText: catalogInfo?.reportText || `Hasil pemeriksaan ${catalogInfo ? catalogInfo.name : id} dalam batas normal.`,
          isMatched: false,
        });
      }
    });

    if (indicatedResults.length > 0) {
      setAuxiliaryResults(indicatedResults);
      setIsAuxiliaryResultOpen(true);
      performAutoSave({ current_step: 3, status: "in_progress" });
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
      <ParticipantApprovalPendingView
        candidateApprovalStatus={candidateApprovalStatus}
        onNavigateBack={() => navigate("/participant")}
      />
    );
  }

  /* ============================================================
     RENDER VIEW 1: RUANG TUNGGU PESERTA (PRE-EXAM WAITING ROOM)
  ============================================================ */
  if (viewMode === "waiting_room") {
    return (
      <>
        <ParticipantWaitingRoomView
          sessionDetail={sessionDetail}
          isSessionLive={isSessionLive}
          sessionId={sessionId}
          user={user}
          currentRound={currentRound}
          onlineUsers={onlineUsers}
          onExitWaitingRoom={handleExitWaitingRoom}
          onStartSimulation={handleStartSimulationFromWaiting}
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
      </>
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
      <ParticipantTransitView
        targetRoundNumber={targetRoundNumber}
        nextStationInfo={nextStationInfo}
        currentRound={currentRound}
        transitSecondsLeft={transitSecondsLeft}
        isSessionLive={isSessionLive}
        formatTime={formatTime}
        onProceedToRound={(roundNum) => {
          setCurrentRound(roundNum);
          setViewMode("live_round");
          setExamStep(1);
          setRoundSecondsLeft(stationDurationSeconds);
        }}
      />
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
      <ParticipantTransitView
        targetRoundNumber={nextRoundNumber}
        nextStationInfo={nextStationInfo}
        currentRound={currentRound}
        transitSecondsLeft={breakSecondsLeft}
        isSessionLive={isSessionLive}
        formatTime={formatTime}
        onProceedToRound={handleStartNextRoundFromBreak}
      />
    );
  }

  /* ============================================================
     RENDER VIEW 4: HALAMAN TERIMAKASIH MENGIKUTI UJIAN (COMPLETED - DINAMIS)
  ============================================================ */
  const isSessionPaused =
    globalTimerState?.phase === "paused" ||
    globalTimerState?.phase?.startsWith("paused") ||
    sessionDetail?.status === "paused";

  if (!isSessionPaused && (viewMode === "completed" || sessionDetail?.status === "completed" || sessionDetail?.status === "finished")) {
    return (
      <>
        <ParticipantCompletedView
          sessionDetail={sessionDetail}
          totalRoundsInSession={totalRoundsInSession}
          onNavigateHome={() => navigate("/participant")}
          onNavigateHistory={() => navigate("/participant/history")}
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
      </>
    );
  }

  /* ============================================================
     RENDER VIEW 5: RUANG UJIAN LIVE MULTI-STEP (LIVE ROUND EXAM)
  ============================================================ */
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Floating Broadcast Toast & Top Header Component */}
      <ParticipantExamHeader
        activeBroadcast={activeBroadcast}
        onCloseBroadcast={() => setActiveBroadcast(null)}
        currentRound={currentRound}
        totalRoundsInSession={totalRoundsInSession}
        activeStationInfo={activeStationInfo}
        viewMode={viewMode}
        examStep={examStep}
        globalTimerState={globalTimerState}
        sessionDetail={sessionDetail}
        roundSecondsLeft={roundSecondsLeft}
        formatTime={formatTime}
      />

      {/* Main Workspace: Clean Centered View for station_completed_wait OR Asymmetric Grid Layout for Live Exam */}
      {viewMode === "station_completed_wait" ? (
        <ParticipantStationCompletedWaitView
          activeStationInfo={activeStationInfo}
          roundSecondsLeft={roundSecondsLeft}
          formatTime={formatTime}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid gap-6 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN (4 COLS): COMPACT CLINICAL SCENARIO & INSTRUCTIONS REFERENCE PANEL */}
          <ParticipantExamScenarioSidebar activeStationInfo={activeStationInfo} />

          {/* RIGHT COLUMN (8 COLS): PRIMARY EXAM WORKSPACE (FOKUS UJIAN) */}
          <div className="lg:col-span-8 space-y-6">
            {activeStationInfo.is_break ? (
              <ParticipantBreakStationView
                currentRound={currentRound}
                roundSecondsLeft={roundSecondsLeft}
                formatTime={formatTime}
                onFinishActiveRound={handleFinishActiveRound}
              />
            ) : (
              <>
                {examStep === 1 && (
                  <ParticipantStepAnamnesis onRequestNextStep={requestNextStep} />
                )}

                {examStep === 2 && (
                  <ParticipantStepPhysicalExam onRequestNextStep={requestNextStep} />
                )}

                {examStep === 3 && (
                  <ParticipantStepAuxiliaryExam
                    checkedAuxiliaryIds={checkedAuxiliaryIds}
                    onToggleAuxiliaryCheckbox={toggleAuxiliaryCheckbox}
                    onResetChecked={() => setCheckedAuxiliaryIds([])}
                    auxSearchQuery={auxSearchQuery}
                    setAuxSearchQuery={setAuxSearchQuery}
                    selectedCategoryFilter={selectedCategoryFilter}
                    setSelectedCategoryFilter={setSelectedCategoryFilter}
                    expandedCategories={expandedCategories}
                    setExpandedCategories={setExpandedCategories}
                    filteredCatalog={filteredCatalog}
                    onSubmitAuxiliaryRequests={handleSubmitAuxiliaryRequests}
                  />
                )}

                {examStep === 4 && (
                  <ParticipantStepDiagnosisPrescription
                    differentialDiagnosis={differentialDiagnosis}
                    setDifferentialDiagnosis={setDifferentialDiagnosis}
                    workingDiagnosis={workingDiagnosis}
                    setWorkingDiagnosis={setWorkingDiagnosis}
                    prescriptionText={prescriptionText}
                    setPrescriptionText={setPrescriptionText}
                    activeStationNumber={activeStationInfo.station_number}
                    onRequestFinishStation={() => requestNextStep(5)}
                  />
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
      <ParticipantPauseOverlay
        globalTimerState={globalTimerState}
        sessionDetail={sessionDetail}
        currentRound={currentRound}
        assignedStation={activeStationInfo}
      />



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