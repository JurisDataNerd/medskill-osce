import { useState } from "react";
import {
  X,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Timer,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from "lucide-react";

export default function SessionRegistrationModal({
  isOpen,
  onClose,
  onConfirm,
  session,
  userProfile = {
    name: "Tidak ada data",
    nim: "Tidak ada data",
    institution: "Tidak ada data",
  },
}) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !session) return null;

  async function handleConfirmSubmit() {
    if (!agreed) return;
    try {
      setLoading(true);
      await onConfirm(session.id);
    } catch (err) {
      console.error("Error confirming registration:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
              <FileCheck2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold leading-tight">
                  Konfirmasi Pendaftaran Sesi OSCE
                </h2>
                <span className="rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-[10px] font-bold px-2.5 py-0.5">
                  Offline Exam
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Verifikasi detail sesi & data peserta sebelum mengajukan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] bg-slate-50/50">
          {/* Target Session Card Info */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 uppercase tracking-wider">
                Detail Sesi Ujian Target
              </span>
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                <Sparkles size={14} className="text-blue-600" />
                6 Stase Ujian Aktif (Rotasi Sirkuit)
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
              {session.title}
            </h3>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {session.description || "Simulasi ujian OSCE komprehensif dengan rubrik penilaian spesialis."}
            </p>

            <div className="grid gap-2 sm:grid-cols-2 text-xs font-semibold text-slate-700 pt-2 border-t border-blue-200/60">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-blue-600" />
                <span>Tanggal: <strong>{session.session_date || "Sesuai Jadwal"}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-blue-600" />
                <span>Waktu: <strong>{session.start_time || "08:00 WIB"}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-blue-600" />
                <span>Lokasi: <strong>{session.location || "Gedung Skill Lab Kedokteran"}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Timer size={15} className="text-blue-600" />
                <span>Durasi: <strong>{session.station_duration_minutes || 15} Menit per Stase</strong></span>
              </div>
            </div>
          </div>

          {/* Participant Profile Verification */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <UserCheck size={16} className="text-emerald-600" />
              Verifikasi Identitas Peserta
            </h4>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Nama Peserta:</span>
                <span className="font-bold text-slate-900">{userProfile.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Institusi:</span>
                <span className="font-semibold text-slate-800">{userProfile.institution}</span>
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-amber-700" />
              Pernyataan Kehadiran & Tata Tertib
            </h4>

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <span className="text-xs font-medium text-amber-900 leading-relaxed">
                Saya menyatakan bersedia dan sanggup mengikuti seluruh rangkaian ujian sirkuit 8 stase OSCE secara <strong>offline</strong> di lokasi yang ditentukan serta mematuhi seluruh tata tertib ujian.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </button>

          <button
            onClick={handleConfirmSubmit}
            disabled={!agreed || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
          >
            <CheckCircle2 size={16} />
            {loading ? "Memproses Pendaftaran..." : "Konfirmasi & Kirim Pendaftaran"}
          </button>
        </div>
      </div>
    </div>
  );
}
