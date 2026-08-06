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

  // Kunci Jawaban Resmi Admin (Gold Standard)
  gold_standard_keys: {
    wdx: "STEMI Anteroseptal (Infark Miokard Akut dengan Elevasi Segmen ST Anteroseptal V1-V4)",
    ddx: [
      "Angina Pektoris Tidak Stabil (UAP / Unstable Angina Pectoris)",
      "Diseksi Aorta Thorakalis",
      "Perikarditis Akut"
    ],
    recipe: "R/ ISDN tab 5 mg No. III\n   S.1.d.d tab I sublingual (bila timbul nyeri dada)\n\nR/ Asetosal tab 80 mg No. IV\n   S.1.d.d tab IV kunyah (loading dose 320 mg)\n\nR/ Clopidogrel tab 75 mg No. IV\n   S.1.d.d tab IV (loading dose 300 mg)"
  },
  
  // Timer & Break Info
  current_round: 2,
  total_rounds: 8,
  station_duration_seconds: 12 * 60, // 12 menit per stase (1m Reading, 10m Action, 1m Transition)
  break_after_round: 3, // Istirahat setelah Ronde 3
  break_duration_minutes: 10, // Istirahat 10 menit
  remaining_seconds: 10 * 60 + 30, // 10:30 (Action Time)
  is_break: false,

  // Active Participant in Station 1 Round 2
  current_participant: {
    id: "part-001",
    nim: "20200710042",
    name: "Ahmad Rizky Pratama",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    wave: "Gelombang #1",
    institution: "Fakultas Kedokteran Univ. Gadjah Mada",
    round: 2,
    start_time: "08:18",
  },

  // Rubric Questions, Weights & Performance Descriptors (Standar Nasional)
  rubric_items: [
    {
      id: "r1",
      question: "Komunikasi & Membina Sambung Rasa",
      competency: "Komunikasi & Edukasi",
      weight: 2,
      answer_key: "Peserta mengucapkan salam, memperkenalkan diri, & mengonfirmasi identitas pasien",
      max_points: 3,
      default_earned: 3,
      descriptors: {
        0: "Peserta sama sekali tidak melakukan 4 prinsip komunikasi & tidak menyapa pasien.",
        1: "Memenuhi 1 dari 4 prinsip komunikasi (menyapa saja tanpa mengonfirmasi identitas).",
        2: "Memenuhi 2-3 dari 4 prinsip komunikasi (menyapa, kontak mata, namun tidak konfirmasi ID).",
        3: "Memenuhi seluruh 4 prinsip komunikasi lengkap (salam, perkenalan, konfirmasi ID, empati).",
      },
    },
    {
      id: "r2",
      question: "Anamnesis Terarah Nyeri Dada Infark",
      competency: "Anamnesis",
      weight: 4,
      answer_key: "Menanyakan onset, lokasi, kualitas (seperti ditindih beban), & radiasi nyeri ke lengan kiri",
      max_points: 3,
      default_earned: 3,
      descriptors: {
        0: "Peserta tidak memfasilitasi pasien menceritakan kesakitannya.",
        1: "Memfasilitasi bercerita namun sebagian besar pertanyaan tidak mengarah (1-2 poin relevan).",
        2: "Memfasilitasi bercerita, sebagian kecil pertanyaan tidak mengarah (3-4 poin relevan).",
        3: "Memfasilitasi dengan pertanyaan terarah lengkap (Onset, Lokasi, Kualitas, Radiasi, Pemberat).",
      },
    },
    {
      id: "r3",
      question: "Pemeriksaan Fisik Auskultasi 4 Katup Jantung",
      competency: "Pemeriksaan Fisik",
      weight: 3,
      answer_key: "Melakukan cuci tangan sebelum/sesudah & menggunakan stetoskop pada 4 area katup jantung (aorta, pulmonal, trikuspid, mitral)",
      max_points: 3,
      default_earned: 2.5,
      descriptors: {
        0: "Tidak melakukan cuci tangan dan tidak melakukan pemeriksaan fisik yang sesuai.",
        1: "Melakukan pemeriksaan fisik tanpa cuci tangan atau hanya auskultasi 1 area katup.",
        2: "Melakukan cuci tangan dan auskultasi 2-3 area katup dengan posisi cukup baik.",
        3: "Melakukan cuci tangan 6 langkah (sebelum & sesudah) serta auskultasi 4 katup jantung dengan benar.",
      },
    },
    {
      id: "r4",
      question: "Penetapan Diagnosis & Penulisan Resep Medis",
      competency: "Diagnosis & Farmakoterapi",
      weight: 3,
      answer_key: "Menetapkan WDx STEMI Anteroseptal, DDx tepat, dan menuliskan resep ISDN, Aspirin, & Clopidogrel lengkap",
      max_points: 3,
      default_earned: 3,
      descriptors: {
        0: "Tidak menetapkan diagnosis yang sesuai dan resep medis salah total.",
        1: "Diagnosis kerja kurang tepat atau resep medis tidak lengkap aturan pakainya.",
        2: "Diagnosis kerja tepat, DDx hanya 1, resep medis tepat indikasi & dosis tapi kurang lengkap.",
        3: "WDx & DDx tepat sesuai masalah klinik pasien serta resep medis ditulis lengkap dan tepat dosis.",
      },
    },
  ],

  // Rotation List of all 6 Rounds for Station 1
  rotation_list: [
    {
      round: 1,
      nim: "20200710001",
      name: "Budi Santoso",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      wave: "Gelombang #1",
      institution: "Fakultas Kedokteran Univ. Indonesia",
      status: "completed",
      score: 85.0,
      global_rating: "LULUS",
      feedback: "Penanganan klinis baik, auskultasi cukup tenang.",
      student_answers: {
        wdx: "STEMI Anteroseptal",
        ddx: [
          "Unstable Angina Pectoris (UAP)",
          "Perikarditis Akut",
          "Diseksi Aorta"
        ],
        recipe: "R/ ISDN 5mg tab No III\n   S 1 dd tab 1 sublingual\n\nR/ Aspilet 80mg tab No IV\n   S 1 dd tab 4 kunyah"
      },
      auxiliary_requested: [
        { id: "rad_thorax_pa", name: "Thorax PA", category: "RADIOLOGI", requested_at: "08:04", matched_key: true },
        { id: "ekg_12_lead", name: "EKG 12 Lead", category: "ELEKTRODIAGNOSTIK", requested_at: "08:06", matched_key: true }
      ],
      auxiliary_results: [
        {
          id: "rad_thorax_pa",
          name: "Thorax PA",
          category: "RADIOLOGI",
          hasData: true,
          imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
          reportText: "Cor: CTR 52%, apex tampak terdorong ke lateral.\nPulmo: Tidak tampak infiltrat aktif, vaskularisasi paru normal.\nKesan: Cardiomegaly ringan tanpa tanda pembendungan paru."
        },
        {
          id: "ekg_12_lead",
          name: "EKG 12 Lead",
          category: "ELEKTRODIAGNOSTIK",
          hasData: true,
          imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
          reportText: "Irama Sinus 88 x/menit, Regular, Axis Normal.\nST Elevasi pada lead V1-V4 dengan Q patologis.\nKesan: Infark Miokard Akut ST Elevasi (STEMI) Anteroseptal."
        }
      ]
    },
    {
      round: 2,
      nim: "20200710042",
      name: "Ahmad Rizky Pratama",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      wave: "Gelombang #1",
      institution: "Fakultas Kedokteran Univ. Gadjah Mada",
      status: "active",
      score: null,
      global_rating: null,
      feedback: "",
      student_answers: {
        wdx: "STEMI Anteroseptal (Infark Miokard Akut ST Elevasi V1-V4)",
        ddx: [
          "Unstable Angina Pectoris (UAP)",
          "Perikarditis Akut",
          "GERD / Esophagitis"
        ],
        recipe: "R/ ISDN 5mg tab No. III\n   S.1.d.d tab I sublingual (bila timbul nyeri dada)\n\nR/ Asetosal 80mg tab No. IV\n   S.1.d.d tab IV kunyah (loading dose 320 mg)\n\nR/ Clopidogrel 75mg tab No. IV\n   S.1.d.d tab IV (loading dose 300 mg)"
      },
      auxiliary_requested: [
        { id: "rad_thorax_pa", name: "Thorax PA", category: "RADIOLOGI", requested_at: "08:20", matched_key: true },
        { id: "ekg_12_lead", name: "EKG 12 Lead", category: "ELEKTRODIAGNOSTIK", requested_at: "08:21", matched_key: true },
        { id: "lab_troponin_t", name: "Troponin T & Cardiac Markers", category: "LABORATORIUM", requested_at: "08:23", matched_key: true },
        { id: "lab_dl", name: "Darah Lengkap (DL)", category: "LABORATORIUM", requested_at: "08:24", matched_key: false }
      ],
      auxiliary_results: [
        {
          id: "rad_thorax_pa",
          name: "Thorax PA",
          category: "RADIOLOGI",
          hasData: true,
          imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
          reportText: "Cor: CTR 52%, apex tampak terdorong ke lateral.\nPulmo: Tidak tampak infiltrat aktif, vaskularisasi paru normal.\nKesan: Cardiomegaly ringan tanpa tanda pembendungan paru."
        },
        {
          id: "ekg_12_lead",
          name: "EKG 12 Lead",
          category: "ELEKTRODIAGNOSTIK",
          hasData: true,
          imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
          reportText: "Irama Sinus 88 x/menit, Regular, Axis Normal.\nST Elevasi pada lead V1-V4 dengan Q patologis.\nKesan: Infark Miokard Akut ST Elevasi (STEMI) Anteroseptal."
        },
        {
          id: "lab_troponin_t",
          name: "Troponin T & Cardiac Markers",
          category: "LABORATORIUM",
          hasData: true,
          imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80",
          reportText: "Troponin T Hs: 450 ng/L (Rujukan < 14 ng/L) [HIGH]\nCK-MB: 48 U/L (Rujukan < 24 U/L) [HIGH]\nKesan: Marker nekrosis miokard meningkat signifikan."
        },
        {
          id: "lab_dl",
          name: "Darah Lengkap (DL)",
          category: "LABORATORIUM",
          hasData: false,
          imageUrl: "https://placehold.co/800x500/1e293b/ffffff.png?text=HASIL+LABORATORIUM+DALAM+BATAS+NORMAL",
          reportText: "Hb: 14.2 g/dL, Leukosit: 8.500 /uL, Trombosit: 250.000 /uL.\nKesan: Darah lengkap dalam batas normal."
        }
      ]
    },
    {
      round: 3,
      nim: "20200710018",
      name: "Siti Rahmawati",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      wave: "Gelombang #1",
      institution: "Fakultas Kedokteran Univ. Airlangga",
      status: "upcoming",
      score: null,
      global_rating: null,
      feedback: "",
      student_answers: {
        wdx: "STEMI Anterior",
        ddx: [
          "NSTEMI",
          "Unstable Angina Pectoris",
          "Spasme Esofagus"
        ],
        recipe: "R/ ISDN 5mg tab No III\n   S sublingual prn\n\nR/ Aspilet 80mg tab No IV\n   S 1 dd tab 4"
      },
      auxiliary_requested: [
        { id: "ekg_12_lead", name: "EKG 12 Lead", category: "ELEKTRODIAGNOSTIK", requested_at: "08:35", matched_key: true },
        { id: "lab_troponin_t", name: "Troponin T & Cardiac Markers", category: "LABORATORIUM", requested_at: "08:37", matched_key: true }
      ],
      auxiliary_results: [
        {
          id: "ekg_12_lead",
          name: "EKG 12 Lead",
          category: "ELEKTRODIAGNOSTIK",
          hasData: true,
          imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
          reportText: "ST Elevasi V1-V4. STEMI Anteroseptal."
        }
      ]
    },
    {
      round: 4,
      nim: "20200710025",
      name: "Dewi Anggraini",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
      wave: "Gelombang #1",
      institution: "Fakultas Kedokteran Univ. Diponegoro",
      status: "upcoming",
      score: null,
      global_rating: null,
      feedback: "",
      student_answers: {
        wdx: "Infark Miokard Akut",
        ddx: [
          "Angina Pektoris Stabil",
          "Perikarditis",
          "Pneumothorax"
        ],
        recipe: "R/ ISDN 5mg tab No III\n   S 1 dd tab 1 sublingual"
      },
      auxiliary_requested: [
        { id: "rad_thorax_pa", name: "Thorax PA", category: "RADIOLOGI", requested_at: "09:02", matched_key: true }
      ],
      auxiliary_results: [
        {
          id: "rad_thorax_pa",
          name: "Thorax PA",
          category: "RADIOLOGI",
          hasData: true,
          imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
          reportText: "Thorax PA normal."
        }
      ]
    },
    {
      round: 5,
      nim: "20200710033",
      name: "Fajar Nugraha",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      wave: "Gelombang #1",
      institution: "Fakultas Kedokteran Univ. Padjadjaran",
      status: "upcoming",
      score: null,
      global_rating: null,
      feedback: "",
      student_answers: {
        wdx: "STEMI Anteroseptal",
        ddx: [
          "Unstable Angina Pectoris",
          "Diseksi Aorta",
          "Perikarditis Akut"
        ],
        recipe: "R/ ISDN 5mg tab No III\n   S 1 dd tab 1 sublingual\n\nR/ Asetosal 80mg tab No IV\n   S 1 dd tab 4 kunyah\n\nR/ Clopidogrel 75mg tab No IV\n   S 1 dd tab 4"
      },
      auxiliary_requested: [
        { id: "rad_thorax_pa", name: "Thorax PA", category: "RADIOLOGI", requested_at: "09:18", matched_key: true },
        { id: "ekg_12_lead", name: "EKG 12 Lead", category: "ELEKTRODIAGNOSTIK", requested_at: "09:20", matched_key: true },
        { id: "lab_troponin_t", name: "Troponin T & Cardiac Markers", category: "LABORATORIUM", requested_at: "09:22", matched_key: true }
      ],
      auxiliary_results: []
    },
    {
      round: 6,
      nim: "20200710047",
      name: "Rian Hidayat",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      wave: "Gelombang #1",
      institution: "Fakultas Kedokteran Univ. Brawijaya",
      status: "upcoming",
      score: null,
      global_rating: null,
      feedback: "",
      student_answers: {
        wdx: "STEMI Anteroseptal",
        ddx: [
          "Unstable Angina Pectoris",
          "Perikarditis",
          "Gastritis Akut"
        ],
        recipe: "R/ ISDN 5mg tab No III\n   S 1 dd tab 1 sublingual"
      },
      auxiliary_requested: [
        { id: "ekg_12_lead", name: "EKG 12 Lead", category: "ELEKTRODIAGNOSTIK", requested_at: "09:35", matched_key: true }
      ],
      auxiliary_results: []
    },
  ],
};

