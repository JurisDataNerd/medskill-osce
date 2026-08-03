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
