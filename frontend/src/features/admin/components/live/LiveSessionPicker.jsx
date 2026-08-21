import { Building2, Calendar, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LiveSessionPicker({ dbSessions = [], onSelectSession }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-extrabold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Monitor Sesi
              </span>
            </div>
            <h1 className="text-2xl font-black sm:text-3xl text-white">
              Pilih Sesi Ujian Live Monitor
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-medium">
              Pilih salah satu sesi ujian terpublikasi di bawah untuk membuka Control Room dan memantau jalannya simulasi secara realtime.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" />
            Daftar Sesi Ujian OSCE (Dipublikasikan & Berlangsung)
          </h2>
          <button
            onClick={() => navigate("/admin/sessions/create")}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            + Buat Sesi Baru
          </button>
        </div>

        {dbSessions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <p className="font-bold text-slate-700">Belum ada sesi ujian yang dipublikasikan atau sedang berlangsung.</p>
            <p className="text-slate-400">Publikasikan sesi di menu Kelola Sesi untuk memulai live monitor.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dbSessions.map((sess) => {
              const isLiveActive = ["ongoing", "running", "paused", "waiting_room"].includes(sess.status);
              return (
                <div
                  key={sess.id}
                  className={`rounded-2xl border p-5 space-y-4 shadow-2xs transition flex flex-col justify-between ${
                    isLiveActive
                      ? "border-emerald-300 bg-emerald-50/40 hover:border-emerald-400 hover:bg-emerald-50/70 ring-1 ring-emerald-500/20"
                      : "border-slate-200 bg-slate-50/70 hover:border-blue-300 hover:bg-white"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase border flex items-center gap-1.5 ${
                          isLiveActive
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-blue-100 text-blue-900 border-blue-300"
                        }`}
                      >
                        {isLiveActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        )}
                        {sess.status === "running" || sess.status === "ongoing"
                          ? "Berlangsung (Live)"
                          : sess.status === "waiting_room"
                          ? "Waiting Room Open"
                          : sess.status === "paused"
                          ? "Dihentikan (Paused)"
                          : sess.status === "scheduled" || sess.status === "published"
                          ? "Dipublikasikan"
                          : sess.status}
                      </span>
                      <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        {sess.session_date || "Terjadwal"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {sess.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {sess.description || "Sesi sirkuit terpadu stase aktif."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                      <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                        <span className="text-slate-400 text-[10px] block font-bold">Total Stase</span>
                        <span className="font-black text-slate-900">{sess.total_stations || sess.stations?.length || 6} Pos</span>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                        <span className="text-slate-400 text-[10px] block font-bold">Durasi Stase</span>
                        <span className="font-black text-slate-900">{sess.station_duration_minutes || 12} Mnt</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60">
                    <button
                      onClick={() => onSelectSession(sess.id)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer ${
                        isLiveActive
                          ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                          : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                      }`}
                    >
                      <Activity size={16} />
                      {isLiveActive ? "Buka Control Room" : "Pilih & Buka Monitor"}
                    </button>
                    <button
                      onClick={() => navigate(`/admin/sessions/${sess.id}`)}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
