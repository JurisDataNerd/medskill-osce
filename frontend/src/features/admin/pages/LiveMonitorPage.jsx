import { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";

import {
  getLiveParticipants,
  subscribeLive,
} from "@/services/live.service";

export default function LiveMonitorPage() {
  const [rows, setRows] = useState([]);

  async function load() {
    setRows(await getLiveParticipants());
  }

  useEffect(() => {
    load();

    const channel = subscribeLive(load);

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <AdminLayout>
      <h1 className="mb-8 text-3xl font-bold">
        Live Monitor
      </h1>

      <div className="grid gap-4">

        {rows.map((item) => (

          <div
            key={item.id}
            className="rounded-xl bg-white p-5 shadow"
          >

            <div className="flex justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {item.profiles?.full_name}
                </h2>

                <p className="text-slate-500">
                  {item.osce_sessions?.title}
                </p>

              </div>

              <div className="text-right">

                <p>
                  Station {item.station_number}
                </p>

                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    item.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>
    </AdminLayout>
  );
}