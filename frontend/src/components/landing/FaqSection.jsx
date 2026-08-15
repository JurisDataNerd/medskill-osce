import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Threads from "./Threads";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "Apa perbedaan antara Skema OSCE Mandiri dan OSCE On-Site di Praxis?",
      a: "Skema OSCE Mandiri berfokus pada latihan anamnesis dan pemeriksaan fisik berbasis AI yang dapat diakses secara mandiri kapan saja. Sedangkan Skema OSCE On-Site diselenggarakan langsung secara tatap muka di Kantor Medskill Indonesia (Yogyakarta) dengan pasien standar dan penilaian langsung oleh Dokter Penguji.",
    },
    {
      q: "Bagaimana cara kerja Pasien Standar AI pada tahap Anamnesis?",
      a: "Pasien AI merespons pertanyaan klinis peserta secara alami sesuai dengan skenario penyakit yang telah terstandarisasi (keluhan utama, onset, lokasi nyeri, riwayat penyakit dahulu, riwayat pengobatan, dan faktor pemicu).",
    },
    {
      q: "Bagaimana Dokter Penguji memberikan penilaian di platform Praxis?",
      a: "Dokter penguji mengisi rubrik kompetensi baku dan penilaian klinis langsung pada portal penguji saat simulasi berlangsung, dengan Kunci Jawaban Baku terintegrasi.",
    },
    {
      q: "Apakah peserta menerima hasil dan evaluasi setelah ujian?",
      a: "Ya. Peserta dapat melihat rekapitulasi penilaian dan catatan evaluasi klinis secara langsung melalui akun portal masing-masing.",
    },
  ];

  return (
    <section
      id="faq"
      className="relative overflow-hidden py-16 sm:py-20 bg-[#0A2B4E] text-white border-t border-blue-900/60"
    >
      {/* Background Wavy Lines */}
      <Threads />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#C9A227] bg-white/10 border border-[#C9A227]/40 px-4 py-1.5 rounded-full shadow-xs">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Pertanyaan yang Sering Diajukan
          </h2>
        </motion.div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="rounded-2xl border border-white/15 bg-white text-slate-900 shadow-md overflow-hidden transition hover:border-[#C9A227]"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer transition hover:bg-slate-50"
                >
                  <span className="text-sm sm:text-base font-bold text-[#0D3A68] pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-[#C9A227] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
