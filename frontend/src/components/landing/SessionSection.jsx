import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase/client";
import { getOpenSessions } from "@/services/landing.service";

export default function SessionSection() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [registered, setRegistered] = useState({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const sessionData = await getOpenSessions();
    setSessions(sessionData ?? []);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const { data } = await supabase
      .from("osce_session_members")
      .select("session_id,status")
      .eq("profile_id", session.user.id);

    const map = {};

    (data ?? []).forEach((item) => {
      map[item.session_id] = item.status;
    });

    setRegistered(map);
  }

  async function handleRegister(sessionId) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/login");
      return;
    }

    const { error } = await supabase
      .from("osce_session_members")
      .insert({
        session_id: sessionId,
        profile_id: session.user.id,
        role: "participant",
        status: "pending",
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Pendaftaran berhasil.");

    load();
  }

  function renderButton(session) {
    const status = registered[session.id];

    if (!status) {
      return (
        <button
          onClick={() => handleRegister(session.id)}
          className="mt-8 w-full rounded-xl bg-[#1E3A8A] py-3 font-semibold text-white"
        >
          Register
        </button>
      );
    }

    if (status === "pending") {
      return (
        <button
          disabled
          className="mt-8 w-full cursor-not-allowed rounded-xl bg-yellow-500 py-3 text-white"
        >
          Menunggu Persetujuan
        </button>
      );
    }

    if (status === "approved") {
      return (
        <button
          onClick={() =>
            navigate(`/participant/session/${session.id}`)
          }
          className="mt-8 w-full rounded-xl bg-green-600 py-3 text-white"
        >
          Masuk Ujian
        </button>
      );
    }

    if (status === "rejected") {
      return (
        <button
          disabled
          className="mt-8 w-full cursor-not-allowed rounded-xl bg-red-600 py-3 text-white"
        >
          Ditolak
        </button>
      );
    }

    return null;
  }

  return (
    <section
      id="sessions"
      className="mx-auto max-w-7xl px-8 py-24"
    >
      <h2 className="mb-12 text-4xl font-bold">
        Upcoming Sessions
      </h2>

      {sessions.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          Belum ada sesi OSCE.
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl bg-white p-8 shadow"
            >
              <h3 className="text-2xl font-bold">
                {session.title}
              </h3>

              <p className="mt-3 text-slate-500">
                {session.description}
              </p>

              <div className="mt-6 space-y-2 text-sm">
                <p>📅 {session.session_date}</p>
                <p>🕒 {session.start_time}</p>
                <p>👥 {session.max_participants} Seats</p>
                <p>🏥 {session.total_stations} Stations</p>
                <p>
                  ⏱ {session.station_duration_minutes} Minutes / Station
                </p>
              </div>

              {renderButton(session)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}