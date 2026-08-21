import AdminAuxiliaryExamBuilder from "@/features/admin/components/AdminAuxiliaryExamBuilder";

export default function CaseAuxiliaryTab({
  auxiliaryConfigs = [],
  setAuxiliaryConfigs,
}) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <AdminAuxiliaryExamBuilder
        configs={auxiliaryConfigs}
        onChangeConfigs={setAuxiliaryConfigs}
      />
    </div>
  );
}
