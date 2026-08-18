import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Search,
  CheckCheck,
  Clock,
  Award,
  Loader2,
  UserCheck,
  Shuffle,
} from "lucide-react";
import {
  getSessionParticipants,
  approveParticipant,
  rejectParticipant,
  randomizeStationMapping,
} from "@/services/session.service";
import { supabase } from "@/lib/supabaseClient";

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
  approved: "bg-emerald-100 text-emerald-800 border-emerald-300",
  pending: "bg-amber-100 text-amber-900 border-amber-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  running: "bg-blue-100 text-blue-800 border-blue-300",
  finished: "bg-slate-100 text-slate-700 border-slate-300",
};

const STATUS_LABEL = {
  approved: "Disetujui",
  pending: "Menunggu Approval",
  rejected: "Ditolak",
  running: "Sedang Ujian",
  finished: "Selesai",
};

export default function SessionParticipantsInlineSection({
  sessionId,
  onUpdate,
}) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomizing, setRandomizing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (sessionId) {
      loadParticipants();
    }
  }, [sessionId]);

  // Real-time subscription for inline session participants component
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`admin_session_participants_inline_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "osce",
          table: "session_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  async function loadParticipants() {
    try {
      setLoading(true);
      const data = await getSessionParticipants(sessionId);
      setParticipants(data || []);
    } catch (err) {
      console.error("Error loading session participants:", err);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRandomizeMapping() {
    try {
      setRandomizing(true);
      const updated = await randomizeStationMapping(sessionId);
      setParticipants(updated || []);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error randomizing mapping:", err);
    } finally {
      setRandomizing(false);
    }
  }

  async function handleApprove(participantId) {
    setActionLoadingId(participantId);
    const approvedList = participants.filter((item) => item.status === "approved");
    const nextOrder = approvedList.length + 1;
    const nextStation = ((nextOrder - 1) % 6) + 1;

    try {
      await approveParticipant(participantId, nextStation, sessionId);
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
      if (onUpdate) onUpdate();
    } catch (err) {
      console.warn("Approve error:", err);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(participantId) {
    setActionLoadingId(participantId);
    try {
      await rejectParticipant(participantId, sessionId);
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, status: "rejected" } : p))
      );
      if (onUpdate) onUpdate();
    } catch (err) {
      console.warn("Reject error:", err);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleApproveAllPending() {
    const pendingItems = participants.filter((p) => p.status === "pending");
    for (const item of pendingItems) {
      await handleApprove(item.id);
    }
  }

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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck size={18} className="text-blue-600" />
            Penugasan & Verifikasi Peserta Ujian Sesi Ini
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola persetujuan (approval) pendaftaran peserta dan penempatan nomor pos stase awal rotasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRandomizeMapping}
            disabled={randomizing || participants.length === 0}
            className={`inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700 shadow-xs transition hover:bg-purple-100 active:scale-95 ${
              randomizing ? "opacity-70 cursor-not-allowed" : ""
            }`}
            title="Acak alokasi pos awal stase peserta secara seimbang"
          >
            {randomizing ? <Loader2 size={15} className="animate-spin" /> : <Shuffle size={15} />}
            <span>{randomizing ? "Mengacak Stase..." : "Acak Mapping Stase"}</span>
          </button>

          {pendingCount > 0 && (
            <button
              onClick={handleApproveAllPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-95"
            >
              <CheckCheck size={15} />
              Setujui Semua ({pendingCount})
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Semua ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              activeTab === "pending"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              activeTab === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100"
            }`}
          >
            Disetujui ({approvedCount})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              activeTab === "rejected"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-red-50 border border-red-200 text-red-900 hover:bg-red-100"
            }`}
          >
            Ditolak ({rejectedCount})
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs font-medium focus:border-blue-500 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Participants Table */}
      {loading ? (
        <div className="flex h-36 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div className="flex h-36 flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-center p-4 space-y-1">
          <Users size={28} className="text-slate-300" />
          <p className="text-xs font-bold text-slate-700">Belum ada peserta terdaftar</p>
          <p className="text-[11px] text-slate-500">
            Tidak ditemukan pendaftar peserta pada kategori filter ini.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3">Peserta</th>
                <th className="p-3">Status Pendaftaran</th>
                <th className="p-3">Awal Stase & Rotasi</th>
                <th className="p-3">Aktivitas Login</th>
                <th className="p-3 text-right">Aksi & Approval</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredParticipants.map((item) => {
                const isOnline = item.profiles?.is_online;
                const isProcessing = actionLoadingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    {/* Peserta */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-800 border border-blue-200">
                            {(item.profiles?.full_name ?? "?").charAt(0).toUpperCase()}
                          </div>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{item.profiles?.full_name ?? "-"}</p>
                          <p className="text-[11px] text-slate-500">{item.profiles?.email ?? "-"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          STATUS_STYLE[item.status]
                        }`}
                      >
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </td>

                    {/* Stase */}
                    <td className="p-3">
                      {item.status === "approved" ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-blue-100 border border-blue-300 px-2 py-0.5 font-black text-blue-900 text-[11px]">
                            Pos Stase #{item.station_number}
                          </span>
                          <span className="text-slate-500 font-bold text-[11px]">#Rotasi {item.participant_order}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum diplot</span>
                      )}
                    </td>

                    {/* Login */}
                    <td className="p-3">
                      {isOnline ? (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Online Active
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                          <Clock size={12} className="text-slate-400" />
                          {formatLastSeen(item.profiles?.last_seen)}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                          <>
                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-emerald-700 active:scale-95 shadow-2xs"
                                >
                                  <CheckCircle2 size={13} />
                                  Setujui
                                </button>
                                <button
                                  onClick={() => handleReject(item.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50"
                                >
                                  <XCircle size={13} />
                                  Tolak
                                </button>
                              </>
                            )}

                            {item.status === "approved" && (
                              <button
                                onClick={() => handleReject(item.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 transition hover:bg-red-100"
                                title="Batalkan persetujuan peserta"
                              >
                                <XCircle size={13} />
                                Tolak Persetujuan
                              </button>
                            )}

                            {item.status === "rejected" && (
                              <button
                                onClick={() => handleApprove(item.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                              >
                                <CheckCircle2 size={13} />
                                Setujui Kembali
                              </button>
                            )}
                          </>
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
    </div>
  );
}
