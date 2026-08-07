-- =================================================================
-- 013: STANDARD SETTING & RESULTS SUMMARY
-- Tabel hasil kalkulasi NBL/BRM (Borderline Regression Method)
-- dan materialized view untuk rekapitulasi nilai.
-- =================================================================

-- ---------------------------------------------------------------
-- A. Tabel Hasil Standard Setting (NBL/BRM per Stase)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.standard_setting_results (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id               UUID NOT NULL REFERENCES osce.sessions(id) ON DELETE CASCADE,
    station_id               UUID NOT NULL REFERENCES osce.stations(id) ON DELETE CASCADE,

    -- Metode
    method                   TEXT DEFAULT 'BORDERLINE_REGRESSION',
    -- Values: 'BORDERLINE_REGRESSION', 'BORDERLINE_GROUP', 'ANGOFF', 'FIXED_PERCENTAGE'

    -- Hasil Kalkulasi
    cut_score_percentage     NUMERIC NOT NULL,              -- Nilai Batas Lulus (NBL) hasil kalkulasi
    regression_intercept     NUMERIC,                       -- Intercept regresi linear (BRM)
    regression_slope         NUMERIC,                       -- Slope regresi linear (BRM)
    r_squared                NUMERIC,                       -- R² goodness of fit
    n_examinees              INT,                           -- Jumlah peserta dalam kalkulasi

    -- Metadata
    calculated_at            TIMESTAMPTZ DEFAULT NOW(),
    calculated_by            UUID REFERENCES public.profiles(id),

    -- Constraint: 1 result per stase per sesi per metode
    UNIQUE(session_id, station_id, method)
);

COMMENT ON TABLE osce.standard_setting_results IS 'Hasil kalkulasi Nilai Batas Lulus (NBL) dengan Borderline Regression Method per stase';

-- ---------------------------------------------------------------
-- B. Materialized View: Rekapitulasi Nilai Peserta per Sesi
-- Digunakan oleh ReportsPage.jsx untuk menampilkan rekap cepat.
-- Refresh manual saat admin menekan "Finalize Results".
-- ---------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS osce.session_results_summary AS
SELECT
    ee.session_id,
    ee.participant_id,
    p.full_name                                           AS participant_name,
    sp.nim,
    sp.wave_number,
    COUNT(DISTINCT ee.station_id)                         AS stations_completed,
    ROUND(AVG(ee.final_score_percentage), 2)              AS avg_score_percentage,
    ROUND(SUM(ee.total_points_earned), 2)                 AS total_earned,
    ROUND(SUM(ee.max_points_possible), 2)                 AS total_possible,
    ARRAY_AGG(DISTINCT ee.grs_rating ORDER BY ee.grs_rating) AS grs_ratings,
    COUNT(*) FILTER (WHERE ee.grs_rating = 'UNSATISFACTORY') AS fail_count,
    COUNT(*) FILTER (WHERE ee.grs_rating = 'BORDERLINE')     AS borderline_count,
    COUNT(*) FILTER (WHERE ee.grs_rating = 'SATISFACTORY')   AS pass_count,
    COUNT(*) FILTER (WHERE ee.grs_rating = 'SUPERIOR')       AS superior_count
FROM osce.examiner_evaluations ee
JOIN public.profiles p ON p.id = ee.participant_id
JOIN osce.session_participants sp
    ON sp.user_id = ee.participant_id
    AND sp.session_id = ee.session_id
WHERE ee.is_locked = TRUE
GROUP BY ee.session_id, ee.participant_id, p.full_name, sp.nim, sp.wave_number;

COMMENT ON MATERIALIZED VIEW osce.session_results_summary IS 'Rekapitulasi nilai peserta per sesi. REFRESH saat admin finalize results.';

-- ---------------------------------------------------------------
-- C. Function: Refresh Materialized View
-- Dipanggil oleh Edge Function atau admin action
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION osce.fn_refresh_results_summary(p_session_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW osce.session_results_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION osce.fn_refresh_results_summary IS 'Refresh materialized view session_results_summary. Panggil setelah semua evaluasi dikunci.';
