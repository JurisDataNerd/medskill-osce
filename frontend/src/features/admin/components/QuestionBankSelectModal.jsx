import { useState, useEffect } from "react";
import {
  X,
  Search,
  Filter,
  BookOpen,
  CheckCircle2,
  Award,
  Layers,
  Sparkles,
  FileText,
  Loader2,
} from "lucide-react";
import { fetchQuestionBankCatalog } from "@/services/questionBankService";

export const QUESTION_BANK_CATALOG = [
  {
    id: "qb-001",
    title: "Sindrom Koroner Akut (STEMI Anteroseptal)",
    system_organ: "Kardiovaskular",
    skdi_level: "4A (Tuntas Mandiri)",
    case_title: "Sindrom Koroner Akut (STEMI Anteroseptal)",
    scenario:
      "Pasien laki-laki 52 tahun datang ke UGD dengan keluhan nyeri dada kiri menjalar ke lengan kiri sejak 2 jam lalu, disertai keringat dingin dan mual.",
    participant_instructions:
      "1. Lakukan anamnesis terarah mengenai keluhan nyeri dada.\n2. Lakukan pemeriksaan fisik auskultasi katup jantung.\n3. Interpretasikan EKG 12 Lead & tetapkan diagnosis.",
    examiner_instructions:
      "Amati kepatuhan prosedur sterilitas tangan, teknik auskultasi jantung 4 katup, dan ketepatan penetapan diagnosis STEMI Anteroseptal.",
    checklist_items: [
      {
        id: "qb1-1",
        question: "Menyapa pasien & membina sambung rasa",
        answer_key:
          "Peserta mengucapkan salam, memperkenalkan diri, & mengonfirmasi identitas pasien",
        max_points: 1,
      },
      {
        id: "qb1-2",
        question: "Anamnesis terarah nyeri dada (PQRST)",
        answer_key:
          "Menanyakan lokasi, kualitas (seperti ditindih beban berat), radiasi ke lengan/rahang, dan durasi nyeri",
        max_points: 3,
      },
      {
        id: "qb1-3",
        question: "Pemeriksaan fisik auskultasi katup jantung",
        answer_key:
          "Menggunakan stetoskop pada 4 area katup jantung (Aorta, Pulmonal, Trikuspid, Mitral) dengan posisi pasien tepat",
        max_points: 3,
      },
      {
        id: "qb1-4",
        question: "Interpretasi EKG 12 Lead & Diagnosis STEMI",
        answer_key:
          "Mengidentifikasi elevasi segmen ST pada Lead V1-V4 dan menyimpulkan STEMI Anteroseptal",
        max_points: 3,
      },
    ],
    auxiliary_exam_configs: [
      {
        itemId: "ekg-01",
        name: "EKG 12 Lead",
        category: "EKG & ELEKTRODIAGNOSTIK",
        imageUrl:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
        reportText: "ST Elevation pada Lead V1-V4 (STEMI Anteroseptal)",
      },
    ],
  },
  {
    id: "qb-002",
    title: "Eksaserbasi Akut Asma Bronkial & Pneumotoraks Ventil",
    system_organ: "Respirasi",
    skdi_level: "4A (Tuntas Mandiri)",
    case_title: "Status Asmatikus & Pneumotoraks Ventil",
    scenario:
      "Pasien perempuan 28 tahun datang dengan sesak napas berat berbunyi ngik-ngik setelah terpapar debu dan bentuk dada cembung di sisi kanan.",
    participant_instructions:
      "1. Lakukan anamnesis sesak napas akut & faktor pemicu.\n2. Lakukan inspeksi, perkusi, & auskultasi paru.\n3. Simulasikan indikasi Needle Thoracocentesis.",
    examiner_instructions:
      "Nilai ketepatan penentuan lokasi puncture sela iga (ICS 2 linea midclavicularis dextra).",
    checklist_items: [
      {
        id: "qb2-1",
        question: "Anamnesis sesak napas & riwayat atopi/alergi",
        answer_key:
          "Menanyakan onset sesak, pemicu alergi, dan penggunaan inhaler sebelumnya",
        max_points: 2,
      },
      {
        id: "qb2-2",
        question: "Inspeksi, perkusi & auskultasi paru",
        answer_key:
          "Menemukan suara napas melemah pada paru kanan, perkusi hipersonor, & wheezing ekspiratorik",
        max_points: 3,
      },
      {
        id: "qb2-3",
        question: "Prosedur Needle Thoracocentesis",
        answer_key:
          "Melakukan desinfeksi dan penusukan abocath pada ICS 2 Linea Midclavicularis kanan",
        max_points: 4,
      },
    ],
    auxiliary_exam_configs: [
      {
        itemId: "rad-01",
        name: "Foto Thorax AP/PA",
        category: "RADIOLOGI",
        imageUrl:
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80",
        reportText:
          "Lucent area avaskular pada hemithorax dextra dengan collapse line (Pneumothorax Dextra)",
      },
    ],
  },
  {
    id: "qb-003",
    title: "Debridement & Penutupan Luka Vulnus Laceratum",
    system_organ: "Bedah Umum",
    skdi_level: "4A (Tuntas Mandiri)",
    case_title: "Debridement & Penutupan Luka Vulnus Laceratum",
    scenario:
      "Pasien laki-laki 30 tahun dengan luka robek sepanjang 5 cm pada lengan bawah bagian anterior akibat terkena pecahan kaca saat bekerja.",
    participant_instructions:
      "1. Lakukan persiapan steril dan penggunaan sarung tangan steril.\n2. Lakukan debridement & irigasi desinfeksi luka.\n3. Lakukan penjahitan luka 3 jahitan simple interrupted.",
    examiner_instructions:
      "Nilai kerapian simpul jahitan, kesterilan teknik aseptik, dan kecukupan infiltrasi anestesi Lidokain.",
    checklist_items: [
      {
        id: "qb3-1",
        question: "Persiapan steril & infiltrasi anestesi lokal",
        answer_key:
          "Cuci tangan steril 6 langkah, sarung tangan steril, dan infiltrasi Lidokain 2% subkutan",
        max_points: 3,
      },
      {
        id: "qb3-2",
        question: "Debridement & irigasi cairan NaCl 0.9%",
        answer_key:
          "Membersihkan jaringan nekrotik dan membilas luka dengan cairan fisiologis hingga bersih",
        max_points: 3,
      },
      {
        id: "qb3-3",
        question: "Teknik Penjahitan Simple Interrupted",
        answer_key:
          "Menggunakan needle holder & pinset anatomis dengan jarak jahitan simetris 0.5 cm",
        max_points: 4,
      },
    ],
    auxiliary_exam_configs: [],
  },
  {
    id: "qb-004",
    title: "Stroke Iskemik Akut & Refleks Patologis",
    system_organ: "Neurologi",
    skdi_level: "3B (Gawat Darurat)",
    case_title: "Stroke Iskemik Akut (GCS 15 & Hemiparesis Dextra)",
    scenario:
      "Pasien laki-laki 60 tahun mengeluh mulut mencong ke kiri dan anggota gerak kanan lemas sejak 3 jam lalu saat bangun tidur.",
    participant_instructions:
      "1. Lakukan pemeriksaan saraf kranial N. VII & N. XII.\n2. Lakukan tes kekuatan otot motorik ekstremitas kanan.\n3. Periksa refleks patologis Babinski.",
    examiner_instructions:
      "Perhatikan kejelasan komunikasi instruksi ke pasien dan ketepatan goresan refleks Babinski.",
    checklist_items: [
      {
        id: "qb4-1",
        question: "Pemeriksaan Saraf Kranial VII & XII Sentral",
        answer_key:
          "Meminta pasien tersenyum, meringis, menjulurkan lidah lurus, dan menilai asimetris wajah",
        max_points: 3,
      },
      {
        id: "qb4-2",
        question: "Pemeriksaan Kekuatan Motorik Ekstremitas",
        answer_key:
          "Menilai skor kekuatan otot ekstremitas kanan atas & bawah (skor motorik 3/5)",
        max_points: 3,
      },
      {
        id: "qb4-3",
        question: "Pemeriksaan Refleks Patologis Babinski",
        answer_key:
          "Goresan telapak kaki dari lateral ke medial dengan hasil dorsofleksi ibu jari kaki",
        max_points: 3,
      },
    ],
    auxiliary_exam_configs: [],
  },
  {
    id: "qb-005",
    title: "Edukasi Diabetes Melitus Tipe 2 & Terapi Pen Insulin",
    system_organ: "Endokrin",
    skdi_level: "4A (Tuntas Mandiri)",
    case_title: "Edukasi Diabetes Melitus & Terapi Pen Insulin",
    scenario:
      "Pasien perempuan 55 tahun mengeluh gula darah puasa tidak terkontrol (240 mg/dL) meski sudah meminum Kombinasi Obat OHO secara teratur.",
    participant_instructions:
      "1. Berikan edukasi penyakit DM Tipe 2 dan indikasi insulin.\n2. Demo & edukasi penggunaan pen insulin subkutan.\n3. Buat lembar resep kombinasi insulin.",
    examiner_instructions:
      "Nilai empati komunikasi edukasi penyuntikan pen insulin dan lokasi rotasi abdomen.",
    checklist_items: [
      {
        id: "qb5-1",
        question: "Edukasi penyakit DM Tipe 2 & target gula darah",
        answer_key:
          "Menjelaskan komplikasi gula darah tinggi dan alasan pentingnya memulai terapi insulin",
        max_points: 3,
      },
      {
        id: "qb5-2",
        question: "Demo & edukasi teknik penyuntikan pen insulin",
        answer_key:
          "Menjelaskan cara pasang jarum, priming 2 unit, pencubitan kulit subkutan, dan rotasi lokasi",
        max_points: 4,
      },
    ],
    auxiliary_exam_configs: [],
  },
  {
    id: "qb-006",
    title: "Pemeriksaan Otoskop & Ekstraksi Serumen Prop",
    system_organ: "THT-KL",
    skdi_level: "4A (Tuntas Mandiri)",
    case_title: "Pemeriksaan Otoskop & Ekstraksi Serumen",
    scenario:
      "Pasien anak laki-laki 8 tahun diantar ibunya dengan keluhan telinga kanan terasa tersumbat dan pendengaran berkurang setelah berenang.",
    participant_instructions:
      "1. Lakukan pemeriksaan otoskop telinga kanan & kiri.\n2. Jelaskan temuan serumen prop obstruksi.\n3. Simulasikan ekstraksi/irigasi serumen.",
    examiner_instructions:
      "Amati teknik pemegangan otoskop yang benar (pen-grip) dan penarikan aurikula anak.",
    checklist_items: [
      {
        id: "qb6-1",
        question: "Pemeriksaan Otoskopiah Telinga",
        answer_key:
          "Penarikan aurikula ke atas-belakang pada anak/dewasa dan visualisasi liang telinga",
        max_points: 3,
      },
      {
        id: "qb6-2",
        question: "Ekstraksi serumen prop dengan kuret/irigasi",
        answer_key:
          "Menggunakan pengait/kuret serumen secara hati-hati atau irigasi air hangat 37°C",
        max_points: 3,
      },
    ],
    auxiliary_exam_configs: [],
  },
  {
    id: "qb-007",
    title: "Penanganan Kejang Demam Kompleks pada Anak",
    system_organ: "Pediatri",
    skdi_level: "4A (Tuntas Mandiri)",
    case_title: "Kejang Demam Kompleks pada Anak",
    scenario:
      "Anak laki-laki 2 tahun diantar orang tuanya ke UGD karena kejang tonik-klonik durasi 5 menit disertai suhu tubuh 39.2°C.",
    participant_instructions:
      "1. Lakukan penanganan awal kejang & patensi jalan napas.\n2. Simulasikan pemberian Diazepam rektal.\n3. Edukasi orang tua mengenai pencegahan kejang demam.",
    examiner_instructions:
      "Nilai kecepatan posisi miring stabil dan ketepatan dosis Diazepam Rektal (5 mg untuk anak < 10 kg).",
    checklist_items: [
      {
        id: "qb7-1",
        question: "Penanganan awal airway & breathing saat kejang",
        answer_key:
          "Memposisikan pasien miring stabil, bebaskan jalan napas, berikan oksigen nuchal 2-4 L/m",
        max_points: 3,
      },
      {
        id: "qb7-2",
        question: "Pemberian Diazepam Rektal",
        answer_key:
          "Memasukkan Diazepam Suppositoria 5 mg rektal jika kejang masih berlangsung",
        max_points: 4,
      },
    ],
    auxiliary_exam_configs: [],
  },
  {
    id: "qb-008",
    title: "Apendisitis Akut & Pemeriksaan Nyeri Tekan McBurney",
    system_organ: "Digestif",
    skdi_level: "4A (Tuntas Mandiri)",
    case_title: "Apendisitis Akut (Pemeriksaan Abdomen McBurney)",
    scenario:
      "Pemuda 19 tahun mengeluh nyeri perut sekitar pusat yang berpindah ke kanan bawah sejak 12 jam lalu, disertai demam 38°C dan mual.",
    participant_instructions:
      "1. Lakukan anamnesis migrasi nyeri khas apendisitis.\n2. Lakukan pemeriksaan fisik abdomen (McBurney, Rovsing, Psoas sign).\n3. Rencanakan tindakan apendektomi & rujukan.",
    examiner_instructions:
      "Nilai ketepatan titik McBurney (1/3 lateral garis spina iliaca anterior superior ke umbilikus).",
    checklist_items: [
      {
        id: "qb8-1",
        question: "Anamnesis migrasi nyeri & skor Alvarado",
        answer_key:
          "Menanyakan nyeri periumbilikal yang berpindah ke RLQ, anoreksia, mual, dan muntah",
        max_points: 3,
      },
      {
        id: "qb8-2",
        question: "Pemeriksaan fisik McBurney, Rovsing & Psoas Sign",
        answer_key:
          "Menemukan nyeri tekan & lepas McBurney, Rovsing sign (+), dan Psoas sign (+)",
        max_points: 4,
      },
    ],
    auxiliary_exam_configs: [],
  },
];

