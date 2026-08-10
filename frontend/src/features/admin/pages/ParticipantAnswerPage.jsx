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
        // Query osce.session_participants
        const { data: p } = await supabase
          .schema("osce")
          .from("session_participants")
          .select("*")
          .eq("id", participantId)
          .maybeSingle();

        let sessionTitle = "Ujian OSCE Sirkuit Terpadu";
        let full_name = p?.full_name || p?.email || "Peserta Ujian";
        let nim = p?.nim || (p?.email ? p.email.split("@")[0] : "-");

        if (p) {
          const { data: sess } = await supabase
            .schema("osce")
            .from("sessions")
            .select("title")
            .eq("id", p.session_id)
            .maybeSingle();
          if (sess) sessionTitle = sess.title;
        }

        setScorecard({
          participant_name: full_name,
          nim: nim,
          institution: "Fakultas Kedokteran - MedSkill",
          session_title: sessionTitle,
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
                  answer_key: "Peserta mengucapkan salam, memperkenalkan diri, & mengonfirmasi identitas",
                  max_points: 1,
                  earned_points: 1,
                  notes: "Sangat sopan & komunikatif",
                },
                {
                  item: "Menanyakan onset, kualitas, & radiasi nyeri dada",
                  answer_key: "Menanyakan nyeri dada khas infark (seperti ditindih beban berat) menjalar ke lengan",
                  max_points: 3,
                  earned_points: 3,
                  notes: "Anamnesis terstruktur",
                },
                {
                  item: "Melakukan auskultasi 4 katup jantung dengan benar",
                  answer_key: "Menggunakan stetoskop pada 4 area katup jantung dengan posisi pasien tepat",
                  max_points: 3,
                  earned_points: 3,
                  notes: "Teknik stetoskop tepat",
                },
                {
                  item: "Mengidentifikasi elevasi segmen ST pada V1-V4 EKG",
                  answer_key: "Membaca elevasi segmen ST dan menetapkan diagnosis kerja STEMI Anteroseptal",
                  max_points: 3,
                  earned_points: 3,
                  notes: "Diagnosis STEMI cepat & tepat",
                },
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
                {
                  item: "Anamnesis sesak napas akut & wheezing",
                  answer_key: "Menanyakan onset sesak, pemicu alergi, dan riwayat penggunaan inhaler",
                  max_points: 2,
                  earned_points: 2,
                  notes: "Lengkap",
                },
                {
                  item: "Inspeksi & auskultasi suara paru",
                  answer_key: "Menemukan wheezing ekspiratorik bilateral dan perkusi hipersonor",
                  max_points: 3,
                  earned_points: 3,
                  notes: "Auskultasi cermat",
                },
                {
                  item: "Pemberian Oksigenasi & Inhalasi Nebulizer",
                  answer_key: "Mereresepkan Salbutamol nebulizer + O2 kanul nasal 3-4 L/mnt",
                  max_points: 3,
                  earned_points: 3,
                  notes: "Dosis obat tepat",
                },
                {
                  item: "Indikasi & persiapan Needle Thoracocentesis",
                  answer_key: "Menjelaskan lokasi penusukan abocath pada ICS 2 Linea Midclavicularis",
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
                  answer_key: "Cuci tangan steril, gaun/sarung tangan steril, infiltrasi Lidokain 2%",
                  max_points: 3,
                  earned_points: 3,
                  notes: "Teknik steril terjaga",
                },
                {
                  item: "Debridement & irigasi cair fisiologis NaCl 0.9%",
                  answer_key: "Membersihkan jaringan nekrotik & pembilasan luka robek",
                  max_points: 3,
                  earned_points: 2.5,
                  notes: "Irigasi baik",
                },
                {
                  item: "Teknik Penjahitan Simple Interrupted Suture",
                  answer_key: "Menggunakan needle holder & pinset anatomis dengan 3 simpul simetris",
                  max_points: 4,
                  earned_points: 3.5,
                  notes: "Jahitan rapi",
                },
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
                {
                  item: "Pemeriksaan Saraf Kranial VII & XII",
                  answer_key: "Meminta pasien tersenyum, meringis, dan menjulurkan lidah lurus",
                  max_points: 3,
                  earned_points: 3,
                  notes: "Instruksi jelas",
                },
                {
                  item: "Pemeriksaan Kekuatan Otot Ekstremitas",
                  answer_key: "Menilai skala kekuatan motorik ekstremitas kanan (nilai 3/5)",
                  max_points: 3,
                  earned_points: 3,
                  notes: "Pemeriksaan tepat",
                },
                {
                  item: "Pemeriksaan Refleks Patologis Babinski",
                  answer_key: "Goresan telapak kaki dari lateral ke medial dengan respon dorsofleksi",
                  max_points: 3,
                  earned_points: 2.5,
                  notes: "Goresan halus",
                },
              ],
              examiner_feedback: "Pemeriksaan fungsi saraf kranial dan motorik sangat sistematis.",
            },
            {
              station_number: 5,
              title: "Stase 5: Konseling & Edukasi Diabetes Mellitus",
              examiner_name: "dr. Eka Rahmawati, Sp.PD",
              score: 94,
              max_score: 100,
              checklist_items: [
                {
                  item: "Edukasi & Peragaan Injeksi Insulin Pen",
                  answer_key: "Peragaan rotasi tempat suntikan abdomen, buang jarum, & dosis tepat",
                  max_points: 4,
                  earned_points: 4,
                  notes: "Simulasi insulin sangat jelas",
                },
                {
                  item: "Penanganan Hipoglikemia & Gaya Hidup",
                  answer_key: "Edukasi minum air gula jika pusing/keringat dingin & diet karbohidrat",
                  max_points: 3,
                  earned_points: 3,
                  notes: "Edukasi komprehensif",
                },
              ],
              examiner_feedback: "Sangat bagus dalam membina sambung rasa dan memberikan pemahaman obat insulin.",
            },
          ],
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
        <div className="flex h-[450px] items-center justify-center text-xs font-semibold text-slate-500">
          <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
          Memuat Lembar Jawaban & Transkrip Peserta...
        </div>
      </AdminLayout>
    );
  }

  if (!scorecard) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-xs text-slate-500 space-y-3">
          <p className="font-bold text-slate-700">Data peserta tidak ditemukan di Supabase.</p>
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
                  MONITOR LEMBAR JAWABAN PESERTA
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
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Nilai Akumulasi:</span>
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
              Rincian Skor Rubrik Per Stase ({scorecard.station_results.length} Stase Evaluasi)
            </h2>
          </div>

          <div className="space-y-3">
            {scorecard.station_results.map((stg) => {
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
                        Skor: {stg.score} / {stg.max_score}
                      </span>
                      <button className="text-slate-400 hover:text-slate-700">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4 animate-in fade-in duration-150">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Item Rubrik Penilaian:</span>
                        {stg.checklist_items.map((item, idx) => (
                          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 text-xs shadow-2xs">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{item.item}</span>
                              <span className="text-blue-700 font-black">{item.earned_points} / {item.max_points} Pts</span>
                            </div>
                            <p className="text-[11px] text-slate-500">Kunci: {item.answer_key}</p>
                            {item.notes && <p className="text-[11px] font-semibold text-purple-700">Catatan: {item.notes}</p>}
                          </div>
                        ))}
                      </div>

                      {stg.examiner_feedback && (
                        <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900 font-medium flex items-center gap-1.5">
                          <MessageSquare size={15} className="text-purple-600 shrink-0" />
                          <span>Feedback Dokter Penguji: "{stg.examiner_feedback}"</span>
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
