import { motion } from "framer-motion";
import { Stethoscope, Clock, Target, Award } from "lucide-react";
import Threads from "./Threads";

export default function WhyPraxisSection() {
  const benefits = [
    {
      icon: Stethoscope,
      title: "Latihan Anamnesis Adaptif",
      description:
        "Pertajam teknik penggalian informasi medis, empati, dan alur anamnesis sistematis sebelum terjun ke stase nyata.",
    },
    {
      icon: Clock,
      title: "Manajemen Waktu Stase",
      description:
        "Biasakan ritme membaca petunjuk, tindakan pemeriksaan, serta perumusan diagnosis dan terapi secara efisien.",
    },
    {
      icon: Target,
      title: "Rubrik Penilaian Terstandar",
      description:
        "Evaluasi hasil ujian mengacu pada rubrik baku nasional sehingga evaluasi performa klinis terukur jelas.",
    },
    {
      icon: Award,
      title: "Kesiapan Mental Ujian",
      description:
        "Simulasi realistis yang mempersiapkan mental dan fokus menghadapi ujian OSCE sungguhan dengan tenang.",
    },
  ];

  return (
    <section
      id="why-praxis"
      className="relative overflow-hidden py-16 sm:py-20 bg-[#0D3A68] text-white border-t border-blue-900/60"
    >
      {/* ReactBits Wavy Line Threads */}
      <Threads />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section Header Koas-Centric with Scroll Fade */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#C9A227] bg-white/10 border border-[#C9A227]/40 px-4 py-1.5 rounded-full shadow-xs">
            Persiapan Khusus Koas & Dokter Muda
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4 leading-tight">
            Dibuat Khusus untuk Kamu, Dok. <br />
            <span className="text-[#C9A227]">
              Hadapi OSCE dengan Percaya Diri!
            </span>
          </h2>
          <p className="mt-4 text-blue-100/90 text-base sm:text-lg font-medium leading-relaxed">
            Tidak ada lagi cerita demam panggung, bingung membagi waktu stase, atau lupa penulisan resep. Latih kemampuan klinismu sebelum OSCE asli dimulai.
          </p>
        </motion.div>

        {/* Benefits Cards Grid (Staggered Scroll Entrance & Hover Lift) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group cursor-pointer rounded-2xl border border-white/20 bg-white p-6 shadow-xl transition-all duration-200 hover:border-[#C9A227] hover:shadow-2xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D3A68] text-[#C9A227] mb-5 shadow-md group-hover:bg-[#0A2B4E] group-hover:scale-110 transition duration-200">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#0D3A68] mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
