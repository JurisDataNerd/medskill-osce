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

        // 2. Fetch Stations of Session
        const { data: stationsDb } = await supabase
          .schema("osce")
          .from("stations")
          .select("*")
          .eq("session_id", targetSessionId)
          .order("station_number", { ascending: true });

        // 3. Fetch Examiner Evaluations for Participant
        const { data: evals } = await supabase
          .schema("osce")
          .from("examiner_evaluations")
          .select("*")
          .eq("session_id", targetSessionId);

        const userEvals = (evals || []).filter(
          (ev) =>
            ev.participant_id === targetUserId ||
            ev.participant_id === targetPartId ||
            (user?.id && ev.participant_id === user.id)
        );

        const baseStations = stationsDb && stationsDb.length > 0 
          ? stationsDb 
          : Array.from({ length: sess?.total_stations || 6 }, (_, i) => ({ station_number: i + 1, id: null }));

        const stationsEvaluations = baseStations.map((st, idx) => {
          const stNum = st.station_number || idx + 1;
          const ev = userEvals.find(
            (e) => (st.id && e.station_id === st.id) || Number(e.station_number) === Number(stNum)
          );
          return {
            station_number: stNum,
            title: `Stase ${stNum}`,
            examiner_name: "Dokter Penguji Terverifikasi",
            score: ev ? Number(ev.final_score_percentage || 0) : 0,
            global_rating: ev?.grs_rating || "Belum Rating",
            notes: ev?.examiner_notes || "Belum ada catatan feedback dari penguji.",
            has_eval: Boolean(ev),
          };
        });

        const evaluatedList = stationsEvaluations.filter((s) => s.has_eval);
        const avgScore =
          evaluatedList.length > 0
            ? Number(
                (
                  evaluatedList.reduce((acc, curr) => acc + Number(curr.score || 0), 0) /
                  evaluatedList.length
                ).toFixed(1)
              )
            : 0;

        const nblCutoff = Number(sess?.nbl_cutoff) || 70;
        const isPassed = evaluatedList.length > 0 && avgScore >= nblCutoff;

        setRawSession(sess);
        setRawStations(baseStations);
        setRawEvaluations(userEvals);
        setRawParticipant({
          id: p?.id || resultId,
          nim: p?.nim || user?.user_metadata?.nim || "-",
          name: p?.full_name || user?.user_metadata?.full_name || user?.email || "Peserta Ujian",
          final_score: avgScore,
          status: isPassed ? "Lulus" : "Tidak Lulus",
          rank: 1,
        });

        setResultItem({
          id: resultId,
          title: sess?.title || "Ujian OSCE MedSkill",
          date: sess?.session_date || "Sesuai Jadwal",
          participant_name:
            p?.full_name ||
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.email ||
            "Tidak ada data",
          institution:
            p?.institution ||
            p?.university ||
            user?.user_metadata?.institution ||
            user?.user_metadata?.university ||
            "Tidak ada data",
          avg_score: avgScore,
          final_status: evaluatedList.length === 0 ? "BELUM ADA EVALUASI" : (isPassed ? "LULUS" : "TIDAK LULUS"),
          global_rating: avgScore >= 80 ? "SATISFACTORY" : avgScore >= nblCutoff ? "BORDERLINE PASS" : "UNSATISFACTORY",
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
                TRANSKRIP HASIL UJIAN RESMI
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
              <span className={`text-lg font-black px-3 py-1 rounded-xl block mt-1 border ${
                resultItem.final_status === "LULUS"
                  ? "text-emerald-700 bg-emerald-50 border-emerald-300"
                  : resultItem.final_status === "TIDAK LULUS"
                  ? "text-rose-700 bg-rose-50 border-rose-300"
                  : "text-amber-700 bg-amber-50 border-amber-300"
              }`}>
                {resultItem.final_status}
              </span>
            </div>
          </div>

          {/* Student Info Card */}
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Nama Mahasiswa</span>
              <span className="font-extrabold text-slate-900 text-sm">{resultItem.participant_name}</span>
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
                        <button className="text-slate-400 hover:text-slate-700 cursor-pointer">
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
