import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Pencil,
  Plus,
  Trash2,
  Users,
  Play,
  Square,
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import SessionModal from "@/features/admin/components/SessionModal";

import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  finishSession,
} from "@/services/session.service";

import { startSimulation } from "@/services/simulation.service";

export default function SessionsPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setLoading(true);

      const data = await getSessions();

      setSessions(data ?? []);
    } catch (err) {
      console.error(err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setSelectedSession(null);
    setOpenModal(true);
  }

  function handleEdit(session) {
    setSelectedSession(session);
    setOpenModal(true);
  }

  async function handleSave(payload) {
    try {
      if (selectedSession) {
        await updateSession(selectedSession.id, payload);
      } else {
        await createSession(payload);
      }

      setOpenModal(false);
      setSelectedSession(null);

      await loadSessions();

      alert(
        selectedSession
          ? "Sesi berhasil diperbarui."
          : "Sesi berhasil ditambahkan."
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    const ok = confirm(
      "Yakin ingin menghapus sesi ini?\n\nSemua stase, soal, peserta, dan jawaban juga akan ikut terhapus."
    );

    if (!ok) return;

    try {
      await deleteSession(id);

      await loadSessions();

      alert("Sesi berhasil dihapus.");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  async function handleStart(id) {
    try {
      await startSimulation(id);

      await loadSessions();

      alert("Simulasi berhasil dimulai.");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  async function handleFinish(id) {
    try {
      await finishSession(id);

      await loadSessions();

      alert("Simulasi selesai.");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[500px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SessionModal
        open={openModal}
        initialData={selectedSession}
        onClose={() => {
          setOpenModal(false);
          setSelectedSession(null);
        }}
        onSave={handleSave}
      />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Sesi Simulasi OSCE
          </h1>

          <p className="mt-2 text-slate-500">
            Kelola seluruh sesi simulasi OSCE.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Tambah Sesi
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow">
          <p className="text-slate-500">
            Belum ada sesi simulasi.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
                    {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl bg-white p-6 shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {session.title}
                  </h2>

                  <p className="mt-2 text-slate-500">
                    {session.description}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    session.status === "running"
                      ? "bg-green-100 text-green-700"
                      : session.status === "finished"
                      ? "bg-slate-200 text-slate-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {session.status}
                </span>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarDays size={17} />
                  {session.session_date}
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={17} />
                  {session.station_duration_minutes} menit / stase
                </div>

                <div className="flex items-center gap-2">
                  <Users size={17} />
                  {session.max_participants} peserta
                </div>

                <div className="flex items-center gap-2">
                  🏥 {session.total_stations} stase
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">

                {session.status === "draft" && (
                  <>
                    <button
                      onClick={() => handleEdit(session)}
                      className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleStart(session.id)}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
                    >
                      <Play size={16} />
                      Start
                    </button>

                    <button
                      onClick={() => handleDelete(session.id)}
                      className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </>
                )}

                {session.status === "running" && (
                  <button
                    onClick={() => handleFinish(session.id)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                  >
                    <Square size={16} />
                    Finish
                  </button>
                )}

                {session.status === "finished" && (
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}

                <button
                  onClick={() =>
                    navigate(`/admin/sessions/${session.id}`)
                  }
                  className="ml-auto flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Detail
                  <ArrowRight size={16} />
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}