export default function QuestionBankSelectModal({
  isOpen,
  onClose,
  onSelectCase,
}) {
  const [catalog, setCatalog] = useState(QUESTION_BANK_CATALOG);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgan, setSelectedOrgan] = useState("ALL");

  useEffect(() => {
    if (!isOpen) return;
    async function loadCatalog() {
      try {
        const data = await fetchQuestionBankCatalog();
        if (data && data.length > 0) {
          setCatalog(data);
        }
      } catch (err) {
        console.warn("Could not fetch catalog from Supabase, using catalog fallback:", err);
      }
    }
    loadCatalog();
  }, [isOpen]);

  if (!isOpen) return null;

  const organCategories = [
    "ALL",
    "Kardiovaskular",
    "Respirasi",
    "Bedah Umum",
    "Neurologi",
    "Endokrin",
    "THT-KL",
    "Pediatri",
    "Digestif",
  ];

  const filteredCases = catalog.filter((item) => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.scenario || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.system_organ || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOrgan =
      selectedOrgan === "ALL" || item.system_organ === selectedOrgan;

    return matchesSearch && matchesOrgan;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 font-bold">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Pilih Soal dari Bank Soal MedSkill
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                  {QUESTION_BANK_CATALOG.length} Kasus Baku
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih paket soal medis terstandar untuk otomatis mengisi skenario, instruksi, dan rubrik kunci jawaban.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-3 shrink-0">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-3 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul kasus, kata kunci skenario, atau sistem organ..."
              className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
            />
          </div>

          {/* Organ Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1 mr-1 shrink-0">
              <Filter size={13} /> Filter Organ:
            </span>
            {organCategories.map((org) => (
              <button
                key={org}
                type="button"
                onClick={() => setSelectedOrgan(org)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition shrink-0 border ${
                  selectedOrgan === org
                    ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {org === "ALL" ? "Semua Organ" : org}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog List Scrollable Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {filteredCases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">
                Tidak ada kasus medis yang sesuai dengan pencarian.
              </p>
              <p>Coba ubah kata kunci pencarian atau pilih kategori organ lain.</p>
            </div>
          ) : (
            filteredCases.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-400 hover:bg-white hover:shadow-md space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-blue-100 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-900">
                        {item.system_organ}
                      </span>
                      <span className="rounded-md bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-900">
                        SKDI {item.skdi_level}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 ml-auto sm:ml-0">
                        <Award size={13} className="text-blue-600" />
                        {item.checklist_items.length} Item Rubrik
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.scenario}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectCase(item);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition shrink-0"
                  >
                    <Sparkles size={14} />
                    Gunakan Soal Ini
                  </button>
                </div>

                {/* Rubrik Preview Snippet */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-[11px] space-y-1.5">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                    Pratinjau Item Rubrik:
                  </span>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {item.checklist_items.slice(0, 2).map((chk, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 border border-slate-100 p-2"
                      >
                        <span className="truncate text-slate-800 font-medium">
                          #{idx + 1} {chk.question}
                        </span>
                        <span className="font-bold text-blue-700 shrink-0">
                          {chk.max_points} Poin
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 pt-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
