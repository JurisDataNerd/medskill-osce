import { Award, CheckCircle2, ShieldCheck, FileCheck2, ArrowLeft } from "lucide-react";

export default function ParticipantCompletedView({
  sessionDetail,
  totalRoundsInSession,
  onNavigateHome,
  onNavigateHistory,
}) {
  const completedDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 my-auto space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xl space-y-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="relative inline-block">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30">
              <Award size={52} className="animate-bounce" />
            </div>
            <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
              <CheckCircle2 size={16} />
            </span>
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-4 py-1 text-xs font-black text-emerald-900 uppercase tracking-wider">
              <ShieldCheck size={14} className="text-emerald-700" />
              Sesi Ujian OSCE Selesai & Ter-Enkripsi
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              Terima Kasih Telah Mengikuti Ujian OSCE!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
              Selamat! Anda telah menyelesaikan seluruh{" "}
              <strong className="text-slate-900">{totalRoundsInSession} ronde rotasi sirkuit stase</strong> pada sesi{" "}
              <strong className="text-slate-900">{sessionDetail?.title || "OSCE MedSkill"}</strong>. Seluruh lembar jawaban Anda telah tersimpan secara permanen.
            </p>
          </div>

          {/* Dynamic Session Summary Cards */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Sesi Ujian</span>
              <p className="font-extrabold text-slate-900 text-xs truncate">{sessionDetail?.title || "Ujian OSCE Sirkuit"}</p>
              <span className="text-[10px] text-slate-500 font-medium block">{sessionDetail?.code || "SKDI-2026"}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Ronde Selesai</span>
              <p className="font-extrabold text-emerald-700 text-xs">{totalRoundsInSession} / {totalRoundsInSession} Stase</p>
              <span className="text-[10px] text-emerald-600 font-bold block">100% Lembar Terisi</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Waktu Selesai</span>
              <p className="font-extrabold text-slate-900 text-xs">{completedDate}</p>
              <span className="text-[10px] text-slate-500 font-medium block">{sessionDetail?.location_building || "Gedung Skill Lab"}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Status Evaluasi</span>
              <p className="font-extrabold text-blue-800 text-xs">Umpan Balik Penguji</p>
              <span className="text-[10px] text-blue-600 font-medium block">Sedang Rekapitulasi</span>
            </div>
          </div>

          {/* Information Banner */}
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 max-w-2xl mx-auto text-left text-xs text-blue-900 flex items-start gap-3">
            <FileCheck2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-blue-950">Informasi Hasil & Rekapitulasi Nilai:</p>
              <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                Nilai akhir, rubrik penguji, serta feedback spesifik tiap stase akan dipublikasikan oleh Panitia Akademik melalui menu <strong>Riwayat & Transkrip Ujian</strong> setelah proses penilaian seluruh peserta selesai disetujui.
              </p>
            </div>
          </div>

          {/* Dynamic Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition cursor-pointer"
            >
              <ArrowLeft size={16} />
              Kembali ke Dashboard Utama
            </button>
            <button
              onClick={onNavigateHistory}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition cursor-pointer"
            >
              <FileCheck2 size={16} className="text-blue-600" />
              Lihat Riwayat & Transkrip Ujian
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
