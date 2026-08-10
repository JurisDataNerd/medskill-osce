-- =================================================================
-- SEED DATA: 2 DRAFT OSCE SESSIONS (6 ACTIVE STATIONS + 2 BREAK STATIONS)
-- Creates 2 sessions in `osce.sessions` with 8 station slots each in `osce.stations`,
-- and copies rubrics & auxiliary configs to active stations.
-- =================================================================

-- -----------------------------------------------------------------
-- DRAFT SESSION 1: Sirkuit Alfa (6 Active + 2 Rest)
-- -----------------------------------------------------------------
WITH sess1 AS (
  INSERT INTO osce.sessions (
    id,
    title,
    description,
    location_building,
    session_date,
    start_time,
    status,
    exam_type,
    track_label,
    total_stations,
    total_rounds,
    max_participants_per_wave,
    station_duration_minutes,
    break_duration_minutes,
    transition_duration_minutes,
    reading_duration_minutes
  ) VALUES (
    'b1c2d3e4-0001-4000-8000-000000000001',
    'Ujian Komprehensif Dokter FK - Sirkuit Alfa (6 Stase + 2 Istirahat)',
    'Draft Sesi Ujian Komprehensif OSCE Internal Program Studi Profesi Dokter Track Alfa.',
    'Gedung Skill Lab Medis Lantai 2',
    '2026-08-15',
    '08:00:00',
    'draft',
    'regular',
    'A',
    8,
    8,
    8,
    12,
    12,
    2,
    1
  ) RETURNING id
)
INSERT INTO osce.stations (
  session_id, station_number, is_break, title, case_title, system_organ, skdi_level,
  scenario, participant_instructions, examiner_instructions,
  answer_key_diagnosis, answer_key_prescription, question_bank_id, room_number, sort_order
) VALUES
  -- Pos 1: STEMI
  (
    'b1c2d3e4-0001-4000-8000-000000000001', 1, false, 'Stase 1 (Kardiovaskular)',
    'Sindrom Koroner Akut (STEMI Anteroseptal)', 'Kardiovaskular', '4A (Tuntas Mandiri)',
    'Laki-laki 55 tahun datang ke UGD dengan keluhan nyeri dada kiri hebat seperti ditindih beban berat sejak 2 jam lalu, menjalar ke lengan kiri dan leher, disertai mual dan keringat dingin.',
    '1. Lakukan anamnesis terarah mengenai nyeri dada (PQRST).\n2. Lakukan pemeriksaan fisik kardiovaskular.\n3. Interpretasikan EKG 12 Lead & tetapkan diagnosis.\n4. Berikan tatalaksana awal (MONA) & penulisan resep.',
    'Amati kepatuhan prosedur cuci tangan, teknik auskultasi jantung 4 katup, dan kecermatan interpretasi EKG V1-V4 (ST Elevasi).',
    'WDx: STEMI Anteroseptal (ICD-10: I21.0)\nDDx 1: Unstable Angina Pectoris (UAP)\nDDx 2: Perikarditis Akut\nDDx 3: Diseksi Aorta',
    'R/ Aspirin tab 80mg No. IV S 1 dd tab IV (chewed loading dose 320mg)\nR/ Clopidogrel tab 75mg No. IV S 1 dd tab IV (loading dose 300mg)\nR/ ISDN tab 5mg No. III S 1 dd tab I sublingual',
    'a1b2c3d4-0001-4000-8000-000000000001', 'Ruang 201', 0
  ),
  -- Pos 2: Asma Bronkial
  (
    'b1c2d3e4-0001-4000-8000-000000000001', 2, false, 'Stase 2 (Respirasi)',
    'Eksaserbasi Akut Asma Bronkial Derajat Sedang-Berat', 'Respirasi', '4A (Tuntas Mandiri)',
    'Wanita 24 tahun datang ke UGD dengan sesak napas berat berbunyi mengi (wheezing) sejak 3 jam lalu setelah terpapar debu rumah. Pasien hanya mampu berbicara patah-patah per kata.',
    '1. Anamnesis terarah sesak napas & riwayat atopi/asma.\n2. Pemeriksaan fisik toraks (inspeksi retraksi & auskultasi wheezing).\n3. Tentukan Diagnosis Kerja & Tatalaksana Nebulisasi B2 Agonis + Oksigenasi.',
    'Nilai pengenalan tanda gagal napas (posisi tripod, retraksi interkostal) dan ketepatan dosis nebulisasi.',
    'WDx: Asma Bronkial Eksaserbasi Akut Derajat Sedang-Berat (ICD-10: J45.901)\nDDx 1: PPOK Eksaserbasi Akut\nDDx 2: Edema Paru Akut\nDDx 3: Aspirasi Benda Asing',
    'R/ Salbutamol nebulizer respule 2.5mg No. II S pro neb (dapat diulang tiap 20 menit)\nR/ Ipratropium Bromida respule 0.5mg No. I S pro neb\nR/ Methylprednisolone inj 62.5mg No. I S i.v',
    'a1b2c3d4-0002-4000-8000-000000000002', 'Ruang 202', 1
  ),
  -- Pos 3: Stroke Iskemik
  (
    'b1c2d3e4-0001-4000-8000-000000000001', 3, false, 'Stase 3 (Neurologi)',
    'Stroke Iskemik Akut (Hemiparesis Dextra & Paresis N. VII/XII)', 'Neurologi', '3B (Gawat Darurat)',
    'Laki-laki 62 tahun diantar keluarga ke UGD karena kelemahan anggota gerak kanan mendadak sejak 3 jam lalu saat bangun tidur, disertai bicara pelo dan mulut mencong ke kiri.',
    '1. Anamnesis onset (golden period trombolisis) & FAST scale.\n2. Pemeriksaan neurologis: GCS, Nervus Kranial VII & XII sentral, kekuatan otot motorik 4 ekstremitas, refleks patologis Babinski.\n3. Diagnosis & usulan pemeriksaan Penunjang CT Scan Kepala non-kontras.',
    'Perhatikan kejelasan komunikasi instruksi ke pasien dan ketepatan goresan refleks Babinski.',
    'WDx: Stroke Iskemik Akut Lesi Hemisfer Sinistra (ICD-10: I63.9)\nDDx 1: Stroke Hemoragik (Pendarahan Intraserebral)\nDDx 2: Transient Ischemic Attack (TIA)\nDDx 3: Hipoglikemia',
    'R/ IVFD NaCl 0.9% 20 tpm No. I S i.v\nR/ Citicoline inj 500mg No. II S 2 dd inj 500mg i.v\nR/ Amlodipine tab 10mg No. X S 1 dd tab I p.c',
    'a1b2c3d4-0003-4000-8000-000000000003', 'Ruang 203', 2
  ),
  -- Pos 4: ISTIRAHAT I
  (
    'b1c2d3e4-0001-4000-8000-000000000001', 4, true, 'Stase Istirahat I (Transit / Rest Room A)',
    NULL, NULL, NULL,
    'Stase Istirahat 1. Peserta berada di ruang transit istirahat selama 12 menit sebelum melanjutkan ke stase berikutnya.',
    'Istirahat dan persiapkan diri untuk stase selanjutnya.',
    'Stase istirahat - Tidak ada pengujian.',
    NULL, NULL, NULL, 'Ruang 204 (Transit A)', 3
  ),
  -- Pos 5: Appendicitis
  (
    'b1c2d3e4-0001-4000-8000-000000000001', 5, false, 'Stase 4 (Digestif)',
    'Appendicitis Akut Uncomplicated', 'Digestif', '4A (Tuntas Mandiri)',
    'Pemuda 19 tahun mengeluh nyeri perut sekitar pusat yang berpindah ke kanan bawah (titik McBurney) sejak 12 jam lalu, disertai mual, muntah 1x, dan demam subfebris 38.0°C.',
    '1. Anamnesis migrasi nyeri khas apendisitis & Alvarado Score.\n2. Pemeriksaan fisik abdomen (McBurney, Rovsing sign, Psoas sign).\n3. Tentukan Diagnosis & Rencana Operasi Apendektomi + Resep Pre-Op.',
    'Nilai ketepatan penentuan titik McBurney (1/3 lateral garis SIAS ke umbilikus).',
    'WDx: Appendicitis Akut Uncomplicated (ICD-10: K35.80)\nDDx 1: Limfadenitis Mesenterika\nDDx 2: Divertikulitis Meckel\nDDx 3: Urolitiasis Kanan',
    'R/ IVFD Ringer Laktat 20 tpm No. I S i.v\nR/ Ceftriaxone inj 1g No. II S 2 dd inj 1g i.v (skin test dulu)\nR/ Ketorolac inj 30mg No. II S 3 dd inj 30mg i.v',
    'a1b2c3d4-0004-4000-8000-000000000004', 'Ruang 205', 4
  ),
  -- Pos 6: DM Tipe 2
  (
    'b1c2d3e4-0001-4000-8000-000000000001', 6, false, 'Stase 5 (Endokrin)',
    'Diabetes Melitus Tipe 2 Terkontrol Buruk & Edukasi Insulin', 'Endokrin', '4A (Tuntas Mandiri)',
    'Wanita 50 tahun datang kontrol rutin Diabetes Melitus Tipe 2. Pasien mengeluh sering haus (polidipsi), sering kencing (poliuri), dan BB turun 4 kg dalam sebulan. Hasil GDP 210 mg/dL, HbA1c 9.2%.',
    '1. Anamnesis trias DM & kepatuhan minum obat oral.\n2. Edukasi intensifikasi terapi kombinasi OHO + Insulin Basal.\n3. Simulasikan & edukasi teknik penyuntikan pen insulin subkutan dan rotasi lokasi suntikan.',
    'Nilai empati komunikasi edukasi penyuntikan pen insulin dan lokasi rotasi abdomen.',
    'WDx: Diabetes Melitus Tipe 2 Terkontrol Buruk (ICD-10: E11.69)\nDDx 1: DM Tipe LADA\nDDx 2: DM Sekunder',
    'R/ Metformin tab 500mg No. LX S 3 dd tab I p.c\nR/ Insulin Glargine (Lantus SoloStar pen) 100 IU/mL No. I S 1 dd 10 UI subkutan malam hari (jam 22.00)\nR/ Jarum Pen Insulin (Needle 4mm) No. X S pro us.ext',
    'a1b2c3d4-0005-4000-8000-000000000005', 'Ruang 206', 5
  ),
  -- Pos 7: DBD Pediatri
  (
    'b1c2d3e4-0001-4000-8000-000000000001', 7, false, 'Stase 6 (Pediatri)',
    'Demam Berdarah Dengue (DBD) Derajat II', 'Pediatri', '4A (Tuntas Mandiri)',
    'Anak laki-laki 8 tahun diantar ibunya ke UGD dengan demam tinggi mendadak sejak 4 hari lalu, disertai nyeri kepala, pendarahan gusi saat sikat gigi, dan bintik-bintik merah (petekie) di kedua lengan.',
    '1. Anamnesis kurva demam saddleback (bimodal) & warning signs syok.\n2. Pemeriksaan fisik (tes Rumple Leede, tanda dehidrasi, akral, & tanda pendarahan).\n3. Interpretasi Darah Rutin & Tatalaksana Resusitasi Cairan Kristaloid RL.',
    'Nilai cermat pemeriksaan tes Rumple Leede (pembendungan 5 menit) dan perhitungan kebutuhan cairan RL berdasarkan berat badan.',
    'WDx: Demam Berdarah Dengue (DBD) Derajat II (ICD-10: A91)\nDDx 1: Dengue Fever (DF)\nDDx 2: Demam Tifoid\nDDx 3: Chikungunya',
    'R/ IVFD Ringer Laktat 500 mL No. II S i.v 7 mL/kgBB/jam\nR/ Paracetamol tab 250mg No. X S 3 dd tab I p.r.n (bila demam > 38.5°C)',
    'a1b2c3d4-0006-4000-8000-000000000006', 'Ruang 207', 6
  ),
  -- Pos 8: ISTIRAHAT II
  (
    'b1c2d3e4-0001-4000-8000-000000000001', 8, true, 'Stase Istirahat II (Transit / Rest Room B)',
    NULL, NULL, NULL,
    'Stase Istirahat 2. Peserta berada di ruang transit istirahat selama 12 menit sebelum menyelesaikan rotasi.',
    'Istirahat dan persiapkan diri untuk stase selanjutnya.',
    'Stase istirahat - Tidak ada pengujian.',
    NULL, NULL, NULL, 'Ruang 208 (Transit B)', 7
  );


