import { useState } from "react";
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
} from "lucide-react";

const MOCK_STATIONS_DATA = {
  "stase-1": {
    station_number: 1,
    name: "Stase 1: Anamnesis & Pemeriksaan Fisik Jantung",
    case_title: "Sindrom Koroner Akut (STEMI Anteroseptal)",
    system_organ: "Kardiovaskular",
    skdi_level: "4A (Tuntas Mandiri)",
    examiner: {
      name: "dr. Alexander Budiman, Sp.JP",
      title: "Spesialis Jantung & Pembuluh Darah",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    },
    total_participants: 6,
    completed_participants: 2,
    avg_score: 87.5,
    participants: [
      {
        id: "p1",
        nim: "20200710042",
        name: "Ahmad Rizky Pratama",
        round: 1,
        status: "completed",
        score: 95.0,
        grs: "Superior (Lulus)",
        step: "Selesai",
        duration: "10m 12s",
        total_points: 12,
        max_points: 13,
        rubric_scores: [
          { item: "Menyapa pasien & membina sambung rasa", score: 1, max_score: 1 },
          { item: "Anamnesis terarah nyeri dada (PQRST)", score: 3, max_score: 3 },
          { item: "Pemeriksaan fisik auskultasi katup jantung", score: 3, max_score: 3 },
          { item: "Interpretasi EKG 12 Lead & STEMI Anteroseptal", score: 3, max_score: 3 },
          { item: "Tatalaksana awal Oksigenasi & Aspirin", score: 2, max_score: 3 },
        ],
        examiner_feedback:
          "Teknik auskultasi jantung 4 katup sangat sistematis. Komunikasi dengan pasien tenang. Perlu penajaman pada waktu onset STEMI.",
        auxiliary_requested: [
          { name: "EKG 12 Lead", time: "03:15", status: "Diterima" },
          { name: "Enzim Jantung (Troponin I)", time: "05:40", status: "Diterima" },
        ],
      },
      {
        id: "p2",
        nim: "20200710058",
        name: "Fira Anindya",
        round: 2,
        status: "in_progress",
        score: 82.5,
        grs: "Lulus",
        step: "Halaman 3: Pemeriksaan Penunjang",
        duration: "06m 45s",
        total_points: 9,
        max_points: 13,
        rubric_scores: [
          { item: "Menyapa pasien & membina sambung rasa", score: 1, max_score: 1 },
          { item: "Anamnesis terarah nyeri dada (PQRST)", score: 3, max_score: 3 },
          { item: "Pemeriksaan fisik auskultasi katup jantung", score: 2, max_score: 3 },
          { item: "Interpretasi EKG 12 Lead & STEMI Anteroseptal", score: 3, max_score: 3 },
          { item: "Tatalaksana awal Oksigenasi & Aspirin", score: 0, max_score: 3 },
        ],
        examiner_feedback:
          "Progres berjalan lancar. Peserta sedang meminta berkas penunjang EKG.",
        auxiliary_requested: [
          { name: "EKG 12 Lead", time: "06:10", status: "Diterima" },
        ],
      },
      {
        id: "p3",
        nim: "20200710012",
        name: "Eko Wijaya",
        round: 3,
        status: "upcoming",
        score: null,
        grs: "-",
        step: "Menunggu Rotasi",
        duration: "-",
        rubric_scores: [],
        examiner_feedback: null,
        auxiliary_requested: [],
      },
      {
        id: "p4",
        nim: "20200710099",
        name: "Dewi Sartika",
        round: 4,
        status: "upcoming",
        score: null,
        grs: "-",
        step: "Menunggu Rotasi",
        duration: "-",
        rubric_scores: [],
        examiner_feedback: null,
        auxiliary_requested: [],
      },
      {
        id: "p5",
        nim: "20200710033",
        name: "Citra Kirana",
        round: 5,
        status: "upcoming",
        score: null,
        grs: "-",
        step: "Menunggu Rotasi",
        duration: "-",
        rubric_scores: [],
        examiner_feedback: null,
        auxiliary_requested: [],
      },
      {
        id: "p6",
        nim: "20200710077",
        name: "Budi Santoso",
        round: 6,
        status: "upcoming",
        score: null,
        grs: "-",
        step: "Menunggu Rotasi",
        duration: "-",
        rubric_scores: [],
        examiner_feedback: null,
        auxiliary_requested: [],
      },
    ],
  },
  "stase-2": {
    station_number: 2,
    name: "Stase 2: Kegawatdaruratan Pulmonologi",
    case_title: "Status Asmatikus & Pneumotoraks Ventil",
    system_organ: "Respirasi",
    skdi_level: "4A (Tuntas Mandiri)",
    examiner: {
      name: "dr. Faisal Hasibuan, Sp.P",
      title: "Spesialis Paru",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    },
    total_participants: 6,
    completed_participants: 3,
    avg_score: 91.0,
    participants: [
      {
        id: "p6",
        nim: "20200710077",
        name: "Budi Santoso",
        round: 1,
        status: "completed",
        score: 95.0,
        grs: "Superior",
        step: "Selesai",
        duration: "09m 50s",
        total_points: 10,
        max_points: 10,
        rubric_scores: [
          { item: "Anamnesis sesak napas & alergi", score: 2, max_score: 2 },
          { item: "Inspeksi, perkusi & auskultasi paru", score: 4, max_score: 4 },
          { item: "Needle Thoracocentesis ICS 2", score: 4, max_score: 4 },
        ],
        examiner_feedback:
          "Sangat cekatan dalam menentukan lokasi penusukan abocath ICS 2.",
        auxiliary_requested: [
          { name: "Foto Thorax AP/PA", time: "04:10", status: "Diterima" },
        ],
      },
      {
        id: "p1",
        nim: "20200710042",
        name: "Ahmad Rizky Pratama",
        round: 2,
        status: "in_progress",
        score: 90.0,
        grs: "Lulus",
        step: "Halaman 4: Diagnosis & Resep",
        duration: "08m 10s",
        total_points: 8,
        max_points: 10,
        rubric_scores: [
          { item: "Anamnesis sesak napas & alergi", score: 2, max_score: 2 },
          { item: "Inspeksi, perkusi & auskultasi paru", score: 3, max_score: 4 },
          { item: "Needle Thoracocentesis ICS 2", score: 3, max_score: 4 },
        ],
        examiner_feedback: "Pemeriksaan berjalan baik.",
        auxiliary_requested: [],
      },
    ],
  },
};

