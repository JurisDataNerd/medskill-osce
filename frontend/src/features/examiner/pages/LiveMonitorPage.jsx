import { useEffect, useState } from "react";

import {
  User,
  Clock3,
} from "lucide-react";

import {
  getLiveParticipants,
  subscribeLive,
} from "@/services/live.service";

import { getStages } from "@/services/stage.service";

export default function LiveMonitorPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();

    const channel = subscribeLive(load);

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function load() {
    setLoading(true);

    const data = await getLiveParticipants();

    const participants = data ?? [];

    if (participants.length > 0) {
      const sessionId = participants[0]?.osce_sessions?.id;

      if (sessionId) {
        try {
          const stages = await getStages(sessionId);

          const stageMap = {};

          stages.forEach((stage) => {
            stageMap[stage.station_number] = stage.title;
          });

          setRows(
            participants.map((item) => ({
              ...item,
              stage_title: stageMap[item.station_number],
            }))
          );

          setLoading(false);
          return;
        } catch (err) {
          console.error(err);
        }
      }
    }

    setRows(participants);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Live Monitor
          </h1>

          <p className="mt-2 text-slate-500">
            Monitoring seluruh peserta secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500" />

            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-600" />
          </span>

          <span className="font-semibold text-emerald-700">
            LIVE
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow">
          Belum ada peserta aktif.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white p-6 shadow"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {item.stage_title ??
                      item.station_name ??
                      `Stase ${item.station_number}`}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.osce_sessions?.title}
                  </p>
                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {item.status}
                </span>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <User className="text-slate-500" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Peserta
                    </p>

                    <p className="font-semibold">
                      {item.profiles?.full_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock3 className="text-slate-500" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Mulai
                    </p>

                    <p>
                      {new Date(
                        item.created_at
                      ).toLocaleTimeString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}