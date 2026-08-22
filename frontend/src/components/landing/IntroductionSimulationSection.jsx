import { motion } from "framer-motion";
import {
  Sparkles,
  Building2,
  Stethoscope,
  Users,
  MessageSquare,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Activity,
  Clock,
} from "lucide-react";

export default function IntroductionSimulationSection() {
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  return (
    <section
      id="about"
      className="relative overflow-hidden py-16 sm:py-20 bg-[#0D3A68] text-white border-t border-blue-900/40"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8 w-full">
        {/* Section Header: Minimal & Clear */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-12"
        >
          <span className="text-xs font-black uppercase tracking-wider text-[#C9A227] bg-white/10 border border-[#C9A227]/40 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Activity size={13} className="text-[#C9A227]" />
            <span>Skema Simulasi OSCE</span>
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-3 leading-tight">
            Dua Skenario Ujian di Praxis
          </h2>

          <p className="mt-3 text-blue-100/90 text-sm sm:text-base font-normal leading-relaxed">
            Pilih metode persiapan yang sesuai: latihan mandiri interaktif atau ujian tatap muka langsung bersama dokter penguji.
          </p>
        </motion.div>

        {/* 2 Clean Concise Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Skenario 1: Praxis Mandiri */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4 }}
            className="flex flex-col justify-between rounded-3xl border border-blue-300/20 bg-white/10 p-6 sm:p-8 backdrop-blur-md shadow-xl transition hover:border-[#C9A227]/50"
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-200">
                  <Sparkles size={14} className="text-[#C9A227]" />
                  <span>Praxis Mandiri</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-[#C9A227]/50 px-2.5 py-0.5 text-xs font-extrabold text-[#C9A227]">
                  <Clock size={12} />
                  <span>Coming Soon</span>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mt-4">
                Simulasi Mandiri
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
                Latihan fleksibel dari browser untuk mengasah penalaran klinis secara mandiri.
              </p>

              {/* Anamnesis & Pemeriksaan Fisik Blocks */}
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#C9A227]">
                    <MessageSquare size={14} />
                    <span>Anamnesis</span>
                  </div>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    Wawancara klinis interaktif bersama <strong className="text-white">Pasien Standar Digital</strong> dengan respons keluhan yang dinamis.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#C9A227]">
                    <Stethoscope size={14} />
                    <span>Pemeriksaan Fisik</span>
                  </div>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    Instruksi manuver diperiksa dan temuan klinis ditampilkan secara instan melalui <strong className="text-white">Panduan Pemeriksaan Digital</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 py-2.5 px-4 text-xs font-extrabold text-blue-200 cursor-not-allowed">
                <Clock size={14} className="text-[#C9A227]" />
                <span>Simulasi Mandiri (Coming Soon)</span>
              </div>
            </div>
          </motion.div>

          {/* Skenario 2: Praxis On-Site */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col justify-between rounded-3xl border border-[#C9A227]/40 bg-white/10 p-6 sm:p-8 backdrop-blur-md shadow-xl transition hover:border-[#C9A227]"
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-200">
                  <Building2 size={14} className="text-[#C9A227]" />
                  <span>Praxis On-Site</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C9A227]">
                  <MapPin size={11} />
                  Yogyakarta
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mt-4">
                Simulasi On-Site (Tatap Muka)
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
                Simulasi ujian riil tatap muka di laboratorium stase dengan penguji langsung.
              </p>

              {/* Anamnesis & Pemeriksaan Fisik Blocks */}
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#C9A227]">
                    <Users size={14} />
                    <span>Anamnesis</span>
                  </div>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    Wawancara langsung tatap muka dengan <strong className="text-white">Pasien Standar</strong> nyata di bilik ujian.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#C9A227]">
                    <ShieldCheck size={14} />
                    <span>Pemeriksaan Fisik</span>
                  </div>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    Prosedur fisik dilakukan di tempat dan dinilai langsung oleh <strong className="text-white">Dokter Penguji</strong>.
                  </p>
                </div>
              </div>

              {/* Location Callout */}
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-[#C9A227]/30 px-3 py-2 text-xs text-amber-200">
                <MapPin size={14} className="text-[#C9A227] shrink-0" />
                <span>Lokasi: <strong>Kantor Medskill Indonesia</strong>, Yogyakarta, Indonesia</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => scrollToSection("sessions")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A227] py-2.5 px-4 text-xs font-extrabold text-[#0D3A68] hover:bg-amber-400 transition cursor-pointer shadow-sm"
              >
                <span>Lihat Jadwal Sesi On-Site</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
