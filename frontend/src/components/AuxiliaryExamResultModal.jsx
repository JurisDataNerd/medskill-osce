import { useState } from "react";
import {
  X,
  FileSpreadsheet,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import MediaEmbedViewer from "@/components/MediaEmbedViewer";

export default function AuxiliaryExamResultModal({
  isOpen,
  onClose,
  results = [],
  onConfirmNext = null,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || results.length === 0) return null;

  const currentResult = results[activeIndex] || results[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % results.length);
    setZoomLevel(1);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    setZoomLevel(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className={`flex flex-col w-full bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200 transition-all duration-300 ${
          isFullscreen ? "max-w-7xl h-[95vh]" : "max-w-4xl max-h-[90vh]"
        }`}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold leading-tight">
                  Hasil Pemeriksaan Penunjang
                </h2>
                <span className="rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5">
                  {results.length} Berkas Diterima
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Dokumen Hasil Radiologi & Laboratorium Stase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title={isFullscreen ? "Kecilkan Layar" : "Perbesar Layar"}
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Pagination if multiple items */}
        {results.length > 1 && (
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-2.5 overflow-x-auto">
            <div className="flex items-center gap-2">
              {results.map((res, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveIndex(idx);
                    setZoomLevel(1);
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    idx === activeIndex
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {idx + 1}. {res.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold shrink-0">
              <button
                onClick={handlePrev}
                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-200"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                {activeIndex + 1} / {results.length}
              </span>
              <button
                onClick={handleNext}
                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100/60">
          {/* Result Item Info Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div>
              <span className="rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                {currentResult.category || "PEMERIKSAAN PENUNJANG"}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {currentResult.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {currentResult.hasData !== false ? (
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Hasil Tersedia & Diindikasikan
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Info size={14} className="text-amber-700" />
                  Hasil Normal / Tidak Diindikasikan
                </span>
              )}
            </div>
          </div>

          {/* Image & Report Display Container */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
            {/* Image Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet size={15} className="text-blue-600" />
                Lembar Radiologi / Laboratorium
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100"
                  title="Zoom Out"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="px-2 font-mono text-slate-700">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100"
                  title="Zoom In"
                >
                  <ZoomIn size={15} />
                </button>
              </div>
            </div>

            {/* Media & Iframe Viewer Area */}
            <div className="p-2 bg-slate-950">
              <MediaEmbedViewer
                src={
                  currentResult.image_url ||
                  currentResult.imageUrl ||
                  currentResult.file_url ||
                  currentResult.media_url ||
                  currentResult.url ||
                  currentResult.link ||
                  ""
                }
                alt={currentResult.name || currentResult.title || "Hasil Pemeriksaan Penunjang"}
                height={isFullscreen ? "620px" : "440px"}
                zoomLevel={zoomLevel}
              />
            </div>

            {/* Diagnostic Report / Notes */}
            {(currentResult.reportText || currentResult.report_text) && (
              <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  Laporan Ekspertise Radiologi / Lab:
                </h4>
                <p className="text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                  {currentResult.reportText || currentResult.report_text}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <p className="text-xs text-slate-500 font-medium">
            Hasil pemeriksaan penunjang ini telah disimpan ke rekam medis peserta stase.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Tutup Berkas
            </button>
            {onConfirmNext && (
              <button
                onClick={() => {
                  onClose();
                  onConfirmNext();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition"
              >
                Lanjut ke Diagnosis & Resep
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
