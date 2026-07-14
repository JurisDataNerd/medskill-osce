import AdminLayout from "@/layouts/AdminLayout";
import {
  Users,
  UserCheck,
  GraduationCap,
  Building2,
  PlayCircle,
} from "lucide-react";

export default function AdminPage() {
  return (
    <AdminLayout>

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="text-slate-500">
            MedSkill OSCE Control Room
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white">

          <PlayCircle />

          Start Simulation

        </button>

      </div>

      <div className="grid grid-cols-4 gap-6">

        <Card
          title="Participants"
          value="0"
          icon={<Users />}
        />

        <Card
          title="Examiners"
          value="0"
          icon={<UserCheck />}
        />

        <Card
          title="Mentors"
          value="0"
          icon={<GraduationCap />}
        />

        <Card
          title="Stations"
          value="0"
          icon={<Building2 />}
        />

      </div>

      <div className="mt-8 grid grid-cols-3 gap-6">

        <div className="col-span-2 rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-semibold">
            Live Activity
          </h2>

          <div className="rounded-xl border border-dashed p-10 text-center text-slate-400">

            Belum ada aktivitas realtime.

          </div>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-semibold">
            Session Status
          </h2>

          <div className="space-y-4">

            <Status
              title="Status"
              value="Waiting"
            />

            <Status
              title="Rotation"
              value="-"
            />

            <Status
              title="Station"
              value="-"
            />

            <Status
              title="Countdown"
              value="00:00"
            />

          </div>

        </div>

      </div>

    </AdminLayout>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <div className="mb-5 flex items-center justify-between">

        {icon}

        <span className="text-3xl font-bold">
          {value}
        </span>

      </div>

      <p className="text-slate-500">
        {title}
      </p>

    </div>
  );
}

function Status({ title, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">

      <span>{title}</span>

      <span className="font-semibold">
        {value}
      </span>

    </div>
  );
}