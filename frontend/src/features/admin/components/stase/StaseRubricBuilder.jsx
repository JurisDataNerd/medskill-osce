import { Plus, Trash2 } from "lucide-react";

export default function StaseRubricBuilder({
  rubricItems = [],
  addRubricItem,
  removeRubricItem,
  updateRubricItem,
  updateDescriptor,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-black text-slate-900">
            Pengaturan Item Rubrik & Matriks Deskriptor Kriteria (0 - 3)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi item penilaian, bobot kompetensi, kunci baku, serta acuan deskriptor skor 0, 1, 2, dan 3.
          </p>
        </div>

        <button
          type="button"
          onClick={addRubricItem}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition cursor-pointer"
        >
          <Plus size={15} />
          Tambah Item Kompetensi
        </button>
      </div>

      <div className="space-y-6">
        {rubricItems.map((item, idx) => (
          <div
            key={item.id || idx}
            className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 shadow-2xs"
          >
            {/* Header Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Item Kompetensi #{idx + 1}
              </span>

              <button
                type="button"
                onClick={() => removeRubricItem(idx)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={14} /> Hapus Item
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pertanyaan / Prosedur Kompetensi
                </label>
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => updateRubricItem(idx, "question", e.target.value)}
                  placeholder="misal: 1. Anamnesis Terarah"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Area Kompetensi
                  </label>
                  <select
                    value={item.competency}
                    onChange={(e) => updateRubricItem(idx, "competency", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 font-medium focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Komunikasi & Edukasi">Komunikasi & Edukasi</option>
                    <option value="Anamnesis">Anamnesis</option>
                    <option value="Pemeriksaan Fisik">Pemeriksaan Fisik</option>
                    <option value="Pemeriksaan Penunjang">Pemeriksaan Penunjang</option>
                    <option value="Diagnosis & DDx">Diagnosis & DDx</option>
                    <option value="Tata Laksana & Resep">Tata Laksana & Resep</option>
                    <option value="Perilaku Profesional">Perilaku Profesional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bobot Soal
                  </label>
                  <select
                    value={item.weight}
                    onChange={(e) => updateRubricItem(idx, "weight", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
                  >
                    <option value={1}>1x (Standar)</option>
                    <option value={2}>2x (Sedang)</option>
                    <option value={3}>3x (Tinggi)</option>
                    <option value={4}>4x (Sangat Tinggi)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Kunci Jawaban & Prosedur Baku Penguji
              </label>
              <textarea
                rows={2}
                value={item.answer_key}
                onChange={(e) => updateRubricItem(idx, "answer_key", e.target.value)}
                placeholder="Tuliskan rangkuman kunci tindakan yang benar..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 leading-relaxed font-semibold focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Deskriptor Kriteria Level 0, 1, 2, 3 */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60">
              <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                Matriks Deskriptor Kriteria Penilaian (Level 0 - 3)
              </label>
              <div className="grid gap-2 sm:grid-cols-4">
                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-2.5 space-y-1">
                  <span className="text-[10px] font-black text-rose-900 block uppercase">
                    Skor 0 (Tidak Dilakukan)
                  </span>
                  <textarea
                    rows={3}
                    value={item.descriptors?.[0] || ""}
                    onChange={(e) => updateDescriptor(idx, 0, e.target.value)}
                    className="w-full rounded-lg border border-rose-200 bg-white p-2 text-[11px] text-rose-950 font-medium focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 space-y-1">
                  <span className="text-[10px] font-black text-amber-900 block uppercase">
                    Skor 1 (Minimal)
                  </span>
                  <textarea
                    rows={3}
                    value={item.descriptors?.[1] || ""}
                    onChange={(e) => updateDescriptor(idx, 1, e.target.value)}
                    className="w-full rounded-lg border border-amber-200 bg-white p-2 text-[11px] text-amber-950 font-medium focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-2.5 space-y-1">
                  <span className="text-[10px] font-black text-blue-900 block uppercase">
                    Skor 2 (Memadai)
                  </span>
                  <textarea
                    rows={3}
                    value={item.descriptors?.[2] || ""}
                    onChange={(e) => updateDescriptor(idx, 2, e.target.value)}
                    className="w-full rounded-lg border border-blue-200 bg-white p-2 text-[11px] text-blue-950 font-medium focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 space-y-1">
                  <span className="text-[10px] font-black text-emerald-900 block uppercase">
                    Skor 3 (Sempurna)
                  </span>
                  <textarea
                    rows={3}
                    value={item.descriptors?.[3] || ""}
                    onChange={(e) => updateDescriptor(idx, 3, e.target.value)}
                    className="w-full rounded-lg border border-emerald-200 bg-white p-2 text-[11px] text-emerald-950 font-medium focus:outline-none"
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
