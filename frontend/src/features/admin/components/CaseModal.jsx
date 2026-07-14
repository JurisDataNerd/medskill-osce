import { useEffect, useState } from "react";

export default function CaseModal({
  open,
  onClose,
  onSave,
  initialData = null,
}) {
  const [title, setTitle] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [anamnesis, setAnamnesis] = useState("");
  const [physical, setPhysical] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setChiefComplaint(initialData.chief_complaint || "");
      setAnamnesis(initialData.anamnesis_instruction || "");
      setPhysical(initialData.physical_instruction || "");
    } else {
      setTitle("");
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
      chief_complaint: chiefComplaint,
      anamnesis_instruction: anamnesis,
      physical_instruction: physical,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {initialData ? "Edit Case" : "New Case"}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block font-medium">
              Judul Kasus
            </label>

            <input
              className="w-full rounded-lg border p-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Chief Complaint
            </label>

            <textarea
              rows={3}
              className="w-full rounded-lg border p-3"
              value={chiefComplaint}
              onChange={(e) =>
                setChiefComplaint(e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Instruksi Anamnesis
            </label>

            <textarea
              rows={4}
              className="w-full rounded-lg border p-3"
              value={anamnesis}
              onChange={(e) =>
                setAnamnesis(e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Instruksi Pemeriksaan Fisik
            </label>

            <textarea
              rows={4}
              className="w-full rounded-lg border p-3"
              value={physical}
              onChange={(e) =>
                setPhysical(e.target.value)
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-white"
            >
              Save
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}