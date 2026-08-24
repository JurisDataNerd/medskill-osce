import AdminAuxiliaryExamBuilder from "@/features/admin/components/AdminAuxiliaryExamBuilder";

export default function CaseAuxiliaryTab({
  auxAnswerKey,
  setAuxAnswerKey,
  auxiliaryConfigs = [],
  setAuxiliaryConfigs,
}) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
          Kunci Indikasi Pemeriksaan Penunjang (Kunci Baku Stase)
        </label>
        <textarea
          rows={3}
          value={auxAnswerKey || ""}
          onChange={(e) => setAuxAnswerKey && setAuxAnswerKey(e.target.value)}
          placeholder="Tuliskan daftar pemeriksaan penunjang yang berindikasi dan tepat..."
          className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed focus:border-blue-500 focus:outline-none font-semibold bg-white"
        />
      </div>

      <AdminAuxiliaryExamBuilder
        configs={auxiliaryConfigs}
        onChangeConfigs={setAuxiliaryConfigs}
      />
    </div>
  );
}
