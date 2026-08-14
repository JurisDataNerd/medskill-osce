import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Stethoscope,
  Sparkles,
  Maximize2,
  X,
  User,
  CheckCircle2,
  Activity,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function InteractiveSimulatorsSection() {
  const [activeTab, setActiveTab] = useState("mandiri"); // 'mandiri' or 'onsite'
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [messages, setMessages] = useState([
    {
      sender: "patient",
      text: "Selamat dokter, dada saya terasa sangat terikat dan sesak sejak 2 jam lalu...",
      time: "10:00 AM",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showFullProofModal, setShowFullProofModal] = useState(false);

  // Penunjang Interactive State for On-Site tab
  const [selectedPenunjang, setSelectedPenunjang] = useState({
    ekg: true,
    radiologi: false,
    lab: true,
  });

  const cases = [
    {
      title: "Kardiovaskular",
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
      title: "Pulmonologi",
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
      title: "Gastroentero",
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
    const newMsgs = [
      ...messages,
      {
        sender: "doctor",
        text: questionText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setMessages(newMsgs);
    setIsTyping(true);

    setTimeout(() => {
      const matchedAnswer =
        currentCase.answers[questionText] ||
        `Dokter, mengenai hal ini, gejala tersebut memang terasa sangat mengganggu dok.`;

      setMessages((prev) => [
        ...prev,
        {
          sender: "patient",
          text: matchedAnswer,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 850);
  }

  return (
    <section
      id="anamnesis-ai"
      className="relative py-24 sm:py-32 bg-slate-50 text-slate-900 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 shadow-sm mb-4">
            <Sparkles className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E3A8A]">
              Dua Skema Pelaksanaan OSCE
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Interaktif & Realistis <br />
            <span className="bg-gradient-to-r from-[#1E3A8A] via-blue-700 to-cyan-600 bg-clip-text text-transparent">
              OSCE Mandiri vs OSCE On-Site
            </span>
          </h2>

          <p className="mt-4 text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
            Eksplorasi antarmuka fitur simulasi langsung pada landing page. Pilih skema pelaksanaan untuk melihat bagaimana Praxis memfasilitasi kebutuhan ujian klinis Anda.
          </p>

          {/* Scheme Switcher Tabs */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-md">
            <button
              onClick={() => setActiveTab("mandiri")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                activeTab === "mandiri"
                  ? "bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20"
                  : "text-slate-600 hover:text-[#1E3A8A]"
              }`}
            >
              <Bot size={18} />
              <span>OSCE Mandiri (Simulasi Anamnesis AI)</span>
            </button>

            <button
              onClick={() => setActiveTab("onsite")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                activeTab === "onsite"
                  ? "bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20"
                  : "text-slate-600 hover:text-[#1E3A8A]"
              }`}
            >
              <Building2 size={18} />
              <span>OSCE On-Site (Sirkuit 6 Stase)</span>
            </button>
          </div>
        </motion.div>

        {/* Tab 1: OSCE Mandiri (AI Anamnesis Playground) */}
        <AnimatePresence mode="wait">
          {activeTab === "mandiri" ? (
            <motion.div
              key="mandiri-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Live Interactive Anamnesis Chat */}
              <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white shadow-xl p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E3A8A] text-white shadow-md font-bold">
                      <Stethoscope size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span>Live Simulasi Anamnesis AI</span>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Pasien: <span className="font-bold text-[#1E3A8A]">{currentCase.patientName}</span> ({currentCase.title})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowFullProofModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-extrabold text-[#1E3A8A] hover:bg-blue-100 transition cursor-pointer"
                  >
                    <Maximize2 size={14} />
                    <span>Bukti Modul (`praxis.png`)</span>
                  </button>
                </div>

                {/* Case Selection Pills */}
                <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
                  {cases.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectCase(idx)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                        selectedCaseIndex === idx
                          ? "bg-[#1E3A8A] text-white shadow-md shadow-blue-900/15"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {c.title} — {c.diagnosis}
                    </button>
                  ))}
                </div>

                {/* Chat Container */}
                <div className="mt-5 h-[290px] overflow-y-auto rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3.5 scrollbar-thin">
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
                            ? "bg-[#1E3A8A] text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {msg.sender === "doctor" ? <User size={15} /> : <Bot size={15} />}
                      </div>

                      <div>
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                            msg.sender === "doctor"
                              ? "bg-[#1E3A8A] text-white rounded-tr-none"
                              : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <p className="mt-1 text-[10px] text-slate-500 px-1 font-mono">
                          {msg.sender === "doctor" ? "Dokter (Anda)" : "Pasien Standar AI"} • {msg.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-2 text-xs text-[#1E3A8A] italic font-mono pl-2">
                      <Bot size={14} className="animate-spin" />
                      <span>Pasien AI sedang merespons...</span>
                    </div>
                  )}
                </div>

                {/* Quick Prompts */}
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#1E3A8A]" />
                    <span>Klik Pertanyaan Anamnesis Klinis:</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentCase.prompts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendPrompt(p)}
                        disabled={isTyping}
                        className="text-[11px] font-semibold text-[#1E3A8A] bg-blue-50 border border-blue-200 hover:border-blue-400 hover:bg-blue-100 rounded-xl px-3 py-1.5 transition text-left cursor-pointer disabled:opacity-50"
                      >
                        💬 "{p}"
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Tersedia 24/7 untuk latihan anamnesis mandiri.</span>
                  </div>

                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-blue-900 transition cursor-pointer"
                  >
                    <span>Simulasikan Anamnesis Penuh</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              {/* Right Column: Screenshot Proof (`praxis.png`) Card */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-100 mb-3 text-xs font-bold text-slate-900">
                    <span>Bukti Antarmuka Modul (`praxis.png`)</span>
                    <span className="text-[#1E3A8A] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-[10px]">
                      Validated Interface
                    </span>
                  </div>

                  <div
                    onClick={() => setShowFullProofModal(true)}
                    className="relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 group"
                  >
                    <img
                      src="/praxis.png"
                      alt="Bukti Antarmuka Anamnesis AI Praxis"
                      className="w-full h-auto object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold bg-slate-900/90 p-2.5 rounded-xl border border-white/20 backdrop-blur-md">
                      <span className="flex items-center gap-2">
                        <Bot size={16} className="text-cyan-300" />
                        <span>Klik untuk Perbesar Proof Screenshot</span>
                      </span>
                      <Maximize2 size={14} />
                    </div>
                  </div>
                </div>

                {/* Key Benefits */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 text-xs text-slate-600 font-medium">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#1E3A8A]" />
                    <span>Keunggulan Anamnesis AI Praxis:</span>
                  </h4>
                  <p>• Respon verbal Pasien AI sesuai dengan lokasi, durasi & faktor pemicu gejala.</p>
                  <p>• Evaluasi kelengkapan anamnesis (Sacred Seven & Fundamental Four).</p>
                  <p>• Dapat diakses kapan saja dari laptop, tablet, maupun mobile.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Tab 2: OSCE On-Site (Sirkuit & Lembar Jawaban Clinician) */
            <motion.div
              key="onsite-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Interactive Form Clinician */}
              <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-widest">
                      Skema OSCE On-Site
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                      Blangko Diagnostik & Penulisan Resep Clinician
                    </h3>
                  </div>
                  <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                    Exam Station #1 Active
                  </span>
                </div>

                {/* Blangko 1: Diagnosis Kerja (WDx) */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    1. Diagnosis Kerja / Working Diagnosis (WDx) — 1 Baris Input:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="STEMI Anteroseptal (ST-Elevation Myocardial Infarction)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-emerald-700 focus:outline-none shadow-sm"
                  />
                </div>

                {/* Blangko 2: Diagnosis Banding (DDx - 3 Baris) */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    2. Diagnosis Banding / Differential Diagnoses (DDx) — 3 Baris Input:
                  </label>
                  <div className="space-y-2 text-xs font-semibold">
                    <input
                      type="text"
                      readOnly
                      value="1. Angina Pektoris Tidak Stabil (UAP / Unstable Angina)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 shadow-sm"
                    />
                    <input
                      type="text"
                      readOnly
                      value="2. Diseksi Aorta Thorakalis (Aortic Dissection)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 shadow-sm"
                    />
                    <input
                      type="text"
                      readOnly
                      value="3. Perikarditis Akut (Acute Pericarditis)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 shadow-sm"
                    />
                  </div>
                </div>

                {/* Blangko 3: Resep Medis & Penunjang */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    3. Blangko Penulisan Resep Obat Medis:
                  </label>
                  <textarea
                    readOnly
                    rows={3}
                    value={`R/ Aspirin tab 80 mg No. IV S 1 dd tab IV (loading dose)\nR/ Clopidogrel tab 75 mg No. IV S 1 dd tab IV (loading dose)`}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 font-mono shadow-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column: Interactive Penunjang Checklist */}
              <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-5">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Activity size={18} className="text-[#1E3A8A]" />
                  <span>Checklist Pemeriksaan Penunjang:</span>
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Centang item pemeriksaan penunjang di bawah ini untuk menguji respon simulasi data medis hasil laboratorium & EKG:
                </p>

                <div className="space-y-3">
                  <label
                    onClick={() => setSelectedPenunjang((p) => ({ ...p, ekg: !p.ekg }))}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                      selectedPenunjang.ekg
                        ? "bg-blue-50/80 border-[#1E3A8A] text-[#1E3A8A]"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <span className="text-xs font-bold">EKG 12-Lead (Kardiovaskular)</span>
                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${selectedPenunjang.ekg ? "bg-[#1E3A8A] text-white" : "bg-slate-200"}`}>
                      {selectedPenunjang.ekg ? "Hasil Rilis ✓" : "Tidak Dicentang"}
                    </span>
                  </label>

                  {selectedPenunjang.ekg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono text-[#1E3A8A]"
                    >
                      ✓ Elevasi segmen ST di sadapan V1-V4 (STEMI Anteroseptal).
                    </motion.div>
                  )}

                  <label
                    onClick={() => setSelectedPenunjang((p) => ({ ...p, lab: !p.lab }))}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                      selectedPenunjang.lab
                        ? "bg-blue-50/80 border-[#1E3A8A] text-[#1E3A8A]"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <span className="text-xs font-bold">Enzim Jantung (Troponin I / CK-MB)</span>
                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${selectedPenunjang.lab ? "bg-[#1E3A8A] text-white" : "bg-slate-200"}`}>
                      {selectedPenunjang.lab ? "Hasil Rilis ✓" : "Tidak Dicentang"}
                    </span>
                  </label>

                  {selectedPenunjang.lab && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono text-[#1E3A8A]"
                    >
                      ✓ Troponin I: 4.8 ng/mL (Meningkat Signifikan).
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox Proof Modal */}
      <AnimatePresence>
        {showFullProofModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 sm:p-8 backdrop-blur-sm"
            onClick={() => setShowFullProofModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Bot size={20} className="text-[#1E3A8A]" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Bukti Fitur Simulasi Anamnesis AI (`praxis.png`)
                    </h3>
                    <p className="text-xs text-slate-500">Praxis by Medskill Indonesia</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFullProofModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-auto max-h-[75vh] rounded-2xl border border-slate-200">
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
