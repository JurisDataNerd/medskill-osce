import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  Download,
  Layers,
  FlaskConical,
  Loader2,
} from "lucide-react";
import {
  importQuestionBankBulk,
  downloadQuestionBankTemplateJson,
} from "@/services/case.service";
import { toast } from "sonner";

export default function QuestionBankImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [parsedCases, setParsedCases] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  function resetState() {
    setFile(null);
    setParsedCases([]);
    setParseError(null);
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    if (importing) return;
    resetState();
    onClose();
  }

  function handleFileProcess(selectedFile) {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".json")) {
      setParseError("File harus berformat .JSON");
      setParsedCases([]);
      return;
    }

    setFile(selectedFile);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target.result);
        const casesArray = Array.isArray(content) ? content : [content];

        if (casesArray.length === 0) {
          throw new Error("File JSON tidak memiliki data kasus apapun.");
        }

        // Validate basic properties
        const validated = casesArray.map((c, idx) => {
          if (!c.title && !c.case_title) {
            throw new Error(
              `Kasus pada urutan #${idx + 1} tidak memiliki judul ('title').`
            );
          }
          return c;
        });

        setParsedCases(validated);
        setParseError(null);
      } catch (err) {
        console.error("JSON parse error:", err);
        setParseError(
          `Gagal membaca format file JSON: ${err.message || "Format tidak sesuai"}`
        );
        setParsedCases([]);
      }
    };
    reader.readAsText(selectedFile);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  async function handleExecuteImport() {
    if (parsedCases.length === 0) return;

    try {
      setImporting(true);
      const result = await importQuestionBankBulk(parsedCases);

      if (result.successCount > 0) {
        toast.success(
          `Berhasil mengimpor ${result.successCount} kasus medis ke Bank Soal!`
        );
        if (result.failedCount > 0) {
          toast.warning(
            `${result.failedCount} kasus gagal diimpor. Silakan periksa log.`
          );
        }
        resetState();
        if (onImportSuccess) onImportSuccess();
        onClose();
      } else {
        toast.error("Semua kasus gagal diimpor. Periksa format data Anda.");
      }
    } catch (err) {
      console.error("Error bulk importing cases:", err);
      toast.error(`Gagal mengimpor: ${err.message}`);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Impor Bank Soal Massal (Bulk Import)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Unggah file JSON dari komputer untuk menambahkan banyak kasus sekaligus.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={importing}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Action Row: Template Download */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-950">
              <FileText size={16} className="text-blue-600 shrink-0" />
              <span>Belum memiliki format JSON yang sesuai?</span>
            </div>

            <button
              type="button"
              onClick={downloadQuestionBankTemplateJson}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 active:scale-95 transition cursor-pointer"
            >
              <Download size={13} />
              Unduh Template JSON
            </button>
          </div>

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
              dragActive
                ? "border-blue-500 bg-blue-50/50"
                : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => handleFileProcess(e.target.files[0])}
              className="hidden"
            />

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-2xs text-blue-600 mb-3 border border-slate-200">
              <Upload size={22} />
            </div>

            <p className="text-xs font-bold text-slate-800">
              {file ? file.name : "Klik atau seret file .JSON ke sini"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Mendukung file JSON array berisi skenario, rubrik penilaian, dan berkas penunjang.
            </p>
          </div>

          {/* Parse Error Alert */}
          {parseError && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Terjadi Kesalahan:</strong>
                {parseError}
              </div>
            </div>
          )}

          {/* Preview List of Valid Cases */}
          {parsedCases.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Pratinjau Kasus ({parsedCases.length} Kasus Siap Diimpor)
                </span>
                <button
                  type="button"
                  onClick={resetState}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Ganti File
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-white">
                {parsedCases.map((c, idx) => {
                  const rubricsCount = (c.rubric_items || c.checklist_items || []).length;
                  const auxCount = (c.auxiliary_configs || c.auxiliary_exam_configs || []).length;

                  return (
                    <div key={idx} className="p-3.5 text-xs hover:bg-slate-50 transition">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 line-clamp-1">
                          #{idx + 1}. {c.title || c.case_title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                            {c.system_organ || "Kardiovaskular"}
                          </span>
                          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            {c.skdi_level || "4A"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1.5">
                        <span className="flex items-center gap-1 font-medium">
                          <Layers size={13} className="text-slate-400" />
                          {rubricsCount} Item Rubrik
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <FlaskConical size={13} className="text-slate-400" />
                          {auxCount} Berkas Penunjang
                        </span>
                        {(c.wdx || c.answer_key_diagnosis) && (
                          <span className="line-clamp-1 italic text-slate-600">
                            WDx: {c.wdx || c.answer_key_diagnosis}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          <button
            type="button"
            onClick={handleClose}
            disabled={importing}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={parsedCases.length === 0 || importing}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {importing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Mengimpor {parsedCases.length} Kasus...
              </>
            ) : (
              <>
                <Upload size={15} />
                Impor Sekarang ({parsedCases.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
