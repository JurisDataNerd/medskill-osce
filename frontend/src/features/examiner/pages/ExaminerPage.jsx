import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ClipboardList,
  CalendarDays,
  MapPinned,
} from "lucide-react";

import {
  getActiveSession,
  getStages,
} from "@/services/examiner.service";

export default function ExaminerPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [stages, setStages] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const activeSession = await getActiveSession();

      if (!activeSession) {
        setSession(null);
        setStages([]);
        return;
      }

      setSession(activeSession);

      const data = await getStages(activeSession.id);

      setStages(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  function handleChoose(stage) {
    navigate(`/examiner/stage/${stage.id}`);
  }

  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow">
        <ClipboardList
          className="mx-auto mb-6 text-slate-400"
          size={56}
        />

        <h2 className="text-3xl font-bold">
          Belum Ada Simulasi OSCE
        </h2>

        <p className="mt-3 text-slate-500">
          Admin belum menjalankan simulasi OSCE.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Dashboard Penguji
        </h1>

        <p className="mt-2 text-slate-500">
          Pilih stase yang akan Anda awasi selama simulasi berlangsung.
        </p>
      </div>

      <div className="mb-10 rounded-3xl bg-white p-8 shadow">
        <div className="flex items-center gap-5">
          <CalendarDays
            className="text-blue-600"
            size={44}
          />

          <div>
            <h2 className="text-2xl font-bold">
              {session.title}
            </h2>

            <div
              className={`mt-3 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                session.status === "running"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {session.status === "running"
                ? "🟢 Sedang Berlangsung"
                : "⏳ Menunggu Dimulai"}
            </div>
          </div>
        </div>
      </div>

      {stages.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow">
          Belum ada stase pada sesi ini.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="rounded-3xl border bg-white p-8 shadow transition hover:-translate-y-1 hover:border-blue-600"
            >
              <MapPinned
                className="mb-6 text-blue-600"
                size={42}
              />

              <h2 className="text-3xl font-bold">
                Stase {stage.station_number}
              </h2>

              <p className="mt-2 min-h-12 text-slate-500">
                {stage.title}
              </p>

              <button
                onClick={() => handleChoose(stage)}
                className="mt-8 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Ambil Stase
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}