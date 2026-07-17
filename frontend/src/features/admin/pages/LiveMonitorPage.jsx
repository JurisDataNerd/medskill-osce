import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { getLiveStations, subscribeLive } from "@/services/live.service";
import { Activity, Clock, User, UserCheck } from "lucide-react";

// Status config
const STATUS_CONFIG = {
  running: {
    label: "Running",
    dot: "🟢",
    bg: "bg-emerald-50 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    glow: "shadow-emerald-100",
  },
  waiting: {
    label: "Waiting",
    dot: "🟡",
    bg: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    glow: "shadow-amber-100",
  },
  finished: {
    label: "Finished",
    dot: "🔵",
    bg: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    glow: "shadow-blue-100",
  },
};

// Hook untuk countdown per-station (hitung durasi berjalan)
function useElapsed(sessionStartedAt) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!sessionStartedAt) return;

    const start = new Date(sessionStartedAt).getTime();

    function tick() {
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionStartedAt]);

  return elapsed;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function StationCard({ station, sessionStartedAt }) {
  const cfg = STATUS_CONFIG[station.status] ?? STATUS_CONFIG.waiting;

  const elapsed = useElapsed(
    station.status === "running" ? sessionStartedAt : null
  );

  const assignment = station.assignment;

  return (
    <div
      className={`rounded-2xl border-2 p-6 shadow-lg transition-all ${cfg.bg} ${cfg.glow}`}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Stase {station.station_number}
        </h2>

        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${cfg.badge}`}
        >
          {cfg.dot} {cfg.label}
        </span>
      </div>

      {/* Penguji */}
      <div className="mb-4 flex items-center gap-3">

        <img
          src={
            assignment?.mentor?.img_url ??
            "https://ui-avatars.com/api/?name=Penguji"
          }
          className="h-12 w-12 rounded-full object-cover"
        />

        <div>

          <p className="text-xs text-slate-400">
            Penguji
          </p>

          <p className="font-semibold">
            {assignment?.mentor?.name ?? "-"}
          </p>

        </div>

      </div>

      {/* Peserta */}
      <div className="mb-5 flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <User size={18} />
        </div>

        <div>

          <p className="text-xs text-slate-400">
            Peserta
          </p>

          <p className="font-semibold">
            {station.participant?.full_name ?? "-"}
          </p>

        </div>

      </div>

      {/* Timer */}
      <div className="rounded-xl bg-white p-4">

        {station.status === "running" ? (
          <>
            <p className="mb-1 text-xs uppercase text-slate-400">
              Waktu Berjalan
            </p>

            <div className="font-mono text-3xl font-bold text-emerald-600">
              {formatTime(elapsed)}
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.min(
                    (elapsed / (station.duration_minutes * 60)) * 100,
                    100
                  )}%`,
                }}
              />

            </div>

            <p className="mt-2 text-xs text-slate-500">
              Durasi {station.duration_minutes} menit
            </p>
          </>
        ) : station.status === "waiting" ? (
          <div className="text-sm text-slate-500">
            Menunggu peserta masuk...
          </div>
        ) : (
          <div className="font-semibold text-blue-600">
            ✓ Penilaian selesai
          </div>
        )}

      </div>
    </div>
  );
}

export default function LiveMonitorPage() {
  const [session, setSession] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  async function load() {
    try {
      const result = await getLiveStations();
      setSession(result.session);
      setStations(result.stations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    channelRef.current = subscribeLive(load);

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, []);

  const runningCount = stations.filter((s) => s.status === "running").length;
  const waitingCount = stations.filter((s) => s.status === "waiting").length;
  const finishedCount = stations.filter((s) => s.status === "finished").length;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <Activity size={20} className="text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Live Monitor
            </h1>
            <p className="text-slate-500">
              {session
                ? `Sesi aktif: ${session.title ?? "Running"}`
                : "Tidak ada sesi yang sedang berlangsung"}
            </p>
          </div>

          {/* Realtime indicator */}
          <div className="ml-auto flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-emerald-700">
              Realtime
            </span>
          </div>
        </div>

        {/* Summary pills */}
        {session && (
          <div className="mt-5 flex gap-3">
            <Pill color="emerald" count={runningCount} label="Running" />
            <Pill color="amber" count={waitingCount} label="Waiting" />
            <Pill color="blue" count={finishedCount} label="Finished" />
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : !session ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center">
          <Activity size={40} className="mb-3 text-slate-300" />
          <p className="text-lg font-semibold text-slate-400">
            Tidak ada sesi berlangsung
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Mulai sesi OSCE dari halaman Sessions untuk melihat monitor live.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stations.map((station) => (
            <StationCard
              key={station.station_number}
              station={station}
              sessionStartedAt={session.started_at}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function Pill({ color, count, label }) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div
      className={`rounded-full px-4 py-1.5 text-sm font-semibold ${colors[color]}`}
    >
      {count} {label}
    </div>
  );
}