import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchSessionById } from "@/services/sessionService";

export function useParticipantSessionData(sessionId, currentRound) {
  const [sessionDetail, setSessionDetail] = useState(null);
  const [dbStations, setDbStations] = useState([]);
  const [dbExaminers, setDbExaminers] = useState([]);
  const [myStartingStation, setMyStartingStation] = useState(1);

  // Customisable Durations (in seconds)
  const [stationDurationSeconds, setStationDurationSeconds] = useState(15 * 60);
  const [transitDurationSeconds, setTransitDurationSeconds] = useState(2 * 60);
  const [breakDurationSeconds, setBreakDurationSeconds] = useState(10 * 60);

  useEffect(() => {
    async function loadSessionData() {
      if (!sessionId) return;
      try {
        const data = await fetchSessionById(sessionId);
        if (data) {
          setSessionDetail(data);
          if (data.station_duration_minutes) {
            setStationDurationSeconds(data.station_duration_minutes * 60);
          }
          if (data.break_duration_minutes) {
            setBreakDurationSeconds(data.break_duration_minutes * 60);
          }
          if (data.transition_duration_minutes) {
            setTransitDurationSeconds(data.transition_duration_minutes * 60);
          }
        }

        const [
          { data: stData },
          { data: exData },
          { data: { user } },
        ] = await Promise.all([
          supabase
            .schema("osce")
            .from("stations")
            .select(`
              *,
              station_auxiliary_configs (*)
            `)
            .eq("session_id", sessionId)
            .order("station_number", { ascending: true }),
          supabase
            .schema("osce")
            .from("session_examiners")
            .select("*")
            .eq("session_id", sessionId),
          supabase.auth.getUser(),
        ]);

        if (stData) setDbStations(stData);
        if (exData) setDbExaminers(exData);

        if (user) {
          const { data: partData } = await supabase
            .schema("osce")
            .from("session_participants")
            .select("starting_station_number")
            .eq("session_id", sessionId)
            .or(`user_id.eq.${user.id},email.eq.${user.email}`)
            .maybeSingle();

          if (partData?.starting_station_number) {
            setMyStartingStation(Number(partData.starting_station_number));
          }
        }
      } catch (err) {
        console.warn("Using default candidate schedule data:", err);
      }
    }
    loadSessionData();
  }, [sessionId]);

  const totalRoundsInSession = useMemo(() => {
    return sessionDetail?.total_stations || sessionDetail?.total_rounds || dbStations?.length || 4;
  }, [sessionDetail, dbStations]);

  const totalStations = sessionDetail?.total_stations || dbStations?.length || 6;

  const currentStationNum = useMemo(() => {
    return ((myStartingStation - 1 + (currentRound - 1)) % totalStations) + 1;
  }, [myStartingStation, currentRound, totalStations]);

  const activeStationInfo = useMemo(() => {
    const st = dbStations.find((s) => Number(s.station_number) === currentStationNum);
    const ex = dbExaminers.find((e) => Number(e.assigned_station_number) === currentStationNum);

    const is_break = Boolean(
      st?.is_break ||
      st?.title?.toLowerCase().includes("istirahat") ||
      st?.title?.toLowerCase().includes("break") ||
      st?.case_title?.toLowerCase().includes("istirahat")
    );

    const defaultScenario = "Seorang laki-laki berusia 54 tahun datang ke UGD dengan keluhan nyeri dada kiri hebat seperti ditindih beban berat sejak 2 jam lalu. Nyeri menjalar ke lengan kiri dan leher, disertai keringat dingin dan mual.";
    const defaultInstructions = [
      "Lakukan anamnesis terarah mengenai keluhan utama nyeri dada.",
      "Lakukan pemeriksaan fisik kardiovaskular secara terstruktur.",
      "Tentukan indikasi & mintalah pemeriksaan penunjang yang relevan.",
      "Tegakkan Diagnosis Kerja (WDx), 3 Diagnosis Banding (DDx), dan tuliskan Blangko Resep Medis."
    ];

    const title = st?.title || (is_break ? `Stase ${currentStationNum}: Istirahat` : `Stase ${currentStationNum}: Klinis Terpadu`);
    const case_title = st?.case_title || (is_break ? "Stase Istirahat Sirkuit" : "Evaluasi Skenario SKDI");
    const scenario = is_break
      ? "Anda sedang berada di Stase Istirahat. Silakan gunakan waktu ini untuk memulihkan stamina sebelum menghadapi stase pengujian berikutnya."
      : (st?.scenario || defaultScenario);
    const instructions = is_break
      ? [
          "1. Ini adalah Stase Istirahat (Rest Station). Tidak ada pengujian keterampilan atau pengisian formulir pada stase ini.",
          "2. Tetap berada di area stase istirahat hingga timer countdown selesai dan bel rotasi berbunyi.",
          "3. Dilarang meninggalkan area sirkuit OSCE tanpa seijin panitia."
        ]
      : (st?.participant_instructions || defaultInstructions);

    return {
      station_number: currentStationNum,
      is_break,
      title,
      case_title,
      scenario,
      participant_instructions: Array.isArray(instructions) ? instructions : [instructions],
      examiner_name: is_break ? "Stase Istirahat (Tanpa Penguji)" : (ex?.full_name ? (ex.specialty ? `${ex.full_name}, ${ex.specialty}` : ex.full_name) : "Tidak ada data"),
      location: sessionDetail?.location_building || `Gedung Skill Lab Ruang 10${currentStationNum}`,
      auxiliary_configs: st?.station_auxiliary_configs || [],
    };
  }, [dbStations, dbExaminers, currentStationNum, sessionDetail]);

  return {
    sessionDetail,
    setSessionDetail,
    dbStations,
    dbExaminers,
    myStartingStation,
    stationDurationSeconds,
    transitDurationSeconds,
    breakDurationSeconds,
    totalRoundsInSession,
    totalStations,
    currentStationNum,
    activeStationInfo,
  };
}
