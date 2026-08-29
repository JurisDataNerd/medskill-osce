import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ParticipantCheatingWarningModal({
  isOpen,
  tabSwitchCount,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="max-w-lg w-full rounded-3xl border border-red-500 bg-slate-950 p-7 text-center space-y-5 shadow-2xl text-white">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40">
          <AlertTriangle size={36} className="animate-bounce" />
        </div>
        <div className="space-y-2">
          <span className="rounded-full bg-red-500/20 border border-red-400/40 px-3 py-1 text-[11px] font-black text-red-300 uppercase tracking-wider">
            Peringatan Keamanan Ujian Sirkuit
          </span>
          <h3 className="text-lg font-black text-white">
            Perpindahan Tab / Window Terdeteksi!
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Sistem pengawas mendeteksi Anda meninggalkan atau berpindah tab browser (Pelanggaran Ke-{tabSwitchCount}). Percobaan ini telah dicatat dan dilaporkan secara otomatis ke Sistem Pengawas Ujian OSCE.
          </p>
        </div>

        <button
          onClick={onConfirm}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-500 px-6 py-3.5 text-xs font-bold text-white shadow-xl shadow-red-600/40 transition active:scale-95"
        >
          Saya Mengerti & Kembali ke Layar Ujian Fullscreen
        </button>
      </div>
    </div>
  );
}
