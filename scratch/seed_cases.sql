-- =================================================================
-- SEED DATA: 5 BANK SOAL MEDIS TERSTANDARISASI (AIPKI / KKI) WITH AUXILIARY CONFIGS
-- Inserts 5 complete cases into `osce.question_bank`,
-- `osce.question_bank_rubric_items`, and `osce.question_bank_auxiliary_configs`.
-- =================================================================

-- CLEAR EXISTING
DELETE FROM osce.question_bank_auxiliary_configs;
DELETE FROM osce.question_bank_rubric_items;
DELETE FROM osce.question_bank;

-- 1. SINDROM KORONER AKUT (STEMI ANTEROSEPTAL)
INSERT INTO osce.question_bank (
  id, title, case_title, system_organ, skdi_level, scenario, participant_instructions, examiner_instructions, answer_key_diagnosis, answer_key_prescription
) VALUES (
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Sindrom Koroner Akut (STEMI Anteroseptal)',
  'Sindrom Koroner Akut (STEMI Anteroseptal)',
  'Kardiovaskular',
  '4A (Tuntas Mandiri)',
  'Laki-laki 55 tahun datang ke UGD dengan keluhan nyeri dada kiri hebat seperti ditindih beban berat sejak 2 jam lalu, menjalar ke lengan kiri dan leher, disertai mual dan keringat dingin.',
  '1. Lakukan anamnesis terarah mengenai nyeri dada (PQRST).\n2. Lakukan pemeriksaan fisik kardiovaskular.\n3. Interpretasikan EKG 12 Lead & tetapkan diagnosis.\n4. Berikan tatalaksana awal (MONA) & penulisan resep.',
  'Amati kepatuhan prosedur cuci tangan, teknik auskultasi jantung 4 katup, dan kecermatan interpretasi EKG V1-V4 (ST Elevasi).',
  'WDx: STEMI Anteroseptal (ICD-10: I21.0)\nDDx 1: Unstable Angina Pectoris (UAP)\nDDx 2: Perikarditis Akut\nDDx 3: Diseksi Aorta',
  'R/ Aspirin tab 80mg No. IV S 1 dd tab IV (chewed loading dose 320mg)\nR/ Clopidogrel tab 75mg No. IV S 1 dd tab IV (loading dose 300mg)\nR/ ISDN tab 5mg No. III S 1 dd tab I sublingual'
);

INSERT INTO osce.question_bank_rubric_items (
  question_bank_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors, sort_order
) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 1, 'Anamnesis terarah PQRST nyeri dada & faktor risiko PJK', 'Menggali onset, lokasi, radiasi, kualitas, & faktor risiko', 3, 1.0, 'ANAMNESIS', '{"score_0": "Tidak anamnesis", "score_1": "Minimal", "score_2": "Cukup", "score_3": "Lengkap"}'::jsonb, 0),
  ('a1b2c3d4-0001-4000-8000-000000000001', 2, 'Pemeriksaan fisik kardiovaskular & JVP', 'Auskultasi 4 katup & ukur JVP', 3, 1.0, 'PHYSICAL_EXAM', '{"score_0": "Tidak melakukan", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 1),
  ('a1b2c3d4-0001-4000-8000-000000000001', 3, 'Interpretasi EKG 12 Lead', 'Membaca ST Elevasi V1-V4', 3, 1.5, 'DIAGNOSIS_DDX', '{"score_0": "Salah", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Tepat"}'::jsonb, 2),
  ('a1b2c3d4-0001-4000-8000-000000000001', 4, 'Resep MONA & Loading Dose', 'Menulis Aspirin 320mg, Clopidogrel 300mg, ISDN 5mg', 3, 1.5, 'PHARMACOTHERAPY', '{"score_0": "Tidak menulis", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 3);

INSERT INTO osce.question_bank_auxiliary_configs (
  question_bank_id, item_id, name, category, report_text, sort_order
) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'ekg-stemi-01', 'EKG 12 Lead', 'EKG', 'Sinus Ritem 88x/m. ST Elevasi >2mm pada Lead V1-V4. Reciprocal ST Depresi Lead II, III, aVF. Kesimpulan: STEMI Anteroseptal Akut.', 0),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'lab-troponin-01', 'Troponin I / Cardiac Enzymes', 'LABORATORIUM', 'Troponin I: 4.8 ng/mL (Normal < 0.04 ng/mL). CK-MB: 42 U/L (Normal < 25 U/L). Kesimpulan: Meningkat signifikan (Positif Infark Miokard).', 1),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'rad-toraks-stemi', 'Foto Toraks PA', 'RADIOLOGI', 'Cor kesan membesar (CTR 54%), Pulmo tak tampak infiltrat aktif, sinus kostofrenikus lancip. Kesimpulan: Kardiomegali ringan.', 2);


