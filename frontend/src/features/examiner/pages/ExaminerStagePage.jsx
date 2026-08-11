import { useState, useEffect } from "react";
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
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { fetchSessions } from "@/services/sessionService";
import AuxiliaryExamResultModal from "@/components/AuxiliaryExamResultModal";

export default function ExaminerStagePage() {
  const { stageId } = useParams();
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

  const [liveAnswer, setLiveAnswer] = useState(null);

  const [assignedSessionsList, setAssignedSessionsList] = useState([]);

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
            .from("profiles")
            .select("full_name, specialty, email")
            .eq("id", user.id)
            .maybeSingle();

          if (profData) userProf = profData;
        }

        const currentName = (userProf?.full_name || user?.user_metadata?.full_name || user?.email || "").toLowerCase();
        const username = user?.email ? user.email.split("@")[0].toLowerCase() : "";

        // 1. Fetch available sessions from sessionService
        const rawSessions = await fetchSessions();
        const sessList = rawSessions || [];

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

        // Pick target session & target station
        let targetSess = sessList.find((s) => s.status === "ongoing" || s.status === "running") || sessList[0];
        if (assignedList.length > 0) {
          const ongoingAssign = assignedList.find((a) => a.session.status === "ongoing" || a.session.status === "running");
          if (ongoingAssign) {
            targetSess = ongoingAssign.session;
            matchedStationNum = ongoingAssign.assignment.assigned_station_number;
          } else {
            targetSess = assignedList[0].session;
            matchedStationNum = assignedList[0].assignment.assigned_station_number;
          }
        }

        setActiveSession(targetSess);

        let st = null;

        if (stageId && stageId !== "stage-101" && stageId !== "stg-101") {
          // 1. Try fetching station by station id
          const { data: directSt } = await supabase
            .schema("osce")
            .from("stations")
            .select(`*, rubric_items (*), station_auxiliary_configs (*)`)
            .eq("id", stageId)
            .maybeSingle();

          if (directSt) {
            st = directSt;
          } else {
            // 2. Fallback: stageId might be a session_id
            const { data: sessSts } = await supabase
              .schema("osce")
              .from("stations")
              .select(`*, rubric_items (*), station_auxiliary_configs (*)`)
              .eq("session_id", stageId)
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
          setRubricItems(st.rubric_items || []);

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

          // Set initial scores map
          const initialMap = {};
          (st.rubric_items || []).forEach((r) => {
            initialMap[r.id] = 3;
          });
          setRubricScores(initialMap);
        }
      } catch (err) {
        console.error("Error loading station detail for examiner:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStationDetail();
  }, [stageId]);

  // Realtime subscription / polling for active session status updates (Waiting room auto-transition to live)
  useEffect(() => {
    if (!activeSession?.id) return;

    async function pollSessionStatus() {
      try {
        const { data } = await supabase
          .schema("osce")
          .from("sessions")
          .select("status")
          .eq("id", activeSession.id)
          .maybeSingle();

        if (data && data.status && data.status !== activeSession.status) {
          setActiveSession((prev) => (prev ? { ...prev, status: data.status } : null));
        }
      } catch (e) {}
    }

    const interval = setInterval(pollSessionStatus, 2000);

    const channel = supabase
      .channel(`realtime-session-status-${activeSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "osce",
          table: "sessions",
          filter: `id=eq.${activeSession.id}`,
        },
        (payload) => {
          if (payload.new && payload.new.status) {
            setActiveSession((prev) => (prev ? { ...prev, status: payload.new.status } : null));
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [activeSession?.id, activeSession?.status]);

  const currentParticipant = participants[activeRotationIndex] || null;

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

  function handleScoreChange(itemId, val) {
    setRubricScores((prev) => ({
      ...prev,
      [itemId]: Number(val),
    }));
  }

  async function handleSaveEvaluation() {
    if (!activeSession || !stationData || !currentParticipant) return;

    try {
      setSaving(true);
      const examineeId = currentParticipant.user_id || currentParticipant.id;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const earnedWeighted = rubricItems.reduce(
        (acc, r) => acc + Number(rubricScores[r.id] || 0) * (r.weight || 1),
        0
      );
      const maxWeighted = rubricItems.reduce(
        (acc, r) => acc + (r.max_points || 3) * (r.weight || 1),
        0
      );
      const finalPerc = maxWeighted > 0 ? (earnedWeighted / maxWeighted) * 100 : 90.0;

      const payload = {
        session_id: activeSession.id,
        station_id: stationData.id,
        participant_id: examineeId,
        examiner_id: user?.id || "5d6ea61b-61fe-454e-979f-fbfbaf4065aa",
        rotation_round: activeRotationIndex + 1,
        grs_rating: globalRating,
        examiner_notes: feedback,
        total_points_earned: earnedWeighted,
        max_points_possible: maxWeighted,
        final_score_percentage: finalPerc,
        is_locked: true,
      };

      await supabase
        .schema("osce")
        .from("examiner_evaluations")
        .upsert([payload], { onConflict: "session_id,station_id,participant_id,examiner_id,rotation_round" });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving examiner evaluation to Supabase:", err);
      const payload = {
        session_id: activeSession.id,
        station_id: stationData.id,
        participant_id: currentParticipant.user_id || currentParticipant.id,
        examiner_id: "00000000-0000-0000-0000-000000000000",
        rotation_round: activeRotationIndex + 1,
        grs_rating: globalRating,
        examiner_notes: feedback,
        submitted_at: new Date().toISOString(),
      };

      await supabase
        .schema("osce")
        .from("examiner_evaluations")
        .upsert([payload], { onConflict: "session_id,station_id,participant_id,examiner_id,rotation_round" });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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

  const isOngoing = activeSession.status === "ongoing" || activeSession.status === "running";

  // Dedicated Waiting Room UI when session is scheduled/published but not yet started live by Admin
  if (!isOngoing) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-2">
        {/* Session Selector Bar if Multiple Sessions Exist */}
        {assignedSessionsList.length > 1 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              Sesi Ujian Penugasan Anda ({assignedSessionsList.length} Sesi - Klik untuk Pindah Sesi):
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              {assignedSessionsList.map(({ session: s, station: st }) => {
                const isSelected = s.id === activeSession.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSession(s);
                      if (st) setStationData(st);
                    }}
                    className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                    }`}
                  >
                    <span>{s.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md ${isSelected ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-800"}`}>
                      Pos #{st?.station_number || 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Waiting Room Top Bar */}
        <div className="rounded-3xl border border-amber-300 bg-amber-500/10 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 rounded-full bg-amber-500 animate-ping" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-3 py-1 rounded-md border border-amber-300 flex items-center gap-1.5 w-fit">
                <Clock size={12} className="text-amber-800" />
                WAITING ROOM PENGUJI • STANDBY STASE
              </span>
              <h2 className="text-lg font-black text-amber-950 mt-1">
                Menunggu Admin Control Room Memulai Sesi Ujian Sirkuit Live
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/examiner")}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-amber-50 transition shadow-2xs"
            >
              <ArrowLeft size={15} />
              Kembali ke Dashboard
            </button>
          </div>
        </div>

        {/* Hero Standby Kiosk Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 border border-blue-200 shadow-md animate-pulse">
            <Clock size={40} />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h1 className="text-2xl font-black text-slate-900">{activeSession.title}</h1>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-4 py-1.5 text-xs font-black uppercase shadow-xs">
              Pos Stase Penugasan Anda: Pos #{stationData.station_number} - {stationData.case_title || stationData.title}
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed pt-2">
              Anda telah terhubung ke <strong>Waiting Room Pos Stase #{stationData.station_number}</strong> ({stationData.system_organ || "Klinis"}). Silakan periksa skenario kasus dan rubrik penilaian SKDI di bawah untuk persiapan. Halaman ini akan <strong>otomatis beralih ke Lembar Penilaian Live</strong> ketika Admin memecet tombol Mulai Ujian.
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-left">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lokasi Gedung & Lab:</span>
              <p className="text-xs font-black text-slate-900">{activeSession.location_building || "Gedung Skill Lab Kedokteran"}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Durasi Stase Ujian:</span>
              <p className="text-xs font-black text-slate-900">{activeSession.station_duration_minutes || 12} Menit / Rotasi</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Peserta Terdaftar:</span>
              <p className="text-xs font-black text-slate-900">{participants.length} Peserta Rotasi</p>
            </div>
          </div>
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

          <button
            onClick={handleSaveEvaluation}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Submit & Kunci Penilaian (Supabase)
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl w-full mx-auto space-y-6">
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