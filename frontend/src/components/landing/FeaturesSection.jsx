import { motion } from "framer-motion";
import {
  Bot,
  ClipboardCheck,
  RotateCw,
  LineChart,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Clock,
  Award,
  Users,
  Kanban,
  Mail,
  FileText,
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "Anamnesis Pasien Standar AI",
      tag: "OSCE Mandiri",
      description:
        "Berlatih wawancara medis (anamnesis) 24/7 dengan Pasien AI yang merespons pertanyaan klinis, keluhan utama, lokasi nyeri, dan riwayat penyakit secara realistis.",
      color: "from-[#1E3A8A] to-blue-600",
      badge: "Proven di praxis.png",
    },
    {
      icon: Stethoscope,
      title: "Diagnosis Kerja (WDx) & 3 Diagnosis Banding (DDx)",
      tag: "OSCE On-Site",
      description:
        "Blangko pengerjaan diagnosis medis presisi: 1 baris diagnosis kerja utama, 3 baris diagnosis banding mendalam, serta blangko penulisan resep obat.",
      color: "from-cyan-600 to-blue-700",
      badge: "Form Penilaian Baku",
    },
    {
      icon: ClipboardCheck,
      title: "Rubrik Penguji & Gold Standard Key",
      tag: "Penilaian Spesialis",
      description:
        "Dokter penguji mengisi rubrik skor (0, 1, 2) dan GRS rating dengan acuan tampilan Kunci Jawaban Baku Admin yang ditampilkan secara side-by-side.",
      color: "from-blue-600 to-indigo-700",
      badge: "Objektif & Transparan",
    },
    {
      icon: RotateCw,
      title: "Sync Timer 12 Mns & Rotasi Kanban",
      tag: "Sirkuit 6 Stase",
      description:
        "Pengatur waktu tersinkronisasi 12 menit/stase (1m Reading, 10m Action, 1m Transition). Urutan stase dapat disusun via Kanban Drag & Drop Admin.",
      color: "from-indigo-700 to-[#1E3A8A]",
      badge: "Automated Bell Sync",
    },
    {
      icon: FileText,
      title: "Checklist Penunjang Interactive",
      tag: "Laboratorium & Radiologi",
      description:
        "Hasil penunjang (EKG, Rontgen, Darah) rilis secara interaktif saat peserta men-centang pilihan penunjang yang tepat sesuai skenario klinis.",
      color: "from-sky-600 to-blue-800",
      badge: "Dynamic Output Data",
    },
    {
      icon: Mail,
      title: "Autogeneration PDF & Auto Email Feedback",
      tag: "Evaluasi Akhir",
      description:
        "Setelah rotasi 6 stase selesai, sistem meng-generate berkas transkrip nilai PDF dan mengirimkannya secara otomatis ke alamat email peserta.",
      color: "from-blue-800 to-slate-900",
      badge: "Auto-Delivered",
    },
  ];

  const pillars = [
    { value: "Anamnesis AI", label: "Simulasi Wawancara Medis", icon: Bot },
    { value: "Sirkuit 6 Stase", label: "Rotasi Ujian Terstruktur", icon: Clock },
    { value: "WDx + 3 DDx", label: "Form Blangko Clinician", icon: Stethoscope },
    { value: "PDF & Email", label: "Transkrip Hasil Otomatis", icon: Mail },
  ];

  return (
    <section
      id="features"
      className="relative py-24 sm:py-32 bg-slate-50 text-slate-900 overflow-hidden"
    >
      {/* Background Ambient Light */}
      <div className="absolute top-0 right-1/4 h-[450px] w-[450px] rounded-full bg-blue-100/50 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 h-[400px] w-[400px] rounded-full bg-indigo-100/40 blur-[120px] pointer-events-none" />

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
              Fitur Lengkap Platform Praxis
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Semua Modul yang Dibutuhkan untuk <br />
            <span className="bg-gradient-to-r from-[#1E3A8A] via-blue-700 to-cyan-600 bg-clip-text text-transparent">
              Simulasi Ujian OSCE Kedokteran
            </span>
          </h2>

          <p className="mt-4 text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
            Dirancang secara otentik sesuai dengan standar operational sirkuit ujian OSCE institusi kedokteran di Indonesia.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-blue-100 bg-white p-7 shadow-xl shadow-blue-900/5 backdrop-blur-xl transition-all duration-300 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} p-0.5 shadow-md shadow-blue-900/15`}>
                      <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                        <Icon className="h-6 w-6 text-[#1E3A8A] group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-[#1E3A8A]">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 group-hover:text-[#1E3A8A] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-slate-600 leading-relaxed text-xs sm:text-sm font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1E3A8A]">
                  <span>{item.badge}</span>
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Deep Royal Blue Stat Pillars Banner */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6 }}
          className="mt-20 rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#1E3A8A] p-8 sm:p-12 shadow-2xl shadow-blue-900/30 text-white"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {pillars.map((pillar, i) => {
              const PillarIcon = pillar.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-cyan-300 mb-3 border border-white/10">
                    <PillarIcon size={24} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">
                    {pillar.value}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-blue-100">
                    {pillar.label}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}