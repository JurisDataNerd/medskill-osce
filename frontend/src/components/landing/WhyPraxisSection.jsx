import { Stethoscope, Clock, Target, Award } from "lucide-react";
import Threads from "./Threads";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack/ScrollStack";

export default function WhyPraxisSection() {
  const benefits = [
    {
      icon: Stethoscope,
      badge: "Manfaat 01",
      title: "Latihan Anamnesis Adaptif",
      description:
        "Pertajam teknik penggalian informasi medis, empati, dan alur anamnesis sistematis sebelum terjun ke stase nyata.",
      highlight: "Simulasi AI Pasien Standar Interaktif",
    },
    {
      icon: Clock,
      badge: "Manfaat 02",
      title: "Manajemen Waktu Stase",
      description:
        "Biasakan ritme membaca petunjuk, tindakan pemeriksaan, serta perumusan diagnosis dan terapi secara efisien.",
      highlight: "Timer Sinkron & Pacing Realistis",
    },
    {
      icon: Target,
      badge: "Manfaat 03",
      title: "Rubrik Penilaian Terstandar",
      description:
        "Evaluasi hasil ujian mengacu pada rubrik baku nasional sehingga evaluasi performa klinis terukur jelas.",
      highlight: "Standar Penilaian OSCE Nasional",
    },
    {
      icon: Award,
      badge: "Manfaat 04",
      title: "Kesiapan Mental Ujian",
      description:
        "Simulasi realistis yang mempersiapkan mental dan fokus menghadapi ujian OSCE sungguhan dengan tenang.",
      highlight: "Kesiapan Mental & Kepercayaan Diri",
    },
  ];

  return (
    <section
      id="why-praxis"
      className="relative py-20 sm:py-28 bg-[#0D3A68] text-white border-t border-blue-900/60 overflow-visible"
    >
      {/* ReactBits Wavy Line Threads */}
      <Threads />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-[#C9A227] bg-white/10 border border-[#C9A227]/40 px-4 py-1.5 rounded-full shadow-xs">
            Persiapan Khusus Koas & Dokter Muda
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4 leading-tight">
            Dibuat Khusus untuk Kamu, Dok. <br />
            <span className="text-[#C9A227]">
              Hadapi OSCE dengan Percaya Diri!
            </span>
          </h2>
          <p className="mt-4 text-blue-100/90 text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Tidak ada lagi cerita demam panggung, bingung membagi waktu stase, atau lupa penulisan resep. Latih kemampuan klinismu sebelum OSCE asli dimulai.
          </p>
        </div>

        {/* Benefits Cards - Global Page Scroll Stack */}
        <ScrollStack
          useWindowScroll={true}
          itemDistance={90}
          itemStackDistance={28}
          stackPosition="20%"
          scaleEndPosition="10%"
          baseScale={0.88}
          itemScale={0.03}
        >
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollStackItem
                key={idx}
                itemClassName="bg-white text-[#0D3A68] border border-white/20 shadow-2xl p-8 sm:p-12 rounded-[2.5rem]"
              >
                <div className="flex flex-col justify-between h-full min-h-[200px] sm:min-h-[240px]">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D3A68]/10 border border-[#0D3A68]/20 text-[#0D3A68] text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                      <span>{item.badge}</span>
                    </div>
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0D3A68] text-[#C9A227] shadow-lg">
                      <Icon size={30} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-4xl font-extrabold text-[#0D3A68] tracking-tight mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-[#C9A227] uppercase tracking-wider">
                      {item.highlight}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-400">
                      0{idx + 1} / 0{benefits.length}
                    </span>
                  </div>
                </div>
              </ScrollStackItem>
            );
          })}
        </ScrollStack>
      </div>
    </section>
  );
}
