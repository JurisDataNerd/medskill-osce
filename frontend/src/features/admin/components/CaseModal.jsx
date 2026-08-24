import { useEffect, useState } from "react";
import { SYSTEM_ORGAN_LIST, SKDI_LEVEL_LIST } from "@/constants/medicalSystems";

export default function CaseModal({
  open,
  onClose,
  onSave,
  initialData = null,
}) {
  const [title, setTitle] = useState("");
  const [systemOrgan, setSystemOrgan] = useState("Kardiovaskular");
  const [skdiLevel, setSkdiLevel] = useState("4A (Tuntas Mandiri)");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [anamnesis, setAnamnesis] = useState("");
  const [physical, setPhysical] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSystemOrgan(initialData.system_organ || "Kardiovaskular");
      setSkdiLevel(initialData.skdi_level || "4A (Tuntas Mandiri)");
      setChiefComplaint(initialData.chief_complaint || "");
      setAnamnesis(initialData.anamnesis || "");
      setPhysical(initialData.physical_examination || "");
    } else {
      setTitle("");
      setSystemOrgan("Kardiovaskular");
      setSkdiLevel("4A (Tuntas Mandiri)");
      setChiefComplaint("");
      setAnamnesis("");
      setPhysical("");
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      system_organ: systemOrgan,
      skdi_level: skdiLevel,
      chief_complaint: chiefComplaint,
      anamnesis,
      physical_examination: physical,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="mb-4 text-base font-black text-slate-900 border-b border-slate-100 pb-3">
          {initialData ? "Edit Kasus Medis" : "Tambah Kasus Medis Baru"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-bold text-slate-700 uppercase">
              Judul Kasus (Diagnosis / Masalah Klinis)
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:outline-none"
              placeholder="misal: Infark Miokard Akut (STEMI Anteroseptal)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-slate-700 uppercase">
                Sistem Organ SKDI
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:outline-none"
                value={systemOrgan}
                onChange={(e) => setSystemOrgan(e.target.value)}
              >
                {SYSTEM_ORGAN_LIST.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-bold text-slate-700 uppercase">
                Tingkat Kompetensi SKDI
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
                value={skdiLevel}
                onChange={(e) => setSkdiLevel(e.target.value)}
              >
                {SKDI_LEVEL_LIST.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-700 uppercase">
              Keluhan Utama (Chief Complaint)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Deskripsi singkat keluhan pasien..."
              required
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-700 uppercase">
              Instruksi Anamnesis
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
              value={anamnesis}
              onChange={(e) => setAnamnesis(e.target.value)}
              placeholder="Panduan pertanyaan anamnesis yang harus digali..."
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-700 uppercase">
              Instruksi Pemeriksaan Fisik
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
              value={physical}
              onChange={(e) => setPhysical(e.target.value)}
              placeholder="Panduan pemeriksaan fisik yang harus dilakukan..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Batal
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Simpan Kasus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}