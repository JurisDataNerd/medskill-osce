import { useState, useEffect } from "react";
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
  Lock,
  Hourglass,
  ShieldCheck,
  MapPin,
  Play,
  Volume2,
} from "lucide-react";
import {
  MOCK_PARTICIPANT_PROFILE,
  MOCK_CURRENT_LIVE_STAGE,
} from "@/features/participant/data/mockParticipantData";

export default function ParticipantSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // View Mode: 'waiting_room' or 'live_session'
  const [viewMode, setViewMode] = useState("waiting_room");

  // Briefing Countdown in Waiting Room (30 seconds)
  const [waitingCountdown, setWaitingCountdown] = useState(
    MOCK_CURRENT_LIVE_STAGE.waiting_room_info.briefing_countdown_seconds
  );

  // Live Station Timer State (15 mins)
  const [secondsLeft, setSecondsLeft] = useState(MOCK_CURRENT_LIVE_STAGE.remaining_seconds);

  // Chat Log State
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(MOCK_CURRENT_LIVE_STAGE.initial_messages);

  // Interactive Checklist State
  const [checklist, setChecklist] = useState({
    c1: true,
    c2: true,
    c3: false,
    c4: false,
  });

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

  // Live Station Countdown Timer
  useEffect(() => {
    if (viewMode !== "live_session") return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? MOCK_CURRENT_LIVE_STAGE.duration_seconds : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [viewMode]);

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function handleEnterLiveSession() {
    setViewMode("live_session");
  }

  function handleSend(textToSend) {
    const content = textToSend || input;
    if (!content.trim()) return;

    // Append Doctor (User) Question
    const userMsg = { role: "user", content };

    // Simulate AI Patient Response
    let aiReply = "Aduhh iya Dokter, sakitnya makin berasa kalau saya menghela napas panjang...";

    if (content.toLowerCase().includes("lengan") || content.toLowerCase().includes("radiasi")) {
      aiReply = "Iya Dokter, nyerinya menjalar ke lengan kiri saya dan rasanya panas seperti terbakar...";
    } else if (content.toLowerCase().includes("sesak") || content.toLowerCase().includes("mual")) {
      aiReply = "Iya Dok, dada rasanya sesak berat dan saya sempat mual serta bercucuran keringat dingin.";
    } else if (content.toLowerCase().includes("hipertensi") || content.toLowerCase().includes("riwayat")) {
      aiReply = "Saya ada riwayat darah tinggi Dok, dan saya perokok aktif 1 bungkus sehari sejak 10 tahun lalu.";
    } else if (content.toLowerCase().includes("auskultasi") || content.toLowerCase().includes("periksa")) {
      aiReply = "(Pasien berbaring tenang): Silakan Dokter, saya siap diperiksa stetoskop.";
      setChecklist((prev) => ({ ...prev, c3: true }));
    }

    const assistantMsg = { role: "assistant", content: aiReply };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  }

  function handleFinishStation() {
    alert(
      "Jawaban stase 1 berhasil dikirim! Penguji dr. Alexander Budiman, Sp.JP sedang merekap nilai Anda. Anda akan diarahkan ke rotasi stase berikutnya."
    );
    navigate("/participant");
  }

  /* ============================================================
     RENDER VIEW 1: RUANG TUNGGU PESERTA (WAITING ROOM PREVIEW)
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
              <Hourglass size={14} className="text-amber-700 animate-spin" />
              Ruang Tunggu & Briefing Peserta
            </span>
          </div>
        </header>

        {/* Waiting Room Body */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 my-auto space-y-6">
          {/* Main Briefing Banner Card */}
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
     RENDER VIEW 2: RUANG UJIAN LIVE STASE 1 (ACTIVE EXAM ROOM)
  ============================================================ */
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            onClick={() => setViewMode("waiting_room")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft size={16} />
            Lihat Briefing Ruang Tunggu
          </button>

          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
              STASE {MOCK_CURRENT_LIVE_STAGE.station_number}
            </span>
            <span className="text-xs font-bold text-slate-900 hidden sm:inline">
              Ujian OSCE Periodik Dokter Spesialis - Batch III 2026
            </span>
          </div>

          {/* Synchronized Timer Banner */}
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-emerald-900">
            <Clock size={16} className="text-emerald-700 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Sisa Waktu Stase:</span>
            <span className="text-sm font-black font-mono text-emerald-900">{formatTime(secondsLeft)}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace (2-Column Layout) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN (5 COLS): CLINICAL SCENARIO & CHECKLIST */}
        <div className="lg:col-span-5 space-y-6">
          {/* Station Title Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                Stase Ujian Live Aktif
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Penguji: <strong>{MOCK_CURRENT_LIVE_STAGE.examiner_name}</strong>
              </span>
            </div>

            <h1 className="text-base font-bold text-slate-900 leading-snug">
              {MOCK_CURRENT_LIVE_STAGE.title}
            </h1>
          </div>

          {/* Skenario Kasus Medis */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              Skenario Kasus Medis
            </h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 font-medium leading-relaxed">
              {MOCK_CURRENT_LIVE_STAGE.scenario}
            </div>
          </div>

          {/* Instruksi Peserta Ujian */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle size={16} className="text-indigo-600" />
              Instruksi Peserta Ujian
            </h2>
            <div className="space-y-2 text-xs text-slate-700 font-medium">
              {MOCK_CURRENT_LIVE_STAGE.participant_instructions.map((inst, idx) => (
                <div key={idx} className="rounded-lg bg-slate-50 border border-slate-100 p-2.5">
                  {inst}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Checklist Prosedur */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Checklist Kepatuhan Prosedur Klinis
            </h2>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.c1}
                  onChange={(e) => setChecklist({ ...checklist, c1: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">1. Menyapa salam & bina sambung rasa</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.c2}
                  onChange={(e) => setChecklist({ ...checklist, c2: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">2. Anamnesis nyeri dada terarah (OPQRST)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.c3}
                  onChange={(e) => setChecklist({ ...checklist, c3: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">3. Auskultasi 4 katup jantung (A, P, T, M)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.c4}
                  onChange={(e) => setChecklist({ ...checklist, c4: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">4. Interpretasi EKG 12 Lead & Diagnosis STEMI</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 COLS): AI PATIENT SIMULATOR CHAT ROOM */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col h-[680px] rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            {/* Patient Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <img
                  src={MOCK_CURRENT_LIVE_STAGE.patient_profile.avatar}
                  alt={MOCK_CURRENT_LIVE_STAGE.patient_profile.name}
                  className="h-10 w-10 rounded-full object-cover border-2 border-blue-500 shadow-2xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900">
                      {MOCK_CURRENT_LIVE_STAGE.patient_profile.name}
                    </h3>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2">
                      Pasien Standar AI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {MOCK_CURRENT_LIVE_STAGE.patient_profile.gender}, {MOCK_CURRENT_LIVE_STAGE.patient_profile.age} Tahun
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                Interaksi Wawancara Live
              </span>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-2xs ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase mb-1 opacity-70">
                      {msg.role === "user" ? "Dokter Peserta" : "Pasien (Tn. Budi)"}
                    </p>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompts Bar */}
            <div className="border-t border-slate-200 bg-slate-50/80 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Pertanyaan / Tindakan Cepat:</p>
              <div className="flex flex-wrap gap-1.5">
                {MOCK_CURRENT_LIVE_STAGE.quick_prompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(qp)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box & Action Footer */}
            <div className="border-t border-slate-200 p-4 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ketik wawancara medis atau instruksi tindakan..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
                >
                  <Send size={15} />
                  Kirim
                </button>
              </form>
            </div>
          </div>

          {/* Finish Station CTA */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-emerald-900">Selesaikan Stase 1</p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Kirimkan seluruh jawaban & hasil wawancara stase 1 ke dokter penguji.
              </p>
            </div>

            <button
              onClick={handleFinishStation}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
            >
              <Lock size={15} />
              Selesaikan Stase Ini
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}