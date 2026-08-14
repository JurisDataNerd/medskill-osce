import { motion } from "framer-motion";
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Kanban,
  Mail,
  PlayCircle,
  ExternalLink,
  Users,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ExaminerAdminShowcaseSection() {
  return (
    <section
      id="peran"
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
            <Users className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E3A8A]">
              Penguji & Admin Institusi
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Transparansi Penilaian & <br />
            <span className="bg-gradient-to-r from-[#1E3A8A] via-blue-700 to-cyan-600 bg-clip-text text-transparent">
              Kontrol Ujian Otomatis
            </span>
          </h2>

          <p className="mt-4 text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
            Menyelenggarakan ujian OSCE dengan objektivitas mutlak bagi Dokter Penguji dan kemudahan manajemen sirkuit bagi Admin Institusi.
          </p>
        </motion.div>

        {/* 2 Main Showcase Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Panel Dokter Penguji & Gold Standard Answer Key */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E3A8A] text-white shadow-md font-bold">
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Dashboard Dokter Penguji</h3>
                    <p className="text-xs text-[#1E3A8A] font-semibold">Role: Examiner / Mentor</p>
                  </div>
                </div>
                <span className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-extrabold text-[#1E3A8A]">
                  `/examiner`
                </span>
              </div>

              {/* Gold Standard Answer Key Comparison Feature Showcase */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Eye size={15} className="text-[#1E3A8A]" />
                    <span>Fitur Comparison Side-by-Side:</span>
                  </span>
                  <span className="text-emerald-700 font-bold">Gold Standard Active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Left: Jawaban Peserta */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3">
                    <p className="text-[#1E3A8A] font-bold mb-1">Jawaban Peserta (Realtime):</p>
                    <p className="text-slate-900 font-semibold">WDx: STEMI Anteroseptal</p>
                    <p className="text-slate-600 mt-1">DDx: 1. UAP, 2. Diseksi Aorta</p>
                  </div>

                  {/* Right: Kunci Jawaban Baku Admin */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
                    <p className="text-emerald-800 font-bold mb-1">Kunci Jawaban Baku Admin:</p>
                    <p className="text-slate-900 font-semibold">WDx: STEMI Anteroseptal (Code I21.0)</p>
                    <p className="text-slate-600 mt-1">DDx: 1. UAP, 2. Diseksi Aorta, 3. Perikarditis</p>
                  </div>
                </div>
              </div>

              {/* Rubrik Features */}
              <div className="mt-6 space-y-2.5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#1E3A8A] shrink-0" />
                  <span>Pengisian Rubrik Indikator Kompetensi (Skor 0, 1, atau 2).</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#1E3A8A] shrink-0" />
                  <span>Global Performance Rating (GRS: Superior, Lulus, Borderline, Tidak Lulus).</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#1E3A8A] shrink-0" />
                  <span>Input Umpan Balik (Feedback) Klinis per Peserta.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              <Link
                to="/examiner"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-3 text-xs font-extrabold text-white shadow-md hover:bg-blue-900 transition"
              >
                <span>Masuk Dashboard Dokter Penguji</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Panel Admin Institusi & Kanban Drag & Drop */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md font-bold">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Dashboard Admin Institusi</h3>
                    <p className="text-xs text-slate-500 font-semibold">Role: Admin / Institusi</p>
                  </div>
                </div>
                <span className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-extrabold text-slate-800">
                  `/admin`
                </span>
              </div>

              {/* Admin Features Showcase */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Kanban size={15} className="text-[#1E3A8A]" />
                    <span>Manajemen Stase berbasis Kanban Drag & Drop:</span>
                  </span>
                  <span className="text-[#1E3A8A] font-mono">6 Active Stations</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-center">
                  <div className="rounded-xl bg-white border border-slate-200 p-2.5 text-[#1E3A8A] shadow-xs">
                    Stase 1-2 (Medis)
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200 p-2.5 text-[#1E3A8A] shadow-xs">
                    Stase 3-4 (Bedah/Saraf)
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200 p-2.5 text-[#1E3A8A] shadow-xs">
                    Stase 5-6 (Abdomen/ACLS)
                  </div>
                </div>
              </div>

              {/* Automation Features */}
              <div className="mt-6 space-y-2.5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <PlayCircle size={16} className="text-[#1E3A8A] shrink-0" />
                  <span>Tombol Kontrol Simulasi Live: Start Session & Stop Session.</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck size={16} className="text-[#1E3A8A] shrink-0" />
                  <span>Autogeneration Transkrip Nilai & Feedback PDF per Peserta.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-[#1E3A8A] shrink-0" />
                  <span>Pengiriman Otomatis PDF ke Alamat Email Masing-Masing Peserta.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              <Link
                to="/admin"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-extrabold text-white shadow-md hover:bg-slate-800 transition"
              >
                <span>Masuk Dashboard Admin Institusi</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
