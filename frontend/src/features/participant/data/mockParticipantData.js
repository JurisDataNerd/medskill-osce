// Mock Data for Participant Portal (Peserta Ujian OSCE)

export const MOCK_PARTICIPANT_PROFILE = {
  id: "part-001",
  name: "Ahmad Rizky Pratama",
  nim: "20200710042",
  email: "ahmad.rizky@medskill.ac.id",
  institution: "Fakultas Kedokteran MedSkill",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
};

export const OPEN_OSCE_SESSIONS = [
  {
    id: "session-osce-001",
    title: "Ujian OSCE Periodik Dokter Spesialis - Batch III 2026",
    session_date: "2026-08-03",
    start_time: "08:00",
    end_time: "12:00",
    location: "Gedung Skill Lab Ruang OSCE Utama (Ruang 101 - 106)",
    total_stations: 6,
    duration_per_station: "15 Menit",
    registered_participants: 24,
    max_participants: 36,
    status: "published", // published, running, open_registration
    description: "Sesi ujian OSCE periodik spesialisasi mencakup stase kardiovaskular, pulmonologi, neurologi, bedah, dan gawat darurat.",
    is_registered: true, // User already enrolled in this one
  },
  {
    id: "session-osce-002",
    title: "Tryout Nasional OSCE Kedokteran Klinik 2026",
    session_date: "2026-08-10",
    start_time: "09:00",
    end_time: "13:00",
    location: "Pusat Pelatihan Resusitasi & Simulasi Klinik",
    total_stations: 6,
    duration_per_station: "15 Menit",
    registered_participants: 12,
    max_participants: 40,
    status: "published",
    description: "Simulasi tryout nasional komprehensif uji kompetensi dokter dengan penilaian langsung dari dokter penguji senior.",
    is_registered: false,
  },
];

export const MOCK_CURRENT_LIVE_STAGE = {
  station_number: 1,
  title: "Stase 1: Kardiovaskular & Kegawatdaruratan Infark Miokard",
  case_title: "Sindrom Koroner Akut (STEMI Anteroseptal)",
  examiner_name: "dr. Alexander Budiman, Sp.JP",
  duration_seconds: 15 * 60, // 15 menit
  remaining_seconds: 11 * 60 + 45, // 11:45
  waiting_room_info: {
    wave_number: 1,
    rotation_round: 2,
    total_rounds: 6,
    briefing_countdown_seconds: 30, // 30 detik briefing ruang tunggu
    location: "Gedung Skill Lab Ruang 101 (Ruang Tunggu Station 1)",
    rules: [
      "Persiapkan stetoskop & penlight sebelum memasuki ruang stase.",
      "Durasi pengerjaan stase 1 adalah 15 menit.",
      "Lakukan salam, perkenalan diri, anamnesis terarah, & pemeriksaan fisik sesuai SOP.",
      "Sampaikan diagnosis & rekomendasi terapi secara jelas kepada penguji.",
    ],
  },
  scenario: "Pasien laki-laki 52 tahun datang ke UGD dengan keluhan nyeri dada kiri khas infark miokard (seperti ditindih beban berat) menjalar ke lengan kiri sejak 2 jam lalu.",

  participant_instructions: [
    "1. Lakukan anamnesis terarah mengenai keluhan nyeri dada (Onset, Lokasi, Kualitas, Radiasi, Keparahan, Onset).",
    "2. Lakukan auskultasi 4 katup jantung menggunakan stetoskop dengan posisi & teknik yang benar.",
    "3. Interpretasikan EKG 12 Lead & sampaikan diagnosis STEMI Anteroseptal serta tata laksana awal kepada penguji.",
  ],
  patient_profile: {
    name: "Tn. Budi Santoso",
    age: 52,
    gender: "Laki-laki",
    chief_complaint: "Nyeri dada hebat seperti ditindih beban berat sejak 2 jam lalu.",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  },
  initial_messages: [
    {
      role: "assistant",
      content: "Selamat pagi, Dokter. Dada saya rasanya sakit sekali seperti ditindih beban berat sejak 2 jam yang lalu. Keringat dingin saya juga bercucuran, Dok...",
    },
  ],
  quick_prompts: [
    "Apakah nyerinya menjalar ke lengan kiri atau rahang?",
    "Apakah Bapak merasa sesak napas atau mual?",
    "Apakah Bapak memiliki riwayat hipertensi atau merokok?",
    "Saya akan melakukan auskultasi 4 katup jantung Bapak.",
  ],
};

export const MY_PAST_RESULTS = [
  {
    id: "res-001",
    title: "OSCE Stase Neurologi & Psikiatri Klinik 2026",
    session_date: "2026-07-10",
    station_name: "Stase 1: Pemeriksaan Saraf Kranial",
    examiner_name: "dr. Alexander Budiman, Sp.JP",
    score: 92.5,
    global_rating: "SUPERIOR",
    feedback: "Pemeriksaan fungsi nervus kranial dikerjakan secara sangat sistematis dan higienis.",
  },
  {
    id: "res-002",
    title: "Simulasi OSCE Keterampilan Gawat Darurat ATLS/ACLS",
    session_date: "2026-06-15",
    station_name: "Stase 1: Resusitasi Jantung Paru",
    examiner_name: "dr. Herman Kusuma, Sp.An",
    score: 88.0,
    global_rating: "LULUS",
    feedback: "Kompresi dada berkualitas tinggi, perlu ketenangan saat menyiapkan pad defibrilator.",
  },
];
