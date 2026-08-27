import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  Users,
  AlertCircle,
  Eye,
  Activity,
  FileSpreadsheet,
  Save,
  Loader2,
  Info,
  CalendarDays,
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
import { submitExaminerEvaluation, findExaminerAssignment } from "@/services/examinerService";
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
import ExaminerParticipantAnswerViewer from "@/features/examiner/components/ExaminerParticipantAnswerViewer";
import ExaminerRubricEvaluationSheet from "@/features/examiner/components/ExaminerRubricEvaluationSheet";
import ExaminerGlobalRatingSheet from "@/features/examiner/components/ExaminerGlobalRatingSheet";
import ExaminerSessionsList from "@/features/examiner/components/ExaminerSessionsList";
import ExaminerWaitingRoom from "@/features/examiner/components/ExaminerWaitingRoom";
import ExaminerBreakStationView from "@/features/examiner/components/ExaminerBreakStationView";
import ExaminerGoldStandardReference from "@/features/examiner/components/ExaminerGoldStandardReference";
import { playOsceAudio, stopAllAudio } from "@/services/audioService";

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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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
          try {
            const { data: profData, error: profErr } = await supabase
              .schema("public")
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .maybeSingle();

            if (!profErr && profData) {
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
          } catch (e) {
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

          const { assignment, station } = findExaminerAssignment(sessionExs, sessionSts, user, userProf);

          assignedList.push({
            session: s,
            assignment,
            station,
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
            // 2. Fallback: targetParamId is a session_id
            const { data: sessSts } = await supabase
              .schema("osce")
              .from("stations")
              .select(`*, rubric_items (*), station_auxiliary_configs (*)`)
              .eq("session_id", targetParamId)
              .order("station_number");

            if (sessSts && sessSts.length > 0) {
              const sessionExs = (allExaminers || []).filter((e) => e.session_id === targetParamId);
              const found = findExaminerAssignment(sessionExs, sessSts, user, userProf);
              st = found.station;
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

          if (stData && stData.length > 0) {
            const sessionExs = (allExaminers || []).filter((e) => e.session_id === targetSess.id);
            const found = findExaminerAssignment(sessionExs, stData, user, userProf);
            st = found.station;
          }
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

          // Helper for valid Postgres osce.competency_area enum
          const mapToValidCompetency = (comp) => {
            if (!comp) return "ANAMNESIS";
            const upper = String(comp).toUpperCase();
            if (upper.includes("ANAMNES")) return "ANAMNESIS";
            if (upper.includes("FISIK") || upper.includes("PHYSICAL")) return "PHYSICAL_EXAM";
            if (upper.includes("PENUNJANG") || upper.includes("AUXILIARY") || upper.includes("LAB") || upper.includes("RADIO")) return "AUXILIARY_EXAM";
            if (upper.includes("DIAGNOS") || upper.includes("DDX") || upper.includes("WDX")) return "DIAGNOSIS_DDX";
            if (upper.includes("FARMAKO") || upper.includes("RESEP") || upper.includes("OBAT") || upper.includes("PHARMACO")) return "PHARMACOTHERAPY";
            if (upper.includes("NON_FARMAKO") || upper.includes("EDUKASI") || upper.includes("NON_PHARMACO")) return "NON_PHARMACOTHERAPY";
            if (upper.includes("KOMUNIKASI") || upper.includes("COMMUNIC") || upper.includes("SAMBUNG")) return "COMMUNICATION";
            if (upper.includes("PROFES") || upper.includes("ETIK") || upper.includes("MORAL")) return "PROFESSIONALISM";
            return "ANAMNESIS";
          };

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
                question: item.question || item.title || item.name || `Item Rubrik #${idx + 1}`,
                answer_key: item.answer_key || item.description || "",
                max_points: Number(item.max_points) || 3,
                weight: Number(item.weight) || 1.0,
                competency_area: mapToValidCompetency(item.competency_area),
                descriptors: {
                  score_0: item.description_score_0 || item.descriptors?.score_0 || item.descriptors?.[0] || "0: Tidak Dilakukan / Salah Total",
                  score_1: item.description_score_1 || item.descriptors?.score_1 || item.descriptors?.[1] || "1: Minimal / Sebagian Salah",
                  score_2: item.description_score_2 || item.descriptors?.score_2 || item.descriptors?.[2] || "2: Cukup / Memadai",
                  score_3: item.description_score_3 || item.descriptors?.score_3 || item.descriptors?.[3] || "3: Sempurna & Lengkap",
                },
                sort_order: idx,
              }));
            } else {
              itemsToInsert = [
                {
                  station_id: st.id,
                  question_number: 1,
                  question: "Komunikasi & Anamnesis Terarah",
                  answer_key: mergedStation.participant_instructions || "Anamnesis terstruktur",
                  max_points: 3,
                  weight: 2.0,
                  competency_area: "ANAMNESIS",
                  descriptors: {
                    score_0: "0: Tidak dilakukan / Salah Total",
                    score_1: "1: Minimal / Sebagian Salah",
                    score_2: "2: Cukup / Memadai",
                    score_3: "3: Sempurna & Lengkap",
                  },
                  sort_order: 0,
                },
                {
                  station_id: st.id,
                  question_number: 2,
                  question: "Pemeriksaan Fisik & Usulan Penunjang",
                  answer_key: "Pemeriksaan fisik & penunjang terarah",
                  max_points: 3,
                  weight: 3.0,
                  competency_area: "PHYSICAL_EXAM",
                  descriptors: {
                    score_0: "0: Tidak dilakukan / Salah Total",
                    score_1: "1: Minimal / Sebagian Salah",
                    score_2: "2: Cukup / Memadai",
                    score_3: "3: Sempurna & Lengkap",
                  },
                  sort_order: 1,
                },
                {
                  station_id: st.id,
                  question_number: 3,
                  question: "Diagnosis Kerja (WDx) & Diagnosis Banding (DDx)",
                  answer_key: mergedStation.answer_key_diagnosis || "WDx & DDx sesuai kasus",
                  max_points: 3,
                  weight: 4.0,
                  competency_area: "DIAGNOSIS_DDX",
                  descriptors: {
                    score_0: "0: Salah total",
                    score_1: "1: Kurang tepat",
                    score_2: "2: Tepat",
                    score_3: "3: Sempurna",
                  },
                  sort_order: 2,
                },
                {
                  station_id: st.id,
                  question_number: 4,
                  question: "Tatalaksana Farmakoterapi & Resep Medis",
                  answer_key: mergedStation.answer_key_prescription || "Resep medis terstruktur",
                  max_points: 3,
                  weight: 4.0,
                  competency_area: "PHARMACOTHERAPY",
                  descriptors: {
                    score_0: "0: Resep salah total",
                    score_1: "1: Dosis / aturan pakai kurang tepat",
                    score_2: "2: Tepat",
                    score_3: "3: Sempurna & Lengkap",
                  },
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

          // Fetch session participants from Supabase (Approved/Active only)
          const { data: pList } = await supabase
            .schema("osce")
            .from("session_participants")
            .select("*")
            .eq("session_id", st.session_id);

          const approvedPList = (pList || []).filter((p) => {
            const stStatus = (p.status || "").toLowerCase();
            return stStatus === "approved" || stStatus === "active";
          });

          setParticipants(approvedPList);
        }
      } catch (err) {
        console.error("Error loading station detail for examiner:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStationDetail();
  }, [targetParamId]);

  // Realtime subscription for session_participants list updates (Approved/Active only)
  useEffect(() => {
    if (!activeSession?.id) return;

    const fetchParticipantsList = async () => {
      const { data: pList } = await supabase
        .schema("osce")
        .from("session_participants")
        .select("*")
        .eq("session_id", activeSession.id);

      const approvedPList = (pList || []).filter((p) => {
        const stStatus = (p.status || "").toLowerCase();
        return stStatus === "approved" || stStatus === "active";
      });

      setParticipants(approvedPList);
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

  function renderDifferentialDiagnosis(answer) {
    if (!answer) return <span className="text-slate-400 italic font-medium">Belum diisi oleh peserta</span>;

    const d1 = answer.differential_dx_1?.trim();
    const d2 = answer.differential_dx_2?.trim();
    const d3 = answer.differential_dx_3?.trim();

    if (d1 && (!d2 && !d3)) {
      return (
        <div className="whitespace-pre-line leading-relaxed text-xs font-medium text-slate-800">
          {d1}
        </div>
      );
    }

    const items = [d1, d2, d3].filter(Boolean);
    if (items.length > 0) {
      return (
        <div className="space-y-1 text-xs font-medium text-slate-800">
          {items.map((item, idx) => {
            const hasNumbering = /^\d+[.)]/.test(item);
            return (
              <p key={idx} className="leading-relaxed">
                {hasNumbering ? item : `${idx + 1}. ${item}`}
              </p>
            );
          })}
        </div>
      );
    }

    return <span className="text-slate-400 italic font-medium">Belum diisi oleh peserta</span>;
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
        if (newTimerState.phase === "finished" || newTimerState.phase === "completed") {
          toast.info("Sesi OSCE telah diakhiri oleh Admin Control Room. Dialihkan ke Dashboard.", { duration: 5000 });
          navigate("/examiner");
          return;
        }
        const rem = calcRemaining(
          newTimerState.target_end_time,
          newTimerState.paused_remaining_ms,
          newTimerState.phase === "paused"
        );
        setRemainingSeconds(rem);
      },
      onBell: (bellData) => {
        const bType = bellData?.bell_type;
        if (bType === "waiting_room" || bType === "start_osce" || bType === "waiting") {
          toast.info("Sesi OSCE Dimulai: Persiapan Pos Stase", {
            id: "osce-bell-status",
            description: "Peserta sedang bersiap di depan pintu stase masing-masing.",
            duration: 6000,
          });
        } else if (bType === "read_scenario" || bType === "transit" || bType === "reading") {
          toast.info("Waktu Membaca Skenario Kasus", {
            id: "osce-bell-status",
            description: "Peserta sedang membaca instruksi skenario di luar pintu stase.",
            duration: 6000,
          });
        } else if (bType === "pause") {
          toast.warning("Sesi Ujian Dihentikan Sementara oleh Admin Control Room.", {
            id: "osce-bell-status",
            description: "Timer stase dibekukan sementara.",
            duration: 6000,
          });
        } else if (bType === "resume") {
          toast.success("Sesi Ujian Dilanjutkan Kembali.", {
            id: "osce-bell-status",
            description: "Silakan melanjutkan proses penilaian peserta.",
            duration: 5000,
          });
        } else if (bType === "warning" || bType === "warning_3min") {
          toast.warning("Peringatan Waktu: Sisa Waktu Stase 3 Menit!", {
            id: "osce-bell-status",
            description: "Waktu pengerjaan stase peserta tersisa 3 menit lagi.",
            duration: 5000,
          });
        } else if (bType === "rotation" || bType === "stop_transit") {
          toast.info("Waktu Stase Telah Selesai!", {
            id: "osce-bell-status",
            description: "Peserta berpindah pos stase. Mohon selesaikan pengisian rubrik penilaian.",
            duration: 6000,
          });
        } else if (bType === "start" || bType === "start_exam") {
          toast.success("Waktu Membaca Selesai! Peserta Memasuki Stase.", {
            id: "osce-bell-status",
            description: "Ujian stase ronde aktif telah dimulai.",
            duration: 6000,
          });
        } else if (bType === "finish" || bType === "finish_exam") {
          toast.dismiss();
          toast.success("Seluruh Rangkaian Ujian OSCE Selesai!", {
            id: "osce-bell-status",
            description: "Terima kasih atas partisipasi Anda.",
            duration: 8000,
          });
        }
      },
      onSessionUpdate: (sess) => {
        if (sess) {
          if (sess.status === "completed" || sess.status === "finished") {
            toast.dismiss();
            toast.info("Sesi OSCE telah diakhiri oleh Admin Control Room. Dialihkan ke Dashboard.", { duration: 5000 });
            navigate("/examiner");
            return;
          }
          setActiveSession((prev) => (prev ? { ...prev, ...sess } : null));
        }
      },
      onBroadcast: (msg) => {
        if (!msg) return;
        const target = String(msg.target_role || "all").toLowerCase();
        if (target === "all" || target === "examiners" || target === "penguji") {
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

  const prevRemainingRef = useRef(null);

  // Stop all audio when unmounting
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

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

  // Memoized draft storage key for active examinee / station / rotation
  const draftStorageKey = useMemo(() => {
    if (!activeSession?.id || !stationData?.id || !currentParticipant) return null;
    const examineeId = currentParticipant.user_id || currentParticipant.id;
    const rotRound = activeRotationIndex + 1;
    return `osce_examiner_draft_${activeSession.id}_${stationData.id}_${examineeId}_${rotRound}`;
  }, [activeSession?.id, stationData?.id, currentParticipant?.id, currentParticipant?.user_id, activeRotationIndex]);

  // Debounced auto-save draft to localStorage (Safety net before submit)
  useEffect(() => {
    if (!draftStorageKey || loading) return;
    const timer = setTimeout(() => {
      try {
        if (rubricScores && Object.keys(rubricScores).length > 0) {
          const draftData = {
            rubricScores,
            globalRating,
            feedback,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(draftStorageKey, JSON.stringify(draftData));
        }
      } catch (e) {
        console.warn("Could not save examiner draft to localStorage:", e);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [draftStorageKey, rubricScores, globalRating, feedback, loading]);

  // Fetch saved evaluation from Supabase or restore draft from localStorage whenever active examinee / station / rotation changes
  useEffect(() => {
    if (!activeSession?.id || !stationData?.id || !currentParticipant) return;

    const examineeId = currentParticipant.user_id || currentParticipant.id;
    const rotRound = activeRotationIndex + 1;

    async function loadSavedEvaluation() {
      try {
        const localSavedKey = `osce_eval_${activeSession.id}_${stationData.id}_${examineeId}_${rotRound}`;
        const localSavedStr = localStorage.getItem(localSavedKey) || (draftStorageKey ? localStorage.getItem(draftStorageKey) : null);
        let localScoresMap = {};
        let localRating = null;
        let localNotes = null;

        if (localSavedStr) {
          try {
            const parsed = JSON.parse(localSavedStr);
            if (parsed.globalRating) localRating = parsed.globalRating;
            if (parsed.feedback !== undefined) localNotes = parsed.feedback;
            if (parsed.rubricScores && typeof parsed.rubricScores === "object") {
              localScoresMap = { ...parsed.rubricScores };
            }
          } catch (e) {}
        }

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
          setGlobalRating(evalRecord.grs_rating || localRating || "SATISFACTORY");
          setFeedback(evalRecord.examiner_notes ?? localNotes ?? "");
          const scoresMap = { ...localScoresMap };
          (evalRecord.rubric_scores || []).forEach((sc) => {
            scoresMap[sc.rubric_item_id] = Number(sc.score_given);
          });
          setRubricScores(scoresMap);
        } else {
          if (Object.keys(localScoresMap).length > 0) {
            if (localRating) setGlobalRating(localRating);
            if (localNotes !== null) setFeedback(localNotes);
            setRubricScores(localScoresMap);
          } else {
            setGlobalRating("SATISFACTORY");
            setFeedback("");
            const defaultScores = {};
            rubricItems.forEach((r) => {
              defaultScores[r.id] = 3;
            });
            setRubricScores(defaultScores);
          }
        }
      } catch (err) {
        console.warn("Could not load saved evaluation from Supabase:", err);
      }
    }

    loadSavedEvaluation();
  }, [activeSession?.id, stationData?.id, currentParticipant?.id, currentParticipant?.user_id, activeRotationIndex, rubricItems, draftStorageKey]);

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
        rubric_scores: rubricItems.map((r, idx) => {
          const itemKey = r.id || `rubric-${idx}`;
          const val =
            rubricScores[r.id] ??
            (r.id ? rubricScores[String(r.id)] : undefined) ??
            rubricScores[`rubric-${idx}`] ??
            rubricScores[idx] ??
            3;
          return {
            rubric_item_id: itemKey,
            score_given: Number(val),
            weight: Number(r.weight) || 1.0,
            max_points: Number(r.max_points) || 3,
          };
        }),
        is_locked: true,
      });

      // Clear draft in localStorage after successful permanent sync
      if (draftStorageKey) {
        try {
          localStorage.removeItem(draftStorageKey);
        } catch (e) {}
      }

      toast.success("Penilaian berhasil disinkronkan & dikunci di Supabase!");
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
    return (
      <ExaminerSessionsList
        currentUserProfile={currentUserProfile}
        assignedSessionsList={assignedSessionsList}
        setActiveSession={setActiveSession}
        setStationData={setStationData}
        navigate={navigate}
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
      />
    );
  }

  const isOngoing = forceLiveView || activeSession.status === "ongoing" || activeSession.status === "running";

  // Dedicated Waiting Room UI when session is scheduled/published but not yet started live by Admin
  if (!isOngoing) {
    return (
      <ExaminerWaitingRoom
        activeBroadcast={activeBroadcast}
        setActiveBroadcast={setActiveBroadcast}
        activeSession={activeSession}
        stationData={stationData}
        participants={participants}
        onlineUsers={onlineUsers}
        rubricItems={rubricItems}
        currentRoundNum={currentRoundNum}
        setForceLiveView={setForceLiveView}
        handleExitExaminerWaitingRoom={handleExitExaminerWaitingRoom}
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
      />
    );
  }

  if (stationData?.is_break) {
    return (
      <ExaminerBreakStationView
        stationData={stationData}
        timerState={timerState}
        remainingSeconds={remainingSeconds}
        handleExitExaminerWaitingRoom={handleExitExaminerWaitingRoom}
      />
    );
  }

  return (
    <div className="relative">
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
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Top Sticky Action Navbar: Flush directly under the layout header without any gap */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 md:px-8 py-3.5 shadow-xs sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            onClick={handleExitExaminerWaitingRoom}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl transition shadow-2xs cursor-pointer active:scale-95"
          >
            <LogOut size={15} />
            Keluar ke Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold shadow-2xs ${
              timerState?.phase === "completed_waiting"
                ? "border-indigo-300 bg-indigo-100 text-indigo-950 font-black"
                : timerState?.phase === "transition" || timerState?.phase === "initial_transition"
                ? "border-amber-300 bg-amber-100 text-amber-950 font-black"
                : timerState?.phase === "break"
                ? "border-blue-300 bg-blue-100 text-blue-950"
                : timerState?.phase === "paused"
                ? "border-rose-300 bg-rose-50 text-rose-950"
                : "border-blue-200 bg-blue-50/90 text-blue-950"
            }`}>
              <Clock size={16} className={timerState?.phase === "paused" ? "text-rose-600" : "text-blue-600 animate-pulse"} />
              <span>
                {timerState?.phase === "completed_waiting"
                  ? "Sesi Selesai (Grace Period):"
                  : timerState?.phase === "initial_transition"
                  ? "Persiapan Pos Stase 1:"
                  : timerState?.phase === "transition"
                  ? "Transisi Pergerakan Peserta:"
                  : timerState?.phase === "reading"
                  ? "Waktu Baca Soal (Reading Time):"
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
                  timerState.phase === 'completed_waiting'
                    ? 'bg-purple-700'
                    : timerState.phase === 'transition' || timerState.phase === 'initial_transition'
                    ? 'bg-amber-600'
                    : timerState.phase === 'reading'
                    ? 'bg-cyan-600'
                    : timerState.phase === 'break'
                    ? 'bg-indigo-600'
                    : timerState.phase === 'paused'
                    ? 'bg-rose-600'
                    : 'bg-emerald-600'
                }`}>
                  {timerState.phase === 'initial_transition'
                    ? 'PERSIAPAN'
                    : timerState.phase === 'reading'
                    ? 'READING TIME'
                    : timerState.phase === 'completed_waiting'
                    ? 'SELESAI'
                    : timerState.phase}
                </span>
              )}
            </div>

            <button
              onClick={handleSaveEvaluation}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Simpan Penilaian
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container with padding */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {(timerState?.phase === "completed_waiting" || (remainingSeconds <= 0 && currentRoundNum >= totalStations)) && (
          <div className="rounded-2xl border-2 border-indigo-400 bg-indigo-50 p-4 text-indigo-950 shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <Clock size={24} className="text-indigo-600 shrink-0 animate-pulse" />
              <div className="text-xs">
                <span className="font-extrabold uppercase text-indigo-900 text-sm block flex items-center gap-1">
                  ⏱️ Waktu Ronde Habis — Grace Period Penilaian Ronde Terakhir
                </span>
                <span className="font-medium text-indigo-800">
                  Silakan selesaikan penilaian & submit skor peserta ronde terakhir. Layar penguji tetap dapat digunakan untuk input nilai.
                </span>
              </div>
            </div>
            <button
              onClick={handleSaveEvaluation}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Submit & Lock Score
            </button>
          </div>
        )}

        {(timerState?.phase === "transition" || timerState?.phase === "initial_transition") && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-md flex items-center gap-3">
            <Clock size={20} className="text-amber-600 animate-pulse shrink-0" />
            <div className="text-xs font-bold">
              <span className="font-extrabold uppercase text-amber-900 block">
                {timerState?.phase === "initial_transition" ? "FASE PERSIAPAN POS STASE 1:" : "FASE TRANSISI PERGERAKAN PESERTA:"}
              </span>
              {timerState?.phase === "initial_transition"
                ? "Peserta sedang memasuki ruangan dan mempersiapkan diri di pos stase 1. Sesi ujian akan segera dimulai setelah timer persiapan selesai."
                : "Peserta sedang melakukan perpindahan pos stase rotasi. Penguji dapat mempersiapkan lembar penilaian untuk peserta ronde berikutnya."}
            </div>
          </div>
        )}

        {timerState?.phase === "reading" && (
          <div className="rounded-2xl border border-cyan-300 bg-cyan-50 p-4 text-cyan-950 shadow-md flex items-center gap-3">
            <Clock size={20} className="text-cyan-600 animate-pulse shrink-0" />
            <div className="text-xs font-bold">
              <span className="font-extrabold uppercase text-cyan-900 block">FASE MEMBACA SOAL (READING TIME):</span>
              Peserta sedang membaca skenario & instruksi di depan pintu stase. Pintu stase akan dibuka setelah waktu membaca selesai.
            </div>
          </div>
        )}

        {(timerState?.phase === "paused" || timerState?.phase?.startsWith("paused") || activeSession?.status === "paused") && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-md flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <div className="text-xs font-bold space-y-0.5">
              <span className="font-extrabold uppercase text-amber-900 block">
                SESI DI-PAUSE OLEH ADMIN CONTROL DESK:
              </span>
              <p className="text-slate-800">
                {timerState?.phase === "paused_initial_transition"
                  ? "Sesi dihentikan sementara pada Fase Transisi Awal & Persiapan Pos Stase 1."
                  : timerState?.phase === "paused_transition"
                  ? `Sesi dihentikan sementara pada Fase Transisi Rotasi Stase (Ronde ${activeSession?.current_round || 1} → ${(activeSession?.current_round || 1) + 1}).`
                  : timerState?.phase === "paused_break"
                  ? `Sesi dihentikan sementara pada Fase Jeda Istirahat (Ronde ${activeSession?.current_round || 1}).`
                  : `Sesi dihentikan sementara pada Sesi Ujian Stase Ronde ${activeSession?.current_round || 1}.`}
                {" "}Penilaian yang sudah diisi tetap tersimpan aman di draf.
              </p>
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

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
              >
                <CalendarDays size={15} />
                Jadwal Rotasi Pos Stase
              </button>

              <button
                type="button"
                onClick={() => setShowScenario(!showScenario)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                <Eye size={15} />
                {showScenario ? "Sembunyikan Skenario" : "Skenario & Petunjuk Penguji"}
              </button>
            </div>
          </div>

          {showScenario && (
            <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-4 space-y-3 text-xs animate-in fade-in duration-200">
              <div>
                <h4 className="font-bold text-blue-900 uppercase mb-1">Skenario Utama Penguji:</h4>
                <p className="text-slate-800 font-semibold leading-relaxed text-justify bg-white/80 p-3 rounded-xl border border-blue-100">{stationData?.scenario || "Skenario kasus medis terstandar untuk stase ini."}</p>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 uppercase mb-1">Instruksi Dokter Penguji:</h4>
                {(() => {
                  const instSource = stationData?.examiner_instructions;
                  let rawLines = [];
                  if (Array.isArray(instSource)) {
                    rawLines = instSource.flatMap((t) => (typeof t === "string" ? t.split("\n") : [String(t)]));
                  } else if (typeof instSource === "string") {
                    rawLines = instSource.split("\n");
                  }
                  const lines = rawLines.map((l) => l.trim()).filter(Boolean);
                  if (lines.length === 0) {
                    return <p className="text-slate-700 font-medium italic">Amati kesantunan, komunikasi, dan keterampilan klinis peserta.</p>;
                  }
                  return (
                    <div className="space-y-1.5 pt-0.5">
                      {lines.map((l, idx) => {
                        const cleanL = l.replace(/^(\d+[\.\)]|[a-zA-Z][\.\)]|[-•*])\s*/, "").trim();
                        return (
                          <div key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white text-[10px] font-black mt-0.5 shadow-2xs">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 leading-relaxed text-justify flex-1">
                              {cleanL || l}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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
            <ExaminerParticipantAnswerViewer
              currentParticipant={currentParticipant}
              liveAnswer={liveAnswer}
              renderDifferentialDiagnosis={renderDifferentialDiagnosis}
              safeParseAuxiliaryList={safeParseAuxiliaryList}
              onOpenAuxiliaryModal={(results) => setSelectedAuxModalResults(results)}
            />
          </div>

          {/* RIGHT PANEL: SIDE-BY-SIDE GOLD STANDARD & SCORING (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Gold Standard Reference Key Accordion (Side-by-Side Comparison) */}
            <ExaminerGoldStandardReference
              stationData={stationData}
              showScenario={showScenario}
              setShowScenario={setShowScenario}
              onSelectAuxModalResults={(res) => setSelectedAuxModalResults(res)}
            />

            {/* Rubric Scoring Items List */}
            <ExaminerRubricEvaluationSheet
              rubricItems={rubricItems}
              rubricScores={rubricScores}
              onScoreChange={handleScoreChange}
            />

            {/* Global Performance Rating Scale (GRS) & Feedback Form */}
            <ExaminerGlobalRatingSheet
              globalRating={globalRating}
              setGlobalRating={setGlobalRating}
              feedback={feedback}
              setFeedback={setFeedback}
            />
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

      {/* Interactive Schedule Rotation Modal for Live Exam */}
      {isScheduleModalOpen && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-blue-100 p-2 text-blue-700">
                  <CalendarDays size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Jadwal Rotasi Peserta (Pos Stase #{stationData?.station_number || 1})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pemetaan jadwal rotasi mahasiswa yang diuji pada stase ini per ronde.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <ExaminerStationScheduleWidget
              sessionId={activeSession.id}
              stationNumber={stationData?.station_number}
              activeRound={currentRoundNum}
            />
          </div>
        </div>
      )}
    </div>
  );
}