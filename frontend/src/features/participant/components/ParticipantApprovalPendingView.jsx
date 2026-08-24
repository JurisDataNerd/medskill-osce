import { Hourglass, XCircle, ArrowLeft } from "lucide-react";

export default function ParticipantApprovalPendingView({
  candidateApprovalStatus,
  onNavigateBack,
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl text-center space-y-6 animate-in fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg">
          {candidateApprovalStatus === "rejected" ? (
            <XCircle size={32} className="text-red-400" />
          ) : (
            <Hourglass size={32} className="animate-spin" />
          )}
        </div>

        <div className="space-y-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider inline-block ${
              candidateApprovalStatus === "rejected"
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}
          >
            Akses Sesi Ujian Terkunci
          </span>
          <h2 className="text-xl font-extrabold text-white">
            {candidateApprovalStatus === "rejected"
              ? "Pendaftaran Ditolak Admin"
              : "Menunggu Approval Admin"}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            {candidateApprovalStatus === "rejected"
              ? "Maaf, pendaftaran Anda pada sesi ini tidak disetujui oleh Panitia Ujian OSCE."
              : "Status pendaftaran Anda pada sesi ini saat ini adalah MENUNGGU VERIFIKASI ADMIN. Anda belum dapat mengakses sesi ujian sampai Admin menyetujui pendaftaran Anda di Dashboard Administrator."}
          </p>
        </div>

        <button
          onClick={onNavigateBack}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-600/30 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard Portal Peserta
        </button>
      </div>
    </div>
  );
}
