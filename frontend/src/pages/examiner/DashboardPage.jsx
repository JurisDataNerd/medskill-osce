export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-4">

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-sm text-slate-500">
          Sesi Hari Ini
        </h3>

        <p className="mt-2 text-3xl font-bold">
          0
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-sm text-slate-500">
          Station
        </h3>

        <p className="mt-2 text-3xl font-bold">
          -
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-sm text-slate-500">
          Peserta Dinilai
        </h3>

        <p className="mt-2 text-3xl font-bold">
          0
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-sm text-slate-500">
          Belum Dinilai
        </h3>

        <p className="mt-2 text-3xl font-bold">
          0
        </p>
      </div>

    </div>
  );
}