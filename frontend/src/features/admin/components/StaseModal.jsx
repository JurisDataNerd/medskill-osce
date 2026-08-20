import { useEffect, useState } from "react";

export default function StaseModal({
  open,
  onClose,
  onSave,
  initialData = null,
}) {
  const [stationNumber, setStationNumber] = useState(1);
  const [title, setTitle] = useState("");
  const [scenario, setScenario] = useState("");
  const [participantInstruction, setParticipantInstruction] = useState("");
  const [examinerInstruction, setExaminerInstruction] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(10);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setStationNumber(initialData.station_number ?? 1);
      setTitle(initialData.title ?? "");
      setScenario(initialData.scenario ?? "");
      setParticipantInstruction(
        initialData.participant_instructions ?? initialData.participant_instruction ?? ""
      );
      setExaminerInstruction(
        initialData.examiner_instructions ?? initialData.examiner_instruction ?? ""
      );
      setDurationMinutes(
        initialData.duration_minutes ?? 10
      );
    } else {
      setStationNumber(1);
      setTitle("");
      setScenario("");
      setParticipantInstruction("");
      setExaminerInstruction("");
      setDurationMinutes(10);
    }
  }, [open, initialData]);

  if (!open) return null;

  function submit(e) {
    e.preventDefault();

    onSave({
      station_number: Number(stationNumber),
      title,
      scenario,
      participant_instruction: participantInstruction,
      participant_instructions: participantInstruction,
      examiner_instruction: examinerInstruction,
      examiner_instructions: examinerInstruction,
      duration_minutes: Number(durationMinutes),
      checklist: initialData?.checklist ?? [],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-8 text-2xl font-bold">
          {initialData ? "Edit Stase" : "Tambah Stase"}
        </h2>

        <form
          onSubmit={submit}
          className="space-y-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">
                Nomor Stase
              </label>

              <input
                type="text"
                inputMode="numeric"
                className="w-full rounded-xl border p-3"
                value={stationNumber}
                onChange={(e) =>
                  setStationNumber(e.target.value.replace(/\D/g, ""))
                }
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Durasi (Menit)
              </label>

              <input
                type="text"
                inputMode="numeric"
                className="w-full rounded-xl border p-3"
                value={durationMinutes}
                onChange={(e) =>
                  setDurationMinutes(e.target.value.replace(/\D/g, ""))
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Nama Stase
            </label>

            <input
              className="w-full rounded-xl border p-3"
              placeholder="Contoh: Pulmonologi"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Skenario Kasus
            </label>

            <textarea
              rows={6}
              className="w-full rounded-xl border p-3"
              placeholder="Masukkan skenario kasus..."
              value={scenario}
              onChange={(e) =>
                setScenario(e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Instruksi Peserta
            </label>

            <textarea
              rows={5}
              className="w-full rounded-xl border p-3"
              placeholder="Instruksi yang akan dilihat peserta..."
              value={participantInstruction}
              onChange={(e) =>
                setParticipantInstruction(e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Instruksi Penguji
            </label>

            <textarea
              rows={5}
              className="w-full rounded-xl border p-3"
              placeholder="Instruksi khusus untuk penguji..."
              value={examinerInstruction}
              onChange={(e) =>
                setExaminerInstruction(e.target.value)
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-6 py-3 hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Simpan Stase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}