-- 2. EKSASERBASI AKUT ASMA BRONKIAL DERAJAT SEDANG-BERAT
INSERT INTO osce.question_bank (
  id, title, case_title, system_organ, skdi_level, scenario, participant_instructions, examiner_instructions, answer_key_diagnosis, answer_key_prescription
) VALUES (
  'a1b2c3d4-0002-4000-8000-000000000002',
  'Eksaserbasi Akut Asma Bronkial Derajat Sedang-Berat',
  'Eksaserbasi Akut Asma Bronkial Derajat Sedang-Berat',
  'Respirasi',
  '4A (Tuntas Mandiri)',
  'Wanita 24 tahun datang ke UGD dengan sesak napas berat berbunyi mengi (wheezing) sejak 3 jam lalu setelah terpapar debu rumah. Pasien hanya mampu berbicara patah-patah per kata.',
  '1. Anamnesis terarah sesak napas & riwayat atopi/asma.\n2. Pemeriksaan fisik toraks (inspeksi retraksi & auskultasi wheezing).\n3. Tentukan Diagnosis Kerja & Tatalaksana Nebulisasi B2 Agonis + Oksigenasi.',
  'Nilai pengenalan tanda gagal napas (posisi tripod, retraksi interkostal) dan ketepatan dosis nebulisasi.',
  'WDx: Asma Bronkial Eksaserbasi Akut Derajat Sedang-Berat (ICD-10: J45.901)\nDDx 1: PPOK Eksaserbasi Akut\nDDx 2: Edema Paru Akut\nDDx 3: Aspirasi Benda Asing',
  'R/ Salbutamol nebulizer respule 2.5mg No. II S pro neb (dapat diulang tiap 20 menit)\nR/ Ipratropium Bromida respule 0.5mg No. I S pro neb\nR/ Methylprednisolone inj 62.5mg No. I S i.v'
);

INSERT INTO osce.question_bank_rubric_items (
  question_bank_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors, sort_order
) VALUES
  ('a1b2c3d4-0002-4000-8000-000000000002', 1, 'Anamnesis riwayat serangan asma & pencetus', 'Menanyakan onset sesak, pencetus debu, & pemakaian inhaler harian', 3, 1.0, 'ANAMNESIS', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Lengkap"}'::jsonb, 0),
  ('a1b2c3d4-0002-4000-8000-000000000002', 2, 'Pemeriksaan fisik paru & retraksi', 'Auskultasi wheezing ekspiratorik bilateral & inspeksi retraksi', 3, 1.0, 'PHYSICAL_EXAM', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 1),
  ('a1b2c3d4-0002-4000-8000-000000000002', 3, 'Tatalaksana Nebulisasi & Oksigenasi', 'Nebulisasi Salbutamol+Ipratropium & Corticosteroid IV', 3, 1.5, 'PHARMACOTHERAPY', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 2);

INSERT INTO osce.question_bank_auxiliary_configs (
  question_bank_id, item_id, name, category, report_text, sort_order
) VALUES
  ('a1b2c3d4-0002-4000-8000-000000000002', 'rad-toraks-asma', 'Foto Toraks PA/AP', 'RADIOLOGI', 'Tampak hiperinflasi kedua paru dengan sela iga melebar dan diafragma mendatar. Tak tampak infiltrat spesifik. Kesimpulan: Gambaran Emfisematous Paru dd Asma Bronkial.', 0),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'lab-agd-asma', 'Analisis Gas Darah (AGD)', 'LABORATORIUM', 'pH: 7.32 (Asidosis), PaCO2: 48 mmHg (Hiperkapnia awal), PaO2: 72 mmHg, HCO3-: 24 mEq/L, SaO2: 91%. Kesimpulan: Asidosis Respiratorik Ringan.', 1);


