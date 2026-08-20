import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Award,
  CheckCheck,
  Shuffle,
  Loader2,
  Layers,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import {
  getSessionParticipants,
  approveParticipant,
  rejectParticipant,
  randomizeStationMapping,
} from "@/services/session.service";
import { supabase } from "@/lib/supabaseClient";
import ParticipantAnswerModal from "@/features/admin/components/ParticipantAnswerModal";

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

const STATUS_STYLE = {
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  rejected: "bg-red-100 text-red-600 border-red-200",
  running: "bg-blue-100 text-blue-700 border-blue-200",
  finished: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_LABEL = {
  approved: "Disetujui",
  pending: "Menunggu Approval",
  rejected: "Ditolak",
  running: "Sedang Ujian",
  finished: "Selesai",
};

export default function SessionParticipantsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomizing, setRandomizing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScorecard, setSelectedScorecard] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  // Real-time subscription to session_participants table
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`admin_session_participants_page_${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "osce",
          table: "session_participants",
          filter: `session_id=eq.${id}`,
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      const data = await getSessionParticipants(id);
      setParticipants(data || []);
    } catch (err) {
      console.error(err);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRandomizeMapping() {
    try {
      setRandomizing(true);
      const updated = await randomizeStationMapping(id);
      setParticipants(updated || []);
    } catch (err) {
      console.error("Error randomizing station mapping:", err);
    } finally {
      setRandomizing(false);
    }
  }

  async function handleApprove(participantId) {
    const nextOrder = participants.filter((item) => item.status === "approved").length + 1;
    const nextStation = ((nextOrder - 1) % 6) + 1;

    try {
      await approveParticipant(participantId, nextStation, id);
    } catch (err) {
      console.warn("Approve error:", err);
    }

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          return {
            ...p,
            status: "approved",
            participant_order: nextOrder,
            station_number: nextStation,
          };
        }
        return p;
      })
    );
  }

  async function handleReject(participantId) {
    try {
      await rejectParticipant(participantId, id);
    } catch (err) {
      console.warn("Reject error:", err);
    }

    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, status: "rejected" } : p))
    );
  }

  async function handleApproveAllPending() {
    const pendingItems = participants.filter((p) => p.status === "pending");
    for (const item of pendingItems) {
      await handleApprove(item.id);
    }
  }

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && p.status === "pending") ||
      (activeTab === "approved" && p.status === "approved") ||
      (activeTab === "rejected" && p.status === "rejected");

    const matchesSearch =
      (p.profiles?.full_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.profiles?.email ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const approvedCount = participants.filter((p) => p.status === "approved").length;
  const pendingCount = participants.filter((p) => p.status === "pending").length;
  const rejectedCount = participants.filter((p) => p.status === "rejected").length;

  return (
    <AdminLayout>
      {/* Back + Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/sessions")}
          className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Sesi
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Pendaftaran & Plotting Peserta
            </h1>
            <p className="text-sm text-slate-500">
              Verifikasi pendaftaran calon peserta OSCE, persetujuan (approval), dan alokasi stase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/admin/sessions/${id}/schedule`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 shadow-xs transition hover:bg-blue-100 active:scale-95 cursor-pointer"
            >
              <Layers size={16} />
              <span>Lihat Mapping Dokter</span>
            </button>

            <button
              onClick={handleRandomizeMapping}
              disabled={randomizing || participants.length === 0}
              className={`inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700 shadow-xs transition hover:bg-purple-100 active:scale-95 ${
                randomizing ? "opacity-70 cursor-not-allowed" : ""
              }`}
              title="Acak alokasi pos awal stase peserta secara seimbang"
            >
              {randomizing ? <Loader2 size={16} className="animate-spin" /> : <Shuffle size={16} />}
              <span>{randomizing ? "Mengacak Stase..." : "Acak Mapping Stase"}</span>
            </button>

            {pendingCount > 0 && (
              <button
                onClick={handleApproveAllPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
              >
                <CheckCheck size={16} />
                Setujui Semua ({pendingCount})
              </button>
            )}

            <div className="flex gap-2">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-center shadow-2xs">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total</p>
                <p className="text-sm font-bold text-slate-700">{participants.length}</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center shadow-2xs">
                <p className="text-[10px] text-emerald-600 font-semibold uppercase">Approved</p>
                <p className="text-sm font-bold text-emerald-700">{approvedCount}</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-center shadow-2xs">
                <p className="text-[10px] text-amber-600 font-semibold uppercase">Pending</p>
                <p className="text-sm font-bold text-amber-700">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Semua ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "pending"
                ? "bg-amber-600 text-white"
                : "text-amber-700 bg-amber-50 hover:bg-amber-100"
            }`}
          >
            Pending Approval ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "approved"
                ? "bg-emerald-600 text-white"
                : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            }`}
          >
            Disetujui ({approvedCount})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "rejected"
                ? "bg-red-600 text-white"
                : "text-red-700 bg-red-50 hover:bg-red-100"
            }`}
          >
            Ditolak ({rejectedCount})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Participants Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-xs">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-white shadow-xs border border-slate-200">
          <Users size={36} className="mb-3 text-slate-300" />
          <p className="font-medium text-slate-400 text-xs">Tidak ada peserta pada kategori ini.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500">
                <th className="p-3.5 font-semibold">Peserta</th>
                <th className="p-3.5 font-semibold">Status Pendaftaran</th>
                <th className="p-3.5 font-semibold">Awal Stase & Urutan</th>
                <th className="p-3.5 font-semibold">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    Aktivitas Login
                  </div>
                </th>
                <th className="p-3.5 font-semibold text-right">Aksi & Approval</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.map((item) => {
                const isOnline = item.profiles?.is_online;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    {/* Peserta */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {(item.profiles?.full_name ?? "?").charAt(0).toUpperCase()}
                          </div>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.profiles?.full_name ?? "-"}</p>
                          <p className="text-[11px] text-slate-400">{item.profiles?.email ?? "-"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[item.status]}`}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </td>

                    {/* Urutan */}
                    <td className="p-3.5">
                      {item.status === "approved" ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700 text-[11px]">
                            Stase {item.station_number}
                          </span>
                          <span className="text-slate-400">#Urutan {item.participant_order}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum diplot</span>
                      )}
                    </td>

                    {/* Last Seen */}
                    <td className="p-3.5">
                      {isOnline ? (
                        <span className="font-semibold text-emerald-600">Online</span>
                      ) : (
                        <span className="text-slate-500">{formatLastSeen(item.profiles?.last_seen)}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-95 shadow-xs"
                            >
                              <CheckCircle2 size={13} />
                              Setujui
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <XCircle size={13} />
                              Tolak
                            </button>
                          </>
                        )}

                        {item.status === "approved" && (
                          <>
                            <button
                              onClick={() => handleReject(item.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                              title="Batalkan persetujuan & tolak peserta"
                            >
                              <XCircle size={13} />
                              Tolak Peserta
                            </button>
                            <button
                              onClick={() => navigate(`/admin/live/participant/${item.id || "p1"}`)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                              title="Lihat Rekap Nilai Peserta"
                            >
                              <Award size={13} />
                              Rekap Nilai
                            </button>
                          </>
                        )}

                        {item.status === "rejected" && (
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <CheckCircle2 size={13} />
                            Setujui Kembali
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
