import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, Stethoscope, X } from "lucide-react";

export default function SearchableSelectMenu({
  options = [],
  value = null,
  onChange,
  placeholder = "Pilih Dokter Penguji...",
  searchPlaceholder = "Cari nama atau spesialisasi dokter...",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => {
    const q = searchQuery.toLowerCase();
    const name = (opt.name || opt.label || "").toLowerCase();
    const specialty = (opt.specialty || opt.sublabel || "").toLowerCase();
    return name.includes(q) || specialty.includes(q);
  });

  const selectedOption = options.find(
    (opt) => opt.id === value?.id || opt.id === value
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Select Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-800 shadow-2xs transition hover:border-blue-400 focus:border-blue-600 focus:outline-none"
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption ? (
            <>
              {selectedOption.img_url ? (
                <img
                  src={selectedOption.img_url}
                  alt={selectedOption.name}
                  className="h-6 w-6 rounded-lg object-cover border border-slate-200"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-[10px]">
                  <Stethoscope size={13} />
                </div>
              )}
              <span className="font-extrabold text-slate-900 truncate">
                {selectedOption.name || selectedOption.label}
              </span>
              <span className="text-[11px] text-blue-600 font-medium truncate">
                ({selectedOption.specialty || selectedOption.sublabel})
              </span>
            </>
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Input Field */}
          <div className="relative mb-2">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 py-2 pl-8 pr-8 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs font-medium text-slate-400">
                Tidak ada dokter penguji yang cocok dengan pencarian.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedOption?.id === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-medium cursor-pointer transition ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 font-bold border border-blue-200/80"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {opt.img_url ? (
                        <img
                          src={opt.img_url}
                          alt={opt.name}
                          className="h-7 w-7 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                          <Stethoscope size={14} />
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-extrabold text-slate-900 truncate">
                          {opt.name || opt.label}
                        </div>
                        <div className="text-[11px] text-blue-600 font-semibold truncate">
                          {opt.specialty || opt.sublabel}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={16} className="text-blue-600 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
