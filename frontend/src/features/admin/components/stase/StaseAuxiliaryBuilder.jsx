import { Plus, Trash2 } from "lucide-react";

export default function StaseAuxiliaryBuilder({
  auxAnswerKey,
  setAuxAnswerKey,
  auxFiles = [],
  addAuxFile,
  removeAuxFile,
  updateAuxFile,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-black text-slate-900">
          Konfigurasi Pemeriksaan Penunjang (Candidate Step 3)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur kunci indikasi penunjang serta berkas hasil (Foto X-Ray, EKG, Hasil Lab) yang muncul saat diminta peserta.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Kunci Indikasi Pemeriksaan Penunjang (Kunci Baku Stase)
        </label>
        <textarea
          rows={3}
          value={auxAnswerKey}
          onChange={(e) => setAuxAnswerKey(e.target.value)}
          placeholder="Tuliskan daftar pemeriksaan penunjang yang berindikasi dan tepat..."
          className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed focus:border-blue-500 focus:outline-none font-semibold"
        />
      </div>

      {/* Auxiliary Files Management */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase">
            Daftar Berkas Lampiran Hasil Penunjang ({auxFiles.length} Berkas)
          </h3>
          <button
            type="button"
            onClick={addAuxFile}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition cursor-pointer"
          >
            <Plus size={15} />
            Tambah Berkas Penunjang
          </button>
        </div>

        <div className="space-y-3">
          {auxFiles.map((file, idx) => (
            <div
              key={file.id || idx}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                <span className="text-xs font-bold text-slate-900">
                  Berkas #{idx + 1}: {file.name || "Nama Berkas Belum Diisi"}
                </span>
                <button
                  type="button"
                  onClick={() => removeAuxFile(idx)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} /> Hapus
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Nama Berkas</label>
                  <input
                    type="text"
                    value={file.name}
                    onChange={(e) => updateAuxFile(idx, "name", e.target.value)}
                    placeholder="misal: EKG 12 Lead"
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Kategori Berkas</label>
                  <select
                    value={file.category}
                    onChange={(e) => updateAuxFile(idx, "category", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Radiologi">Radiologi (X-Ray / CT / USG)</option>
                    <option value="EKG">EKG / Elektrokardiogram</option>
                    <option value="Laboratorium">Laboratorium Darah / Urin</option>
                    <option value="Lainnya">Pemeriksaan Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Status Indikasi Medis</label>
                  <select
                    value={file.matched_key ? "true" : "false"}
                    onChange={(e) => updateAuxFile(idx, "matched_key", e.target.value === "true")}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-bold"
                  >
                    <option value="true">Kunci Indikasi (Matched Key)</option>
                    <option value="false">Non-Indikasi (Tambahan)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">URL Berkas Gambar / PDF Hasil / Link Storage</label>
                  <input
                    type="text"
                    value={file.image_url || file.file_url || ""}
                    onChange={(e) => updateAuxFile(idx, "file_url", e.target.value)}
                    placeholder="https://images.unsplash.com/... atau URL berkas hasil"
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Catatan Laporan / Ekspertise Medis Teks</label>
                  <input
                    type="text"
                    value={file.report_text || file.reportText || ""}
                    onChange={(e) => updateAuxFile(idx, "report_text", e.target.value)}
                    placeholder="misal: ST Elevation pada Lead V1-V4 (STEMI Anteroseptal)"
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
