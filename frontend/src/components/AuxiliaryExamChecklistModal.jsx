import { useState, useMemo } from "react";
import {
  X,
  Search,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Filter,
  FileCheck2,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import {
  AUXILIARY_EXAM_CATALOG,
  getAllAuxiliaryExamItems,
} from "@/features/participant/data/auxiliaryExamsCatalog";

export default function AuxiliaryExamChecklistModal({
  isOpen,
  onClose,
  onSubmit,
  initialSelected = [],
  mode = "participant",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(initialSelected);
  const [expandedCategories, setExpandedCategories] = useState(() => {
    // Default open first category (RADIOLOGI)
    const initial = {};
    if (AUXILIARY_EXAM_CATALOG.length > 0) {
      initial[AUXILIARY_EXAM_CATALOG[0].category] = true;
    }
    return initial;
  });

  const allItems = useMemo(() => getAllAuxiliaryExamItems(), []);

  // Filtered catalog based on search
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return AUXILIARY_EXAM_CATALOG;

    const q = searchQuery.toLowerCase();
    return AUXILIARY_EXAM_CATALOG.map((cat) => {
      const matchingSub = cat.subcategories
        .map((sub) => {
          const matchingItems = sub.items.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              item.id.toLowerCase().includes(q) ||
              sub.name.toLowerCase().includes(q) ||
              cat.category.toLowerCase().includes(q)
          );
          return { ...sub, items: matchingItems };
        })
        .filter((sub) => sub.items.length > 0);

      return { ...cat, subcategories: matchingSub };
    }).filter((cat) => cat.subcategories.length > 0);
  }, [searchQuery]);

  if (!isOpen) return null;

  const toggleSelect = (itemId) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleCategoryExpand = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const handleSelectAllCategory = (cat) => {
    const catItemIds = [];
    cat.subcategories.forEach((sub) => {
      sub.items.forEach((item) => catItemIds.push(item.id));
    });

    const allCatSelected = catItemIds.every((id) => selectedIds.includes(id));

    if (allCatSelected) {
      // Uncheck all in category
      setSelectedIds((prev) => prev.filter((id) => !catItemIds.includes(id)));
    } else {
      // Select all in category
      setSelectedIds((prev) => Array.from(new Set([...prev, ...catItemIds])));
    }
  };

  const handleReset = () => {
    setSelectedIds([]);
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(selectedIds);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-4xl max-h-[85vh] rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <span className="text-lg font-black text-white leading-none">P</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {mode === "admin"
                  ? "Atur Kunci Jawaban Pemeriksaan Penunjang"
                  : "Formulir Permintaan Pemeriksaan Penunjang"}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Checklist Baku OSCE • {allItems.length} Jenis Pemeriksaan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Counter Bar */}
        <div className="border-b border-slate-200 bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari jenis pemeriksaan (misal: Thorax, EKG, CBC, SGOT)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-9 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Selection Counter Badge & Clear Button */}
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700">
                {selectedIds.length} Dipilih
              </span>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleReset}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                >
                  Reset Pilihan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Catalog Accordion List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {filteredCatalog.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <AlertCircle size={32} className="mx-auto text-amber-500" />
              <p className="text-sm font-bold text-slate-800">
                Pemeriksaan "{searchQuery}" tidak ditemukan
              </p>
              <p className="text-xs text-slate-500">
                Coba gunakan kata kunci pencarian lain.
              </p>
            </div>
          ) : (
            filteredCatalog.map((cat) => {
              const isSearchActive = !!searchQuery.trim();
              const isExpanded = isSearchActive || expandedCategories[cat.category];

              // Count selected in this category
              let totalCatItems = 0;
              let selectedCatItems = 0;
              cat.subcategories.forEach((sub) => {
                sub.items.forEach((item) => {
                  totalCatItems++;
                  if (selectedIds.includes(item.id)) selectedCatItems++;
                });
              });

              return (
                <div
                  key={cat.category}
                  className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition"
                >
                  {/* Category Header */}
                  <div
                    onClick={() => toggleCategoryExpand(cat.category)}
                    className="flex items-center justify-between bg-slate-100/80 px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-slate-500" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-500" />
                      )}
                      <span className="text-xs font-black tracking-wider text-slate-900">
                        {cat.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {selectedCatItems > 0 && (
                        <span className="rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                          {selectedCatItems} / {totalCatItems} Dipilih
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAllCategory(cat);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        {selectedCatItems === totalCatItems ? "Batal Semua" : "Pilih Semua"}
                      </button>
                    </div>
                  </div>

                  {/* Category Body (Subcategories & Checkboxes) */}
                  {isExpanded && (
                    <div className="p-4 space-y-4 border-t border-slate-100">
                      {cat.subcategories.map((sub, sIdx) => (
                        <div key={sIdx} className="space-y-2">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                            {sub.name}
                          </h4>

                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {sub.items.map((item) => {
                              const isChecked = selectedIds.includes(item.id);
                              return (
                                <label
                                  key={item.id}
                                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition ${
                                    isChecked
                                      ? "border-blue-500 bg-blue-50/70 text-blue-900 font-semibold shadow-2xs"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleSelect(item.id)}
                                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 shrink-0"
                                  />
                                  <span className="leading-snug">{item.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <p className="text-xs text-slate-500 font-medium">
            {selectedIds.length === 0
              ? "Pilih minimal 1 pemeriksaan penunjang"
              : `${selectedIds.length} pemeriksaan siap diajukan`}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FileCheck2 size={16} />
              {mode === "admin" ? "Simpan Kunci Jawaban" : "Minta Hasil Pemeriksaan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
