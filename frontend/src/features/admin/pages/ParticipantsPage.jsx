import { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import { Clock, Users, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  getAllParticipants,
  approveParticipant,
  rejectParticipant,
} from "@/services/session.service";

function formatLastSeen(lastSeen) {
  if (!lastSeen) return "Belum pernah login";

  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7)
    return date.toLocaleString("id-ID", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("participants-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "osce",
          table: "session_participants",
        },
        () => load()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getAllParticipants();
      setParticipants(data ?? []);
    } catch (err) {
      console.error("Error loading participants from Supabase:", err);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      await approveParticipant(id);
      load();
    } catch (err) {
      console.error("Error approving participant:", err);
    }
  }

  async function handleReject(id) {
    try {
      await rejectParticipant(id);
      load();
    } catch (err) {
      console.error("Error rejecting participant:", err);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[400px] items-center justify-center text-xs font-semibold text-slate-500">
          <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
          Memuat Data Peserta Supabase...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-1">
          <span className="rounded-md bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-900">
            PESERTA UJIAN SUPABASE
          </span>
          <h1 className="text-xl font-black text-slate-900 pt-1">
            Data Peserta & Registrasi Mahasiswa
          </h1>
          <p className="text-xs text-slate-500">
            Pantau status registrasi dan posisi urutan stase awal peserta ujian sirkuit.
          </p>
        </div>

        {/* Participants Table Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              Daftar Peserta Terdaftar ({participants.length} Mahasiswa)
            </h2>
          </div>

          {participants.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada peserta yang terdaftar di database Supabase schema `osce`.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase">
                    <th className="py-3 px-3">Nama Mahasiswa</th>
                    <th className="py-3 px-3">NIM / Email</th>
                    <th className="py-3 px-3 text-center">Stase Awal</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Aksi Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {participants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {p.profiles?.full_name}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {p.profiles?.email}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-blue-700">
                        Pos #{p.station_number || 1}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                            p.status === "active" || p.status === "approved"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : p.status === "absent"
                              ? "bg-rose-100 text-rose-900 border border-rose-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(p.id)}
                            className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}