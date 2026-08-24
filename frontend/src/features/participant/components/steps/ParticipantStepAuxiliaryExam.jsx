import { Search, X, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";

export default function ParticipantStepAuxiliaryExam({
  checkedAuxiliaryIds = [],
  onToggleAuxiliaryCheckbox,
  onResetChecked,
  auxSearchQuery,
  setAuxSearchQuery,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  expandedCategories = {},
  setExpandedCategories,
  filteredCatalog = [],
  onSubmitAuxiliaryRequests,
}) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-xs space-y-6">
      {/* Header Title */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
            Tahap 3 dari 4
          </span>
          <h2 className="text-base font-black text-slate-900 mt-1 uppercase tracking-wider">
            Pengujian Pemeriksaan Penunjang
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centang jenis pemeriksaan penunjang yang diindikasikan untuk mengajukan dan membuka berkas hasil medis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold px-3 py-1">
            {checkedAuxiliaryIds.length} Dipilih
          </span>
          {checkedAuxiliaryIds.length > 0 && (
            <button
              type="button"
              onClick={onResetChecked}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Control Topbar (Searchbar & Dropdown Category Filter) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
        {/* Searchbar Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari pemeriksaan (Thorax, EKG, Troponin, CBC)..."
            value={auxSearchQuery}
            onChange={(e) => setAuxSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none transition"
          />
          {auxSearchQuery && (
            <button
              onClick={() => setAuxSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Category Filter */}
        <div className="flex items-center gap-2 min-w-[180px]">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-500 focus:outline-none transition cursor-pointer"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="RADIOLOGI">Radiologi</option>
            <option value="HEMATOLOGI">Hematologi</option>
            <option value="ENZIM">Enzim / Biomarker</option>
            <option value="LAIN-LAIN">Lain-Lain (EKG, dll.)</option>
          </select>
        </div>
      </div>

      {/* Full Width Grid Checklist Area */}
      <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
        {filteredCatalog.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            Pemeriksaan "{auxSearchQuery}" tidak ditemukan.
          </div>
        ) : (
          filteredCatalog.map((cat) => {
            const isExpanded = expandedCategories[cat.category] ?? true;

            return (
              <div
                key={cat.category}
                className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden"
              >
                {/* Accordion Category Header */}
                <div
                  onClick={() =>
                    setExpandedCategories((prev) => ({
                      ...prev,
                      [cat.category]: !isExpanded,
                    }))
                  }
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
                </div>

                {/* Accordion Items Body (2-Column Grid Style) */}
                {isExpanded && (
                  <div className="p-4 space-y-4 border-t border-slate-100 bg-slate-50/40">
                    {cat.subcategories.map((sub, sIdx) => (
                      <div key={sIdx} className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200/60 pb-1">
                          {sub.name}
                        </span>

                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {sub.items.map((item) => {
                            const isChecked = checkedAuxiliaryIds.includes(item.id);
                            return (
                              <label
                                key={item.id}
                                className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-medium cursor-pointer transition ${
                                  isChecked
                                    ? "border-indigo-500 bg-indigo-50/80 text-indigo-950 font-extrabold shadow-2xs"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => onToggleAuxiliaryCheckbox(item.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                                />
                                <span className="leading-snug flex-1">{item.name}</span>
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

      {/* Navigation Action CTA */}
      <div className="pt-2 flex justify-end border-t border-slate-100">
        <button
          type="button"
          onClick={onSubmitAuxiliaryRequests}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
        >
          <span>Lanjutkan ke Diagnosis & Resep</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
