import { useEffect, useState } from "react";

export default function SectionModal({
  open,
  onClose,
  onSave,
  initialData = null,
}) {
  const [title, setTitle] = useState("");
  const [scenario, setScenario] = useState("");
  const [candidate, setCandidate] = useState("");
  const [examiner, setExaminer] = useState("");
  const [duration, setDuration] = useState(10);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title ?? "");
      setScenario(initialData.configuration?.scenario ?? "");
      setCandidate(initialData.configuration?.candidate_instruction ?? "");
      setExaminer(initialData.configuration?.examiner_instruction ?? "");
      setDuration(initialData.configuration?.duration ?? 10);
    } else {
      setTitle("");
      setScenario("");
      setCandidate("");
      setExaminer("");
      setDuration(10);
    }
  }, [initialData, open]);

  if (!open) return null;

  function submit(e) {
    e.preventDefault();

    onSave({
      title,
      section_type: "station",
      configuration: {
        scenario,
        candidate_instruction: candidate,
        examiner_instruction: examiner,
        duration: Number(duration),
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-3xl rounded-2xl bg-white p-6">

        <h2 className="mb-6 text-2xl font-bold">
          {initialData ? "Edit Station" : "New Station"}
        </h2>

        <form onSubmit={submit} className="space-y-4">

          <input
            className="w-full rounded-lg border p-3"
            placeholder="Nama Stase"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />

          <textarea
            rows={5}
            className="w-full rounded-lg border p-3"
            placeholder="Skenario"
            value={scenario}
            onChange={(e)=>setScenario(e.target.value)}
          />

          <textarea
            rows={4}
            className="w-full rounded-lg border p-3"
            placeholder="Instruksi Peserta"
            value={candidate}
            onChange={(e)=>setCandidate(e.target.value)}
          />

          <textarea
            rows={4}
            className="w-full rounded-lg border p-3"
            placeholder="Instruksi Penguji"
            value={examiner}
            onChange={(e)=>setExaminer(e.target.value)}
          />

          <input
            type="number"
            className="w-full rounded-lg border p-3"
            value={duration}
            onChange={(e)=>setDuration(e.target.value)}
          />

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-2"
            >
              Cancel
            </button>

            <button
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