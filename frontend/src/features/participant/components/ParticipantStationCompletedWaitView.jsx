import { CheckCircle2, Lock, Clock, ShieldCheck } from "lucide-react";

export default function ParticipantStationCompletedWaitView({
  activeStationInfo,
  roundSecondsLeft,
  formatTime,
}) {
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto p-6 my-auto flex items-center justify-center">
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 sm:p-12 text-center shadow-xl space-y-6 w-full">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <CheckCircle2 size={44} className="animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-4 py-1 text-xs font-black text-emerald-900 uppercase tracking-wider">
            <Lock size={12} className="text-emerald-700" />
            Jawaban Stase {activeStationInfo.station_number} Dikirim & Terkunci
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 pt-1">
            Terima Kasih! Lembar Jawaban Stase Telah Tersimpan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
            Anda telah menyelesaikan pengerjaan <strong className="text-slate-900">Stase {activeStationInfo.station_number}</strong>. Seluruh data jawaban Anda telah aman tersimpan di server.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-6 max-w-md mx-auto shadow-sm space-y-2 border-dashed">
          <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-slate-500">
            <Clock size={16} className="text-emerald-600 animate-pulse" />
            <span>SISA WAKTU STASE INI</span>
          </div>
          <p className="text-4xl sm:text-5xl font-black font-mono text-emerald-700">
            {formatTime(roundSecondsLeft)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Menunggu waktu sisa stase berakhir untuk perpindahan masal...
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 max-w-md mx-auto text-left text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-amber-950">Petunjuk Menunggu Bel Rotasi:</p>
            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
              Harap tetap berada di area stase. Saat timer sisa stase habis, sistem akan membunyikan bel transisi dan membuka Halaman Transisi Perpindahan Stase secara otomatis.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
