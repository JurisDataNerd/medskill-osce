import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function FeedbackPage() {
  const { answerId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [anamnesis, setAnamnesis] = useState("");
  const [pemeriksaanFisik, setPemeriksaanFisik] = useState("");
  const [pemeriksaanPenunjang, setPemeriksaanPenunjang] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    load();
  }, [answerId]);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .schema("osce")
        .from("participant_answers")
        .select("*")
        .eq("id", answerId || "ans-1")
        .maybeSingle();

      if (data) {
        setAnswer(data);
        setFeedback(data?.education_notes || "");
        setAnamnesis(data?.anamnesis_notes || "");
        setPemeriksaanFisik(data?.physical_exam_notes || "");
        setDiagnosis(data?.working_diagnosis || "");
      } else {
        setAnswer(null);
        setFeedback("");
        setAnamnesis("");
        setPemeriksaanFisik("");
        setDiagnosis("");
      }
    } catch (err) {
      console.error("Error loading feedback page data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      if (answer && answer.id) {
        await supabase
          .schema("osce")
          .from("participant_answers")
          .update({
            education_notes: feedback,
            anamnesis_notes: anamnesis,
            physical_exam_notes: pemeriksaanFisik,
            working_diagnosis: diagnosis,
          })
          .eq("id", answer.id);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error("Error saving feedback:", err);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        navigate(-1);
      }, 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">

        <h1 className="text-3xl font-bold">Penilaian Peserta</h1>
        <p className="text-slate-500">Berikan feedback kepada peserta.</p>
      </div>

      {loading ? (
        <div className="flex h-[300px] items-center justify-center">Loading...</div>
      ) : (
        <div className="space-y-6 rounded-2xl bg-white p-8 shadow">
          <div>
            <h2 className="text-xl font-bold">Peserta</h2>
            <p className="text-slate-600">{answer?.participant?.full_name}</p>
            <p className="text-sm text-slate-500">{answer?.participant?.email}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">

            <div>
              <label className="mb-2 block font-semibold">Anamnesis</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border p-4"
                value={anamnesis}
                onChange={(e) => setAnamnesis(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Pemeriksaan Fisik</label>
              <textarea
                rows={3}
                className="w-full rounded-xl border p-4"
                value={pemeriksaanFisik}
                onChange={(e) => setPemeriksaanFisik(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Pemeriksaan Penunjang</label>
              <textarea
                rows={3}
                className="w-full rounded-xl border p-4"
                value={pemeriksaanPenunjang}
                onChange={(e) => setPemeriksaanPenunjang(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Diagnosis</label>
              <textarea
                rows={2}
                className="w-full rounded-xl border p-4"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Feedback (paragraf)</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border p-4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Simpan Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

