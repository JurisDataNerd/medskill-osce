import { supabase } from "@/lib/supabaseClient";

export async function getSessions() {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSessionById(id) {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSession(payload) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;

  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .insert({
      ...payload,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSession(id, payload) {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSession(id) {
  const { error } = await supabase
    .schema("osce")
    .from("sessions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function startSession(id) {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .update({
      status: "ongoing",
      started_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function finishSession(id) {
  const { data, error } = await supabase
    .schema("osce")
    .from("sessions")
    .update({
      status: "completed",
      finished_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionParticipants(sessionId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_participants")
    .select("*")
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error fetching session participants from Supabase:", error);
    return [];
  }

  return (data || []).map((p, idx) => {
    let normStatus = (p.status || "pending").toLowerCase();
    if (normStatus === "active") normStatus = "approved";
    if (normStatus === "absent") normStatus = "rejected";

    return {
      id: p.id,
      session_id: p.session_id,
      user_id: p.user_id,
      full_name: p.full_name || "Tidak ada data",
      nim: p.nim || "-",
      email: p.email || "-",
      station_number: p.starting_station_number || ((idx % 6) + 1),
      participant_order: p.starting_station_number || idx + 1,
      status: normStatus,
      created_at: p.created_at,
      profiles: {
        full_name: p.full_name || "Tidak ada data",
        email: p.email || "-",
        is_online: true,
      },
    };
  });
}

export async function registerParticipantToSession(sessionId, userOverride = null) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const targetUser = user || userOverride;
  if (!targetUser) {
    throw new Error("Anda harus terotentikasi (login) terlebih dahulu untuk mendaftar sesi ujian.");
  }

  let fullName =
    targetUser.user_metadata?.full_name ||
    targetUser.user_metadata?.name ||
    targetUser.email ||
    "Tidak ada data";
  let nim = targetUser.user_metadata?.nim || "-";
  let email = targetUser.email || "-";

  try {
    const { data: prof } = await supabase
      .schema("public")
      .from("profiles")
      .select("full_name, nim, email")
      .eq("id", targetUser.id)
      .maybeSingle();

    if (prof) {
      if (prof.full_name) fullName = prof.full_name;
      if (prof.nim) nim = prof.nim;
      if (prof.email) email = prof.email;
    }
  } catch (e) {}

  const payload = {
    session_id: sessionId,
    user_id: targetUser.id,
    full_name: fullName,
    nim: nim,
    status: "pending",
    starting_station_number: 1,
  };

  const { data, error } = await supabase
    .schema("osce")
    .from("session_participants")
    .upsert([payload], { onConflict: "session_id,user_id" })
    .select()
    .single();

  if (error) {
    console.error("Error inserting session_participant into Supabase DB:", error);
    throw error;
  }

  return data;
}

export async function approveParticipant(participantId, stationNumber = 1, sessionId = null) {
  let query = supabase.schema("osce").from("session_participants").update({
    status: "approved",
    starting_station_number: stationNumber,
  });

  if (participantId && !participantId.toString().startsWith("sp-")) {
    query = query.eq("id", participantId);
  } else if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query.select();
  if (error) {
    console.error("Error approving participant in DB:", error);
    throw error;
  }
  return data;
}

export async function rejectParticipant(participantId, sessionId = null) {
  let query = supabase.schema("osce").from("session_participants").update({
    status: "rejected",
  });

  if (participantId && !participantId.toString().startsWith("sp-")) {
    query = query.eq("id", participantId);
  } else if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query.select();
  if (error) {
    console.error("Error rejecting participant in DB:", error);
    throw error;
  }
  return data;
}

export async function randomizeStationMapping(sessionId, totalStations = 6) {
  if (!sessionId) return [];

  const { data: rawParticipants, error } = await supabase
    .schema("osce")
    .from("session_participants")
    .select("id, status, full_name, email")
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error fetching participants for randomize mapping:", error);
    throw error;
  }

  if (!rawParticipants || rawParticipants.length === 0) return [];

  // Filter approved or active participants for randomized station rotation
  const approvedList = rawParticipants.filter(
    (p) => (p.status || "").toLowerCase() === "approved" || (p.status || "").toLowerCase() === "active"
  );
  const targetList = approvedList.length > 0 ? approvedList : rawParticipants;

  // Fisher-Yates Shuffle algorithm
  const shuffled = [...targetList];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Balanced station assignment (1..totalStations round-robin)
  const updatePromises = shuffled.map((p, idx) => {
    const assignedStation = (idx % totalStations) + 1;
    return supabase
      .schema("osce")
      .from("session_participants")
      .update({
        starting_station_number: assignedStation,
        status: "approved",
      })
      .eq("id", p.id);
  });

  await Promise.all(updatePromises);
  return getSessionParticipants(sessionId);
}

export async function getSessionExaminers(sessionId) {
  const { data, error } = await supabase
    .schema("osce")
    .from("session_examiners")
    .select("*")
    .eq("session_id", sessionId)
    .order("assigned_station_number");

  if (error) {
    console.error(error);
    throw error;
  }

  return (data || []).map((e) => ({
    id: e.id,
    station_number: e.assigned_station_number,
    status: e.status || "active",
    profiles: {
      full_name: e.full_name,
      email: e.email || `${e.full_name.toLowerCase().replace(/\s+/g, ".")}@medskill.ac.id`,
      is_online: true,
    },
  }));
}

export async function getAllParticipants() {
  const { data: sessionParticipants, error } = await supabase
    .schema("osce")
    .from("session_participants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching session participants from Supabase:", error);
    return [];
  }

  return (sessionParticipants || []).map((p) => ({
    id: p.id,
    session_id: p.session_id,
    user_id: p.user_id,
    full_name: p.full_name || "Tidak ada data",
    nim: p.nim || "-",
    email: p.email || "-",
    station_number: p.starting_station_number || 1,
    participant_order: p.starting_station_number || 1,
    status: (p.status || "pending").toLowerCase(),
    profiles: {
      full_name: p.full_name || "Tidak ada data",
      email: p.email || "-",
      is_online: true,
    },
  }));
}

/**
 * Fetch all participants aggregated with their REAL OSCE session history & score transcript from Supabase
 */
export async function getParticipantsWithHistory() {
  try {
    // 1. Fetch all registered session_participants
    const { data: participantsRaw, error: pErr } = await supabase
      .schema("osce")
      .from("session_participants")
      .select("*")
      .order("created_at", { ascending: false });

    if (pErr) {
      console.error("Error fetching session_participants from Supabase:", pErr);
    }

    // 2. Fetch all public.profiles to enrich student names/emails
    const { data: profilesRaw } = await supabase
      .from("profiles")
      .select("*");

    // 3. Fetch all sessions
    const { data: sessionsRaw } = await supabase
      .schema("osce")
      .from("sessions")
      .select("*");

    // 4. Fetch all examiner_evaluations
    const { data: evalsRaw } = await supabase
      .schema("osce")
      .from("examiner_evaluations")
      .select("*");

    // 5. Fetch all stations
    const { data: stationsRaw } = await supabase
      .schema("osce")
      .from("stations")
      .select("*");

    const sessionsMap = new Map((sessionsRaw || []).map((s) => [s.id, s]));
    const stationsMap = new Map((stationsRaw || []).map((st) => [st.id, st]));
    const profilesMap = new Map((profilesRaw || []).map((pr) => [pr.id, pr]));

    // Group participants by user_id or nim or email or id
    const participantGroupMap = new Map();

    (participantsRaw || []).forEach((p) => {
      const key = p.user_id || p.nim || p.email || p.id;
      const profileObj = p.user_id ? profilesMap.get(p.user_id) : null;
      
      const fullName = p.full_name || profileObj?.full_name || "Tidak ada data";
      const email = p.email || profileObj?.email || "-";

      if (!participantGroupMap.has(key)) {
        participantGroupMap.set(key, {
          id: p.id,
          user_id: p.user_id,
          full_name: fullName,
          nim: p.nim || "-",
          email: email,
          status: (p.status || "approved").toLowerCase(),
          raw_registrations: [],
        });
      }
      participantGroupMap.get(key).raw_registrations.push(p);
    });

    const result = [];

    for (const [key, partData] of participantGroupMap.entries()) {
      const userRegs = partData.raw_registrations;
      const userSessions = [];

      userRegs.forEach((reg) => {
        const sessionObj = sessionsMap.get(reg.session_id);
        if (sessionObj) {
          // Find real evaluations for this participant & session
          const userEvals = (evalsRaw || []).filter(
            (ev) =>
              ev.session_id === sessionObj.id &&
              (ev.participant_id === partData.id ||
                ev.participant_id === partData.user_id ||
                ev.participant_id === reg.id ||
                ev.participant_id === reg.user_id)
          );

          let totalScoreSum = 0;
          const stationsList = [];

          if (userEvals.length > 0) {
            userEvals.forEach((ev) => {
              const stObj = stationsMap.get(ev.station_id);
              const scoreVal = Number(ev.final_score_percentage) || 0;
              totalScoreSum += scoreVal;

              stationsList.push({
                station_id: ev.station_id,
                station_number: stObj?.station_number || stationsList.length + 1,
                title: stObj?.title || stObj?.case_title || `Stase Ujian ${stationsList.length + 1}`,
                system_organ: stObj?.system_organ || "Umum",
                score: scoreVal,
                grs_rating: ev.grs_rating || "Belum Rating",
                examiner_name: "Dokter Penguji",
                examiner_notes: ev.examiner_notes || "Belum ada catatan.",
              });
            });

            const sessionAvgScore = Math.round((totalScoreSum / userEvals.length) * 10) / 10;
            const nbl = Number(sessionObj.nbl_cutoff) || 70;

            userSessions.push({
              session_id: sessionObj.id,
              session_title: sessionObj.title,
              session_date: sessionObj.session_date || "Tanggal Ujian",
              location: sessionObj.location_building || "Gedung Skill Lab FK",
              total_stations: sessionObj.total_stations || stationsList.length || 6,
              nbl_cutoff: nbl,
              total_score: sessionAvgScore,
              is_passed: sessionAvgScore >= nbl,
              has_evaluations: true,
              stations: stationsList,
            });
          } else {
            // Registered but no evaluations submitted yet in Supabase
            const nbl = Number(sessionObj.nbl_cutoff) || 70;
            // Get stations of this session from DB
            const sessionStationsFromDb = (stationsRaw || []).filter((st) => st.session_id === sessionObj.id);

            userSessions.push({
              session_id: sessionObj.id,
              session_title: sessionObj.title,
              session_date: sessionObj.session_date || "-",
              location: sessionObj.location_building || "Gedung Skill Lab FK",
              total_stations: sessionObj.total_stations || sessionStationsFromDb.length || 0,
              nbl_cutoff: nbl,
              total_score: 0,
              is_passed: false,
              has_evaluations: false,
              stations: sessionStationsFromDb.map((st) => ({
                station_id: st.id,
                station_number: st.station_number,
                title: st.title || st.case_title || `Stase ${st.station_number}`,
                system_organ: st.system_organ || "Umum",
                score: 0,
                grs_rating: "Belum Dinilai",
                examiner_name: "Dokter Penguji",
                examiner_notes: "Belum ada penilaian evaluasi dari penguji.",
              })),
            });
          }
        }
      });

      // Calculate real overall stats
      const evaluatedSessions = userSessions.filter((s) => s.has_evaluations);
      const totalScoreSum = evaluatedSessions.reduce((acc, s) => acc + s.total_score, 0);
      const avgScore = evaluatedSessions.length > 0 ? Math.round((totalScoreSum / evaluatedSessions.length) * 10) / 10 : 0;
      const passedCount = evaluatedSessions.filter((s) => s.is_passed).length;

      result.push({
        ...partData,
        overall_avg_score: avgScore,
        total_sessions: userSessions.length,
        evaluated_sessions_count: evaluatedSessions.length,
        passed_count: passedCount,
        remedial_count: evaluatedSessions.length - passedCount,
        overall_status: evaluatedSessions.length === 0 ? "BELUM ADA EVALUASI" : (avgScore >= 70 ? "LULUS" : "REMIDI"),
        sessions_taken: userSessions,
      });
    }

    return result;
  } catch (err) {
    console.error("Error fetching participants with history from Supabase:", err);
    return [];
  }
}

/**
 * Fetch detailed participant transcript record by ID, user_id, or NIM
 */
export async function getParticipantDetailById(id) {
  try {
    const all = await getParticipantsWithHistory();
    if (!all || all.length === 0) return null;

    const found = all.find(
      (p) => String(p.id) === String(id) || String(p.user_id) === String(id) || String(p.nim) === String(id)
    );

    return found || null;
  } catch (err) {
    console.error("Error fetching participant detail by id:", err);
    return null;
  }
}