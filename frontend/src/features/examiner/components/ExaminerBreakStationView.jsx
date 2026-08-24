import { Coffee, Info, Clock, LogOut } from "lucide-react";

export default function ExaminerBreakStationView({
  stationData,
  timerState,
  remainingSeconds,
  handleExitExaminerWaitingRoom,
}) {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-8 text-white shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-amber-400/40 pb-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black text-2xl shadow-lg border border-white/30 shrink-0">
              <Coffee size={32} />
            </div>
            <div>
              <span className="rounded-md bg-white/20 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border border-white/30">
                Slot #{stationData.station_number} • POS ISTIRAHAT
              </span>
              <h1 className="text-2xl font-black text-white mt-1">
                Stase Istirahat Sirkuit
              </h1>
              <p className="text-xs text-amber-100 font-medium mt-0.5">
                Stase ini adalah pos jeda istirahat rotasi bagi peserta ujian dan tidak memerlukan lembar penilaian medis.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExitExaminerWaitingRoom}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer backdrop-blur-xs"
          >
            <LogOut size={15} />
            Keluar ke Dashboard
          </button>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-amber-200 animate-pulse" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 block">
                Sisa Waktu Putaran Stase
              </span>
              <span className="font-mono text-2xl font-black text-white">
                {Math.floor(remainingSeconds / 60).toString().padStart(2, "0")}:
                {(remainingSeconds % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          {timerState?.phase && (
            <span className="rounded-xl bg-white/20 border border-white/30 px-3.5 py-1.5 text-xs font-extrabold uppercase">
              Fase: {timerState.phase}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Info size={18} className="text-blue-600" />
          Petunjuk Slot Istirahat
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {stationData.examiner_instructions ||
            "Dokter Penguji di pos istirahat dapat menggunakan waktu putaran ini untuk beristirahat sejenak atau mereviu instrumen rotasi berikutnya. Peserta yang masuk ke pos ini juga sedang dalam fase jeda fisik sebelum rotasi ke pos stase ujian berikutnya."}
        </p>
      </div>
    </div>
  );
}
