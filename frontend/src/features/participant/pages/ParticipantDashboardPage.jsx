import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  ClipboardList,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import {
  getMyRegistration,
  getMySession,
} from "@/services/participant.service";

export default function ParticipantDashboardPage() {
  const [loading, setLoading] = useState(true);

  const [registration, setRegistration] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const reg = await getMyRegistration();
      setRegistration(reg);

      if (reg) {
        const s = await getMySession();
        setSession(s);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="mx-auto mt-20 max-w-xl rounded-3xl bg-white p-10 shadow">
        <ClipboardList
          size={52}
          className="mx-auto mb-5 text-slate-400"
        />

        <h1 className="text-center text-3xl font-bold">
          Belum Terdaftar
        </h1>

        <p className="mt-3 text-center text-slate-500">
          Anda belum mendaftar pada sesi OSCE manapun.
        </p>
      </div>
    );
  }

  if (registration.status === "pending") {
    return (
      <div className="mx-auto mt-20 max-w-xl rounded-3xl bg-white p-10 shadow">
        <Clock3
          size={52}
          className="mx-auto mb-5 text-yellow-500"
        />

        <h1 className="text-center text-3xl font-bold">
          Menunggu Persetujuan
        </h1>

        <p className="mt-3 text-center text-slate-500">
          Admin belum menyetujui pendaftaran Anda.
        </p>
      </div>
    );
  }

  if (registration.status === "rejected") {
    return (
      <div className="mx-auto mt-20 max-w-xl rounded-3xl bg-white p-10 shadow">
        <h1 className="text-center text-3xl font-bold text-red-600">
          Pendaftaran Ditolak
        </h1>

        <p className="mt-3 text-center text-slate-500">
          Hubungi admin apabila terjadi kesalahan.
        </p>
      </div>
    );
  }

  if (registration.status === "finished") {
    return (
      <div className="mx-auto mt-20 max-w-xl rounded-3xl bg-white p-10 shadow">
        <CheckCircle2
          size={52}
          className="mx-auto mb-5 text-green-600"
        />

        <h1 className="text-center text-3xl font-bold">
          Simulasi Selesai
        </h1>

        <p className="mt-3 text-center text-slate-500">
          Terima kasih telah mengikuti OSCE.
        </p>
      </div>
    );
  }

  if (session?.status !== "running") {
    return (
      <div className="mx-auto mt-20 max-w-xl rounded-3xl bg-white p-10 shadow">
        <Clock3
          size={52}
          className="mx-auto mb-5 text-blue-600"
        />

        <h1 className="text-center text-3xl font-bold">
          Menunggu Simulasi
        </h1>

        <p className="mt-3 text-center text-slate-500">
          Anda telah disetujui.
          <br />
          Silakan menunggu admin memulai simulasi.
        </p>
      </div>
    );
  }

  return (
    <Navigate
      to={`/participant/session/${registration.session_id}`}
      replace
    />
  );
}