import { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
  getAllParticipants,
  approveParticipant,
  rejectParticipant,
} from "@/services/session.service";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    load();
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
    load();
  }

  async function handleReject(id) {
    await rejectParticipant(id);
    load();
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Participant Registration
        </h1>

        <p className="text-slate-500">
          Approve peserta yang mendaftar ke Session OSCE.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>
              <th className="p-4 text-left">Participant</th>
              <th>Session</th>
              <th>Status</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {participants.length === 0 && (

              <tr>

                <td
                  colSpan={4}
                  className="p-8 text-center"
                >
                  Belum ada pendaftar.
                </td>

              </tr>

            )}

            {participants.map((item) => (

              <tr
                key={item.id}
                className="border-t"
              >

                <td className="p-4">
                  {item.profiles?.full_name}
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

                  <div className="flex gap-2">

                    <button
                      onClick={() => handleApprove(item.id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(item.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white"
                    >
                      Reject
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
      </div>
    </AdminLayout>
  );
}