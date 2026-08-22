import { ArrowLeft, Users, XCircle, Play, Grid, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LiveWaitingRoomCard({
  activeSession,
  onlineUsers = [],
  liveStations = [],
  handleBackToList,
  handleCloseWaitingRoom,
  handleStartOsce,
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <button
        onClick={handleBackToList}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Daftar Live Monitor</span>
      </button>

      {/* Waiting Room Header */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-black text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                Waiting Room
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Realtime
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {activeSession.title}
            </h1>
            <p className="text-xs text-blue-200/90 font-medium leading-relaxed">
              Waiting Room aktif. Peserta dan Dokter Penguji dapat bergabung. Tekan tombol di bawah untuk memulai sesi.
            </p>
          </div>
        </div>

        {/* Quick Session Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Lokasi & Gedung</span>
            <span className="font-extrabold text-white text-xs mt-0.5 block truncate">
              {activeSession.location_building || "Gedung Skill Lab"}
            </span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Durasi / Stase</span>
            <span className="font-extrabold text-white text-xs mt-0.5 block">
              {activeSession.station_duration_minutes || 12} Menit / Rotasi
            </span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">Total Station</span>
            <span className="font-extrabold text-white text-xs mt-0.5 block">
              {activeSession.total_stations || 6} Pos Stase
            </span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">User Online</span>
            <span className="font-extrabold text-emerald-400 text-xs mt-0.5 block">
              {onlineUsers.length} Terhubung
            </span>
          </div>
        </div>
      </div>

      {/* Online Users Presence Grid */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            Pengguna Terhubung di Waiting Room ({onlineUsers.length} Online)
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            {onlineUsers.length} User Aktif Online
          </span>
        </div>

        {onlineUsers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center space-y-2">
            <p className="text-xs text-slate-500 font-bold">Belum ada peserta atau penguji yang terhubung ke Waiting Room ini.</p>
            <p className="text-[10px] text-slate-400">
              Peserta: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">http://localhost:5173/participant/session/{activeSession.id}</code>
            </p>
            <p className="text-[10px] text-slate-400">
              Penguji: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">http://localhost:5173/examiner/stage/{activeSession.id}</code>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {onlineUsers.map((u, i) => (
              <div key={u.user_id || i} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-black text-sm">
                    {(u.full_name || "?")[0].toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{u.full_name || u.email}</p>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    u.role === "admin"
                      ? "bg-red-100 text-red-700"
                      : u.role === "examiner"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {u.role === "admin" ? "Admin" : u.role === "examiner" ? "Penguji" : "Peserta"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start / Exit Waiting Room Action Bar */}
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-emerald-900">Siap Memulai Ujian OSCE?</h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Tekan tombol di bawah untuk memulai timer global dan mengalihkan semua peserta & penguji ke layar ujian live, atau tutup waiting room.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCloseWaitingRoom}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white hover:bg-rose-100 px-5 py-3 text-xs font-bold text-rose-700 shadow-2xs active:scale-95 transition cursor-pointer"
            >
              <XCircle size={18} className="text-rose-600" />
              Keluar Waiting Room
            </button>
            <button
              onClick={handleStartOsce}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
            >
              <Play size={20} />
              Mulai Sesi
            </button>
          </div>
        </div>
      </div>

      {/* Matriks Live Station Pos Cards Grid (Always Visible) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Grid size={18} className="text-blue-600" />
            Matriks Stase ({liveStations.length} Pos)
          </h2>
          <span className="text-xs text-slate-500 font-medium">Klik "Inspect Stase" untuk memantau detail stase</span>
        </div>

        {liveStations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {liveStations.map((stg) => (
              <div
                key={stg.id}
                className={`rounded-2xl border p-4 space-y-3 shadow-2xs transition ${
                  stg.is_break
                    ? "border-amber-300 bg-amber-50/70"
                    : "border-slate-200 bg-slate-50/70 hover:border-blue-400 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      stg.is_break
                        ? "bg-amber-200 text-amber-950"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {stg.title || `Stase ${stg.station_number}`}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400">
                    Pos #{stg.station_number}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                    {stg.case_title || "Kasus Medis Terstandar"}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Penguji: <span className="font-bold text-slate-700">{stg.examiner?.full_name || "Belum ditugaskan"}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Peserta Awal: <span className="font-bold text-slate-700">{stg.participant?.full_name || "Peserta Ujian"}</span>
                  </p>
                </div>

                {!stg.is_break && (
                  <button
                    onClick={() => navigate(`/admin/live/station/${stg.id}`)}
                    className="w-full flex items-center justify-center gap-1 rounded-xl bg-blue-50 border border-blue-200 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                  >
                    Inspect Stase
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-medium italic text-center py-4">
            Tidak ada data stase pos untuk sesi ini.
          </p>
        )}
      </div>
    </div>
  );
}
