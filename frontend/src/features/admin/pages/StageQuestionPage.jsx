import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";

import {
  getStageById,
  updateStageQuestion,
} from "@/services/stage.service";

export default function StageQuestionPage() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [stage, setStage] = useState(null);

  const [scenario, setScenario] = useState("");

  const [participantInstruction,
    setParticipantInstruction] =
    useState("");

  const [examinerInstruction,
    setExaminerInstruction] =
    useState("");

  const [duration,
    setDuration] =
    useState(10);

  const [checklist,
    setChecklist] =
    useState([]);

  useEffect(() => {
    load();
  }, [stageId]);

  async function load() {
    setLoading(true);

    const data =
      await getStageById(stageId);

    setStage(data);

    const question =
      data.osce_stage_questions?.[0];

    if (question) {
      setScenario(question.scenario ?? "");

      setParticipantInstruction(
        question.participant_instruction ?? ""
      );

      setExaminerInstruction(
        question.examiner_instruction ?? ""
      );

      setDuration(
        question.duration_minutes ?? 10
      );

      setChecklist(
        question.checklist ?? []
      );
    }

    setLoading(false);
  }

  function addChecklist() {
    setChecklist([
      ...checklist,
      {
        item: "",
        score: 1,
      },
    ]);
  }

  function removeChecklist(index) {
    const arr = [...checklist];

    arr.splice(index, 1);

    setChecklist(arr);
  }

  function updateChecklist(
    index,
    field,
    value
  ) {
    const arr = [...checklist];

    arr[index][field] = value;

    setChecklist(arr);
  }

  async function save() {
    await updateStageQuestion(
      stageId,
      {
        scenario,
        participant_instruction:
          participantInstruction,
        examiner_instruction:
          examinerInstruction,
        duration_minutes:
          Number(duration),
        checklist,
      }
    );

    alert("Soal berhasil disimpan.");
  }

  if (loading) {
    return (
      <AdminLayout>

        <div className="flex h-[500px] items-center justify-center">

          Loading...

        </div>

      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      <button
        onClick={() =>
          navigate(
            `/admin/sessions/${stage.session_id}`
          )
        }
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={18} />
        Kembali
      </button>

      <div className="mb-8">

        <h1 className="text-3xl font-bold">

          Stase {stage.station_number}

        </h1>

        <p className="text-slate-500">

          {stage.title}

        </p>

      </div>

      <div className="space-y-6 rounded-2xl bg-white p-8 shadow">

        <div>

          <label className="mb-2 block font-semibold">

            Skenario

          </label>

          <textarea
            rows={8}
            className="w-full rounded-xl border p-4"
            value={scenario}
            onChange={(e)=>
              setScenario(
                e.target.value
              )
            }
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">

            Instruksi Peserta

          </label>

          <textarea
            rows={6}
            className="w-full rounded-xl border p-4"
            value={
              participantInstruction
            }
            onChange={(e)=>
              setParticipantInstruction(
                e.target.value
              )
            }
          />

        </div>

        <div>

          <label className="mb-2 block font-semibold">

            Instruksi Penguji

          </label>

          <textarea
            rows={6}
            className="w-full rounded-xl border p-4"
            value={
              examinerInstruction
            }
            onChange={(e)=>
              setExaminerInstruction(
                e.target.value
              )
            }
          />

        </div>
                <div>

          <label className="mb-2 block font-semibold">

            Durasi (Menit)

          </label>

          <input
            type="number"
            min={1}
            className="w-48 rounded-xl border p-3"
            value={duration}
            onChange={(e) =>
              setDuration(e.target.value)
            }
          />

        </div>

        <div>

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Checklist Penilaian
            </h2>

            <button
              type="button"
              onClick={addChecklist}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Tambah Item
            </button>

          </div>

          <div className="space-y-3">

            {checklist.length === 0 && (

              <div className="rounded-xl border border-dashed p-8 text-center text-slate-400">

                Belum ada checklist penilaian.

              </div>

            )}

            {checklist.map((item, index) => (

              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border p-4"
              >

                <div className="flex-1">

                  <input
                    className="w-full rounded-lg border p-3"
                    placeholder={`Checklist ${index + 1}`}
                    value={item.item}
                    onChange={(e) =>
                      updateChecklist(
                        index,
                        "item",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="w-32">

                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border p-3"
                    value={item.score}
                    onChange={(e) =>
                      updateChecklist(
                        index,
                        "score",
                        Number(e.target.value)
                      )
                    }
                  />

                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeChecklist(index)
                  }
                  className="rounded-lg bg-red-600 p-3 text-white hover:bg-red-700"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            ))}

          </div>

        </div>

        <div className="flex justify-end">

          <button
            type="button"
            onClick={save}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            <Save size={18} />
            Simpan Soal
          </button>

        </div>

      </div>

    </AdminLayout>
  );
}