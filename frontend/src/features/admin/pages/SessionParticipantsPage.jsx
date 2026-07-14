import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";
import {
  getSessionParticipants,
  approveParticipant,
  rejectParticipant,
} from "@/services/session.service";

export default function SessionParticipantsPage() {
  const { id } = useParams();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadParticipants();
    }
  }, [id]);

  async function loadParticipants() {
    try {
      setLoading(true);

      const data = await getSessionParticipants(id);

      setParticipants(data ?? []);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(memberId) {
    try {
      await approveParticipant(memberId);
      await loadParticipants();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleReject(memberId) {
    try {
      await rejectParticipant(memberId);
      await loadParticipants();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <AdminLayout>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Participants
        </h1>

        <p className="text-slate-500">
          Session ID : {id}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>
              <th className="p-4 text-left">Name</th>
              <th>Email</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>

          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && participants.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  Belum ada peserta mendaftar.
                </td>
              </tr>
            )}

            {!loading &&
              participants.map((item) => (
                <tr
                  key={item.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {item.profiles?.full_name ?? "-"}
                  </td>

                  <td>
                    {item.profiles?.email ?? "-"}
                  </td>

                  <td>
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm">
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-center gap-2">

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