export const EXAMINER_HISTORY_SESSIONS = [
  {
    id: "hist-001",
    title: "Tryout OSCE Internal Bedah & Anestesi Seri II",
    session_date: "2026-07-28",
    station_name: "Stase 1: Kardiovaskular & Kritis",
    case_title: "Penanganan Gawat Darurat Infark Miokard & Auskultasi Katup",
    location: "Lab Keterampilan Klinik FK 2",
    total_examinees: 6,
    evaluated_count: 6,
    avg_score: 88.5,
    status: "published",
    examinees_detail: [
      {
        nim: "20200710001",
        name: "Budi Santoso",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
        wave: "Gelombang #1",
        institution: "Fakultas Kedokteran Univ. Indonesia",
        round: 1,
        score: 85.0,
        earned_points: 8.5,
        max_points: 10,
        global_rating: "LULUS",
        feedback: "Anamnesis terarah, auskultasi cukup tenang. Perlu sedikit peningkatan dalam ketepatan waktu membaca EKG.",
        student_answers: {
          wdx: "STEMI Anteroseptal",
          ddx: [
            "Unstable Angina Pectoris (UAP)",
            "Perikarditis Akut",
            "Diseksi Aorta"
          ],
          recipe: "R/ ISDN 5mg tab No III\n   S 1 dd tab 1 sublingual\n\nR/ Aspilet 80mg tab No IV\n   S 1 dd tab 4 kunyah"
        },
        rubric_breakdown: [
          { question: "Menyapa pasien & bina sambung rasa", points: 1, max: 1 },
          { question: "Anamnesis terarah nyeri dada infark", points: 3, max: 3 },
          { question: "Auskultasi 4 katup jantung", points: 2.5, max: 3 },
          { question: "Interpretasi EKG 12 Lead & Diagnosis", points: 2, max: 3 },
        ],
        auxiliary_requested: [
          { id: "rad_thorax_pa", name: "Thorax PA", category: "RADIOLOGI", requested_at: "08:04", matched_key: true },
          { id: "ekg_12_lead", name: "EKG 12 Lead", category: "ELEKTRODIAGNOSTIK", requested_at: "08:06", matched_key: true }
        ],
        auxiliary_results: [
          {
            id: "rad_thorax_pa",
            name: "Thorax PA",
            category: "RADIOLOGI",
            hasData: true,
            imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
            reportText: "Cor: CTR 52%, apex tampak terdorong ke lateral.\nPulmo: Tidak tampak infiltrat aktif, vaskularisasi paru normal."
          },
          {
            id: "ekg_12_lead",
            name: "EKG 12 Lead",
            category: "ELEKTRODIAGNOSTIK",
            hasData: true,
            imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
            reportText: "ST Elevasi V1-V4 dengan Q patologis. STEMI Anteroseptal."
          }
        ]
      },
      {
        nim: "20200710042",
        name: "Ahmad Rizky Pratama",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        wave: "Gelombang #1",
        institution: "Fakultas Kedokteran Univ. Gadjah Mada",
        round: 2,
        score: 95.0,
        earned_points: 9.5,
        max_points: 10,
        global_rating: "SUPERIOR",
        feedback: "Sangat menguasai teknik auskultasi jantung dan penetapan diagnosis STEMI Anteroseptal dengan cepat & akurat.",
        student_answers: {
          wdx: "STEMI Anteroseptal (Infark Miokard Akut ST Elevasi V1-V4)",
          ddx: [
            "Unstable Angina Pectoris (UAP)",
            "Perikarditis Akut",
            "GERD / Esophagitis"
          ],
          recipe: "R/ ISDN 5mg tab No. III\n   S.1.d.d tab I sublingual (bila timbul nyeri dada)\n\nR/ Asetosal 80mg tab No. IV\n   S.1.d.d tab IV kunyah (loading dose 320 mg)\n\nR/ Clopidogrel 75mg tab No. IV\n   S.1.d.d tab IV (loading dose 300 mg)"
        },
        rubric_breakdown: [
          { question: "Menyapa pasien & bina sambung rasa", points: 1, max: 1 },
          { question: "Anamnesis terarah nyeri dada infark", points: 3, max: 3 },
          { question: "Auskultasi 4 katup jantung", points: 2.5, max: 3 },
          { question: "Interpretasi EKG 12 Lead & Diagnosis", points: 3, max: 3 },
        ],
        auxiliary_requested: [
          { id: "rad_thorax_pa", name: "Thorax PA", category: "RADIOLOGI", requested_at: "08:20", matched_key: true },
          { id: "ekg_12_lead", name: "EKG 12 Lead", category: "ELEKTRODIAGNOSTIK", requested_at: "08:21", matched_key: true },
          { id: "lab_troponin_t", name: "Troponin T & Cardiac Markers", category: "LABORATORIUM", requested_at: "08:23", matched_key: true },
          { id: "lab_dl", name: "Darah Lengkap (DL)", category: "LABORATORIUM", requested_at: "08:24", matched_key: false }
        ],
        auxiliary_results: [
          {
            id: "rad_thorax_pa",
            name: "Thorax PA",
            category: "RADIOLOGI",
            hasData: true,
            imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
            reportText: "Cor: CTR 52%, apex tampak terdorong ke lateral.\nPulmo: Normal.\nKesan: Cardiomegaly ringan."
          },
          {
            id: "ekg_12_lead",
            name: "EKG 12 Lead",
            category: "ELEKTRODIAGNOSTIK",
            hasData: true,
            imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
            reportText: "ST Elevasi V1-V4 dengan Q patologis.\nKesan: STEMI Anteroseptal."
          },
          {
            id: "lab_troponin_t",
            name: "Troponin T & Cardiac Markers",
            category: "LABORATORIUM",
            hasData: true,
            imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80",
            reportText: "Troponin T Hs: 450 ng/L [HIGH], CK-MB: 48 U/L [HIGH]."
          }
        ]
      },
      {
        nim: "20200710018",
        name: "Siti Rahmawati",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        wave: "Gelombang #1",
        institution: "Fakultas Kedokteran Univ. Airlangga",
        round: 3,
        score: 90.0,
        earned_points: 9.0,
        max_points: 10,
        global_rating: "LULUS",
        feedback: "Keterampilan klinis sistematis dan komunikasi edukasi pasien sangat ramah.",
        student_answers: {
          wdx: "STEMI Anterior",
          ddx: [
            "NSTEMI",
            "Unstable Angina Pectoris",
            "Spasme Esofagus"
          ],
          recipe: "R/ ISDN 5mg tab No III\n   S sublingual prn\n\nR/ Aspilet 80mg tab No IV\n   S 1 dd tab 4"
        },
        rubric_breakdown: [
          { question: "Menyapa pasien & bina sambung rasa", points: 1, max: 1 },
          { question: "Anamnesis terarah nyeri dada infark", points: 3, max: 3 },
          { question: "Auskultasi 4 katup jantung", points: 2, max: 3 },
          { question: "Interpretasi EKG 12 Lead & Diagnosis", points: 3, max: 3 },
        ],
        auxiliary_requested: [
          { id: "ekg_12_lead", name: "EKG 12 Lead", category: "ELEKTRODIAGNOSTIK", requested_at: "08:35", matched_key: true },
          { id: "lab_troponin_t", name: "Troponin T & Cardiac Markers", category: "LABORATORIUM", requested_at: "08:37", matched_key: true }
        ],
        auxiliary_results: [
          {
            id: "ekg_12_lead",
            name: "EKG 12 Lead",
            category: "ELEKTRODIAGNOSTIK",
            hasData: true,
            imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
            reportText: "ST Elevasi V1-V4. STEMI Anteroseptal."
          }
        ]
      },
      {
        nim: "20200710025",
        name: "Dewi Anggraini",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
        wave: "Gelombang #1",
        institution: "Fakultas Kedokteran Univ. Diponegoro",
        round: 4,
        score: 80.0,
        earned_points: 8.0,
        max_points: 10,
        global_rating: "BORDERLINE",
        feedback: "Kurang percaya diri saat meletakkan posisi stetoskop pada area pulmonal. Perlu latihan lebih sering.",
        student_answers: {
          wdx: "Infark Miokard Akut",
          ddx: [
            "Angina Pektoris Stabil",
            "Perikarditis",
            "Pneumothorax"
          ],
          recipe: "R/ ISDN 5mg tab No III\n   S 1 dd tab 1 sublingual"
        },
        rubric_breakdown: [
          { question: "Menyapa pasien & bina sambung rasa", points: 1, max: 1 },
          { question: "Anamnesis terarah nyeri dada infark", points: 2, max: 3 },
          { question: "Auskultasi 4 katup jantung", points: 2, max: 3 },
          { question: "Interpretasi EKG 12 Lead & Diagnosis", points: 3, max: 3 },
        ],
        auxiliary_requested: [
          { id: "rad_thorax_pa", name: "Thorax PA", category: "RADIOLOGI", requested_at: "09:02", matched_key: true }
        ],
        auxiliary_results: [
          {
            id: "rad_thorax_pa",
            name: "Thorax PA",
            category: "RADIOLOGI",
            hasData: true,
            imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
            reportText: "Thorax PA normal."
          }
        ]
      },
      {
        nim: "20200710033",
        name: "Fajar Nugraha",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        wave: "Gelombang #1",
        institution: "Fakultas Kedokteran Univ. Padjadjaran",
        round: 5,
        score: 92.0,
        earned_points: 9.2,
        max_points: 10,
        global_rating: "SUPERIOR",
        feedback: "Performa sangat tenang dan penjelasan diagnosis kepada pasien sangat terstruktur.",
        student_answers: {
          wdx: "STEMI Anteroseptal",
          ddx: [
            "Unstable Angina Pectoris",
            "Diseksi Aorta",
            "Perikarditis Akut"
          ],
          recipe: "R/ ISDN 5mg tab No III\n   S 1 dd tab 1 sublingual\n\nR/ Asetosal 80mg tab No IV\n   S 1 dd tab 4 kunyah\n\nR/ Clopidogrel 75mg tab No IV\n   S 1 dd tab 4"
        },
        rubric_breakdown: [
          { question: "Menyapa pasien & bina sambung rasa", points: 1, max: 1 },
          { question: "Anamnesis terarah nyeri dada infark", points: 3, max: 3 },
          { question: "Auskultasi 4 katup jantung", points: 2.7, max: 3 },
          { question: "Interpretasi EKG 12 Lead & Diagnosis", points: 2.5, max: 3 },
        ],
        auxiliary_requested: [
          { id: "rad_thorax_pa", name: "Thorax PA", category: "RADIOLOGI", requested_at: "09:18", matched_key: true },
          { id: "ekg_12_lead", name: "EKG 12 Lead", category: "ELEKTRODIAGNOSTIK", requested_at: "09:20", matched_key: true },
          { id: "lab_troponin_t", name: "Troponin T & Cardiac Markers", category: "LABORATORIUM", requested_at: "09:22", matched_key: true }
        ],
        auxiliary_results: []
      },
      {
        nim: "20200710047",
        name: "Rian Hidayat",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        wave: "Gelombang #1",
        institution: "Fakultas Kedokteran Univ. Brawijaya",
        round: 6,
        score: 89.0,
        earned_points: 8.9,
        max_points: 10,
        global_rating: "LULUS",
        feedback: "Prosedur sterilitas & pemeriksaan fisik dikerjakan secara komprehensif.",
        student_answers: {
          wdx: "STEMI Anteroseptal",
          ddx: [
            "Unstable Angina Pectoris",
            "Perikarditis",
            "Gastritis Akut"
          ],
          recipe: "R/ ISDN 5mg tab No III\n   S 1 dd tab 1 sublingual"
        },
        rubric_breakdown: [
          { question: "Menyapa pasien & bina sambung rasa", points: 1, max: 1 },
          { question: "Anamnesis terarah nyeri dada infark", points: 3, max: 3 },
          { question: "Auskultasi 4 katup jantung", points: 2.4, max: 3 },
          { question: "Interpretasi EKG 12 Lead & Diagnosis", points: 2.5, max: 3 },
        ],
        auxiliary_requested: [
          { id: "ekg_12_lead", name: "EKG 12 Lead", category: "ELEKTRODIAGNOSTIK", requested_at: "09:35", matched_key: true }
        ],
        auxiliary_results: []
      },
    ],
  },
  {
    id: "hist-002",
    title: "OSCE Stase Neurologi & Psikiatri Klinik 2026",
    session_date: "2026-07-10",
    station_name: "Stase 1: Pemeriksaan Saraf Kranial",
    case_title: "Pemeriksaan Nervus Craniales N. VII & N. XII",
    location: "Gedung Skill Lab Ruang 101",
    total_examinees: 6,
    evaluated_count: 6,
    avg_score: 91.2,
    status: "published",
    examinees_detail: [],
  },
  {
    id: "hist-003",
    title: "Simulasi OSCE Keterampilan Gawat Darurat ATLS/ACLS",
    session_date: "2026-06-15",
    station_name: "Stase 1: Resusitasi Jantung Paru",
    case_title: "Kompresi Dada High Quality & Defibrilasi Otomatis",
    location: "Pusat Pelatihan Resusitasi RS Pendidikan",
    total_examinees: 6,
    evaluated_count: 6,
    avg_score: 86.0,
    status: "published",
    examinees_detail: [],
  },
];
