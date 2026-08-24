/**
 * Master Standar Kompetensi Dokter Indonesia (SKDI / SNPPDI KKI)
 * 12 Sistem Organ Tubuh + Forensik & Komunitas
 */

export const SYSTEM_ORGAN_LIST = [
  "Saraf",
  "Psikiatri",
  "Indera",
  "Respirasi",
  "Kardiovaskular",
  "GEH",
  "Ginjal dan Saluran Kemih",
  "Obsgyn",
  "Endokrin, Metabolisme, dan Nutrisi",
  "Hemato, Imunologi, dan Infeksi",
  "Muskuloskeletal",
  "Integumen",
  "Kedokteran Forensik dan Medikolegal",
  "Ilmu Kedokteran Komunitas / IKM",
];

export const SYSTEM_ORGAN_DETAILS = [
  {
    id: "saraf",
    name: "Saraf",
    aliases: ["Neurologi", "Sistem Saraf", "Neurology"],
    description: "Stroke, nyeri kepala, epilepsi, infeksi SSP, neuropati, trauma kapitis",
    badgeColor: "purple",
  },
  {
    id: "psikiatri",
    name: "Psikiatri",
    aliases: ["Kesehatan Jiwa", "Psikiatri & Jiwa", "Psychiatry"],
    description: "Gangguan ansietas, depresi, psikosis akut, skizofrenia, somatoform",
    badgeColor: "indigo",
  },
  {
    id: "indera",
    name: "Indera",
    aliases: ["Mata & THT", "THT-KL", "Oftalmologi", "Indera Khusus"],
    description: "Mata merah/visus turun, otitis media, rhinitis, sinusitis, epistaksis, vertigo",
    badgeColor: "cyan",
  },
  {
    id: "respirasi",
    name: "Respirasi",
    aliases: ["Sistem Pernapasan", "Pulmonologi", "Respiration"],
    description: "Asma bronkial, PPOK, TB paru, pneumonia, efusi pleura, pneumotoraks",
    badgeColor: "sky",
  },
  {
    id: "kardiovaskular",
    name: "Kardiovaskular",
    aliases: ["Jantung & Pembuluh Darah", "Kardiologi", "Cardiovascular"],
    description: "Sindrom koroner akut (STEMI/NSTEMI), gagal jantung, hipertensi, syok kardiogenik",
    badgeColor: "rose",
  },
  {
    id: "geh",
    name: "GEH",
    aliases: ["Gastrointestinal", "Digestif", "Gastroenterohepatologi", "GEH & Digestif"],
    description: "GERD, ulkus peptikum, apendisitis, diare akut/kronik, hepatitis, sirosis hati",
    badgeColor: "amber",
  },
  {
    id: "ginjal_saluran_kemih",
    name: "Ginjal dan Saluran Kemih",
    aliases: ["Urologi", "Nefrologi", "Nefro-Urologi", "Saluran Kemih"],
    description: "ISK, batu saluran kemih (Urolitiasis), gagal ginjal akut/kronik, BPH, glomerulonefritis",
    badgeColor: "teal",
  },
  {
    id: "obsgyn",
    name: "Obsgyn",
    aliases: ["Obstetri & Ginekologi", "Reproduksi", "Kesehatan Reproduksi"],
    description: "Persalinan normal/penyulit, preeklampsia/eklampsia, perdarahan antepartum/postpartum, keputihan, KB",
    badgeColor: "pink",
  },
  {
    id: "endokrin_metabolisme_nutrisi",
    name: "Endokrin, Metabolisme, dan Nutrisi",
    aliases: ["Endokrin", "Metabolik & Endokrin", "Endokrin & Nutrisi"],
    description: "Diabetes melitus, krisis hiperglikemia (KAD/HHS), hipertiroid/hipotiroid, obesitas, dislipidemia, malnutrisi",
    badgeColor: "yellow",
  },
  {
    id: "hemato_imunologi_infeksi",
    name: "Hemato, Imunologi, dan Infeksi",
    aliases: ["Hematologi & Infeksi", "Penyakit Tropis", "Imunologi & Infeksi", "Tropik Infeksi"],
    description: "Anemia defisiensi/hemolitik, DHF/Dengue, malaria, demam tifoid, sepsis, HIV/AIDS, reaksi anafilaksis",
    badgeColor: "red",
  },
  {
    id: "muskuloskeletal",
    name: "Muskuloskeletal",
    aliases: ["Ortopedi", "Sistem Gerak", "Musculoskeletal"],
    description: "Fraktur & dislokasi, osteoarthritis, gout arthritis, sprain/strain, sindrom kompartemen",
    badgeColor: "blue",
  },
  {
    id: "integumen",
    name: "Integumen",
    aliases: ["Kulit & Kelamin", "Dermatologi", "Dermatovenereologi"],
    description: "Dermatitis kontak/atopi, pioderma, tinea/mikosis superfisial, scabies, herpes zoster, luka bakar",
    badgeColor: "emerald",
  },
  {
    id: "forensik_medikolegal",
    name: "Kedokteran Forensik dan Medikolegal",
    aliases: ["Forensik", "Medikolegal"],
    description: "Pembuatan VeR (Visum et Repertum), pemeriksaan luka, asfiksia, identifikasi jenazah, etika profesi",
    badgeColor: "slate",
  },
  {
    id: "ikm_komunitas",
    name: "Ilmu Kedokteran Komunitas / IKM",
    aliases: ["IKM", "Kedokteran Keluarga", "Kedokteran Komunitas"],
    description: "Edukasi PHBS, penelusuran kontak KLB, surveillance epidemiologi, diagnosis komunitas",
    badgeColor: "violet",
  },
];

export const SKDI_LEVEL_LIST = [
  { value: "4A (Tuntas Mandiri)", label: "Tingkat 4A — Mendiagnosis & Tatalaksana Tuntas Mandiri" },
  { value: "3B (Gawat Darurat)", label: "Tingkat 3B — Gawat Darurat: Stabilisasi & Rujuk Tepat" },
  { value: "3A (Non-Gawat Darurat)", label: "Tingkat 3A — Bukan Gawat Darurat: Rujuk Mandiri" },
  { value: "2 (Diagnosis & Rujuk)", label: "Tingkat 2 — Mendiagnosis Klinis & Rujuk" },
  { value: "1 (Mengetahui)", label: "Tingkat 1 — Pengetahuan Klinis Teoritis" },
];
