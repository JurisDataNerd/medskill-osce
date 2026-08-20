import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  MessageSquare,
  Sparkles,
  Send,
  User,
  CheckCircle2,
  Maximize2,
  X,
  Stethoscope,
  Activity,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AnamnesisAiDemo() {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [messages, setMessages] = useState([
    {
      sender: "patient",
      text: "Selamat dokter, dada saya terasa sangat nyeri dan sesak sejak 2 jam yang lalu...",
      time: "10:00 AM",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFullProofModal, setShowFullProofModal] = useState(false);

  const cases = [
    {
      title: "Kardiovaskular — Nyeri Dada",
      diagnosis: "STEMI Anteroseptal",
      patientName: "Tn. Budi (48 th)",
      initialMessage:
        "Selamat dokter, dada sebelah kiri saya terasa seperti tertindih beban berat sejak 2 jam lalu, merambat sampai ke leher dan lengan kiri.",
      prompts: [
        "Sejak kapan nyerinya dirasakan dan seperti apa rasanya?",
        "Apakah nyerinya menjalar ke tempat lain?",
        "Apakah ada keluhan sesak napas, mual, atau keringat dingin?",
      ],
      answers: {
        "Sejak kapan nyerinya dirasakan dan seperti apa rasanya?":
          "Sekitar 2 jam lalu pas saya lagi duduk dok. Rasanya kenceng banget kayak diikat dan tertindih benda berat.",
        "Apakah nyerinya menjalar ke tempat lain?":
          "Iya dok, nyerinya nembus ke punggung belakang dan menjalar ke lengan kiri sampai ke rahang bawah.",
        "Apakah ada keluhan sesak napas, mual, atau keringat dingin?":
          "Iya dok, saya merasa agak mual dan badan saya keluar keringat dingin banyak sekali sampai baju basah.",
      },
    },
    {
      title: "Pulmonologi — Sesak Napas",
      diagnosis: "Eksaserbasi Akut Asma Bronkial",
      patientName: "Ny. Siti (26 th)",
      initialMessage:
        "Dokter, napas saya sesak sekali dan berbunyi ngik-ngik sejak tadi malam setelah terpapar debu waktu bersih-bersih rumah.",
      prompts: [
        "Apakah sebelumnya pernah mengalami sesak berbunyi seperti ini?",
        "Apakah ada riwayat alergi atau asma di keluarga?",
        "Apakah sesaknya mengganggu aktivitas dan tidur?",
      ],
      answers: {
        "Apakah sebelumnya pernah mengalami sesak berbunyi seperti ini?":
          "Pernah dok, waktu SMA dulu kalau dingin atau kena debu suka menggegar, tapi kali ini terasa lebih berat.",
        "Apakah ada riwayat alergi atau asma di keluarga?":
          "Iya dok, ibu saya juga ada riwayat asma dan alergi makanan laut.",
        "Apakah sesaknya mengganggu aktivitas dan tidur?":
          "Sangat mengganggu dok, dari semalam saya tidak bisa tidur telentang, harus duduk terus.",
      },
    },
    {
      title: "Gastroentero — Nyeri Perut",
      diagnosis: "Appendicitis Akut",
      patientName: "An. Dimas (19 th)",
      initialMessage:
        "Dok, perut saya sakit sekali. Awalnya di daerah ulu hati terus pindah ke perut kanan bawah sejak kemarin sore.",
      prompts: [
        "Apakah nyerinya bertambah saat batuk atau berjalan?",
        "Apakah ada disertai demam, mual, atau mual-muntah?",
        "Bagaimana dengan nafsu makan Anda?",
      ],
      answers: {
        "Apakah nyerinya bertambah saat batuk atau berjalan?":
          "Iya dok! Pas saya melangkah atau pas batuk terasa ngenes menusuk banget di perut kanan bawah.",
        "Apakah ada disertai demam, mual, atau mual-muntah?":
          "Ada dok, badan saya agak sumeng demam dan tadi pagi sempat muntah 2 kali.",
        "Bagaimana dengan nafsu makan Anda?":
          "Sama sekali tidak nafsu makan dok, cium bau makanan aja mual.",
      },
    },
  ];

  const currentCase = cases[selectedCaseIndex];

  function handleSelectCase(idx) {
    setSelectedCaseIndex(idx);
    const selected = cases[idx];
    setMessages([
      {
        sender: "patient",
        text: selected.initialMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }

  function handleSendPrompt(questionText) {
    if (isTyping) return;
    const textToSend = questionText || inputQuery;
    if (!textToSend.trim()) return;

    const newMsgs = [
      ...messages,
      {
        sender: "doctor",
        text: textToSend,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setMessages(newMsgs);
    setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const matchedAnswer =
        currentCase.answers[textToSend] ||
        `Dokter, mengenai "${textToSend}", gejala ini memang terasa mengganggu. Mohon petunjuk pemeriksaan lebih lanjut dok.`;

      setMessages((prev) => [
        ...prev,
        {
          sender: "patient",
          text: matchedAnswer,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 900);
  }

  return (
    <section
      id="anamnesis-ai"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-slate-900 via-[#0B1536] to-slate-950 text-white overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-4 py-1.5 backdrop-blur-md mb-4 shadow-lg shadow-cyan-900/20">
            <Bot className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
              Skema OSCE Mandiri
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Simulasikan <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">Anamnesis dengan AI</span>
          </h2>

          <p className="mt-4 text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            Pada skema OSCE Mandiri, Anda dapat melatih kelancaran anamnesis wawancara medis secara langsung bersama Pasien Standar AI yang merespons pertanyaan klinis sesuai dengan skenario penyakit.
          </p>
        </motion.div>

        {/* Main Grid: Interactive Widget & Proof Asset Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Live Mini Interactive Simulator */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl p-5 sm:p-7 flex flex-col justify-between"
          >
            <div>
              {/* Header & Case Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20">
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>Simulasi Live Anamnesis</span>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    </h3>
                    <p className="text-xs text-cyan-300/80 font-medium">
                      Pasien: <span className="font-bold text-white">{currentCase.patientName}</span> ({currentCase.title.split("—")[0]})
                    </p>
                  </div>
                </div>

                {/* Proof Badge Button */}
                <button
                  onClick={() => setShowFullProofModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer self-start sm:self-auto"
                >
                  <Maximize2 size={14} />
                  <span>Lihat Bukti Tampilan AI (`praxis.png`)</span>
                </button>
              </div>

              {/* Case Tabs */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
                {cases.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectCase(idx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      selectedCaseIndex === idx
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>

              {/* Chat Container */}
              <div className="mt-5 h-[280px] sm:h-[320px] overflow-y-auto rounded-2xl bg-slate-950/80 p-4 border border-white/5 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 max-w-[88%] ${
                      msg.sender === "doctor" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        msg.sender === "doctor"
                          ? "bg-blue-600 text-white"
                          : "bg-cyan-600 text-white"
                      }`}
                    >
                      {msg.sender === "doctor" ? <User size={15} /> : <Bot size={15} />}
                    </div>

                    <div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          msg.sender === "doctor"
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-slate-800 text-slate-100 border border-white/10 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 px-1 font-mono">
                        {msg.sender === "doctor" ? "Dokter (Anda)" : "Pasien AI"} • {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400/80 italic font-mono pl-2">
                    <Bot size={14} className="animate-spin" />
                    <span>Pasien AI sedang mengetik jawaban...</span>
                  </div>
                )}
              </div>

              {/* Sample Prompt Shortcuts */}
              <div className="mt-4">
                <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-cyan-400" />
                  <span>Contoh Pertanyaan Anamnesis Klinik:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentCase.prompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendPrompt(p)}
                      disabled={isTyping}
                      className="text-[11px] font-semibold text-cyan-200 bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-900/50 rounded-lg px-3 py-1.5 transition text-left cursor-pointer disabled:opacity-50"
                    >
                      "{p}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Simulasi interaktif 24/7 tanpa batas batas percakapan.</span>
              </div>

              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer"
              >
                <span>Simulasikan Anamnesis Sekarang</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>

          {/* Right Side: Proof Image Card (`praxis.png`) & Core Strengths */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Proof Card with screenshot image */}
            <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-4 shadow-2xl backdrop-blur-xl group overflow-hidden">
              <div className="flex items-center justify-between pb-3 px-2 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Bukti Tampilan Antarmuka Asli</span>
                </div>
                <span className="rounded-lg bg-blue-600/30 border border-blue-400/40 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-200">
                  `praxis.png`
                </span>
              </div>

              <div
                onClick={() => setShowFullProofModal(true)}
                className="relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 group/img"
              >
                <img
                  src="/praxis.png"
                  alt="Bukti Antarmuka Simulasi Anamnesis AI Praxis by Medskill"
                  className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover/img:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover/img:opacity-40 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={16} className="text-cyan-400" />
                    <span>Tampilan Modul Anamnesis Pasien AI</span>
                  </div>
                  <span className="text-[11px] text-cyan-300 font-semibold underline">Klik Memperbesar</span>
                </div>
              </div>
            </div>

            {/* Highlights List */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Mengapa Anamnesis AI Sangat Efektif?</span>
              </h4>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                    1
                  </div>
                  <p>
                    <strong className="text-white font-bold">Respon Realistis Sesuai Kasus:</strong> Pasien AI merespons keluhan utama, lokasi nyeri, onset, hingga faktor pemicu secara klinis.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                    2
                  </div>
                  <p>
                    <strong className="text-white font-bold">Latihan Keterampilan Komunikasi Medis:</strong> Membantu mahasiswa menyusun urutan pertanyaanSacred Seven & Fundamental Four.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                    3
                  </div>
                  <p>
                    <strong className="text-white font-bold">Dapat Diulang Kapan Saja:</strong> Memungkinkan evaluasi mandiri tanpa bergantung pada ketersediaan aktor pasien manusia.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Full Lightbox Proof Modal (`praxis.png`) */}
      <AnimatePresence>
        {showFullProofModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 sm:p-8 backdrop-blur-md"
            onClick={() => setShowFullProofModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full rounded-3xl border border-cyan-500/30 bg-slate-900 p-4 sm:p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Bot size={20} className="text-cyan-400" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Bukti Fitur Simulasi Anamnesis AI (`praxis.png`)
                    </h3>
                    <p className="text-xs text-slate-400">Praxis by Medskill Indonesia</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFullProofModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-auto max-h-[75vh] rounded-2xl border border-white/10">
                <img
                  src="/praxis.png"
                  alt="Bukti Antarmuka Anamnesis Pasien AI Praxis"
                  className="w-full h-auto object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
