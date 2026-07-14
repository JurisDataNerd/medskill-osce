import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Play,
  Users,
  GraduationCap,
  Square,
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import SessionModal from "@/features/admin/components/SessionModal";

import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  startSession,
  finishSession,
} from "@/services/session.service";

export default function SessionsPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  async function loadSessions() {
    const data = await getSessions();
    setSessions(data);
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleSave(payload) {
  try {
    if (selected) {
      await updateSession(selected.id, payload);
    } else {
      await createSession(payload);
    }

    setOpen(false);
    setSelected(null);

    await loadSessions();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}
  async function handleDelete(id) {
    if (!confirm("Hapus session ini?")) return;

    await deleteSession(id);

    loadSessions();
  }

  async function handleStart(id) {
    await startSession(id);
    loadSessions();
  }

  async function handleFinish(id) {
    await finishSession(id);
    loadSessions();
  }

  return (
    <AdminLayout>

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Sessions
          </h1>

          <p className="text-slate-500">
            Manage OSCE Sessions
          </p>

        </div>

        <button
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white"
        >
          <Plus size={18} />
          New Session
        </button>

      </div>

      <div className="space-y-6">

        {sessions.length === 0 && (
          <div className="rounded-2xl bg-white p-8 shadow">
            Belum ada session.
          </div>
        )}

        {sessions.map((session) => (

          <div
            key={session.id}
            className="rounded-2xl bg-white p-6 shadow"
          >

            <div className="flex justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  {session.title}
                </h2>

                <p className="mt-2 text-slate-500">
                  {session.description}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-5 text-sm">

                  <Info
                    label="Date"
                    value={session.session_date ?? "-"}
                  />

                  <Info
                    label="Start"
                    value={session.start_time ?? "-"}
                  />

                  <Info
                    label="Status"
                    value={session.status}
                  />

                  <Info
                    label="Stations"
                    value={session.total_stations}
                  />

                  <Info
                    label="Duration"
                    value={`${session.station_duration_minutes} min`}
                  />

                  <Info
                    label="Participants"
                    value={session.max_participants}
                  />

                </div>

              </div>

              <div className="flex flex-col gap-2">

                <button
                  onClick={() => {
                    setSelected(session);
                    setOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2"
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/admin/sessions/${session.id}/participants`
                    )
                  }
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                  <Users size={16} />
                  Participants
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/admin/sessions/${session.id}/mentors`
                    )
                  }
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white"
                >
                  <GraduationCap size={16} />
                  Mentors
                </button>

                {session.status === "draft" && (

                  <button
                    onClick={() => handleStart(session.id)}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white"
                  >
                    <Play size={16} />
                    Start
                  </button>

                )}

                {session.status === "running" && (

                  <button
                    onClick={() => handleFinish(session.id)}
                    className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white"
                  >
                    <Square size={16} />
                    Finish
                  </button>

                )}

                <button
                  onClick={() => handleDelete(session.id)}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white"
                >
                  <Trash2 size={16} />
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      <SessionModal
        open={open}
        initialData={selected}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
        onSave={handleSave}
      />

    </AdminLayout>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border p-3">

      <p className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>

    </div>
  );
}