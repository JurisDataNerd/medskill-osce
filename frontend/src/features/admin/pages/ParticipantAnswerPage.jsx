import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  UserCheck,
  AlertCircle,
  Loader2,
  MessageSquare,
  Stethoscope,
  Pencil,
  Activity,
  FileCode,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ParticipantAnswerPage() {
  const { participantId } = useParams();
  const navigate = useNavigate();

  const [expandedStation, setExpandedStation] = useState(1);
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScorecard() {
      try {
        setLoading(true);

        // 1. Query osce.session_participants
        const { data: p, error: pErr } = await supabase
          .schema("osce")
          .from("session_participants")
          .select("*")
          .or(`id.eq.${participantId},user_id.eq.${participantId}`)
          .maybeSingle();

        if (pErr) console.warn("Could not fetch participant profile:", pErr);

        const fullName = p?.full_name || p?.email || "Peserta Ujian";
        const nim = p?.nim || (p?.email ? p.email.split("@")[0] : "-");
        const sessionId = p?.session_id;

        if (!sessionId) {
          setScorecard(null);
          return;
        }

        // 2. Query session title & info
        const { data: session } = await supabase
          .schema("osce")
          .from("sessions")
          .select("*")
          .eq("id", sessionId)
          .maybeSingle();

        // 3. Query stations & rubric_items for session
        const { data: stations } = await supabase
          .schema("osce")
          .from("stations")
          .select(`
            *,
            rubric_items (*)
          `)
          .eq("session_id", sessionId)
          .order("sort_order", { ascending: true });

        // 4. Query session_examiners assigned
        const { data: examiners } = await supabase
          .schema("osce")
          .from("session_examiners")
          .select("*")
          .eq("session_id", sessionId);

        // 5. Query participant_answers for participant_id
        const targetUserId = p?.user_id || participantId;
        const { data: answers } = await supabase
          .schema("osce")
          .from("participant_answers")
          .select("*")
          .eq("session_id", sessionId)
          .eq("participant_id", targetUserId);

        // 6. Query examiner_evaluations & rubric_scores
        const { data: evaluations } = await supabase
          .schema("osce")
          .from("examiner_evaluations")
          .select(`
            *,
            rubric_scores (*)
          `)
          .eq("session_id", sessionId)
          .eq("participant_id", targetUserId);

        // 7. Format station_results
        let totalScoreEarned = 0;
        let totalScorePossible = 0;
        let evaluatedCount = 0;
        const grsList = [];

        const formattedStations = (stations || [])
          .filter((st) => !st.is_break) // exclude break slots
          .map((st, idx) => {
            const stNum = st.station_number || idx + 1;
            const exDoc = (examiners || []).find(
              (e) => Number(e.assigned_station_number) === Number(stNum)
            );
            const ans = (answers || []).find((a) => a.station_id === st.id);
            const evalRow = (evaluations || []).find((e) => e.station_id === st.id);

            if (evalRow) {
              evaluatedCount++;
              totalScoreEarned += Number(evalRow.total_points_earned || 0);
              totalScorePossible += Number(evalRow.max_points_possible || 0);
              if (evalRow.grs_rating) grsList.push(evalRow.grs_rating);
            }

            const rubrics = st.rubric_items || [];
            const checklistItems = rubrics.map((r) => {
              const scoreRow = (evalRow?.rubric_scores || []).find(
                (rs) => rs.rubric_item_id === r.id
              );
              return {
                item: r.question || "Item Rubrik Penilaian",
                answer_key: r.answer_key || "-",
                max_points: r.max_points || 3,
                earned_points: scoreRow ? Number(scoreRow.score_given) : 0,
                notes: scoreRow?.feedback || "",
              };
            });

            return {
              station_id: st.id,
              station_number: stNum,
              title: st.case_title || st.title || `Stase Ujian Klinik ${stNum}`,
              system_organ: st.system_organ || null,
              examiner_name: exDoc?.full_name || "Dokter Penguji",
              examiner_specialty: exDoc?.specialty || "Spesialis Medis",
              score: evalRow ? Math.round(Number(evalRow.final_score_percentage || 0)) : 0,
              max_score: 100,
              grs_rating: evalRow?.grs_rating || (evalRow ? "SATISFACTORY" : "BELUM DINILAI"),
              examiner_feedback:
                evalRow?.examiner_notes || (evalRow ? "Penilaian telah dikirim." : "Belum dievaluasi oleh penguji."),
              checklist_items: checklistItems,
              participant_answer: ans
                ? {
                    working_diagnosis: ans.working_diagnosis || null,
                    differential_dx_1: ans.differential_dx_1 || null,
                    differential_dx_2: ans.differential_dx_2 || null,
                    differential_dx_3: ans.differential_dx_3 || null,
                    prescription_text: ans.prescription_text || null,
                    anamnesis_notes: ans.anamnesis_notes || null,
                    physical_exam_notes: ans.physical_exam_notes || null,
                    requested_auxiliary_json: ans.requested_auxiliary_json || [],
                    status: ans.status || "in_progress",
                  }
                : null,
            };
          });

        const overallPct =
          totalScorePossible > 0
            ? (totalScoreEarned / totalScorePossible) * 100
            : evaluatedCount > 0
            ? formattedStations.reduce((acc, curr) => acc + curr.score, 0) / evaluatedCount
            : 0;

        let finalGrade = "BELUM DINILAI";
        if (evaluatedCount > 0) {
          if (overallPct >= 85) finalGrade = "LULUS (Superior)";
          else if (overallPct >= 70) finalGrade = "LULUS (Satisfactory)";
          else if (overallPct >= 60) finalGrade = "LULUS (Borderline)";
          else finalGrade = "TIDAK LULUS";
        }

        let globalRatingText = "Belum Dinilai";
        if (grsList.length > 0) {
          const firstGrs = grsList[0];
          if (firstGrs === "SUPERIOR") globalRatingText = "Superior (Sangat Baik)";
          else if (firstGrs === "SATISFACTORY") globalRatingText = "Satisfactory (Baik)";
          else if (firstGrs === "BORDERLINE") globalRatingText = "Borderline (Cukup)";
          else if (firstGrs === "UNSATISFACTORY") globalRatingText = "Unsatisfactory (Perlu Perbaikan)";
          else globalRatingText = firstGrs;
        }

        setScorecard({
          participant_name: fullName,
          nim: nim,
          institution: "Fakultas Kedokteran - MedSkill",
          session_title: session?.title || "Sesi Ujian OSCE",
          total_score: Math.round(overallPct * 10) / 10,
          final_grade: finalGrade,
          global_rating: globalRatingText,
          station_results: formattedStations,
        });
      } catch (err) {
        console.error("Error loading participant scorecard:", err);
      } finally {
        setLoading(false);
      }
    }

    if (participantId) loadScorecard();
  }, [participantId]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[450px] flex-col items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <span>Memuat Lembar Jawaban & Evaluasi...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!scorecard) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-xs text-slate-500 space-y-3">
          <p className="font-bold text-slate-700">Data peserta atau sesi tidak ditemukan.</p>
          <button
            onClick={() => navigate("/admin/live")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            Kembali ke Monitor Langsung
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/live")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Live Control Room</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase">
                  MONITOR LEMBAR JAWABAN REALTIME
                </span>
                <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                  {scorecard.final_grade}
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight pt-1">
                {scorecard.participant_name} ({scorecard.nim})
              </h1>
            </div>
          </div>
        </div>

        {/* Participant Identity Overview Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">{scorecard.participant_name}</h2>
                <p className="text-xs text-slate-500 font-medium">{scorecard.institution}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Nilai Akumulasi Evaluasi:</span>
              <span className="text-2xl font-black text-blue-600">{scorecard.total_score.toFixed(1)} / 100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Judul Sesi OSCE</span>
              <span className="text-xs font-extrabold text-slate-900 line-clamp-1">{scorecard.session_title}</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Global Rating Scale (GRS)</span>
              <span className="text-xs font-extrabold text-emerald-700">{scorecard.global_rating}</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Status Kelulusan</span>
              <span className="text-xs font-extrabold text-emerald-700">{scorecard.final_grade}</span>
            </div>
          </div>
        </div>

        {/* Station Breakdown Cards */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-blue-600" />
              Transkrip Jawaban Peserta & Hasil Rubrik Per Stase ({scorecard.station_results.length} Stase)
            </h2>
          </div>

          <div className="space-y-3">
            {scorecard.station_results.map((stg) => {
              const isExpanded = expandedStation === stg.station_number;
              const ans = stg.participant_answer;

              return (
                <div key={stg.station_number} className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                  <div
                    onClick={() => setExpandedStation(isExpanded ? null : stg.station_number)}
                    className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xs">
                        {stg.station_number}
                      </span>
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-900">{stg.title}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Dokter Penguji: {stg.examiner_name} ({stg.examiner_specialty})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                        Skor Evaluasi: {stg.score} / {stg.max_score}
                      </span>
                      <button className="text-slate-400 hover:text-slate-700">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-5 animate-in fade-in duration-150">
                      {/* Participant Answers Section */}
                      {ans && (
                        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                          <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide flex items-center gap-1.5 border-b border-blue-200/80 pb-2">
                            <FileText size={15} className="text-blue-600" />
                            Jawaban Lembar Kerja Peserta (Jawaban Asli Realtime)
                          </h4>

                          <div className="grid gap-3 md:grid-cols-2">
                            {ans.working_diagnosis && (
                              <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-1">
                                <span className="text-[10px] font-bold text-blue-600 uppercase block">Diagnosis Kerja (WDx):</span>
                                <p className="text-xs font-extrabold text-slate-900">{ans.working_diagnosis}</p>
                              </div>
                            )}

                            {(ans.differential_dx_1 || ans.differential_dx_2) && (
                              <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-1">
                                <span className="text-[10px] font-bold text-blue-600 uppercase block">Diagnosis Banding (DDx):</span>
                                <p className="text-xs font-semibold text-slate-800">
                                  {[ans.differential_dx_1, ans.differential_dx_2, ans.differential_dx_3]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </p>
                              </div>
                            )}
                          </div>

                          {ans.prescription_text && (
                            <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-1">
                              <span className="text-[10px] font-bold text-blue-600 uppercase block">Resep Obat & Tatalaksana (Prescription):</span>
                              <p className="text-xs font-mono font-bold text-slate-900 whitespace-pre-line">{ans.prescription_text}</p>
                            </div>
                          )}

                          {(ans.anamnesis_notes || ans.physical_exam_notes) && (
                            <div className="grid gap-3 md:grid-cols-2">
                              {ans.anamnesis_notes && (
                                <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-1">
                                  <span className="text-[10px] font-bold text-blue-600 uppercase block">Catatan Anamnesis:</span>
                                  <p className="text-xs text-slate-700 whitespace-pre-line">{ans.anamnesis_notes}</p>
                                </div>
                              )}

                              {ans.physical_exam_notes && (
                                <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-1">
                                  <span className="text-[10px] font-bold text-blue-600 uppercase block">Catatan Pemeriksaan Fisik:</span>
                                  <p className="text-xs text-slate-700 whitespace-pre-line">{ans.physical_exam_notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rubric Items Checklist Section */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Poin Rubrik Penilaian Penguji (Poin 0-3):
                        </span>

                        {stg.checklist_items.length === 0 ? (
                          <p className="text-xs text-slate-500 font-medium italic">Tidak ada item rubrik terkonfigurasi pada stase ini.</p>
                        ) : (
                          stg.checklist_items.map((item, idx) => (
                            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 text-xs shadow-2xs">
                              <div className="flex items-center justify-between font-bold text-slate-900">
                                <span>{item.item}</span>
                                <span className="text-blue-700 font-black">{item.earned_points} / {item.max_points} Pts</span>
                              </div>
                              <p className="text-[11px] text-slate-500">Kunci: {item.answer_key}</p>
                              {item.notes && <p className="text-[11px] font-semibold text-purple-700">Catatan: {item.notes}</p>}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Examiner Feedback */}
                      {stg.examiner_feedback && (
                        <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900 font-medium flex items-center gap-2">
                          <MessageSquare size={16} className="text-purple-600 shrink-0" />
                          <span>Feedback Dokter Penguji ({stg.examiner_name}): "{stg.examiner_feedback}"</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
