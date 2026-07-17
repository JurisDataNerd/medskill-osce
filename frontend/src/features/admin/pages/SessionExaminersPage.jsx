import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Clock, GraduationCap } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { getSessionExaminers } from "@/services/session.service";
import { supabase } from "@/supabase/client";

function formatLastSeen(lastSeen) {
  if (!lastSeen) return "Belum login";
  const diff = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return new Date(lastSeen).toLocaleDateString("id-ID", { dateStyle: "medium" });
}

const ROLE_LABEL = {
  examiner: "Penguji",
  mentor: "Mentor",
};

const ROLE_STYLE = {
  examiner: "bg-violet-100 text-violet-700",
  mentor: "bg-purple-100 text-purple-700",
};

export default function SessionExaminersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) load();

    const channel = supabase
      .channel(`session-examiners-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "osce_session_members" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, load)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id]);

  async function load() {
    try {
      const data = await getSessionExaminers(id);
      setExaminers(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Group by station_number
  const byStation = examiners.reduce((acc, item) => {
    const key = item.station_number ?? 0;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const stationKeys = Object.keys(byStation)
    .map(Number)
    .sort((a, b) => a - b);

  const online = examiners.filter((e) => e.profiles?.is_online).length;

  return (
    <AdminLayout>
      {/* Back + Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/sessions")}
          className="mb-4 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={15} />
          Kembali ke Sesi
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Penguji Terdaftar
            </h1>
            <p className="text-slate-500">
              Daftar penguji yang ditugaskan pada sesi ini, per station
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-xl bg-slate-50 px-5 py-3 text-center">
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-2xl font-bold text-slate-700">{examiners.length}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-5 py-3 text-center">
              <p className="text-xs text-emerald-500">Online</p>
              <p className="text-2xl font-bold text-emerald-600">{online}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl bg-white shadow">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : examiners.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl bg-white shadow">
          <GraduationCap size={36} className="mb-3 text-slate-200" />
          <p className="font-medium text-slate-400">Belum ada penguji terdaftar.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {stationKeys.map((stationNum) => (
            <div key={stationNum} className="overflow-hidden rounded-2xl bg-white shadow">
              {/* Station header */}
              <div className="flex items-center gap-2 border-b bg-slate-50 px-5 py-3">
                <Building2 size={15} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-600">
                  {stationNum === 0 ? "Belum Ditugaskan" : `Station ${stationNum}`}
                </span>
                <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500">
                  {byStation[stationNum].length} penguji
                </span>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Penguji
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Peran
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} />
                        Last Seen
                      </div>
                    </th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {byStation[stationNum].map((item) => {
                    const isOnline = item.profiles?.is_online;
                    return (
                      <tr key={item.id} className="border-t transition hover:bg-slate-50">
                        {/* Penguji */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                                {(item.profiles?.full_name ?? "?").charAt(0).toUpperCase()}
                              </div>
                              {isOnline && (
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.profiles?.full_name ?? "-"}
                              </p>
                              <p className="text-xs text-slate-400">{item.profiles?.email ?? "-"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Peran */}
                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              ROLE_STYLE[item.role] ?? "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {ROLE_LABEL[item.role] ?? item.role}
                          </span>
                        </td>

                        {/* Last Seen */}
                        <td className="p-4">
                          {isOnline ? (
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                              </span>
                              Online
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">
                              {formatLastSeen(item.profiles?.last_seen)}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.status === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.status === "approved"
                              ? "Aktif"
                              : item.status === "pending"
                              ? "Menunggu"
                              : item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
