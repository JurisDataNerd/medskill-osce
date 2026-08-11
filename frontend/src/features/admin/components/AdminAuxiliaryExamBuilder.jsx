import { useState } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  Image,
  Upload,
  X,
  CheckCircle2,
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
        <div className="grid gap-3 sm:grid-cols-2">
          {configs.map((item, idx) => (
            <div
              key={item.itemId}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 transition hover:border-blue-300 shadow-2xs"
            >
              {/* Top Row: Item Name, Category, Delete */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-[11px] font-extrabold text-white shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
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
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-slate-200 shrink-0"
                  title="Hapus dari Kunci Jawaban"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Image & Google Drive Upload / URL Section */}
              <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2.5">
                <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Image size={14} className="text-blue-600" />
                  Lampiran Hasil (Upload / Direct URL / Link Google Drive)
                </label>

                {item.imageUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="relative group h-16 w-24 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                      {item.imageUrl.includes("drive.google.com") || item.imageUrl.includes("docs.google.com") ? (
                        <div className="p-2 text-center text-[10px] font-bold text-blue-700 bg-blue-50 h-full w-full flex flex-col items-center justify-center">
                          <FileText size={16} className="text-blue-600 mb-0.5" />
                          <span>Google Drive</span>
                        </div>
                      ) : (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleUpdateConfig(item.itemId, "imageUrl", "")}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow-xs"
                        title="Hapus Link / Gambar"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div className="flex-1 space-y-1">
                      <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        {item.imageUrl.includes("drive.google.com") ? "Google Drive Link Terlampir (Iframe Supported)" : "Berkas Terlampir"}
                      </p>
                      <input
                        type="text"
                        placeholder="URL Gambar / Link Google Drive..."
                        value={item.imageUrl}
                        onChange={(e) => handleUpdateConfig(item.itemId, "imageUrl", e.target.value)}
                        className="w-full rounded-md border border-slate-200 p-1.5 text-[11px] text-slate-600 truncate"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {/* Upload File Input */}
                    <label className="flex items-center justify-center gap-2 cursor-pointer rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-2.5 text-center text-xs font-bold text-blue-700 hover:bg-blue-100/60 transition">
                      <Upload size={14} />
                      <span>Upload Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              handleUpdateConfig(item.itemId, "imageUrl", evt.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {/* Input Direct URL */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Paste URL Gambar / Google Drive..."
                        value={item.imageUrl || ""}
                        onChange={(e) => handleUpdateConfig(item.itemId, "imageUrl", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-2 text-[11px] text-slate-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Report / Ekspertise Text Input */}
                <div className="pt-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Hasil Laporan / Ekspertise Medis Teks
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: EKG ST Elevation V1-V4 atau Foto Thorax Pneumothorax..."
                    value={item.reportText || ""}
                    onChange={(e) => handleUpdateConfig(item.itemId, "reportText", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-medium text-slate-800 focus:border-blue-500"
                  />
                </div>
              </div>
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
