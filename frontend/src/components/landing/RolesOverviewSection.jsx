import { motion } from "framer-motion";
import {
  UserCheck,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  FileSpreadsheet,
  Mail,
  Kanban,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function RolesOverviewSection() {
  const roles = [
    {
      title: "Peserta Ujian (`/participant`)",
      roleBadge: "Role: Participant",
      icon: UserCheck,
      color: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-50/70 border-blue-200",
      badgeColor: "bg-blue-100 text-[#1E3A8A]",
      features: [
        "Akses Portal Peserta & Pemulihan Kata Sandi",
        "Layar Ruang Tunggu (Waiting Room) & Gelombang Rotasi",
        "Navigasi Countdown Timer Sync Stase (12 Mns)",
        "Input Blangko WDx (1 baris) & 3 DDx (3 baris)",
        "Penulisan Blangko Resep Medis & Checklist Penunjang",
        "Unduh Hasil Evaluasi & Transkrip Nilai PDF",
      ],
      link: "/participant",
    },
    {
      title: "Dokter Penguji (`/examiner`)",
      roleBadge: "Role: Examiner / Mentor",
      icon: Stethoscope,
      color: "from-[#1E3A8A] to-blue-800",
      bgColor: "bg-indigo-50/70 border-indigo-200",
      badgeColor: "bg-indigo-100 text-indigo-900",
      features: [
        "Pemilihan 1 Stase Penugasan Khusus Dokter Spesialis",
        "Monitoring Rekap Jawaban Peserta Real-time",
        "Tampilan Kunci Jawaban Baku (Gold Standard) Side-by-Side",
        "Pengisian Rubrik Penilaian Baku (Skor 0, 1, 2)",
        "Penilaian Impresi Global Performance Rating (GRS)",
        "Input Catatan Umpan Balik (Feedback) Klinis",
      ],
      link: "/examiner",
    },
    {
      title: "Admin Institusi (`/admin`)",
      roleBadge: "Role: Admin",
      icon: ShieldCheck,
      color: "from-slate-800 to-slate-950",
      bgColor: "bg-slate-100/80 border-slate-300",
      badgeColor: "bg-slate-200 text-slate-900",
      features: [
        "Pengaturan Sesi Ujian, Tanggal, Kuota & Duration Timer",
        "Manajemen Rotasi 6 Stase Aktif via Kanban Board Drag & Drop",
        "Templat & Duplikasi Soal Stase (Paket Soal A / B)",
        "Tombol Kontrol Live: Start Simulation & Stop Simulation",
        "Verifikasi Rekap Nilai Akhir & Batch Review",
        "Autogeneration Transkrip PDF & Auto-Email ke Peserta",
      ],
      link: "/admin",
    },
  ];

  return (
    <section
      id="peran"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-white via-slate-50 to-white text-slate-900 overflow-hidden"
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
              Ekosistem 3 Peran Sistem
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Dirancang Terintegrasi untuk <br />
            <span className="bg-gradient-to-r from-[#1E3A8A] via-blue-700 to-cyan-600 bg-clip-text text-transparent">
              Peserta, Penguji & Admin Institusi
            </span>
          </h2>

          <p className="mt-4 text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
            Setiap peran dalam platform Praxis memiliki antarmuka khusus yang disesuaikan dengan alur kerja operasional ujian OSCE kedokteran.
          </p>
        </motion.div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group flex flex-col justify-between rounded-3xl border ${item.bgColor} p-7 sm:p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                      <Icon size={24} />
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${item.badgeColor}`}>
                      {item.roleBadge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#1E3A8A] transition-colors">
                    {item.title}
                  </h3>

                  <div className="mt-6 space-y-3">
                    {item.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                        <CheckCircle2 size={16} className="text-[#1E3A8A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-200/80">
                  <Link
                    to={item.link}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 text-xs font-extrabold text-[#1E3A8A] shadow-sm hover:bg-blue-50 hover:border-[#1E3A8A] transition"
                  >
                    <span>Masuk Halaman {item.roleBadge.split(":")[1]}</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
