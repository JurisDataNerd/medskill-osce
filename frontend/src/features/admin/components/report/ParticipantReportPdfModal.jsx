import { useRef, useState } from "react";
import { X, Download, Printer, Loader2, CheckCircle2 } from "lucide-react";
import ParticipantReportDocument from "./ParticipantReportDocument";
import { exportElementToPdf, printElementDirectly } from "@/services/pdfExportService";

export default function ParticipantReportPdfModal({
  isOpen,
  onClose,
  participant,
  session,
  stations = [],
  evaluations = [],
  nblCutoff = 72.4,
}) {
  const documentRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !participant) return null;

  const fileName = `Transkrip_OSCE_${(participant.nim || "PESERTA").replace(/\s+/g, "_")}_${(participant.name || "NILAI").replace(/\s+/g, "_")}.pdf`;

  async function handleDownloadPdf() {
    if (!documentRef.current) return;
    try {
      setDownloading(true);
      setDownloadSuccess(false);
      await exportElementToPdf(documentRef.current, {
        filename: fileName,
        format: "a4",
        orientation: "portrait",
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Gagal mengunduh PDF:", err);
    } finally {
      setDownloading(false);
    }
  }

  function handlePrint() {
    printElementDirectly();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[92vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden min-h-0">
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-4 text-white z-10">
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <span>📄</span>
              Pratinjau Transkrip Nilai OSCE ({participant.name})
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              NIM: {participant.nim || "-"} • Skor: {Number(participant.final_score || 0).toFixed(1)}% • Status: {participant.status || "Lulus"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              <Printer size={15} />
              Cetak
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Membuat PDF...
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-300" />
                  Tersimpan!
                </>
              ) : (
                <>
                  <Download size={15} />
                  Unduh PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Document Preview Area (Fully Scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center">
          <div className="w-full max-w-[210mm] shadow-2xl rounded-sm bg-white self-start my-2">
            <ParticipantReportDocument
              documentRef={documentRef}
              participant={participant}
              session={session}
              stations={stations}
              evaluations={evaluations}
              nblCutoff={nblCutoff}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
