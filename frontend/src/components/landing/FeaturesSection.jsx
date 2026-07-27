import { motion } from "framer-motion";
import {
  Bot,
  ClipboardCheck,
  RotateCw,
  LineChart,
  Sparkles,
  CheckCircle,
  Brain,
  Clock,
  Award,
  Users,
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "Anamnesis Pasien Standar AI",
      tag: "Fitur Unggulan",
      description: "Berlatih wawancara medis (anamnesis) dengan Pasien Standar AI yang merespons pertanyaan klinis, keluhan utama, dan riwayat penyakit secara alami.",
      color: "from-[#1E3A8A] to-blue-600",
    },
    {
      icon: ClipboardCheck,
      title: "Rubrik Penilaian Penguji",
      tag: "Penilaian Terstruktur",
      description: "Dokter penguji memberikan skor berdasarkan checklist kriteria kompetensi secara cepat, terstruktur, dan objektif.",
      color: "from-blue-600 to-cyan-600",
    },
    {
      icon: RotateCw,
      title: "Manajemen Stase & Timer Sync",
      tag: "Pengaturan Waktu",
      description: "Pengatur waktu ujian tersinkronisasi untuk memastikan durasi pengerjaan di setiap stase berjalan tertib dan tepat waktu.",
      color: "from-indigo-700 to-[#1E3A8A]",
    },
    {
      icon: LineChart,
      title: "Rekap Nilai & Feedback Evaluasi",
      tag: "Transkrip Hasil",
      description: "Melihat rekap pencapaian skor beserta catatan umpan balik dari penguji untuk membantu mahasiswa kedokteran mengevaluasi kemampuan diri.",
      color: "from-blue-700 to-sky-600",
    },
  ];

  const pillars = [
    { value: "Anamnesis AI", label: "Simulasi Wawancara Pasien", icon: Brain },
    { value: "Terstruktur", label: "Checklist Rubrik Standar", icon: Award },
    { value: "Tersinkron", label: "Timer & Rotasi Stase Ujian", icon: Clock },
    { value: "Praktis", label: "Dapat Diakses Kapan Saja", icon: Users },
  ];

  return (
    <section
      id="features"
      className="relative py-28 bg-slate-50 text-slate-900 overflow-hidden"
    >
      {/* Dynamic Background Circles */}
      <div className="absolute top-0 right-1/4 h-[450px] w-[450px] rounded-full bg-blue-100/50 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 h-[400px] w-[400px] rounded-full bg-indigo-100/40 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 shadow-sm mb-4">
            <Sparkles className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
              Keunggulan Praxis by Medskill
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Fitur Utama <span className="bg-gradient-to-r from-[#1E3A8A] via-blue-700 to-cyan-600 bg-clip-text text-transparent">Simulasi OSCE</span>
          </h2>

          <p className="mt-4 text-slate-600 text-base sm:text-lg font-medium">
            Dirancang khusus untuk mendukung mahasiswa kedokteran dan dokter penguji dalam penyelenggaraan ujian OSCE yang efisien dan interaktif.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-900/5 backdrop-blur-xl transition-all duration-300 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} p-0.5 shadow-lg shadow-blue-900/15`}>
                      <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                        <Icon className="h-7 w-7 text-[#1E3A8A] group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1 text-xs font-bold text-[#1E3A8A]">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#1E3A8A] transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-slate-600 leading-relaxed text-sm sm:text-base font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#1E3A8A]">
                  <span>Standar Kompetensi Kedokteran</span>
                  <CheckCircle className="h-4 w-4 ml-auto text-blue-600" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Deep Royal Blue #1E3A8A Banner */}
        <motion.div
          id="why-praxis"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-30px" }}
          transition={{ duration: 0.6 }}
          className="mt-24 rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#1E3A8A] p-8 sm:p-12 shadow-2xl shadow-blue-900/30 text-white"
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