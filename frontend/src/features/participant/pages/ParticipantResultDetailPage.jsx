import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Printer,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import {
  MOCK_PARTICIPANT_PROFILE,
  MY_PAST_RESULTS,
} from "@/features/participant/data/mockParticipantData";

export default function ParticipantResultDetailPage() {
  const navigate = useNavigate();
  const { resultId } = useParams();

  const [resultItem, setResultItem] = useState(null);

  useEffect(() => {
    const found =
      MY_PAST_RESULTS.find((r) => r.id === resultId) || MY_PAST_RESULTS[0];
    setResultItem(found);
  }, [resultId]);

  if (!resultItem) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Data hasil ujian tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Navbar Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-2xs print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <button
            onClick={() => navigate("/participant")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard Peserta
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition"
          >
            <Printer size={15} />
            Unduh / Cetak Transkrip Nilai (PDF)
          </button>
        </div>
      </header>

      {/* Main Viewport / Printable Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Printable Official Header Header (Appears in Print PDF) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                Transkrip Nilai Resmi Ujian OSCE
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-2">
                {resultItem.title}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tanggal Pelaksanaan: <strong>{resultItem.session_date}</strong>
              </p>
            </div>

            <RatingBadge rating={resultItem.global_rating} />
          </div>

          {/* Participant & Examiner Profile Row */}
          <div className="grid gap-4 sm:grid-cols-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Identitas Peserta Ujian:</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{MOCK_PARTICIPANT_PROFILE.name}</p>
              <p className="text-slate-600 font-semibold mt-0.5">NIM: {MOCK_PARTICIPANT_PROFILE.nim}</p>
              <p className="text-slate-500">{MOCK_PARTICIPANT_PROFILE.institution}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Dokter Penguji Penilai:</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{resultItem.examiner_name}</p>
              <p className="text-slate-600 font-semibold mt-0.5">{resultItem.station_name}</p>
              <p className="text-slate-500">Kasus: {resultItem.case_title}</p>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-center">
              <span className="text-[10px] font-bold uppercase text-blue-700">Skor Akhir Peserta</span>
              <p className="text-3xl font-black text-blue-700 mt-0.5">{resultItem.score} <span className="text-xs font-medium text-slate-500">/ 100</span></p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Poin Rubrik</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{resultItem.earned_points} / {resultItem.max_points} Poin</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Penilaian Global</span>
              <p className="text-xl font-bold text-emerald-800 mt-1">{resultItem.global_rating}</p>
            </div>
          </div>

          {/* Rubric Items Scorecard Table */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-blue-600" />
              Rincian Perolehan Poin Rubrik Penilaian Penguji
            </h2>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Item Pertanyaan Rubrik</th>
                    <th className="px-4 py-3 text-right">Poin Diperoleh</th>
                    <th className="px-4 py-3 text-right">Maks Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {resultItem.rubric_breakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">
                        {idx + 1}. {item.question}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-700">
                        {item.points} Poin
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {item.max} Poin
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Examiner Feedback */}
          <div className="space-y-2 pt-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" />
              Catatan Evaluasi & Umpan Balik Dokter Penguji
            </h2>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 leading-relaxed font-medium">
              "{resultItem.feedback}"
            </div>
          </div>

          {/* Footer Signature Bar for Official PDF Print */}
          <div className="border-t border-slate-200 pt-6 mt-6 flex justify-between items-end text-xs">
            <div>
              <p className="text-slate-400 text-[10px]">Dicetak secara otomatis oleh sistem Praxis OSCE MedSkill Indonesia.</p>
              <p className="text-slate-400 text-[10px]">Dokumen ini terverifikasi secara digital.</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 font-semibold mb-8">Dokter Penguji Penilai,</p>
              <p className="font-bold text-slate-900 border-b border-slate-900 pb-0.5">{resultItem.examiner_name}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function RatingBadge({ rating }) {
  const configs = {
    SUPERIOR: "bg-indigo-100 text-indigo-800 border-indigo-200",
    LULUS: "bg-emerald-100 text-emerald-800 border-emerald-200",
    BORDERLINE: "bg-amber-100 text-amber-800 border-amber-200",
    "TIDAK LULUS": "bg-rose-100 text-rose-800 border-rose-200",
  };

  const cls = configs[rating] || configs.LULUS;

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black ${cls}`}>
      {rating}
    </span>
  );
}
