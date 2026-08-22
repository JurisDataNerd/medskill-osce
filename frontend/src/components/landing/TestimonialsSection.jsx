import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import Threads from "./Threads";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "dr. Amanda Putri, S.Ked",
      university: "FK Universitas Indonesia (UI)",
      role: "Lulus UKMPPD OSCE 2026",
      avatar: "AP",
      rating: 5,
      comment:
        "Latihan anamnesis bareng Pasien Standar AI Praxis benar-benar membantu banget! Waktu ujian asli kemarin rasanya familiar dan gak panik sama sekali. Alhamdulilah LULUS sekali uji!",
    },
    {
      name: "dr. Rizky Ramadhan, S.Ked",
      university: "FK Universitas Gadjah Mada (UGM)",
      role: "Lulus UKMPPD OSCE 2026",
      avatar: "RR",
      rating: 5,
      comment:
        "Simulasi ujiannya sangat realistis. Saya jadi terbiasa membagi waktu membaca petunjuk soal dan merumuskan diagnosis serta resep dengan tenang.",
    },
    {
      name: "dr. Nabila Hapsari, S.Ked",
      university: "FK Universitas Airlangga (Unair)",
      role: "Lulus UKMPPD OSCE 2026",
      avatar: "NH",
      rating: 5,
      comment:
        "Rubrik penilaian pengujinya detail banget. Umpan balik setelah ujian buat saya tahu pasti poin mana yang kurang sebelum ujian sungguhan.",
    },
  ];

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-white via-slate-50 to-blue-50/40 text-slate-900 border-t border-blue-100/60"
    >
      {/* Background Wavy Mesh */}
      <Threads />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0D3A68] bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full shadow-xs">
            Kisah Sukses Koas & Alumni
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-4 leading-tight">
            Mereka Sudah Buktikan. <br />
            <span className="bg-gradient-to-r from-[#0D3A68] via-blue-800 to-[#C9A227] bg-clip-text text-transparent">
              Kini Giliranmu Lulus OSCE!
            </span>
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
            Dengar langsung cerita pengalaman dari ribuan Dokter Muda yang berhasil melewati ujian OSCE dengan nilai memuaskan bersama Praxis.
          </p>
        </motion.div>

        {/* 3-Column Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: idx * 0.12 }}
              whileHover={{ y: -6 }}
              className="relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-md shadow-slate-200/40 transition-all duration-200 hover:shadow-xl hover:border-[#0D3A68]/40"
            >
              <div>
                {/* Quote Icon & Rating Stars */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#C9A227]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-[#C9A227]" />
                    ))}
                  </div>
                  <Quote size={24} className="text-[#0D3A68]/20" />
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium italic">
                  "{t.comment}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0D3A68] text-[#C9A227] font-black text-sm shadow-sm">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>{t.name}</span>
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  </h4>
                  <p className="text-xs font-semibold text-[#0D3A68]">{t.university}</p>
                  <span className="inline-block mt-0.5 rounded-md bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-[#C9A227]">
                    {t.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
