import { useState } from "react";
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
} from "lucide-react";

export default function ParticipantAnswerPage() {
  const { participantId } = useParams();
  const navigate = useNavigate();

  const [expandedStation, setExpandedStation] = useState(1);

  // Mock Scorecard for Participant
  const scorecard = {
    participant_name: "Ahmad Rizky Pratama",
    nim: "20200710042",
    institution: "Fakultas Kedokteran - Universitas Indonesia",
    session_title: "Ujian OSCE Periodik Dokter Spesialis - Batch III 2026",
    total_score: 91.5,
    final_grade: "LULUS (Superior)",
    global_rating: "Sangat Baik",
    station_results: [
      {
        station_number: 1,
        title: "Stase 1: Kardiovaskular (STEMI Anteroseptal)",
        examiner_name: "dr. Alexander Budiman, Sp.JP",
        score: 95,
        max_score: 100,
        checklist_items: [
          {
            item: "Menyapa pasien & membina sambung rasa",
            answer_key:
              "Peserta mengucapkan salam, memperkenalkan diri, & mengonfirmasi identitas",
            max_points: 1,
            earned_points: 1,
            notes: "Sangat sopan & komunikatif",
          },
          {
            item: "Menanyakan onset, kualitas, & radiasi nyeri dada",
            answer_key:
              "Menanyakan nyeri dada khas infark (seperti ditindih beban berat) menjalar ke lengan",
            max_points: 3,
            earned_points: 3,
            notes: "Anamnesis terstruktur",
          },
          {
            item: "Melakukan auskultasi 4 katup jantung dengan benar",
            answer_key:
              "Menggunakan stetoskop pada 4 area katup jantung dengan posisi pasien tepat",
            max_points: 3,
            earned_points: 3,
            notes: "Teknik stetoskop tepat",
          },
          {
            item: "Mengidentifikasi elevasi segmen ST pada V1-V4 EKG",
            answer_key:
              "Membaca elevasi segmen ST dan menetapkan diagnosis kerja STEMI Anteroseptal",
            max_points: 3,
            earned_points: 3,
            notes: "Diagnosis STEMI cepat & tepat",
          },
        ],
        examiner_feedback:
          "Penanganan klinis dan interpretasi EKG sangat baik secara keseluruhan.",
      },
      {
        station_number: 2,
        title: "Stase 2: Kegawatdaruratan Pulmonologi (Status Asmatikus)",
        examiner_name: "dr. Faisal Hasibuan, Sp.P",
        score: 90,
        max_score: 100,
        checklist_items: [
          {
            item: "Anamnesis sesak napas akut & wheezing",
            answer_key:
              "Menanyakan onset sesak, pemicu alergi, dan riwayat penggunaan inhaler",
            max_points: 2,
            earned_points: 2,
            notes: "Lengkap",
          },
          {
            item: "Inspeksi & auskultasi suara paru",
            answer_key:
              "Menemukan wheezing ekspiratorik bilateral dan perkusi hipersonor",
            max_points: 3,
            earned_points: 3,
            notes: "Auskultasi cermat",
          },
          {
            item: "Pemberian Oksigenasi & Inhalasi Nebulizer",
            answer_key:
              "Mereresepkan Salbutamol nebulizer + O2 kanul nasal 3-4 L/mnt",
            max_points: 3,
            earned_points: 3,
            notes: "Dosis obat tepat",
          },
          {
            item: "Indikasi & persiapan Needle Thoracocentesis",
            answer_key:
              "Menjelaskan lokasi penusukan abocath pada ICS 2 Linea Midclavicularis",
            max_points: 3,
            earned_points: 2,
            notes: "Perlu penajaman posisi ICS",
          },
        ],
        examiner_feedback: "Tenang dalam penanganan darurat resusitasi paru.",
      },
      {
        station_number: 3,
        title: "Stase 3: Keterampilan Bedah & Penutupan Luka (Suturing)",
        examiner_name: "dr. Citra Dewi, Sp.B",
        score: 88,
        max_score: 100,
        checklist_items: [
          {
            item: "Persiapan steril & infiltrasi anestesi lokal",
            answer_key:
              "Cuci tangan steril, gaun/sarung tangan steril, infiltrasi Lidokain 2%",
            max_points: 3,
            earned_points: 3,
            notes: "Teknik steril terjaga",
          },
          {
            item: "Debridement & irigasi cair fisiologis NaCl 0.9%",
            answer_key:
              "Membersihkan jaringan nekrotik & pembilasan luka robek",
            max_points: 3,
            earned_points: 2.5,
            notes: "Irigasi baik",
          },
          {
            item: "Teknik Penjahitan Simple Interrupted Suture",
            answer_key:
              "Menggunakan needle holder & pinset anatomis dengan 3 simpul simetris",
            max_points: 4,
            earned_points: 3.5,
            notes: "Jahitan rapi",
          },
        ],
        examiner_feedback:
          "Penanganan vulnus laceratum dan simpul jahitan cukup rapi.",
      },
      {
        station_number: 4,
        title: "Stase 4: Anamnesis & Keterampilan Neurologi (Stroke Akut)",
        examiner_name: "dr. Doni Prasetyo, Sp.N",
        score: 92,
        max_score: 100,
        checklist_items: [
          {
            item: "Pemeriksaan Saraf Kranial VII & XII",
            answer_key:
              "Meminta pasien tersenyum, meringis, dan menjulurkan lidah lurus",
            max_points: 3,
            earned_points: 3,
            notes: "Instruksi jelas",
          },
          {
            item: "Pemeriksaan Kekuatan Otot Ekstremitas",
            answer_key:
              "Menilai skala kekuatan motorik ekstremitas kanan (nilai 3/5)",
            max_points: 3,
            earned_points: 3,
            notes: "Pemeriksaan tepat",
          },
          {
            item: "Pemeriksaan Refleks Patologis Babinski",
            answer_key:
              "Goresan telapak kaki dari lateral ke medial dengan respon dorsofleksi",
            max_points: 3,
            earned_points: 2.5,
            notes: "Teknik goresan baik",
          },
        ],
        examiner_feedback: "Pemeriksaan neurologis terstruktur dan sistematis.",
      },
      {
        station_number: 5,
        title: "Stase 5: Komunikasi & Edukasi Diabetes Melitus (Insulin)",
        examiner_name: "dr. Eka Rahmawati, Sp.PD",
        score: 94,
        max_score: 100,
        checklist_items: [
          {
            item: "Penyampaian diagnosis & edukasi DM Tipe 2",
            answer_key:
              "Menjelaskan kondisi DM Tipe 2 dengan bahasa yang mudah dipahami",
            max_points: 2,
            earned_points: 2,
            notes: "Sikap empati sangat baik",
          },
          {
            item: "Edukasi & Peragaan Injeksi Insulin Pen",
            answer_key:
              "Peragaan rotasi tempat suntikan abdomen, buang jarum, & dosis tepat",
            max_points: 4,
            earned_points: 4,
            notes: "Simulasi insulin sangat jelas",
          },
          {
            item: "Penanganan Hipoglikemia & Gaya Hidup",
            answer_key:
              "Edukasi minum air gula jika pusing/keringat dingin & diet karbohidrat",
            max_points: 3,
            earned_points: 3,
            notes: "Edukasi komprehensif",
          },
        ],
        examiner_feedback:
          "Sangat bagus dalam membina sambung rasa dan memberikan pemahaman obat insulin.",
      },
      {
        station_number: 6,
        title: "Stase 6: Keterampilan Otolaringologi THT-KL (Otoskop)",
        examiner_name: "dr. Farhan Gunawan, Sp.THT-KL",
        score: 90,
        max_score: 100,
        checklist_items: [
          {
            item: "Pemeriksaan Fisik Telinga Luar",
            answer_key:
              "Inspeksi aurikula & penarikan pinna ke arah superior-posterior",
            max_points: 3,
            earned_points: 3,
            notes: "Posisi penarikan tepat",
          },
          {
            item: "Teknik Penggunaan Otoskop",
            answer_key:
              "Memegang otoskop seperti pensil dengan kelingking bersandar pada pipi",
            max_points: 4,
            earned_points: 3.5,
            notes: "Pegang otoskop benar",
          },
          {
            item: "Identifikasi Membran Timpani & Refleks Cahaya",
            answer_key:
              "Menilai refleks cahaya (cone of light) dan kanalis auditorius",
            max_points: 3,
            earned_points: 2.5,
            notes: "Temuan otoskopik akurat",
          },
        ],
        examiner_feedback:
          "Teknik otoskopik baik dan memperhatikan kenyamanan pasien.",
      },
    ],
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Rekap Nilai & Jawaban Peserta
              </h1>
              <p className="text-xs text-slate-500">
                ID Peserta: <span className="font-mono font-semibold">{participantId || "p1"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Participant Header Info & Summary Cards */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-800 font-extrabold text-xl shadow-xs">
                {scorecard.participant_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {scorecard.participant_name}
                </h2>
                <p className="text-xs text-slate-500">
                  NIM: <span className="font-mono font-semibold text-slate-700">{scorecard.nim}</span> • {scorecard.institution}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 size={16} />
              {scorecard.final_grade}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Nilai Total Rata-Rata
              </p>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {scorecard.total_score} <span className="text-xs text-slate-400 font-medium">/ 100</span>
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Global Rating
              </p>
              <p className="text-base font-bold text-slate-800 mt-1">
                {scorecard.global_rating}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 col-span-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Sesi Ujian
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                {scorecard.session_title}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown per Station */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Rincian Nilai per Stase (6 Stase Total)
          </h3>

          <div className="space-y-4">
            {scorecard.station_results.map((st) => {
              const isExpanded = expandedStation === st.station_number;

              return (
                <div
                  key={st.station_number}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition"
                >
                  {/* Station Card Header Toggle */}
                  <button
                    onClick={() =>
                      setExpandedStation(isExpanded ? null : st.station_number)
                    }
                    className="flex w-full items-center justify-between p-5 text-left hover:bg-slate-50/60 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800 font-bold text-xs">
                        S{st.station_number}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {st.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Penguji: <span className="font-semibold text-slate-700">{st.examiner_name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-medium">Skor Stase</span>
                        <p className="text-base font-black text-blue-600">
                          {st.score} <span className="text-xs text-slate-400 font-medium">/ 100</span>
                        </p>
                      </div>
                      <div className="rounded-lg p-1.5 text-slate-400 bg-slate-100">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Station Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/40">
                      {/* Checklist Table */}
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                            <tr>
                              <th className="p-3">Item Checklist Penilaian</th>
                              <th className="p-3">Kunci Jawaban Rubrik</th>
                              <th className="p-3 text-center">Poin Max</th>
                              <th className="p-3 text-center">Poin Diperoleh</th>
                              <th className="p-3">Catatan Khusus</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {st.checklist_items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/80">
                                <td className="p-3 font-semibold text-slate-800">
                                  {item.item}
                                </td>
                                <td className="p-3 text-slate-600">
                                  {item.answer_key}
                                </td>
                                <td className="p-3 text-center font-semibold text-slate-700">
                                  {item.max_points}
                                </td>
                                <td className="p-3 text-center font-bold text-blue-700">
                                  {item.earned_points}
                                </td>
                                <td className="p-3 text-slate-500 italic">
                                  {item.notes}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Examiner Feedback */}
                      {st.examiner_feedback && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                          <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
                            Umpan Balik / Catatan Penguji:
                          </p>
                          <p className="text-xs text-slate-700 font-medium italic mt-1">
                            "{st.examiner_feedback}"
                          </p>
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
