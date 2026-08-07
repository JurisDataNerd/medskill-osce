-- =================================================================
-- SEED DATA: 5 BANK SOAL TAMBAHAN (KASUS 6 - 10)
-- Total 10 Bank Soal Medis Terstandarisasi AIPKI/KKI
-- =================================================================

-- 6. DEMAM BERDARAH DENGUE (DBD) DERAJAT II & WARNING SIGNS
INSERT INTO osce.question_bank (
  id, title, case_title, system_organ, skdi_level, scenario, participant_instructions, examiner_instructions, answer_key_diagnosis, answer_key_prescription
) VALUES (
  'a1b2c3d4-0006-4000-8000-000000000006',
  'Demam Berdarah Dengue (DBD) Derajat II',
  'Demam Berdarah Dengue (DBD) Derajat II',
  'Pediatri',
  '4A (Tuntas Mandiri)',
  'Anak laki-laki 8 tahun diantar ibunya ke UGD dengan demam tinggi mendadak sejak 4 hari lalu, disertai nyeri kepala, pendarahan gusi saat sikat gigi, dan bintik-bintik merah (petekie) di kedua lengan.',
  '1. Anamnesis kurva demam saddleback (bimodal) & warning signs syok.\n2. Pemeriksaan fisik (tes Rumple Leede, tanda dehidrasi, akral, & tanda pendarahan).\n3. Interpretasi Darah Rutin & Tatalaksana Resusitasi Cairan Kristaloid RL.',
  'Nilai cermat pemeriksaan tes Rumple Leede (pembendungan 5 menit) dan perhitungan kebutuhan cairan RL berdasarkan berat badan.',
  'WDx: Demam Berdarah Dengue (DBD) Derajat II (ICD-10: A91)\nDDx 1: Dengue Fever (DF)\nDDx 2: Demam Tifoid\nDDx 3: Chikungunya',
  'R/ IVFD Ringer Laktat 500 mL No. II S i.v 7 mL/kgBB/jam\nR/ Paracetamol tab 250mg No. X S 3 dd tab I p.r.n (bila demam > 38.5°C)'
);