export default function StationMonitorDetailPage() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const [expandedParticipantId, setExpandedParticipantId] = useState(null);

  const stationData = MOCK_STATIONS_DATA[stageId] || MOCK_STATIONS_DATA["stase-1"];

  const toggleExpand = (participantId, e) => {
    e.stopPropagation();
    setExpandedParticipantId((prev) => (prev === participantId ? null : participantId));
  };

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
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Topik Kasus Medis:</span>
              <h2 className="text-base font-black text-slate-900">{stationData.case_title}</h2>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <img
                src={stationData.examiner.avatar}
                alt={stationData.examiner.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-2xs"
              />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Dokter Penguji:</span>
                <span className="text-xs font-extrabold text-slate-900 block">{stationData.examiner.name}</span>
                <span className="text-[10px] text-slate-500 block">{stationData.examiner.title}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">Progres Ujian Stase</span>
              <span className="text-2xl font-black text-emerald-900">
                {stationData.completed_participants} <span className="text-xs font-semibold text-emerald-700">/ {stationData.total_participants} Peserta Selesai</span>
              </span>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-blue-800 block">Rata-rata Skor Stase</span>
              <span className="text-2xl font-black text-blue-900">{stationData.avg_score}%</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Status Pengujian Live</span>
              <span className="text-sm font-extrabold text-slate-900 block pt-1">Sedang Berlangsung</span>
            </div>
          </div>
        </div>

        {/* Daftar Rotasi Peserta di Stase Ini (Accordion Dropdown) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Daftar Rotasi Peserta di Stase Ini ({stationData.participants.length} Peserta)
              </h2>
              <p className="text-xs text-slate-500">
                Klik baris peserta atau tombol dropdown di sebelah kanan untuk melihat rincian nilai rubrik & catatan penguji secara langsung.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white">
            {stationData.participants.map((p) => {
              const isExpanded = expandedParticipantId === p.id;

              return (
                <div key={p.id} className="transition">
                  {/* Row Header */}
                  <div
                    onClick={(e) => toggleExpand(p.id, e)}
                    className={`flex flex-wrap items-center justify-between p-4 transition cursor-pointer gap-4 ${
                      isExpanded ? "bg-blue-50/90 border-b border-blue-100" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs shrink-0">
                        R{p.round}
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          {p.name}
                          {p.score !== null && (
                            <span className="rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
                              {p.score}%
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">NIM: {p.nim}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {p.status === "completed" ? (
                        <div className="text-right">
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
                            ✓ Selesai ({p.score}%)
                          </span>
                          <span className="text-xs text-slate-400 block pt-0.5 font-semibold">GRS: {p.grs}</span>
                        </div>
                      ) : p.status === "in_progress" ? (
                        <div className="text-right">
                          <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-xs animate-pulse">
                            🔵 {p.step}
                          </span>
                          <span className="text-xs text-slate-400 block pt-0.5 font-semibold">Durasi: {p.duration}</span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold text-xs border border-slate-200">
                          ⏳ Menunggu Rotasi
                        </span>
                      )}

                      {/* Dropdown Toggle Arrow */}
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(p.id, e)}
                        className={`p-2 rounded-xl border transition ${
                          isExpanded
                            ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                            : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                        }`}
                        title={isExpanded ? "Sembunyikan Rincian Nilai" : "Tampilkan Rincian Nilai Dropdown"}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Dropdown Content */}
                  {isExpanded && (
                    <div className="bg-slate-50/70 p-5 border-t border-slate-100 space-y-4">
                      {p.status === "upcoming" ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                          <p className="font-bold text-slate-700">
                            Peserta belum memulai rotasi di stase ini.
                          </p>
                          <p className="mt-0.5">
                            Lembar nilai & progres akan muncul secara real-time saat dokter penguji melakukan penilaian di Ronde {p.round}.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Rubrik Score Table */}
                          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                                <CheckSquare size={16} className="text-blue-600" />
                                Rincian Skor Rubrik Penilaian Medis
                              </h4>
                              {p.total_points !== undefined && (
                                <span className="text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                                  Total Poin: {p.total_points} / {p.max_points} ({p.score}%)
                                </span>
                              )}
                            </div>

                            <div className="divide-y divide-slate-100 text-xs">
                              {p.rubric_scores.map((r, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between py-2 hover:bg-slate-50 px-2 rounded-lg transition"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 shrink-0">
                                      #{idx + 1}
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                      {r.item}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span
                                      className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${
                                        r.score === r.max_score
                                          ? "bg-emerald-100 text-emerald-900"
                                          : r.score > 0
                                          ? "bg-blue-100 text-blue-900"
                                          : "bg-rose-100 text-rose-900"
                                      }`}
                                    >
                                      Skor: {r.score} / {r.max_score}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Feedback & Auxiliary Requests */}
                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* Examiner Feedback */}
                            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <MessageSquare size={14} className="text-blue-600" />
                                Catatan Evaluasi Dokter Penguji:
                              </h4>
                              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic leading-relaxed">
                                "{p.examiner_feedback || "Belum ada catatan tertulis dari dokter penguji."}"
                              </p>
                            </div>

                            {/* Auxiliary Exam Requests */}
                            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <FileText size={14} className="text-blue-600" />
                                Pemeriksaan Penunjang yang Diminta:
                              </h4>
                              {p.auxiliary_requested.length === 0 ? (
                                <p className="text-xs text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                  Peserta belum meminta pemeriksaan penunjang.
                                </p>
                              ) : (
                                <div className="space-y-1.5">
                                  {p.auxiliary_requested.map((aux, aIdx) => (
                                    <div
                                      key={aIdx}
                                      className="flex items-center justify-between rounded-lg bg-blue-50/70 border border-blue-100 p-2 text-xs"
                                    >
                                      <span className="font-bold text-slate-900">
                                        {aux.name}
                                      </span>
                                      <span className="text-[10px] font-semibold text-blue-700">
                                        Diminta Menit {aux.time} ({aux.status})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Full Participant Link */}
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/live/participant/${p.id}`)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition active:scale-95"
                            >
                              <span>Buka Lembar Jawaban Lengkap Peserta</span>
                              <ExternalLink size={14} />
                            </button>
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
