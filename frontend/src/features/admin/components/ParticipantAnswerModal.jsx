import { X, CheckCircle2, Award, FileText, UserCheck, AlertCircle } from "lucide-react";
import { MOCK_PARTICIPANT_SCORECARDS } from "@/features/admin/data/mockAdminData";

export default function ParticipantAnswerModal({ open, onClose, participantId, participantName }) {
  if (!open) return null;

  const scorecard = MOCK_PARTICIPANT_SCORECARDS[participantId] || {
    participant_name: participantName || "Peserta OSCE",
    nim: "20200710" + Math.floor(1000 + Math.random() * 9000),
    session_title: "Ujian OSCE Periodik - Batch III 2026",
    total_score: 88.0,
    final_grade: "LULUS",
    global_rating: "Sangat Baik",
    station_results: [
      {
        station_number: 1,
        title: "Stase 1: Anamnesis & Pemeriksaan Fisik Jantung",
        examiner_name: "dr. Alexander Budiman, Sp.JP",
        score: 90,
        max_score: 100,
        checklist_items: [
          { item: "Menyapa pasien & membina sambung rasa", max_points: 1, earned_points: 1, notes: "Sangat sopan dan profesional" },
          { item: "Menanyakan onset, kualitas, & radiasi nyeri dada", max_points: 3, earned_points: 3, notes: "Anamnesis sangat terstruktur" },
          { item: "Melakukan auskultasi 4 katup jantung dengan benar", max_points: 3, earned_points: 2.5, notes: "Auskultasi baik, perlu lebih tenang" },
          { item: "Mengidentifikasi elevasi segmen ST pada EKG", max_points: 3, earned_points: 2.5, notes: "Diagnosis STEMI tepat" },
        ],
        examiner_feedback: "Penanganan klinis sangat baik secara keseluruhan.",
      },
      {
        station_number: 2,
        title: "Stase 2: Kegawatdaruratan Pulmonologi",
        examiner_name: "dr. Faisal Hasibuan, Sp.P",
        score: 86,
        max_score: 100,
        checklist_items: [
          { item: "Anamnesis sesak napas akut & wheezing", max_points: 2, earned_points: 2, notes: "Lengkap" },
          { item: "Pemberian Oksigenasi & Inhalasi Nebulizer", max_points: 3, earned_points: 3, notes: "Dosis obat tepat" },
          { item: "Indikasi & persiapan Needle Thoracocentesis", max_points: 3, earned_points: 2, notes: "Sedikit ragu pada persiapan alat" },
        ],
        examiner_feedback: "Sikap tanggap dan tenang.",
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-xs">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Lembar Nilai & Rekap Jawaban Peserta</h2>
              <p className="text-xs text-slate-300">
                {scorecard.participant_name} (NIM: {scorecard.nim})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Banner */}
          <div className="grid gap-4 sm:grid-cols-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Nilai Total OSCE</p>
              <p className="text-2xl font-black text-blue-600">{scorecard.total_score} / 100</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Status Kelulusan</p>
              <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 size={13} />
                {scorecard.final_grade}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Global Rating</p>
              <p className="text-sm font-bold text-slate-800 mt-1">{scorecard.global_rating}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Sesi Ujian</p>
              <p className="text-xs font-medium text-slate-600 mt-1 line-clamp-1">{scorecard.session_title}</p>
            </div>
          </div>

          {/* Station Results Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              Rincian Lembar Penilaian Per Stase
            </h3>

            {scorecard.station_results.map((stg) => (
              <div key={stg.station_number} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                      Stase {stg.station_number}
                    </span>
                    <h4 className="mt-1 font-bold text-slate-900 text-sm">{stg.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <UserCheck size={13} className="text-slate-400" />
                      Penguji: {stg.examiner_name}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Skor Stase</span>
                    <p className="text-lg font-bold text-emerald-600">
                      {stg.score} <span className="text-xs font-normal text-slate-400">/ {stg.max_score}</span>
                    </p>
                  </div>
                </div>

                {/* Checklist items table */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-500">
                        <th className="p-2.5 font-semibold">Langkah / Rubrik Penilaian</th>
                        <th className="p-2.5 font-semibold text-center w-24">Poin Dicapai</th>
                        <th className="p-2.5 font-semibold">Catatan Khusus Penguji</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stg.checklist_items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-medium text-slate-800">{item.item}</td>
                          <td className="p-2.5 text-center font-bold text-blue-600">
                            {item.earned_points} / {item.max_points}
                          </td>
                          <td className="p-2.5 text-slate-500 italic">
                            {item.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Examiner Feedback */}
                {stg.examiner_feedback && (
                  <div className="rounded-lg bg-amber-50/70 border border-amber-200/60 p-3 text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1 mb-0.5">
                      <AlertCircle size={13} /> Catatan & Umpan Balik Penguji:
                    </span>
                    <p className="text-amber-800">{stg.examiner_feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 p-4 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-95"
          >
            Tutup Lembar Penilaian
          </button>
        </div>
      </div>
    </div>
  );
}