-- 3. STROKE ISKEMIK AKUT (HEMIPARESIS DEXTRA)
INSERT INTO osce.question_bank (
  id, title, case_title, system_organ, skdi_level, scenario, participant_instructions, examiner_instructions, answer_key_diagnosis, answer_key_prescription
) VALUES (
  'a1b2c3d4-0003-4000-8000-000000000003',
  'Stroke Iskemik Akut (Hemiparesis Dextra & Paresis N. VII/XII)',
  'Stroke Iskemik Akut (Hemiparesis Dextra & Paresis N. VII/XII)',
  'Neurologi',
  '3B (Gawat Darurat)',
  'Laki-laki 62 tahun diantar keluarga ke UGD karena kelemahan anggota gerak kanan mendadak sejak 3 jam lalu saat bangun tidur, disertai bicara pelo dan mulut mencong ke kiri.',
  '1. Anamnesis onset (golden period trombolisis) & FAST scale.\n2. Pemeriksaan neurologis: GCS, Nervus Kranial VII & XII sentral, kekuatan otot motorik 4 ekstremitas, refleks patologis Babinski.\n3. Diagnosis & usulan pemeriksaan Penunjang CT Scan Kepala non-kontras.',
  'Perhatikan kejelasan komunikasi instruksi ke pasien dan ketepatan goresan refleks Babinski.',
  'WDx: Stroke Iskemik Akut Lesi Hemisfer Sinistra (ICD-10: I63.9)\nDDx 1: Stroke Hemoragik (Pendarahan Intraserebral)\nDDx 2: Transient Ischemic Attack (TIA)\nDDx 3: Hipoglikemia',
  'R/ IVFD NaCl 0.9% 20 tpm No. I S i.v\nR/ Citicoline inj 500mg No. II S 2 dd inj 500mg i.v\nR/ Amlodipine tab 10mg No. X S 1 dd tab I p.c'
);

INSERT INTO osce.question_bank_rubric_items (
  question_bank_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors, sort_order
) VALUES
  ('a1b2c3d4-0003-4000-8000-000000000003', 1, 'Pemeriksaan Saraf Kranial N. VII & N. XII Sentral', 'N. VII sentral dextra & N. XII deviasi dextra', 3, 1.0, 'PHYSICAL_EXAM', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 0),
  ('a1b2c3d4-0003-4000-8000-000000000003', 2, 'Kekuatan Motorik & Refleks Babinski', 'Motorik dextra 3/5 & Babinski (+) dextra', 3, 1.0, 'PHYSICAL_EXAM', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 1);

INSERT INTO osce.question_bank_auxiliary_configs (
  question_bank_id, item_id, name, category, report_text, sort_order
) VALUES
  ('a1b2c3d4-0003-4000-8000-000000000003', 'rad-ctscan-stroke', 'CT Scan Kepala Non-Kontras', 'RADIOLOGI', 'Tampak area hipodens subtle pada periventrikular dan ganglia basalis hemisfer sinistra. Tidak tampak hiperdensitas pendarahan intraparenkim atau midline shift. Kesimpulan: Stroke Iskemik Akut Hemisfer Sinistra.', 0),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'lab-gds-stroke', 'Gula Darah Sewaktu (GDS)', 'LABORATORIUM', 'GDS: 142 mg/dL (Normal < 200 mg/dL). Menyingkirkan ensefalopati hipoglikemia.', 1);


-- 4. APPENDICITIS AKUT (NYERI TEKAN MCBURNEY)
INSERT INTO osce.question_bank (
  id, title, case_title, system_organ, skdi_level, scenario, participant_instructions, examiner_instructions, answer_key_diagnosis, answer_key_prescription
) VALUES (
  'a1b2c3d4-0004-4000-8000-000000000004',
  'Appendicitis Akut Uncomplicated',
  'Appendicitis Akut Uncomplicated',
  'Digestif',
  '4A (Tuntas Mandiri)',
  'Pemuda 19 tahun mengeluh nyeri perut sekitar pusat yang berpindah ke kanan bawah (titik McBurney) sejak 12 jam lalu, disertai mual, muntah 1x, dan demam subfebris 38.0°C.',
  '1. Anamnesis migrasi nyeri khas apendisitis & Alvarado Score.\n2. Pemeriksaan fisik abdomen (McBurney, Rovsing sign, Psoas sign).\n3. Tentukan Diagnosis & Rencana Operasi Apendektomi + Resep Pre-Op.',
  'Nilai ketepatan penentuan titik McBurney (1/3 lateral garis SIAS ke umbilikus).',
  'WDx: Appendicitis Akut Uncomplicated (ICD-10: K35.80)\nDDx 1: Limfadenitis Mesenterika\nDDx 2: Divertikulitis Meckel\nDDx 3: Urolitiasis Kanan',
  'R/ IVFD Ringer Laktat 20 tpm No. I S i.v\nR/ Ceftriaxone inj 1g No. II S 2 dd inj 1g i.v (skin test dulu)\nR/ Ketorolac inj 30mg No. II S 3 dd inj 30mg i.v'
);

INSERT INTO osce.question_bank_rubric_items (
  question_bank_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors, sort_order
) VALUES
  ('a1b2c3d4-0004-4000-8000-000000000004', 1, 'Pemeriksaan McBurney, Rovsing, Psoas sign', 'Menemukan McBurney (+), Rovsing (+), Psoas (+)', 3, 1.5, 'PHYSICAL_EXAM', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 0);

