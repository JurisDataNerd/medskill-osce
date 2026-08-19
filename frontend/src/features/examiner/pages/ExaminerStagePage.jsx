import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  Users,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronRight,
  Lock,
  Coffee,
  Eye,
  Activity,
  FileSpreadsheet,
  Save,
  Loader2,
  Info,
  CalendarDays,
  Building2,
  Layers,
  Play,
  PlayCircle,
  Megaphone,
  ExternalLink,
  BellRing,
  X,
  LogOut,
  History,
  Stethoscope,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { fetchSessions } from "@/services/sessionService";
import { submitExaminerEvaluation } from "@/services/examinerService";
import { toast } from "sonner";
import { getSessionTimerState } from "@/services/live.service";
import {
  subscribeToSession,
  joinPresence,
  calcRemaining,
  playBroadcastNotificationSound,
} from "@/services/realtimeTimerService";
import AuxiliaryExamResultModal from "@/components/AuxiliaryExamResultModal";
import ConfirmModal from "@/components/ConfirmModal";
import ExaminerStationScheduleWidget from "@/features/examiner/components/ExaminerStationScheduleWidget";

export default function ExaminerStagePage() {
  const { stageId, sessionId, id } = useParams();
  const targetParamId = sessionId || id || stageId;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [stationData, setStationData] = useState(null);
  const [rubricItems, setRubricItems] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedAuxModalResults, setSelectedAuxModalResults] = useState(null);
  const [activeRotationIndex, setActiveRotationIndex] = useState(0);

  // Rubric Scores State for active examinee (0, 1, 2, 3)
  const [rubricScores, setRubricScores] = useState({});
  const [globalRating, setGlobalRating] = useState("SATISFACTORY");
  const [feedback, setFeedback] = useState("Kinerja klinis dan komunikasi peserta sangat baik dan terstruktur.");
  const [showScenario, setShowScenario] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Mengerti",
    variant: "warning",
    isAlert: true,
    onConfirm: null,
  });

  function handleExitExaminerWaitingRoom() {
    setConfirmModal({
      isOpen: true,
      title: "Keluar dari Waiting Room Stase?",
      message: "Apakah Anda yakin ingin keluar dari Waiting Room Stase ini dan kembali ke Dashboard Dokter Penguji?",
      confirmText: "Ya, Keluar ke Dashboard",
      cancelText: "Batal",
      variant: "danger",
      isAlert: false,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        navigate("/examiner");
      },
    });
  }

  // Live Synchronized Global Timer State
  const [timerState, setTimerState] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(720);

  // Live Presence State for Online Users
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeBroadcast, setActiveBroadcast] = useState(null);
  const [forceLiveView, setForceLiveView] = useState(false);

  const [liveAnswer, setLiveAnswer] = useState(null);
  const [assignedSessionsList, setAssignedSessionsList] = useState([]);
  const [allActiveSessions, setAllActiveSessions] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);



  useEffect(() => {
    async function loadStationDetail() {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        let userProf = null;
        if (user) {
          const { data: profData } = await supabase
            .schema("public")
            .from("profiles")
            .select("full_name, email, university, specialty")
            .eq("id", user.id)
            .maybeSingle();

          if (profData) {
            userProf = profData;
            setCurrentUserProfile(profData);
          } else {
            const fallbackProf = {
              full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
              email: user.email,
              specialty: user.user_metadata?.specialty,
              university: user.user_metadata?.institution || user.user_metadata?.university,
            };
            userProf = fallbackProf;
            setCurrentUserProfile(fallbackProf);
          }
        }

        const currentName = (userProf?.full_name || user?.user_metadata?.full_name || user?.email || "").toLowerCase();
        const username = user?.email ? user.email.split("@")[0].toLowerCase() : "";

        // 1. Fetch available active sessions from sessionService (published & ongoing only; completed sessions are in history)
        const rawSessions = await fetchSessions();
        const sessList = (rawSessions || []).filter((s) => {
          const status = String(s.status || "").toLowerCase();
          return (
            status === "published" ||
            status === "scheduled" ||
            status === "ongoing" ||
            status === "running" ||
            status === "waiting_room" ||
            status === "paused"
          );
        });
        setAllActiveSessions(sessList);

        if (!sessList || sessList.length === 0) {
          setActiveSession(null);
          setStationData(null);
          setAssignedSessionsList([]);
          return;
        }

        // 2. Query all examiners and stations to build assigned sessions list
        const { data: allExaminers } = await supabase
          .schema("osce")
          .from("session_examiners")
          .select("*");

        const { data: allStations } = await supabase
          .schema("osce")
          .from("stations")
          .select("*")
          .order("station_number");

        const assignedList = [];

        for (const s of sessList) {
          const sessionExs = (allExaminers || []).filter((e) => e.session_id === s.id);
          const sessionSts = (allStations || []).filter((st) => st.session_id === s.id);

          const match = sessionExs.find((e) => {
            if (user?.id && e.user_id === user.id) return true;
            if (!e.full_name) return false;
            const efName = e.full_name.toLowerCase();
            return (
              efName === currentName ||
              (username && efName.includes(username)) ||
              currentName.includes(efName) ||
              efName.replace(/dr\.?\s*/i, "").trim() === currentName.replace(/dr\.?\s*/i, "").trim()
            );
          });

          const matchedSt = match
            ? sessionSts.find((st) => Number(st.station_number) === Number(match.assigned_station_number))
            : null;

          assignedList.push({
            session: s,
            assignment: match || { assigned_station_number: 1 },
            station: matchedSt || sessionSts.find((st) => !st.is_break) || sessionSts[0],
            stations: sessionSts,
          });
        }

        setAssignedSessionsList(assignedList);

        // Pick target session & target station ONLY if targetParamId parameter is explicitly provided
        let targetSess = null;
        if (targetParamId && targetParamId !== "stage-101" && targetParamId !== "stg-101") {
          targetSess = sessList.find((s) => s.id === targetParamId);
        }

        // If targetParamId is not passed or valid, show session selection cards list instead of auto-selecting
        if (!targetParamId || targetParamId === "stage-101" || targetParamId === "stg-101") {
          setActiveSession(null);
          setStationData(null);
          return;
        }

        let st = null;

        if (targetParamId && targetParamId !== "stage-101" && targetParamId !== "stg-101") {
          // 1. Try fetching station by station id
          const { data: directSt } = await supabase
            .schema("osce")
            .from("stations")
            .select(`*, rubric_items (*), station_auxiliary_configs (*)`)
            .eq("id", targetParamId)
            .maybeSingle();

          if (directSt) {
            st = directSt;
            if (!targetSess) {
              targetSess = sessList.find((s) => s.id === directSt.session_id);
            }
          } else {
            // 2. Fallback: targetParamId might be a session_id
            const { data: sessSts } = await supabase
              .schema("osce")
              .from("stations")
              .select(`*, rubric_items (*), station_auxiliary_configs (*)`)
              .eq("session_id", targetParamId)
              .order("station_number");

            if (sessSts && sessSts.length > 0) {
              const assignedItem = assignedList.find((a) => a.session.id === targetParamId);
              const assignedStNum = assignedItem?.assignment?.assigned_station_number;

              st = assignedStNum
                ? sessSts.find((s) => Number(s.station_number) === Number(assignedStNum)) || sessSts.find((s) => !s.is_break) || sessSts[0]
                : sessSts.find((s) => !s.is_break) || sessSts[0];
            }
          }
        }

        if (!targetSess && st) {
          targetSess = sessList.find((s) => s.id === st.session_id);
        }

        setActiveSession(targetSess || null);

        if (!st && targetSess) {
          const { data: stData } = await supabase
            .schema("osce")
            .from("stations")
            .select(`*, rubric_items (*), station_auxiliary_configs (*)`)
            .eq("session_id", targetSess.id)
            .order("station_number", { ascending: true });

          st = Array.isArray(stData) ? stData[0] : stData;
        }

        if (st) {
          // 1. Fetch Question Bank case details if question_bank_id or case_id exists
          let qbCase = null;
          const caseIdToFetch = st.question_bank_id || st.case_id;
          if (caseIdToFetch) {
            try {
              const { data: cData } = await supabase
                .schema("osce")
                .from("question_bank")
                .select(`*, question_bank_rubric_items (*), question_bank_auxiliary_configs (*)`)
                .eq("id", caseIdToFetch)
                .maybeSingle();
              if (cData) qbCase = cData;
            } catch (e) {
              console.warn("Could not fetch question_bank case:", e);
            }
          }

          // 2. Merge station properties with question bank case properties
          const mergedStation = {
            ...st,
            case_title: st.case_title || qbCase?.case_title || qbCase?.title || st.title || "Kasus Medis Terstandar",
            system_organ: st.system_organ || qbCase?.system_organ || "Kardiovaskular",
            skdi_level: st.skdi_level || qbCase?.skdi_level || "4A",
            scenario: st.scenario || qbCase?.scenario || qbCase?.chief_complaint || "",
            participant_instructions: st.participant_instructions || qbCase?.participant_instructions || "",
            examiner_instructions: st.examiner_instructions || qbCase?.examiner_instructions || "",
            answer_key_diagnosis: st.answer_key_diagnosis || qbCase?.answer_key_diagnosis || "",
            answer_key_prescription: st.answer_key_prescription || qbCase?.answer_key_prescription || "",
            answer_key_physical_exam: st.answer_key_physical_exam || qbCase?.answer_key_physical_exam || "",
          };

          setStationData(mergedStation);

          // 3. Query rubric items explicitly from osce.rubric_items table
          let { data: rList } = await supabase
            .schema("osce")
            .from("rubric_items")
            .select("*")
            .eq("station_id", st.id)
            .order("question_number", { ascending: true });

          // 4. If no rubric items exist in DB for this station, populate and auto-insert real rubric items with DB UUIDs
          if (!rList || rList.length === 0) {
            const qbItems = qbCase?.question_bank_rubric_items || [];

            let itemsToInsert = [];
            if (qbItems.length > 0) {
              itemsToInsert = qbItems.map((item, idx) => ({
                station_id: st.id,
                question_number: idx + 1,
                title: item.title || item.question || item.name || `Item Rubrik #${idx + 1}`,
                question: item.question || item.title || item.name || `Item Rubrik #${idx + 1}`,
                description: item.description || item.answer_key || "",
                answer_key: item.answer_key || item.description || "",
                max_points: Number(item.max_points) || 3,
                weight: Number(item.weight) || 1.0,
                competency_area: item.competency_area || "KLINIS",
                description_score_0: item.description_score_0 || item.descriptors?.[0] || "0: Tidak Dilakukan / Salah Total",
                description_score_1: item.description_score_1 || item.descriptors?.[1] || "1: Minimal / Sebagian Salah",
                description_score_2: item.description_score_2 || item.descriptors?.[2] || "2: Cukup / Memadai",
                description_score_3: item.description_score_3 || item.descriptors?.[3] || "3: Sempurna & Lengkap",
                sort_order: idx,
              }));
            } else {
              itemsToInsert = [
                {
                  station_id: st.id,
                  question_number: 1,
                  title: "Komunikasi & Anamnesis Terarah",
                  question: "Komunikasi & Anamnesis Terarah",
                  description: "Evaluasi ketepatan anamnesis dan empati klinis peserta.",
                  answer_key: mergedStation.participant_instructions || "Anamnesis terstruktur",
                  max_points: 3,
                  weight: 2.0,
                  competency_area: "ANAMNESIS",
                  description_score_0: "0: Tidak dilakukan / Salah Total",
                  description_score_1: "1: Minimal / Sebagian Salah",
                  description_score_2: "2: Cukup / Memadai",
                  description_score_3: "3: Sempurna & Lengkap",
                  sort_order: 0,
                },
                {
                  station_id: st.id,
                  question_number: 2,
                  title: "Pemeriksaan Fisik & Penunjang",
                  question: "Pemeriksaan Fisik & Penunjang",
                  description: "Evaluasi teknik pemeriksaan fisik dan usulan pemeriksaan penunjang.",
                  answer_key: "Pemeriksaan fisik & penunjang terarah",
                  max_points: 3,
                  weight: 3.0,
                  competency_area: "PEMERIKSAAN_FISIK",
                  description_score_0: "0: Tidak dilakukan / Salah Total",
                  description_score_1: "1: Minimal / Sebagian Salah",
                  description_score_2: "2: Cukup / Memadai",
                  description_score_3: "3: Sempurna & Lengkap",
                  sort_order: 1,
                },
                {
                  station_id: st.id,
                  question_number: 3,
                  title: "Diagnosis Kerja (WDx) & Diagnosis Banding (DDx)",
                  question: "Diagnosis Kerja (WDx) & Diagnosis Banding (DDx)",
                  description: "Evaluasi formulasi diagnosis kerja utama dan diagnosis banding.",
                  answer_key: mergedStation.answer_key_diagnosis || "WDx & DDx sesuai kasus",
                  max_points: 3,
                  weight: 4.0,
                  competency_area: "DIAGNOSIS",
                  description_score_0: "0: Salah total",
                  description_score_1: "1: Kurang tepat",
                  description_score_2: "2: Tepat",
                  description_score_3: "3: Sempurna",
                  sort_order: 2,
                },
                {
                  station_id: st.id,
                  question_number: 4,
                  title: "Tatalaksana Farmakoterapi & Resep Medis",
                  question: "Tatalaksana Farmakoterapi & Resep Medis",
                  description: "Evaluasi penulisan resep dan tatalaksana farmakoterapi.",
                  answer_key: mergedStation.answer_key_prescription || "Resep medis terstruktur",
                  max_points: 3,
                  weight: 4.0,
                  competency_area: "RESEP_MEDIS",
                  description_score_0: "0: Resep salah total",
                  description_score_1: "1: Dosis / aturan pakai kurang tepat",
                  description_score_2: "2: Tepat",
                  description_score_3: "3: Sempurna & Lengkap",
                  sort_order: 3,
                },
              ];
            }

            try {
              const { data: insertedRubrics } = await supabase
                .schema("osce")
                .from("rubric_items")
                .insert(itemsToInsert)
                .select();
              if (insertedRubrics && insertedRubrics.length > 0) {
                rList = insertedRubrics;
              }
            } catch (e) {
              console.warn("Notice inserting rubric items to Supabase:", e);
            }
          }

          setRubricItems(rList || []);

          // Sync parent session for this station
          const { data: parentSess } = await supabase
            .schema("osce")
            .from("sessions")
            .select("*")
            .eq("id", st.session_id)
            .maybeSingle();

          if (parentSess) {
            setActiveSession(parentSess);
          }

          // Fetch session participants from Supabase
          const { data: pList } = await supabase
            .schema("osce")
            .from("session_participants")
            .select("*")
            .eq("session_id", st.session_id);

          setParticipants(pList && pList.length > 0 ? pList : []);
        }
      } catch (err) {
        console.error("Error loading station detail for examiner:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStationDetail();
  }, [targetParamId]);

  // Realtime subscription for session_participants list updates
  useEffect(() => {
    if (!activeSession?.id) return;

    const fetchParticipantsList = async () => {
      const { data: pList } = await supabase
        .schema("osce")
        .from("session_participants")
        .select("*")
        .eq("session_id", activeSession.id);
      if (pList) setParticipants(pList);
    };

    const channel = supabase
      .channel(`examiner_participants_${activeSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "osce",
          table: "session_participants",
          filter: `session_id=eq.${activeSession.id}`,
        },
        () => {
          fetchParticipantsList();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession?.id]);

  function safeParseAuxiliaryList(answer) {
    if (!answer) return [];

    let raw = answer.requested_auxiliary_json || answer.auxiliary_results || answer.requested_auxiliary_ids || [];
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch (e) {
        console.warn("Failed to parse requested_auxiliary_json:", e);
        raw = [];
      }
    }

    if (!Array.isArray(raw)) return [];

    return raw.map((item) => {
      if (typeof item === "string") {
        return {
          id: item,
          name: item.toUpperCase().replace(/_/g, " "),
          category: "PEMERIKSAAN PENUNJANG",
          hasData: true,
          imageUrl: "",
          reportText: `Hasil pemeriksaan penunjang [${item}] dalam batas normal.`,
        };
      }
      return {
        id: item.id || item.code || "aux-item",
        name: item.name || item.title || item.label || "Hasil Berkas Penunjang",
        category: item.category || "PEMERIKSAAN",
        hasData: item.hasData !== false && item.has_data !== false,
        imageUrl: item.imageUrl || item.image_url || item.url || item.file_url || "",
        reportText: item.reportText || item.report_text || item.description || "Hasil laboratorium/radiologi dalam batas normal.",
        labResults: item.labResults || item.lab_results || null,
        findings: item.findings || null,
      };
    });
  }

  // Realtime subscription & timer sync for active session (WebSocket + Future Timestamp)
  useEffect(() => {
    if (!activeSession?.id) return;

    async function initTimerState() {
      const stateData = await getSessionTimerState(activeSession.id);
      if (stateData) {
        setTimerState(stateData);
        const rem = calcRemaining(
          stateData.target_end_time,
          stateData.paused_remaining_ms,
          stateData.phase === "paused"
        );
        setRemainingSeconds(rem);
      }
    }

    initTimerState();

    const unsubscribe = subscribeToSession(activeSession.id, {
      onTimerUpdate: (newTimerState) => {
        if (!newTimerState) return;
        setTimerState(newTimerState);
        const rem = calcRemaining(
          newTimerState.target_end_time,
          newTimerState.paused_remaining_ms,
          newTimerState.phase === "paused"
        );
        setRemainingSeconds(rem);
      },
      onSessionUpdate: (sess) => {
        if (sess) {
          setActiveSession((prev) => (prev ? { ...prev, ...sess } : null));
        }
      },
      onBroadcast: (msg) => {
        if (!msg) return;
        const target = String(msg.target_role || "all").toLowerCase();
        if (target === "all" || target === "examiners" || target === "penguji") {
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
  }, [activeSession?.id]);

  // Broadcast Auto-dismiss Timer (5 Seconds)
  useEffect(() => {
    if (!activeBroadcast) return;
    const timer = setTimeout(() => {
      setActiveBroadcast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeBroadcast]);

  // Real-time Presence Tracking for Examiner
  useEffect(() => {
    if (!activeSession?.id) return;

    let cleanupPresence = null;
    async function initPresence() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let full_name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Tidak ada data";
        let specialty = user?.user_metadata?.specialty || "";

        if (user?.id) {
          const { data: prof } = await supabase
            .schema("public")
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();

          if (prof?.full_name) full_name = prof.full_name;

          const { data: exData } = await supabase
            .schema("osce")
            .from("session_examiners")
            .select("specialty")
            .eq("user_id", user.id)
            .maybeSingle();

          if (exData?.specialty) specialty = exData.specialty;
        }

        const userState = {
          user_id: user?.id || user?.email || `examiner-${Date.now()}`,
          full_name,
          role: "examiner",
          specialty,
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
  }, [activeSession?.id]);

  // Live Timer Local 1-second Tick derived from target_end_time
  useEffect(() => {
    if (!activeSession || !timerState) return;

    const interval = setInterval(() => {
      const isPaused = timerState.phase === "paused" || activeSession.status === "paused";
      const rem = calcRemaining(
        timerState.target_end_time,
        timerState.paused_remaining_ms,
        isPaused
      );
      setRemainingSeconds(rem);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, timerState]);

  const totalStations = activeSession?.total_stations || activeSession?.stations?.length || 6;
  const currentRoundNum = timerState?.round_number || 1;
  const stationNum = Number(stationData?.station_number || 1);

  // Circuit rotation formula: calculate candidate starting station S0 at station S in round R
  const targetStartingStation =
    ((stationNum - 1 - ((currentRoundNum - 1) % totalStations) + totalStations) % totalStations) + 1;

  const currentParticipant = useMemo(() => {
    if (!participants || participants.length === 0) return null;

    if (activeRotationIndex !== undefined && activeRotationIndex !== null && participants[activeRotationIndex]) {
      return participants[activeRotationIndex];
    }

    const matched = participants.find(
      (p) => Number(p.starting_station_number) === targetStartingStation
    );
    if (matched) return matched;

    const rotIdx = (stationNum - 1 + (currentRoundNum - 1)) % participants.length;
    return participants[rotIdx] || participants[0];
  }, [participants, activeRotationIndex, targetStartingStation, stationNum, currentRoundNum]);

  // Realtime subscription for participant live answers
  useEffect(() => {
    if (!stationData || !currentParticipant) return;

    const pId = currentParticipant.user_id || currentParticipant.id;

    async function fetchLiveAnswer() {
      const { data } = await supabase
        .schema("osce")
        .from("participant_answers")
        .select("*")
        .eq("station_id", stationData.id)
        .eq("participant_id", pId)
        .maybeSingle();

      setLiveAnswer(data || null);
    }

    fetchLiveAnswer();

    const channel = supabase
      .channel(`realtime-examiner-feed-${stationData.id}-${pId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "osce",
          table: "participant_answers",
          filter: `station_id=eq.${stationData.id}`,
        },
        (payload) => {
          if (payload.new && (payload.new.participant_id === pId)) {
            setLiveAnswer(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stationData?.id, currentParticipant?.id, currentParticipant?.user_id]);

  // Fetch saved evaluation from Supabase whenever active examinee / station / rotation changes
  useEffect(() => {
    if (!activeSession?.id || !stationData?.id || !currentParticipant) return;

    const examineeId = currentParticipant.user_id || currentParticipant.id;
    const rotRound = activeRotationIndex + 1;

    async function loadSavedEvaluation() {
      try {
        const { data: evalRecord } = await supabase
          .schema("osce")
          .from("examiner_evaluations")
          .select("*, rubric_scores (*)")
          .eq("session_id", activeSession.id)
          .eq("station_id", stationData.id)
          .eq("participant_id", examineeId)
          .eq("rotation_round", rotRound)
          .maybeSingle();

        if (evalRecord) {
          setGlobalRating(evalRecord.grs_rating || "SATISFACTORY");
          setFeedback(evalRecord.examiner_notes || "");
          const scoresMap = {};
          (evalRecord.rubric_scores || []).forEach((sc) => {
            scoresMap[sc.rubric_item_id] = sc.score_given;
          });
          setRubricScores(scoresMap);
        } else {
          setGlobalRating("SATISFACTORY");
          setFeedback("");
          const defaultScores = {};
          rubricItems.forEach((r) => {
            defaultScores[r.id] = 3;
          });
          setRubricScores(defaultScores);
        }
      } catch (err) {
        console.warn("Could not load saved evaluation from Supabase:", err);
      }
    }

    loadSavedEvaluation();
  }, [activeSession?.id, stationData?.id, currentParticipant?.id, currentParticipant?.user_id, activeRotationIndex, rubricItems]);

  function handleScoreChange(itemId, val) {
    setRubricScores((prev) => ({
      ...prev,
      [itemId]: Number(val),
    }));
  }

  async function handleSaveEvaluation() {
    if (!activeSession || !stationData || !currentParticipant) {
      setConfirmModal({
        isOpen: true,
        title: "Tidak Dapat Menyimpan",
        message: "Tidak dapat menyimpan: Data Sesi, Stase, atau Peserta tidak ditemukan.",
        confirmText: "Mengerti",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    try {
      setSaving(true);
      const examineeId = currentParticipant.user_id || currentParticipant.id;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        setConfirmModal({
          isOpen: true,
          title: "Sesi Login Berakhir",
          message: "Sesi login penguji tidak ditemukan. Silakan login terlebih dahulu.",
          confirmText: "Mengerti",
          variant: "warning",
          isAlert: true,
          onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
        });
        return;
      }

      await submitExaminerEvaluation({
        session_id: activeSession.id,
        station_id: stationData.id,
        participant_id: examineeId,
        examiner_id: user.id,
        rotation_round: activeRotationIndex + 1,
        grs_rating: globalRating || "SATISFACTORY",
        examiner_notes: feedback || null,
        rubric_scores: rubricItems.map((r) => ({
          rubric_item_id: r.id,
          score_given: Number(rubricScores[r.id] || 0),
        })),
        is_locked: true,
      });

      toast.success("Penilaian berhasil disimpan & dikunci!");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving examiner evaluation:", err);
      toast.error(`Gagal menyimpan penilaian: ${err.message}`);
      setConfirmModal({
        isOpen: true,
        title: "Gagal Menyimpan Penilaian",
        message: "Gagal menyimpan penilaian: " + err.message,
        confirmText: "Mengerti",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-xs font-semibold text-slate-500">
        <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
        Memuat Portal Dokter Penguji Supabase...
      </div>
    );
  }

  if (!activeSession || !stationData) {
    const rawDoctorName = currentUserProfile?.full_name || "Dokter Penguji";
    const doctorName = rawDoctorName.toLowerCase().startsWith("dr") ? rawDoctorName : `dr. ${rawDoctorName}`;
    const doctorSpecialty = currentUserProfile?.specialty || "Spesialis Penguji OSCE";
    const doctorInst = currentUserProfile?.university || "Fakultas Kedokteran";

    return (
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        {/* Modern Hero Dashboard Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-blue-600/90 text-white flex items-center justify-center font-black text-2xl shadow-lg border-2 border-blue-400/30 shrink-0">
                <Stethoscope size={30} />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-500/20 px-3 py-0.5 text-[10px] font-black text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Ruang Pengujian OSCE
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Status: Standby Penugasan
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {doctorName}
                </h1>
                <p className="text-xs text-slate-300 font-medium">
                  {doctorSpecialty} • {doctorInst}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer backdrop-blur-xs"
              >
                <Activity size={15} />
                Muat Ulang
              </button>
              <button
                onClick={() => navigate("/examiner")}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-md shadow-rose-600/30 cursor-pointer"
              >
                <LogOut size={15} />
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CalendarDays className="text-blue-600" size={20} />
              Daftar Sesi Ujian Penugasan ({assignedSessionsList.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pilih kartu sesi ujian di bawah untuk masuk ke ruang pengujian stase Anda.
            </p>
          </div>
        </div>

        {assignedSessionsList.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {assignedSessionsList.map(({ session: s, assignment: a, station: st }) => {
              const sStatus = String(s.status || "").toLowerCase();
              const isOngoing = ["ongoing", "running", "waiting_room", "paused"].includes(sStatus);
              const isCompleted = ["completed", "finished", "selesai"].includes(sStatus);
              const isPublished = ["published", "scheduled"].includes(sStatus);
              const isDraft = sStatus === "draft";

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (isCompleted) {
                      navigate("/examiner/history");
                    } else if (!isDraft) {
                      setActiveSession(s);
                      setStationData(st);
                      navigate(`/examiner/stage/${st?.id || s.id}`);
                    }
                  }}
                  className={`rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 shadow-2xs transition flex flex-col justify-between ${
                    isDraft ? "opacity-70 cursor-not-allowed" : "hover:border-blue-300 hover:bg-white cursor-pointer active:scale-98"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {isOngoing && (
                        <span className="rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                          Live Berlangsung
                        </span>
                      )}
                      {isPublished && (
                        <span className="rounded-md bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                          Sesi Terjadwal
                        </span>
                      )}
                      {isCompleted && (
                        <span className="rounded-md bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-slate-600" />
                          Sesi Selesai
                        </span>
                      )}
                      {isDraft && (
                        <span className="rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                          Draft
                        </span>
                      )}

                      <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-900 inline-flex items-center gap-1 uppercase">
                        <CheckCircle2 size={11} className="text-emerald-700" />
                        Pos #{st?.station_number || a?.assigned_station_number || 1}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{s.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {st
                          ? `Pos Penugasan: Pos #${st.station_number} - ${st.case_title || st.title || "Kasus Medis"}`
                          : s.description || "Sesi evaluasi sirkuit terpadu stase aktif."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                        <span className="text-slate-400 text-[10px] block font-bold">Total Stase</span>
                        <span className="font-black text-slate-900">{s.total_stations || 8} Pos</span>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                        <span className="text-slate-400 text-[10px] block font-bold">Durasi Stase</span>
                        <span className="font-black text-slate-900">{s.station_duration_minutes || 12} Mnt</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60">
                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/examiner/history");
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition active:scale-95 shadow-sm cursor-pointer"
                      >
                        <History size={16} />
                        Lihat Riwayat & Rekap
                      </button>
                    ) : isDraft ? (
                      <button
                        type="button"
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-400 bg-slate-100 cursor-not-allowed border border-slate-200"
                      >
                        Belum Dipublikasikan
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer ${
                          isOngoing
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 animate-pulse"
                            : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
                        }`}
                      >
                        {isOngoing ? (
                          <>
                            <PlayCircle size={16} />
                            Masuk Sesi Live
                          </>
                        ) : (
                          <>
                            <Play size={15} />
                            Masuk Sesi
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-4 shadow-sm animate-in fade-in duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-xs">
              <Stethoscope size={30} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Belum Ada Sesi Ujian Penugasan</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                Anda belum memiliki jadwal penugasan stase aktif saat ini. Penugasan akan muncul di sini saat sesi dibuka oleh Admin.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer"
              >
                <Activity size={15} />
                Muat Ulang Jadwal
              </button>
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
      </div>
    );
  }

  const isOngoing = forceLiveView || activeSession.status === "ongoing" || activeSession.status === "running";

  // Dedicated Waiting Room UI when session is scheduled/published but not yet started live by Admin
  if (!isOngoing) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-2">
        {/* Realtime Broadcast Toast Overlay Component (Auto 5s & X Close Button) */}
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
                    <span>Broadcast Admin Control Room</span>
                    <span>•</span>
                    <span>{activeBroadcast.time}</span>
                  </div>
                  <p className="font-bold text-xs text-slate-100 mt-1 leading-snug break-words">
                    "{activeBroadcast.message}"
                  </p>
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


        {/* Clean Unified Waiting Room Header */}
        <div className="rounded-3xl border border-slate-700 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5">
                  <Clock size={12} className="text-amber-700" />
                  WAITING ROOM PENGUJI • STANDBY STASE
                </span>
                <span className="text-xs font-bold text-blue-300">
                  {activeSession.title}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Pos Penugasan #{stationData.station_number}: {stationData.case_title || stationData.title || "Kasus Medis SKDI"}
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Menunggu Admin Control Room memulai sesi ujian live. Layar akan otomatis beralih saat sesi dimulai.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setForceLiveView(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition"
              >
                <PlayCircle size={18} />
                Masuk Lembar Penilaian Live
              </button>
              <button
                onClick={handleExitExaminerWaitingRoom}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/20 px-4 py-3 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition shadow-2xs"
              >
                <LogOut size={16} />
                Keluar Waiting Room
              </button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lokasi & Gedung</span>
              <span className="font-extrabold text-white text-xs mt-0.5 block truncate">
                {activeSession.location_building || "Gedung Skill Lab Kedokteran"}
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Durasi Stase</span>
              <span className="font-extrabold text-white text-xs mt-0.5 block">
                {activeSession.station_duration_minutes || 12} Menit per Stase
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Jumlah Station Pos</span>
              <span className="font-extrabold text-white text-xs mt-0.5 block">
                {activeSession.total_stations || 6} Pos Rotasi
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Peserta Terdaftar</span>
              <span className="font-extrabold text-emerald-400 text-xs mt-0.5 block">
                {participants.length} Peserta Rotasi
              </span>
            </div>
          </div>
        </div>

        {/* Embedded Examiner Station Rotation Schedule Widget */}
        <ExaminerStationScheduleWidget
          sessionId={activeSession.id}
          stationNumber={stationData.station_number}
          activeRound={currentRoundNum}
        />

        {/* Live Presence Standby Participants & Examiners Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                Daftar Peserta Mahasiswa & Penguji Standby (Realtime Presence)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pantau status kehadiran peserta dan dokter penguji yang terhubung live di ruang tunggu secara real-time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-900 flex items-center gap-1.5 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {onlineUsers.length} Online Terhubung
              </span>
            </div>
          </div>

          {/* Online Presence Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Pengguna Terhubung di Ruang Tunggu ({onlineUsers.length}):
            </h4>

            {onlineUsers.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {onlineUsers.map((u, idx) => (
                  <div
                    key={u.user_id || idx}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 shadow-2xs hover:bg-white transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-extrabold text-sm border border-blue-200">
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
                      {u.role === "examiner" ? "Penguji" : u.role === "admin" ? "Admin" : "Standby Live"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500 font-medium">
                Belum ada peserta atau penguji lain yang terhubung di ruang tunggu.
              </div>
            )}
          </div>

          {/* Enrolled Session Participants List */}
          {participants && participants.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Daftar Peserta Terdaftar Sesi Ini ({participants.length} Peserta):
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Nama Peserta</th>
                      <th className="px-4 py-3">NIM</th>
                      <th className="px-4 py-3">Stase Awalan Rotasi</th>
                      <th className="px-4 py-3">Status Presensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
                    {participants.map((p, idx) => {
                      const isUserOnline = onlineUsers.some(
                        (u) =>
                          (u.user_id && (u.user_id === p.user_id || u.user_id === p.id)) ||
                          (u.email && p.email && u.email.toLowerCase() === p.email.toLowerCase()) ||
                          (u.full_name && p.full_name && u.full_name.toLowerCase().includes(p.full_name.toLowerCase()))
                      );

                      return (
                        <tr key={p.id || idx} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-bold text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {p.full_name || p.name || p.email || `Peserta #${idx + 1}`}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{p.nim || p.user_id?.slice(0, 8) || "-"}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-900">
                              Mulai Pos #{p.starting_station_number || ((idx % 6) + 1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {isUserOnline ? (
                              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black text-emerald-900 inline-flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Standby Online
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 inline-flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-slate-400" />
                                Offline / Belum Masuk
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Complete Station Scenario, Instructions, Gold Standard Keys & Rubric Preview Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
                  STASE #{stationData.station_number}
                </span>
                <span className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                  {stationData.system_organ || "Kardiovaskular"} • SKDI {stationData.skdi_level || "4A"}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-2">
                <FileText size={20} className="text-blue-600" />
                Detail Soal Stase, Skenario Medis & Kunci Rubrik Penilaian
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Dokter Penguji dapat mempelajari seluruh instrumen penilaian, skenario, kunci diagnosis, resep, serta berkas penunjang secara lengkap di ruang tunggu.
              </p>
            </div>
          </div>

          {/* Skenario Kasus Medis Naratif */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase mb-1 flex items-center gap-1.5">
              <Stethoscope size={15} className="text-blue-600" />
              Skenario Kasus Medis Utama
            </h4>
            <p className="text-slate-700 bg-slate-50 border border-slate-200 p-4 rounded-2xl leading-relaxed text-xs font-medium">
              {stationData.scenario || "Pasien datang dengan keluhan spesifik sesuai skenario stase medis ini. Peserta diwajibkan melakukan anamnesis terarah, pemeriksaan fisik kardiovaskular / spesifik, dan penetapan diagnosis kerja."}
            </p>
          </div>

          {/* Instructions Side-by-Side */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Instruksi Peserta Ujian</h4>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700 whitespace-pre-line text-xs font-medium leading-relaxed">
                {stationData.participant_instructions || stationData.participant_instruction || "1. Lakukan anamnesis terarah.\n2. Lakukan pemeriksaan fisik sesuai standar SOP.\n3. Sampaikan diagnosis kerja & terapi."}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Instruksi Dokter Penguji (Panduan Observasi)</h4>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700 whitespace-pre-line text-xs font-medium leading-relaxed">
                {stationData.examiner_instructions || stationData.examiner_instruction || "Amati kepatuhan prosedur sterilitas tangan, ketepatan auskultasi/pemeriksaan fisik, dan penyampaian edukasi ke pasien."}
              </div>
            </div>
          </div>

          {/* Kunci Jawaban Baku Diagnosis & Resep Medis (Gold Standard) */}
          {(stationData.answer_key_diagnosis || stationData.answer_key_prescription) && (
            <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
              {stationData.answer_key_diagnosis && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    Kunci Diagnosis Kerja (WDx) & Banding (DDx)
                  </h4>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs font-medium text-emerald-950 leading-relaxed whitespace-pre-line">
                    {stationData.answer_key_diagnosis}
                  </div>
                </div>
              )}

              {stationData.answer_key_prescription && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1 flex items-center gap-1.5">
                    <FileSpreadsheet size={15} className="text-blue-600" />
                    Kunci Jawaban Resep Medis Baku
                  </h4>
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs font-medium text-blue-950 leading-relaxed font-mono whitespace-pre-line">
                    {stationData.answer_key_prescription}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Berkas Penunjang (Auxiliary Exam Configs) */}
          {(() => {
            const auxConfigs = stationData.station_auxiliary_configs || stationData.auxiliary_exam_configs || stationData.auxiliary_files || [];
            return (
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase mb-1 flex items-center justify-between">
                  <span>Berkas Penunjang Tambahan (Radiologi / EKG / Lab)</span>
                  <span className="text-blue-600 text-[11px] font-semibold">
                    {auxConfigs.length} Berkas Terdaftar
                  </span>
                </h4>

                {auxConfigs.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {auxConfigs.map((aux, aIdx) => {
                      const imgUrl = aux.image_url || aux.imageUrl || aux.file_url;
                      const reportNote = aux.report_text || aux.reportText;
                      return (
                        <div key={aIdx} className="rounded-2xl bg-blue-50/80 border border-blue-200 p-3 text-xs space-y-1.5 max-w-sm flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-blue-950">{aux.name || aux.title || "Berkas Penunjang"}</span>
                            <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-extrabold uppercase">{aux.category || "Radiologi"}</span>
                          </div>
                          {reportNote && (
                            <p className="text-[11px] text-slate-700 font-medium leading-relaxed">Catatan: {reportNote}</p>
                          )}
                          {imgUrl && (
                            <a
                              href={imgUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-700 hover:underline mt-1 bg-white border border-blue-200 px-2.5 py-1 rounded-lg shadow-2xs"
                            >
                              <ExternalLink size={13} className="text-blue-600" />
                              <span>Lihat Lampiran Hasil / Drive</span>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Belum ada berkas penunjang yang dikonfigurasi untuk stase ini.</p>
                )}
              </div>
            );
          })()}

          {/* Complete Rubric Items List with 4-Level Descriptors */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award size={16} className="text-blue-600" />
                Checklist Rubrik Penilaian SKDI ({rubricItems.length} Item Rubrik):
              </span>
              <span className="text-blue-600 text-[11px] font-semibold">
                Skor 0 - 3 Standar AIPKI
              </span>
            </h4>

            {rubricItems.length > 0 ? (
              <div className="space-y-3">
                {rubricItems.map((item, idx) => {
                  const descObj = typeof item.descriptors === "object" && item.descriptors ? item.descriptors : {};
                  const s0 = item.description_score_0 || descObj.score_0 || descObj[0] || descObj["0"] || "Tidak dilakukan / Salah total";
                  const s1 = item.description_score_1 || descObj.score_1 || descObj[1] || descObj["1"] || "Minimal / Sebagian salah";
                  const s2 = item.description_score_2 || descObj.score_2 || descObj[2] || descObj["2"] || "Cukup / Memadai";
                  const s3 = item.description_score_3 || descObj.score_3 || descObj[3] || descObj["3"] || "Sempurna & Lengkap";

                  return (
                    <div key={item.id || idx} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 font-extrabold text-white text-xs">
                            #{idx + 1}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900">
                            {item.question || item.title || item.name}
                          </h5>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2.5 py-0.5 border border-blue-200">
                            Bobot x{item.weight || 1}
                          </span>
                          <span className="rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2.5 py-0.5 border border-emerald-200">
                            Maks {item.max_points || 3} Poin
                          </span>
                        </div>
                      </div>

                      {(item.answer_key || item.description) && (
                        <p className="text-[11px] font-medium text-emerald-900 bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                          <strong>Kunci Jawaban:</strong> {item.answer_key || item.description}
                        </p>
                      )}

                      {/* 4-Level Descriptors Grid (0-3) */}
                      <div className="grid gap-2 sm:grid-cols-4 text-[11px] pt-1">
                        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-2 text-rose-900">
                          <span className="font-extrabold text-[10px] uppercase block text-rose-700">Skor 0</span>
                          <p className="mt-0.5 leading-snug">{s0}</p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2 text-amber-900">
                          <span className="font-extrabold text-[10px] uppercase block text-amber-700">Skor 1</span>
                          <p className="mt-0.5 leading-snug">{s1}</p>
                        </div>
                        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-2 text-blue-900">
                          <span className="font-extrabold text-[10px] uppercase block text-blue-700">Skor 2</span>
                          <p className="mt-0.5 leading-snug">{s2}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 text-emerald-900">
                          <span className="font-extrabold text-[10px] uppercase block text-emerald-700">Skor 3</span>
                          <p className="mt-0.5 leading-snug">{s3}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada item rubrik penilaian yang tersimpan pada stase ini.</p>
            )}
          </div>
        </div>

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

  return (
    <div className="space-y-6 relative">
      {/* Realtime Broadcast Toast Overlay Component (Auto 5s & X Close Button) */}
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
                  <span>Broadcast Admin Control Room</span>
                  <span>•</span>
                  <span>{activeBroadcast.time}</span>
                </div>
                <p className="font-bold text-xs text-slate-100 mt-1 leading-snug break-words">
                  "{activeBroadcast.message}"
                </p>
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

      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 shadow-2xs sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <button
            onClick={handleExitExaminerWaitingRoom}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl transition shadow-2xs"
          >
            <LogOut size={15} />
            Keluar ke Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold shadow-2xs ${
              timerState?.phase === "transition"
                ? "border-amber-300 bg-amber-100 text-amber-950 font-black"
                : timerState?.phase === "break"
                ? "border-blue-300 bg-blue-100 text-blue-950"
                : timerState?.phase === "paused"
                ? "border-rose-300 bg-rose-50 text-rose-950"
                : "border-blue-200 bg-blue-50/90 text-blue-950"
            }`}>
              <Clock size={16} className={timerState?.phase === "paused" ? "text-rose-600" : "text-blue-600 animate-pulse"} />
              <span>
                {timerState?.phase === "transition"
                  ? "Transisi Pergerakan Peserta:"
                  : timerState?.phase === "break"
                  ? "Waktu Istirahat Ronde:"
                  : timerState?.phase === "paused"
                  ? "Timer Paused Admin:"
                  : "Timer Stase Ujian:"}
              </span>
              <span className="font-mono text-sm font-black">
                {Math.floor(remainingSeconds / 60).toString().padStart(2, "0")}:
                {(remainingSeconds % 60).toString().padStart(2, "0")}
              </span>
              {timerState?.phase && (
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-black text-white uppercase ml-1 ${
                  timerState.phase === 'transition'
                    ? 'bg-amber-600'
                    : timerState.phase === 'break'
                    ? 'bg-indigo-600'
                    : timerState.phase === 'paused'
                    ? 'bg-rose-600'
                    : 'bg-emerald-600'
                }`}>
                  {timerState.phase}
                </span>
              )}
            </div>

            <button
              onClick={handleSaveEvaluation}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Simpan Penilaian
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl w-full mx-auto space-y-6">
        {timerState?.phase === "transition" && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-md flex items-center gap-3">
            <Clock size={20} className="text-amber-600 animate-pulse shrink-0" />
            <div className="text-xs font-bold">
              <span className="font-extrabold uppercase text-amber-900 block">FASE TRANSISI PERGERAKAN PESERTA (2 MENIT):</span>
              Peserta sedang melakukan perpindahan pos stase rotasi. Penguji dapat mempersiapkan lembar penilaian untuk peserta ronde berikutnya.
            </div>
          </div>
        )}

        {timerState?.phase === "paused" && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-950 shadow-md flex items-center gap-3">
            <AlertCircle size={20} className="text-rose-600 shrink-0" />
            <div className="text-xs font-bold">
              <span className="font-extrabold uppercase text-rose-900 block">TIMER DI-PAUSE OLEH ADMIN CONTROL DESK:</span>
              Jadwal timer sesi ujian di-pause sementara. Penilaian yang sudah diisi tetap tersimpan di draf.
            </div>
          </div>
        )}
        {forceLiveView && activeSession.status !== "ongoing" && (
          <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <Clock size={18} className="text-amber-600 animate-pulse" />
              <span>Mode Penilaian Mandiri: Waktu ujian belum dimulai. Penilaian tetap dapat disimpan.</span>
            </div>
            <button
              onClick={() => setForceLiveView(false)}
              className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs shrink-0 cursor-pointer"
            >
              Kembali ke Ruang Tunggu
            </button>
          </div>
        )}
        {saveSuccess && (
          <div className="rounded-2xl border border-emerald-400 bg-emerald-500 p-4 text-white shadow-lg flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <CheckCircle2 size={20} className="animate-bounce" />
            <span className="text-xs font-black uppercase tracking-wider">
              Penilaian Evaluasi Rubrik SKDI Berhasil Disimpan & Dikunci di Supabase!
            </span>
          </div>
        )}

        {activeSession && (activeSession.status === "published" || activeSession.status === "scheduled") && (
          <div className="rounded-2xl border border-blue-300 bg-blue-50/90 p-4 text-blue-900 shadow-sm flex items-start gap-3">
            <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <p className="font-extrabold uppercase tracking-wider text-blue-950">
                MODE PRATINJAU STASE (SESI TERJADWAL)
              </p>
              <p className="font-medium text-slate-700 leading-relaxed">
                Sesi ujian sirkuit live belum diaktifkan oleh Admin Control Room. Anda saat ini dapat memeriksa skenario kasus, instruksi penguji, dan rubrik penilaian SKDI dalam mode pratinjau.
              </p>
            </div>
          </div>
        )}

        {/* Station Title Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-[10px] font-black text-white uppercase">
                STASE #{stationData?.station_number || 1} EXAMINER DUAL-PANEL FEED
              </span>
              <h1 className="text-lg font-black text-slate-900 mt-1">
                {stationData?.title || "Stase 1: Anamnesis & Pemeriksaan Jantung"}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Kasus Medis: <strong className="text-slate-900">{stationData?.case_title || "STEMI Anteroseptal"}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScenario(!showScenario)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                <Eye size={15} />
                {showScenario ? "Sembunyikan Skenario" : "Skenario & Petunjuk Penguji"}
              </button>
            </div>
          </div>

          {showScenario && (
            <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-4 space-y-2 text-xs animate-in fade-in duration-200">
              <div>
                <h4 className="font-bold text-blue-900 uppercase">Skenario Utama Penguji:</h4>
                <p className="text-slate-700 mt-0.5 font-medium leading-relaxed">{stationData?.scenario || "Seorang laki-laki 55 tahun keluhan nyeri dada hebat."}</p>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 uppercase">Instruksi Penguji:</h4>
                <p className="text-slate-700 mt-0.5 font-medium">{stationData?.examiner_instructions || "Amati kesantunan, teknik auskultasi 4 katup, dan diagnosis STEMI."}</p>
              </div>
            </div>
          )}

          {/* Rotation Participants Switcher */}
          <div className="pt-1 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Ronde Rotasi Peserta:</span>
            {participants.map((p, idx) => {
              const isCurrentRoundParticipant = Number(p.starting_station_number) === targetStartingStation;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveRotationIndex(idx)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 border whitespace-nowrap ${
                    activeRotationIndex === idx
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : isCurrentRoundParticipant
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>R{idx + 1}:</span>
                  <span className="font-extrabold">{p.full_name || p.name}</span>
                  {isCurrentRoundParticipant && (
                    <span className="rounded-full bg-emerald-500 text-white px-1.5 py-0.5 text-[9px] font-black uppercase">
                      Aktif
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Dual-Panel Grid Container */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT PANEL: LIVE CANDIDATE FEED & ANSWERS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Candidate Header Profile & Step Progress Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {currentParticipant ? (currentParticipant.full_name || currentParticipant.name) : "Belum Ada Peserta di Pos Stase"}
                    </h3>
                    <p className="text-[11px] font-bold text-blue-600">
                      NIM: {currentParticipant ? (currentParticipant.nim || "—") : "—"} • Mahasiswa Klinik
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-[10px] font-black text-emerald-900 uppercase">
                  LIVE UJIAN
                </span>
              </div>

              {/* Step Progress Badge Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>Tahapan Pengerjaan Stase:</span>
                  <span className="text-blue-600 font-extrabold">Tahap 4 dari 4 (Diagnosis & Resep)</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <div className="h-2 rounded-full bg-emerald-500" title="1. Anamnesis" />
                  <div className="h-2 rounded-full bg-emerald-500" title="2. Pemeriksaan Fisik" />
                  <div className="h-2 rounded-full bg-emerald-500" title="3. Penunjang" />
                  <div className="h-2 rounded-full bg-blue-600 animate-pulse" title="4. Diagnosis & Resep" />
                </div>
              </div>
            </div>

            {/* Candidate Answers Live Display Card */}
            <div className="rounded-3xl border border-blue-200 bg-blue-50/40 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
                <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-blue-600" />
                  Lembar Isian Live Peserta
                </h3>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  Sync Real-Time
                </span>
              </div>

              {/* Working Diagnosis WDx */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
                  Diagnosis Kerja Utama (WDx):
                </label>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-900 shadow-2xs">
                  {liveAnswer?.working_diagnosis || (currentParticipant ? "Peserta belum mengisi WDx" : "Belum ada peserta di stase ini")}
                </div>
              </div>

              {/* Differential Diagnoses DDx */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
                  Diagnosis Banding (DDx 1 - 3):
                </label>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 space-y-1 shadow-2xs">
                  <p>1. {liveAnswer?.differential_dx_1 || "Belum diisi"}</p>
                  <p>2. {liveAnswer?.differential_dx_2 || "Belum diisi"}</p>
                  <p>3. {liveAnswer?.differential_dx_3 || "Belum diisi"}</p>
                </div>
              </div>

              {/* Prescription Text Area */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
                  Blangko Resep Obat (Farmakoterapi):
                </label>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-900 leading-relaxed whitespace-pre-line shadow-2xs">
                  {liveAnswer?.prescription_text || "Belum ada penulisan resep obat oleh peserta"}
                </div>
              </div>

              {/* Opened Auxiliary Tests List */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
                    Berkas Penunjang yang Diberikan ke Peserta:
                  </label>
                  {safeParseAuxiliaryList(liveAnswer).length > 0 && (
                    <button
                      onClick={() => setSelectedAuxModalResults(safeParseAuxiliaryList(liveAnswer))}
                      className="text-[10px] font-extrabold text-blue-600 hover:text-blue-800 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={12} /> Buka Semua ({safeParseAuxiliaryList(liveAnswer).length})
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {safeParseAuxiliaryList(liveAnswer).length > 0 ? (
                    safeParseAuxiliaryList(liveAnswer).map((aux, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => setSelectedAuxModalResults([aux])}
                        className="rounded-md bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[10px] font-extrabold text-emerald-900 inline-flex items-center gap-1 hover:bg-emerald-200 transition cursor-pointer active:scale-95 shadow-2xs"
                        title="Klik untuk membuka pratinjau berkas penunjang"
                      >
                        <CheckCircle2 size={12} className="text-emerald-700" />
                        {aux.name}
                        <Eye size={11} className="text-emerald-700 ml-0.5" />
                      </button>
                    ))
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">
                      Belum ada berkas penunjang yang diminta oleh peserta pada stase ini.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: SIDE-BY-SIDE GOLD STANDARD & SCORING (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Gold Standard Reference Key Accordion (Side-by-Side Comparison) */}
            <div className="rounded-3xl border border-emerald-300 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-400/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase">
                    GOLD STANDARD REFERENCE
                  </span>
                  <h3 className="text-sm font-black text-white">
                    Acuan Kunci Jawaban Resmi Admin
                  </h3>
                </div>
                <button
                  onClick={() => setShowScenario(!showScenario)}
                  className="text-xs font-bold text-emerald-300 hover:text-white transition underline"
                >
                  {showScenario ? "Sembunyikan Skenario" : "Lihat Skenario Lengkap"}
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-300 uppercase block">Kunci Diagnosis (WDx & DDx):</span>
                  <p className="font-semibold text-slate-100 leading-relaxed whitespace-pre-line">
                    {stationData?.answer_key_diagnosis || "Belum ada kunci diagnosis yang dikonfigurasi untuk stase ini."}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-300 uppercase block">Kunci Resep Baku (Rx):</span>
                  <p className="font-semibold text-slate-100 leading-relaxed font-mono whitespace-pre-line">
                    {stationData?.answer_key_prescription || "Belum ada kunci resep obat yang dikonfigurasi untuk stase ini."}
                  </p>
                </div>

                {/* Master Kunci Berkas Penunjang Tambahan */}
                {(() => {
                  const masterAux = stationData?.station_auxiliary_configs || stationData?.auxiliary_exam_configs || stationData?.auxiliary_files || [];
                  if (!masterAux || masterAux.length === 0) return null;
                  return (
                    <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 space-y-1.5 sm:col-span-2">
                      <span className="text-[10px] font-extrabold text-emerald-300 uppercase block">Kunci Berkas Penunjang Baku (Radiologi / EKG / Lab):</span>
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {masterAux.map((aux, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            onClick={() => setSelectedAuxModalResults([aux])}
                            className="rounded-lg bg-emerald-500/20 border border-emerald-400/50 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/40 transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <span>{aux.name || aux.title || "Berkas Penunjang"}</span>
                            <span className="text-[9px] bg-emerald-400/30 text-emerald-200 px-1.5 py-0.5 rounded font-extrabold">{aux.category || "RADIOLOGI"}</span>
                            <Eye size={13} className="text-emerald-300 ml-1" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {stationData?.answer_key_physical_exam && (
                  <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 space-y-1 sm:col-span-2">
                    <span className="text-[10px] font-extrabold text-emerald-300 uppercase block">Kunci Pemeriksaan Fisik Baku:</span>
                    <p className="font-semibold text-slate-100 leading-relaxed whitespace-pre-line">
                      {stationData.answer_key_physical_exam}
                    </p>
                  </div>
                )}
              </div>

              {showScenario && (
                <div className="rounded-2xl bg-slate-900/90 border border-emerald-400/40 p-4 space-y-2 text-xs text-slate-200 animate-in fade-in duration-200">
                  <p><strong>Skenario Klinis:</strong> {stationData?.scenario || "Skenario kasus medis terstandar untuk stase ini."}</p>
                  <p><strong>Instruksi Penguji:</strong> {stationData?.examiner_instructions || "Amati kesantunan, komunikasi, dan keterampilan klinis peserta."}</p>
                </div>
              )}
            </div>

            {/* Rubric Scoring Items List */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Award size={18} className="text-blue-600" />
                Rubrik Penilaian Objektif Deskriptor SKDI ({rubricItems.length} Item Penilaian)
              </h2>

              <div className="space-y-4">
                {rubricItems.map((rub, rIdx) => {
                  const scoreVal = rubricScores[rub.id] ?? 3;
                  const itemTitle = rub.title || rub.question || rub.name || `Item Rubrik #${rIdx + 1}`;
                  const itemDesc = rub.description || rub.answer_key || "";
                  const desc0 = rub.description_score_0 || rub.descriptors?.[0] || "0: Tidak Dilakukan / Salah Total";
                  const desc1 = rub.description_score_1 || rub.descriptors?.[1] || "1: Minimal / Sebagian Salah";
                  const desc2 = rub.description_score_2 || rub.descriptors?.[2] || "2: Cukup / Memadai";
                  const desc3 = rub.description_score_3 || rub.descriptors?.[3] || "3: Sempurna & Lengkap";

                  const opts = [
                    { val: 0, label: "Poin 0", desc: desc0, short: "Salah Total" },
                    { val: 1, label: "Poin 1", desc: desc1, short: "Minimal" },
                    { val: 2, label: "Poin 2", desc: desc2, short: "Memadai" },
                    { val: 3, label: "Poin 3", desc: desc3, short: "Sempurna" },
                  ];

                  return (
                    <div key={rub.id || rIdx} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="rounded-md bg-blue-100 text-blue-900 px-2 py-0.5 text-[10px] font-extrabold uppercase mr-2">
                            Bobot x{rub.weight || 1}
                          </span>
                          <h3 className="text-xs font-extrabold text-slate-900 inline">
                            {rIdx + 1}. {itemTitle}
                          </h3>
                          {itemDesc && (
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {itemDesc}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md shrink-0">
                          Skor: {scoreVal} / {rub.max_points || 3} Pts
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {opts.map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => handleScoreChange(rub.id, opt.val)}
                            title={opt.desc}
                            className={`rounded-xl border p-2.5 text-center text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                              scoreVal === opt.val
                                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                            }`}
                          >
                            <span>{opt.label}</span>
                            <span className="text-[9px] font-medium opacity-80 line-clamp-1">{opt.desc || opt.short}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Global Performance Rating Scale (GRS) & Feedback Form */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserCheck size={18} className="text-purple-600" />
                Global Performance Rating Scale (GRS) & Feedback Kualitatif
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Penilaian Kualitatif Holistik (Global Rating Scale):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: "SUPERIOR", label: "Superior (Sangat Baik)" },
                      { value: "SATISFACTORY", label: "Satisfactory (Lulus)" },
                      { value: "BORDERLINE", label: "Borderline (Ragu)" },
                      { value: "UNSATISFACTORY", label: "Unsatisfactory (Tidak Lulus)" },
                    ].map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setGlobalRating(g.value)}
                        className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                          globalRating === g.value
                            ? "bg-purple-600 text-white border-purple-600 shadow-md"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Feedback Kualitatif Dokter Penguji:
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Berikan saran perbaikan atau pujian atas teknik komunikasi dan tindakan klinis peserta..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuxiliaryExamResultModal
        isOpen={!!selectedAuxModalResults}
        onClose={() => setSelectedAuxModalResults(null)}
        results={selectedAuxModalResults || []}
      />



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