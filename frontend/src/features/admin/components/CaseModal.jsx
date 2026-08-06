import { useEffect, useState } from "react";

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
      setAnamnesis(initialData.anamnesis_instruction || "");
      setPhysical(initialData.physical_instruction || "");
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

  function handleSubmit(e) {
    e.preventDefault();

    onSave({
      title,
      system_organ: systemOrgan,
      skdi_level: skdiLevel,
      chief_complaint: chiefComplaint,
      anamnesis_instruction: anamnesis,
      physical_instruction: physical,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {initialData ? "Edit Kasus Medis Bank Soal" : "Buat Kasus Medis Baru"}
            </h2>
            <p className="text-xs text-slate-500">
              Input data kasus, sistem organ SKDI, dan instruksi pengerjaan.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-bold text-slate-700 uppercase">
              Judul Kasus Medis
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="misal: Nyeri Dada Khas Infark Miokard (STEMI)"
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
                <option value="Kardiovaskular">Kardiovaskular</option>
                <option value="Respirasi">Respirasi</option>
                <option value="Neurologi">Neurologi</option>
                <option value="Digestif">Digestif</option>
                <option value="Muskuloskeletal">Muskuloskeletal</option>
                <option value="Endokrin">Endokrin & Metabolik</option>
                <option value="Urologi">Urologi & Nefrologi</option>
                <option value="Lainnya">Sistem Organ Lainnya</option>
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
                <option value="4A (Tuntas Mandiri)">4A (Tuntas Mandiri)</option>
                <option value="3B (Gawat Darurat)">3B (Gawat Darurat)</option>
                <option value="3A (Non-Gawat Darurat)">3A (Non-Gawat Darurat)</option>
                <option value="2 (Diagnosis)">2 (Diagnosis Dasar)</option>
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