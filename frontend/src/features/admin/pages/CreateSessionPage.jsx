import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  MapPin,
  CheckCircle2,
  Sliders,
  Users,
  Save,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Info,
  Plus,
  Trash2,
  Award,
  Eye,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { INITIAL_MOCK_SESSIONS } from "@/features/admin/data/mockAdminData";

export default function CreateSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Active Menu Tab in Left Sidebar (1: Detail, 2: Parameter Stase, 3: Soal & Kasus, 4: Rule OSCE)
  const [activeTab, setActiveTab] = useState(1);

  // Active Selected Station inside Tab 3 Soal & Kasus (0 to stationsConfig.length - 1)
  const [selectedStationIndex, setSelectedStationIndex] = useState(0);

  // Form State 1: Detail Utama
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("2026-08-20");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:30");
  const [location, setLocation] = useState("Gedung Skill Lab Ruang OSCE Utama");
  const [maxParticipants, setMaxParticipants] = useState(6);

  // Form State 2: Parameter Stase
  const [totalStations, setTotalStations] = useState(6);
  const [stationDurationMinutes, setStationDurationMinutes] = useState(15);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(3);
  const [totalRounds, setTotalRounds] = useState(6);

  // Form State 3: Detail Stase, Soal-Soal & Kunci Jawaban Rubrik
  const [stationsConfig, setStationsConfig] = useState([
    {
      station_number: 1,
      title: "Stase 1: Kardiovaskular",
      case_title: "Sindrom Koroner Akut (STEMI Anteroseptal)",
      scenario: "Pasien laki-laki 52 tahun datang ke UGD dengan keluhan nyeri dada kiri menjalar ke lengan kiri sejak 2 jam lalu.",
      participant_instructions: "1. Lakukan anamnesis terarah.\n2. Lakukan pemeriksaan fisik auskultasi katup jantung.\n3. Interpretasikan EKG 12 Lead.",
      examiner_instructions: "Amati kepatuhan prosedur sterilitas tangan dan ketepatan penetapan diagnosis STEMI Anteroseptal.",
      checklist_items: [
        { id: "c1-1", question: "Menyapa pasien & membina sambung rasa", answer_key: "Peserta mengucapkan salam, memperkenalkan diri, & mengonfirmasi identitas pasien", max_points: 1 },
        { id: "c1-2", question: "Anamnesis terarah nyeri dada", answer_key: "Menanyakan lokasi, kualitas (seperti ditindih beban berat), radiasi, dan durasi nyeri", max_points: 3 },
        { id: "c1-3", question: "Pemeriksaan fisik auskultasi jantung", answer_key: "Menggunakan stetoskop pada 4 area katup jantung dengan posisi pasien tepat", max_points: 3 },
        { id: "c1-4", question: "Interpretasi EKG 12 Lead & Diagnosis", answer_key: "Mengidentifikasi elevasi segmen ST pada V1-V4 dan menyimpulkan STEMI Anteroseptal", max_points: 3 },
      ],
    },
    {
      station_number: 2,
      title: "Stase 2: Pulmonologi",
      case_title: "Status Asmatikus & Pneumotoraks Ventil",
      scenario: "Pasien perempuan 28 tahun datang dengan sesak napas berat berbunyi ngik-ngik dan bentuk dada cembung di sisi kanan.",
      participant_instructions: "1. Anamnesis sesak napas akut.\n2. Inspeksi & auskultasi suara paru.\n3. Simulasikan indikasi needle thoracocentesis.",
      examiner_instructions: "Nilai ketepatan penentuan lokasi puncture sela iga (ICS 2 linea midclavicularis).",
      checklist_items: [
        { id: "c2-1", question: "Anamnesis sesak napas & riwayat alergi", answer_key: "Menanyakan onset sesak, pemicu alergi, dan penggunaan inhaler sebelumnya", max_points: 2 },
        { id: "c2-2", question: "Inspeksi & auskultasi paru", answer_key: "Menemukan suara napas melemah pada paru kanan dan perkusis hipersonor", max_points: 3 },
        { id: "c2-3", question: "Prosedur Needle Thoracocentesis", answer_key: "Melakukan desinfeksi dan penusukan abocath pada ICS 2 Linea Midclavicularis kanan", max_points: 4 },
      ],
    },
    {
      station_number: 3,
      title: "Stase 3: Bedah Umum",
      case_title: "Debridement & Penutupan Luka Vulnus Laceratum",
      scenario: "Pasien laki-laki 30 tahun dengan luka robek sepanjang 5 cm pada lengan bawah bagian anterior akibat terkena kaca.",
      participant_instructions: "1. Cuci tangan steril dan gunakan sarung tangan steril.\n2. Lakukan debridement & desinfeksi luka.\n3. Lakukan penjahitan luka 3 jahitan simple interrupted.",
      examiner_instructions: "Nilai kerapian simpul jahitan dan kesterilan teknik aseptic.",
      checklist_items: [
        { id: "c3-1", question: "Persiapan steril & anestesi lokal", answer_key: "Cuci tangan steril, sarung tangan steril, dan infiltrasi Lidokain 2%", max_points: 3 },
        { id: "c3-2", question: "Debridement & irigasi NaCl 0.9%", answer_key: "Membersihkan jaringan nekrotik dan mebilas luka dengan cairan fisiologis", max_points: 3 },
        { id: "c3-3", question: "Teknik Penjahitan Simple Interrupted", answer_key: "Menggunakan needle holder & pinset anatomis dengan jarak jahitan simetris", max_points: 4 },
      ],
    },
    {
      station_number: 4,
      title: "Stase 4: Neurologi",
      case_title: "Stroke Iskemik Akut (GCS 15 & Hemiparesis)",
      scenario: "Pasien laki-laki 60 tahun mengeluh mulut mencong dan anggota gerak kanan lemas sejak 3 jam lalu saat bangun tidur.",
      participant_instructions: "1. Lakukan pemeriksaan saraf kranial VII & XII.\n2. Lakukan pemeriksaan motorik ekstremitas kanan.\n3. Periksa refleks patologis Babinski.",
      examiner_instructions: "Perhatikan kejelasan instruksi ke pasien saat tes motorik.",
      checklist_items: [
        { id: "c4-1", question: "Pemeriksaan Saraf Kranial VII & XII", answer_key: "Meminta pasien tersenyum, meringis, menjulurkan lidah lurus", max_points: 3 },
        { id: "c4-2", question: "Pemeriksaan Kekuatan Motorik", answer_key: "Menilai skor kekuatan otot ekstremitas kanan (nilai 3/5)", max_points: 3 },
        { id: "c4-3", question: "Pemeriksaan Refleks Babinski", answer_key: "Goresan telapak kaki dari lateral ke medial dengan hasil dorsofleksi ibu jari", max_points: 3 },
      ],
    },
    {
      station_number: 5,
      title: "Stase 5: Penyakit Dalam",
      case_title: "Edukasi Diabetes Melitus & Dosis Insulin",
      scenario: "Pasien 55 tahun baru terdiagnosis Diabetes Melitus Tipe 2 dengan GDS 320 mg/dL dan mendapat resep Insulin Pen.",
      participant_instructions: "1. Edukasi pola makan dan aktivitas fisik.\n2. Simulasikan penyuntikan Insulin Pen di regio abdomen.\n3. Jelaskan tanda-tanda hipoglikemia.",
      examiner_instructions: "Nilai empati dan kejelasan bahasa edukasi ke pasien.",
      checklist_items: [
        { id: "c5-1", question: "Bina sambung rasa & penyampaian diagnosis", answer_key: "Menjelaskan kondisi DM Tipe 2 dengan bahasa sederhana tanpa membuat panik", max_points: 2 },
        { id: "c5-2", question: "Edukasi Penggunaan Insulin Pen", answer_key: "Menjelaskan rotasi lokasi suntikan, pembuangan jarum, & waktu suntik sebelum makan", max_points: 4 },
        { id: "c5-3", question: "Penanganan Hipoglikemia", answer_key: "Mengedukasi minum air gula 1-2 sendok jika terasa berkeringat dingin & pusing", max_points: 3 },
      ],
    },
    {
      station_number: 6,
      title: "Stase 6: Otolaringologi (THT-KL)",
      case_title: "Pemeriksaan Otoskop Membran Timpani",
      scenario: "Pasien anak 8 tahun dibawa ibunya karena mengeluh telinga kanan terasa tersumbat dan pendengaran berkurang.",
      participant_instructions: "1. Lakukan inspeksi daun telinga.\n2. Gunakan otoskop dengan benar.\n3. Sebutkan temuan membran timpani & rencana ekstraksi serumen.",
      examiner_instructions: "Nilai posisi memegang otoskop (hold like a pen with pinky finger buffer).",
      checklist_items: [
        { id: "c6-1", question: "Pemeriksaan Fisik Telinga Luar", answer_key: "Inspeksi aurikula, retroaurikula, dan penarikan pinna ke arah superior-posterior", max_points: 3 },
        { id: "c6-2", question: "Teknik Penggunaan Otoskop", answer_key: "Memegang otoskop seperti pensil dengan kelingking bersandar pada pipi pasien", max_points: 4 },
        { id: "c6-3", question: "Identifikasi Membran Timpani", answer_key: "Menilai reflek cahaya (cone of light), warna intak/perforasi", max_points: 3 },
      ],
    },
  ]);

  // Form State 4: Rule & Aturan OSCE
  const [singleLiveSessionRule, setSingleLiveSessionRule] = useState(true);
  const [autoRollingRule, setAutoRollingRule] = useState(true);
  const [lateToleranceMinutes, setLateToleranceMinutes] = useState(5);
  const [autoLockAnswerRule, setAutoLockAnswerRule] = useState(true);
  const [autoPublishResults, setAutoPublishResults] = useState(false);

  // Prepopulate if EDIT mode
  useEffect(() => {
    if (isEdit) {
      const foundSession = INITIAL_MOCK_SESSIONS.find((s) => s.id === id) || INITIAL_MOCK_SESSIONS[0];
      setTitle(foundSession.title);
      setDescription(foundSession.description || "Evaluasi 6 stase komprehensif keterampilan klinis.");
      setSessionDate(foundSession.session_date || "2026-08-20");
      setStartTime(foundSession.start_time || "08:00");
      setEndTime(foundSession.end_time || "10:30");
      setLocation(foundSession.location || "Gedung Skill Lab Ruang OSCE Utama");
      setMaxParticipants(foundSession.max_participants || 6);
      setTotalStations(foundSession.total_stations || 6);
      setStationDurationMinutes(foundSession.station_duration_minutes || 15);
      setBreakDurationMinutes(foundSession.break_duration_minutes || 3);
    } else {
      setTitle("");
      setDescription("");
    }
  }, [isEdit, id]);

  // Inline Station Handler (No Modals)
  function handleAddStationInline() {
    const nextNum = stationsConfig.length + 1;
    const newStation = {
      station_number: nextNum,
      title: `Stase ${nextNum}: Keterampilan Medis Baru`,
      case_title: `Kasus Medis Stase ${nextNum}`,
      scenario: `Skenario kasus klinis lengkap untuk stase ${nextNum}.`,
      participant_instructions: `1. Anamnesis terarah.\n2. Prosedur pemeriksaan fisik.\n3. Diagnosis & terapi.`,
      examiner_instructions: `Amati kesterilan dan SOP medis penguji.`,
      checklist_items: [
        { id: `c${nextNum}-1`, question: "Menyapa pasien & sambung rasa", answer_key: "Peserta mengucapkan salam & konfirmasi identitas", max_points: 1 },
        { id: `c${nextNum}-2`, question: "Anamnesis keluhan utama", answer_key: "Menanyakan onset, lokasi, & riwayat penyakit", max_points: 3 },
      ],
    };

    setStationsConfig((prev) => [...prev, newStation]);
    setTotalStations(nextNum);
    setTotalRounds(nextNum);
    setSelectedStationIndex(nextNum - 1);
  }

  function handleRemoveStationInline(index) {
    if (stationsConfig.length <= 1) {
      alert("Minimal harus terdapat 1 Stase Ujian!");
      return;
    }
    const updated = stationsConfig
      .filter((_, idx) => idx !== index)
      .map((stg, idx) => ({ ...stg, station_number: idx + 1 }));

    setStationsConfig(updated);
    setTotalStations(updated.length);
    setTotalRounds(updated.length);
    setSelectedStationIndex(Math.max(0, index - 1));
  }

  // Inline Rubrik Item Handlers (No Modals)
  function handleAddChecklistItem() {
    setStationsConfig((prev) =>
      prev.map((stg, idx) => {
        if (idx === selectedStationIndex) {
          const newId = `c${stg.station_number}-${Date.now()}`;
          return {
            ...stg,
            checklist_items: [
              ...stg.checklist_items,
              {
                id: newId,
                question: "Pertanyaan Item Rubrik Baru",
                answer_key: "Kriteria kunci jawaban benar bagi dokter penguji",
                max_points: 2,
              },
            ],
          };
        }
        return stg;
      })
    );
  }

  function handleRemoveChecklistItem(itemId) {
    setStationsConfig((prev) =>
      prev.map((stg, idx) => {
        if (idx === selectedStationIndex) {
          return {
            ...stg,
            checklist_items: stg.checklist_items.filter((item) => item.id !== itemId),
          };
        }
        return stg;
      })
    );
  }

  function handleUpdateChecklistItem(itemId, field, value) {
    setStationsConfig((prev) =>
      prev.map((stg, idx) => {
        if (idx === selectedStationIndex) {
          return {
            ...stg,
            checklist_items: stg.checklist_items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item
            ),
          };
        }
        return stg;
      })
    );
  }

  // Section Save Handler
  function handleSaveCurrentSection(isDraftOnly = true) {
    if (!title.trim() && activeTab === 1) {
      alert("Harap isi Nama Sesi OSCE terlebih dahulu!");
      return false;
    }

    const payload = {
      title: title || "Sesi OSCE Tanpa Judul",
      description,
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      location,
      max_participants: Number(maxParticipants),
      total_stations: Number(totalStations),
      total_examiners: Number(totalStations),
      station_duration_minutes: Number(stationDurationMinutes),
      break_duration_minutes: Number(breakDurationMinutes),
      total_rounds: Number(totalRounds),
      status: isDraftOnly ? "draft" : "published",
      rules: {
        single_live_session: singleLiveSessionRule,
        auto_rolling: autoRollingRule,
        late_tolerance_minutes: lateToleranceMinutes,
        auto_lock_answer: autoLockAnswerRule,
        auto_publish_results: autoPublishResults,
      },
      stations: stationsConfig.slice(0, totalStations),
    };

    console.log("Section Saved:", payload);
    alert(
      isDraftOnly
        ? `Draft Bagian ${activeTab} berhasil disimpan!`
        : `Sesi OSCE "${title}" berhasil diterbitkan!`
    );
    return true;
  }

  function handleNextTab() {
    if (activeTab === 1 && !title.trim()) {
      alert("Harap isi Nama Sesi OSCE terlebih dahulu!");
      return;
    }

    if (activeTab < 4) {
      setActiveTab(activeTab + 1);
    } else {
      // Final Section complete
      handleSaveCurrentSection(false);
      navigate("/admin/sessions");
    }
  }

  const activeStation = stationsConfig[selectedStationIndex] || stationsConfig[0];

  return (
    <AdminLayout>
      {/* Top Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/sessions")}
          className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Kembali ke Kelola Sesi
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {isEdit ? "Edit Sesi OSCE & Soal Rubrik" : "Buat Sesi OSCE Baru"}
              </h1>
              <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-800">
                {isEdit ? "Mode Edit" : "Mode Buat Baru"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Formulir terstruktur tanpa modal: Pengaturan Sesi (Panel Kiri) & Form Input Langsung (Panel Kanan).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveCurrentSection(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
            >
              <Save size={15} />
              Simpan Draft
            </button>

            {isEdit && (
              <button
                onClick={() => navigate(`/admin/sessions/${id}`)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
              >
                <Eye size={15} />
                Preview Sesi
              </button>
            )}

            <button
              onClick={() => {
                handleSaveCurrentSection(false);
                navigate("/admin/sessions");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95"
            >
              <CheckCircle2 size={15} />
              {isEdit ? "Simpan Perubahan" : "Terbitkan Sesi"}
            </button>
          </div>
        </div>
      </div>

      {/* 2-PANEL LAYOUT (LEFT SIDEBAR TAB MENU + RIGHT WIDE FORM CONTENT) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* PANEL 1 (LEFT SIDEBAR - 4 COLS): VERTICAL MENU TABS */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigasi Formulir OSCE
            </div>

            <SidebarMenuTabBtn
              active={activeTab === 1}
              title="1. Detail Utama OSCE"
              subtitle="Nama, Jadwal, Lokasi & Kuota"
              icon={<FileText size={18} />}
              onClick={() => setActiveTab(1)}
            />

            <SidebarMenuTabBtn
              active={activeTab === 2}
              title="2. Parameter Stase"
              subtitle="Jumlah Stase & Durasi Rotasi"
              icon={<Building2 size={18} />}
              onClick={() => setActiveTab(2)}
            />

            <SidebarMenuTabBtn
              active={activeTab === 3}
              title="3. Soal & Kunci Jawaban Stase"
              subtitle="Kasus, Skenario & Checklist Rubrik"
              icon={<BookOpen size={18} />}
              onClick={() => setActiveTab(3)}
            />

            <SidebarMenuTabBtn
              active={activeTab === 4}
              title="4. Rule & Otomatisasi"
              subtitle="Live Rules & Penguncian Nilai"
              icon={<Sliders size={18} />}
              onClick={() => setActiveTab(4)}
            />
          </div>

          {/* Quick Summary Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Info size={16} className="text-blue-600" />
              Ringkasan Konfigurasi Sesi
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5 text-slate-600">
                <span>Total Stase:</span>
                <span className="font-bold text-slate-900">{totalStations} Stase</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5 text-slate-600">
                <span>Durasi Stase:</span>
                <span className="font-bold text-slate-900">{stationDurationMinutes} Menit</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5 text-slate-600">
                <span>Durasi Break:</span>
                <span className="font-bold text-slate-900">{breakDurationMinutes} Menit</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Maks. Peserta:</span>
                <span className="font-bold text-slate-900">{maxParticipants} Peserta</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2 (RIGHT WIDE CONTENT - 8 COLS): ACTIVE FORM CONTENT */}
        <div className="lg:col-span-8 space-y-6">

          {/* TAB 1 CONTENT: DETAIL UTAMA */}
          {activeTab === 1 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={19} className="text-blue-600" />
                  1. Informasi & Detail Utama Sesi OSCE
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi judul sesi, deskripsi, tanggal, jam pelaksanaan, serta kuota peserta.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Nama / Judul Sesi OSCE <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ujian OSCE Periodik Dokter Spesialis - Batch IV 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Deskripsi Pelaksanaan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan petunjuk khusus, syarat peserta, atau catatan pelaksanaan..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <CalendarDays size={14} className="text-slate-400" />
                    Tanggal Ujian
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />
                    Lokasi Gedung / Ruangan
                  </label>
                  <input
                    type="text"
                    placeholder="Gedung Skill Lab Ruang OSCE Utama"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    Jam Mulai Ujian
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    Estimasi Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Users size={14} className="text-slate-400" />
                    Maksimal Peserta per Gelombang
                  </label>
                  <input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons for Tab 1 */}
              <div className="flex justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleSaveCurrentSection(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <Save size={15} />
                  Simpan Draft Bagian Ini
                </button>
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
                >
                  Lanjutkan: Parameter Stase
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: PARAMETER STASE */}
          {activeTab === 2 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 size={19} className="text-blue-600" />
                    2. Konfigurasi Parameter Stase & Durasi Rotasi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tentukan jumlah stase, waktu pengerjaan, dan durasi istirahat. Tambah stase baru secara langsung tanpa modal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddStationInline}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition active:scale-95"
                >
                  <Plus size={15} />
                  Tambah Stase Baru
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Jumlah Stase Ujian
                  </label>
                  <select
                    value={totalStations}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTotalStations(val);
                      setTotalRounds(val);
                    }}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value={4}>4 Stase</option>
                    <option value={6}>6 Stase (Standar)</option>
                    <option value={8}>8 Stase</option>
                    <option value={10}>10 Stase</option>
                    <option value={12}>12 Stase</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Durasi Stase (Menit)
                  </label>
                  <input
                    type="number"
                    value={stationDurationMinutes}
                    onChange={(e) => setStationDurationMinutes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Durasi Break (Menit)
                  </label>
                  <input
                    type="number"
                    value={breakDurationMinutes}
                    onChange={(e) => setBreakDurationMinutes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Inline Editable Station Cards Overview (No Modals) */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase">
                    Daftar {stationsConfig.length} Stase Terkonfigurasi
                  </h3>
                  <span className="text-[11px] text-slate-500">Form Input Langsung (Inline Edit)</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {stationsConfig.map((stg, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs transition hover:border-blue-300 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 font-extrabold text-blue-800 text-xs">
                          {stg.station_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStationInline(idx)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Hapus Stase Ini"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={stg.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStationsConfig((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                            );
                          }}
                          className="w-full rounded-md border border-slate-200 p-1.5 text-xs font-bold text-slate-900"
                        />
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {stg.case_title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Tab 2 */}
              <div className="flex justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleSaveCurrentSection(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <Save size={15} />
                  Simpan Draft Bagian Ini
                </button>
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
                >
                  Lanjutkan: Soal & Kunci Jawaban
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3 CONTENT: SOAL-SOAL, KASUS & KUNCI JAWABAN RUBRIK */}
          {activeTab === 3 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen size={19} className="text-blue-600" />
                    3. Detail Stase, Soal & Kunci Jawaban Rubrik
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola skenario kasus medis, instruksi, serta item soal-soal dan kunci jawaban rubrik secara inline tanpa modal.
                  </p>
                </div>
              </div>

              {/* Station Selection Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
                {stationsConfig.slice(0, totalStations).map((stg, idx) => (
                  <button
                    key={stg.station_number}
                    onClick={() => setSelectedStationIndex(idx)}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
                      selectedStationIndex === idx
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>Stase {stg.station_number}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        selectedStationIndex === idx
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {stg.checklist_items.length} Soal
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Station Form Editor */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
                      STASE {activeStation.station_number}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {activeStation.title}
                    </h3>
                  </div>
                </div>

                {/* Skenario & Judul Kasus */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Judul Kasus Medis
                    </label>
                    <input
                      type="text"
                      value={activeStation.case_title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStationsConfig((prev) =>
                          prev.map((item, i) =>
                            i === selectedStationIndex ? { ...item, case_title: val } : item
                          )
                        );
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Skenario Kasus Medis Lengkap
                    </label>
                    <textarea
                      rows={2}
                      value={activeStation.scenario}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStationsConfig((prev) =>
                          prev.map((item, i) =>
                            i === selectedStationIndex ? { ...item, scenario: val } : item
                          )
                        );
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Instruksi Peserta Ujian
                    </label>
                    <textarea
                      rows={3}
                      value={activeStation.participant_instructions}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStationsConfig((prev) =>
                          prev.map((item, i) =>
                            i === selectedStationIndex
                              ? { ...item, participant_instructions: val }
                              : item
                          )
                        );
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Instruksi Dokter Penguji
                    </label>
                    <textarea
                      rows={3}
                      value={activeStation.examiner_instructions}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStationsConfig((prev) =>
                          prev.map((item, i) =>
                            i === selectedStationIndex
                              ? { ...item, examiner_instructions: val }
                              : item
                          )
                        );
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700"
                    />
                  </div>
                </div>

                {/* Rubrik Penilaian: Item Soal & Kunci Jawaban */}
                <div className="border-t border-slate-200 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                        <Award size={15} className="text-blue-600" />
                        Daftar Soal Rubrik & Kunci Jawaban ({activeStation.checklist_items.length} Item)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tambah & edit item pertanyaan rubrik dan kunci jawaban secara langsung di halaman ini.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition active:scale-95 shadow-2xs"
                    >
                      <Plus size={14} />
                      Tambah Soal Rubrik
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeStation.checklist_items.map((item, itemIdx) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-blue-700">
                            Soal #{itemIdx + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-slate-500 font-medium">Bobot:</span>
                              <input
                                type="number"
                                value={item.max_points}
                                onChange={(e) =>
                                  handleUpdateChecklistItem(
                                    item.id,
                                    "max_points",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-12 rounded-md border border-slate-200 text-center py-0.5 text-xs font-bold text-slate-900"
                              />
                              <span className="text-slate-500">Poin</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveChecklistItem(item.id)}
                              className="text-slate-400 hover:text-rose-600 transition"
                              title="Hapus Soal Rubrik"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="mb-0.5 block text-[10px] font-bold text-slate-600 uppercase">
                            Pertanyaan / Item Rubrik
                          </label>
                          <input
                            type="text"
                            value={item.question}
                            onChange={(e) =>
                              handleUpdateChecklistItem(item.id, "question", e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="mb-0.5 block text-[10px] font-bold text-emerald-700 uppercase">
                            Kunci Jawaban / Kriteria Penilaian Benar
                          </label>
                          <input
                            type="text"
                            value={item.answer_key}
                            onChange={(e) =>
                              handleUpdateChecklistItem(item.id, "answer_key", e.target.value)
                            }
                            className="w-full rounded-lg border border-emerald-200 bg-emerald-50/40 p-2 text-xs text-emerald-900 font-medium"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Tab 3 */}
              <div className="flex justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleSaveCurrentSection(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <Save size={15} />
                  Simpan Draft Bagian Ini
                </button>
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
                >
                  Lanjutkan: Rule & Otomatisasi
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4 CONTENT: RULE & OTOMATISASI */}
          {activeTab === 4 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders size={19} className="text-blue-600" />
                  4. Aturan Pelaksanaan & Otomatisasi OSCE
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Konfigurasi aturan eksekusi live, rolling rotasi, dan penguncian lembar nilai.
                </p>
              </div>

              <div className="space-y-3.5">
                <RuleToggleItem
                  title="Aturan Sesi Live Eksklusif (Single Live Session)"
                  description="Memastikan hanya 1 sesi OSCE yang dapat berjalan secara live dalam 1 waktu. Sesi lain diblokir dari start bersamaan."
                  checked={singleLiveSessionRule}
                  onChange={setSingleLiveSessionRule}
                />

                <RuleToggleItem
                  title="Otomatisasi Perputaran Rolling Peserta"
                  description="Peserta akan dipindahkan otomatis ke stase berikutnya setelah timer pengerjaan dan istirahat selesai."
                  checked={autoRollingRule}
                  onChange={setAutoRollingRule}
                />

                <RuleToggleItem
                  title="Penguncian Lembar Penilaian Penguji Otomatis"
                  description="Mengunci formulir nilai penguji saat waktu stase berakhir untuk menghindari perubahan skor susulan."
                  checked={autoLockAnswerRule}
                  onChange={setAutoLockAnswerRule}
                />

                <RuleToggleItem
                  title="Publikasi Nilai Otomatis ke Peserta"
                  description="Mempublikasikan hasil rekapitulasi nilai dan umpan balik ke akun peserta secara otomatis begitu sesi selesai."
                  checked={autoPublishResults}
                  onChange={setAutoPublishResults}
                />

                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Toleransi Keterlambatan Peserta (Menit)
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Waktu maksimal peserta diizinkan memasuki ruang ujian sebelum statusnya diubah menjadi diskualifikasi.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={lateToleranceMinutes}
                      onChange={(e) => setLateToleranceMinutes(Number(e.target.value))}
                      className="w-28 rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-center bg-white"
                    />
                    <span className="text-xs font-semibold text-slate-600">Menit</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Tab 4 */}
              <div className="flex justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleSaveCurrentSection(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <Save size={15} />
                  Simpan Draft Sesi
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSaveCurrentSection(false);
                    navigate("/admin/sessions");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
                >
                  <CheckCircle2 size={16} />
                  {isEdit ? "Simpan Perubahan Sesi" : "Simpan & Terbitkan Sesi OSCE"}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </AdminLayout>
  );
}

function SidebarMenuTabBtn({ active, title, subtitle, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition border ${
        active
          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
          : "bg-white border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="font-bold text-xs">{title}</p>
        <p
          className={`text-[11px] mt-0.5 ${
            active ? "text-blue-100 font-medium" : "text-slate-500"
          }`}
        >
          {subtitle}
        </p>
      </div>
    </button>
  );
}

function RuleToggleItem({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white hover:border-blue-200 transition">
      <div className="pr-4">
        <p className="font-bold text-xs text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-blue-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
