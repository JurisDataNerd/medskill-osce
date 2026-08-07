-- =================================================================
-- 002: TABEL SESSIONS (Konfigurasi Sesi Ujian OSCE & Timer)
-- Menyimpan konfigurasi utama sesi, gelombang, parameter durasi,
-- dan aturan otomatisasi ujian.
-- =================================================================

CREATE TABLE IF NOT EXISTS osce.sessions (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identitas Sesi
    title                       TEXT NOT NULL,
    description                 TEXT,
    location_building           TEXT,
    session_date                DATE NOT NULL,
    start_time                  TIME NOT NULL,
    end_time                    TIME,

    -- Status & Tipe
    status                      osce.session_status NOT NULL DEFAULT 'draft',
    exam_type                   osce.exam_type NOT NULL DEFAULT 'regular',
    track_label                 TEXT DEFAULT 'A',           -- Multi-track: 'A', 'B', 'C'

    -- Konfigurasi Sirkuit
    total_stations              INT NOT NULL DEFAULT 8,     -- Total slot sirkuit (Ujian + Istirahat)
    total_rounds                INT NOT NULL DEFAULT 8,     -- Total ronde rotasi (= total_stations)
    max_participants_per_wave   INT NOT NULL DEFAULT 8,     -- Kapasitas gelombang (= total_stations)

    -- Parameter Durasi Timer (dalam menit)
    station_duration_minutes    INT NOT NULL DEFAULT 12,    -- Durasi Stase Ujian
    break_duration_minutes      INT NOT NULL DEFAULT 12,    -- Durasi Stase Istirahat
    transition_duration_minutes INT NOT NULL DEFAULT 2,     -- Durasi Transisi Rotasi antar-pos
    reading_duration_minutes    INT NOT NULL DEFAULT 1,     -- Durasi Reading Time (bagian dari station_duration)

    -- Aturan Otomatisasi
    single_live_session         BOOLEAN DEFAULT TRUE,       -- Kunci: hanya 1 sesi aktif bersamaan
    auto_rolling_timer          BOOLEAN DEFAULT TRUE,       -- Otomatisasi perpindahan rotasi bel
    auto_lock_answer            BOOLEAN DEFAULT TRUE,       -- Kunci otomatis jawaban saat bel
    late_tolerance_minutes      INT DEFAULT 5,              -- Toleransi keterlambatan peserta (menit)

    -- State Live (diperbarui realtime saat ujian berlangsung)
    current_wave                INT DEFAULT 1,
    current_round               INT DEFAULT 1,

    -- Timestamp
    started_at                  TIMESTAMPTZ,
    finished_at                 TIMESTAMPTZ,
    created_by                  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Komentar tabel
COMMENT ON TABLE osce.sessions IS 'Konfigurasi utama sesi ujian OSCE termasuk timer, gelombang, dan aturan otomatisasi';
COMMENT ON COLUMN osce.sessions.total_stations IS 'Total slot sirkuit: stase ujian + stase istirahat';
COMMENT ON COLUMN osce.sessions.track_label IS 'Label track untuk multi-sirkuit paralel (A/B/C)';
COMMENT ON COLUMN osce.sessions.reading_duration_minutes IS 'Durasi reading time, merupakan bagian dari station_duration_minutes';
