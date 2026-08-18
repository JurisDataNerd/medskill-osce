import { AlertTriangle, CheckCircle2, Info, Trash2, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Tindakan",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  showCancel = true,
  isAlert = false,
  variant = "primary", // "primary" | "danger" | "warning" | "info" | "success"
  loading = false,
}) {
  if (!isOpen) return null;

  const handleConfirmAction = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-red-100 text-red-600 border-red-200",
          buttonBg: "bg-red-600 hover:bg-red-700 text-white shadow-red-200",
          icon: <Trash2 size={24} />,
        };
      case "warning":
        return {
          iconBg: "bg-amber-100 text-amber-600 border-amber-200",
          buttonBg: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200",
          icon: <AlertTriangle size={24} />,
        };
      case "info":
        return {
          iconBg: "bg-sky-100 text-sky-600 border-sky-200",
          buttonBg: "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200",
          icon: <Info size={24} />,
        };
      case "success":
        return {
          iconBg: "bg-emerald-100 text-emerald-600 border-emerald-200",
          buttonBg: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200",
          icon: <CheckCircle2 size={24} />,
        };
      case "primary":
      default:
        return {
          iconBg: "bg-blue-100 text-blue-600 border-blue-200",
          buttonBg: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200",
          icon: <CheckCircle2 size={24} />,
        };
    }
  };

  const style = getVariantStyles();
  const shouldShowCancel = showCancel && !isAlert;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-slate-100 transform transition-all scale-100">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${style.iconBg} shrink-0`}>
              {style.icon}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">MedSkill OSCE Management</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-line">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {shouldShowCancel && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmAction}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-md active:scale-95 transition disabled:opacity-50 ${style.buttonBg}`}
          >
            {loading ? "Memproses..." : isAlert ? (confirmText === "Ya, Lanjutkan" ? "Mengerti" : confirmText) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
