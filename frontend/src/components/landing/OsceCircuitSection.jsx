import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  HeartPulse,
  Wind,
  Activity,
  Brain,
  Crosshair,
  ShieldAlert,
  Timer,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function OsceCircuitSection() {
  const [activeStationIndex, setActiveStationIndex] = useState(0);

  const stations = [
    {
      stase: "Stase 1",
      field: "Kardiovaskular",
      title: "STEMI Anteroseptal (Nyeri Dada Infark)",
      examiner: "dr. Alexander Budiman, Sp.JP",
      icon: HeartPulse,
      color: "from-rose-500 to-red-600",
      lightBg: "bg-rose-50 border-rose-200 text-rose-900",
      description:
        "Anamnesis keluhan nyeri dada khas infark, interpretasi EKG 12-lead (ST elevasi V1-V4), penentuan WDx STEMI, 3 DDx (UAP, Diseksi Aorta, Perikarditis), dan penulisan resep dual antiplatelet loading dose.",
    },
    {
      stase: "Stase 2",
      field: "Pulmonologi",
      title: "Eksaserbasi Akut Asma Bronkial",
      examiner: "dr. Maya Indah, Sp.P",
      icon: Wind,
      color: "from-sky-500 to-blue-600",
      lightBg: "bg-sky-50 border-sky-200 text-sky-900",
      description:
        "Evaluasi trias asma, pemeriksaan auskultasi paru (wheezing ekspiratorik), interpretasi Spirometri / Penunjang, penentuan WDx, 3 DDx, serta resep nebulisasi & inhaler kortikosteroid.",
    },
    {
      stase: "Stase 3",
      field: "Bedah & Traumatologi",
      title: "Fraktur Terbuka Femur & Balut Bidai",
      examiner: "dr. Budi Santoso, Sp.OT",
      icon: Crosshair,
      color: "from-amber-500 to-orange-600",
      lightBg: "bg-amber-50 border-amber-200 text-amber-900",
      description:
        "Primary survey Trauma (ABCDE), penilaian diskontinuitas tulang, ceklist penunjang Rontgen Femur AP/Lateral, tata laksana imobilisasi balut bidai, serta penulisan resep analgesik opioid/NSAID.",
    },
    {
      stase: "Stase 4",
      field: "Neurologi",
      title: "Pemeriksaan Saraf Kranial (N. VII & N. XII)",
      examiner: "dr. Hendra Wijaya, Sp.N",
      icon: Brain,
      color: "from-purple-500 to-indigo-600",
      lightBg: "bg-purple-50 border-purple-200 text-purple-900",
      description:
        "Pemeriksaan motorik nervus fasialis (parese sentral vs perifer) dan nervus hipoglosus (deviasi lidah), evaluasi stroke iskemik vs perdarahan, input WDx + 3 DDx.",
    },
    {
      stase: "Stase 5",
      field: "Gastroentero-Hepatologi",
      title: "Appendicitis Akut (Pemeriksaan Abdomen)",
      examiner: "dr. Rina Astuti, Sp.PD",
      icon: Activity,
      color: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50 border-emerald-200 text-emerald-900",
      description:
        "Palpasi regio abdomen (Nyeri tekan titik McBurney, Rovsing sign, Blumberg sign, Psoas sign), ceklist USG Abdomen & Darah Rutin (leukositosis), input WDx & 3 DDx abdomen akut.",
    },
    {
      stase: "Stase 6",
      field: "Resusitasi / ACLS",
      title: "Henti Jantung & Defibrilasi AED",
      examiner: "dr. Denny Pratama, Sp.An",
      icon: ShieldAlert,
      color: "from-blue-700 to-[#1E3A8A]",
      lightBg: "bg-blue-50 border-blue-200 text-[#1E3A8A]",
      description:
        "Algoritma High-Quality CPR (RJP 30:2), analisa irama EKG Shockable vs Non-shockable (VF/pVT vs Asistol/PEA), penggunaan alat Defibrilator/AED, serta penulisan resep Epinefrin/Amiodaron.",
    },
  ];

  const currentStation = stations[activeStationIndex];

  return (
    <section
      id="sirkuit-stase"
      className="relative py-24 sm:py-32 bg-white text-slate-900 overflow-hidden"
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
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 mb-4 shadow-sm">
            <Timer className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E3A8A]">
              Sirkuit Ujian 6 Stase Aktif
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Arsitektur Rotasi Sirkuit & <br />
            <span className="bg-gradient-to-r from-[#1E3A8A] via-blue-700 to-cyan-600 bg-clip-text text-transparent">
              Timer Baku 12 Menit Stase
            </span>
          </h2>

          <p className="mt-4 text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
            Setiap 1 Sesi Ujian OSCE terdiri dari total 6 stase aktif komprehensif yang diikuti peserta secara berurutan dengan sistem penghitung waktu otomatis.
          </p>
        </motion.div>

        {/* 12-Minute Timer Breakdown Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-slate-50 to-blue-50/80 p-6 sm:p-10 shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
            <div>
              <span className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={14} />
                Struktur Timer Stase Sync (Total 12 Menit)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Navigasi Countdown Synchronized Per Stase
              </h3>
            </div>

            <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-xl px-4 py-2 text-xs font-bold text-[#1E3A8A] shadow-sm">
              <Clock size={16} />
              <span>Sirkuit Rotasi Otomatis</span>
            </div>
          </div>

          {/* 3 Timer Phases Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-black text-amber-600">1 Menit</span>
                <span className="rounded-lg bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                  Fase 1
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">Reading Time</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                Peserta membaca skenario kasus klinis dan petunjuk instruksi di depan pintu stase sebelum masuk.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-black text-[#1E3A8A]">10 Menit</span>
                <span className="rounded-lg bg-blue-100 text-[#1E3A8A] border border-blue-300 px-2.5 py-0.5 text-[11px] font-bold">
                  Fase 2
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">Action Time</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                Pelaksanaan anamnesis/tindakan klinis, pencentangan penunjang, penulisan WDx + 3 DDx, dan blangko resep medis.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-black text-emerald-600">1 Menit</span>
                <span className="rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                  Fase 3
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">Transition Time</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                Jeda rotasi perpindahan peserta ke stase berikutnya dan waktu finalisasi rubrik oleh Dokter Penguji.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Interactive 6 Stations Selector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Station Pill Buttons */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pilih Stase untuk Penjelasan Detail:
            </p>
            {stations.map((st, idx) => {
              const StaseIcon = st.icon;
              const isSelected = activeStationIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStationIndex(idx)}
                  className={`w-full flex items-center justify-between rounded-2xl p-4 transition-all duration-200 text-left cursor-pointer border ${
                    isSelected
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-lg shadow-blue-900/20 translate-x-1"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-blue-50/50 hover:text-[#1E3A8A]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-[#1E3A8A]"
                      }`}
                    >
                      <StaseIcon size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider block opacity-90">
                        {st.stase} • {st.field}
                      </span>
                      <h4 className="text-sm font-bold truncate max-w-[200px] sm:max-w-[260px]">
                        {st.title}
                      </h4>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className={`transition-transform ${isSelected ? "rotate-90 text-cyan-300" : "opacity-40"}`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Station Detail Showcase */}
          <div className="lg:col-span-7">
            <motion.div
              key={activeStationIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6"
            >
              <div>
                {/* Station Tag & Field */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold border ${currentStation.lightBg}`}>
                    {currentStation.stase} — Sub-Spesialisasi {currentStation.field}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Durasi: 12 Menit</span>
                </div>

                {/* Station Title */}
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {currentStation.title}
                </h3>

                {/* Examiner Info */}
                <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-blue-50 border border-blue-200 px-4 py-2 text-xs font-semibold text-[#1E3A8A]">
                  <span>Dokter Penguji Spesialis Penanggung Jawab:</span>
                  <strong className="text-slate-900 font-bold">{currentStation.examiner}</strong>
                </div>

                {/* Description */}
                <p className="mt-5 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                  {currentStation.description}
                </p>
              </div>

              {/* Station Workflow Highlights */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#1E3A8A] shrink-0" />
                  <span>Pasien Standar Terstandarisasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#1E3A8A] shrink-0" />
                  <span>Rubrik Skor 0, 1, 2 Baku Admin</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#1E3A8A] shrink-0" />
                  <span>Interactive Ceklist Penunjang</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#1E3A8A] shrink-0" />
                  <span>Input 1 WDx + 3 DDx + Resep</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
