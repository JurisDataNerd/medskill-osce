import { Plus, Trash2, Info } from "lucide-react";

export default function CaseRubricTab({
  rubricItems = [],
  handleAddRubricItem,
  requestRemoveRubricItem,
  handleUpdateRubricField,
  handleUpdateRubricDescriptor,
}) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Checklist Rubrik Penilaian SKDI</h3>
          <p className="text-xs text-slate-500">Konfigurasi indikator penilaian dengan skor 0-3 dan deskriptor kinerja 4-level.</p>
        </div>
        <button
          onClick={handleAddRubricItem}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
        >
          <Plus size={15} />
          Tambah Indikator Rubrik
        </button>
      </div>

      <div className="space-y-6">
        {rubricItems.map((item, idx) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-800">Indikator #{idx + 1}</span>
              </div>

              <button
                type="button"
                onClick={() => requestRemoveRubricItem(idx)}
                className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={14} /> Hapus
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Indikator Penilaian</label>
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => handleUpdateRubricField(idx, "question", e.target.value)}
                  placeholder="Misal: Anamnesis terarah PQRST nyeri dada"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Area Kompetensi SKDI</label>
                <select
                  value={item.competency_area || "ANAMNESIS"}
                  onChange={(e) => handleUpdateRubricField(idx, "competency_area", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
                >
                  <option value="ANAMNESIS">ANAMNESIS</option>
                  <option value="PHYSICAL_EXAM">PHYSICAL_EXAM</option>
                  <option value="AUXILIARY_EXAM">AUXILIARY_EXAM</option>
                  <option value="DIAGNOSIS_DDX">DIAGNOSIS_DDX</option>
                  <option value="PHARMACOTHERAPY">PHARMACOTHERAPY</option>
                  <option value="NON_PHARMACOTHERAPY">NON_PHARMACOTHERAPY</option>
                  <option value="COMMUNICATION">COMMUNICATION</option>
                  <option value="PROFESSIONALISM">PROFESSIONALISM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pedoman Skor Maksimal</label>
              <input
                type="text"
                value={item.answer_key}
                onChange={(e) => handleUpdateRubricField(idx, "answer_key", e.target.value)}
                placeholder="Pedoman skor maksimal 3..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
              />
            </div>

            {/* 4-Level Descriptors */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Info size={14} className="text-blue-600" />
                Deskriptor Kinerja Penilaian
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <span className="block text-[11px] font-bold text-red-600 mb-1">Skor 0 (Tidak Dilakukan)</span>
                  <input
                    type="text"
                    value={item.descriptors?.score_0 || ""}
                    onChange={(e) => handleUpdateRubricDescriptor(idx, "score_0", e.target.value)}
                    placeholder="Deskripsi skor 0..."
                    className="w-full rounded-lg border border-red-200 p-2 text-xs bg-red-50/30"
                  />
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-amber-600 mb-1">Skor 1 (Kurang Lengkap)</span>
                  <input
                    type="text"
                    value={item.descriptors?.score_1 || ""}
                    onChange={(e) => handleUpdateRubricDescriptor(idx, "score_1", e.target.value)}
                    placeholder="Deskripsi skor 1..."
                    className="w-full rounded-lg border border-amber-200 p-2 text-xs bg-amber-50/30"
                  />
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-blue-600 mb-1">Skor 2 (Cukup Lengkap)</span>
                  <input
                    type="text"
                    value={item.descriptors?.score_2 || ""}
                    onChange={(e) => handleUpdateRubricDescriptor(idx, "score_2", e.target.value)}
                    placeholder="Deskripsi skor 2..."
                    className="w-full rounded-lg border border-blue-200 p-2 text-xs bg-blue-50/30"
                  />
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-emerald-600 mb-1">Skor 3 (Lengkap & Tepat)</span>
                  <input
                    type="text"
                    value={item.descriptors?.score_3 || ""}
                    onChange={(e) => handleUpdateRubricDescriptor(idx, "score_3", e.target.value)}
                    placeholder="Deskripsi skor 3..."
                    className="w-full rounded-lg border border-emerald-200 p-2 text-xs bg-emerald-50/30"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