INSERT INTO osce.question_bank_auxiliary_configs (
  question_bank_id, item_id, name, category, report_text, sort_order
) VALUES
  ('a1b2c3d4-0004-4000-8000-000000000004', 'rad-usg-appendicitis', 'USG Abdomen RLQ', 'RADIOLOGI', 'Tampak struktur berstruktur tubular blind-ended berdiameter 8.2 mm di regio fossa iliaka kanan, tidak kompresibel, dengan penebalan dinding apendiks dan cairan periapendikuler. Kesimpulan: Acute Appendicitis.', 0),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'lab-darahrutin-app', 'Darah Lengkap & Leukosit', 'LABORATORIUM', 'Hemoglobin: 14.2 g/dL, Leukosit: 15.800 /uL (Leukositosis tinggi dengan Shift to the Left / Neutrofil 84%), Trombosit: 280.000 /uL.', 1);


-- 5. DIABETES MELITUS TIPE 2 TERKONTROL BURUK & EDUKASI INSULIN
INSERT INTO osce.question_bank (
  id, title, case_title, system_organ, skdi_level, scenario, participant_instructions, examiner_instructions, answer_key_diagnosis, answer_key_prescription
) VALUES (
  'a1b2c3d4-0005-4000-8000-000000000005',
  'Diabetes Melitus Tipe 2 Terkontrol Buruk & Edukasi Insulin',
  'Diabetes Melitus Tipe 2 Terkontrol Buruk & Edukasi Insulin',
  'Endokrin',
  '4A (Tuntas Mandiri)',
  'Wanita 50 tahun datang kontrol rutin Diabetes Melitus Tipe 2. Pasien mengeluh sering haus (polidipsi), sering kencing (poliuri), dan BB turun 4 kg dalam sebulan. Hasil GDP 210 mg/dL, HbA1c 9.2%.',
  '1. Anamnesis trias DM & kepatuhan minum obat oral.\n2. Edukasi intensifikasi terapi kombinasi OHO + Insulin Basal.\n3. Simulasikan & edukasi teknik penyuntikan pen insulin subkutan dan rotasi lokasi suntikan.',
  'Nilai empati komunikasi edukasi penyuntikan pen insulin dan lokasi rotasi abdomen.',
  'WDx: Diabetes Melitus Tipe 2 Terkontrol Buruk (ICD-10: E11.69)\nDDx 1: DM Tipe LADA\nDDx 2: DM Sekunder',
  'R/ Metformin tab 500mg No. LX S 3 dd tab I p.c\nR/ Insulin Glargine (Lantus SoloStar pen) 100 IU/mL No. I S 1 dd 10 UI subkutan malam hari (jam 22.00)\nR/ Jarum Pen Insulin (Needle 4mm) No. X S pro us.ext'
);

INSERT INTO osce.question_bank_rubric_items (
  question_bank_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors, sort_order
) VALUES
  ('a1b2c3d4-0005-4000-8000-000000000005', 1, 'Edukasi Teknik Penyuntikan Pen Insulin & Rotasi', 'Demonstrasi 6 langkah penyuntikan pen insulin & rotasi abdomen', 3, 1.5, 'COMMUNICATION', '{"score_0": "Tidak", "score_1": "Kurang", "score_2": "Cukup", "score_3": "Sempurna"}'::jsonb, 0);

INSERT INTO osce.question_bank_auxiliary_configs (
  question_bank_id, item_id, name, category, report_text, sort_order
) VALUES
  ('a1b2c3d4-0005-4000-8000-000000000005', 'lab-dm-hba1c', 'Laboratorium GDP, GD2PP, & HbA1c', 'LABORATORIUM', 'Gula Darah Puasa (GDP): 210 mg/dL (Normal < 100 mg/dL). GD2PP: 315 mg/dL. HbA1c: 9.2% (Target < 7.0%). Kolesterol Total: 235 mg/dL. Kesimpulan: DM Tipe 2 Terkontrol Buruk dengan Hiperkolesterolemia.', 0);

-- VERIFIKASI
SELECT 
  qb.id, 
  qb.title, 
  COUNT(DISTINCT r.id) AS total_rubrik, 
  COUNT(DISTINCT a.id) AS total_penunjang 
FROM osce.question_bank qb
LEFT JOIN osce.question_bank_rubric_items r ON r.question_bank_id = qb.id
LEFT JOIN osce.question_bank_auxiliary_configs a ON a.question_bank_id = qb.id
GROUP BY qb.id, qb.title;