-- -----------------------------------------------------------------
-- DRAFT SESSION 2: Sirkuit Beta (6 Active + 2 Rest)
-- -----------------------------------------------------------------
WITH sess2 AS (
  INSERT INTO osce.sessions (
    id,
    title,
    description,
    location_building,
    session_date,
    start_time,
    status,
    exam_type,
    track_label,
    total_stations,
    total_rounds,
    max_participants_per_wave,
    station_duration_minutes,
    break_duration_minutes,
    transition_duration_minutes,
    reading_duration_minutes
  ) VALUES (
    'b1c2d3e4-0002-4000-8000-000000000002',
    'Ujian OSCE Terpadu Klinik - Sirkuit Beta (6 Stase + 2 Istirahat)',
    'Draft Sesi Ujian Rotasi OSCE Klinik Mahasiswa Kedokteran Track Beta.',
    'Gedung Simulator Medis Lantai 3',
    '2026-08-16',
    '09:00:00',
    'draft',
    'regular',
    'B',
    8,
    8,
    8,
    12,
    12,
    2,
    1
  ) RETURNING id
)
INSERT INTO osce.stations (
  session_id, station_number, is_break, title, case_title, system_organ, skdi_level,
  scenario, participant_instructions, examiner_instructions,
  answer_key_diagnosis, answer_key_prescription, question_bank_id, room_number, sort_order
) VALUES
  -- Pos 1: OMA
  (
    'b1c2d3e4-0002-4000-8000-000000000002', 1, false, 'Stase 1 (THT-KL)',
    'Otitis Media Akut (OMA) Dextra Stadium Perforasi', 'THT-KL', '4A (Tuntas Mandiri)',
    'Anak perempuan 6 tahun mengeluh keluar cairan kuning berbau dari telinga kanan sejak 1 hari lalu. Sebelumnya anak mengeluh nyeri telinga hebat dan demam selama 3 hari yang mendadak berkurang setelah cairan keluar.',
    '1. Anamnesis terarah otalgia, otorhea, dan ISPA pendahulu.\n2. Pemeriksaan Otoskop telinga dextra (inspeksi membran timpani & sekret).\n3. Tentukan Stadium OMA & Tatalaksana Cuci Telinga H2O2 3% + Tetes Telinga Ofloxacin.',
    'Nilai teknik memegang otoskop yang benar (seperti memegang pensil dengan tumpuan pipi) dan urutan cuci telinga H2O2.',
    'WDx: Otitis Media Akut (OMA) Dextra Stadium Perforasi (ICD-10: H66.011)\nDDx 1: Otitis Media Supuratif Kronik (OMSK) Tipe Benigna\nDDx 2: Otitis Eksterna Akut Diffusa',
    'R/ H2O2 ear drops 3% fl No. I S 3 dd gtt III auric. dextra (cuci telinga)\nR/ Ofloxacin ear drops 0.3% fl No. I S 2 dd gtt II auric. dextra\nR/ Amoxicillin syr 125mg/5mL fl No. II S 3 dd cth II',
    'a1b2c3d4-0007-4000-8000-000000000007', 'Ruang 301', 0
  ),
  -- Pos 2: Fraktur Clavicula
  (
    'b1c2d3e4-0002-4000-8000-000000000002', 2, false, 'Stase 2 (Muskuloskeletal)',
    'Closed Fracture Clavicula Sinistra Midshaft', 'Muskuloskeletal', '3A (Non Gawat Darurat)',
    'Remaja laki-laki 17 tahun diantar ke UGD setelah jatuh dari sepeda motor dengan bahu kiri menumbuk jalan. Pasien mengeluh nyeri hebat pada bahu kiri dan tidak mampu menggerakkan lengan kiri.',
    '1. Anamnesis mekanisme trauma (jatuh bahu menumbuk).\n2. Pemeriksaan fisik status lokalis shoulder & clavicula (Look, Feel, Move, NVD intact).\n3. Interpretasi X-Ray Clavicula Sinistra AP & Tatalaksana Pemasangan Ransel Verband / Figure-of-Eight.',
    'Amati prosedur pemeriksaan Neurovaskuler Distal (pulsasi a. radialis, sensibilitas jari, & CRT) sebelum dan sesudah immobilisasi.',
    'WDx: Closed Fracture Clavicula Sinistra 1/3 Tengah / Midshaft (ICD-10: S42.022A)\nDDx 1: Dislokasi Sendi Acromioclavicular (AC Joint Dislocation)\nDDx 2: Fraktur Scapula Sinistra',
    'R/ Ransel Verband / Figure-of-Eight Bandage No. I S pro us.ext\nR/ Paracetamol tab 500mg No. X S 3 dd tab I p.c\nR/ Sodium Diclofenac tab 50mg No. X S 2 dd tab I p.c',
    'a1b2c3d4-0008-4000-8000-000000000008', 'Ruang 302', 1
  ),
  -- Pos 3: Urolithiasis
  (
    'b1c2d3e4-0002-4000-8000-000000000002', 3, false, 'Stase 3 (Urologi)',
    'Urolithiasis / Kolik Ureter Sinistra', 'Urologi', '3A (Non Gawat Darurat)',
    'Laki-laki 42 tahun datang ke UGD dengan keluhan nyeri pinggang kiri mendadak yang sangat hebat (hilang timbul/kolik), menjalar hingga ke lipat paha dan testis kiri, disertai kencing berwarna kemerahan (hematuria).',
    '1. Anamnesis sifat nyeri kolik pinggang, radiasi ke skrotum, & hematuria.\n2. Pemeriksaan fisik abdomen & urologi (ketok kostovertebra / CVA tenderness sinistra).\n3. Interpretasi USG / BNO-IVP & Tatalaksana Analgetik Spasmolitik NSAID.',
    'Amati ketepatan lokasi pengetokan sudut kostovertebra (CVA) setinggi V.Th12 - L1.',
    'WDx: Urolithiasis / Batu Ureter Sinistra (ICD-10: N20.1)\nDDx 1: Nefrolithiasis Sinistra\nDDx 2: Appendicitis Akut (bila kanan)\nDDx 3: Diseksi Aorta Abdominalis',
    'R/ Ketorolac inj 30mg No. II S i.m / i.v pro kolik\nR/ Hyoscine N-butylbromide tab 10mg No. X S 3 dd tab I p.c\nR/ Tramadol tab 50mg No. X S 2 dd tab I p.c',
    'a1b2c3d4-0009-4000-8000-000000000009', 'Ruang 303', 2
  ),
  -- Pos 4: ISTIRAHAT I
  (
    'b1c2d3e4-0002-4000-8000-000000000002', 4, true, 'Stase Istirahat I (Transit / Rest Room A)',
    NULL, NULL, NULL,
    'Stase Istirahat 1. Peserta berada di ruang transit istirahat selama 12 menit sebelum melanjutkan ke stase berikutnya.',
    'Istirahat dan persiapkan diri untuk stase selanjutnya.',
    'Stase istirahat - Tidak ada pengujian.',
    NULL, NULL, NULL, 'Ruang 304 (Transit A)', 3
  ),
  -- Pos 5: KAD
  (
    'b1c2d3e4-0002-4000-8000-000000000002', 5, false, 'Stase 4 (Endokrin/UGD)',
    'Ketoasidosis Diabetikum (KAD)', 'Endokrin', '3B (Gawat Darurat)',
    'Laki-laki 28 tahun penderita DM Tipe 1 dibawa ke UGD dalam kondisi lemas berat, napas cepat dan dalam (Kussmaul), serta tercium bau buah asam (aseton) dari pernapasan. Pasien menghentikan suntikan insulin sejak 3 hari lalu.',
    '1. Anamnesis riwayat penghentian terapi insulin & trias KAD.\n2. Pemeriksaan fisik (pernapasan Kussmaul, bau napas aseton, & dehidrasi berat).\n3. Interpretasi GDS, Keton Urin, AGD & Tatalaksana Resusitasi Rehidrasi NaCl 0.9% + Drip Insulin.',
    'Nilai pengenalan pola napas Kussmaul (hiperventilasi cepat & dalam) serta ketepatan kecepatan cairan rehidrasi jam pertama.',
    'WDx: Ketoasidosis Diabetikum (KAD) (ICD-10: E10.10)\nDDx 1: Hyperosmolar Hyperglycemic State (HHS)\nDDx 2: Asidosis Laktat\nDDx 3: Uremia',
    'R/ IVFD NaCl 0.9% 1000 mL No. IV S i.v (1000 mL pada jam 1, dilanjutkan 500 mL/jam)\nR/ Novorapid / Actrapid inj (Insulin Regular) 100 UI/mL No. I S continuous i.v drip 0.1 UI/kgBB/jam',
    'a1b2c3d4-0010-4000-8000-000000000010', 'Ruang 305', 4
  ),
  -- Pos 6: STEMI
  (
    'b1c2d3e4-0002-4000-8000-000000000002', 6, false, 'Stase 5 (Kardiovaskular)',
    'Sindrom Koroner Akut (STEMI Anteroseptal)', 'Kardiovaskular', '4A (Tuntas Mandiri)',
    'Laki-laki 55 tahun datang ke UGD dengan keluhan nyeri dada kiri hebat seperti ditindih beban berat sejak 2 jam lalu, menjalar ke lengan kiri dan leher, disertai mual dan keringat dingin.',
    '1. Lakukan anamnesis terarah mengenai nyeri dada (PQRST).\n2. Lakukan pemeriksaan fisik kardiovaskular.\n3. Interpretasikan EKG 12 Lead & tetapkan diagnosis.\n4. Berikan tatalaksana awal (MONA) & penulisan resep.',
    'Amati kepatuhan prosedur cuci tangan, teknik auskultasi jantung 4 katup, dan kecermatan interpretasi EKG V1-V4 (ST Elevasi).',
    'WDx: STEMI Anteroseptal (ICD-10: I21.0)\nDDx 1: Unstable Angina Pectoris (UAP)\nDDx 2: Perikarditis Akut\nDDx 3: Diseksi Aorta',
    'R/ Aspirin tab 80mg No. IV S 1 dd tab IV (chewed loading dose 320mg)\nR/ Clopidogrel tab 75mg No. IV S 1 dd tab IV (loading dose 300mg)\nR/ ISDN tab 5mg No. III S 1 dd tab I sublingual',
    'a1b2c3d4-0001-4000-8000-000000000001', 'Ruang 306', 5
  ),
  -- Pos 7: Asma
  (
    'b1c2d3e4-0002-4000-8000-000000000002', 7, false, 'Stase 6 (Respirasi)',
    'Eksaserbasi Akut Asma Bronkial Derajat Sedang-Berat', 'Respirasi', '4A (Tuntas Mandiri)',
    'Wanita 24 tahun datang ke UGD dengan sesak napas berat berbunyi mengi (wheezing) sejak 3 jam lalu setelah terpapar debu rumah. Pasien hanya mampu berbicara patah-patah per kata.',
    '1. Anamnesis terarah sesak napas & riwayat atopi/asma.\n2. Pemeriksaan fisik toraks (inspeksi retraksi & auskultasi wheezing).\n3. Tentukan Diagnosis Kerja & Tatalaksana Nebulisasi B2 Agonis + Oksigenasi.',
    'Nilai pengenalan tanda gagal napas (posisi tripod, retraksi interkostal) dan ketepatan dosis nebulisasi.',
    'WDx: Asma Bronkial Eksaserbasi Akut Derajat Sedang-Berat (ICD-10: J45.901)\nDDx 1: PPOK Eksaserbasi Akut\nDDx 2: Edema Paru Akut\nDDx 3: Aspirasi Benda Asing',
    'R/ Salbutamol nebulizer respule 2.5mg No. II S pro neb (dapat diulang tiap 20 menit)\nR/ Ipratropium Bromida respule 0.5mg No. I S pro neb\nR/ Methylprednisolone inj 62.5mg No. I S i.v',
    'a1b2c3d4-0002-4000-8000-000000000002', 'Ruang 307', 6
  ),
  -- Pos 8: ISTIRAHAT II
  (
    'b1c2d3e4-0002-4000-8000-000000000002', 8, true, 'Stase Istirahat II (Transit / Rest Room B)',
    NULL, NULL, NULL,
    'Stase Istirahat 2. Peserta berada di ruang transit istirahat selama 12 menit sebelum menyelesaikan rotasi.',
    'Istirahat dan persiapkan diri untuk stase selanjutnya.',
    'Stase istirahat - Tidak ada pengujian.',
    NULL, NULL, NULL, 'Ruang 308 (Transit B)', 7
  );


