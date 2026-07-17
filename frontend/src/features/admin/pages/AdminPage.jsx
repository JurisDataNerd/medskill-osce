import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import {
  Users,
  UserCheck,
  GraduationCap,
  Building2,
  Activity,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { getDashboardStats, subscribeLive } from "@/services/live.service";

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const channel = subscribeLive(load);

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const session = stats?.activeSession ?? null;

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">MedSkill OSCE Control Room</p>
        </div>

        <button
          onClick={() => navigate("/admin/sessions")}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700"
        >
          Kelola Sesi
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-white shadow"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <StatCard
            title="Peserta"
            value={stats?.participants ?? 0}
            icon={<Users size={22} />}
            color="blue"
          />
          <StatCard
            title="Penguji"
            value={stats?.examiners ?? 0}
            icon={<UserCheck size={22} />}
            color="violet"
          />
          <StatCard
            title="Mentor"
            value={stats?.mentors ?? 0}
            icon={<GraduationCap size={22} />}
            color="emerald"
          />
          <StatCard
            title="Sesi OSCE"
            value={stats?.sessions ?? 0}
            icon={<Building2 size={22} />}
            color="amber"
          />
        </div>
      )}

      {/* Bottom Grid */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        {/* Live Activity */}
        <div className="col-span-2 rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              Live Activity
            </h2>

            <button
              onClick={() => navigate("/admin/live")}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
            >
              Lihat Monitor
              <ArrowRight size={14} />
            </button>
          </div>

          {!session ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-100 text-center">
              <Activity size={30} className="mb-2 text-slate-300" />
              <p className="text-slate-400">Belum ada sesi yang berjalan.</p>
              <p className="text-sm text-slate-300">
                Mulai sesi dari halaman Sessions.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <p className="font-semibold text-emerald-700">
                  Sesi Sedang Berlangsung
                </p>
              </div>

              <p className="text-lg font-bold text-slate-800">
                {session.title}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <InfoChip
                  label="Total Station"
                  value={session.total_stations}
                />
                <InfoChip
                  label="Durasi/Station"
                  value={`${session.station_duration_minutes} menit`}
                />
              </div>

              <button
                onClick={() => navigate("/admin/live")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 font-medium text-white transition hover:bg-emerald-700"
              >
                <Activity size={16} />
                Buka Live Monitor
              </button>
            </div>
          )}
        </div>

        {/* Session Status */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            Status Sesi
          </h2>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 size={24} className="animate-spin text-slate-300" />
            </div>
          ) : (
            <div className="space-y-3">
              <StatusRow
                label="Status"
                value={session ? "Running" : "Idle"}
                highlight={!!session}
              />
              <StatusRow
                label="Sesi Aktif"
                value={session?.title ?? "-"}
              />
              <StatusRow
                label="Jumlah Station"
                value={session ? String(session.total_stations) : "-"}
              />
              <StatusRow
                label="Mulai"
                value={
                  session?.started_at
                    ? new Date(session.started_at).toLocaleTimeString(
                        "id-ID",
                        { hour: "2-digit", minute: "2-digit" }
                      )
                    : "-"
                }
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-600",
    violet: "bg-violet-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow transition hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${colors[color]}`}
        >
          {icon}
        </div>
        <span className="text-3xl font-bold text-slate-800">{value}</span>
      </div>
      <p className="text-sm text-slate-500">{title}</p>
    </div>
  );
}

function StatusRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-sm font-semibold ${
          highlight ? "text-emerald-600" : "text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-700">{value}</p>
    </div>
  );
}