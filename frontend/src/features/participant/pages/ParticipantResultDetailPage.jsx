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
  Loader2,
  Building2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ParticipantResultDetailPage() {
  const navigate = useNavigate();
  const { resultId } = useParams();

  const [loading, setLoading] = useState(true);
  const [resultItem, setResultItem] = useState(null);
  const [expandedStation, setExpandedStation] = useState(1);

  useEffect(() => {
    async function loadResultDetail() {
      try {
        setLoading(true);
        // Query osce.session_participants
        const { data: p, error: pErr } = await supabase
          .schema("osce")
          .from("session_participants")
          .select("*")
          .eq("id", resultId)
          .maybeSingle();

        if (pErr) throw pErr;

        let sessionTitle = "Ujian Komprehensif Dokter FK - Sirkuit Alfa";
        let sessionDate = "15 Agustus 2026";

        if (p) {
          const { data: sess } = await supabase
            .schema("osce")
            .from("sessions")
            .select("title, session_date")
            .eq("id", p.session_id)
            .maybeSingle();
          if (sess) {
            sessionTitle = sess.title;
            sessionDate = sess.session_date || "15 Agustus 2026";
          }
        }

        // Query evaluations
        const { data: evals } = await supabase
          .schema("osce")
          .from("examiner_evaluations")
          .select("*, stations(*)")
          .eq("participant_id", p ? p.user_id : resultId);

        const stationsEvaluations = (evals || []).map((ev, idx) => ({
          station_number: ev.stations?.station_number || idx + 1,
          title: ev.stations?.title || `Stase ${ev.stations?.station_number || idx + 1}`,
          examiner_name: "Dokter Penguji Terverifikasi",
          score: ev.total_score || 0,
          global_rating: ev.global_rating || "SATISFACTORY",
          notes: ev.feedback || ev.global_feedback || "-",
        }));

        const avgScore = stationsEvaluations.length > 0
          ? (stationsEvaluations.reduce((acc, curr) => acc + (curr.score || 0), 0) / stationsEvaluations.length).toFixed(1)
          : 0;

        setResultItem({
          id: resultId,
          title: sessionTitle,
          date: sessionDate,
          participant_name: p?.full_name || p?.email || user?.user_metadata?.full_name || user?.email || "Peserta Ujian",
          nim: p?.nim || (p?.email ? p.email.split("@")[0] : "-"),
          institution: "Fakultas Kedokteran - MedSkill LMS",
          avg_score: avgScore,
          final_status: avgScore >= 75 ? "LULUS" : "TIDAK LULUS",
          global_rating: avgScore >= 75 ? "SATISFACTORY" : "NEEDS_IMPROVEMENT",
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
        Memuat Transkrip Resmi Ujian OSCE Supabase...
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                TRANSKRIP HASIL UJIAN RESMI SUPABASE
              </span>
              <h1 className="text-xl font-black text-slate-900 mt-2">
                {resultItem.title}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5 inline-flex items-center gap-1">
                <CalendarDays size={13} className="text-slate-400" />
                Tanggal Pelaksanaan: {resultItem.date}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Status Kelulusan</span>
              <span className="text-lg font-black text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-xl block mt-1">
                {resultItem.final_status}
              </span>
            </div>
          </div>

          {/* Student Info Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Nama Mahasiswa</span>
              <span className="font-extrabold text-slate-900">{resultItem.participant_name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">NIM Mahasiswa</span>
              <span className="font-mono text-slate-900">{resultItem.nim}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Rata-Rata Nilai Akhir</span>
              <span className="font-black text-blue-700 text-sm">{resultItem.avg_score.toFixed(1)} / 100</span>
            </div>
          </div>

          {/* Stations Evaluations List */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Award size={18} className="text-blue-600" />
              Rincian Evaluasi Nilai Per Pos Stase Ujian ({stations.length} Stase)
            </h2>

            <div className="space-y-3">
              {stations.map((stg) => {
                const isExpanded = expandedStation === stg.station_number;

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
                          <p className="text-[11px] text-slate-500 font-medium">Penguji: {stg.examiner_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                          Skor: {stg.score.toFixed(1)} / 100
                        </span>
                        <button className="text-slate-400 hover:text-slate-700">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-2 animate-in fade-in duration-150">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan Feedback Dokter Penguji:</span>
                        <p className="text-xs text-slate-800 bg-white border border-slate-200 rounded-xl p-3 font-medium">
                          "{stg.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
