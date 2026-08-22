import { Plus, Trash2 } from "lucide-react";

export default function StaseDiagnosisRecipeBuilder({
  wdxKey,
  setWdxKey,
  ddxKeys = [],
  addDdxKey,
  removeDdxKey,
  updateDdxKey,
  recipeKey,
  setRecipeKey,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-black text-slate-900">
          Kunci Jawaban Baku Diagnosis & Resep (Candidate Step 4)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tentukan kunci diagnosis kerja (WDx), diagnosis banding (DDx), dan lembar resep medis baku sebagai acuan pembanding penguji.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          1. Kunci Diagnosis Kerja Baku (Working Diagnosis - WDx)
        </label>
        <textarea
          rows={3}
          value={wdxKey}
          onChange={(e) => setWdxKey(e.target.value)}
          placeholder="Tuliskan kunci diagnosis kerja utama (WDx) secara lengkap..."
          className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none leading-relaxed"
        />
      </div>

      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            2. Kunci Diagnosis Banding Baku (Differential Diagnosis - DDx)
          </label>
          <button
            type="button"
            onClick={addDdxKey}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} /> Tambah DDx
          </button>
        </div>

        <div className="space-y-3">
          {ddxKeys.map((ddx, dIdx) => (
            <div key={dIdx} className="flex items-start gap-2">
              <span className="text-xs font-bold text-slate-400 w-6 mt-2.5">{dIdx + 1}.</span>
              <textarea
                rows={2}
                value={ddx}
                onChange={(e) => updateDdxKey(dIdx, e.target.value)}
                placeholder={`Tuliskan kunci diagnosis banding #${dIdx + 1} (DDx ${dIdx + 1})...`}
                className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-semibold focus:border-blue-500 focus:outline-none leading-relaxed"
              />
              <button
                type="button"
                onClick={() => removeDdxKey(dIdx)}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg mt-1 cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          3. Kunci Penulisan Resep Medis Baku (Prescription Sheet Key)
        </label>
        <textarea
          rows={6}
          value={recipeKey}
          onChange={(e) => setRecipeKey(e.target.value)}
          placeholder="Tuliskan format penulisan resep obat baku lengkap beserta dosis & signa..."
          className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 font-mono whitespace-pre-line leading-relaxed focus:border-blue-500 focus:outline-none font-semibold"
        />
      </div>
    </div>
  );
}
