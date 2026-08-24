import {
  Stethoscope,
  Activity,
  LogOut,
  CalendarDays,
  CheckCircle2,
  History,
  PlayCircle,
  Play,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

export default function ExaminerSessionsList({
  currentUserProfile,
  assignedSessionsList,
  setActiveSession,
  setStationData,
  navigate,
  confirmModal,
  setConfirmModal,
}) {
  const rawDoctorName = currentUserProfile?.full_name || "Dokter Penguji";
  const doctorName = rawDoctorName.toLowerCase().startsWith("dr") ? rawDoctorName : `dr. ${rawDoctorName}`;
  const doctorSpecialty = currentUserProfile?.specialty || "Spesialis Penguji OSCE";
  const doctorInst = currentUserProfile?.university || "Fakultas Kedokteran";

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Modern Hero Dashboard Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-blue-600/90 text-white flex items-center justify-center font-black text-2xl shadow-lg border-2 border-blue-400/30 shrink-0">
              <Stethoscope size={30} />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-500/20 px-3 py-0.5 text-[10px] font-black text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                  Ruang Pengujian OSCE
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Status: Standby Penugasan
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {doctorName}
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                {doctorSpecialty} • {doctorInst}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <Activity size={15} />
              Muat Ulang
            </button>
            <button
              onClick={() => navigate("/examiner")}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-md shadow-rose-600/30 cursor-pointer"
            >
              <LogOut size={15} />
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <CalendarDays className="text-blue-600" size={20} />
            Daftar Sesi Ujian Penugasan ({assignedSessionsList.length})
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Pilih kartu sesi ujian di bawah untuk masuk ke ruang pengujian stase Anda.
          </p>
        </div>
      </div>

      {assignedSessionsList.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {assignedSessionsList.map(({ session: s, assignment: a, station: st }) => {
            const sStatus = String(s.status || "").toLowerCase();
            const isOngoing = ["ongoing", "running", "waiting_room", "paused"].includes(sStatus);
            const isCompleted = ["completed", "finished", "selesai"].includes(sStatus);
            const isPublished = ["published", "scheduled"].includes(sStatus);
            const isDraft = sStatus === "draft";

            return (
              <div
                key={s.id}
                onClick={() => {
                  if (isCompleted) {
                    navigate("/examiner/history");
                  } else if (!isDraft) {
                    setActiveSession(s);
                    setStationData(st);
                    navigate(`/examiner/stage/${st?.id || s.id}`);
                  }
                }}
                className={`rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 shadow-2xs transition flex flex-col justify-between ${
                  isDraft ? "opacity-70 cursor-not-allowed" : "hover:border-blue-300 hover:bg-white cursor-pointer active:scale-98"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {isOngoing && (
                      <span className="rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                        Live Berlangsung
                      </span>
                    )}
                    {isPublished && (
                      <span className="rounded-md bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                        Sesi Terjadwal
                      </span>
                    )}
                    {isCompleted && (
                      <span className="rounded-md bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-slate-600" />
                        Sesi Selesai
                      </span>
                    )}
                    {isDraft && (
                      <span className="rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1">
                        Draft
                      </span>
                    )}

                    <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-900 inline-flex items-center gap-1 uppercase">
                      <CheckCircle2 size={11} className="text-emerald-700" />
                      Pos #{st?.station_number || a?.assigned_station_number || 1}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{s.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {st
                        ? `Pos Penugasan: Pos #${st.station_number} - ${st.case_title || st.title || "Kasus Medis"}`
                        : s.description || "Sesi evaluasi sirkuit terpadu stase aktif."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                      <span className="text-slate-400 text-[10px] block font-bold">Total Stase</span>
                      <span className="font-black text-slate-900">{s.total_stations || 8} Pos</span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                      <span className="text-slate-400 text-[10px] block font-bold">Durasi Stase</span>
                      <span className="font-black text-slate-900">{s.station_duration_minutes || 12} Mnt</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60">
                  {isCompleted ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/examiner/history");
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition active:scale-95 shadow-sm cursor-pointer"
                    >
                      <History size={16} />
                      Lihat Riwayat & Rekap
                    </button>
                  ) : isDraft ? (
                    <button
                      type="button"
                      disabled
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-400 bg-slate-100 cursor-not-allowed border border-slate-200"
                    >
                      Belum Dipublikasikan
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer ${
                        isOngoing
                          ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 animate-pulse"
                          : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
                      }`}
                    >
                      {isOngoing ? (
                        <>
                          <PlayCircle size={16} />
                          Masuk Sesi Live
                        </>
                      ) : (
                        <>
                          <Play size={15} />
                          Masuk Sesi
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-xs">
            <Stethoscope size={30} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">Belum Ada Sesi Ujian Penugasan</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
              Anda belum memiliki jadwal penugasan stase aktif saat ini. Penugasan akan muncul di sini saat sesi dibuka oleh Admin.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer"
            >
              <Activity size={15} />
              Muat Ulang Jadwal
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        isAlert={confirmModal.isAlert}
      />
    </div>
  );
}
