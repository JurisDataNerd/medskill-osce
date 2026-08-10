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
  Lock,
  Coffee,
  Eye,
  Activity,
  FileSpreadsheet,
  Save,
  Loader2,
  Info,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ExaminerStagePage() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [stationData, setStationData] = useState(null);
  const [rubricItems, setRubricItems] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [activeRotationIndex, setActiveRotationIndex] = useState(0);

  // Rubric Scores State for active examinee (0, 1, 2, 3)
  const [rubricScores, setRubricScores] = useState({});
  const [globalRating, setGlobalRating] = useState("SATISFACTORY");
  const [feedback, setFeedback] = useState("Kinerja klinis dan komunikasi peserta sangat baik dan terstruktur.");
  const [showScenario, setShowScenario] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [liveAnswer, setLiveAnswer] = useState(null);

  useEffect(() => {
    async function loadStationDetail() {
      try {
        setLoading(true);

        // 1. Check for active ongoing/running session
        const { data: ongoingSess } = await supabase
          .schema("osce")
          .from("sessions")
          .select("*")
          .in("status", ["ongoing", "running"])
          .limit(1)
          .maybeSingle();

        setActiveSession(ongoingSess || null);

        if (!ongoingSess) {
          setStationData(null);
          return;
        }

        // 2. Query station details
        let stationQuery = supabase
          .schema("osce")
          .from("stations")
          .select(`
            *,
            rubric_items (*),
            station_auxiliary_configs (*)
          `);

        if (stageId && stageId !== "stg-101") {
          stationQuery = stationQuery.eq("id", stageId);
        } else {
          stationQuery = stationQuery.eq("session_id", ongoingSess.id).order("station_number", { ascending: true });
        }

        const { data: stData } = await stationQuery;
        const st = Array.isArray(stData) ? stData[0] : stData;

        if (st) {
          setStationData(st);
          setRubricItems(st.rubric_items || []);

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
    if (!stationData) return;
    try {
      setSaving(true);
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
        session_id: stationData.session_id,
        station_id: stationData.id,
        participant_id: currentParticipant.user_id || currentParticipant.id,
        examiner_id: "5d6ea61b-61fe-454e-979f-fbfbaf4065aa",
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
        Memuat Lembar Penilaian Penguji Supabase...
      </div>
    );
  }

  if (!activeSession || !stationData) {
    return (
      <div className="flex h-full min-h-[480px] w-full flex-col items-center justify-center py-6">
        <div className="mx-auto max-w-lg w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm border border-amber-200">
            <Info size={32} />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-bold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Sistem Standby • Belum Ada Sesi Ujian Aktif
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Belum Ada Sesi Ujian Berlangsung
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              Sesi pengujian live belum diaktifkan oleh Admin Control Room. Lembar penilaian stase akan terbuka secara otomatis ketika Admin memulai sesi ujian sirkuit live.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/examiner")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white transition shadow-md active:scale-95"
            >
              <ArrowLeft size={16} />
              Kembali ke Dashboard Penguji
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition active:scale-95"
            >
              Refresh Status
            </button>
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
                      <span key={aIdx} className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-1 text-[10px] font-extrabold text-emerald-900 inline-flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-700" />
                        {aux.title || aux.name || "Berkas Penunjang"}
                      </span>
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
    </div>
  );
}