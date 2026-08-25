import { useState, useEffect } from "react";
import {
  X,
  Search,
  Filter,
  BookOpen,
  CheckCircle2,
  Award,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { fetchQuestionBankCatalog } from "@/services/questionBankService";
import { SYSTEM_ORGAN_LIST } from "@/constants/medicalSystems";

export default function QuestionBankSelectModal({
  isOpen,
  onClose,
  onSelectCase,
}) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgan, setSelectedOrgan] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  useEffect(() => {
    async function loadCatalog() {
      if (!isOpen) return;
      try {
        setLoading(true);
        const data = await fetchQuestionBankCatalog();
        if (data && data.length > 0) {
          const normalized = data.map((item) => {
            const wdx = item.answer_key_wdx || item.answer_key_diagnosis || item.wdx || item.gold_standard_keys?.wdx || "";
            const ddx1 = item.answer_key_ddx1 || (Array.isArray(item.gold_standard_keys?.ddx) ? item.gold_standard_keys.ddx[0] : "") || (item.answer_key_ddx ? item.answer_key_ddx.split(",")[0]?.trim() : "") || "";
            const ddx2 = item.answer_key_ddx2 || (Array.isArray(item.gold_standard_keys?.ddx) ? item.gold_standard_keys.ddx[1] : "") || (item.answer_key_ddx ? item.answer_key_ddx.split(",")[1]?.trim() : "") || "";
            const ddx3 = item.answer_key_ddx3 || (Array.isArray(item.gold_standard_keys?.ddx) ? item.gold_standard_keys.ddx[2] : "") || (item.answer_key_ddx ? item.answer_key_ddx.split(",")[2]?.trim() : "") || "";
            const prescription = item.answer_key_prescription || item.recipe || item.gold_standard_keys?.recipe || "";

            return {
              ...item,
              case_title: item.case_title || item.title,
              answer_key_wdx: wdx,
              answer_key_ddx1: ddx1,
              answer_key_ddx2: ddx2,
              answer_key_ddx3: ddx3,
              answer_key_diagnosis: item.answer_key_diagnosis || wdx,
              answer_key_prescription: prescription,
              answer_key_ddx: item.answer_key_ddx || [ddx1, ddx2, ddx3].filter(Boolean).join(", "),
              checklist_items:
                item.checklist_items ||
                (item.question_bank_rubric_items || []).map((r) => ({
                  id: r.id,
                  question: r.question,
                  answer_key: r.answer_key,
                  max_points: r.max_points || 3,
                  weight: r.weight || 1.0,
                  competency_area: r.competency_area,
                  descriptors: r.descriptors,
                })),
              auxiliary_exam_configs:
                item.auxiliary_exam_configs ||
                (item.question_bank_auxiliary_configs || []).map((a) => ({
                  itemId: a.item_id,
                  name: a.name,
                  category: a.category,
                  imageUrl: a.image_storage_path,
                  reportText: a.report_text,
                })),
            };
          });
          setCatalog(normalized);
        } else {
          setCatalog([]);
        }
      } catch (err) {
        console.error("Error fetching question bank catalog from Supabase:", err);
        setCatalog([]);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, [isOpen]);

  if (!isOpen) return null;

  const organCategories = [
    "ALL",
    "Kardiovaskular",
    "Respirasi",
    "Bedah Umum",
    "Neurologi",
    "Endokrin",
    "THT-KL",
    "Pediatri",
    "Digestif",
    "Saraf",
    "Psikiatri",
    "Indera",
    "Respirasi",
    "Kardiovaskular",
    "GEH",
    "Ginjal dan Saluran kemih",
    "Hemato, Imunologi, dan Infeksi",
    "Muskuloskeletal",
    "Integumen"
  ];

  const filteredCases = catalog.filter((item) => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.scenario || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.system_organ || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOrgan =
      selectedOrgan === "ALL" || item.system_organ === selectedOrgan;

    return matchesSearch && matchesOrgan;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 font-bold">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Pilih Kasus Medis
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                  {catalog.length} Kasus Terdaftar
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih paket soal medis terstandar untuk mengisi skenario, instruksi, dan rubrik penilaian.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-3 shrink-0">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-3 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul kasus, kata kunci skenario, atau sistem organ..."
              className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
            />
          </div>

          {/* Organ Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1 mr-1 shrink-0">
              <Filter size={13} /> Filter Organ:
            </span>
            {organCategories.map((org) => (
              <button
                key={org}
                type="button"
                onClick={() => setSelectedOrgan(org)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition shrink-0 border ${selectedOrgan === org
                    ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
              >
                {org === "ALL" ? "Semua Organ" : org}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog List Scrollable Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[250px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-56 text-slate-400 space-y-2">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Memuat Bank Soal...</span>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-xs text-slate-500 space-y-2 my-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-1">
                <AlertCircle size={24} />
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {catalog.length === 0
                  ? "Belum Ada Soal di Bank Soal"
                  : "Tidak Ada Kasus Medis Sesuai Pencarian"}
              </p>
              <p className="max-w-md text-slate-500">
                {catalog.length === 0
                  ? "Soal medis baku yang Anda buat di menu Bank Soal Admin akan muncul di sini secara otomatis."
                  : "Coba ubah kata kunci pencarian atau pilih filter kategori organ lain."}
              </p>
            </div>
          ) : (
            filteredCases.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-400 hover:bg-white hover:shadow-md space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-blue-100 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-900">
                        {item.system_organ || "Umum"}
                      </span>
                      <span className="rounded-md bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-900">
                        SKDI {item.skdi_level || "4A"}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 ml-auto sm:ml-0">
                        <Award size={13} className="text-blue-600" />
                        {(item.checklist_items || item.question_bank_rubric_items || []).length} Item Rubrik
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition">
                      {item.title || item.case_title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.scenario}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectCase(item);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition shrink-0"
                  >
                    <Sparkles size={14} />
                    Gunakan Soal Ini
                  </button>
                </div>

                {/* Rubrik Preview Snippet */}
                {item.checklist_items && item.checklist_items.length > 0 && (
                  <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-[11px] space-y-1.5">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                      Pratinjau Item Rubrik:
                    </span>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {item.checklist_items.slice(0, 2).map((chk, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 border border-slate-100 p-2"
                        >
                          <span className="truncate text-slate-800 font-medium">
                            #{idx + 1} {chk.question || chk.item}
                          </span>
                          <span className="font-bold text-blue-700 shrink-0">
                            {chk.max_points || 3} Poin
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 pt-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
