import { Award } from "lucide-react";

export default function CaseAnswerKeyTab({
  answerKeyDiagnosis,
  setAnswerKeyDiagnosis,
  answerKeyPrescription,
  setAnswerKeyPrescription,
}) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3">
        <Award size={20} className="shrink-0 text-blue-600 mt-0.5" />
        <div>
          <span className="font-bold">Kunci Jawaban:</span> Kunci jawaban ini akan tampil di layar dokter penguji berdampingan dengan jawaban peserta.
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1">
          Kunci Jawaban Diagnosis
        </label>
        <textarea
          rows={4}
          value={answerKeyDiagnosis}
          onChange={(e) => setAnswerKeyDiagnosis(e.target.value)}
          placeholder="Contoh: WDx: STEMI Anteroseptal (I21.0). DDx: Angina Pektoris Tidak Stabil (UAP), Diseksi Aorta, Perikarditis Akut."
          className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1">
          Kunci Jawaban Resep Obat
        </label>
        <textarea
          rows={5}
          value={answerKeyPrescription}
          onChange={(e) => setAnswerKeyPrescription(e.target.value)}
          placeholder="Contoh:&#10;R/ Aspirin tab 80mg No. IV S 1 dd tab IV (chewed)&#10;R/ Clopidogrel tab 75mg No. IV S 1 dd tab IV&#10;R/ ISDN tab 5mg No. III S 1 dd tab I sublingual"
          className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
