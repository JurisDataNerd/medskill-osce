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
} from "lucide-react";
import {
  MOCK_PARTICIPANT_PROFILE,
  MOCK_CURRENT_LIVE_STAGE,
  OPEN_OSCE_SESSIONS,
} from "@/features/participant/data/mockParticipantData";

export default function ParticipantSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Timer State
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

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? MOCK_CURRENT_LIVE_STAGE.duration_seconds : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            onClick={() => navigate("/participant")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
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
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Sisa Waktu:</span>
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
                Stase Ujian Aktif
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