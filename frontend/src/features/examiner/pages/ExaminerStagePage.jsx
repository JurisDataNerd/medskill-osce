import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ClipboardList,
  Users,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import {
  claimStage,
  releaseStage,
  getStage,
  getParticipants,
  subscribeStage,
} from "@/services/examiner.service";

export default function ExaminerStagePage() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [stage, setStage] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    init();
  }, [stageId]);

  useEffect(() => {
    const channel = subscribeStage(stageId, loadParticipants);

    return () => {
      channel.unsubscribe();
    };
  }, [stageId]);

  async function init() {
    setLoading(true);

    await claimStage(stageId);

    const stageData = await getStage(stageId);

    setStage(stageData);

    await loadParticipants();

    setLoading(false);
  }

  async function loadParticipants() {
    const rows = await getParticipants(stageId);

    setParticipants(rows ?? []);
  }

  async function handleLeave() {
    await releaseStage(stageId);

    navigate("/examiner");
  }

  const finished = useMemo(() => {
    return participants.filter(
      (x) => x.mentor_feedback
    ).length;
  }, [participants]);

  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleLeave}
        className="mb-8 inline-flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-slate-100"
      >
        <ArrowLeft size={18} />
        Keluar dari Stase
      </button>

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Stase {stage.station_number}
          </h1>

          <p className="mt-2 text-slate-500">
            {stage.title}
          </p>

        </div>

      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <Card
          icon={<ClipboardList />}
          title="Stase"
          value={stage.station_number}
        />

        <Card
          icon={<Users />}
          title="Peserta"
          value={participants.length}
        />

        <Card
          icon={<CheckCircle2 />}
          title="Dinilai"
          value={finished}
        />

        <Card
          icon={<Clock3 />}
          title="Pending"
          value={participants.length - finished}
        />

      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Peserta
              </th>

              <th className="text-center">
                Anamnesis
              </th>

              <th className="text-center">
                Pemfis
              </th>

              <th className="text-center">
                Penunjang
              </th>

              <th className="text-center">
                Diagnosis
              </th>

              <th className="text-center">
                Status
              </th>

              <th className="text-center">
                Aksi
              </th>

            </tr>

          </thead>

          <tbody>

            {participants.map((item) => (

              <tr
                key={item.id}
                className="border-t"
              >

                <td className="p-4">

                  <p className="font-semibold">
                    {item.participant?.full_name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {item.participant?.email}
                  </p>

                </td>

                <td className="text-center">
                  {item.anamnesis ? "🟢" : "⚪"}
                </td>

                <td className="text-center">
                  {item.pemeriksaan_fisik ? "🟢" : "⚪"}
                </td>

                <td className="text-center">
                  {item.pemeriksaan_penunjang ? "🟢" : "⚪"}
                </td>

                <td className="text-center">
                  {item.diagnosis ? "🟢" : "⚪"}
                </td>

                <td className="text-center">

                  {item.mentor_feedback ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                      Selesai
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">
                      Menunggu
                    </span>
                  )}

                </td>

                <td className="text-center">

                  <button
                    onClick={() =>
                      navigate(`/examiner/feedback/${item.id}`)
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Nilai
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
    </>
  );
}

function Card({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <div className="mb-4 text-blue-600">
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {value}
      </h2>

    </div>
  );
}