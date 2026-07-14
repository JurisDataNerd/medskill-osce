import { useEffect, useState } from "react";

import ExaminerLayout from "@/layouts/ExaminerLayout";

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

    return () => channel.unsubscribe();
  }, []);

  return (
    <ExaminerLayout>

      <h1 className="mb-8 text-3xl font-bold">
        Live Monitor
      </h1>

      <div className="grid grid-cols-2 gap-4">

        {rows.map((item)=>(

          <div
            key={item.id}
            className="rounded-xl bg-white p-5 shadow"
          >

            <h2 className="font-bold">
              {item.profiles?.full_name}
            </h2>

            <p>
              Station {item.station_number}
            </p>

            <p>
              Status :
              {" "}
              {item.status}
            </p>

          </div>

        ))}

      </div>

    </ExaminerLayout>
  );
}