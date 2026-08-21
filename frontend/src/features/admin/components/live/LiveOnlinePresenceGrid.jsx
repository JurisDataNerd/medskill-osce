import { Users } from "lucide-react";

export default function LiveOnlinePresenceGrid({ onlineUsers = [], sessionId = "" }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Users size={20} className="text-emerald-600" />
            Presensi Live Online Pengguna Terhubung ({onlineUsers.length} User)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Pantau dokter penguji dan peserta yang sedang terhubung ke channel Supabase WebSocket Realtime untuk ID Sesi:{" "}
            <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
              {sessionId}
            </code>
          </p>
        </div>

        <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-black text-emerald-900 inline-flex items-center gap-1.5 animate-pulse">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {onlineUsers.length} User Aktif Online
        </span>
      </div>

      {onlineUsers.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {onlineUsers.map((u, idx) => (
            <div
              key={u.user_id || idx}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5 hover:bg-white transition shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm border border-indigo-200">
                  {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{u.full_name}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {u.role === "examiner"
                      ? `Dokter Penguji ${u.specialty ? `• ${u.specialty}` : ""}`
                      : u.role === "admin"
                      ? "Admin Control Room"
                      : `Peserta ${u.nim ? `(NIM: ${u.nim})` : ""}`}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase shrink-0 ${
                  u.role === "examiner"
                    ? "bg-purple-100 text-purple-900 border border-purple-300"
                    : u.role === "admin"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                }`}
              >
                {u.role === "examiner" ? "Penguji" : u.role === "admin" ? "Admin" : "Peserta"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500 font-medium space-y-2">
          <p>Belum ada peserta atau penguji lain yang terhubung ke ID Sesi ini.</p>
          <p className="text-[11px] text-slate-400">
            Untuk menguji realtime, buka tab browser baru dengan URL Peserta:{" "}
            <code className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
              http://localhost:5173/participant/session/{sessionId}
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
