import { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { supabase } from "@/supabase/client";
import { Clock, Users } from "lucide-react";
import {
  getAllParticipants,
  approveParticipant,
  rejectParticipant,
} from "@/services/session.service";

function formatLastSeen(lastSeen) {
  if (!lastSeen) return "Belum pernah login";

  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7)
    return date.toLocaleString("id-ID", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("participants-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "osce_session_members",
        },
        () => load()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function load() {
    try {
      const data = await getAllParticipants();
      setParticipants(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    await approveParticipant(id);
    load();
  }

  async function handleReject(id) {
    await rejectParticipant(id);
    load();
  }

  const pending = participants.filter((p) => p.status === "pending").length;
  const approved = participants.filter((p) => p.status === "approved").length;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Registrasi Peserta
          </h1>
          <p className="text-slate-500">
            Approve peserta yang mendaftar ke Sesi OSCE.
          </p>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3">
          <div className="rounded-xl bg-slate-50 px-5 py-3 text-center">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-2xl font-bold text-slate-700">
              {participants.length}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50 px-5 py-3 text-center">
            <p className="text-xs text-amber-500">Menunggu</p>
            <p className="text-2xl font-bold text-amber-600">{pending}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-5 py-3 text-center">
            <p className="text-xs text-emerald-500">Approved</p>
            <p className="text-2xl font-bold text-emerald-600">{approved}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-slate-600">
                Peserta
              </th>
              <th className="p-4 text-left text-sm font-semibold text-slate-600">
                Sesi
              </th>
              <th className="p-4 text-left text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} />
                  Last Seen
                </div>
              </th>
              <th className="p-4 text-center text-sm font-semibold text-slate-600">
                Status
              </th>
              <th className="p-4 text-center text-sm font-semibold text-slate-600">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    Memuat data...
                  </div>
                </td>
              </tr>
            )}

            {!loading && participants.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <Users size={36} className="mx-auto mb-3 text-slate-200" />
                  <p className="font-medium text-slate-400">
                    Belum ada pendaftar.
                  </p>
                </td>
              </tr>
            )}

            {participants.map((item) => {
              const isOnline = item.profiles?.is_online;
              const lastSeen = item.profiles?.last_seen;

              return (
                <tr
                  key={item.id}
                  className="border-t transition hover:bg-slate-50"
                >
                  {/* Peserta */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar + online indicator */}
                      <div className="relative">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {(item.profiles?.full_name ?? "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.profiles?.full_name ?? "-"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.profiles?.email ?? "-"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Sesi */}
                  <td className="p-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                      {item.osce_sessions?.title ?? "-"}
                    </span>
                  </td>

                  {/* Last Seen */}
                  <td className="p-4">
                    {isOnline ? (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        Sedang Online
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Clock size={13} className="text-slate-400" />
                        {formatLastSeen(lastSeen)}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status === "approved"
                        ? "Disetujui"
                        : item.status === "rejected"
                        ? "Ditolak"
                        : "Menunggu"}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="p-4 text-center">
                    {item.status === "pending" ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(item.id)}
                          className="rounded-lg border border-red-300 px-4 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}