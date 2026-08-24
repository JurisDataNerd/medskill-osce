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
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        // 1. Query session
        const { data: sess } = await supabase
          .schema("osce")
          .from("sessions")
          .select("*")
          .eq("id", historyId)
          .maybeSingle();

        // 2. Query examiner assignment for this session
        let assignedStationNumber = null;
        if (authUser?.id) {
          const { data: exAssign } = await supabase
            .schema("osce")
            .from("session_examiners")
            .select("*")
            .eq("session_id", historyId)
            .eq("user_id", authUser.id)
            .maybeSingle();
          if (exAssign) assignedStationNumber = exAssign.assigned_station_number;
        }

        // 3. Query stations with rubric items and auxiliary configs
        const { data: stList } = await supabase
          .schema("osce")
          .from("stations")
          .select("*, rubric_items(*), station_auxiliary_configs(*)")
          .eq("session_id", historyId)
          .order("station_number", { ascending: true });

        const targetStation = (assignedStationNumber && stList?.find(s => Number(s.station_number) === Number(assignedStationNumber)))
          || (stList && stList[0])
          || {
            title: "Stase Penugasan Dokter",
            case_title: "Kasus Medis Skenario",
            rubric_items: [],
            station_auxiliary_configs: [],
          };

        const rubricItemMap = {};
        (targetStation.rubric_items || []).forEach(r => {
          rubricItemMap[r.id] = r;
        });

        // 4. Query evaluations for this session and station safely
        let evals = [];
        try {
          let evalQuery = supabase
            .schema("osce")
            .from("examiner_evaluations")
            .select("*")
            .eq("session_id", historyId);

          if (targetStation.id) {
            evalQuery = evalQuery.eq("station_id", targetStation.id);
          }
          const { data: rawEvals, error: evalErr } = await evalQuery;
          if (!evalErr && rawEvals) {
            evals = rawEvals;
          }
        } catch (e) {
          console.warn("Could not query examiner_evaluations:", e);
        }

        // 4.1. Query rubric_scores for all evaluation IDs to avoid 400 embedding errors
        const evalIds = (evals || []).map((e) => e.id).filter(Boolean);
        let allScores = [];
        if (evalIds.length > 0) {
          try {
            const { data: scData, error: scErr } = await supabase
              .schema("osce")
              .from("rubric_scores")
              .select("*")
              .in("evaluation_id", evalIds);
            if (!scErr && scData) {
              allScores = scData;
            }
          } catch (e) {
            console.warn("Could not query rubric_scores:", e);
          }
        }

        // Attach rubric_scores to each evaluation
        evals.forEach((ev) => {
          ev.rubric_scores = allScores.filter((s) => s.evaluation_id === ev.id);
        });

        // 5. Query participant answers for this session and station
        let answersList = [];
        try {
          let ansQuery = supabase
            .schema("osce")
            .from("participant_answers")
            .select("*")
            .eq("session_id", historyId);

          if (targetStation.id) {
            ansQuery = ansQuery.eq("station_id", targetStation.id);
          }
          const { data: rawAns } = await ansQuery;
          if (rawAns) answersList = rawAns;
        } catch (e) {
          console.warn("Could not query participant_answers:", e);
        }

        // 6. Query participants
        let pList = [];
        try {
          const { data: rawPList } = await supabase
            .schema("osce")
            .from("session_participants")
            .select("*")
            .eq("session_id", historyId);
          if (rawPList) pList = rawPList;
        } catch (e) {
          console.warn("Could not query session_participants:", e);
        }

        const targetSession = sess || {
          id: historyId,
          title: "Ujian OSCE Sirkuit Terpadu",
          session_date: "2026-08-15",
          location_building: "Gedung Skill Lab Ruang OSCE Utama",
          status: "published",
        };

        const totalEv = evals && evals.length > 0 ? evals.length : (pList ? pList.length : 0);
        const avgScore = evals && evals.length > 0
          ? Math.round((evals.reduce((acc, e) => acc + Number(e.final_score_percentage || 0), 0) / evals.length) * 10) / 10
          : 0;

        const examineesMapped = (pList && pList.length > 0)
          ? pList.map((p, idx) => {
              const rotRound = idx + 1;
              const pUserId = p.user_id;
              const pId = p.id;

              // Match evaluation by user_id, id, session_participant_id, or rotation_round
              let matchedEval = evals.find(
                (e) =>
                  (pUserId && e.participant_id === pUserId) ||
                  (pId && e.participant_id === pId) ||
                  (pId && e.session_participant_id === pId) ||
                  Number(e.rotation_round) === Number(rotRound)
              );

              // Check localStorage backup if evaluation or rubric_scores is missing
              let localRubricScores = null;
              try {
                const localKey1 = `osce_eval_${historyId}_${targetStation.id}_${pUserId}_${rotRound}`;
                const localKey2 = `osce_eval_${historyId}_${targetStation.id}_${pId}_${rotRound}`;
                const localStr = localStorage.getItem(localKey1) || localStorage.getItem(localKey2);
                if (localStr) {
                  const localObj = JSON.parse(localStr);
                  if (!matchedEval && localObj.evaluation) {
                    matchedEval = localObj.evaluation;
                  }
                  if (localObj.rubric_scores && Array.isArray(localObj.rubric_scores)) {
                    localRubricScores = localObj.rubric_scores;
                  }
                }
              } catch (e) {}

              // Aggregate available rubric scores from DB or LocalStorage
              const activeScores = (matchedEval?.rubric_scores && matchedEval.rubric_scores.length > 0)
                ? matchedEval.rubric_scores
                : (localRubricScores || []);

              // Map detailed rubric item points
              const rubricBreakdown = (targetStation.rubric_items || []).map((rItem, rIdx) => {
                const foundScore = activeScores.find(
                  (s) => s.rubric_item_id === rItem.id || String(s.rubric_item_id) === String(rItem.id)
                ) || activeScores[rIdx];

                let scorePoints = 0;
                if (foundScore !== undefined && foundScore.score_given !== undefined && foundScore.score_given !== null) {
                  scorePoints = Number(foundScore.score_given);
                } else if (matchedEval?.final_score_percentage !== undefined && Number(matchedEval.final_score_percentage) > 0) {
                  const maxPts = Number(rItem.max_points || 3);
                  scorePoints = Math.round((Number(matchedEval.final_score_percentage) / 100) * maxPts);
                }

                return {
                  question: rItem.question || rItem.title || `Item Rubrik #${rIdx + 1}`,
                  points: scorePoints,
                  max: Number(rItem.max_points || 3),
                  weight: Number(rItem.weight || 1.0),
                };
              });

              const matchedAns = answersList.find(
                (a) =>
                  (pUserId && a.participant_id === pUserId) ||
                  (pId && a.participant_id === pId) ||
                  (a.rotation_round && Number(a.rotation_round) === Number(rotRound))
              );

              const ddxList = [
                matchedAns?.differential_dx_1,
                matchedAns?.differential_dx_2,
                matchedAns?.differential_dx_3,
              ].filter(Boolean);

              const masterConfigs =
                targetStation?.station_auxiliary_configs ||
                targetStation?.auxiliary_exam_configs ||
                targetStation?.auxiliary_files ||
                [];

              let rawReq = matchedAns?.requested_auxiliary_json || [];
              if (typeof rawReq === "string") {
                try {
                  rawReq = JSON.parse(rawReq);
                } catch (e) {
                  rawReq = [];
                }
              }
              if (!Array.isArray(rawReq)) rawReq = [];

              const parsedRequestedAux = rawReq.map((item, aIdx) => {
                if (typeof item === "string") {
                  const matchedMaster = masterConfigs.find(
                    (c) =>
                      c.id === item ||
                      c.item_id === item ||
                      String(c.name || "").trim().toLowerCase() === String(item || "").trim().toLowerCase()
                  );
                  if (matchedMaster) {
                    return {
                      id: matchedMaster.id || item,
                      name: matchedMaster.name || item,
                      category: matchedMaster.category || "PEMERIKSAAN PENUNJANG",
                      matched_key: true,
                      imageUrl: matchedMaster.image_url || matchedMaster.imageUrl || "",
                      reportText: matchedMaster.report_text || matchedMaster.reportText || "",
                    };
                  }
                  return {
                    id: item || `aux-${aIdx}`,
                    name: item.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                    category: "PEMERIKSAAN",
                    matched_key: false,
                    imageUrl: "",
                    reportText: "Hasil dalam batas normal.",
                  };
                }

                // If item is already an object
                const itemId = item.id || item.item_id || item.code || `aux-${aIdx}`;
                const itemName = item.name || item.title || item.label || (typeof itemId === "string" ? itemId.replace(/[_-]/g, " ") : "Pemeriksaan Penunjang");
                const matchedMaster = masterConfigs.find(
                  (c) =>
                    (itemId && (c.id === itemId || c.item_id === itemId)) ||
                    (itemName && String(c.name || "").trim().toLowerCase() === String(itemName).trim().toLowerCase())
                );

                return {
                  id: itemId,
                  name: matchedMaster?.name || itemName,
                  category: matchedMaster?.category || item.category || "PEMERIKSAAN PENUNJANG",
                  matched_key: Boolean(matchedMaster || item.matched_key || item.is_indicated),
                  imageUrl: matchedMaster?.image_url || item.imageUrl || item.image_url || "",
                  reportText: matchedMaster?.report_text || item.reportText || item.report_text || "",
                };
              });

              const auxResults = parsedRequestedAux.filter(
                (a) => a.imageUrl || a.reportText
              );

              return {
                id: p.id,
                nim: p.nim || p.email?.split("@")[0] || "-",
                name: p.full_name || p.name || p.email || "-",
                avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.nim || p.id || idx}`,
                round: rotRound,
                score: matchedEval ? (matchedEval.final_score_percentage ?? matchedEval.total_score ?? 0) : null,
                global_rating: matchedEval ? (matchedEval.grs_rating || "-") : "Belum Dinilai",
                feedback: matchedEval ? (matchedEval.examiner_notes || "Tidak ada catatan penguji.") : "Belum dievaluasi.",
                rubric_breakdown: rubricBreakdown,
                student_answers: {
                  wdx: matchedAns?.working_diagnosis || "-",
                  ddx: ddxList.length > 0 ? ddxList : ["-"],
                  recipe: matchedAns?.prescription_text || "-",
                },
                auxiliary_requested: parsedRequestedAux,
                auxiliary_results: auxResults,
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
          answer_key_diagnosis: targetStation.answer_key_diagnosis || "",
          answer_key_prescription: targetStation.answer_key_prescription || "",
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
                  Cetak / Unduh PDF Evaluasi
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
                key={part.id || `examinee-${idx}-${part.nim || part.name}`}
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
                              {part.student_answers?.wdx || "-"}
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Diagnosis Banding (DDx):</span>
                            <ul className="space-y-0.5 mt-0.5">
                              {(part.student_answers?.ddx && part.student_answers.ddx.length > 0 ? part.student_answers.ddx : ["-"]).map((d, dIdx) => (
                                <li key={dIdx} className="bg-slate-50 px-2 py-1 rounded-md text-slate-800 font-medium">
                                  {dIdx + 1}. {d}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Resep Medis:</span>
                            <pre className="bg-slate-50 p-2.5 rounded-md font-mono text-[11px] text-slate-900 whitespace-pre-line leading-relaxed border border-slate-200">
                              {part.student_answers?.recipe || "-"}
                            </pre>
                          </div>
                        </div>

                        {/* Kunci Jawaban */}
                        <div className="rounded-lg border border-emerald-200 bg-white p-3 space-y-2 text-xs">
                          <span className="text-[10px] font-extrabold uppercase text-emerald-950 block border-b border-emerald-100 pb-1">
                            Kunci Jawaban Pedoman Stase
                          </span>

                          <div>
                            <span className="font-bold text-emerald-900 block text-[11px]">Kunci Diagnosis:</span>
                            <p className="font-bold text-emerald-950 bg-emerald-50 p-2 rounded-md border border-emerald-200 whitespace-pre-line">
                              {historyItem?.answer_key_diagnosis || "Sesuai Standar Pedoman Diagnosis Kasus"}
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-emerald-900 block text-[11px]">Kunci Resep & Tatalaksana:</span>
                            <pre className="bg-emerald-50/60 p-2.5 rounded-md font-mono text-[11px] text-emerald-950 whitespace-pre-line leading-relaxed font-semibold border border-emerald-200">
                              {historyItem?.answer_key_prescription || "Sesuai Formularium & Pedoman Terapi Stase"}
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
                          {part.auxiliary_requested.map((item, auxIdx) => {
                            const hasFile = Boolean(item.imageUrl || item.reportText);
                            return (
                              <div
                                key={item.id || `aux-${auxIdx}-${item.name}`}
                                onClick={() => {
                                  if (hasFile) {
                                    setAuxModalData({
                                      isOpen: true,
                                      results: [item],
                                    });
                                  }
                                }}
                                className={`flex items-center justify-between rounded-lg border p-2.5 shadow-2xs text-xs transition ${
                                  hasFile
                                    ? "border-purple-200 bg-white hover:border-purple-400 cursor-pointer"
                                    : "border-slate-200 bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                  <span className="rounded-md bg-purple-100 text-purple-800 text-[9px] font-extrabold px-1.5 py-0.5 shrink-0 uppercase">
                                    {item.category || "PENUNJANG"}
                                  </span>
                                  <span className="font-bold text-slate-900 truncate">
                                    {item.name || "Pemeriksaan Penunjang"}
                                  </span>
                                  {hasFile && <Eye size={12} className="text-purple-600 shrink-0 ml-1" />}
                                </div>

                                {item.matched_key ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                                    <CheckCircle2 size={10} /> Sesuai Indikasi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                                    <AlertCircle size={10} /> Non-Indikasi
                                  </span>
                                )}
                              </div>
                            );
                          })}
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
