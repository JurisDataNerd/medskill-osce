import { Activity, Hourglass, Users, Volume2, LogOut, Play, ChevronRight } from "lucide-react";
import ParticipantPersonalScheduleWidget from "@/features/participant/components/ParticipantPersonalScheduleWidget";

export default function ParticipantWaitingRoomView({
  sessionDetail,
  isSessionLive,
  sessionId,
  user,
  currentRound,
  onlineUsers = [],
  onExitWaitingRoom,
  onStartSimulation,
}) {
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col relative">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Waiting Room OSCE
            </span>
          </div>

          {isSessionLive ? (
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-900 flex items-center gap-1.5 animate-pulse">
              <Activity size={14} className="text-emerald-700" />
              Sesi Berlangsung
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Hourglass size={14} className="text-amber-700" />
              Menunggu Admin Mulai
            </span>
          )}
        </div>
      </header>

      {/* Waiting Room Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 my-auto space-y-6">
        {/* OSCE Session Master Overview Card */}
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="rounded-md bg-blue-500/30 border border-blue-400/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-200 tracking-wider">
                  Informasi Sesi
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Realtime
                </span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white mt-1.5 sm:text-2xl">
                {sessionDetail?.title || "Ujian OSCE Terpadu Klinik - Sirkuit Terstandar"}
              </h1>
              <p className="text-xs text-blue-200/90 font-medium leading-relaxed mt-1">
                {sessionDetail?.description ||
                  "Simulasi ujian sirkuit rotasi stase medis terpadu sesuai standar kompetensi SKDI."}
              </p>
            </div>
          </div>

          {/* Quick Session Details Pill Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                Lokasi & Gedung
              </span>
              <span className="font-extrabold text-white text-xs mt-0.5 block truncate">
                {sessionDetail?.location_building || "Gedung Skill Lab Kedokteran"}
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                Tanggal Ujian
              </span>
              <span className="font-extrabold text-white text-xs mt-0.5 block">
                {sessionDetail?.session_date || "15 Agustus 2026"}
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                Jumlah Stase Pos
              </span>
              <span className="font-extrabold text-white text-xs mt-0.5 block">
                {sessionDetail?.total_stations || 6} Stase Rotasi
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                Durasi Stase
              </span>
              <span className="font-extrabold text-white text-xs mt-0.5 block">
                {sessionDetail?.station_duration_minutes || 12} Menit / Rotasi
              </span>
            </div>
          </div>
        </div>

        {/* Embedded Participant Personal Schedule Widget */}
        <ParticipantPersonalScheduleWidget
          sessionId={sessionId}
          participantUserId={user?.id}
          activeRound={currentRound}
        />

        {/* Live Online Users List Widget */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Peserta Terhubung
              </h3>
            </div>
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-bold text-emerald-900 flex items-center gap-1.5 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {onlineUsers.length} Online
            </span>
          </div>

          {onlineUsers.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {onlineUsers.map((u, idx) => (
                <div
                  key={u.user_id || idx}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs"
                >
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-extrabold text-xs border border-blue-200">
                    {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{u.full_name}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {u.role === "examiner"
                        ? `Dokter Penguji ${u.specialty ? `• ${u.specialty}` : ""}`
                        : u.role === "admin"
                        ? "Admin Control Room"
                        : "Peserta Ujian"}
                    </p>
                  </div>

                  <span
                    className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase shrink-0 ${
                      u.role === "examiner"
                        ? "bg-purple-100 text-purple-900 border border-purple-300"
                        : u.role === "admin"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-blue-100 text-blue-900 border border-blue-300"
                    }`}
                  >
                    {u.role === "examiner" ? "Penguji" : u.role === "admin" ? "Admin" : "Peserta"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium italic">
              Memuat peserta & penguji terhubung di ruang tunggu...
            </p>
          )}
        </div>

        {/* Action CTA to Enter Live Session */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <Volume2 size={16} className="text-blue-600 animate-pulse" />
            <span>
              {isSessionLive
                ? "Bel penanda ronde akan berbunyi saat waktu persiapan habis."
                : "Sesi otomatis ter-refresh setiap 3 detik menunggu aba-aba Admin Control Room."}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onExitWaitingRoom}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100 px-6 py-3.5 text-xs font-bold text-rose-700 transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <LogOut size={16} />
              Keluar
            </button>
            <button
              onClick={onStartSimulation}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-xs font-bold text-white shadow-lg transition active:scale-95 cursor-pointer ${
                isSessionLive
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
              }`}
            >
              <Play size={16} />
              Masuk
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
