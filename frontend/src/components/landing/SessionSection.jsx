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
      .eq("profile_id", session.user.id)
      .eq("role", "participant");

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

    await load();
  }

  function renderButton(session) {
    const status = registered[session.id];

    if (!status) {
      return (
        <button
          onClick={() => handleRegister(session.id)}
          className="mt-8 w-full rounded-xl bg-[#1E3A8A] py-3 font-semibold text-white transition hover:bg-blue-800"
        >
          Register
        </button>
      );
    }

    if (status === "pending") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-8 w-full rounded-xl bg-yellow-500 py-3 font-semibold text-white transition hover:bg-yellow-600"
        >
          Menunggu Persetujuan
        </button>
      );
    }

    if (status === "approved") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-8 w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Masuk
        </button>
      );
    }

    if (status === "assigned") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-8 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Masuk
        </button>
      );
    }

    if (status === "running") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-8 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Lanjutkan Ujian
        </button>
      );
    }

    if (status === "finished") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-8 w-full rounded-xl bg-slate-700 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Lihat Hasil
        </button>
      );
    }

    if (status === "rejected") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-8 w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
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
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
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

              <div className="mt-6 space-y-2 text-sm text-slate-600">
                <p>📅 {session.session_date}</p>
                <p>🕒 {session.start_time}</p>
                <p>👥 {session.max_participants} Peserta</p>
                <p>🏥 {session.total_stations} Stase</p>
                <p>
                  ⏱ {session.station_duration_minutes} Menit / Stase
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