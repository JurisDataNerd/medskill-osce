import { X, CheckCircle2, Award, FileText, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ParticipantAnswerModal({ open, onClose, participantId, participantName }) {
  if (!open) return null;

  const [expandedStation, setExpandedStation] = useState(1);
  const [loading, setLoading] = useState(true);
  const [scorecard, setScorecard] = useState(null);

  useEffect(() => {
    async function loadParticipantAnswers() {
      if (!participantId) {
        setScorecard(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch answers / evaluations for this participant from Supabase
        const { data: answersData, error } = await supabase
          .schema("osce")
          .from("participant_answers")
          .select(`
            *,
            stations (*)
          `)
          .eq("participant_id", participantId);

        if (error || !answersData || answersData.length === 0) {
          // Try querying examiner_evaluations if participant_answers is empty
          const { data: evalData } = await supabase
            .schema("osce")
            .from("examiner_evaluations")
            .select(`
              *,
              stations (*)
            `)
            .eq("participant_id", participantId);

          if (evalData && evalData.length > 0) {
            const stationResults = evalData.map((ev, idx) => ({
              station_number: ev.stations?.station_number || idx + 1,
              title: ev.stations?.title || `Stase ${ev.stations?.station_number || idx + 1}`,
              examiner_name: "Dokter Penguji Terverifikasi",
              score: ev.total_score || 0,
              max_score: 100,
              checklist_items: ev.rubric_scores || [],
              examiner_feedback: ev.global_feedback || ev.feedback || "Telah dievaluasi.",
            }));

            const totalSum = stationResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
            const avgScore = stationResults.length > 0 ? (totalSum / stationResults.length).toFixed(1) : 0;

            setScorecard({
              participant_name: participantName || "Peserta Ujian",
              nim: participantId.slice(0, 8),
              session_title: "Sesi Ujian Simulasi OSCE Live",
              total_score: avgScore,
              final_grade: avgScore >= 75 ? "LULUS" : "TIDAK LULUS",
              global_rating: avgScore >= 75 ? "Baik" : "Perlu Perbaikan",
              station_results: stationResults,
            });
          } else {
            setScorecard(null);
          }
        } else {
          const stationResults = answersData.map((ans, idx) => ({
            station_number: ans.stations?.station_number || idx + 1,
            title: ans.stations?.title || `Stase ${ans.stations?.station_number || idx + 1}`,
            examiner_name: "Dokter Penguji",
            score: ans.score || 0,
            max_score: 100,
            checklist_items: [
              {
                item: "Anamnesis Terarah",
                answer_key: ans.anamnesis_notes || "-",
                earned_points: ans.anamnesis_notes ? 3 : 0,
                max_points: 3,
              },
              {
                item: "Pemeriksaan Fisik",
                answer_key: ans.physical_exam_notes || "-",
                earned_points: ans.physical_exam_notes ? 3 : 0,
                max_points: 3,
              },
              {
                item: "Diagnosis Kerja",
                answer_key: ans.working_diagnosis || "-",
                earned_points: ans.working_diagnosis ? 3 : 0,
                max_points: 3,
              },
            ],
            examiner_feedback: ans.education_notes || "Telah dikerjakan.",
          }));

          const totalSum = stationResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
          const avgScore = stationResults.length > 0 ? (totalSum / stationResults.length).toFixed(1) : 0;

          setScorecard({
            participant_name: participantName || "Peserta Ujian",
            nim: participantId.slice(0, 8),
            session_title: "Sesi Ujian Simulasi OSCE Live",
            total_score: avgScore,
            final_grade: avgScore >= 75 ? "LULUS" : "TIDAK LULUS",
            global_rating: avgScore >= 75 ? "Baik" : "Perlu Perbaikan",
            station_results: stationResults,
          });
        }
      } catch (err) {
        console.error("Error loading participant answers for modal:", err);
        setScorecard(null);
      } finally {
        setLoading(false);
      }
    }

    loadParticipantAnswers();
  }, [participantId, participantName]);

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
              <h2 className="text-lg font-bold">Lembar Nilai & Rekap Jawaban Peserta OSCE</h2>
              <p className="text-xs text-slate-300">
                {participantName || "Peserta Ujian"} (ID: {participantId || "-"})
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[300px] flex flex-col justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
              <Loader2 size={28} className="animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Memuat Rekap Jawaban dari Database Supabase...</span>
            </div>
          ) : !scorecard || !scorecard.station_results || scorecard.station_results.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-xs text-slate-500 space-y-2 my-auto">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-1">
                <AlertCircle size={28} />
              </div>
              <p className="font-bold text-slate-800 text-base">Belum Ada Rekap Jawaban Terdaftar</p>
              <p className="max-w-md text-slate-500 font-medium">
                Peserta ini belum menyerahkan lembar jawaban atau belum mendapatkan evaluasi nilai dari Dokter Penguji pada sesi ujian ini.
              </p>
            </div>
          ) : (
            <div className="space-y-6 w-full my-0">
              {/* Summary Banner */}
              <div className="grid gap-4 sm:grid-cols-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Nilai Total Rata-Rata</p>
                  <p className="text-2xl font-black text-blue-600">{scorecard.total_score} / 100</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Status Kelulusan</p>
                  <span className={`inline-flex items-center gap-1 mt-1 rounded-full px-3 py-1 text-xs font-bold ${
                    scorecard.final_grade.includes("LULUS") && !scorecard.final_grade.includes("TIDAK")
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}>
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
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    Rincian Lembar Jawaban & Rubrik Stase
                  </span>
                  <span className="text-xs text-slate-500 font-normal">
                    {scorecard.station_results.length} Stase Terdaftar
                  </span>
                </h3>

                <div className="space-y-3">
                  {scorecard.station_results.map((stg) => {
                    const isExpanded = expandedStation === stg.station_number;

                    return (
                      <div
                        key={stg.station_number}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white transition shadow-2xs"
                      >
                        <button
                          onClick={() => setExpandedStation(isExpanded ? null : stg.station_number)}
                          className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 font-extrabold text-blue-800 text-xs">
                              {stg.station_number}
                            </span>
                            <div>
                              <p className="font-bold text-xs text-slate-900">{stg.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Penguji: {stg.examiner_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                              Skor Stase: {stg.score} / {stg.max_score}
                            </span>
                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 text-xs">
                            {/* Examiner Feedback */}
                            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                              <p className="font-bold text-blue-900 text-[11px] uppercase">Catatan & Umpan Balik Penguji:</p>
                              <p className="text-slate-700 mt-0.5 font-medium">"{stg.examiner_feedback}"</p>
                            </div>

                            {/* Checklist items & criteria answers */}
                            {stg.checklist_items && stg.checklist_items.length > 0 && (
                              <div>
                                <p className="font-bold text-slate-800 mb-2 uppercase text-[11px]">
                                  Checklist Soal & Kriteria Jawaban:
                                </p>

                                <div className="space-y-2">
                                  {stg.checklist_items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-lg border border-slate-200 bg-white p-3 space-y-1 shadow-2xs"
                                    >
                                      <div className="flex items-center justify-between font-bold text-slate-900">
                                        <span>{idx + 1}. {item.item || item.question}</span>
                                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                                          Poin: {item.earned_points || item.points || 0} / {item.max_points || 3}
                                        </span>
                                      </div>

                                      <p className="text-emerald-800 text-[11px] font-medium bg-emerald-50/60 p-1.5 rounded border border-emerald-100">
                                        <strong className="text-emerald-900">Kunci Jawaban:</strong> {item.answer_key || item.notes || "-"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
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
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50 p-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
          >
            Tutup Rekap Nilai
          </button>
        </div>
      </div>
    </div>
  );
}
