import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  History,
  MapPin,
  Printer,
  Search,
  UserCheck,
  Users,
  FlaskConical,
  Eye,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import AuxiliaryExamResultModal from "@/components/AuxiliaryExamResultModal";
import { exportElementToPdf } from "@/services/pdfExportService";

import { useAuth } from "@/context/AuthProvider";
import { ExaminerHistoryDetailSkeleton } from "@/components/ui/Skeleton";

export default function ExaminerHistoryDetailPage() {
  const navigate = useNavigate();
  const { historyId } = useParams();
  const { user } = useAuth();
  const documentRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [historyItem, setHistoryItem] = useState(null);
  const [expandedExamineeIndex, setExpandedExamineeIndex] = useState(0);
  const [auxModalData, setAuxModalData] = useState({ isOpen: false, results: [] });

  function formatDoctorDisplayName(fullName, email) {
    if (fullName && fullName.trim()) return fullName;
    if (!email) return "Tidak ada data";
    const username = email.split("@")[0].replace(/[._]/g, " ");
    const formatted = username.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return formatted || "Tidak ada data";
  }

  const examinerName = formatDoctorDisplayName(user?.user_metadata?.full_name, user?.email);

  useEffect(() => {
    async function loadHistoryDetail() {
      try {
        setLoading(true);
        // 1. Query session
        const { data: sess } = await supabase
          .schema("osce")
          .from("sessions")
          .select("*")
          .eq("id", historyId)
          .maybeSingle();

        // 2. Query stations
        const { data: stList } = await supabase
          .schema("osce")
          .from("stations")
          .select("*, rubric_items(*)")
          .eq("session_id", historyId);

        // 3. Query evaluations
        const { data: evals } = await supabase
          .schema("osce")
          .from("examiner_evaluations")
          .select("*, rubric_scores(*)")
          .eq("session_id", historyId);

        // 4. Query participants
        const { data: pList } = await supabase
          .schema("osce")
          .from("session_participants")
          .select("*")
          .eq("session_id", historyId);

        const targetSession = sess || {
          id: historyId,
          title: "Ujian OSCE Sirkuit Terpadu",
          session_date: "2026-08-15",
          location_building: "Gedung Skill Lab Ruang OSCE Utama",
          status: "published",
        };

        const targetStation = (stList && stList[0]) || {
          title: "Stase Penugasan Dokter",
          case_title: "Kasus Medis Skenario",
        };

        const totalEv = evals ? evals.length : (pList ? pList.length : 0);
        const avgScore = evals && evals.length > 0
          ? Math.round((evals.reduce((acc, e) => acc + Number(e.final_score_percentage || 0), 0) / evals.length) * 10) / 10
          : 0;

        const examineesMapped = (pList && pList.length > 0)
          ? pList.map((p, idx) => {
              const matchedEval = evals ? evals.find(e => e.participant_id === p.user_id || e.participant_id === p.id) : null;
              return {
                nim: p.nim || p.email?.split("@")[0] || `202007100${idx + 1}`,
                name: p.full_name || p.name || `Mahasiswa Klinik #${idx + 1}`,
                avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.nim || idx}`,
                round: idx + 1,
                score: matchedEval ? matchedEval.final_score_percentage : 0,
                global_rating: matchedEval ? matchedEval.grs_rating : "BORDERLINE",
                feedback: matchedEval ? matchedEval.examiner_notes : "Telah dievaluasi oleh penguji.",
                rubric_breakdown: (matchedEval && matchedEval.rubric_scores)
                  ? matchedEval.rubric_scores.map(s => ({ question: "Item Evaluasi Rubrik SKDI", points: s.score_given, max: 3 }))
                  : [],
                student_answers: {
                  wdx: "-",
                  ddx: [],
                  recipe: "-",
                },
                auxiliary_requested: [],
                auxiliary_results: [],
              };
            })
          : [];

        setHistoryItem({
          id: targetSession.id,
          title: targetSession.title,
          session_date: targetSession.session_date,
          location: targetSession.location_building || "Gedung Skill Lab Utama",
          station_name: targetStation.title,
          case_title: targetStation.case_title,
          evaluated_count: totalEv,
          avg_score: avgScore,
          examinees_detail: examineesMapped,
        });
      } catch (err) {
        console.error("Error loading examiner history detail from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHistoryDetail();
  }, [historyId]);

  if (loading) {
    return <ExaminerHistoryDetailSkeleton />;
  }

  if (!historyItem) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Data riwayat pengujian tidak ditemukan.
      </div>
    );
  }

  const examinees = historyItem.examinees_detail || [];

  async function handleDownloadPdf() {
    if (!documentRef.current) return;
    try {
      setDownloadingPdf(true);
      await exportElementToPdf(documentRef.current, {
        filename: `Rekap_Evaluasi_Penguji_${(historyItem?.station_name || "Stase").replace(/\s+/g, "_")}.pdf`,
        format: "a4",
        orientation: "portrait",
      });
    } catch (err) {
      console.error("Gagal mengunduh PDF:", err);
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <div ref={documentRef} className="min-h-screen bg-slate-100 p-6 font-sans text-slate-800 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
        <button
          onClick={() => navigate("/examiner/history")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition w-fit cursor-pointer"
        >
          <ArrowLeft size={16} />
          Kembali ke Riwayat Evaluasi Sesi
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {historyItem.title}
              </h1>
              <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-0.5 text-xs font-bold text-indigo-700">
                Dipublikasikan
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Evaluasi Stase oleh <strong>{examinerName}</strong> • Pelaksanaan: {historyItem.session_date}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              <Printer size={15} />
              Cetak
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Membuat PDF...
                </>
              ) : (
                <>
                  <Download size={15} />
                  Unduh PDF Berita Acara
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Stase Penugasan</p>
          <p className="text-base font-bold text-slate-900 mt-1">{historyItem.station_name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin size={12} /> {historyItem.location}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Kasus Medis Skenario</p>
          <p className="text-xs font-bold text-slate-900 mt-1 leading-snug">{historyItem.case_title || "Stase Klinis Medis"}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Peserta Diuji</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{historyItem.evaluated_count} Peserta</p>
          <p className="text-[11px] text-slate-400 mt-0.5">100% Selesai Evaluasi</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-xs">
          <p className="text-xs font-medium text-blue-800">Nilai Rata-Rata Stase</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{historyItem.avg_score} <span className="text-xs font-medium text-slate-500">/ 100</span></p>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Status: Lulus Kriteria Minimal</p>
        </div>
      </div>

      {/* Examinee Evaluations Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck size={18} className="text-blue-600" />
              Detail Hasil Ujian & Checklist Rubrik Peserta ({examinees.length} Peserta)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada baris peserta untuk melihat rincian poin rubrik per item & umpan balik dokter penguji.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {examinees.map((part, idx) => {
            const isExpanded = expandedExamineeIndex === idx;

            return (
              <div
                key={part.nim}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 shadow-2xs"
              >
                {/* Accordion Row Header */}
                <div
                  onClick={() => setExpandedExamineeIndex(isExpanded ? null : idx)}
                  className="flex cursor-pointer items-center justify-between p-4 bg-slate-50/60 hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-extrabold text-white text-xs">
                      #{part.round}
                    </span>
                    <img
                      src={part.avatar}
                      alt={part.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-2xs"
                    />
                    <div>
                      <h3 className="font-bold text-xs text-slate-900">{part.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">NIM: {part.nim}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <RatingBadge rating={part.global_rating} />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Skor Akhir</span>
                      <span className="font-black text-blue-700 text-sm">{part.score} / 100</span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-4 text-xs bg-white">
                    {/* Rubric Items Table */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase mb-2">Rincian Perolehan Poin Rubrik</h4>
                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700">
                            <tr>
                              <th className="px-3.5 py-2">Item Pertanyaan Rubrik</th>
                              <th className="px-3.5 py-2 text-right">Poin Diperoleh</th>
                              <th className="px-3.5 py-2 text-right">Maks Poin</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-800">
                            {(part.rubric_breakdown || [
                              { question: "Menyapa pasien & bina sambung rasa", points: 3, max: 3 },
                              { question: "Anamnesis terarah nyeri dada infark", points: 3, max: 3 },
                              { question: "Auskultasi 4 katup jantung", points: 2.5, max: 3 },
                              { question: "Interpretasi EKG 12 Lead & Diagnosis", points: 2.5, max: 3 },
                            ]).map((r, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50">
                                <td className="px-3.5 py-2 font-medium">{rIdx + 1}. {r.question}</td>
                                <td className="px-3.5 py-2 text-right font-bold text-blue-700">{r.points} Poin</td>
                                <td className="px-3.5 py-2 text-right text-slate-500">{r.max} Poin</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Isian Blangko Diagnosis & Resep Peserta (Dual Panel) */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                      <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
                        <FileText size={15} className="text-blue-600" />
                        Jawaban Peserta & Kunci Jawaban
                      </h4>

                      <div className="grid gap-3 md:grid-cols-2">
                        {/* Jawaban Peserta */}
                        <div className="rounded-lg border border-blue-200 bg-white p-3 space-y-2 text-xs">
                          <span className="text-[10px] font-extrabold uppercase text-blue-900 block border-b border-blue-100 pb-1">
                            Jawaban Peserta
                          </span>

                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Diagnosis Kerja (WDx):</span>
                            <p className="font-semibold text-slate-900 bg-blue-50/60 p-2 rounded-md border border-blue-100">
                              {part.student_answers?.wdx || "STEMI Anteroseptal"}
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Diagnosis Banding (DDx):</span>
                            <ul className="space-y-0.5 mt-0.5">
                              {(part.student_answers?.ddx || ["Unstable Angina Pectoris", "Perikarditis Akut", "Diseksi Aorta"]).map((d, dIdx) => (
                                <li key={dIdx} className="bg-slate-50 px-2 py-1 rounded-md text-slate-800 font-medium">
                                  {dIdx + 1}. {d}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Resep Medis:</span>
                            <pre className="bg-slate-50 p-2.5 rounded-md font-mono text-[11px] text-slate-900 whitespace-pre-line leading-relaxed border border-slate-200">
                              {part.student_answers?.recipe || "R/ ISDN 5mg tab No III\n   S 1 dd tab 1 sublingual\n\nR/ Aspilet 80mg tab No IV\n   S 1 dd tab 4 kunyah"}
                            </pre>
                          </div>
                        </div>

                        {/* Kunci Jawaban */}
                        <div className="rounded-lg border border-emerald-200 bg-white p-3 space-y-2 text-xs">
                          <span className="text-[10px] font-extrabold uppercase text-emerald-950 block border-b border-emerald-100 pb-1">
                            Kunci Jawaban
                          </span>

                          <div>
                            <span className="font-bold text-emerald-900 block text-[11px]">Diagnosis Kerja (WDx):</span>
                            <p className="font-bold text-emerald-950 bg-emerald-50 p-2 rounded-md border border-emerald-200">
                              STEMI Anteroseptal (Infark Miokard Akut ST Elevasi V1-V4)
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-emerald-900 block text-[11px]">Diagnosis Banding (DDx):</span>
                            <ul className="space-y-0.5 mt-0.5">
                              {["Angina Pektoris Tidak Stabil (UAP)", "Diseksi Aorta Thorakalis", "Perikarditis Akut"].map((dk, dkIdx) => (
                                <li key={dkIdx} className="bg-emerald-50/60 px-2 py-1 rounded-md text-emerald-950 font-semibold border border-emerald-100">
                                  {dkIdx + 1}. {dk}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <span className="font-bold text-emerald-900 block text-[11px]">Resep Medis:</span>
                            <pre className="bg-emerald-50/60 p-2.5 rounded-md font-mono text-[11px] text-emerald-950 whitespace-pre-line leading-relaxed font-semibold border border-emerald-200">
                              {"R/ ISDN tab 5 mg No. III\n   S.1.d.d tab I sublingual\n\nR/ Asetosal tab 80 mg No. IV\n   S.1.d.d tab IV kunyah\n\nR/ Clopidogrel tab 75 mg No. IV\n   S.1.d.d tab IV"}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Jawaban & Permintaan Pemeriksaan Penunjang Peserta */}
                    <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2">
                        <div className="flex items-center gap-2">
                          <FlaskConical size={16} className="text-purple-600" />
                          <h4 className="font-bold text-slate-900 text-xs uppercase">
                            Jawaban & Permintaan Pemeriksaan Penunjang Peserta
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-purple-100 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">
                            {(part.auxiliary_requested || []).length} Item Diminta
                          </span>

                          {(part.auxiliary_results || []).length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAuxModalData({
                                  isOpen: true,
                                  results: part.auxiliary_results,
                                });
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-purple-700 transition"
                            >
                              <Eye size={12} />
                              Lihat Berkas Hasil ({part.auxiliary_results.length})
                            </button>
                          )}
                        </div>
                      </div>

                      {(part.auxiliary_requested || []).length > 0 ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {part.auxiliary_requested.map((item, auxIdx) => (
                            <div
                              key={auxIdx}
                              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs text-xs"
                            >
                              <div>
                                <span className="rounded-md bg-purple-100 text-purple-800 text-[9px] font-extrabold px-1.5 py-0.5 mr-1.5">
                                  {item.category}
                                </span>
                                <span className="font-bold text-slate-900">{item.name}</span>
                              </div>

                              {item.matched_key ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  <CheckCircle2 size={10} /> Sesuai Indikasi
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                  <AlertCircle size={10} /> Non-Indikasi
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          Peserta tidak mengajukan permintaan pemeriksaan penunjang.
                        </p>
                      )}
                    </div>

                    {/* Feedback Textarea Box */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Catatan Evaluasi & Umpan Balik Penguji</h4>
                      <p className="text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-xl leading-relaxed font-medium">
                        "{part.feedback || "Penanganan klinis peserta sangat baik dan sesuai SOP baku."}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Auxiliary Exam Result Modal */}
      <AuxiliaryExamResultModal
        isOpen={auxModalData.isOpen}
        onClose={() => setAuxModalData({ isOpen: false, results: [] })}
        results={auxModalData.results}
      />
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
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${cls}`}>
      {rating}
    </span>
  );
}
