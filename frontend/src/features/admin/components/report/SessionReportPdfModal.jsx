import { useRef, useState } from "react";
import { X, Download, Loader2, CheckCircle2 } from "lucide-react";
import SessionReportDocument from "./SessionReportDocument";
import { exportElementToPdf } from "@/services/pdfExportService";

export default function SessionReportPdfModal({
  isOpen,
  onClose,
  session,
  stations = [],
  participantsData = [],
  evaluations = [],
  regressionData = null,
  nblCutoff = null,
  passRate = null,
  passedCount = 0,
}) {
  const documentRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !session) return null;

  const fileName = `Berita_Acara_Rekap_OSCE_${(session.title || "Sesi").replace(/\s+/g, "_")}.pdf`;

  async function handleDownloadPdf() {
    if (!documentRef.current) return;
    try {
      setDownloading(true);
      setDownloadSuccess(false);
      await exportElementToPdf(documentRef.current, {
        filename: fileName,
        format: "a4",
        orientation: "landscape",
        margin: [6, 6, 6, 6],
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Gagal mengunduh Berita Acara PDF:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[92vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden min-h-0">
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-4 text-white z-10">
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <span>📄</span>
              Pratinjau Berita Acara & Rekapitulasi Hasil OSCE ({session.title})
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {stations.length} Pos Stase • {participantsData.length} Mahasiswa Peserta • Tingkat Kelulusan: {passRate !== null ? `${passRate}%` : "Belum Dievaluasi"}
            </p>
          </div>

          <div className="flex items-center gap-2">
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
                  Cetak / Unduh Berita Acara (PDF)
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Document Preview Area (Scrollable A4 Landscape) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center">
          <div className="w-full max-w-[297mm] shadow-2xl rounded-sm bg-white self-start my-2 overflow-x-auto">
            <SessionReportDocument
              documentRef={documentRef}
              session={session}
              stations={stations}
              participantsData={participantsData}
              evaluations={evaluations}
              regressionData={regressionData}
              nblCutoff={nblCutoff}
              passRate={passRate}
              passedCount={passedCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
