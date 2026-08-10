-- Seed realistic participants and examiner evaluations into osce.session_participants & osce.examiner_evaluations

INSERT INTO osce.session_participants (session_id, user_id, full_name, nim, status, starting_station_number, wave_number, created_at)
VALUES
('b1c2d3e4-0001-4000-8000-000000000001', 'e788c6c0-e40f-4cca-bd9b-03cc5c2c3cd3', 'Ahmad Rizky Pratama', '20200710042', 'active', 1, 1, NOW()),
('b1c2d3e4-0001-4000-8000-000000000001', '9a239bb6-eee2-470a-a3d6-af1592e6bf80', 'Budi Santoso', '20200710001', 'active', 2, 1, NOW()),
('b1c2d3e4-0001-4000-8000-000000000001', '3c13b97c-f86e-47d8-be18-d6e70746daf3', 'Siti Rahmawati', '20200710018', 'active', 3, 1, NOW()),
('b1c2d3e4-0001-4000-8000-000000000001', '00c6936d-a038-435d-9a1a-ccc0ddb45e9f', 'Dewi Anggraini', '20200710025', 'active', 4, 1, NOW()),
('b1c2d3e4-0001-4000-8000-000000000001', 'c4758364-b2d0-46ed-858d-16b26b976358', 'Fajar Nugraha', '20200710033', 'active', 5, 1, NOW()),
('b1c2d3e4-0001-4000-8000-000000000001', '29ee5caf-5658-483f-9162-5e1b7c696c7c', 'Rian Hidayat', '20200710099', 'active', 6, 1, NOW())
ON CONFLICT DO NOTHING;

-- Seed evaluations for stations 1..6 for session Sirkuit Alfa
DO $$
DECLARE
    v_session_id UUID := 'b1c2d3e4-0001-4000-8000-000000000001';
    v_stg RECORD;
    v_part RECORD;
    v_examiner_id UUID := '5d6ea61b-61fe-454e-979f-fbfbaf4065aa';
    v_idx INT := 0;
BEGIN
    FOR v_part IN SELECT id, user_id, full_name FROM osce.session_participants WHERE session_id = v_session_id LOOP
        v_idx := v_idx + 1;
        FOR v_stg IN SELECT id, station_number FROM osce.stations WHERE session_id = v_session_id AND is_break = FALSE LOOP
            INSERT INTO osce.examiner_evaluations (
                session_id, station_id, participant_id, examiner_id, rotation_round,
                grs_rating, examiner_notes, total_points_earned, max_points_possible, final_score_percentage, is_locked
            ) VALUES (
                v_session_id, v_stg.id, v_part.user_id, v_examiner_id, v_stg.station_number,
                CASE WHEN v_idx = 1 THEN 'SUPERIOR'::osce.grs_rating WHEN v_idx <= 4 THEN 'SATISFACTORY'::osce.grs_rating WHEN v_idx = 5 THEN 'BORDERLINE'::osce.grs_rating ELSE 'UNSATISFACTORY'::osce.grs_rating END,
                'Kinerja klinis dan komunikasi peserta sangat dinilai sistematis.',
                12 - (v_idx % 3), 13, GREATEST(60, 95.0 - (v_idx * 4) + (v_stg.station_number * 1.5)), TRUE
            ) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
