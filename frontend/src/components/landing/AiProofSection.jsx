import { motion } from "framer-motion";
import { Bot, CheckCircle2 } from "lucide-react";

export default function AiProofSection() {
  return (
    <section
      id="proof"
      className="py-16 sm:py-20 bg-white text-slate-900 border-t border-slate-200/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Nusago.id Clean Typography & Description */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col items-start text-left space-y-4"
          >
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0D3A68] bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full shadow-xs">
              Antarmuka Modul Anamnesis AI
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Simulasikan Anamnesis dengan AI
            </h2>
            <p className="text-slate-600 text-base font-medium leading-relaxed">
              Platform Praxis menghadirkan modul wawancara medis (anamnesis) interaktif berbasis Pasien Standar AI. Mahasiswa dapat berlatih menggali keluhan utama, lokasi nyeri, onset, dan riwayat penyakit secara langsung.
            </p>

            <div className="space-y-3 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-[#C9A227]" />
                <span>Respon verbal Pasien AI sesuai skenario kasus medis</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-[#C9A227]" />
                <span>Latihan komunikasi klinis tanpa batas waktu</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-[#C9A227]" />
                <span>Dapat diakses dari semua perangkat</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Nusago.id Style Elevated Screenshot Card (`praxis.png`) */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-slate-200/90 bg-slate-50/50 p-4 shadow-xl shadow-slate-200/60 transition-transform duration-300 hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between pb-3 px-3 border-b border-slate-200/80 mb-3 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-[#0D3A68]" />
                  <span className="text-slate-900 font-bold">Modul Fitur Anamnesis AI — Praxis</span>
                </div>
                <span className="text-[#0D3A68] font-mono text-[11px] font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  praxis.png
                </span>
              </div>

              <img
                src="/praxis.png"
                alt="Tampilan Fitur Simulasi Anamnesis AI Praxis"
                className="w-full h-auto object-cover rounded-2xl border border-slate-200 shadow-sm"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