-- -----------------------------------------------------------------
-- COPY RUBRIC ITEMS FROM QUESTION BANK TO ACTIVE STATIONS
-- -----------------------------------------------------------------
INSERT INTO osce.rubric_items (
  station_id, question_number, question, answer_key, max_points, weight, competency_area, descriptors, sort_order
)
SELECT 
  st.id AS station_id,
  qb_rubric.question_number,
  qb_rubric.question,
  qb_rubric.answer_key,
  qb_rubric.max_points,
  qb_rubric.weight,
  qb_rubric.competency_area,
  qb_rubric.descriptors,
  qb_rubric.sort_order
FROM osce.stations st
JOIN osce.question_bank_rubric_items qb_rubric ON qb_rubric.question_bank_id = st.question_bank_id
WHERE st.is_break = false;


-- -----------------------------------------------------------------
-- COPY AUXILIARY CONFIGS FROM QUESTION BANK TO ACTIVE STATIONS
-- -----------------------------------------------------------------
INSERT INTO osce.station_auxiliary_configs (
  station_id, item_id, name, category, image_storage_path, report_text
)
SELECT 
  st.id AS station_id,
  qb_aux.item_id,
  qb_aux.name,
  qb_aux.category,
  qb_aux.image_storage_path,
  qb_aux.report_text
FROM osce.stations st
JOIN osce.question_bank_auxiliary_configs qb_aux ON qb_aux.question_bank_id = st.question_bank_id
WHERE st.is_break = false;


-- =================================================================
-- VERIFIKASI SEEDING DRAFT SESSIONS & STATIONS
-- =================================================================
SELECT 
  s.id,
  s.title,
  s.status,
  s.total_stations,
  COUNT(st.id) AS total_pos_created,
  COUNT(CASE WHEN st.is_break = false THEN 1 END) AS active_exam_stations,
  COUNT(CASE WHEN st.is_break = true THEN 1 END) AS rest_break_stations
FROM osce.sessions s
LEFT JOIN osce.stations st ON st.session_id = s.id
GROUP BY s.id, s.title, s.status, s.total_stations;
