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
} from "lucide-react";
import {
  MOCK_PARTICIPANT_PROFILE,
  MOCK_CURRENT_LIVE_STAGE,
} from "@/features/participant/data/mockParticipantData";
import {
  AUXILIARY_EXAM_CATALOG,
  getAllAuxiliaryExamItems,
} from "@/features/participant/data/auxiliaryExamsCatalog";
import AuxiliaryExamResultModal from "@/components/AuxiliaryExamResultModal";

export default function ParticipantSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // View Mode: 'waiting_room' or 'live_session'
  const [viewMode, setViewMode] = useState("waiting_room");

  // Multi-step exam state (1: Anamnesis, 2: Pemeriksaan Fisik, 3: Penunjang, 4: Diagnosis & Resep, 5: Transit)
  const [examStep, setExamStep] = useState(1);

  // Confirmation Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState(null);

  // Result Modal State for Tahap 3
  const [isAuxiliaryResultOpen, setIsAuxiliaryResultOpen] = useState(false);
  const [auxiliaryResults, setAuxiliaryResults] = useState([]);

  // Briefing Countdown in Waiting Room (30 seconds)
  const [waitingCountdown, setWaitingCountdown] = useState(
    MOCK_CURRENT_LIVE_STAGE.waiting_room_info.briefing_countdown_seconds
  );

  // Live Station Timer State (10 mins)
  const [secondsLeft, setSecondsLeft] = useState(MOCK_CURRENT_LIVE_STAGE.remaining_seconds);

  // Post-Station Transit Waiting Room Timer State (2 mins / 120 secs)
  const [transitCountdown, setTransitCountdown] = useState(120);

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

  // Auxiliary Exams Search & Filter State (Halaman 3)
  const [auxSearchQuery, setAuxSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [expandedCategories, setExpandedCategories] = useState({
    RADIOLOGI: true,
    HEMATOLOGI: true,
    ENZIM: true,
    "LAIN-LAIN": true,
  });

  // Mock Station Answer Key (Correct diagnostic tests & images for Stase 1 STEMI case)
  const MOCK_STATION_ANSWER_KEY = {
    lain_ekg_12_lead: {
      name: "EKG 12 Lead",
      category: "LAIN-LAIN",
      hasData: true,
      imageUrl: "https://placehold.co/900x550/0f172a/38bdf8.png?text=ST+ELEVATION+(Lead+II,+III,+aVF)+-+STEMI+INFERIOR",
      reportText: "Irama Sinus 100x/menit. Terlihat ST-Elevation di Lead II, III, aVF. Kesan: STEMI Akut Dinding Inferior.",
    },
    rad_thorax_ap: {
      name: "Thorax AP",
      category: "RADIOLOGI",
      hasData: true,
      imageUrl: "https://placehold.co/900x550/1e293b/f8fafc.png?text=RADIOLOGI+THORAX+AP+-+COR+DAN+PULMO+NORMAL",
      reportText: "Cor: CTR < 50%, bentuk normal. Pulmo: Tak tampak infiltrat, pembuluh darah paru normal. Sinus kostofrenikus lancip.",
    },
    hem_darah_lengkap_cbc: {
      name: "Darah Lengkap - CBC",
      category: "HEMATOLOGI",
      hasData: true,
      imageUrl: "https://placehold.co/900x550/0f172a/10b981.png?text=LABORATORIUM+DARAH+LENGKAP+(Hb+14.2,+Leukosit+9.800)",
      reportText: "Hb: 14.2 g/dL | Leukosit: 9.800 /uL | Trombosit: 280.000 /uL | Hematokrit: 42%",
    },
    enz_troponin_i: {
      name: "Troponin I",
      category: "ENZIM",
      hasData: true,
      imageUrl: "https://placehold.co/900x550/0f172a/ef4444.png?text=SERUM+ENZIM+TROPONIN+I+:+4.8+ng/mL+(POSITIF+TINGGI)",
      reportText: "Troponin I: 4.8 ng/mL (Normal < 0.04 ng/mL). Kesan: Nekrosis miokard akut tinggi.",
    },
  };

  const allCatalogItems = getAllAuxiliaryExamItems();

  const filteredCatalog = useMemo(() => {
    let result = AUXILIARY_EXAM_CATALOG;

    if (selectedCategoryFilter !== "ALL") {
      result = result.filter((cat) => cat.category === selectedCategoryFilter);
    }

    if (auxSearchQuery.trim()) {
      const q = auxSearchQuery.toLowerCase();
      result = result
        .map((cat) => {
          const matchingSub = cat.subcategories
            .map((sub) => {
              const matchingItems = sub.items.filter(
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
    }

    return result;
  }, [auxSearchQuery, selectedCategoryFilter]);

  // Waiting Room Countdown Timer
  useEffect(() => {
    if (viewMode !== "waiting_room") return;

    const timer = setInterval(() => {
      setWaitingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [viewMode]);

  // Live Station Countdown Timer (10 mins)
  useEffect(() => {
    if (viewMode !== "live_session" || examStep === 5) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Timer finished -> auto advance to post-station transit waiting room
          setExamStep(5);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [viewMode, examStep]);

  // Post-Station Transit Countdown Timer (2 mins)
  useEffect(() => {
    if (examStep !== 5) return;

    const timer = setInterval(() => {
      setTransitCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStep]);

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function handleEnterLiveSession() {
    setViewMode("live_session");
    setExamStep(1);
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
      alert("Pilih minimal 1 pemeriksaan penunjang.");
      return;
    }

    const results = checkedAuxiliaryIds.map((id) => {
      const catalogInfo = allCatalogItems.find((i) => i.id === id);
      const answerKeyData = MOCK_STATION_ANSWER_KEY[id];

      if (answerKeyData) {
        return answerKeyData;
      }

      return {
        id,
        name: catalogInfo ? catalogInfo.name : id,
        category: catalogInfo ? catalogInfo.category : "PEMERIKSAAN",
        hasData: false,
        imageUrl: `https://placehold.co/900x550/1e293b/94a3b8.png?text=${encodeURIComponent(
          (catalogInfo ? catalogInfo.name : id) + " - HASIL NORMAL / DALAM BATAS NORMAL"
        )}`,
        reportText: `Hasil pemeriksaan ${catalogInfo ? catalogInfo.name : id} dalam batas normal dan tidak menunjukkan kelainan bermakna.`,
      };
    });

    setAuxiliaryResults(results);
    setIsAuxiliaryResultOpen(true);
  }

  function handleFinishTransit() {
    alert("Anda telah berpindah ke Stase 2 (Pulmonologi)! Sesi ujian berikutnya akan dimulai.");
    navigate("/participant");
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

            <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Hourglass size={14} className="text-amber-700" />
              Ruang Tunggu & Briefing Peserta
            </span>
          </div>
        </header>

        {/* Waiting Room Body */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 my-auto space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-black text-white">
                  STASE {MOCK_CURRENT_LIVE_STAGE.station_number}
                </span>
                <h1 className="text-xl font-bold text-slate-900 mt-2">
                  {MOCK_CURRENT_LIVE_STAGE.title}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin size={14} className="text-slate-400" />
                  {MOCK_CURRENT_LIVE_STAGE.waiting_room_info.location}
                </p>
              </div>

              {/* Countdown Briefing Badge */}
              <div className="mx-auto sm:mx-0 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center min-w-[160px]">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Persiapan Memulai Stase:
                </p>
                <p className="text-2xl font-black font-mono text-amber-900 mt-0.5">
                  {formatTime(waitingCountdown)}
                </p>
              </div>
            </div>

            {/* Rotation & Examiner Details Grid */}
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gelombang & Rotasi</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  Gelombang #{MOCK_CURRENT_LIVE_STAGE.waiting_room_info.wave_number} • Ronde #{MOCK_CURRENT_LIVE_STAGE.waiting_room_info.rotation_round}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Ronde 2 dari {MOCK_CURRENT_LIVE_STAGE.waiting_room_info.total_rounds} Rotasi</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Dokter Penguji Penanggung Jawab</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {MOCK_CURRENT_LIVE_STAGE.examiner_name}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">🟢 Standby di Ruang Ujian</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pasien Standar AI</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {MOCK_CURRENT_LIVE_STAGE.patient_profile.name} ({MOCK_CURRENT_LIVE_STAGE.patient_profile.age} Th)
                </p>
                <p className="text-[11px] text-blue-700 font-semibold mt-0.5">Simulasi Pasien Aktif</p>
              </div>
            </div>

            {/* Aturan & Tata Tertib Ujian */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-blue-600" />
                Tata Tertib & Petunjuk Briefing Peserta
              </h3>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-700 font-medium">
                {MOCK_CURRENT_LIVE_STAGE.waiting_room_info.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA to Enter Live Session */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                <Volume2 size={16} className="text-blue-600 animate-pulse" />
                <span>Bel bell penanda masuk stase akan berbunyi otomatis saat waktu briefing habis.</span>
              </div>

              <button
                onClick={handleEnterLiveSession}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition"
              >
                <Play size={16} />
                Masuk ke Ruang Stase Ujian Live (Stase 1)
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
     RENDER VIEW 3: RUANG TUNGGU PINDAH RUANGAN (TRANSIT WAITING ROOM)
  ============================================================ */
  if (examStep === 5) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
        {/* Top Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-2xs">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-700" />
              Stase 1 Selesai • Ruang Transit Perpindahan Stase
            </span>

            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-1.5 text-amber-900">
              <Clock size={16} className="text-amber-700 animate-pulse" />
              <span className="text-[11px] font-bold uppercase">Sisa Waktu Transit:</span>
              <span className="text-base font-black font-mono">{formatTime(transitCountdown)}</span>
            </div>
          </div>
        </header>

        {/* Transit Body */}
        <main className="flex-1 max-w-3xl w-full mx-auto p-6 my-auto space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
                Rotasi Sirkuit OSCE
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-3">
                Selamat! Anda Telah Menyelesaikan Stase 1
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Silakan fisik berpindah ke ruangan stase berikutnya. Penguji dr. Alexander Budiman, Sp.JP sedang merekap nilai Anda.
              </p>
            </div>

            {/* Target Next Station Card */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <span className="rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-black text-white uppercase">
                  Target Stase Selanjutnya
                </span>
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  <MapPin size={14} className="text-blue-600" />
                  Gedung Skill Lab Ruang 102
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Stase 2: Pulmonologi & Eksaserbasi Akut Asma Bronkial
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Penguji Penanggung Jawab: <strong>dr. Maya Indah, Sp.P</strong>
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleFinishTransit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition"
              >
                <ArrowRight size={16} />
                Lanjut ke Stase 2 (Pulmonologi)
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
     RENDER VIEW 2: RUANG UJIAN LIVE MULTI-STEP (4 STEPS)
  ============================================================ */
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
              STASE {MOCK_CURRENT_LIVE_STAGE.station_number}
            </span>
            <span className="text-xs font-bold text-slate-900 hidden sm:inline">
              Ujian OSCE Periodik Dokter Spesialis - Batch III 2026
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

          {/* Continuous Action Timer Banner (10 Mins) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase hidden sm:inline">Sisa Waktu Stase:</span>
              <span className="text-sm font-black font-mono text-slate-900">{formatTime(secondsLeft)}</span>
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
                Penguji: <strong>{MOCK_CURRENT_LIVE_STAGE.examiner_name}</strong>
              </span>
            </div>

            <h1 className="text-sm font-extrabold text-slate-900 leading-snug">
              {MOCK_CURRENT_LIVE_STAGE.title}
            </h1>
          </div>

          {/* Skenario Kasus Medis */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Skenario Kasus Medis
            </h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">
              {MOCK_CURRENT_LIVE_STAGE.scenario}
            </div>
          </div>

          {/* Instruksi Peserta Ujian */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Instruksi Peserta Ujian
            </h2>
            <div className="space-y-2 text-xs text-slate-700 font-medium">
              {MOCK_CURRENT_LIVE_STAGE.participant_instructions.map((inst, idx) => (
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
    </div>
  );
}