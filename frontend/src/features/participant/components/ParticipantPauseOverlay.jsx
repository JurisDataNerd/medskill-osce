import { PauseCircle, Volume2 } from "lucide-react";

export default function ParticipantPauseOverlay({
  globalTimerState,
  sessionDetail,
  currentRound,
  assignedStation,
}) {
  const isPaused =
    globalTimerState?.phase === "paused" ||
    globalTimerState?.phase?.startsWith("paused") ||
    sessionDetail?.status === "paused";

  if (!isPaused) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 animate-in fade-in duration-200 select-none pointer-events-auto">
      <div className="max-w-md w-full rounded-3xl border border-amber-500/50 bg-slate-900 p-8 text-center space-y-6 shadow-2xl text-white">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
          <PauseCircle size={48} className="animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-3.5 py-1 text-[11px] font-black text-amber-300 uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            Sesi Dihentikan Sementara
          </span>
          <h2 className="text-xl font-black text-white pt-1">
            Sesi OSCE Sedang Diberhentikan Sementara
          </h2>
          <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-sm mx-auto">
            Panitia Control Room sedang mem-pause timer ujian. Harap tetap tenang, berada di posisi stase Anda, dan menunggu pengumuman selanjutnya.
          </p>
        </div>

        {/* Status Posisi Saat Ini */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left space-y-1">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
            Posisi Stase & Fase Saat Ini:
          </span>
          <p className="text-sm font-extrabold text-white">
            {globalTimerState?.phase === "paused_initial_transition"
              ? "Transisi Awal & Persiapan Pos Stase 1"
              : globalTimerState?.phase === "paused_transition"
              ? `Transisi Perpindahan Pos Stase (Ronde ${currentRound} → ${currentRound + 1})`
              : globalTimerState?.phase === "paused_break"
              ? `Jeda Istirahat Ronde ${currentRound}`
              : `Sesi Ujian Stase: ${assignedStation?.title || assignedStation?.station_name || `Stase Ronde ${currentRound}`}`}
          </p>
          <p className="text-xs text-slate-300 font-medium">
            {globalTimerState?.phase === "paused_initial_transition"
              ? "Peserta berada di pintu masuk / depan pos stase 1 menunggu dimulainya ujian."
              : globalTimerState?.phase === "paused_transition"
              ? `Peserta sedang dalam proses perpindahan menuju stase ronde ${currentRound + 1}.`
              : globalTimerState?.phase === "paused_break"
              ? "Peserta berada di ruang jeda istirahat."
              : `Peserta berada di pos ${assignedStation?.title || assignedStation?.station_name || `Stase ${currentRound}`} (Pengerjaan kasus dihentikan sementara).`}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-2">
          <Volume2 size={16} className="text-amber-400 animate-pulse shrink-0" />
          <span>Suara pengumuman & bel akan otomatis berbunyi saat dilanjutkan.</span>
        </div>
      </div>
    </div>
  );
}
