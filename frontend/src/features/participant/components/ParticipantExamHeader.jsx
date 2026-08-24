import { Clock, Coffee, CheckCircle2, Megaphone, BellRing, X } from "lucide-react";

export default function ParticipantExamHeader({
  activeBroadcast,
  onCloseBroadcast,
  currentRound,
  totalRoundsInSession,
  activeStationInfo,
  viewMode,
  examStep,
  globalTimerState,
  sessionDetail,
  roundSecondsLeft,
  formatTime,
}) {
  return (
    <>
      {/* Floating Broadcast Toast Overlay Component (Auto 5s & X Close Button) */}
      {activeBroadcast && (
        <div className="fixed top-5 right-5 z-[9999] max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex items-start justify-between gap-3 rounded-2xl border-2 border-indigo-500 bg-slate-900 p-4 text-white shadow-2xl backdrop-blur-md">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                <Megaphone size={20} className="animate-bounce text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-indigo-300">
                  <BellRing size={12} className="text-amber-400" />
                  <span>Pengumuman Broadcast Admin</span>
                  <span>•</span>
                  <span>{activeBroadcast.time}</span>
                </div>
                <p className="font-bold text-xs text-slate-100 mt-1 leading-snug break-words">
                  "{activeBroadcast.message}"
                </p>
                <span className="text-[10px] text-slate-400 font-bold block mt-1">
                  Target: Peserta Ujian
                </span>
              </div>
            </div>

            <button
              onClick={onCloseBroadcast}
              title="Tutup Pesan (Close)"
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
              RONDE {currentRound} / {totalRoundsInSession}
            </span>
            <span className="text-xs font-bold text-slate-900 hidden sm:inline">
              {activeStationInfo.title}
            </span>
          </div>

          {/* Stepped Progress Indicator Banner */}
          {viewMode === "station_completed_wait" ? (
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Stase {activeStationInfo.station_number} Selesai • Menunggu Bel Rotasi
            </span>
          ) : activeStationInfo.is_break ? (
            <div className="flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1 text-xs font-black text-emerald-900 shadow-2xs">
              <Coffee size={14} className="text-emerald-600 animate-pulse" />
              <span>STASE ISTIRAHAT (TANPA LEMBAR UJIAN)</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  examStep === 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                1. Anamnesis
              </span>
              <span className="text-slate-400 font-normal">›</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  examStep === 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                2. Fisik
              </span>
              <span className="text-slate-400 font-normal">›</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  examStep === 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                3. Penunjang
              </span>
              <span className="text-slate-400 font-normal">›</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  examStep === 4 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                4. Diagnosis & Resep
              </span>
            </div>
          )}

          {/* Sub-Timer Circuit Phase Banner */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 ${
                globalTimerState?.phase === "paused" || sessionDetail?.status === "paused"
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : globalTimerState?.phase === "transition"
                  ? "border-amber-400 bg-amber-500 text-slate-950 font-black animate-pulse shadow-md"
                  : globalTimerState?.phase === "break"
                  ? "border-blue-300 bg-blue-50 text-blue-950 font-bold"
                  : "border-emerald-200 bg-emerald-50 text-emerald-950 font-bold"
              }`}
            >
              <Clock
                size={16}
                className={
                  globalTimerState?.phase === "paused" ? "text-amber-600" : "animate-pulse"
                }
              />
              <span className="text-[11px] font-bold uppercase hidden sm:inline">
                {globalTimerState?.phase === "paused" || sessionDetail?.status === "paused"
                  ? "Timer Paused Admin:"
                  : globalTimerState?.phase === "transition"
                  ? "Transisi Pergerakan Pos:"
                  : globalTimerState?.phase === "break"
                  ? "Waktu Istirahat Ronde:"
                  : "Stase Ujian Live:"}
              </span>
              <span className="text-sm font-black font-mono">{formatTime(roundSecondsLeft)}</span>
              {(globalTimerState?.phase === "paused" || sessionDetail?.status === "paused") && (
                <span className="rounded bg-amber-600 px-1.5 py-0.5 text-[9px] font-black text-white uppercase ml-1 animate-pulse">
                  PAUSED
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
