import React from "react";

export default function ParticipantStepConfirmModal({
  isOpen,
  pendingNextStep,
  activeStationNumber,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Konfirmasi Perpindahan Tahap
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Navigasi Ujian One-Way Forward</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 space-y-2">
          <p className="font-bold text-slate-900">
            Perhatian: Anda tidak dapat kembali (no back button) ke tahap ini setelah melanjutkan.
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            {pendingNextStep === 5
              ? `Apakah Anda yakin ingin menyelesaikan Stase ${activeStationNumber} dan masuk ke Ruang Tunggu Perpindahan Stase?`
              : `Apakah Anda sudah selesai dan yakin ingin melanjutkan ke Tahap ${pendingNextStep}?`}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
