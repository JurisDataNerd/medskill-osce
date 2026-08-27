import {
  Clock,
  Pause,
  Play,
  Square,
  ChevronRight,
  Megaphone,
  BellRing,
  AlertTriangle,
  Coffee,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function LiveTimerControlHeader({
  activeSession,
  timerState,
  isTimerRunning,
  remainingSeconds,
  currentRound,
  totalRoundsCount,
  isBellMenuOpen,
  setIsBellMenuOpen,
  handleTriggerBell,
  handleTogglePause,
  handleSkipPhase,
  handleFinishOSCE,
  setIsBroadcastModalOpen,
  formatMinutesSeconds,
}) {
  const rawPhase = timerState?.phase || "standby";
  const isSessionPaused =
    !isTimerRunning ||
    rawPhase === "paused" ||
    rawPhase.startsWith("paused") ||
    activeSession?.status === "paused";
  const currentPhase = rawPhase.startsWith("paused_")
    ? rawPhase.replace("paused_", "")
    : rawPhase === "paused"
    ? "action"
    : rawPhase;

  return (
    <div className="space-y-4">
      {/* Hero Control Desk Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1 text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Live Control Room
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Session ID: {activeSession.id}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-2">
              {activeSession.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Building: {activeSession.location_building || activeSession.location || "Skill Lab Medis"} • Total {totalRoundsCount} Stase Rotasi Sirkuit
            </p>
          </div>

          {/* Quick Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Bell Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsBellMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 shadow-md hover:bg-slate-700 hover:text-white active:scale-95 transition border border-slate-700 cursor-pointer"
                title="Bunyikan Bel Audio OSCE"
              >
                <BellRing size={16} className="text-amber-400 animate-pulse" />
                Bunyikan Bel
              </button>

              {isBellMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-slate-900 border border-slate-700 p-2 shadow-2xl z-30 space-y-1 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => handleTriggerBell("start")}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl transition flex items-center justify-between"
                  >
                    <span>Bel 1x (Mulai Stase)</span>
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  </button>
                  <button
                    onClick={() => handleTriggerBell("warning")}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl transition flex items-center justify-between"
                  >
                    <span>Bel 2x (Sisa 3 Mnt)</span>
                    <AlertTriangle size={12} className="text-amber-400" />
                  </button>
                  <button
                    onClick={() => handleTriggerBell("rotation")}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl transition flex items-center justify-between"
                  >
                    <span>Bel 3x (Rotasi)</span>
                    <BellRing size={12} className="text-red-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Pause / Play Global Timer Button */}
            <button
              onClick={handleTogglePause}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition cursor-pointer ${
                isTimerRunning
                  ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 animate-pulse"
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause size={16} />
                  Jeda (Pause)
                </>
              ) : (
                <>
                  <Play size={16} />
                  {timerState?.paused_remaining_ms ? "Lanjutkan (Resume)" : "Mulai"}
                </>
              )}
            </button>

            {/* Broadcast Modal Trigger */}
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
            >
              <Megaphone size={16} />
              Broadcast
            </button>

            {/* Finish Session Button */}
            <button
              onClick={handleFinishOSCE}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-600/20 px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-600 hover:text-white transition cursor-pointer"
            >
              <Square size={15} />
              Akhiri Sesi
            </button>
          </div>
        </div>

        {/* Banner Selesai Grace Period */}
        {timerState?.phase === "completed_waiting" && (
          <div className="mt-4 rounded-2xl border-2 border-purple-500 bg-purple-950/80 p-5 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white font-black text-lg">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-purple-300 block">
                  SESI SELESAI — Menunggu Pengajuan Nilai Penguji & Penutupan Admin
                </span>
                <p className="text-sm font-bold text-white mt-0.5">
                  Seluruh {totalRoundsCount} ronde sirkuit ujian OSCE telah tuntas. Timer dibekukan di 00:00.
                </p>
              </div>
            </div>
            <button
              onClick={handleFinishOSCE}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-3 text-xs font-black text-white shadow-lg active:scale-95 transition cursor-pointer"
            >
              <Square size={16} />
              Akhiri Sesi OSCE
            </button>
          </div>
        )}

        {/* Timer Stat Display Bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-6">
          {/* Card 1: Status Ronde Live */}
          <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Status Ronde Live
            </span>
            <span className="text-xl font-black text-white mt-1 block">
              Ronde {currentRound} / {totalRoundsCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              Sirkuit Pos Terjadwal
            </span>
          </div>

          {/* Card 2: Sub-Timer Countdown */}
          <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Sub-Timer Fase Aktif
              </span>
              {isSessionPaused && (
                <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                  PAUSED
                </span>
              )}
            </div>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
              {formatMinutesSeconds(remainingSeconds)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              Countdown Tersinkronisasi
            </span>
          </div>

          {/* Card 3: Fase Rotasi Saat Ini */}
          <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Fase Rotasi Saat Ini
              </span>
              {isSessionPaused && (
                <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-black text-amber-300 uppercase">
                  DIHENTIKAN (PAUSED)
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              {currentPhase === "initial_transition" ? (
                <span className={`inline-flex items-center gap-1.5 text-base font-black ${isSessionPaused ? "text-amber-300" : "text-amber-400"}`}>
                  {isSessionPaused ? <Pause size={18} className="text-amber-400 shrink-0" /> : <ChevronRight size={18} className="animate-ping text-amber-400 shrink-0" />}
                  {isSessionPaused ? "[PAUSED] " : ""}Persiapan Pos Stase 1 ({activeSession.transition_duration_minutes ?? 2}m)
                </span>
              ) : currentPhase === "transition" ? (
                <span className={`inline-flex items-center gap-1.5 text-base font-black ${isSessionPaused ? "text-amber-300" : "text-amber-400"}`}>
                  {isSessionPaused ? <Pause size={18} className="text-amber-400 shrink-0" /> : <ChevronRight size={18} className="animate-ping text-amber-400 shrink-0" />}
                  {isSessionPaused ? `[PAUSED] Transisi Rotasi Stase (Ronde ${currentRound} → ${currentRound + 1})` : `Transisi Pos (${activeSession.transition_duration_minutes ?? 2}m)`}
                </span>
              ) : currentPhase === "break" ? (
                <span className={`inline-flex items-center gap-1.5 text-base font-black ${isSessionPaused ? "text-amber-300" : "text-blue-400"}`}>
                  {isSessionPaused ? <Pause size={18} className="text-amber-400 shrink-0" /> : <Coffee size={18} className="text-blue-400 shrink-0" />}
                  {isSessionPaused ? `[PAUSED] Istirahat Ronde ${currentRound} (${activeSession.break_duration_minutes ?? 5}m)` : `Istirahat (${activeSession.break_duration_minutes ?? 5}m)`}
                </span>
              ) : currentPhase === "completed_waiting" ? (
                <span className="inline-flex items-center gap-1.5 text-base font-black text-purple-400">
                  <CheckCircle2 size={18} className="text-purple-400 shrink-0" />
                  Selesai (Grace Period)
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 text-base font-black ${isSessionPaused ? "text-amber-300" : "text-emerald-400"}`}>
                  {isSessionPaused ? <Pause size={18} className="text-amber-400 shrink-0" /> : <Activity size={18} className="text-emerald-400 animate-pulse shrink-0" />}
                  {isSessionPaused ? `[PAUSED] Sesi Ujian Stase (Ronde ${currentRound}/${totalRoundsCount})` : `Stase Ujian Ronde ${currentRound} (${activeSession.station_duration_minutes ?? 12}m)`}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              {isSessionPaused
                ? currentPhase === "initial_transition"
                  ? "Timer di-pause saat peserta persiapan memasuki gedung / depan pos stase 1."
                  : currentPhase === "transition"
                  ? `Timer di-pause saat peserta berjalan berpindah ke pos stase berikutnya (Ronde ${currentRound + 1}).`
                  : currentPhase === "break"
                  ? `Timer di-pause saat waktu jeda istirahat Ronde ${currentRound}.`
                  : `Timer di-pause saat pengerjaan kasus medis Ronde ${currentRound}.`
                : currentPhase === "initial_transition"
                ? "Peserta Memasuki Pos Stase 1"
                : currentPhase === "transition"
                ? "Peserta Pindah Pos Ruangan"
                : currentPhase === "break"
                ? "Jeda Fisik Ronde"
                : currentPhase === "completed_waiting"
                ? "Menunggu Pengajuan Nilai Penguji"
                : "Peserta Mengerjakan Soal"}
            </span>
          </div>

          {/* Card 4: Fase Selanjutnya & Skip */}
          <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Fase Selanjutnya
              </span>
              <span className="text-xs font-bold text-slate-200 mt-1 block">
                {currentPhase === "initial_transition"
                  ? `Stase Ujian Ronde 1 (${activeSession.station_duration_minutes ?? 12} Menit)`
                  : currentRound >= totalRoundsCount && (currentPhase === "action" || currentPhase === "running")
                  ? `Akhiri Sesi OSCE (Selesai ${currentRound}/${totalRoundsCount})`
                  : currentRound >= totalRoundsCount && (currentPhase === "transition" || currentPhase === "break" || currentPhase === "completed_waiting")
                  ? "Akhiri Sesi OSCE (Seluruh Ronde Selesai)"
                  : currentPhase === "running" || currentPhase === "action"
                  ? `Transisi Pos (${activeSession.transition_duration_minutes ?? 2} Menit)`
                  : `Stase Ujian Ronde ${currentRound + 1}`}
              </span>
            </div>
            {currentRound >= totalRoundsCount && (currentPhase === "transition" || currentPhase === "break" || currentPhase === "action" || currentPhase === "running") ? (
              <button
                onClick={handleFinishOSCE}
                className="mt-2 text-left text-[11px] font-extrabold underline flex items-center gap-1 text-red-400 hover:text-red-300 transition cursor-pointer"
              >
                <Square size={14} />
                Akhiri Sesi OSCE (Selesai {currentRound}/{totalRoundsCount})
              </button>
            ) : (
              <button
                onClick={handleSkipPhase}
                className="mt-2 text-left text-[11px] font-extrabold underline flex items-center gap-1 text-blue-400 hover:text-blue-300 transition cursor-pointer"
              >
                <ChevronRight size={14} />
                Skip Manual ke Fase Berikutnya
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
