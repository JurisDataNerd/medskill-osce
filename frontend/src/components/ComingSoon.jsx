import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Sparkles, Construction, Home } from "lucide-react";

export default function ComingSoon({
  title = "Fitur Sedang Dalam Pengembangan",
  description = "Fitur ini akan segera hadir pada pembaruan sistem berikutnya. Terima kasih atas kesabaran Anda.",
  backPath = -1,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 shadow-md">
          <Sparkles size={38} className="animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
          <Clock size={16} />
        </div>
      </div>

      <span className="mb-2 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
        🚧 FITUR SEGERA HADIR (COMING SOON)
      </span>

      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl max-w-md">
        {title}
      </h1>

      <p className="mt-2 text-sm text-slate-500 max-w-lg leading-relaxed">
        {description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => (typeof backPath === "number" ? navigate(backPath) : navigate(backPath))}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>

        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
        >
          <Home size={16} />
          Ke Halaman Utama
        </button>
      </div>
    </div>
  );
}
