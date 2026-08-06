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
} from "lucide-react";
import {
  CURRENT_EXAMINER_PROFILE,
  EXAMINER_LIVE_SESSION,
} from "@/features/examiner/data/mockExaminerData";
import AuxiliaryExamResultModal from "@/components/AuxiliaryExamResultModal";


export default function ExaminerStagePage() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState(EXAMINER_LIVE_SESSION.remaining_seconds);
  const [isBreak, setIsBreak] = useState(false);

  // Active Examinee Index in Rotation (0 to 5)
  const [activeRotationIndex, setActiveRotationIndex] = useState(1); // Ronde 2 (Index 1)

  // Accordion state (collapsed by default to keep grading view clean & focused)
  const [showScenario, setShowScenario] = useState(false);

  // Auxiliary Exam Modal State
  const [isAuxModalOpen, setIsAuxModalOpen] = useState(false);

  // Rubric Scores State for active examinee
  const [rubricScores, setRubricScores] = useState({
    r1: 3,
    r2: 3,
    r3: 2.5,
    r4: 3,
  });

  const [globalRating, setGlobalRating] = useState("LULUS"); // Tidak Lulus, Borderline, Lulus, Superior
  const [feedback, setFeedback] = useState("Penanganan klinis dan auskultasi jantung sangat baik. Interpretasi EKG tepat & cepat.");

  // Accordion state for rubric descriptor guidelines
  const [openDescriptorId, setOpenDescriptorId] = useState(null);

  // Accordion state for collapsible rubric item cards (dropdowns)
  const [collapsedRubricItems, setCollapsedRubricItems] = useState({});

  function toggleRubricItemCollapse(itemId) {
    setCollapsedRubricItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return EXAMINER_LIVE_SESSION.station_duration_seconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeParticipant = EXAMINER_LIVE_SESSION.rotation_list[activeRotationIndex];

  // Calculate weighted score percentage according to national OSCE standard
  const totalMaxWeightedPoints = EXAMINER_LIVE_SESSION.rubric_items.reduce(
    (acc, r) => acc + r.max_points * r.weight,
    0
  );
  const currentEarnedWeightedPoints = EXAMINER_LIVE_SESSION.rubric_items.reduce(
    (acc, r) => acc + Number(rubricScores[r.id] || 0) * r.weight,
    0
  );
  const totalUnweightedEarned = Object.values(rubricScores).reduce((acc, val) => acc + Number(val || 0), 0);
  const totalUnweightedMax = EXAMINER_LIVE_SESSION.rubric_items.reduce((acc, r) => acc + r.max_points, 0);
  
  const finalCalculatedScore = Math.round((currentEarnedWeightedPoints / totalMaxWeightedPoints) * 100 * 10) / 10;

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // Confirmation Lock Modal State for Examiner
  const [isLockConfirmModalOpen, setIsLockConfirmModalOpen] = useState(false);

  // Complete Full OSCE Session State & Modal
  const [isCompleteSessionModalOpen, setIsCompleteSessionModalOpen] = useState(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  function handleOpenSaveConfirm() {
    setIsLockConfirmModalOpen(true);
  }

  function confirmSaveEvaluation() {
    setIsLockConfirmModalOpen(false);
    
    // Auto advance to next participant if available
    if (activeRotationIndex < EXAMINER_LIVE_SESSION.rotation_list.length - 1) {
      setActiveRotationIndex(activeRotationIndex + 1);
    }
  }

  if (isSessionCompleted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pt-6">
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-lg space-y-6 animate-in fade-in duration-200">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 size={44} />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="inline-block rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-extrabold text-emerald-900">
              Sesi Penilaian Stase Selesai & Terkunci
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Terima Kasih, {CURRENT_EXAMINER_PROFILE.name}!
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Seluruh data penilaian peserta untuk <strong>{EXAMINER_LIVE_SESSION.station_name}</strong> telah berhasil dikirim dan dikunci secara permanen ke server pusat MedSkill OSCE.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-2 max-w-md mx-auto text-left">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold">Stase Penugasan:</span>
              <strong className="text-slate-900">Stase {EXAMINER_LIVE_SESSION.station_number} - {EXAMINER_LIVE_SESSION.station_name}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold">Total Peserta Evaluasi:</span>
              <strong className="text-slate-900">{EXAMINER_LIVE_SESSION.rotation_list.length} Ronde Peserta</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Status Penguncian:</span>
              <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">VERIFIED & LOCKED</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate("/examiner")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Kembali ke Dashboard Penguji
            </button>
            <button
              onClick={() => navigate("/examiner/history")}
              className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
            >
              Lihat Riwayat & Rekap Nilai
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate("/examiner")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard Penguji
        </button>

        {/* Live Synchronized Timer Banner */}
        <div className="flex items-center gap-3">
          {!isBreak && (
            secondsLeft > 660 ? (
              <span className="rounded-2xl bg-blue-100 border border-blue-300 px-3.5 py-2 text-xs font-extrabold text-blue-900 flex items-center gap-1.5 shadow-2xs">
                <Clock size={14} />
                Reading Time (1m)
              </span>
            ) : secondsLeft > 60 ? (
              <span className="rounded-2xl bg-emerald-100 border border-emerald-300 px-3.5 py-2 text-xs font-extrabold text-emerald-900 flex items-center gap-1.5 shadow-2xs">
                <Clock size={14} />
                Action Time (10m)
              </span>
            ) : (
              <span className="rounded-2xl bg-amber-600 text-white px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 animate-pulse shadow-2xs">
                <Clock size={14} />
                Transition Time (1m)
              </span>
            )
          )}

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-2xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              <Clock size={18} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {isBreak ? "Sisa Waktu Istirahat" : `Sisa Waktu Stase Ronde #${activeParticipant.round}`}
              </div>
              <div className="text-lg font-black font-mono leading-none text-slate-900 mt-0.5">
                {isBreak ? "08:45" : formatTime(secondsLeft)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Scoring Workspace */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN (8 COLS): SCORING SHEET & SCENARIO / BREAK VIEW */}
        <div className="lg:col-span-8 space-y-6">

          {isBreak ? (
            /* Simple Yellow Break Mode View */
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-8 text-center shadow-xs space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1.5 max-w-md mx-auto">
                <span className="inline-block rounded-full bg-amber-200/80 border border-amber-300 px-3 py-0.5 text-xs font-bold text-amber-900">
                  Masa Istirahat Rotasi (10 Menit)
                </span>
                <h2 className="text-xl font-bold text-amber-950">
                  Jeda Istirahat Stase
                </h2>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Waktu rehat untuk peserta dan dokter penguji setelah Ronde 3. Silakan beristirahat sejenak sebelum melanjutkan ke ronde berikutnya.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsBreak(false);
                    setActiveRotationIndex(3); // Start round 4
                  }}
                  className="inline-flex items-center rounded-xl bg-amber-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-700 active:scale-95 transition"
                >
                  Lanjutkan Ke Ronde 4
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Station Title & Active Examinee Header */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
                      STASE {EXAMINER_LIVE_SESSION.station_number}
                    </span>
                    <h1 className="text-base font-bold text-slate-900">
                      {EXAMINER_LIVE_SESSION.station_name}
                    </h1>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Ronde {activeParticipant.round} dari {EXAMINER_LIVE_SESSION.total_rounds}
                  </span>
                </div>

                {/* Active Examinee Banner (Detail Lengkap Identitas Peserta) */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={activeParticipant.avatar}
                        alt={activeParticipant.name}
                        className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md">
                            Peserta Ujian Aktif
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                            {activeParticipant.wave || "Gelombang #1"}
                          </span>
                        </div>
                        <h2 className="text-base font-extrabold text-slate-900">{activeParticipant.name}</h2>
                        <p className="text-xs text-slate-600 font-semibold">
                          NIM: <strong>{activeParticipant.nim}</strong> • {activeParticipant.institution || "Fakultas Kedokteran"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right border-l border-blue-200/80 pl-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Kalkulasi Skor Realtime</span>
                      <span className="text-2xl font-black text-blue-600">{finalCalculatedScore} <span className="text-xs font-medium text-slate-500">/ 100</span></span>
                    </div>
                  </div>

                  {/* Real-time Candidate Stage Tracking Indicator */}
                  <div className="pt-2 border-t border-blue-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Activity size={14} className="text-blue-600" />
                      Status Live Peserta:
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                      <span className="rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 px-2.5 py-0.5">
                        1. Anamnesis
                      </span>
                      <span className="rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 px-2.5 py-0.5">
                        2. Fisik
                      </span>
                      <span className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 shadow-2xs animate-pulse">
                        3. Penunjang (Sedang Diisi)
                      </span>
                      <span className="rounded-full bg-slate-100 border border-slate-200 text-slate-400 px-2 py-0.5">
                        4. Diagnosis & Resep
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skenario Kasus Medis & Instruksi (Expandable Reference) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <button
                  onClick={() => setShowScenario(!showScenario)}
                  className="flex w-full items-center justify-between text-xs font-bold text-slate-900"
                >
                  <span className="font-extrabold flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    Skenario Kasus Medis & Instruksi Peserta
                  </span>
                  <span className="text-blue-600 font-bold flex items-center gap-1">
                    {showScenario ? (
                      <>
                        Tutup Skenario <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        Lihat Skenario <ChevronDown size={16} />
                      </>
                    )}
                  </span>
                </button>

                {showScenario && (
                  <div className="mt-4 border-t border-slate-100 pt-3 space-y-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800 mb-0.5">Judul Kasus:</p>
                      <p className="text-slate-900 font-semibold">{EXAMINER_LIVE_SESSION.case_title}</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 mb-0.5">Skenario Medis:</p>
                      <p className="text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium leading-relaxed">
                        {EXAMINER_LIVE_SESSION.scenario}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="font-bold text-slate-800 mb-0.5">Instruksi Peserta:</p>
                        <p className="text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-lg whitespace-pre-line font-medium">
                          {EXAMINER_LIVE_SESSION.participant_instructions}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 mb-0.5">Instruksi Penguji:</p>
                        <p className="text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-lg whitespace-pre-line font-medium">
                          {EXAMINER_LIVE_SESSION.examiner_instructions}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Penilaian Rubrik Item per Item (Terintegrasi Bobot & Deskriptor Kriteria 0-3) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Award size={18} className="text-blue-600" />
                      Lembar Rubrik Penilaian Penguji ({EXAMINER_LIVE_SESSION.rubric_items.length} Item Kompetensi)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik header item untuk melipat/membuka rincian penilaian (dropdown).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const isAnyCollapsed = Object.values(collapsedRubricItems).some(Boolean);
                        const newObj = {};
                        EXAMINER_LIVE_SESSION.rubric_items.forEach((item) => {
                          newObj[item.id] = !isAnyCollapsed;
                        });
                        setCollapsedRubricItems(newObj);
                      }}
                      className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1 rounded-full transition flex items-center gap-1"
                    >
                      <ChevronsUpDown size={14} />
                      {Object.values(collapsedRubricItems).some(Boolean) ? "Buka Semua" : "Lipat Semua"}
                    </button>

                    <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                      Skor Terbobot: {currentEarnedWeightedPoints} / {totalMaxWeightedPoints} ({finalCalculatedScore}%)
                    </span>
                  </div>
                </div>

                <div className="space-y-6 pt-1">
                  {EXAMINER_LIVE_SESSION.rubric_items.map((item, idx) => {
                    const currentScore = rubricScores[item.id] ?? 0;
                    const itemWeightedScore = currentScore * item.weight;
                    const maxItemWeighted = item.max_points * item.weight;
                    const isDescriptorOpen = openDescriptorId === item.id;
                    const isCollapsed = Boolean(collapsedRubricItems[item.id]);

                    return (
                      <div
                        key={item.id}
                        className="border-b border-slate-200/80 pb-6 last:border-0 last:pb-0 space-y-3.5"
                      >
                        {/* Clickable Header Row (Flat Layout, No Card Border) */}
                        <div
                          onClick={() => toggleRubricItemCollapse(item.id)}
                          className="flex flex-wrap items-center justify-between gap-3 cursor-pointer py-1.5 hover:opacity-80 transition select-none"
                        >
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-black text-slate-900 leading-snug">
                              {idx + 1}. {item.question}
                            </h4>
                            <span className="text-[11px] font-semibold text-slate-500 block">
                              Kompetensi: <strong className="text-slate-800">{item.competency}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                              Bobot: {item.weight}x
                            </span>
                            <span className="text-[11px] font-extrabold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                              Skor: {currentScore} / {item.max_points} Poin
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              {isCollapsed ? (
                                <>
                                  Buka <ChevronDown size={14} />
                                </>
                              ) : (
                                <>
                                  Lipat <ChevronUp size={14} />
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Accordion Body Content (Shown when NOT collapsed) */}
                        {!isCollapsed && (
                          <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                            {/* Expandable Level Descriptor Guide Button (With Lucide Icon) */}
                            {item.descriptors && (
                              <div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenDescriptorId(isDescriptorOpen ? null : item.id)
                                  }
                                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                                >
                                  <HelpCircle size={14} />
                                  <span>
                                    {isDescriptorOpen
                                      ? "Sembunyikan Panduan Deskriptor"
                                      : "Lihat Panduan Kriteria Deskriptor (Skor 0 - 3)"}
                                  </span>
                                </button>

                                {/* Level Descriptors Accordion Drawer */}
                                {isDescriptorOpen && (
                                  <div className="mt-2.5 grid gap-2.5 sm:grid-cols-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs animate-in fade-in duration-150">
                                    <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 space-y-1">
                                      <span className="font-extrabold text-rose-900 text-[10px] block uppercase tracking-wider">
                                        Skor 0 (Tidak Dilakukan)
                                      </span>
                                      <p className="text-[11px] text-rose-950 font-medium leading-snug">
                                        {item.descriptors[0]}
                                      </p>
                                    </div>
                                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 space-y-1">
                                      <span className="font-extrabold text-amber-900 text-[10px] block uppercase tracking-wider">
                                        Skor 1 (Minimal)
                                      </span>
                                      <p className="text-[11px] text-amber-950 font-medium leading-snug">
                                        {item.descriptors[1]}
                                      </p>
                                    </div>
                                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5 space-y-1">
                                      <span className="font-extrabold text-blue-900 text-[10px] block uppercase tracking-wider">
                                        Skor 2 (Cukup / Memadai)
                                      </span>
                                      <p className="text-[11px] text-blue-950 font-medium leading-snug">
                                        {item.descriptors[2]}
                                      </p>
                                    </div>
                                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 space-y-1">
                                      <span className="font-extrabold text-emerald-900 text-[10px] block uppercase tracking-wider">
                                        Skor 3 (Sempurna)
                                      </span>
                                      <p className="text-[11px] text-emerald-950 font-medium leading-snug">
                                        {item.descriptors[3]}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Item-Specific Content Rendering */}
                            {item.id === "r4" ? (
                              /* ITEM #4: DIAGNOSIS & RESEP (KOMPARASI ATAS-BAWAH STRUKTUR FLAT TANPA CARD CLUTTER) */
                              <div className="space-y-4 pt-1 text-xs">
                                {/* 1. Diagnosis Kerja (WDx) */}
                                <div className="space-y-2 border-b border-slate-200/70 pb-3">
                                  <span className="font-extrabold text-slate-900 text-[11px] block uppercase tracking-wider">
                                    1. Diagnosis Kerja (Working Diagnosis - WDx)
                                  </span>
                                  
                                  <div className="space-y-2">
                                    <div className="bg-blue-50/80 border-l-4 border-blue-500 p-3 rounded-r-xl">
                                      <span className="text-[10px] font-extrabold text-blue-900 uppercase block mb-1">
                                        Jawaban Peserta:
                                      </span>
                                      <p className="text-slate-900 font-semibold leading-relaxed">
                                        {activeParticipant.student_answers?.wdx || "Belum diisi oleh peserta."}
                                      </p>
                                    </div>

                                    <div className="bg-emerald-50/80 border-l-4 border-emerald-500 p-3 rounded-r-xl">
                                      <span className="text-[10px] font-extrabold text-emerald-900 uppercase block mb-1">
                                        Kunci Jawaban Baku:
                                      </span>
                                      <p className="text-emerald-950 font-bold leading-relaxed">
                                        {EXAMINER_LIVE_SESSION.gold_standard_keys?.wdx}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* 2. Diagnosis Banding (DDx) */}
                                <div className="space-y-2 border-b border-slate-200/70 pb-3">
                                  <span className="font-extrabold text-slate-900 text-[11px] block uppercase tracking-wider">
                                    2. Diagnosis Banding (Differential Diagnosis - DDx)
                                  </span>
                                  
                                  <div className="space-y-2">
                                    <div className="bg-blue-50/80 border-l-4 border-blue-500 p-3 rounded-r-xl">
                                      <span className="text-[10px] font-extrabold text-blue-900 uppercase block mb-1">
                                        Jawaban Peserta:
                                      </span>
                                      <ol className="list-decimal list-inside space-y-1 text-slate-900 font-semibold">
                                        {(activeParticipant.student_answers?.ddx || []).map((d, dIdx) => (
                                          <li key={dIdx}>{d}</li>
                                        ))}
                                      </ol>
                                    </div>

                                    <div className="bg-emerald-50/80 border-l-4 border-emerald-500 p-3 rounded-r-xl">
                                      <span className="text-[10px] font-extrabold text-emerald-900 uppercase block mb-1">
                                        Kunci Jawaban Baku:
                                      </span>
                                      <ol className="list-decimal list-inside space-y-1 text-emerald-950 font-bold">
                                        {(EXAMINER_LIVE_SESSION.gold_standard_keys?.ddx || []).map((dk, dIdx) => (
                                          <li key={dIdx}>{dk}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Lembar Penulisan Resep Medis */}
                                <div className="space-y-2">
                                  <span className="font-extrabold text-slate-900 text-[11px] block uppercase tracking-wider">
                                    3. Lembar Penulisan Resep Medis (Prescription Sheet)
                                  </span>
                                  
                                  <div className="space-y-2">
                                    <div className="bg-blue-50/80 border-l-4 border-blue-500 p-3 rounded-r-xl">
                                      <span className="text-[10px] font-extrabold text-blue-900 uppercase block mb-1">
                                        Jawaban Peserta:
                                      </span>
                                      <pre className="text-slate-900 font-mono text-[11px] whitespace-pre-line leading-relaxed font-semibold">
                                        {activeParticipant.student_answers?.recipe || "Belum diisi oleh peserta."}
                                      </pre>
                                    </div>

                                    <div className="bg-emerald-50/80 border-l-4 border-emerald-500 p-3 rounded-r-xl">
                                      <span className="text-[10px] font-extrabold text-emerald-900 uppercase block mb-1">
                                        Kunci Jawaban Baku:
                                      </span>
                                      <pre className="text-emerald-950 font-mono text-[11px] whitespace-pre-line leading-relaxed font-bold">
                                        {EXAMINER_LIVE_SESSION.gold_standard_keys?.recipe}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : item.id === "r3" ? (
                              /* ITEM #3: PEMERIKSAAN PENUNJANG (SESUAI ALUR MOCKUP PESERTA TAHAP 3) */
                              <div className="space-y-2.5 pt-0.5">
                                <div className="bg-emerald-50/80 border-l-4 border-emerald-500 p-3 rounded-r-xl text-xs">
                                  <span className="font-bold text-emerald-950 uppercase text-[10px] block mb-0.5">
                                    Kunci Indikasi Pemeriksaan Penunjang Stase:
                                  </span>
                                  <span className="text-emerald-950 font-semibold leading-relaxed">{item.answer_key}</span>
                                </div>

                                <div className="bg-purple-50/80 border-l-4 border-purple-500 p-3 rounded-r-xl text-xs space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200/60 pb-2">
                                    <span className="font-extrabold text-purple-900 uppercase text-[10px] block">
                                      Item Penunjang yang Diminta Peserta pada Tahap 3:
                                    </span>

                                    {(activeParticipant.auxiliary_results || []).length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setIsAuxModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-purple-700 active:scale-95 transition"
                                      >
                                        <Eye size={14} />
                                        Lihat Berkas Hasil ({activeParticipant.auxiliary_results.length})
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap gap-2 pt-0.5">
                                    {(activeParticipant.auxiliary_requested || []).map((req, rIdx) => (
                                      <span
                                        key={rIdx}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                                          req.matched_key
                                            ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                                            : "bg-amber-100 border-amber-300 text-amber-900"
                                        }`}
                                      >
                                        {req.matched_key ? "✓ " : "• "}{req.name} ({req.category})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* ITEM #1 & #2: TEST OSCE OFFLINE (CUKUP KUNCI JAWABAN BAKU, PESERTA TIDAK KETIK APAPUN) */
                              <div className="pt-0.5">
                                <div className="bg-emerald-50/80 border-l-4 border-emerald-500 p-3 rounded-r-xl text-xs space-y-1">
                                  <span className="font-extrabold text-emerald-900 uppercase text-[10px] block">
                                    Kunci Jawaban & Prosedur Baku:
                                  </span>
                                  <span className="text-emerald-950 font-semibold leading-relaxed block">
                                    {item.answer_key}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium italic block pt-1 border-t border-emerald-200/60">
                                    Note: Tindakan ini diamati langsung oleh penguji di ruangan (OSCE Offline). Peserta tidak memasukkan input teks.
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Poin Radio Selector & Item Weighted Result (Dedicated Clean Toolbar) */}
                            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-900">Poin Diberikan:</span>
                                <div className="flex items-center gap-1.5">
                                  {[0, 0.5, 1, 2, 3]
                                    .filter((p) => p <= item.max_points)
                                    .map((pt) => {
                                      const isSelected = rubricScores[item.id] === pt;

                                      return (
                                        <button
                                          key={pt}
                                          type="button"
                                          onClick={() =>
                                            setRubricScores((prev) => ({ ...prev, [item.id]: pt }))
                                          }
                                          className={`rounded-xl px-3.5 py-2 text-xs font-black transition active:scale-95 ${
                                            isSelected
                                              ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30"
                                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                          }`}
                                        >
                                          {pt} Poin
                                        </button>
                                      );
                                    })}
                                </div>
                              </div>

                              <div className="text-[11px] font-bold text-slate-600">
                                Hasil: <span className="text-blue-700 font-black">{itemWeightedScore}</span> / {maxItemWeighted} Poin Terbobot
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Global Rating & Feedback */}
                <div className="border-t border-slate-200 pt-6 space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      Penilaian Global (Global Performance Rating)
                    </label>
                    <p className="text-xs text-slate-500">
                      Pilih tingkat kinerja holistik peserta untuk penetapan nilai batas lulus (Borderline Regression Method).
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {[
                        { label: "Tidak Lulus", activeClass: "bg-rose-600 border-rose-600 text-white shadow-sm" },
                        { label: "Borderline", activeClass: "bg-amber-500 border-amber-500 text-white shadow-sm" },
                        { label: "Lulus", activeClass: "bg-emerald-600 border-emerald-600 text-white shadow-sm" },
                        { label: "Superior", activeClass: "bg-blue-600 border-blue-600 text-white shadow-sm" },
                      ].map((gr) => {
                        const isSelected = globalRating === gr.label;

                        return (
                          <button
                            key={gr.label}
                            type="button"
                            onClick={() => setGlobalRating(gr.label)}
                            className={`rounded-xl border p-3 text-xs font-extrabold transition active:scale-95 ${
                              isSelected
                                ? gr.activeClass
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {gr.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      Catatan Evaluasi & Umpan Balik Penguji
                    </label>
                    <textarea
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tuliskan umpan balik atau saran perbaikan untuk peserta..."
                      className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleOpenSaveConfirm}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
                    >
                      <Lock size={15} />
                      Simpan & Kunci Nilai Ronde Ini
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT COLUMN (4 COLS): ROTATION LIST OF ALL EXAMINEES */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-1.5">
                <Users size={16} className="text-blue-600" />
                Daftar Rotasi Peserta Stase 1
              </span>
              <span className="text-blue-600 font-extrabold">{EXAMINER_LIVE_SESSION.rotation_list.length} Ronde</span>
            </h3>

            <div className="space-y-2.5">
              {EXAMINER_LIVE_SESSION.rotation_list.map((rot, idx) => {
                const isActive = !isBreak && activeRotationIndex === idx;

                return (
                  <div key={rot.round} className="space-y-2.5">
                    <div
                      onClick={() => {
                        setActiveRotationIndex(idx);
                        setIsBreak(false);
                      }}
                      className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                        isActive
                          ? "bg-blue-50 border-blue-400 text-blue-900 shadow-2xs font-bold"
                          : rot.status === "completed"
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : rot.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {rot.round}
                        </span>

                        <div>
                          <p className="font-bold text-xs">{rot.name}</p>
                          <p className="text-[11px] text-slate-400">NIM: {rot.nim}</p>
                        </div>
                      </div>

                      <div>
                        {rot.status === "completed" ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            {rot.score} Pts
                          </span>
                        ) : isActive ? (
                          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Menunggu</span>
                        )}
                      </div>
                    </div>

                    {/* Jeda Istirahat Rotasi (Static Schedule Card - Clickable for Mockup Demo) */}
                    {rot.round === 3 && (
                      <div
                        onClick={() => setIsBreak(true)}
                        className="rounded-xl border border-amber-300 bg-amber-50/80 p-3.5 text-amber-900 shadow-2xs space-y-1 cursor-pointer hover:border-amber-400 hover:bg-amber-100/70 active:scale-[0.98] transition select-none"
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5 text-amber-950">
                            <Coffee size={16} className="text-amber-700" />
                            Jeda Istirahat Rotasi
                          </span>
                          <span className="rounded-md bg-amber-200/90 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 border border-amber-300">
                            10 Menit (Klik Uji Istirahat)
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-snug font-medium">
                          Waktu rehat otomatis setelah Ronde 3. Klik di sini untuk menguji tampilan halaman istirahat.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Finish Full OSCE Station Session Action Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCompleteSessionModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
              >
                <CheckCircle2 size={16} />
                Selesaikan Sesi Penilaian Stase OSCE
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Auxiliary Examination Result Modal */}
      <AuxiliaryExamResultModal
        isOpen={isAuxModalOpen}
        onClose={() => setIsAuxModalOpen(false)}
        results={activeParticipant.auxiliary_results || []}
      />

      {/* MODAL KONFIRMASI PENGUNCIAN NILAI DOKTER PENGUJI */}
      {isLockConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Lock size={18} className="text-emerald-600" />
                Konfirmasi Penguncian Nilai Peserta
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Finalisasi Evaluasi Ronde #{activeParticipant.round}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 space-y-2">
              <p className="font-bold text-slate-900">
                Perhatian: Nilai yang sudah dikunci tidak dapat diubah kembali (lock evaluation).
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Apakah Anda yakin ingin menyelesaikan evaluasi untuk peserta <strong>{activeParticipant.name}</strong> (NIM: {activeParticipant.nim}) dengan Skor Akhir <strong>{finalCalculatedScore} / 100 ({globalRating})</strong> dan mengunci penilaian ronde ini?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsLockConfirmModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal / Periksa Kembali
              </button>
              <button
                type="button"
                onClick={confirmSaveEvaluation}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
              >
                <CheckCircle2 size={15} />
                Ya, Kunci Nilai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI SELESAIKAN SELURUH SESI STASE OSCE */}
      {isCompleteSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                Selesaikan Seluruh Sesi Penilaian Stase?
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Finalisasi Stase 1: Kardiovaskular</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-950 space-y-2">
              <p className="font-bold text-emerald-900">
                Konfirmasi Penyelesaian Sesi Penguji:
              </p>
              <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                Apakah Anda yakin ingin menyelesaikan seluruh sesi penilaian untuk <strong>Stase 1: Kardiovaskular</strong>? Semua rekapitulasi skor peserta ronde 1-6 akan langsung dikunci dan dikirim ke halaman terima kasih.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsCompleteSessionModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Kembali ke Evaluasi
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCompleteSessionModalOpen(false);
                  setIsSessionCompleted(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
              >
                <CheckCircle2 size={15} />
                Ya, Selesaikan Sesi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}