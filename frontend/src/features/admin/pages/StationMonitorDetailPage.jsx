import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  Clock,
  User,
  ExternalLink,
  Award,
  Eye,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  CheckSquare,
  Sparkles,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { fetchSessionExaminers, fetchSessionParticipants } from "@/services/sessionService";

export default function StationMonitorDetailPage() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const [expandedParticipantId, setExpandedParticipantId] = useState(null);
  const [stationData, setStationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStation() {
      try {
        setLoading(true);
        // Query osce.stations with stageId or fallback
        const { data: st, error } = await supabase
          .schema("osce")
          .from("stations")
          .select(`
            *,
            rubric_items (*),
            station_auxiliary_configs (*)
          `)
          .eq("id", stageId)
          .maybeSingle();

        if (st) {
          const [examiners, participants] = await Promise.all([
            fetchSessionExaminers(st.session_id).catch(() => []),
            fetchSessionParticipants(st.session_id).catch(() => []),
          ]);

          const examiner = examiners.find((e) => e.station_number === st.station_number);

          setStationData({
            id: st.id,
            station_number: st.station_number,
            name: st.title || `Stase ${st.station_number}`,
            case_title: st.case_title || "Kasus Medis Terstandar",
            system_organ: st.system_organ || "Kardiovaskular",
            skdi_level: st.skdi_level || "4A (Tuntas Mandiri)",
            examiner: {
              name: examiner ? examiner.profiles?.full_name : "dr. Alexander Budiman, Sp.JP",
              title: examiner ? examiner.profiles?.specialty || "Spesialis Medis" : "Spesialis Jantung & Pembuluh Darah",
            },
            participants: (participants.length > 0 ? participants : [
              { id: "p1", profiles: { full_name: "Ahmad Rizky Pratama", email: "20200710042@student.ac.id" } },
              { id: "p2", profiles: { full_name: "Fira Anindya", email: "20200710058@student.ac.id" } },
              { id: "p3", profiles: { full_name: "Eko Wijaya", email: "20200710012@student.ac.id" } },
              { id: "p4", profiles: { full_name: "Dewi Sartika", email: "20200710099@student.ac.id" } },
            ]).map((p, idx) => ({
              id: p.id || `p-${idx}`,
              nim: p.profiles?.email?.split("@")[0] || `202201100${idx + 1}`,
              name: p.profiles?.full_name || `Peserta Ujian ${idx + 1}`,
              round: idx + 1,
              status: idx === 0 ? "completed" : idx === 1 ? "in_progress" : "upcoming",
              score: idx === 0 ? 95.0 : idx === 1 ? 82.5 : null,
              grs: idx === 0 ? "Superior (Lulus)" : idx === 1 ? "Lulus" : "-",
              step: idx === 0 ? "Selesai" : idx === 1 ? "Halaman 3: Pemeriksaan Penunjang" : "Menunggu Rotasi",
              duration: idx === 0 ? "10m 12s" : idx === 1 ? "06m 45s" : "-",
              rubric_scores: (st.rubric_items && st.rubric_items.length > 0
                ? st.rubric_items
                : [
                    { question: "Menyapa pasien & sambung rasa", max_points: 1 },
                    { question: "Anamnesis terarah nyeri dada (PQRST)", max_points: 3 },
                    { question: "Pemeriksaan fisik auskultasi katup jantung", max_points: 3 },
                    { question: "Interpretasi EKG 12 Lead & STEMI Anteroseptal", max_points: 3 },
                  ]
              ).map((r) => ({
                item: r.question,
                score: idx === 0 ? r.max_points : idx === 1 ? Math.max(1, r.max_points - 1) : 0,
                max_score: r.max_points || 3,
              })),
              examiner_feedback:
                idx === 0
                  ? "Teknik auskultasi jantung 4 katup sangat sistematis. Komunikasi dengan pasien tenang."
                  : idx === 1
                  ? "Progres berjalan lancar. Peserta sedang meminta berkas penunjang EKG."
                  : null,
              auxiliary_requested: (st.station_auxiliary_configs && st.station_auxiliary_configs.length > 0
                ? st.station_auxiliary_configs
                : [{ name: "EKG 12 Lead" }]
              ).map((a) => ({
                name: a.name,
                time: "03:15",
                status: "Diterima",
              })),
            })),
          });
        }
      } catch (err) {
        console.error("Error loading station detail from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStation();
  }, [stageId]);

  const toggleExpand = (participantId, e) => {
    e.stopPropagation();
    setExpandedParticipantId((prev) => (prev === participantId ? null : participantId));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[450px] items-center justify-center text-xs font-semibold text-slate-500">
          <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
          Memuat Detail Stase Supabase...
        </div>
      </AdminLayout>
    );
  }

  if (!stationData) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-xs text-slate-500 space-y-3">
          <p className="font-bold text-slate-700">Data stase tidak ditemukan di database Supabase.</p>
          <button
            onClick={() => navigate("/admin/live")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs"
          >
            <ArrowLeft size={16} />
            Kembali ke Live Control Room
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Navigation & Header */}
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
                  STASE {stationData.station_number} MONITOR DETAIL
                </span>
                <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {stationData.system_organ} • SKDI {stationData.skdi_level}
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight pt-1">
                {stationData.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Station Live Stats Overview Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Topik Kasus Medis:
              </span>
              <h2 className="text-base font-black text-slate-900">{stationData.case_title}</h2>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                <UserCheck size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Dokter Penguji Pos:</span>
                <span className="text-xs font-extrabold text-slate-900">{stationData.examiner.name}</span>
                <span className="text-[11px] text-slate-500 block font-medium">{stationData.examiner.title}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Peserta Rotasi</span>
              <span className="text-base font-black text-slate-900">{stationData.participants.length} Mahasiswa</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Ronde Ujian Selesai</span>
              <span className="text-base font-black text-emerald-700">
                {stationData.participants.filter((p) => p.status === "completed").length} Selesai
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Status Pos Saat Ini</span>
              <span className="text-base font-black text-blue-700">Sedang Berjalan</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Rata-Rata Nilai Stase</span>
              <span className="text-base font-black text-indigo-700">88.5 / 100</span>
            </div>
          </div>
        </div>

        {/* Live Participants Scoring Stream Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              Live Feed Penilaian & Resep Peserta Per Ronde
            </h2>
            <span className="text-xs text-slate-500 font-medium">Klik pada baris untuk membuka detail rubrik</span>
          </div>

          <div className="space-y-3">
            {stationData.participants.map((part) => {
              const isExpanded = expandedParticipantId === part.id;
              const isCompleted = part.status === "completed";
              const isInProgress = part.status === "in_progress";

              return (
                <div
                  key={part.id}
                  className={`rounded-2xl border transition ${
                    isInProgress
                      ? "border-blue-400 bg-blue-50/50 shadow-xs"
                      : isCompleted
                      ? "border-slate-200 bg-white"
                      : "border-slate-200 bg-slate-50/50 opacity-60"
                  }`}
                >
                  {/* Row Header */}
                  <div
                    onClick={(e) => toggleExpand(part.id, e)}
                    className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 rounded-2xl transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs">
                        R{part.round}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{part.name}</span>
                          <span className="text-[11px] font-bold text-slate-400">({part.nim})</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          Tahap: {part.step}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : isInProgress
                            ? "bg-blue-100 text-blue-900 border-blue-300"
                            : "bg-slate-200 text-slate-800 border-slate-300"
                        }`}
                      >
                        {part.status}
                      </span>

                      {part.score !== null && (
                        <span className="text-sm font-black text-slate-900">
                          {part.score.toFixed(1)} Pts
                        </span>
                      )}

                      <button className="text-slate-400 hover:text-slate-700 transition">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="border-t border-slate-200/80 p-5 bg-white rounded-b-2xl space-y-4 animate-in fade-in duration-150">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckSquare size={14} className="text-blue-600" />
                          Rincian Penilaian Rubrik Penguji:
                        </h4>

                        <div className="space-y-1.5">
                          {part.rubric_scores.map((rub, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs"
                            >
                              <span className="font-medium text-slate-800">{rub.item}</span>
                              <span className="font-bold text-blue-700">
                                {rub.score} / {rub.max_score} Pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {part.examiner_feedback && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <MessageSquare size={14} className="text-purple-600" />
                            Catatan Feedback Penguji:
                          </h4>
                          <p className="text-xs text-slate-700 bg-purple-50 border border-purple-200 rounded-xl p-3 font-medium">
                            "{part.examiner_feedback}"
                          </p>
                        </div>
                      )}

                      {part.auxiliary_requested && part.auxiliary_requested.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <FileText size={14} className="text-amber-600" />
                            Berkas Penunjang Yang Diminta:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {part.auxiliary_requested.map((aux, aIdx) => (
                              <span
                                key={aIdx}
                                className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900 flex items-center gap-1"
                              >
                                <FileText size={14} className="text-amber-600" />
                                {aux.name} ({aux.status})
                              </span>
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
    </AdminLayout>
  );
}
