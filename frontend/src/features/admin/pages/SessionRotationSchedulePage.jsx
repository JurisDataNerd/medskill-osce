import { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  Stethoscope,
  Activity,
  UserCheck,
  Layers,
  Building2,
  Sliders,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import SessionRotationScheduleView from "@/features/admin/components/SessionRotationScheduleView";
import { fetchSessionById } from "@/services/sessionService";

export default function SessionRotationSchedulePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const data = await fetchSessionById(id);
        setSession(data);
      } catch (err) {
        console.warn("Could not fetch session detail:", err);
      }
    }
    if (id) loadSession();
  }, [id]);

  return (
    <AdminLayout>
      {/* Top Header Nav */}
      <div className="mb-6">
        <NavLink
          to={`/admin/sessions/${id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          Kembali ke Detail Sesi Ujian
        </NavLink>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Jadwal Mapping Rotasi Peserta & Penguji
              </h1>
              {session?.status && (
                <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700 capitalize border border-blue-200">
                  {session.status}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Sesi: <strong className="text-slate-800">{session?.title || "OSCE Session"}</strong> • {session?.session_date || "Tanggal Sesi"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/sessions/${id}/participants`)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              <UserCheck size={15} className="text-emerald-600" />
              Plotting Peserta
            </button>

            <button
              type="button"
              onClick={() => navigate(`/admin/sessions/${id}/examiners`)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              <Stethoscope size={15} className="text-blue-600" />
              Penugasan Penguji
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/live")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-95 cursor-pointer"
            >
              <Activity size={15} />
              Monitor Live
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Rotation Schedule View */}
      <SessionRotationScheduleView sessionId={id} />
    </AdminLayout>
  );
}
