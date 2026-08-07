-- =================================================================
-- 005: TABEL AUXILIARY EXAM (Pemeriksaan Penunjang)
-- Master katalog item penunjang (EKG, Radiologi, Lab, dll.)
-- dan konfigurasi kunci jawaban penunjang per stase.
-- =================================================================

-- ---------------------------------------------------------------
-- A. Master Katalog Item Pemeriksaan Penunjang
-- Daftar semua item penunjang yang tersedia dalam sistem
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.auxiliary_exam_catalog (
    id            TEXT PRIMARY KEY,                         -- ID unik: "ekg-01", "rad-thorax-ap", "lab-hb"
    name          TEXT NOT NULL,                            -- "EKG 12 Lead", "Foto Thorax AP/PA", "Hemoglobin"
    category      TEXT NOT NULL,                            -- "EKG", "RADIOLOGI", "LABORATORIUM", "LAIN-LAIN"
    description   TEXT,                                    -- Deskripsi singkat pemeriksaan
    sort_order    INT DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE osce.auxiliary_exam_catalog IS 'Master katalog semua item pemeriksaan penunjang yang tersedia';

-- ---------------------------------------------------------------
-- B. Konfigurasi Kunci Jawaban Penunjang per Stase
-- Berkas penunjang (gambar + laporan teks) yang admin konfigurasi
-- untuk dikirim ke peserta yang meminta penunjang tertentu.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.station_auxiliary_configs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id    UUID NOT NULL REFERENCES osce.stations(id) ON DELETE CASCADE,

    -- Referensi ke katalog
    item_id       TEXT NOT NULL,                            -- ID dari auxiliary_exam_catalog
    name          TEXT NOT NULL,                            -- Nama penunjang (denormalized untuk performa)
    category      TEXT NOT NULL,                            -- Kategori (denormalized)

    -- Konten Hasil Penunjang
    image_url          TEXT,                               -- URL gambar (Supabase Storage path atau direct URL)
    image_storage_path TEXT,                               -- Path di Supabase Storage bucket: "osce-media/session-xxx/station-1/ekg.jpg"
    report_text        TEXT,                               -- Laporan ekspertise medis teks

    -- Timestamp
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE osce.station_auxiliary_configs IS 'Konfigurasi kunci jawaban berkas penunjang per stase (gambar + laporan teks)';
COMMENT ON COLUMN osce.station_auxiliary_configs.image_url IS 'Direct URL atau signed URL dari Supabase Storage';
COMMENT ON COLUMN osce.station_auxiliary_configs.image_storage_path IS 'Path objek di Supabase Storage bucket osce-media';
