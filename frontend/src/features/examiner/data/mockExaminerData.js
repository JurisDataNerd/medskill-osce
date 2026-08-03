// Mock Data for Examiner Portal (Dokter Penguji)

export const CURRENT_EXAMINER_PROFILE = {
  id: "doc-01",
  name: "dr. Alexander Budiman, Sp.JP",
  email: "alexander.budiman@medskill.ac.id",
  specialty: "Kardiologi & Pembuluh Darah",
  avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
  assigned_session: "Ujian OSCE Periodik Dokter Spesialis - Batch III 2026",
  assigned_station_number: 1,
  assigned_station_title: "Stase 1: Kardiovaskular (STEMI Anteroseptal)",
};

export const EXAMINER_LIVE_SESSION = {
  id: "session-osce-001",
  session_title: "Ujian OSCE Periodik Dokter Spesialis - Batch III 2026",
  location: "Gedung Skill Lab Ruang OSCE Utama (Station 1)",
  session_date: "2026-08-03",
  status: "running", // running, paused, break, completed
  station_number: 1,
  station_name: "Stase 1: Kardiovaskular",
  case_title: "Sindrom Koroner Akut (STEMI Anteroseptal)",
  scenario: "Pasien laki-laki 52 tahun datang ke UGD dengan keluhan nyeri dada kiri khas infark miokard (seperti ditindih beban berat) menjalar ke lengan kiri sejak 2 jam lalu.",
  participant_instructions: "1. Lakukan anamnesis terarah nyeri dada.\n2. Lakukan auskultasi 4 katup jantung dengan benar.\n3. Interpretasikan EKG 12 Lead & sampaikan diagnosis STEMI Anteroseptal.",
  examiner_instructions: "Amati kepatuhan prosedur sterilitas tangan, teknik auskultasi jantung, dan penetapan diagnosis STEMI Anteroseptal.",
  
  // Timer & Break Info
  current_round: 2,
  total_rounds: 6,
  station_duration_seconds: 15 * 60, // 15 menit per stase
  break_after_round: 3, // Istirahat setelah Ronde 3
  break_duration_minutes: 10, // Istirahat 10 menit
  remaining_seconds: 11 * 60 + 45, // 11:45
  is_break: false,


  // Active Participant in Station 1 Round 2
  current_participant: {
    id: "part-001",
    nim: "20200710042",
    name: "Ahmad Rizky Pratama",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    round: 2,
    start_time: "08:18",
  },

  // Rubric Questions & Answer Keys
  rubric_items: [
    {
      id: "r1",
      question: "Menyapa pasien & membina sambung rasa",
      answer_key: "Peserta mengucapkan salam, memperkenalkan diri, & mengonfirmasi identitas pasien",
      max_points: 1,
      default_earned: 1,
    },
    {
      id: "r2",
      question: "Anamnesis terarah nyeri dada infark",
      answer_key: "Menanyakan onset, lokasi, kualitas (seperti ditindih beban), & radiasi nyeri ke lengan kiri",
      max_points: 3,
      default_earned: 3,
    },
    {
      id: "r3",
      question: "Auskultasi 4 katup jantung dengan benar",
      answer_key: "Menggunakan stetoskop pada 4 area katup jantung (aorta, pulmonal, trikuspid, mitral)",
      max_points: 3,
      default_earned: 2.5,
    },
    {
      id: "r4",
      question: "Interpretasi EKG 12 Lead & Diagnosis",
      answer_key: "Mengidentifikasi ST elevasi V1-V4 & menetapkan diagnosis STEMI Anteroseptal",
      max_points: 3,
      default_earned: 3,
    },
  ],

  // Rotation List of all 6 Rounds for Station 1
  rotation_list: [
    {
      round: 1,
      nim: "20200710001",
      name: "Budi Santoso",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      status: "completed",
      score: 85.0,
      global_rating: "LULUS",
      feedback: "Penanganan klinis baik, auskultasi cukup tenang.",
    },
    {
      round: 2,
      nim: "20200710042",
      name: "Ahmad Rizky Pratama",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      status: "active",
      score: null,
      global_rating: null,
      feedback: "",
    },
    {
      round: 3,
      nim: "20200710018",
      name: "Siti Rahmawati",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      status: "upcoming",
      score: null,
      global_rating: null,
      feedback: "",
    },
    {
      round: 4,
      nim: "20200710025",
      name: "Dewi Anggraini",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
      status: "upcoming",
      score: null,
      global_rating: null,
      feedback: "",
    },
    {
      round: 5,
      nim: "20200710033",
      name: "Fajar Nugraha",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: "upcoming",
      score: null,
      global_rating: null,
      feedback: "",
    },
    {
      round: 6,
      nim: "20200710047",
      name: "Rian Hidayat",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      status: "upcoming",
      score: null,
      global_rating: null,
      feedback: "",
    },
  ],
};

export const EXAMINER_HISTORY_SESSIONS = [
  {
    id: "hist-001",
    title: "Tryout OSCE Internal Bedah & Anestesi Seri II",
    session_date: "2026-07-28",
    station_name: "Stase 1: Kardiovaskular & Kritis",
    location: "Lab Keterampilan Klinik FK 2",
    total_examinees: 6,
    evaluated_count: 6,
    avg_score: 88.5,
    status: "published",
  },
  {
    id: "hist-002",
    title: "OSCE Stase Neurologi & Psikiatri Klinik 2026",
    session_date: "2026-07-10",
    station_name: "Stase 1: Pemeriksaan Saraf Kranial",
    location: "Gedung Skill Lab Ruang 101",
    total_examinees: 6,
    evaluated_count: 6,
    avg_score: 91.2,
    status: "published",
  },
  {
    id: "hist-003",
    title: "Simulasi OSCE Keterampilan Gawat Darurat ATLS/ACLS",
    session_date: "2026-06-15",
    station_name: "Stase 1: Resusitasi Jantung Paru",
    location: "Pusat Pelatihan Resusitasi RS Pendidikan",
    total_examinees: 6,
    evaluated_count: 6,
    avg_score: 86.0,
    status: "published",
  },
];
