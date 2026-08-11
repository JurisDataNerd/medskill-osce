import { CheckCircle2, ArrowRight, X } from "lucide-react";

export default function SuccessModal({
  isOpen,
  onClose,
  title = "Berhasil Disimpan",
  message = "Data telah berhasil diperbarui ke database Supabase.",
  actionText = "Selesai",
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all border border-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* Success Animated Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50 shadow-inner">
            <CheckCircle2 size={36} className="stroke-[2.5]" />
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full flex-col gap-2 pt-3 sm:flex-row">
            {secondaryActionText && (
              <button
                onClick={() => {
                  if (onSecondaryAction) onSecondaryAction();
                  onClose();
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                {secondaryActionText}
              </button>
            )}
            <button
              onClick={() => {
                if (onAction) onAction();
                onClose();
              }}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
            >
              <span>{actionText}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
