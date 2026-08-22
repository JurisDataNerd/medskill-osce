import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Building2,
  CheckCircle2,
  FileText,
  Stethoscope,
  Award,
  ArrowRight,
  ClipboardList,
  Layers,
  HelpCircle,
  FileCheck,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SchemesSection() {
  const [activeTab, setActiveTab] = useState("mandiri");

  return (
    <section
      id="skema"
      className="relative py-24 sm:py-32 bg-slate-50 text-slate-900 overflow-hidden"
    >
      {/* Subtle Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a08_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-10 right-10 h-[450px] w-[450px] rounded-full bg-blue-100/60 blur-[130px] pointer-events-none" />

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
            <Layers className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
              Skema Pelaksanaan Praxis
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Dua Skema Utama <br />
            <span className="bg-gradient-to-r from-[#1E3A8A] via-blue-700 to-cyan-600 bg-clip-text text-transparent">
              Simulasi Ujian OSCE Kedokteran
            </span>
          </h2>

          <p className="mt-4 text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
            Praxis by Medskill Indonesia memfasilitasi kebutuhan simulasi ujian baik secara mandiri interaktif maupun ujian institusional berbasis sirkuit On-Site.
          </p>

          {/* Scheme Switcher Tabs */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-white border border-blue-200 shadow-md">
            <button
              onClick={() => setActiveTab("mandiri")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                activeTab === "mandiri"
                  ? "bg-[#1E3A8A] text-white shadow-md shadow-blue-900/25"
                  : "text-slate-600 hover:text-[#1E3A8A]"
              }`}
            >
              <Sparkles size={18} />
              <span>1. Skema OSCE Mandiri (Coming Soon)</span>
            </button>

            <button
              onClick={() => setActiveTab("onsite")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                activeTab === "onsite"
                  ? "bg-[#1E3A8A] text-white shadow-md shadow-blue-900/25"
                  : "text-slate-600 hover:text-[#1E3A8A]"
              }`}
            >
              <Building2 size={18} />
              <span>2. Skema OSCE On-Site (Sirkuit Institusi)</span>
            </button>
          </div>
        </motion.div>

        {/* Dynamic Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "mandiri" ? (
            <motion.div
              key="mandiri"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-blue-100 bg-white p-6 sm:p-10 shadow-2xl shadow-blue-900/5"
            >
              {/* Left Column: Mandiri Info */}
              <div className="lg:col-span-6 flex flex-col items-start space-y-5">
                <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-extrabold text-amber-800">
                  <Clock size={14} />
                  <span>Segera Hadir / Coming Soon</span>
                </span>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  Simulasi Anamnesis Interaktif & Mandiri
                </h3>

                <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                  Pada skema OSCE Mandiri, mahasiswa kedokteran dapat menguji kemampuan komunikasi klinis dan penggalian riwayat penyakit (anamnesis) secara mandiri dari browser.
                </p>

                <div className="space-y-3.5 pt-2 w-full">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Respon Pasien Digital Alami & Spesifik</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Pasien digital memberikan respon verbal terhadap pertanyaan anamnesis (lokasi nyeri, durasi, pemicu, riwayat pengobatan).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Modul Pembelajaran Mandiri Interaktif</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Dilengkapi dengan antarmuka latihan mandiri yang terintegrasi di modul platform Praxis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <div className="inline-flex items-center gap-2.5 rounded-xl bg-slate-100 border border-slate-200 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-500 cursor-not-allowed">
                    <Clock size={16} className="text-amber-600" />
                    <span>Modul Mandiri (Coming Soon)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Proof Card */}
              <div className="lg:col-span-6 relative">
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-3 shadow-xl">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400 font-mono">
                    <span>Modul Anamnesis AI</span>
                    <span className="text-cyan-400 font-bold">`praxis.png`</span>
                  </div>
                  <img
                    src="/praxis.png"
                    alt="Antarmuka OSCE Mandiri Anamnesis AI"
                    className="w-full h-auto object-cover rounded-xl border border-slate-800"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="onsite"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-blue-100 bg-white p-6 sm:p-10 shadow-2xl shadow-blue-900/5"
            >
              {/* Left Column: Onsite Features */}
              <div className="lg:col-span-6 flex flex-col items-start space-y-5">
                <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  <Building2 size={14} />
                  <span>Ujian Rotasi Institusi Terstruktur</span>
                </span>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  Simulasi Sirkuit 6 Stase Aktif & Fitur Diagnosis Klinis
                </h3>

                <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                  Pada skema OSCE On-Site, ujian dilaksanakan dalam sirkuit 6 stase aktif dengan pengujian komprehensif oleh Dokter Penguji Spesialis.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 w-full">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <Stethoscope className="h-5 w-5 text-[#1E3A8A] mb-2" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Diagnosis Kerja (WDx)</h4>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">
                      1 Baris input diagnosis kerja utama berdasarkan temuan klinis.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <ClipboardList className="h-5 w-5 text-[#1E3A8A] mb-2" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Diagnosis Banding (DDx)</h4>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">
                      3 Baris input diagnosis banding mendalam untuk analisis diferensial.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <FileText className="h-5 w-5 text-[#1E3A8A] mb-2" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Blangko Resep Medis</h4>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">
                      Penulisan resep obat klinis lengkap dengan dosis dan aturan pakai.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <Award className="h-5 w-5 text-[#1E3A8A] mb-2" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Gold Standard Answer Key</h4>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">
                      Dokter penguji melihat isian peserta bersisian dengan Kunci Jawaban Baku Admin.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href="#sirkuit-stase"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#1E3A8A] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition"
                  >
                    <span>Jelajahi Rotasi 6 Stase OSCE</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>

              {/* Right Column: Interactive Diagram Box */}
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-emerald-400" />
                      <span className="text-sm font-bold">Blangko Lembar Jawaban Peserta On-Site</span>
                    </div>
                    <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                      Validated
                    </span>
                  </div>

                  {/* Sample Interactive Preview of WDx + DDx + Resep */}
                  <div className="space-y-3 text-xs font-mono">
                    <div className="bg-slate-950 p-3 rounded-xl border border-white/10">
                      <p className="text-slate-400 font-bold">1. Diagnosis Kerja (WDx):</p>
                      <p className="text-emerald-400 font-extrabold mt-1">
                        STEMI Anteroseptal (ST-Elevation Myocardial Infarction)
                      </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-white/10">
                      <p className="text-slate-400 font-bold">2. Diagnosis Banding (DDx - 3 Baris):</p>
                      <ol className="list-decimal list-inside text-cyan-300 space-y-0.5 mt-1 font-semibold">
                        <li>Angina Pektoris Tidak Stabil (UAP)</li>
                        <li>Diseksi Aorta Thorakalis</li>
                        <li>Perikarditis Akut</li>
                      </ol>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-white/10">
                      <p className="text-slate-400 font-bold">3. Blangko Resep Medis:</p>
                      <p className="text-slate-200 mt-1 whitespace-pre-line leading-relaxed">
                        R/ Aspirin tab 80 mg No. IV S 1 dd tab IV (loading)
                        {"\n"}R/ Clopidogrel tab 75 mg No. IV S 1 dd tab IV (loading)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
