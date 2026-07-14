import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import CaseModal from "@/features/admin/components/CaseModal";

import {
  getCases,
  createCase,
  updateCase,
  deleteCase,
} from "@/services/case.service";

export default function CasesPage() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  async function loadCases() {
    const data = await getCases();
    setCases(data ?? []);
  }

  useEffect(() => {
    loadCases();
  }, []);

  async function handleSave(payload) {
    if (selected) {
      await updateCase(selected.id, payload);
    } else {
      await createCase(payload);
    }

    setOpen(false);
    setSelected(null);

    loadCases();
  }

  async function handleDelete(id) {
    if (!confirm("Hapus case ini?")) return;

    await deleteCase(id);

    loadCases();
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Cases
          </h1>

          <p className="text-slate-500">
            Bank Kasus OSCE
          </p>
        </div>

        <button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white"
        >
          <Plus size={18} />
          New Case
        </button>

      </div>

      <div className="grid gap-5">

        {cases.length === 0 && (
          <div className="rounded-2xl bg-white p-8 shadow">
            Belum ada kasus.
          </div>
        )}

        {cases.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-white p-6 shadow"
          >

            <div className="flex items-start justify-between">

              <div className="max-w-3xl">

                <h2 className="text-xl font-bold">
                  {item.title}
                </h2>

                <p className="mt-2 text-slate-500">
                  {item.chief_complaint}
                </p>

              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => {
                    setSelected(item);
                    setOpen(true);
                  }}
                  className="rounded-lg border p-2"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() =>
                    navigate(`/admin/cases/${item.id}/sections`)
                  }
                  className="rounded-lg bg-blue-600 px-3 text-sm text-white"
                >
                  Sections
                </button>

                <button
                  onClick={() =>
                    navigate(`/admin/cases/${item.id}/checklist`)
                  }
                  className="rounded-lg bg-green-600 px-3 text-sm text-white"
                >
                  Checklist
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg border p-2 text-red-600"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>

          </div>
        ))}

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
    </AdminLayout>
  );
}