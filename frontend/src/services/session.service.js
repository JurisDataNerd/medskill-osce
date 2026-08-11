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
      full_name: p.full_name || "Peserta Ujian",
      nim: p.nim || "-",
      email: p.email || (p.nim ? `${p.nim}@student.medskill.ac.id` : "-"),
      station_number: p.starting_station_number || ((idx % 6) + 1),
      participant_order: p.starting_station_number || idx + 1,
      status: normStatus,
      created_at: p.created_at,
      profiles: {
        full_name: p.full_name || "Peserta Ujian",
        email: p.email || (p.nim ? `${p.nim}@student.medskill.ac.id` : "-"),
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
    targetUser.email?.split("@")[0] ||
    "Peserta Ujian";
  let nim = targetUser.user_metadata?.nim || targetUser.email?.split("@")[0] || "20200710042";
  let email = targetUser.email || `${nim}@student.medskill.ac.id`;

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
    full_name: p.full_name,
    nim: p.nim || "-",
    email: p.email || (p.nim ? `${p.nim}@student.medskill.ac.id` : "-"),
    station_number: p.starting_station_number || 1,
    participant_order: p.starting_station_number || 1,
    status: (p.status || "pending").toLowerCase(),
    profiles: {
      full_name: p.full_name,
      email: p.email || (p.nim ? `${p.nim}@student.medskill.ac.id` : "-"),
      is_online: true,
    },
  }));
}