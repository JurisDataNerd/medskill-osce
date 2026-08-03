import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ExaminerLayout from "@/layouts/ExaminerLayout";

import { getAnswerById, saveFeedback } from "@/services/examiner.service";

export default function FeedbackPage() {
  const { answerId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [anamnesis, setAnamnesis] = useState("");
  const [pemeriksaanFisik, setPemeriksaanFisik] = useState("");
  const [pemeriksaanPenunjang, setPemeriksaanPenunjang] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  useEffect(() => {
    load();
  }, [answerId]);

  async function load() {
    setLoading(true);
    try {
      const data = await getAnswerById(answerId);
      setAnswer(data);
      setFeedback(data?.mentor_feedback ?? "");
      setAnamnesis(data?.anamnesis ?? "");
      setPemeriksaanFisik(data?.pemeriksaan_fisik ?? "");
      setPemeriksaanPenunjang(data?.pemeriksaan_penunjang ?? "");
      setDiagnosis(data?.diagnosis ?? "");
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await saveFeedback(answerId, {
        mentor_feedback: feedback,
        anamnesis,
        pemeriksaan_fisik: pemeriksaanFisik,
        pemeriksaan_penunjang: pemeriksaanPenunjang,
        diagnosis,
      });
      alert("Feedback tersimpan.");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan feedback. Coba lagi.");
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

