import { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { supabase } from "@/supabase/client";
import {
  getAllParticipants,
  approveParticipant,
  rejectParticipant,
} from "@/services/session.service";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState([]);

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
        () => {
          load();
        }
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
    }
  }

  async function handleApprove(id) {
    await approveParticipant(id);
  }

  async function handleReject(id) {
    await rejectParticipant(id);
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Participant Registration
          </h1>

          <p className="text-slate-500">
            Approve peserta yang mendaftar ke Session OSCE.
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 px-4 py-3">
          <p className="text-sm text-slate-500">
            Total Pendaftar
          </p>

          <p className="text-2xl font-bold">
            {participants.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Participant</th>
              <th className="text-left">Session</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {participants.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-slate-500"
                >
                  Belum ada pendaftar.
                </td>
              </tr>
            )}

            {participants.map((item) => (
              <tr
                key={item.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="p-4">
                  <div>
                    <p className="font-semibold">
                      {item.profiles?.full_name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.profiles?.email}
                    </p>
                  </div>
                </td>

                <td>
                  {item.osce_sessions?.title}
                </td>

                <td>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      item.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : item.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td>
                  {item.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(item.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">
                      Tidak ada aksi
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}