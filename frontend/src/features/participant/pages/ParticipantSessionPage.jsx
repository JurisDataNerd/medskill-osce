import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Stethoscope,
  User,
  Users,
  AlertCircle,
  HelpCircle,
  Sparkles,
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
  FlaskConical,
  Activity,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Search,
  X,
  Filter,
  Coffee,
  RotateCw,
  Award,
  Megaphone,
} from "lucide-react";
import {
  AUXILIARY_EXAM_CATALOG,
  getAllAuxiliaryExamItems,
} from "@/features/participant/data/auxiliaryExamsCatalog";
import AuxiliaryExamResultModal from "@/components/AuxiliaryExamResultModal";

import { supabase } from "@/lib/supabaseClient";
import { fetchSessionById } from "@/services/sessionService";
import { getSessionParticipants } from "@/services/session.service";
import { getSessionTimerState } from "@/services/live.service";
import {
  subscribeToSession,
  joinPresence,
  calcRemaining,
} from "@/services/realtimeTimerService";

export default function ParticipantSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // View Mode: 'waiting_room', 'live_round', 'transit', 'round_break', 'completed'
  const [viewMode, setViewMode] = useState("waiting_room");

  // Loaded Session Detail from Supabase
  const [sessionDetail, setSessionDetail] = useState(null);

  // Approval Guard State: 'approved' | 'pending' | 'rejected'
  const [candidateApprovalStatus, setCandidateApprovalStatus] = useState("approved");

  // Live Presence State for Waiting Room Users
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeBroadcast, setActiveBroadcast] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToSession(sessionId, {
      onSessionUpdate: (sess) => {
        if (sess && (sess.status === "ongoing" || sess.status === "running")) {
          setViewMode("live_round");
        }
      },
      onBroadcast: (msg) => {
        if (!msg) return;
        if (msg.target_role === "all" || msg.target_role === "participants") {
          setActiveBroadcast({
            id: msg.id || Date.now(),
            message: msg.message,
            priority: msg.priority || "info",
            time: new Date(msg.created_at || Date.now()).toLocaleTimeString("id-ID"),
          });
        }
      },
    });

    return () => unsubscribe();
  }, [sessionId]);

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

        let full_name = user?.user_metadata?.full_name || user?.email || "Peserta Mahasiswa";
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

  // Current Active Round for candidate (Round 1 to 6)
  const [currentRound, setCurrentRound] = useState(1);
  const totalRoundsInSession = 6;

  // Live Stage Data loaded from Supabase / Active Session
  const [liveStageData] = useState({
    station_number: 1,
    title: "Stase 1: Kardiovaskular (STEMI Anteroseptal)",
    examiner_name: "dr. Alexander Budiman, Sp.JP",
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

    const title = st?.title || `Stase ${currentStationNum}: Klinis Terpadu`;
    const case_title = st?.case_title || st?.title || "Evaluasi Skenario SKDI";
    const scenario = st?.scenario || liveStageData.scenario;
    const instructions = st?.participant_instructions || liveStageData.participant_instructions;
    const examiner_name = ex?.full_name
      ? ex.specialty
        ? `${ex.full_name}, ${ex.specialty}`
        : ex.full_name
      : "dr. Penguji Medis";

    return {
      station_number: currentStationNum,
      title,
      case_title,
      scenario,
      participant_instructions: Array.isArray(instructions) ? instructions : [instructions],
      examiner_name,
      location: sessionDetail?.location_building || `Gedung Skill Lab Ruang 10${currentStationNum}`,
    };
  }, [dbStations, dbExaminers, currentStationNum, sessionDetail, liveStageData]);

  // Customisable Durations (in seconds)
  const [stationDurationSeconds, setStationDurationSeconds] = useState(15 * 60); // Default 15 Menit Stase
  const [transitDurationSeconds, setTransitDurationSeconds] = useState(2 * 60);  // Default 2 Menit Transisi
  const [breakDurationSeconds, setBreakDurationSeconds] = useState(10 * 60);   // Default 10 Menit Istirahat Ronde

  // Round Break interval configuration (Default: Istirahat setelah Ronde 3)
  const [breakAfterRound] = useState(3);

  // Active timers
  const [waitingCountdown, setWaitingCountdown] = useState(30);
  const [roundSecondsLeft, setRoundSecondsLeft] = useState(stationDurationSeconds);
  const [transitSecondsLeft, setTransitSecondsLeft] = useState(transitDurationSeconds);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(breakDurationSeconds);

  // Multi-step exam state inside round (1: Anamnesis, 2: Pemeriksaan Fisik, 3: Penunjang, 4: Diagnosis & Resep)
  const [examStep, setExamStep] = useState(1);

  // Confirmation Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState(null);

  // Result Modal State for Tahap 3 Penunjang
  const [isAuxiliaryResultOpen, setIsAuxiliaryResultOpen] = useState(false);
  const [auxiliaryResults, setAuxiliaryResults] = useState([]);

  // Candidate Answer Sheet Form State (Offline OSCE Form)
  const [differentialDiagnosis, setDifferentialDiagnosis] = useState(
    "1. Infark Miokard Akut dengan Elevasi ST (STEMI) Inferior\n2. Angina Pektoris Tidak Stabil (UAP)\n3. Diseksi Aorta Akut"
  );
  const [workingDiagnosis, setWorkingDiagnosis] = useState(
    "Infark Miokard Akut Elevasi ST (STEMI) Dinding Inferior Onset 2 Jam Killip I"
  );
  const [prescriptionText, setPrescriptionText] = useState(
    "R/ Aspirin tab 80 mg No. IV\nS 1 d d tab IV (320 mg chewed p.o)\n\nR/ Clopidogrel tab 75 mg No. IV\nS 1 d d tab IV (300 mg p.o)\n\nR/ Nitroglicerin tab sublingual 0.5 mg No. I\nS p.r.n 1 tab sublingual"
  );

  // Direct Checkbox Auxiliary Exams State (Halaman 3)
  const [checkedAuxiliaryIds, setCheckedAuxiliaryIds] = useState(["lain_ekg_12_lead", "enz_troponin_i"]);

  // Auxiliary Exams Search & Filter State
  const [auxSearchQuery, setAuxSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

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

  const isSessionLive =
    sessionDetail &&
    (sessionDetail.status === "running" || sessionDetail.status === "ongoing");

  // Real-time Timer & Session Status Subscription (WebSocket + Future Timestamp Sync)
  useEffect(() => {
    if (!sessionId) return;

    async function initTimer() {
      const stateData = await getSessionTimerState(sessionId);
      if (stateData) {
        setGlobalTimerState(stateData);
        if (stateData.round_number) setCurrentRound(stateData.round_number);
        const rem = calcRemaining(
          stateData.target_end_time,
          stateData.paused_remaining_ms,
          stateData.phase === "paused"
        );
        setRoundSecondsLeft(rem);
      }
    }

    initTimer();

    const unsubscribe = subscribeToSession(sessionId, {
      onTimerUpdate: (newTimerState) => {
        if (!newTimerState) return;
        setGlobalTimerState(newTimerState);
        if (newTimerState.round_number) setCurrentRound(newTimerState.round_number);

        const rem = calcRemaining(
          newTimerState.target_end_time,
          newTimerState.paused_remaining_ms,
          newTimerState.phase === "paused"
        );
        setRoundSecondsLeft(rem);

        if (newTimerState.phase === "action" || newTimerState.phase === "reading") {
          setViewMode("live_round");
        } else if (newTimerState.phase === "transition") {
          setViewMode("transit");
          setTransitSecondsLeft(rem);
        } else if (newTimerState.phase === "break") {
          setViewMode("round_break");
          setBreakSecondsLeft(rem);
        }
      },
      onSessionUpdate: (sess) => {
        if (sess && sess.id === sessionId) {
          setSessionDetail((prev) => (prev ? { ...prev, status: sess.status } : sess));
          if (sess.status === "ongoing" || sess.status === "running") {
            setViewMode((prev) => (prev === "waiting_room" ? "live_round" : prev));
          }
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

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

      if (viewMode === "live_round") setRoundSecondsLeft(rem);
      else if (viewMode === "transit") setTransitSecondsLeft(rem);
      else if (viewMode === "round_break") setBreakSecondsLeft(rem);
      else if (viewMode === "waiting_room") setWaitingCountdown(rem);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, globalTimerState, viewMode, sessionDetail?.status]);

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function handleStartSimulationFromWaiting() {
    setViewMode("live_round");
    setCurrentRound(1);
    setExamStep(1);
    setRoundSecondsLeft(stationDurationSeconds);
  }

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
  }

  function handleStartNextRoundFromBreak() {
    const nextR = currentRound + 1;
    setCurrentRound(nextR);
    setViewMode("live_round");
    setExamStep(1);
    setRoundSecondsLeft(stationDurationSeconds);
  }

  function requestNextStep(nextStepNumber) {
    setPendingNextStep(nextStepNumber);
    setIsConfirmModalOpen(true);
  }

  function confirmNextStep() {
    if (pendingNextStep) {
      setExamStep(pendingNextStep);
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
      setConfirmModal({
        isOpen: true,
        title: "Pemeriksaan Penunjang",
        message: "Harap pilih minimal 1 pemeriksaan penunjang sebelum meminta rilis hasil.",
        confirmText: "Mengerti",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    const results = checkedAuxiliaryIds.map((id) => {
      const catalogInfo = allCatalogItems.find((i) => i.id === id);

      return {
        id,
        name: catalogInfo ? catalogInfo.name : id,
        category: catalogInfo ? catalogInfo.category : "PEMERIKSAAN",
        hasData: catalogInfo ? catalogInfo.hasData : true,
        imageUrl: catalogInfo ? catalogInfo.imageUrl : "",
        reportText: catalogInfo ? catalogInfo.reportText : `Hasil pemeriksaan ${catalogInfo ? catalogInfo.name : id} dalam batas normal.`,
      };
    });

    setAuxiliaryResults(results);
    setIsAuxiliaryResultOpen(true);
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
              Akses Kiosk Ujian Terkunci
            </span>
            <h2 className="text-xl font-extrabold text-white">
              {candidateApprovalStatus === "rejected"
                ? "Pendaftaran Ditolak Admin"
                : "Menunggu Approval Admin"}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {candidateApprovalStatus === "rejected"
                ? "Maaf, pendaftaran Anda pada sesi ini tidak disetujui oleh Panitia Ujian OSCE."
                : "Status pendaftaran Anda pada sesi ini saat ini adalah MENUNGGU VERIFIKASI ADMIN. Anda belum dapat mengakses Kiosk Ujian sampai Admin menyetujui pendaftaran Anda di Dashboard Administrator."}
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
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
        {/* Top Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-2xs">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <button
              onClick={() => navigate("/participant")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
            >
              <ArrowLeft size={16} />
              Kembali ke Dashboard
            </button>

            {isSessionLive ? (
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-900 flex items-center gap-1.5 animate-pulse">
                <Activity size={14} className="text-emerald-700" />
                Sesi Live Berlangsung
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Hourglass size={14} className="text-amber-700" />
                Sesi Standby • Menunggu Admin Start
              </span>
            )}
          </div>
        </header>

        {/* Waiting Room Body */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 my-auto space-y-6">
          {/* Realtime Broadcast Toast Notification Banner */}
          {activeBroadcast && (
            <div className="flex items-center justify-between rounded-2xl border border-amber-400 bg-amber-500 p-4 text-slate-950 shadow-lg animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
                  <Megaphone size={20} className="animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-950/80">
                    <span>PENGUMUMAN DARI ADMIN CONTROL ROOM</span>
                    <span>•</span>
                    <span>{activeBroadcast.time}</span>
                  </div>
                  <p className="font-extrabold text-sm text-slate-950 mt-0.5">
                    "{activeBroadcast.message}"
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveBroadcast(null)}
                className="rounded-lg bg-slate-950/10 p-1.5 text-slate-950 hover:bg-slate-950/20"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* OSCE Session Master Overview Card */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="rounded-md bg-blue-500/30 border border-blue-400/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-200 tracking-wider">
                    INFORMASI SESI UJIAN OSCE
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Supabase Realtime Live
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

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-black text-white">
                  PERSIAPAN RONDE 1
                </span>
                <h1 className="text-xl font-bold text-slate-900 mt-2">
                  {currentStationInfo.title}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin size={14} className="text-slate-400" />
                  {currentStationInfo.location}
                </p>
              </div>

              {/* Countdown Briefing / Standby Status Card */}
              {isSessionLive ? (
                <div className="mx-auto sm:mx-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center min-w-[170px] animate-in fade-in">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Persiapan Memulai Ronde 1:
                  </p>
                  <p className="text-2xl font-black font-mono text-emerald-900 mt-0.5">
                    {formatTime(waitingCountdown)}
                  </p>
                </div>
              ) : (
                <div className="mx-auto sm:mx-0 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center min-w-[210px] space-y-0.5">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Status Timer Sesi:
                  </p>
                  <p className="text-xs font-black text-amber-900 flex items-center justify-center gap-1.5 pt-0.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    STANDBY (BELUM START)
                  </p>
                  <p className="text-[10px] text-amber-700">
                    Menunggu Admin menekan tombol Start Live.
                  </p>
                </div>
              )}
            </div>

            {/* Rotation Info */}
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Posisi Ronde Pertama Anda</span>
                <p className="font-bold text-blue-900 text-sm mt-0.5">
                  Stase {currentStationInfo.station_number}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Ronde 1 dari 6 Rotasi Sirkuit</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kasus Medis Awalan</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5 truncate">
                  {currentStationInfo.case_title}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Penguji Standby
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Estimasi Total Durasi</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  6 Ronde (± 100 Menit)
                </p>
                <p className="text-[11px] text-blue-700 font-semibold mt-0.5">Termasuk Transisi & Istirahat</p>
              </div>
            </div>

            {/* Live Online Users List Widget */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-blue-600" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Pengguna & Peserta Terhubung (Live Online)
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
                            : `Peserta ${u.nim ? `(NIM: ${u.nim})` : ""}`}
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

              <button
                onClick={handleStartSimulationFromWaiting}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-xs font-bold text-white shadow-lg transition active:scale-95 ${
                  isSessionLive
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 animate-pulse"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
                }`}
              >
                <Play size={16} />
                {isSessionLive
                  ? `Masuk ke Ruang Ujian Live (${currentStationInfo.title})`
                  : `Masuk Kiosk Briefing Stase 1 (Simulasi Standby)`}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
     RENDER VIEW 2: RUANG TRANSIT PERPINDAHAN STASE (TRANSIT WAITING ROOM - 2 MINS)
  ============================================================ */
  if (viewMode === "transit") {
    const nextRoundNumber = currentRound + 1;
    const nextStationInfo = candidateStationSchedule[nextRoundNumber] || candidateStationSchedule[1];

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
                Ronde {currentRound} Selesai
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
                  Target Ronde {nextRoundNumber}: Stase {nextStationInfo.station_number}
                </span>
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  <MapPin size={14} className="text-blue-600" />
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
                onClick={handleStartNextRoundFromTransit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition"
              >
                <ArrowRight size={16} />
                Lanjut Masuk Ronde {nextRoundNumber} ({nextStationInfo.title})
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
    const nextStationInfo = candidateStationSchedule[nextRoundNumber] || candidateStationSchedule[1];

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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-8 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-700 active:scale-95 transition"
              >
                <ArrowRight size={16} />
                Mulai Ronde {nextRoundNumber} ({nextStationInfo.title})
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
     RENDER VIEW 4: HALAMAN TERIMAKASIH MENGIKUTI UJIAN (COMPLETED)
  ============================================================ */
  if (viewMode === "completed") {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
        <main className="flex-1 max-w-3xl w-full mx-auto p-6 my-auto space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <Award size={44} />
            </div>

            <div>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-3.5 py-1 text-xs font-black uppercase tracking-wider">
                Sesi Ujian OSCE Selesai
              </span>
              <h1 className="text-3xl font-black text-slate-900 mt-3">
                Terima Kasih Telah Mengikuti Ujian OSCE!
              </h1>
              <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                Seluruh 6 ronde rotasi sirkuit keterampilan medis telah berhasil Anda selesaikan. Rekapitulasi nilai dan umpan balik penguji sedang diproses oleh sistem.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 grid sm:grid-cols-3 gap-4 text-xs text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Ronde Selesai</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">6 / 6 Ronde</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Status Kelengkapan</span>
                <p className="font-extrabold text-emerald-700 text-sm mt-0.5">100% Terisi</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pengumuman Nilai</span>
                <p className="font-extrabold text-blue-900 text-sm mt-0.5">Akan Dipublikasikan</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate("/participant")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition"
              >
                <ArrowLeft size={16} />
                Kembali ke Dashboard Peserta
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
     RENDER VIEW 5: RUANG UJIAN LIVE MULTI-STEP (LIVE ROUND EXAM)
  ============================================================ */
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
              RONDE {currentRound} / 6
            </span>
            <span className="text-xs font-bold text-slate-900 hidden sm:inline">
              {activeStationInfo.title}
            </span>
          </div>

          {/* Stepped Progress Indicator Banner */}
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

          {/* Continuous Action Timer Banner */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase hidden sm:inline">Sisa Waktu Ronde:</span>
              <span className="text-sm font-black font-mono text-slate-900">{formatTime(roundSecondsLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace (Asymmetric Layout: Left Col 4, Right Col 8 for Primary Exam Focus) */}
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
              {activeStationInfo.title}
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
          {/* HALAMAN 1: PENGUJIAN ANAMNESIS */}
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
                  Lakukan auskultasi 4 katup jantung menggunakan stetoskop dengan posisi dan teknik yang benar pada Pasien Standar / Manekin simulator.
                </p>

                <div className="space-y-2 text-xs">
                  <div className="rounded-lg bg-white border border-slate-200 p-3">
                    <span className="font-bold text-slate-800">Temuan Fisik Awal:</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Kesadaran Compos Mentis, TD 140/90 mmHg, Nadi 98x/menit regular, RR 22x/menit, Sumbu Suhu 36.8°C.
                    </p>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-3">
                    <span className="font-bold text-slate-800">Auskultasi Jantung & Paru:</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      S1 S2 tunggal regular, murmur (-), gallop (-). Vesikuler +/+, rhonchi -/-, wheezing -/-.
                    </p>
                  </div>
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
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition"
                >
                  Minta Berkas Hasil & Lanjut
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
                    Isi formulir diagnosis dan resep obat di bawah ini sebagai lembar jawaban final stase.
                  </p>
                </div>
              </div>

              {/* 1. Form Diagnosis Banding */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  1. Diagnosis Banding (Differential Diagnosis)
                </label>
                <textarea
                  rows={3}
                  value={differentialDiagnosis}
                  onChange={(e) => setDifferentialDiagnosis(e.target.value)}
                  placeholder="Tuliskan 2 - 3 diagnosis banding..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition font-medium"
                />
              </div>

              {/* 2. Form Diagnosis Kerja */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  2. Diagnosis Kerja (Working Diagnosis Utama)
                </label>
                <input
                  type="text"
                  value={workingDiagnosis}
                  onChange={(e) => setWorkingDiagnosis(e.target.value)}
                  placeholder="Tuliskan diagnosis kerja utama yang spesifik..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition font-semibold"
                />
              </div>

              {/* 3. Form Penulisan Resep Obat */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>3. Lembar Penulisan Resep Obat (Prescription Sheet)</span>
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
                  <p className="font-bold text-xs text-emerald-900">Selesaikan Stase 1</p>
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
        </div>
      </main>

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
                  ? "Apakah Anda yakin ingin menyelesaikan Stase 1 dan masuk ke Ruang Tunggu Perpindahan Stase?"
                  : `Apakah Anda sudah selesai dan yakin ingin melanjutkan ke Tahap ${pendingNextStep}?`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal / Periksa Kembali
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