INSERT INTO osce.question_bank_rubric_items (
  question_bank_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors, sort_order
) VALUES
  ('a1b2c3d4-0006-4000-8000-000000000006', 1, 'Anamnesis Kurva Demam Bimodal & Warning Signs', 'Menggali demam bimodal hari ke-4, pendarahan gusi, & nyeri perut', 3, 1.0, 'ANAMNESIS', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Lengkap"}'::jsonb, 0),
  ('a1b2c3d4-0006-4000-8000-000000000006', 2, 'Pemeriksaan Fisik Uji Rumple Leede & Akral', 'Melakukan uji Rumple Leede (+) petekie >10 & cek CRT <2 detik', 3, 1.0, 'PHYSICAL_EXAM', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 1),
  ('a1b2c3d4-0006-4000-8000-000000000006', 3, 'Resusitasi Cairan RL 7 mL/kgBB/jam & Paracetamol', 'Menulis resep RL maintenance 7 mL/kg/jam & Paracetamol', 3, 1.5, 'PHARMACOTHERAPY', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 2);

INSERT INTO osce.question_bank_auxiliary_configs (
  question_bank_id, item_id, name, category, report_text, sort_order
) VALUES
  ('a1b2c3d4-0006-4000-8000-000000000006', 'lab-dbd-trombosit', 'Darah Lengkap & Serologi Dengue', 'LABORATORIUM', 'Hb: 15.2 g/dL, Leukosit: 3.200 /uL (Leukopenia), Trombosit: 48.000 /uL (Trombositopenia berat), Hematokrit: 46% (Hemokonsentrasi naik 22%). Serologi: Dengue NS1 Antigen (+), IgM Dengue (+). Kesimpulan: DBD Derajat II.', 0);


-- 7. OTITIS MEDIA AKUT (OMA) STADIUM PERFORASI
INSERT INTO osce.question_bank (
  id, title, case_title, system_organ, skdi_level, scenario, participant_instructions, examiner_instructions, answer_key_diagnosis, answer_key_prescription
) VALUES (
  'a1b2c3d4-0007-4000-8000-000000000007',
  'Otitis Media Akut (OMA) Dextra Stadium Perforasi',
  'Otitis Media Akut (OMA) Dextra Stadium Perforasi',
  'THT-KL',
  '4A (Tuntas Mandiri)',
  'Anak perempuan 6 tahun mengeluh keluar cairan kuning berbau dari telinga kanan sejak 1 hari lalu. Sebelumnya anak mengeluh nyeri telinga hebat dan demam selama 3 hari yang mendadak berkurang setelah cairan keluar.',
  '1. Anamnesis terarah otalgia, otorhea, dan ISPA pendahulu.\n2. Pemeriksaan Otoskop telinga dextra (inspeksi membran timpani & sekret).\n3. Tentukan Stadium OMA & Tatalaksana Cuci Telinga H2O2 3% + Tetes Telinga Ofloxacin.',
  'Nilai teknik memegang otoskop yang benar (seperti memegang pensil dengan tumpuan pipi) dan urutan cuci telinga H2O2.',
  'WDx: Otitis Media Akut (OMA) Dextra Stadium Perforasi (ICD-10: H66.011)\nDDx 1: Otitis Media Supuratif Kronik (OMSK) Tipe Benigna\nDDx 2: Otitis Eksterna Akut Diffusa',
  'R/ H2O2 ear drops 3% fl No. I S 3 dd gtt III auric. dextra (cuci telinga)\nR/ Ofloxacin ear drops 0.3% fl No. I S 2 dd gtt II auric. dextra\nR/ Amoxicillin syr 125mg/5mL fl No. II S 3 dd cth II'
);

INSERT INTO osce.question_bank_rubric_items (
  question_bank_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors, sort_order
) VALUES
  ('a1b2c3d4-0007-4000-8000-000000000007', 1, 'Anamnesis Otalgia, Otorhea, & Riwayat Batuk Pilek', 'Menggali onset cairan telinga, hilangnya nyeri setelah cairan keluar, & ISPA', 3, 1.0, 'ANAMNESIS', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Lengkap"}'::jsonb, 0),
  ('a1b2c3d4-0007-4000-8000-000000000007', 2, 'Pemeriksaan Otoskopi Telinga Dextra', 'Memegang otoskop stabil, inspeksi membran timpani perforasi sentral & sekret purulen', 3, 1.5, 'PHYSICAL_EXAM', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 1),
  ('a1b2c3d4-0007-4000-8000-000000000007', 3, 'Tatalaksana Cuci Telinga H2O2 3% & Tetes Ototopikal', 'Resep H2O2 3% ear drops + Ofloxacin ear drops + Amoxicillin oral', 3, 1.5, 'PHARMACOTHERAPY', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 2);

INSERT INTO osce.question_bank_auxiliary_configs (
  question_bank_id, item_id, name, category, report_text, sort_order
) VALUES
  ('a1b2c3d4-0007-4000-8000-000000000007', 'rad-otoskop-oma', 'Pemeriksaan Otoskopi Telinga Dextra', 'PEMERIKSAAN', 'Liang telinga luar lapang, tampak sekret mukopurulen di cavum timpani. Membran timpani hiperemis dengan perforasi kecil berbentuk bulat di pars tensa (sentral). Kesimpulan: OMA Stadium Perforasi.', 0);


-- 8. FRAKTUR TERTUTUP CLAVICULA SINISTRA MIDSHAFT
INSERT INTO osce.question_bank (
  id, title, case_title, system_organ, skdi_level, scenario, participant_instructions, examiner_instructions, answer_key_diagnosis, answer_key_prescription
) VALUES (
  'a1b2c3d4-0008-4000-8000-000000000008',
  'Closed Fracture Clavicula Sinistra Midshaft',
  'Closed Fracture Clavicula Sinistra Midshaft',
  'Muskuloskeletal',
  '3A (Non Gawat Darurat)',
  'Remaja laki-laki 17 tahun diantar ke UGD setelah jatuh dari sepeda motor dengan bahu kiri menumbuk jalan. Pasien mengeluh nyeri hebat pada bahu kiri dan tidak mampu menggerakkan lengan kiri.',
  '1. Anamnesis mekanisme trauma (jatuh bahu menumbuk).\n2. Pemeriksaan fisik status lokalis shoulder & clavicula (Look, Feel, Move, NVD intact).\n3. Interpretasi X-Ray Clavicula Sinistra AP & Tatalaksana Pemasangan Ransel Verband / Figure-of-Eight.',
  'Amati prosedur pemeriksaan Neurovaskuler Distal (pulsasi a. radialis, sensibilitas jari, & CRT) sebelum dan sesudah immobilisasi.',
  'WDx: Closed Fracture Clavicula Sinistra 1/3 Tengah / Midshaft (ICD-10: S42.022A)\nDDx 1: Dislokasi Sendi Acromioclavicular (AC Joint Dislocation)\nDDx 2: Fraktur Scapula Sinistra',
  'R/ Ransel Verband / Figure-of-Eight Bandage No. I S pro us.ext\nR/ Paracetamol tab 500mg No. X S 3 dd tab I p.c\nR/ Sodium Diclofenac tab 50mg No. X S 2 dd tab I p.c'
);

INSERT INTO osce.question_bank_rubric_items (
  question_bank_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors, sort_order
) VALUES
  ('a1b2c3d4-0008-4000-8000-000000000008', 1, 'Pemeriksaan Status Lokalis Clavicula (Look, Feel, Move)', 'Mendeteksi deformitas step-off, krepitas, & ROM terbatas nyeri', 3, 1.0, 'PHYSICAL_EXAM', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 0),
  ('a1b2c3d4-0008-4000-8000-000000000008', 2, 'Pemeriksaan Neurovaskuler Distal (NVD Intact)', 'Cek rabaan sensibilitas n. radialis/ulnaris, pulsasi a. radialis, & CRT <2s', 3, 1.0, 'PHYSICAL_EXAM', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 1),
  ('a1b2c3d4-0008-4000-8000-000000000008', 3, 'Interpretasi X-Ray Clavicula & Pemasangan Ransel Verband', 'Membaca diskontinuitas tulang 1/3 tengah & resep immobilisasi Figure-of-Eight', 3, 1.5, 'PHARMACOTHERAPY', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 2);

INSERT INTO osce.question_bank_auxiliary_configs (
  question_bank_id, item_id, name, category, report_text, sort_order
) VALUES
  ('a1b2c3d4-0008-4000-8000-000000000008', 'rad-xray-clavicula', 'Foto Polos Clavicula Sinistra AP', 'RADIOLOGI', 'Tampak garis fraktur komplit oblique pada 1/3 tengah (midshaft) os clavicula sinistra dengan displacement fragmen distal ke inferior. Tak tampak fraktur iga. Kesimpulan: Closed Midshaft Clavicle Fracture Sinistra.', 0);


-- 9. BATU SALURAN KEMIH (UROLITHIASIS / KOLIK URETER SINISTRA)
INSERT INTO osce.question_bank (
  id, title, case_title, system_organ, skdi_level, scenario, participant_instructions, examiner_instructions, answer_key_diagnosis, answer_key_prescription
) VALUES (
  'a1b2c3d4-0009-4000-8000-000000000009',
  'Urolithiasis / Kolik Ureter Sinistra',
  'Urolithiasis / Kolik Ureter Sinistra',
  'Urologi',
  '3A (Non Gawat Darurat)',
  'Laki-laki 42 tahun datang ke UGD dengan keluhan nyeri pinggang kiri mendadak yang sangat hebat (hilang timbul/kolik), menjalar hingga ke lipat paha dan testis kiri, disertai kencing berwarna kemerahan (hematuria).',
  '1. Anamnesis sifat nyeri kolik pinggang, radiasi ke skrotum, & hematuria.\n2. Pemeriksaan fisik abdomen & urologi (ketok kostovertebra / CVA tenderness sinistra).\n3. Interpretasi USG / BNO-IVP & Tatalaksana Analgetik Spasmolitik NSAID.',
  'Amati ketepatan lokasi pengetokan sudut kostovertebra (CVA) setinggi V.Th12 - L1.',
  'WDx: Urolithiasis / Batu Ureter Sinistra (ICD-10: N20.1)\nDDx 1: Nefrolithiasis Sinistra\nDDx 2: Appendicitis Akut (bila kanan)\nDDx 3: Diseksi Aorta Abdominalis',
  'R/ Ketorolac inj 30mg No. II S i.m / i.v pro kolik\nR/ Hyoscine N-butylbromide tab 10mg No. X S 3 dd tab I p.c\nR/ Tramadol tab 50mg No. X S 2 dd tab I p.c'
);

INSERT INTO osce.question_bank_rubric_items (
  question_bank_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors, sort_order
) VALUES
  ('a1b2c3d4-0009-4000-8000-000000000009', 1, 'Anamnesis Nyeri Kolik Flank, Radiasi Skrotum, & Hematuria', 'Menggali onset nyeri mendadak menjalar ke testis & hematuria', 3, 1.0, 'ANAMNESIS', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Lengkap"}'::jsonb, 0),
  ('a1b2c3d4-0009-4000-8000-000000000009', 2, 'Pemeriksaan Nyeri Ketok Kostovertebra (CVA Tenderness)', 'Melakukan pengetokan sudut kostovertebra kiri (+) nyeri hebat', 3, 1.0, 'PHYSICAL_EXAM', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 1),
  ('a1b2c3d4-0009-4000-8000-000000000009', 3, 'Tatalaksana Anti-Spasmolitik & Analgetik NSAID', 'Resep Ketorolac IV + Hyoscine N-butylbromide + Rujukan Urologi', 3, 1.5, 'PHARMACOTHERAPY', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 2);

INSERT INTO osce.question_bank_auxiliary_configs (
  question_bank_id, item_id, name, category, report_text, sort_order
) VALUES
  ('a1b2c3d4-0009-4000-8000-000000000009', 'rad-usg-urolithiasis', 'USG Ginjal & Saluran Kemih', 'RADIOLOGI', 'Ginjal sinistra: Tampak pelebaran kaliks dan pelvis renalis (Hidronefrosis Derajat II). Ureter proksimal dilatasi. Ureter distal sinistra: Tampak bayangan hiperekoik dengan acoustic shadow berukuran 6.5 mm. Kesimpulan: Batu Ureter Distal Sinistra 6.5mm.', 0),
  ('a1b2c3d4-0009-4000-8000-000000000009', 'lab-urinalisis-urolit', 'Urinalisis Lengkap', 'LABORATORIUM', 'Warna: Merah keruh, Eritrosit: 25-30 /LPB (Hematuria mikroskopik), Leukosit: 2-4 /LPB, Kristal Kalsium Oksalat (+2). Kesimpulan: Hematuria & Kristaluria.', 1);


-- 10. KETOASIDOSIS DIABETIKUM (KAD)
INSERT INTO osce.question_bank (
  id, title, case_title, system_organ, skdi_level, scenario, participant_instructions, examiner_instructions, answer_key_diagnosis, answer_key_prescription
) VALUES (
  'a1b2c3d4-0010-4000-8000-000000000010',
  'Ketoasidosis Diabetikum (KAD)',
  'Ketoasidosis Diabetikum (KAD)',
  'Endokrin',
  '3B (Gawat Darurat)',
  'Laki-laki 28 tahun penderita DM Tipe 1 dibawa ke UGD dalam kondisi lemas berat, napas cepat dan dalam (Kussmaul), serta tercium bau buah asam (aseton) dari pernapasan. Pasien menghentikan suntikan insulin sejak 3 hari lalu.',
  '1. Anamnesis riwayat penghentian terapi insulin & trias KAD.\n2. Pemeriksaan fisik (pernapasan Kussmaul, bau napas aseton, & dehidrasi berat).\n3. Interpretasi GDS, Keton Urin, AGD & Tatalaksana Resusitasi Rehidrasi NaCl 0.9% + Drip Insulin.',
  'Nilai pengenalan pola napas Kussmaul (hiperventilasi cepat & dalam) serta ketepatan kecepatan cairan rehidrasi jam pertama.',
  'WDx: Ketoasidosis Diabetikum (KAD) (ICD-10: E10.10)\nDDx 1: Hyperosmolar Hyperglycemic State (HHS)\nDDx 2: Asidosis Laktat\nDDx 3: Uremia',
  'R/ IVFD NaCl 0.9% 1000 mL No. IV S i.v (1000 mL pada jam 1, dilanjutkan 500 mL/jam)\nR/ Novorapid / Actrapid inj (Insulin Regular) 100 UI/mL No. I S continuous i.v drip 0.1 UI/kgBB/jam'
);

INSERT INTO osce.question_bank_rubric_items (
  question_bank_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors, sort_order
) VALUES
  ('a1b2c3d4-0010-4000-8000-000000000010', 1, 'Anamnesis Penghentian Terapi Insulin & Trias KAD', 'Menggali riwayat putus obat insulin, polidipsi, poliuri, & lemas', 3, 1.0, 'ANAMNESIS', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Lengkap"}'::jsonb, 0),
  ('a1b2c3d4-0010-4000-8000-000000000010', 2, 'Pemeriksaan Pernapasan Kussmaul & Bau Aseton', 'Inspeksi kedalaman pernapasan Kussmaul & keciuman bau buah aseton', 3, 1.0, 'PHYSICAL_EXAM', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 1),
  ('a1b2c3d4-0010-4000-8000-000000000010', 3, 'Resusitasi Rehidrasi NaCl 0.9% & Continuous Drip Insulin', 'Resep NaCl 0.9% 1L jam pertama & drip insulin 0.1 UI/kg/jam', 3, 1.5, 'PHARMACOTHERAPY', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 2);

INSERT INTO osce.question_bank_auxiliary_configs (
  question_bank_id, item_id, name, category, report_text, sort_order
) VALUES
  ('a1b2c3d4-0010-4000-8000-000000000010', 'lab-kad-gds-agb', 'Laboratorium GDS, AGD, & Keton Urin', 'LABORATORIUM', 'GDS: 420 mg/dL (Hiperglikemia berat). AGD: pH 7.15 (Asidosis metabolik berat), HCO3-: 10 mEq/L, PaCO2: 24 mmHg (Kompensasi respiratorik). Urinalisis: Keton Urin (+3 Positif Pekat), Glukosa Urin (+4). Kesimpulan: Ketoasidosis Diabetikum Berat.', 0);

-- VERIFIKASI SEEDING 10 KASUS MEDIS
SELECT 
  qb.id, 
  qb.title, 
  qb.system_organ,
  COUNT(DISTINCT r.id) AS total_rubrik, 
  COUNT(DISTINCT a.id) AS total_penunjang 
FROM osce.question_bank qb
LEFT JOIN osce.question_bank_rubric_items r ON r.question_bank_id = qb.id
LEFT JOIN osce.question_bank_auxiliary_configs a ON a.question_bank_id = qb.id
GROUP BY qb.id, qb.title, qb.system_organ
ORDER BY qb.created_at ASC;
