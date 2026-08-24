import { Coffee, Clock, ArrowRight } from "lucide-react";

export default function ParticipantBreakStationView({
  currentRound,
  roundSecondsLeft,
  formatTime,
  onFinishActiveRound,
}) {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 text-center shadow-lg space-y-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
        <Coffee size={40} className="animate-bounce text-emerald-600" />
      </div>

      <div>
        <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-1 text-xs font-black uppercase tracking-wider">
          STASE ISTIRAHAT (REST STATION)
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-3">
          Waktu Istirahat Ronde {currentRound}
        </h2>
        <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          Anda sedang berada di Stase Istirahat. Tidak ada pengujian keterampilan atau pengisian jawaban pada stase ini. Silakan gunakan waktu ini untuk memulihkan stamina sebelum lanjut ke stase pengujian berikutnya.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-white p-5 max-w-md mx-auto shadow-2xs space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
          <Clock size={16} className="text-emerald-600" />
          <span>SISA WAKTU ISTIRAHAT STASE</span>
        </div>
        <p className="text-4xl font-black font-mono text-emerald-700">
          {formatTime(roundSecondsLeft)}
        </p>
      </div>

      <div className="pt-2 flex justify-center">
        <button
          onClick={onFinishActiveRound}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-8 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
        >
          <span>Selesaikan Stase Istirahat & Lanjut Transisi</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
