import { useNavigate } from "react";
import {
  Activity,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  History,
  MapPin,
  Play,
  Stethoscope,
  UserCheck,
  Users,
  ChevronRight,
} from "lucide-react";
import {
  CURRENT_EXAMINER_PROFILE,
  EXAMINER_LIVE_SESSION,
  EXAMINER_HISTORY_SESSIONS,
} from "@/features/examiner/data/mockExaminerData";

export default function ExaminerPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Welcome Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={CURRENT_EXAMINER_PROFILE.avatar}
              alt={CURRENT_EXAMINER_PROFILE.name}
              className="h-16 w-16 rounded-full border-4 border-white/30 object-cover shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-500/30 px-3 py-0.5 text-xs font-bold text-blue-200 border border-blue-400/30">
                  Dokter Penguji Terverifikasi
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold">{CURRENT_EXAMINER_PROFILE.name}</h1>
              <p className="text-xs text-blue-200 mt-0.5">
                Spesialisasi: <strong>{CURRENT_EXAMINER_PROFILE.specialty}</strong> • {CURRENT_EXAMINER_PROFILE.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/examiner/stage/stage-101")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-600 active:scale-95"
          >
            <Play size={16} />
            Masuk ke Penilaian Live Stase
          </button>
        </div>
      </div>

      {/* Active Live Session Highlight Card */}
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Sesi Ujian Live Berlangsung
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Ronde {EXAMINER_LIVE_SESSION.current_round} dari {EXAMINER_LIVE_SESSION.total_rounds}
            </span>
          </div>

          <span className="rounded-md bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800">
            Penugasan Anda: STASE 1
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              {EXAMINER_LIVE_SESSION.session_title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin size={15} className="text-slate-400" />
                {EXAMINER_LIVE_SESSION.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <CalendarDays size={15} className="text-slate-400" />
                {EXAMINER_LIVE_SESSION.session_date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock size={15} className="text-slate-400" />
                Durasi 15 Menit / Ronde
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Judul Stase & Kasus Medis Penugasan:</p>
              <p className="font-bold text-slate-900 text-sm">{EXAMINER_LIVE_SESSION.station_name}: {EXAMINER_LIVE_SESSION.case_title}</p>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-900">Peserta Aktif Ronde Ini:</span>
              <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                Ronde #{EXAMINER_LIVE_SESSION.current_round}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={EXAMINER_LIVE_SESSION.current_participant.avatar}
                alt={EXAMINER_LIVE_SESSION.current_participant.name}
                className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-2xs"
              />
              <div>
                <p className="font-bold text-xs text-slate-900">
                  {EXAMINER_LIVE_SESSION.current_participant.name}
                </p>
                <p className="text-[11px] text-slate-500 font-semibold">
                  NIM: {EXAMINER_LIVE_SESSION.current_participant.nim}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/examiner/stage/stage-101")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
            >
              Buka Lembar Penilaian Realtime
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Stat Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Activity size={18} className="text-emerald-600" />}
          title="Sesi Live Aktif"
          value="1 Sesi"
          subtext="Sedang berjalan"
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={<UserCheck size={18} className="text-blue-600" />}
          title="Peserta Diuji Hari Ini"
          value="1 / 6 Peserta"
          subtext="Ronde 2 sedang diuji"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Award size={18} className="text-indigo-600" />}
          title="Nilai Rata-rata Stase"
          value="88.5 / 100"
          subtext="Evaluasi Stase 1"
          bgColor="bg-indigo-50"
        />
        <StatCard
          icon={<History size={18} className="text-amber-600" />}
          title="Total Sesi Pernah Diuji"
          value="3 Sesi"
          subtext="Riwayat publikasi"
          bgColor="bg-amber-50"
        />
      </div>

      {/* History Pengujian Sesi Sebelumnya */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History size={18} className="text-blue-600" />
              Riwayat Sesi OSCE yang Pernah Diuji
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar evaluasi penilaian sesi ujian terdahulu oleh {CURRENT_EXAMINER_PROFILE.name}.
            </p>
          </div>

          <button
            onClick={() => navigate("/examiner/history")}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            Lihat Semua History <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/80 font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Nama Sesi Ujian</th>
                <th className="px-4 py-3">Stase Penugasan</th>
                <th className="px-4 py-3">Tanggal Ujian</th>
                <th className="px-4 py-3">Jumlah Peserta</th>
                <th className="px-4 py-3">Rata-rata Skor</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {EXAMINER_HISTORY_SESSIONS.map((hist) => (
                <tr key={hist.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    {hist.title}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">
                    {hist.station_name}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    {hist.session_date}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    {hist.evaluated_count} Peserta
                  </td>
                  <td className="px-4 py-3.5 font-black text-blue-700">
                    {hist.avg_score} / 100
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                      <CheckCircle2 size={12} />
                      {hist.status === "published" ? "Dipublikasikan" : hist.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtext, bgColor }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bgColor} mb-3`}>
        {icon}
      </div>
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{subtext}</p>
    </div>
  );
}