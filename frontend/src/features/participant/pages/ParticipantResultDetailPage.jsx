import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Printer,
  Loader2,
  Building2,
  Download,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ParticipantReportPdfModal from "@/features/admin/components/report/ParticipantReportPdfModal";

export default function ParticipantResultDetailPage() {
  const navigate = useNavigate();
  const { resultId } = useParams();

  const [loading, setLoading] = useState(true);
  const [resultItem, setResultItem] = useState(null);
  const [expandedStation, setExpandedStation] = useState(1);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [rawSession, setRawSession] = useState(null);
  const [rawStations, setRawStations] = useState([]);
  const [rawEvaluations, setRawEvaluations] = useState([]);
  const [rawParticipant, setRawParticipant] = useState(null);

  useEffect(() => {
    async function loadResultDetail() {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let p = null;

        if (user) {
          const { data: partBySession } = await supabase
            .schema("osce")
            .from("session_participants")
            .select("*")
            .eq("session_id", resultId)
            .or(`user_id.eq.${user.id},email.eq.${user.email}`)
            .maybeSingle();

          if (partBySession) p = partBySession;
        }

        if (!p) {
          const { data: partById } = await supabase
            .schema("osce")
            .from("session_participants")
            .select("*")
            .eq("id", resultId)
            .maybeSingle();

          if (partById) p = partById;
        }

        const targetSessionId = p ? p.session_id : resultId;
        const targetUserId = p?.user_id || user?.id;
        const targetPartId = p?.id || resultId;

        // 1. Fetch Session Info
        const { data: sess } = await supabase
          .schema("osce")
          .from("sessions")
          .select("*")
          .eq("id", targetSessionId)
          .maybeSingle();

        // 2. Fetch Stations of Session with rubric items
        const { data: stationsDb } = await supabase
          .schema("osce")
          .from("stations")
          .select("*, rubric_items(*)")
          .eq("session_id", targetSessionId)
          .order("station_number", { ascending: true });

        // 3. Fetch Session Examiners
        const { data: dbExaminers } = await supabase
          .schema("osce")
          .from("session_examiners")
          .select("*")
          .eq("session_id", targetSessionId);

        // 4. Fetch Examiner Evaluations for Participant with rubric scores safely
        let evals = [];
        try {
          const { data: rawEvals, error: evalErr } = await supabase
            .schema("osce")
            .from("examiner_evaluations")
            .select("*")
            .eq("session_id", targetSessionId);
          if (!evalErr && rawEvals) {
            evals = rawEvals;
          }
        } catch (e) {
          console.warn("Could not fetch examiner_evaluations:", e);
        }

        const evalIds = (evals || []).map((e) => e.id).filter(Boolean);
        let allScores = [];
        if (evalIds.length > 0) {
          try {
            const { data: scData } = await supabase
              .schema("osce")
              .from("rubric_scores")
              .select("*")
              .in("evaluation_id", evalIds);
            if (scData) allScores = scData;
          } catch (e) {
            console.warn("Could not fetch rubric_scores:", e);
          }
        }

        evals.forEach((ev) => {
          ev.rubric_scores = allScores.filter((s) => s.evaluation_id === ev.id);
        });

        // 5. Fetch Participant Answers
        let participantAnswers = [];
        try {
          const { data: rawAnswers } = await supabase
            .schema("osce")
            .from("participant_answers")
            .select("*")
            .eq("session_id", targetSessionId);
          if (rawAnswers) participantAnswers = rawAnswers;
        } catch (e) {}

        const userEvals = (evals || []).filter(
          (ev) =>
            ev.participant_id === targetUserId ||
            ev.participant_id === targetPartId ||
            (user?.id && ev.participant_id === user.id)
        );

        const userAnswers = (participantAnswers || []).filter(
          (ans) =>
            ans.participant_id === targetUserId ||
            ans.participant_id === targetPartId ||
            (user?.id && ans.participant_id === user.id)
        );

        const baseStations = stationsDb && stationsDb.length > 0 
          ? stationsDb 
          : Array.from({ length: sess?.total_stations || 6 }, (_, i) => ({ station_number: i + 1, id: null }));

        const stationsEvaluations = baseStations.map((st, idx) => {
          const stNum = st.station_number || idx + 1;
          const ev = userEvals.find(
            (e) => (st.id && e.station_id === st.id) || Number(e.station_number) === Number(stNum)
          );
          const ex = (dbExaminers || []).find(
            (e) => Number(e.station_number || e.assigned_station_number) === Number(stNum)
          );
          const ans = userAnswers.find(
            (a) => (st.id && a.station_id === st.id) || Number(a.rotation_round) === Number(stNum)
          );

          const isBreak = Boolean(
            st?.is_break ||
            st?.title?.toLowerCase().includes("istirahat") ||
            st?.case_title?.toLowerCase().includes("istirahat")
          );

          const rubricMap = {};
          (st.rubric_items || []).forEach((r) => {
            rubricMap[r.id] = r;
          });

          const rubricScoresList = (ev?.rubric_scores && ev.rubric_scores.length > 0)
            ? ev.rubric_scores.map((sc, scIdx) => {
                const rItem = rubricMap[sc.rubric_item_id];
                return {
                  question: rItem?.question || rItem?.title || `Item Evaluasi Rubrik #${scIdx + 1}`,
                  score_given: Number(sc.score_given || 0),
                  max_points: Number(rItem?.max_points || 3),
                  weight: Number(rItem?.weight || 1.0),
                };
              })
            : (st.rubric_items || []).map((rItem, rIdx) => ({
                question: rItem.question || rItem.title || `Item Evaluasi Rubrik #${rIdx + 1}`,
                score_given: 0,
                max_points: Number(rItem.max_points || 3),
                weight: Number(rItem.weight || 1.0),
              }));

          const ddxList = [ans?.differential_dx_1, ans?.differential_dx_2, ans?.differential_dx_3].filter(Boolean);

          const doctorName = ex?.full_name 
            ? (ex.specialty ? `${ex.full_name}, ${ex.specialty}` : ex.full_name) 
            : (st.assigned_examiner || "Dokter Penguji Terverifikasi");

          return {
            station_number: stNum,
            is_break: isBreak,
            title: isBreak ? `Stase ${stNum}: Istirahat (Rest Station)` : (st.title || `Stase ${stNum}`),
            case_title: st.case_title || (isBreak ? "Stase Istirahat Sirkuit" : "Evaluasi Skenario Klinis"),
            examiner_name: isBreak ? "Stase Istirahat (Tanpa Penguji)" : doctorName,
            score: ev ? Number(ev.final_score_percentage || 0) : 0,
            global_rating: ev?.grs_rating || (isBreak ? "ISTIRAHAT" : "Belum Dinilai"),
            notes: ev?.examiner_notes || (isBreak ? "Tidak ada pengujian pada stase istirahat." : "Belum ada catatan feedback dari penguji."),
            has_eval: Boolean(ev),
            rubric_breakdown: rubricScoresList,
            student_answers: {
              wdx: ans?.working_diagnosis || "-",
              ddx: ddxList.length > 0 ? ddxList : ["-"],
              recipe: ans?.prescription_text || "-",
            },
          };
        });

        const evaluatedList = stationsEvaluations.filter((s) => s.has_eval);

        setRawSession(sess);
        setRawStations(baseStations);
        setRawEvaluations(userEvals);
        setRawParticipant({
          id: p?.id || resultId,
          nim: p?.nim || user?.user_metadata?.nim || "-",
          name: p?.full_name || user?.user_metadata?.full_name || user?.email || "Peserta Ujian",
          rank: 1,
        });

        setResultItem({
          id: resultId,
          title: sess?.title || "Ujian OSCE MedSkill",
          date: sess?.session_date || "Sesuai Jadwal",
          location: sess?.location_building || "Gedung Skill Lab FK",
          participant_name:
            p?.full_name ||
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.email ||
            "Tidak ada data",
          nim: p?.nim || user?.user_metadata?.nim || "-",
          institution:
            p?.institution ||
            p?.university ||
            user?.user_metadata?.institution ||
            user?.user_metadata?.university ||
            "Fakultas Kedokteran",
          total_stations: sess?.total_stations || baseStations.length || 6,
          evaluated_count: evaluatedList.length,
          stations_evaluations: stationsEvaluations,
        });
      } catch (err) {
        console.error("Error loading result detail from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    loadResultDetail();
  }, [resultId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 text-xs font-semibold text-slate-500">
        <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
        Memuat Transkrip Ujian OSCE...
      </div>
    );
  }

  if (!resultItem) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Data hasil ujian tidak ditemukan.
      </div>
    );
  }

  const stations = resultItem.stations_evaluations || [];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Navbar Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-2xs print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <button
            onClick={() => navigate("/participant")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard Utama
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition cursor-pointer"
          >
            <Download size={15} />
            Cetak Transkrip PDF
          </button>
        </div>
      </header>

      {/* Main Viewport / Printable Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Printable Official Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                TRANSKRIP PENILAIAN RESMI STASE OSCE
              </span>
              <h1 className="text-xl font-black text-slate-900 mt-2">
                {resultItem.title}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1 inline-flex items-center gap-1.5">
                <CalendarDays size={13} className="text-slate-400" />
                Tanggal: {resultItem.date} • Lokasi: {resultItem.location}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Status Penilaian</span>
              <span className="text-xs font-black px-3 py-1 rounded-xl block mt-1 border text-blue-800 bg-blue-50 border-blue-200">
                {resultItem.evaluated_count} dari {resultItem.total_stations} Stase Selesai Dievaluasi
              </span>
            </div>
          </div>

          {/* Student Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Nama Mahasiswa</span>
              <span className="font-extrabold text-slate-900 text-sm">{resultItem.participant_name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Nomor Induk Mahasiswa (NIM)</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{resultItem.nim}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Institusi / Fakultas</span>
              <span className="font-bold text-slate-800 text-xs">{resultItem.institution}</span>
            </div>
          </div>

          {/* Stations Evaluations List */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award size={18} className="text-blue-600" />
              Detail Penilaian Dokter Penguji Per Pos Stase ({stations.length} Pos Stase)
            </h2>

            <div className="space-y-3.5">
              {stations.map((stg) => {
                const isExpanded = expandedStation === stg.station_number;

                const getRatingBadge = (rating) => {
                  const r = String(rating || "").toUpperCase();
                  if (r.includes("SUPERIOR")) return "bg-emerald-100 text-emerald-900 border-emerald-300";
                  if (r.includes("SATISFACTORY")) return "bg-blue-100 text-blue-900 border-blue-300";
                  if (r.includes("BORDERLINE")) return "bg-amber-100 text-amber-900 border-amber-300";
                  if (r.includes("UNSATISFACTORY")) return "bg-rose-100 text-rose-900 border-rose-300";
                  return "bg-slate-100 text-slate-700 border-slate-300";
                };

                return (
                  <div key={stg.station_number} className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                    <div
                      onClick={() => setExpandedStation(isExpanded ? null : stg.station_number)}
                      className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xs shadow-xs">
                          {stg.station_number}
                        </span>
                        <div>
                          <h3 className="text-xs font-black text-slate-900">{stg.title}</h3>
                          <p className="text-[11px] text-slate-500 font-medium">{stg.case_title} • Penguji: {stg.examiner_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {stg.is_break ? (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                            Stase Istirahat
                          </span>
                        ) : (
                          <>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${getRatingBadge(stg.global_rating)}`}>
                              GRS: {stg.global_rating}
                            </span>
                            <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                              Nilai: {stg.score.toFixed(1)} / 100
                            </span>
                          </>
                        )}
                        <button className="text-slate-400 hover:text-slate-700 cursor-pointer">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4 animate-in fade-in duration-150 text-xs">
                        {/* Feedback Penguji */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan Feedback Dokter Penguji:</span>
                          <p className="text-xs text-slate-800 bg-white border border-slate-200 rounded-xl p-3 font-medium leading-relaxed">
                            "{stg.notes}"
                          </p>
                        </div>

                        {/* Rubric Breakdown (if available) */}
                        {!stg.is_break && stg.rubric_breakdown && stg.rubric_breakdown.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rincian Perolehan Poin Rubrik:</span>
                            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700">
                                  <tr>
                                    <th className="px-3.5 py-2">Item Pertanyaan Rubrik</th>
                                    <th className="px-3.5 py-2 text-right">Bobot</th>
                                    <th className="px-3.5 py-2 text-right">Poin Diperoleh</th>
                                    <th className="px-3.5 py-2 text-right">Maks Poin</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-800">
                                  {stg.rubric_breakdown.map((r, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-slate-50">
                                      <td className="px-3.5 py-2 font-medium">{rIdx + 1}. {r.question}</td>
                                      <td className="px-3.5 py-2 text-right text-slate-500">{r.weight || 1}x</td>
                                      <td className="px-3.5 py-2 text-right font-bold text-blue-700">{r.score_given} Poin</td>
                                      <td className="px-3.5 py-2 text-right text-slate-500">{r.max_points || 3} Poin</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Jawaban Peserta */}
                        {!stg.is_break && (
                          <div className="rounded-xl border border-blue-200 bg-white p-4 space-y-2.5">
                            <span className="text-[10px] font-extrabold uppercase text-blue-900 block border-b border-blue-100 pb-1">
                              Jawaban yang Anda Kirimkan di Stase Ini
                            </span>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <span className="font-bold text-slate-700 block text-[11px]">Diagnosis Kerja (WDx):</span>
                                <p className="font-semibold text-slate-900 bg-blue-50/60 p-2 rounded-md border border-blue-100 mt-0.5">
                                  {stg.student_answers?.wdx || "-"}
                                </p>
                              </div>

                              <div>
                                <span className="font-bold text-slate-700 block text-[11px]">Diagnosis Banding (DDx):</span>
                                <ul className="space-y-0.5 mt-0.5">
                                  {(stg.student_answers?.ddx || ["-"]).map((d, dIdx) => (
                                    <li key={dIdx} className="bg-slate-50 px-2 py-1 rounded-md text-slate-800 font-medium">
                                      {dIdx + 1}. {d}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div>
                              <span className="font-bold text-slate-700 block text-[11px]">Resep Medis / Tatalaksana:</span>
                              <pre className="bg-slate-50 p-2.5 rounded-md font-mono text-[11px] text-slate-900 whitespace-pre-line leading-relaxed border border-slate-200 mt-0.5">
                                {stg.student_answers?.recipe || "-"}
                              </pre>
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
      </main>

      <ParticipantReportPdfModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        participant={rawParticipant}
        session={rawSession}
        stations={rawStations}
        evaluations={rawEvaluations}
        nblCutoff={rawSession?.nbl_cutoff || 70}
      />
    </div>
  );
}
