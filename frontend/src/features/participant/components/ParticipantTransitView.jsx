import { Hourglass, Clock, RotateCw, MapPin, ArrowRight } from "lucide-react";

export default function ParticipantTransitView({
  targetRoundNumber,
  nextStationInfo,
  currentRound,
  transitSecondsLeft,
  isSessionLive,
  formatTime,
  onProceedToRound,
}) {
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-2xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Hourglass size={15} className="text-amber-700 animate-pulse" />
            Transisi Perpindahan Stase (Jeda 2 Menit)
          </span>

          <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-1.5 text-amber-900">
            <Clock size={16} className="text-amber-700 animate-pulse" />
            <span className="text-[11px] font-bold uppercase">Sisa Waktu Transisi:</span>
            <span className="text-base font-black font-mono">{formatTime(transitSecondsLeft)}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 my-auto space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <RotateCw size={32} className="animate-spin" />
          </div>

          <div>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
              {targetRoundNumber === 1 ? "Persiapan Pos Stase 1" : `Ronde ${currentRound} Selesai`}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-3">
              Waktu Transisi! Silakan Berpindah Ruangan
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Anda sedang dalam jeda transisi (2 menit). Berjalanlah menuju ruangan stase berikutnya sesuai rotasi sirkuit Anda.
            </p>
          </div>

          {/* 10-Second Countdown Visual Alert Badge */}
          {transitSecondsLeft <= 10 && transitSecondsLeft > 0 && (
            <div className="rounded-2xl border-2 border-red-500 bg-red-600 text-white p-4 shadow-xl animate-pulse">
              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-widest block text-red-100">
                  ⚠️ PREPARASI FINISHED — SIAP MASUK RUANGAN DALAM:
                </span>
                <span className="text-4xl font-black font-mono text-white block">
                  00:0{transitSecondsLeft}
                </span>
              </div>
            </div>
          )}

          {/* Target Next Station Card */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <span className="rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-black text-white uppercase">
                Target Ronde {targetRoundNumber}: Pos Stase {nextStationInfo.station_number} {nextStationInfo.is_break ? "(ISTIRAHAT)" : ""}
              </span>
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                <MapPin size={14} className="text-blue-600" />
                {nextStationInfo.location}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {`Pos Stase ${nextStationInfo.station_number}${nextStationInfo.is_break ? " (Istirahat)" : ""}`}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Persiapkan diri Anda sebelum masuk ke ruang stase rotasi berikutnya.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onProceedToRound(targetRoundNumber)}
              disabled={isSessionLive && transitSecondsLeft > 0}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-xs font-bold text-white shadow-lg transition cursor-pointer ${
                isSessionLive && transitSecondsLeft > 0
                  ? "bg-slate-400 cursor-not-allowed opacity-80"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 active:scale-95"
              }`}
            >
              <ArrowRight size={16} />
              {isSessionLive && transitSecondsLeft > 0
                ? `Menunggu Bel Transisi Selesai (${formatTime(transitSecondsLeft)})`
                : `Lanjut Masuk Ronde ${targetRoundNumber}`}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
