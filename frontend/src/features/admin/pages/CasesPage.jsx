import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Filter, BookOpen, Layers, Award } from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import CaseModal from "@/features/admin/components/CaseModal";
import ConfirmModal from "@/components/ConfirmModal";

import {
  getCases,
  createCase,
  updateCase,
  deleteCase,
} from "@/services/case.service";

export default function CasesPage() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgan, setSelectedOrgan] = useState("ALL");

  async function loadCases() {
    try {
      setLoading(true);
      const data = await getCases();
      setCases(data || []);
    } catch (err) {
      console.error("Error loading cases from Supabase:", err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, []);

  async function handleSave(payload) {
    if (selected) {
      try {
        await updateCase(selected.id, payload);
      } catch (e) {}
      setCases((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...c, ...payload } : c))
      );
    } else {
      const newObj = { id: `case-${Date.now()}`, ...payload };
      try {
        await createCase(payload);
      } catch (e) {}
      setCases((prev) => [newObj, ...prev]);
    }

    setOpen(false);
    setSelected(null);
  }

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetCaseToDelete, setTargetCaseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "" });

  function handleRequestDelete(caseItem) {
    setTargetCaseToDelete(caseItem);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!targetCaseToDelete) return;

    try {
      setDeleting(true);
      await deleteCase(targetCaseToDelete.id);
      setCases((prev) => prev.filter((c) => c.id !== targetCaseToDelete.id));
    } catch (e) {
      console.error("Error deleting case:", e);
      setAlertModal({
        isOpen: true,
        title: "Gagal Menghapus Kasus",
        message: "Terjadi kesalahan saat menghapus kasus medis dari database Supabase.",
      });
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setTargetCaseToDelete(null);
    }
  }

  const filteredCases = cases.filter((item) => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.chief_complaint || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.system_organ || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOrgan =
      selectedOrgan === "ALL" || item.system_organ === selectedOrgan;

    return matchesSearch && matchesOrgan;
  });

  return (
    <AdminLayout>
      {/* Top Banner Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Bank Soal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Koleksi kasus medis terstandar berdasarkan sistem organ dan tingkat kompetensi.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/cases/create")}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition cursor-pointer"
        >
          <Plus size={16} />
          Buat Kasus Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul kasus, keluhan, atau organ..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <span className="text-xs font-bold text-slate-500">
            Menampilkan {filteredCases.length} Kasus Medis
          </span>
        </div>

        {/* Organ Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-400 font-bold flex items-center gap-1 mr-1">
            <Filter size={13} /> Filter Organ:
          </span>
          {[
            "ALL",
            "Kardiovaskular",
            "Respirasi",
            "Neurologi",
            "Digestif",
            "Muskuloskeletal",
            "Endokrin",
            "Urologi",
            "Pediatri",
            "THT-KL",
          ].map((org) => (
            <button
              key={org}
              onClick={() => setSelectedOrgan(org)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition border ${
                selectedOrgan === org
                  ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {org === "ALL" ? "Semua Sistem Organ" : org}
            </button>
          ))}
        </div>
      </div>

      {/* Cases List */}
      <div className="grid gap-4">
        {filteredCases.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-semibold text-slate-500">
            Tidak ada kasus medis yang cocok dengan filter atau pencarian Anda.
          </div>
        ) : (
          filteredCases.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-blue-100 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-900">
                      {item.system_organ || "Kardiovaskular"}
                    </span>
                    <span className="rounded-md bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-900">
                      SKDI {item.skdi_level || "4A (Tuntas Mandiri)"}
                    </span>
                  </div>

                  <h2 className="text-base font-black text-slate-900 pt-0.5">
                    {item.title}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Keluhan Utama:</strong> {item.chief_complaint}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/cases/${item.id}/edit`)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Pencil size={14} /> Edit
                  </button>

                  <button
                    onClick={() => navigate(`/admin/cases/${item.id}/edit`)}
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition"
                  >
                    <BookOpen size={14} /> Rubrik & Skenario
                  </button>

                  <button
                    type="button"
                    onClick={() => requestDeleteCase(item)}
                    className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus Kasus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {(item.anamnesis_instruction || item.physical_instruction) && (
                <div className="grid gap-3 sm:grid-cols-2 text-[11px] pt-2 border-t border-slate-100 text-slate-600 bg-slate-50/50 p-3 rounded-xl">
                  {item.anamnesis_instruction && (
                    <div>
                      <strong className="text-slate-800 block mb-0.5">Panduan Anamnesis:</strong>
                      <p className="line-clamp-2">{item.anamnesis_instruction}</p>
                    </div>
                  )}
                  {item.physical_instruction && (
                    <div>
                      <strong className="text-slate-800 block mb-0.5">Panduan Fisik:</strong>
                      <p className="line-clamp-2">{item.physical_instruction}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <CaseModal
        open={open}
        initialData={selected}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
        onSave={handleSave}
      />

      {/* Delete Case Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTargetCaseToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Kasus Medis"
        message={`Apakah Anda yakin ingin menghapus kasus medis "${targetCaseToDelete?.title || ""}" dari bank soal? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Kasus"
        cancelText="Batal"
        variant="danger"
        loading={deleting}
      />

      {/* Alert Modal */}
      <ConfirmModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        confirmText="Mengerti"
        variant="warning"
        isAlert={true}
      />
    </AdminLayout>
  );
}