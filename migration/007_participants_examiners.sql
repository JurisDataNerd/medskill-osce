-- =================================================================
-- 007: TABEL SESSION PARTICIPANTS & EXAMINERS
-- Registrasi peserta per sesi (gelombang & urutan stase awal)
-- dan penugasan dokter penguji per stase.
-- =================================================================

-- ---------------------------------------------------------------
-- A. Peserta Ujian per Sesi
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.session_participants (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id               UUID NOT NULL REFERENCES osce.sessions(id) ON DELETE CASCADE,
    user_id                  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Data Peserta
    nim                      TEXT NOT NULL,
    full_name                TEXT NOT NULL,

    -- Penempatan Sirkuit
    wave_number              INT DEFAULT 1,                 -- Gelombang ujian (1, 2, 3...)
    starting_station_number  INT NOT NULL,                  -- Stase awal mulai sirkuit

    -- Status
    status                   TEXT DEFAULT 'registered',     -- 'registered', 'active', 'completed', 'absent'

    -- Timestamp
    created_at               TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint: 1 peserta = 1 sesi (no duplicate)
    UNIQUE(session_id, user_id)
);

COMMENT ON TABLE osce.session_participants IS 'Registrasi peserta ujian per sesi OSCE dengan gelombang dan urutan stase awal';

-- ---------------------------------------------------------------
-- B. Penugasan Dokter Penguji per Sesi & Stase
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.session_examiners (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id               UUID NOT NULL REFERENCES osce.sessions(id) ON DELETE CASCADE,
    user_id                  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Data Penguji
    full_name                TEXT NOT NULL,
    specialty                TEXT,                          -- "Sp.JP", "Sp.PD", "Sp.A"

    -- Penugasan Stase
    assigned_station_number  INT NOT NULL,                  -- Nomor stase penugasan

    -- Status
    status                   TEXT DEFAULT 'active',         -- 'active', 'offline'

    -- Timestamp
    created_at               TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint: 1 penguji = 1 stase per sesi
    UNIQUE(session_id, user_id)
);

COMMENT ON TABLE osce.session_examiners IS 'Penugasan dokter penguji per sesi OSCE dan pos stase';
