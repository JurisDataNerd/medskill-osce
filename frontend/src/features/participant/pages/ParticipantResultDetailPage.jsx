import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Info,
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
  const [expandedStation, setExpandedStation] = useState(1); // Station 1 expanded by default

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

  const stations = resultItem.stations_evaluations || [];
  const avgScore = resultItem.avg_score || resultItem.score;
  const finalRating = resultItem.final_global_rating || resultItem.global_rating;

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
        {/* Printable Official Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                Transkrip Nilai Resmi Ujian OSCE (6 Stase Rotasi)
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-2">
                {resultItem.title}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tanggal Pelaksanaan: <strong>{resultItem.session_date}</strong> • Lokasi: <strong>{resultItem.location}</strong>
              </p>
            </div>

            <RatingBadge rating={finalRating} />
          </div>

          {/* Participant Profile Row */}
          <div className="grid gap-4 sm:grid-cols-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Identitas Peserta Ujian:</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{MOCK_PARTICIPANT_PROFILE.name}</p>
              <p className="text-slate-600 font-semibold mt-0.5">NIM: {MOCK_PARTICIPANT_PROFILE.nim}</p>
              <p className="text-slate-500">{MOCK_PARTICIPANT_PROFILE.institution}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Struktur Sesi Ujian OSCE:</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">6 Stase Rotasi Medis Keterampilan</p>
              <p className="text-slate-600 font-semibold mt-0.5">6 Dokter Penguji Spesialis Penilai</p>
              <p className="text-slate-500">Status: Selesai Seluruh Rotasi Stase</p>
            </div>
          </div>

          {/* Stat Summary Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-center">
              <span className="text-[10px] font-bold uppercase text-blue-700">Rata-Rata Skor Akumulasi (6 Stase)</span>
              <p className="text-3xl font-black text-blue-700 mt-0.5">{avgScore} <span className="text-xs font-medium text-slate-500">/ 100</span></p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Jumlah Stase Evaluasi</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{stations.length} Stase Lengkap</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Kelulusan Final Sesi</span>
              <p className="text-xl font-bold text-emerald-800 mt-1">{finalRating}</p>
            </div>
          </div>

          {/* Info Banner Structure 6 Stations */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3 text-xs text-slate-700 print:hidden">
            <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Catatan Penilaian 6 Stase Ujian OSCE:</p>
              <p className="mt-0.5 text-slate-700 font-medium">
                Di bawah ini adalah rekapitulasi penilaian dari <strong>6 Dokter Penguji Spesialis yang berbeda</strong> untuk masing-masing stase. Klik setiap stase untuk membuka rincian perolehan poin rubrik dan catatan umpan balik dokter penguji.
              </p>
            </div>
          </div>

          {/* 6 STATIONS RECAP & RUBRIC BREAKDOWN */}
          <div className="space-y-4 pt-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-blue-600" />
              Rekapitulasi Penilaian 6 Stase Ujian OSCE (6 Dokter Penguji)
            </h2>

            <div className="space-y-3">
              {stations.map((st) => {
                const isExpanded = expandedStation === st.station_number;

                return (
                  <div
                    key={st.station_number}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition"
                  >
                    {/* Station Header Accordion Bar */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedStation(isExpanded ? null : st.station_number)
                      }
                      className="w-full flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/80 hover:bg-slate-100/70 text-left transition print:bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white text-xs shadow-2xs">
                          #{st.station_number}
                        </span>

                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">
                            {st.station_title}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Penguji: <strong className="text-slate-800">{st.examiner_name}</strong> • Kasus: {st.case_title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-auto">
                        <div className="text-right">
                          <p className="font-black text-blue-700 text-xs sm:text-sm">
                            {st.score} <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
                          </p>
                          <RatingBadge rating={st.global_rating} />
                        </div>

                        <div className="print:hidden text-slate-400">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </button>

                    {/* Station Rubric Details (Visible when expanded or in Print PDF) */}
                    {(isExpanded || true) && (
                      <div className={`p-4 border-t border-slate-100 space-y-3 ${isExpanded ? "block" : "hidden print:block"}`}>
                        {/* Rubric Table */}
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-600 uppercase">
                              <tr>
                                <th className="px-3 py-2">Item Rubrik Penilaian Penguji</th>
                                <th className="px-3 py-2 text-right">Poin</th>
                                <th className="px-3 py-2 text-right">Maks</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {st.rubric_breakdown.map((rb, rIdx) => (
                                <tr key={rIdx}>
                                  <td className="px-3 py-2 font-medium">{rb.question}</td>
                                  <td className="px-3 py-2 text-right font-bold text-blue-700">{rb.points}</td>
                                  <td className="px-3 py-2 text-right text-slate-400">{rb.max}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Qualitative Feedback */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-medium">
                          <span className="font-bold text-slate-900 block mb-1">Catatan & Umpan Balik ({st.examiner_name}):</span>
                          "{st.feedback}"
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Signature Bar for Official PDF Print */}
          <div className="border-t border-slate-200 pt-6 mt-8 flex justify-between items-end text-xs">
            <div>
              <p className="text-slate-400 text-[10px]">Transkrip ini memuat hasil akumulasi resmi 6 stase Ujian OSCE MedSkill Indonesia.</p>
              <p className="text-slate-400 text-[10px]">Dokumen terverifikasi secara digital.</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 font-semibold mb-8">Ketua Panitia Ujian OSCE,</p>
              <p className="font-bold text-slate-900 border-b border-slate-900 pb-0.5">dr. Alexander Budiman, Sp.JP</p>
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
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black ${cls}`}>
      {rating}
    </span>
  );
}
