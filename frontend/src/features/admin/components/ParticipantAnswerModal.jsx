import { X, CheckCircle2, Award, FileText, UserCheck, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function ParticipantAnswerModal({ open, onClose, participantId, participantName }) {
  if (!open) return null;

  const [expandedStation, setExpandedStation] = useState(1);

  // Full Mock Scorecard for 6 OSCE Stations
  const scorecard = {
    participant_name: participantName || "Ahmad Rizky Pratama",
    nim: "20200710042",
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
          { item: "Menyapa pasien & membina sambung rasa", answer_key: "Peserta mengucapkan salam, memperkenalkan diri, & mengonfirmasi identitas", max_points: 1, earned_points: 1, notes: "Sangat sopan & komunikatif" },
          { item: "Menanyakan onset, kualitas, & radiasi nyeri dada", answer_key: "Menanyakan nyeri dada khas infark (seperti ditindih beban berat) menjalar ke lengan", max_points: 3, earned_points: 3, notes: "Anamnesis terstruktur" },
          { item: "Melakukan auskultasi 4 katup jantung dengan benar", answer_key: "Menggunakan stetoskop pada 4 area katup jantung dengan posisi pasien tepat", max_points: 3, earned_points: 3, notes: "Teknik stetoskop tepat" },
          { item: "Mengidentifikasi elevasi segmen ST pada V1-V4 EKG", answer_key: "Membaca elevasi segmen ST dan menetapkan diagnosis kerja STEMI Anteroseptal", max_points: 3, earned_points: 3, notes: "Diagnosis STEMI cepat & tepat" },
        ],
        examiner_feedback: "Penanganan klinis dan interpretasi EKG sangat baik secara keseluruhan.",
      },
      {
        station_number: 2,
        title: "Stase 2: Kegawatdaruratan Pulmonologi (Status Asmatikus)",
        examiner_name: "dr. Faisal Hasibuan, Sp.P",
        score: 90,
        max_score: 100,
        checklist_items: [
          { item: "Anamnesis sesak napas akut & wheezing", answer_key: "Menanyakan onset sesak, pemicu alergi, dan riwayat penggunaan inhaler", max_points: 2, earned_points: 2, notes: "Lengkap" },
          { item: "Inspeksi & auskultasi suara paru", answer_key: "Menemukan wheezing ekspiratorik bilateral dan perkusi hipersonor", max_points: 3, earned_points: 3, notes: "Auskultasi cermat" },
          { item: "Pemberian Oksigenasi & Inhalasi Nebulizer", answer_key: "Mereresepkan Salbutamol nebulizer + O2 kanul nasal 3-4 L/mnt", max_points: 3, earned_points: 3, notes: "Dosis obat tepat" },
          { item: "Indikasi & persiapan Needle Thoracocentesis", answer_key: "Menjelaskan lokasi penusukan abocath pada ICS 2 Linea Midclavicularis", max_points: 3, earned_points: 2, notes: "Perlu penajaman posisi ICS" },
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
          { item: "Persiapan steril & infiltrasi anestesi lokal", answer_key: "Cuci tangan steril, gaun/sarung tangan steril, infiltrasi Lidokain 2%", max_points: 3, earned_points: 3, notes: "Teknik steril terjaga" },
          { item: "Debridement & irigasi cair fisiologis NaCl 0.9%", answer_key: "Membersihkan jaringan nekrotik & pembilasan luka robek", max_points: 3, earned_points: 2.5, notes: "Irigasi baik" },
          { item: "Teknik Penjahitan Simple Interrupted Suture", answer_key: "Menggunakan needle holder & pinset anatomis dengan 3 simpul simetris", max_points: 4, earned_points: 3.5, notes: "Jahitan rapi" },
        ],
        examiner_feedback: "Penanganan vulnus laceratum dan simpul jahitan cukup rapi.",
      },
      {
        station_number: 4,
        title: "Stase 4: Anamnesis & Keterampilan Neurologi (Stroke Akut)",
        examiner_name: "dr. Doni Prasetyo, Sp.N",
        score: 92,
        max_score: 100,
        checklist_items: [
          { item: "Pemeriksaan Saraf Kranial VII & XII", answer_key: "Meminta pasien tersenyum, meringis, dan menjulurkan lidah lurus", max_points: 3, earned_points: 3, notes: "Instruksi jelas" },
          { item: "Pemeriksaan Kekuatan Otot Ekstremitas", answer_key: "Menilai skala kekuatan motorik ekstremitas kanan (nilai 3/5)", max_points: 3, earned_points: 3, notes: "Pemeriksaan tepat" },
          { item: "Pemeriksaan Refleks Patologis Babinski", answer_key: "Goresan telapak kaki dari lateral ke medial dengan respon dorsofleksi", max_points: 3, earned_points: 2.5, notes: "Teknik goresan baik" },
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
          { item: "Penyampaian diagnosis & edukasi DM Tipe 2", answer_key: "Menjelaskan kondisi DM Tipe 2 dengan bahasa yang mudah dipahami", max_points: 2, earned_points: 2, notes: "Sikap empati sangat baik" },
          { item: "Edukasi & Peragaan Injeksi Insulin Pen", answer_key: "Peragaan rotasi tempat suntikan abdomen, buang jarum, & dosis tepat", max_points: 4, earned_points: 4, notes: "Simulasi insulin sangat jelas" },
          { item: "Penanganan Hipoglikemia & Gaya Hidup", answer_key: "Edukasi minum air gula jika pusing/keringat dingin & diet karbohidrat", max_points: 3, earned_points: 3, notes: "Edukasi komprehensif" },
        ],
        examiner_feedback: "Sangat bagus dalam membina sambung rasa dan memberikan pemahaman obat insulin.",
      },
      {
        station_number: 6,
        title: "Stase 6: Keterampilan Otolaringologi THT-KL (Otoskop)",
        examiner_name: "dr. Farhan Gunawan, Sp.THT-KL",
        score: 90,
        max_score: 100,
        checklist_items: [
          { item: "Pemeriksaan Fisik Telinga Luar", answer_key: "Inspeksi aurikula & penarikan pinna ke arah superior-posterior", max_points: 3, earned_points: 3, notes: "Posisi penarikan tepat" },
          { item: "Teknik Penggunaan Otoskop", answer_key: "Memegang otoskop seperti pensil dengan kelingking bersandar pada pipi", max_points: 4, earned_points: 3.5, notes: "Pegang otoskop benar" },
          { item: "Identifikasi Membran Timpani & Refleks Cahaya", answer_key: "Menilai refleks cahaya (cone of light) dan kanalis auditorius", max_points: 3, earned_points: 2.5, notes: "Temuan otoskopik akurat" },
        ],
        examiner_feedback: "Teknik otoskopik baik dan memperhatikan kenyamanan pasien.",
      },
    ],
  };

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
                {scorecard.participant_name} (NIM: {scorecard.nim})
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Banner */}
          <div className="grid gap-4 sm:grid-cols-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Nilai Total Rata-Rata</p>
              <p className="text-2xl font-black text-blue-600">{scorecard.total_score} / 100</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Status Kelulusan</p>
              <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
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
                Rincian Lembar Jawaban & Rubrik 6 Stase
              </span>
              <span className="text-xs text-slate-500 font-normal">
                6 Stase Terdaftar
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
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 transition"
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
                        <div>
                          <p className="font-bold text-slate-800 mb-2 uppercase text-[11px]">
                            Checklist Soal & Kriteria Jawaban Benar:
                          </p>

                          <div className="space-y-2">
                            {stg.checklist_items.map((item, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border border-slate-200 bg-white p-3 space-y-1 shadow-2xs"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-900">
                                  <span>{idx + 1}. {item.item}</span>
                                  <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                                    Poin: {item.earned_points} / {item.max_points}
                                  </span>
                                </div>

                                <p className="text-emerald-800 text-[11px] font-medium bg-emerald-50/60 p-1.5 rounded border border-emerald-100">
                                  <strong className="text-emerald-900">Kunci Jawaban:</strong> {item.answer_key}
                                </p>

                                {item.notes && (
                                  <p className="text-slate-500 text-[11px] italic">
                                    Catatan: {item.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
