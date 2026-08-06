import { useState } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";
import AuxiliaryExamChecklistModal from "@/components/AuxiliaryExamChecklistModal";
import { getAllAuxiliaryExamItems } from "@/features/participant/data/auxiliaryExamsCatalog";

export default function AdminAuxiliaryExamBuilder({
  configs = [],
  onChangeConfigs,
}) {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  const allItems = getAllAuxiliaryExamItems();

  const selectedItemIds = configs.map((c) => c.itemId);

  const handleSaveChecklist = (newSelectedIds) => {
    // Merge existing configs with new selection
    const updated = newSelectedIds.map((id) => {
      const existing = configs.find((c) => c.itemId === id);
      const itemInfo = allItems.find((i) => i.id === id);

      return (
        existing || {
          itemId: id,
          name: itemInfo ? itemInfo.name : id,
          category: itemInfo ? itemInfo.category : "PEMERIKSAAN",
          imageUrl: "",
          reportText: "",
        }
      );
    });

    if (onChangeConfigs) {
      onChangeConfigs(updated);
    }
  };

  const handleUpdateConfig = (itemId, field, value) => {
    const updated = configs.map((c) =>
      c.itemId === itemId ? { ...c, [field]: value } : c
    );
    if (onChangeConfigs) {
      onChangeConfigs(updated);
    }
  };

  const handleRemoveItem = (itemId) => {
    const updated = configs.filter((c) => c.itemId !== itemId);
    if (onChangeConfigs) {
      onChangeConfigs(updated);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare size={18} className="text-blue-600" />
            Konfigurasi Kunci Jawaban Pemeriksaan Penunjang
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Pilih daftar item pemeriksaan penunjang (EKG, Radiologi, Lab, dll.) yang wajib dicentang/diminta peserta pada stase ini.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsChecklistOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition active:scale-95"
        >
          <Plus size={15} />
          Pilih Checkbox Jawaban Soal
        </button>
      </div>

      {/* Selected Items Config List */}
      {configs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            Belum ada kunci jawaban pemeriksaan penunjang yang dipilih.
          </p>
          <p>
            Klik tombol <strong className="text-blue-600">"Pilih Checkbox Jawaban Soal"</strong> di atas untuk memilih dari 100+ checklist baku OSCE.
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {configs.map((item, idx) => (
            <div
              key={item.itemId}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition hover:border-blue-300"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-[11px] font-extrabold text-white shrink-0">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {item.name}
                  </h4>
                  <span className="inline-block rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 mt-0.5 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(item.itemId)}
                className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-slate-200 shrink-0 ml-2"
                title="Hapus dari Kunci Jawaban"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Checklist */}
      <AuxiliaryExamChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        onSubmit={handleSaveChecklist}
        initialSelected={selectedItemIds}
        mode="admin"
      />
    </div>
  );
}
