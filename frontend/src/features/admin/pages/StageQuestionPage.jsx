import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { getStageById, updateStageQuestion } from "@/services/stage.service";

const MOCK_DEFAULT_QUESTION = {
  id: "stg-mock",
  session_id: "session-osce-001",
  station_number: 1,
  title: "Stase 1: Anamnesis & Pemeriksaan Fisik Jantung",
  osce_stage_questions: [
    {
      scenario: "Pasien pria usia 55 tahun datang ke UGD dengan keluhan nyeri dada khas infark miokard sejak 2 jam lalu.",
      participant_instruction: "Lakukan anamnesis terarah, pemeriksaan fisik kardiovaskular, dan interpretasi EKG 12 tetapan.",
      examiner_instruction: "Amati kesesuaian prosedur auskultasi, teknik inspeksi VJP, dan ketepatan diagnosis STEMI.",
      duration_minutes: 15,
      checklist: [
        { item: "Menyapa pasien & membina sambung rasa", score: 1 },
        { item: "Menanyakan onset, kualitas, dan radiasi nyeri dada", score: 2 },
        { item: "Melakukan auskultasi 4 katup jantung dengan benar", score: 3 },
        { item: "Mengidentifikasi elevasi segmen ST pada V1-V4 EKG", score: 4 },
      ],
    },
  ],
};

export default function StageQuestionPage() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(null);
  const [scenario, setScenario] = useState("");
  const [participantInstruction, setParticipantInstruction] = useState("");
  const [examinerInstruction, setExaminerInstruction] = useState("");
  const [duration, setDuration] = useState(15);
  const [checklist, setChecklist] = useState([]);

  useEffect(() => {
    load();
  }, [stageId]);

  async function load() {
    setLoading(true);
    let data = null;
    try {
      data = await getStageById(stageId);
    } catch (err) {
      console.error(err);
    }

    if (!data) {
      data = { ...MOCK_DEFAULT_QUESTION, id: stageId };
    }

    setStage(data);

    const question = data.osce_stage_questions?.[0] || MOCK_DEFAULT_QUESTION.osce_stage_questions[0];

    if (question) {
      setScenario(question.scenario ?? "");
      setParticipantInstruction(question.participant_instruction ?? "");
      setExaminerInstruction(question.examiner_instruction ?? "");
      setDuration(question.duration_minutes ?? 15);
      setChecklist(question.checklist ?? []);
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

  function updateChecklist(index, field, value) {
    const arr = [...checklist];
    arr[index][field] = value;
    setChecklist(arr);
  }

  async function save() {
    try {
      await updateStageQuestion(stageId, {
        scenario,
        participant_instruction: participantInstruction,
        examiner_instruction: examinerInstruction,
        duration_minutes: Number(duration),
        checklist,
      });
    } catch (err) {
      console.error(err);
    }
    alert("Soal dan lembar checklist berhasil disimpan (Mockup Mode).");
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[400px] items-center justify-center text-slate-500">
          Loading...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <button
        onClick={() => navigate(`/admin/sessions/${stage.session_id || "session-osce-001"}`)}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
      >
        <ArrowLeft size={16} />
        Kembali ke Detail Sesi
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Stase {stage.station_number}
        </h1>
        <p className="text-sm text-slate-500">{stage.title}</p>
      </div>

      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <label className="mb-2 block text-xs font-bold text-slate-700 uppercase">
            Skenario Kasus Medis
          </label>
          <textarea
            rows={5}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-700 uppercase">
            Instruksi Peserta Ujian
          </label>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={participantInstruction}
            onChange={(e) => setParticipantInstruction(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-700 uppercase">
            Instruksi Penguji (Internal Note)
          </label>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={examinerInstruction}
            onChange={(e) => setExaminerInstruction(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-700 uppercase">
            Durasi Stase (Menit)
          </label>
          <input
            type="number"
            min={1}
            className="w-36 rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Checklist Penilaian Penguji
            </h2>

            <button
              type="button"
              onClick={addChecklist}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-95 shadow-xs"
            >
              <Plus size={15} />
              Tambah Item Checklist
            </button>
          </div>

          <div className="space-y-2.5">
            {checklist.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                Belum ada checklist penilaian.
              </div>
            )}

            {checklist.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3 bg-slate-50/50"
              >
                <div className="flex-1">
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                    placeholder={`Langkah Penilaian ${index + 1}`}
                    value={item.item}
                    onChange={(e) => updateChecklist(index, "item", e.target.value)}
                  />
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-800 text-center font-bold focus:border-blue-500 focus:outline-none"
                    value={item.score}
                    onChange={(e) => updateChecklist(index, "score", Number(e.target.value))}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeChecklist(index)}
                  className="p-2 rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Hapus Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={save}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
          >
            <Save size={16} />
            Simpan Soal & Checklist
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}