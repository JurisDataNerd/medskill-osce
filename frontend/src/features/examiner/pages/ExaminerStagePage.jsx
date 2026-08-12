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
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { fetchSessions } from "@/services/sessionService";
import { getSessionTimerState } from "@/services/live.service";
import {
  subscribeToSession,
  joinPresence,
  calcRemaining,
} from "@/services/realtimeTimerService";
import AuxiliaryExamResultModal from "@/components/AuxiliaryExamResultModal";

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
            .select("full_name, email")
            .eq("id", user.id)
            .maybeSingle();

          if (profData) userProf = profData;
        }

        const currentName = (userProf?.full_name || user?.user_metadata?.full_name || user?.email || "").toLowerCase();
        const username = user?.email ? user.email.split("@")[0].toLowerCase() : "";

        // 1. Fetch available sessions from sessionService
        const rawSessions = await fetchSessions();
        const sessList = rawSessions || [];
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
        let matchedStationNum = null;

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

          if (match) {
            const matchedSt = sessionSts.find(
              (st) => Number(st.station_number) === Number(match.assigned_station_number)
            );
            assignedList.push({
              session: s,
              assignment: match,
              station: matchedSt || sessionSts.find((st) => !st.is_break) || sessionSts[0],
            });
          }
        }

        // Fallback if no explicit examiner match: include all active sessions
        if (assignedList.length === 0 && sessList.length > 0) {
          for (const s of sessList) {
            const sessionSts = (allStations || []).filter((st) => st.session_id === s.id);
            assignedList.push({
              session: s,
              assignment: { assigned_station_number: 1 },
              station: sessionSts.find((st) => !st.is_break) || sessionSts[0],
            });
          }
        }

        setAssignedSessionsList(assignedList);

        // Pick target session & target station based on targetParamId parameter or ongoing session
        let targetSess = null;
        if (targetParamId && targetParamId !== "stage-101" && targetParamId !== "stg-101") {
          targetSess = sessList.find((s) => s.id === targetParamId);
        }

        if (!targetSess) {
          const ongoingAssign = assignedList.find(
            (a) => a.session.status === "ongoing" || a.session.status === "running" || a.session.status === "waiting_room"
          );
          if (ongoingAssign) {
            targetSess = ongoingAssign.session;
            matchedStationNum = ongoingAssign.assignment.assigned_station_number;
          } else if (assignedList.length > 0) {
            targetSess = assignedList[0].session;
            matchedStationNum = assignedList[0].assignment.assigned_station_number;
          } else {
            targetSess = sessList.find(
              (s) => s.status === "ongoing" || s.status === "running" || s.status === "waiting_room"
            ) || sessList[0];
          }
        }

        setActiveSession(targetSess);

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
          } else {
            // 2. Fallback: targetParamId might be a session_id
            const { data: sessSts } = await supabase
              .schema("osce")
              .from("stations")
              .select(`*, rubric_items (*), station_auxiliary_configs (*)`)
              .eq("session_id", targetParamId)
              .order("station_number");

            if (sessSts && sessSts.length > 0) {
              st = matchedStationNum
                ? sessSts.find((s) => Number(s.station_number) === Number(matchedStationNum)) || sessSts.find((s) => !s.is_break) || sessSts[0]
                : sessSts.find((s) => !s.is_break) || sessSts[0];
            }
          }
        }

        if (!st) {
          let stationQuery = supabase
            .schema("osce")
            .from("stations")
            .select(`*, rubric_items (*), station_auxiliary_configs (*)`);

          if (matchedStationNum) {
            stationQuery = stationQuery
              .eq("session_id", targetSess.id)
              .eq("station_number", matchedStationNum);
          } else {
            stationQuery = stationQuery
              .eq("session_id", targetSess.id)
              .order("station_number", { ascending: true });
          }
          const { data: stData } = await stationQuery;
          st = Array.isArray(stData) ? stData[0] : stData;
        }

        if (st) {
          setStationData(st);

          // Query rubric items explicitly from osce.rubric_items table
          const { data: rList } = await supabase
            .schema("osce")
            .from("rubric_items")
            .select("*")
            .eq("station_id", st.id)
            .order("question_number", { ascending: true });

          const loadedRubrics = rList && rList.length > 0 ? rList : st.rubric_items || [];
          setRubricItems(loadedRubrics);

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
        if (msg.target_role === "all" || msg.target_role === "examiners") {
          setActiveBroadcast({
            id: msg.id || Date.now(),
            message: msg.message,
            priority: msg.priority || "info",
            time: new Date(msg.created_at || Date.now()).toLocaleTimeString("id-ID"),
          });
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [activeSession?.id]);

  // Real-time Presence Tracking for Examiner
  useEffect(() => {
    if (!activeSession?.id) return;

    let cleanupPresence = null;
    async function initPresence() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let full_name = user?.user_metadata?.full_name || user?.email || "dr. Penguji Medis";
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

    const matched = participants.find(
      (p) => Number(p.starting_station_number) === targetStartingStation
    );
    if (matched) return matched;

    const rotIdx = (stationNum - 1 + (currentRoundNum - 1)) % participants.length;
    return participants[rotIdx] || participants[0];
  }, [participants, targetStartingStation, stationNum, currentRoundNum]);

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

  // Fetch saved evaluation from Supabase whenever active examinee / station changes
  useEffect(() => {
    if (!activeSession?.id || !stationData?.id || !currentParticipant) return;

    const examineeId = currentParticipant.user_id || currentParticipant.id;

    async function loadSavedEvaluation() {
      try {
        const { data: evalRecord } = await supabase
          .schema("osce")
          .from("examiner_evaluations")
          .select("*, rubric_scores (*)")
          .eq("session_id", activeSession.id)
          .eq("station_id", stationData.id)
          .eq("participant_id", examineeId)
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
            defaultScores[r.id] = 0;
          });
          setRubricScores(defaultScores);
        }
      } catch (err) {
        console.warn("Could not load saved evaluation from Supabase:", err);
      }
    }

    loadSavedEvaluation();
  }, [activeSession?.id, stationData?.id, currentParticipant?.id, currentParticipant?.user_id, rubricItems]);

  function handleScoreChange(itemId, val) {
    setRubricScores((prev) => ({
      ...prev,
      [itemId]: Number(val),
    }));
  }

  async function handleSaveEvaluation() {
    if (!activeSession || !stationData || !currentParticipant) {
      alert("Tidak dapat menyimpan: Data Sesi, Stase, atau Peserta tidak ditemukan.");
      return;
    }

    try {
      setSaving(true);
      const examineeId = currentParticipant.user_id || currentParticipant.id;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        alert("Sesi login penguji tidak ditemukan. Silakan login terlebih dahulu.");
        return;
      }

      const earnedWeighted = rubricItems.reduce(
        (acc, r) => acc + Number(rubricScores[r.id] || 0) * Number(r.weight || 1),
        0
      );
      const maxWeighted = rubricItems.reduce(
        (acc, r) => acc + Number(r.max_points || 3) * Number(r.weight || 1),
        0
      );
      const finalPerc = maxWeighted > 0 ? (earnedWeighted / maxWeighted) * 100 : 0;

      const evalPayload = {
        session_id: activeSession.id,
        station_id: stationData.id,
        participant_id: examineeId,
        examiner_id: user.id,
        rotation_round: currentRoundNum,
        grs_rating: globalRating,
        examiner_notes: feedback,
        total_points_earned: earnedWeighted,
        max_points_possible: maxWeighted,
        final_score_percentage: finalPerc,
        is_locked: true,
        submitted_at: new Date().toISOString(),
      };

      const { data: evalRecord, error: evalErr } = await supabase
        .schema("osce")
        .from("examiner_evaluations")
        .upsert([evalPayload], {
          onConflict: "session_id,station_id,participant_id,examiner_id,rotation_round",
        })
        .select()
        .single();

      if (evalErr) throw evalErr;

      // Upsert detail rubric scores into osce.rubric_scores table
      if (evalRecord && rubricItems.length > 0) {
        const scorePayloads = rubricItems.map((r) => ({
          evaluation_id: evalRecord.id,
          rubric_item_id: r.id,
          score_given: Number(rubricScores[r.id] || 0),
          scored_at: new Date().toISOString(),
        }));

        const { error: scoresErr } = await supabase
          .schema("osce")
          .from("rubric_scores")
          .upsert(scorePayloads, { onConflict: "evaluation_id,rubric_item_id" });

        if (scoresErr) console.warn("Error saving detail rubric scores:", scoresErr);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving examiner evaluation to Supabase:", err);
      alert("Gagal menyimpan penilaian ke database Supabase: " + err.message);
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
      <div className="space-y-6 max-w-6xl mx-auto py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CalendarDays className="text-blue-600" size={24} />
              Pilih Sesi Ujian Penugasan Penguji ({assignedSessionsList.length} Sesi)
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pilih kartu sesi ujian di bawah untuk masuk ke Waiting Room & Lembar Penilaian stase Anda.
            </p>
          </div>
          <button
            onClick={() => navigate("/examiner")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </button>
        </div>

        {assignedSessionsList.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {assignedSessionsList.map(({ session: s, assignment: a, station: st }) => {
              const isOngoing = s.status === "ongoing" || s.status === "running";

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSession(s);
                    setStationData(st);
                    navigate(`/examiner/stage/${st?.id || s.id}`);
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 shadow-2xs hover:border-blue-300 hover:bg-white transition flex flex-col justify-between cursor-pointer active:scale-98"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                          isOngoing
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-indigo-100 text-indigo-900 border border-indigo-300"
                        }`}
                      >
                        {isOngoing ? "Live Berlangsung" : "Dipublikasikan (Terjadwal)"}
                      </span>

                      <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-900 inline-flex items-center gap-1 uppercase">
                        <CheckCircle2 size={11} className="text-emerald-700" />
                        Penugasan Pos #{st?.station_number || a?.assigned_station_number || 1}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{s.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {st
                          ? `Pos Penugasan Anda: Pos #${st.station_number} - ${st.case_title || st.title || "Kasus Medis"}`
                          : s.description || "Sesi evaluasi sirkuit terpadu stase aktif."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                        <span className="text-slate-400 text-[10px] block font-bold">Total Stase</span>
                        <span className="font-black text-slate-900">{s.total_stations || 8} Pos</span>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                        <span className="text-slate-400 text-[10px] block font-bold">Durasi / Pos</span>
                        <span className="font-black text-slate-900">{s.station_duration_minutes || 12} Mnt</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60">
                    <button
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 ${
                        isOngoing
                          ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 animate-pulse"
                          : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
                      }`}
                    >
                      {isOngoing ? "Masuk Sesi Live Ujian" : "Buka Kiosk Standby Sesi"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4 shadow-2xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-sm">
              <Info size={32} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Belum Ada Sesi Ujian Penugasan</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 font-medium leading-relaxed">
                Anda belum ditugaskan ke sesi ujian aktif. Penugasan dokter penguji akan dikonfigurasi oleh Admin Control Room.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isOngoing = forceLiveView || activeSession.status === "ongoing" || activeSession.status === "running";

  // Dedicated Waiting Room UI when session is scheduled/published but not yet started live by Admin
  if (!isOngoing) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-2">
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
        {/* Session Selector Bar */}
        {allActiveSessions.length > 1 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              Pilih Sesi Ujian Aktif ({allActiveSessions.length} Sesi Terdaftar - Klik untuk Pindah Sesi):
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              {allActiveSessions.map((s) => {
                const isSelected = activeSession && s.id === activeSession.id;
                const assignedItem = assignedSessionsList.find((a) => a.session.id === s.id);
                const stNum = assignedItem?.station?.station_number || 1;

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSession(s);
                      setForceLiveView(false);
                      if (assignedItem?.station) {
                        setStationData(assignedItem.station);
                      }
                    }}
                    className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                    }`}
                  >
                    <span>{s.title} ({s.location_building || s.id.slice(0, 8)})</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md ${
                        isSelected ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {s.status === "ongoing" || s.status === "running" ? "🔴 Live" : "Standby"} • Pos #{stNum}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Waiting Room Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white p-5 rounded-3xl shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 rounded-full bg-amber-500 animate-ping" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5">
                <Clock size={12} className="text-amber-700" />
                WAITING ROOM PENGUJI • STANDBY STASE
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-1">
                Menunggu Admin Control Room Memulai Sesi Ujian Live
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setForceLiveView(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
            >
              <PlayCircle size={16} />
              Masuk Lembar Penilaian Live
            </button>
            <button
              onClick={() => navigate("/examiner")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
            >
              <ArrowLeft size={15} />
              Kembali ke Dashboard
            </button>
          </div>
        </div>

        {/* Master Session & Station Assignment Hero Card */}
        <div className="rounded-3xl border border-slate-700 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-7 text-white shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-300 tracking-wider">
                  SESI UJIAN OSCE TERDAFTAR
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Supabase Realtime Live
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {activeSession.title}
              </h1>
              <div className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-1 text-xs font-black uppercase tracking-wide text-white shadow-sm">
                Pos Stase Penugasan Anda: Pos #{stationData.station_number} - {stationData.case_title || stationData.title}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4 text-center min-w-[190px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sirkuit Rotation</span>
              <span className="text-lg font-black text-amber-400 mt-0.5 block">
                Pos Stase #{stationData.station_number}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {stationData.system_organ || "Klinis SKDI"}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Anda telah terhubung ke <strong>Waiting Room Pos Stase #{stationData.station_number}</strong>. Silakan periksa skenario kasus medis dan elemen rubrik penilaian SKDI di bawah untuk persiapan. Layar ini akan <strong>otomatis beralih ke Lembar Penilaian Live</strong> ketika Admin memulai sesi.
          </p>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs pt-1">
            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lokasi & Gedung</span>
              <span className="font-extrabold text-white text-xs mt-0.5 block truncate">
                {activeSession.location_building || "Gedung Skill Lab Kedokteran"}
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Durasi / Pos Stase</span>
              <span className="font-extrabold text-white text-xs mt-0.5 block">
                {activeSession.station_duration_minutes || 12} Menit / Rotasi
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

          <div className="pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-300">
              Layar akan otomatis beralih saat Admin memulai ujian, atau Anda dapat mengklik tombol di samping untuk langsung membuka Lembar Penilaian.
            </p>
            <button
              onClick={() => setForceLiveView(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-black text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition"
            >
              <PlayCircle size={18} />
              Masuk ke Lembar Penilaian Live (Pos #{stationData?.station_number || 1})
            </button>
          </div>
        </div>

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
                      <th className="px-4 py-3">NIM / ID</th>
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

        {/* Station Scenario & Rubric Preview Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Pratinjau Skenario Kasus & Rubrik SKDI Stase #{stationData.station_number}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Dokter Penguji dapat mempelajari instrumen penilaian sebelum peserta masuk ke stase.
              </p>
            </div>
          </div>

          {/* Scenario Accordion */}
          <div className="rounded-2xl bg-blue-50/80 border border-blue-200 p-5 space-y-3">
            <div>
              <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">Skenario Medis Utama Penguji:</h4>
              <p className="text-xs text-slate-800 font-medium leading-relaxed mt-1">
                {stationData.scenario || "Seorang pasien datang ke poliklinik/IGD dengan keluhan utama medis terstandar."}
              </p>
            </div>

            {stationData.examiner_instructions && (
              <div className="border-t border-blue-200/80 pt-3">
                <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">Instruksi Khusus Dokter Penguji:</h4>
                <p className="text-xs text-slate-800 font-medium leading-relaxed mt-1">
                  {stationData.examiner_instructions}
                </p>
              </div>
            )}
          </div>

          {/* Rubric Items Preview List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-blue-600" />
              Elemen Rubrik Penilaian Terdaftar ({rubricItems.length} Rubrik):
            </h4>

            {rubricItems.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {rubricItems.map((item, idx) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        {idx + 1}. {item.title || item.name}
                      </span>
                      <span className="rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
                        Maks {item.max_points || 3} Poin (Bobot {item.weight || 1}x)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium line-clamp-2">
                      {item.description_score_3 || item.description || "Penilaian performa klinis dan komunikasi SKDI."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada item rubrik penilaian yang diunggah pada stase ini.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 shadow-2xs sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <button
            onClick={() => navigate("/examiner")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard Dokter Penguji
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/90 px-3.5 py-1.5 text-xs text-blue-950 font-bold shadow-2xs">
              <Clock size={16} className="text-blue-600 animate-pulse" />
              <span>Timer Live Global:</span>
              <span className="font-mono text-sm font-black text-blue-700">
                {Math.floor(remainingSeconds / 60).toString().padStart(2, "0")}:
                {(remainingSeconds % 60).toString().padStart(2, "0")}
              </span>
              {timerState?.phase && (
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white uppercase ml-1">
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
              Submit & Kunci Penilaian (Supabase)
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl w-full mx-auto space-y-6">
        {forceLiveView && activeSession.status !== "ongoing" && (
          <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <Clock size={18} className="text-amber-600 animate-pulse" />
              <span>Mode Penilaian Mandiri / Preview: Admin Control Room belum memulai timer global. Penilaian Anda tetap dapat disubmit ke Supabase.</span>
            </div>
            <button
              onClick={() => setForceLiveView(false)}
              className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs shrink-0"
            >
              Kembali ke Waiting Room
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
            {participants.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActiveRotationIndex(idx)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 border whitespace-nowrap ${
                  activeRotationIndex === idx
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>R{idx + 1}:</span>
                <span className="font-extrabold">{p.full_name || p.name}</span>
              </button>
            ))}
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
                  <span>Tahapan Pengerjaan Kiosk:</span>
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
                  {liveAnswer?.working_diagnosis || (currentParticipant ? "Peserta belum mengisi WDx pada kiosk" : "Belum ada peserta di stase ini")}
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
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
                  Berkas Penunjang yang Diberikan ke Peserta:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {liveAnswer?.requested_auxiliary_json && Array.isArray(liveAnswer.requested_auxiliary_json) && liveAnswer.requested_auxiliary_json.length > 0 ? (
                    liveAnswer.requested_auxiliary_json.map((aux, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => setSelectedAuxModalResults(liveAnswer.requested_auxiliary_json)}
                        className="rounded-md bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[10px] font-extrabold text-emerald-900 inline-flex items-center gap-1 hover:bg-emerald-200 transition cursor-pointer active:scale-95 shadow-2xs"
                        title="Klik untuk membuka pratinjau berkas penunjang (Iframe / Drive / Gambar)"
                      >
                        <CheckCircle2 size={12} className="text-emerald-700" />
                        {aux.title || aux.name || "Berkas Penunjang"}
                        <Eye size={11} className="text-emerald-700 ml-0.5" />
                      </button>
                    ))
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">Belum ada berkas penunjang yang dibuka oleh peserta</span>
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
                  <p className="font-semibold text-slate-100 leading-relaxed">
                    {stationData?.answer_key_diagnosis || "WDx: STEMI Inferior Onset < 12 Jam (Killip I)\nDDx: UAP, Diseksi Aorta, Perikarditis Akut"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-300 uppercase block">Kunci Resep Baku (Rx):</span>
                  <p className="font-semibold text-slate-100 leading-relaxed font-mono whitespace-pre-line">
                    {stationData?.answer_key_prescription || "R/ Aspirin 80mg tab No. IV (Dosis Awal 320mg Kunyah)\nR/ Clopidogrel 75mg tab No. IV (Dosis Awal 300mg)"}
                  </p>
                </div>
              </div>

              {showScenario && (
                <div className="rounded-2xl bg-slate-900/90 border border-emerald-400/40 p-4 space-y-2 text-xs text-slate-200 animate-in fade-in duration-200">
                  <p><strong>Skenario Klinis:</strong> {stationData?.scenario || "Seorang laki-laki 55 tahun datang dengan keluhan nyeri dada substernal menjalar ke lengan kiri sejak 2 jam lalu."}</p>
                  <p><strong>Instruksi Penguji:</strong> {stationData?.examiner_instructions || "Amati ketepatan auskultasi jantung, permintaan EKG, dan dosis loading antiplatelet."}</p>
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
                {(rubricItems.length > 0 ? rubricItems : [
                  { id: "r1", question: "Anamnesis terarah nyeri dada (PQRST, Onset, Faktor Risiko)", max_points: 3, weight: 4 },
                  { id: "r2", question: "Pemeriksaan fisik tanda vital & auskultasi 4 katup jantung", max_points: 3, weight: 3 },
                  { id: "r3", question: "Pemeriksaan penunjang EKG 12 Lead & Enzim Jantung", max_points: 3, weight: 3 },
                  { id: "r4", question: "Formulasi Diagnosis Kerja (STEMI Inferior) & DDx", max_points: 3, weight: 3 },
                  { id: "r5", question: "Penulisan Resep Dual Antiplatelet Therapy (DAPT)", max_points: 3, weight: 3 },
                ]).map((rub, rIdx) => (
                  <div key={rub.id || rIdx} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="rounded-md bg-blue-100 text-blue-900 px-2 py-0.5 text-[10px] font-extrabold uppercase mr-2">
                          Bobot x{rub.weight || 1}
                        </span>
                        <h3 className="text-xs font-extrabold text-slate-900 inline">
                          {rIdx + 1}. {rub.question}
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                        Skor: {rubricScores[rub.id] ?? 3} / 3 Pts
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {[
                        { val: 0, desc: "0: Tidak Dilakukan / Salah Total" },
                        { val: 1, desc: "1: Minimal / Sebagian Salah" },
                        { val: 2, desc: "2: Cukup / Memadai" },
                        { val: 3, desc: "3: Sempurna & Lengkap" },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => handleScoreChange(rub.id, opt.val)}
                          title={opt.desc}
                          className={`rounded-xl border p-2.5 text-center text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                            (rubricScores[rub.id] ?? 3) === opt.val
                              ? "bg-blue-600 text-white border-blue-600 shadow-md"
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <span>Poin {opt.val}</span>
                          <span className="text-[9px] font-medium opacity-80 line-clamp-1">{opt.val === 0 ? "Salah" : opt.val === 1 ? "Minimal" : opt.val === 2 ? "Memadai" : "Sempurna"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
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
    </div>
  );
}