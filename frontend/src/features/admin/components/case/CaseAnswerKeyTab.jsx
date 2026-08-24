import { Award, Plus, Trash2 } from "lucide-react";

export default function CaseAnswerKeyTab({
  wdxKey,
  setWdxKey,
  ddxKeys = [],
  addDdxKey,
  removeDdxKey,
  updateDdxKey,
  recipeKey,
  setRecipeKey,
  answerKeyDiagnosis,
  setAnswerKeyDiagnosis,
  answerKeyPrescription,
  setAnswerKeyPrescription,
}) {
  const currentWdx = wdxKey !== undefined ? wdxKey : answerKeyDiagnosis || "";
  const currentRecipe = recipeKey !== undefined ? recipeKey : answerKeyPrescription || "";

  const handleWdxChange = (val) => {
    if (setWdxKey) setWdxKey(val);
    if (setAnswerKeyDiagnosis) setAnswerKeyDiagnosis(val);
  };

  const handleRecipeChange = (val) => {
    if (setRecipeKey) setRecipeKey(val);
    if (setAnswerKeyPrescription) setAnswerKeyPrescription(val);
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3">
        <Award size={20} className="shrink-0 text-blue-600 mt-0.5" />
        <div>
          <span className="font-bold">Kunci Jawaban Baku (Candidate Step 4):</span> Kunci diagnosis kerja (WDx), diagnosis banding (DDx), dan resep obat baku ini akan tampil di layar dokter penguji saat pengujian stase berlangsung.
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
          1. Kunci Diagnosis Kerja Utama Baku (Working Diagnosis - WDx)
        </label>
        <textarea
          rows={3}
          value={currentWdx}
          onChange={(e) => handleWdxChange(e.target.value)}
          placeholder="Contoh: STEMI Anteroseptal Akut (ICD-10: I21.0)"
          className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none leading-relaxed bg-white"
        />
      </div>

      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
          <label className="block text-xs font-bold text-slate-800 uppercase">
            2. Kunci Diagnosis Banding Baku (Differential Diagnosis - DDx)
          </label>
          {addDdxKey && (
            <button
              type="button"
              onClick={addDdxKey}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} /> Tambah DDx
            </button>
          )}
        </div>

        <div className="space-y-3">
          {ddxKeys.map((ddx, dIdx) => (
            <div key={dIdx} className="flex items-start gap-2">
              <span className="text-xs font-bold text-slate-400 w-6 mt-2.5">{dIdx + 1}.</span>
              <textarea
                rows={2}
                value={ddx}
                onChange={(e) => updateDdxKey && updateDdxKey(dIdx, e.target.value)}
                placeholder={`Tuliskan kunci diagnosis banding #${dIdx + 1} (DDx ${dIdx + 1})...`}
                className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-semibold focus:border-blue-500 focus:outline-none leading-relaxed bg-white"
              />
              {removeDdxKey && (
                <button
                  type="button"
                  onClick={() => removeDdxKey(dIdx)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg mt-1 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
          {ddxKeys.length === 0 && (
            <p className="text-xs text-slate-400 italic">Belum ada item diagnosis banding (DDx). Klik "+ Tambah DDx" di atas.</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
          3. Kunci Penulisan Resep Medis Baku (Prescription Sheet Key)
        </label>
        <textarea
          rows={5}
          value={currentRecipe}
          onChange={(e) => handleRecipeChange(e.target.value)}
          placeholder="Contoh:&#10;R/ Aspirin tab 80mg No. IV S 1 dd tab IV (chewed)&#10;R/ Clopidogrel tab 75mg No. IV S 1 dd tab IV&#10;R/ ISDN tab 5mg No. III S 1 dd tab I sublingual"
          className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
