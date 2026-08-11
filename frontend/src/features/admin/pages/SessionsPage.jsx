import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Pencil,
  Plus,
  Trash2,
  Play,
  Square,
  Search,
  Activity,
  CheckCircle2,
  FileEdit,
  History,
  Building2,
  Filter,
  Users,
  MapPin,
  UserCheck,
  Loader2,
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import SessionModal from "@/features/admin/components/SessionModal";
import { fetchSessions, deleteSession, updateSessionStatus } from "@/services/sessionService";

export default function SessionsPage() {
  const navigate = useNavigate();

  // State
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [openModal, setOpenModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Load Sessions directly from Supabase osce schema
  async function loadSessions() {
    try {
      setLoading(true);
      const data = await fetchSessions();
      setSessions(data || []);
    } catch (err) {
      console.warn("Could not fetch sessions from Supabase:", err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  // Helper to normalize status values across legacy database records ('scheduled', 'published', 'draft', etc.)
  function getNormalizedStatus(rawStatus) {
    if (!rawStatus) return "draft";
    const s = String(rawStatus).toLowerCase();
    if (s === "scheduled" || s === "published") return "published";
    if (s === "ongoing" || s === "running") return "running";
    if (s === "finished" || s === "completed") return "completed";
    if (s === "cancelled" || s === "canceled") return "cancelled";
    return "draft";
  }

  // Filtered Sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      (session.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.location_building || session.location || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || getNormalizedStatus(session.status) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginated Data
  const totalPages = Math.ceil(filteredSessions.length / pageSize) || 1;
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  function handleCreate() {
    navigate("/admin/sessions/create");
  }

  function handleEdit(session) {
    navigate(`/admin/sessions/${session.id}/edit`);
  }

  function handleSave(payload) {
    if (selectedSession) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSession.id ? { ...s, ...payload } : s
        )
      );
    } else {
      const newSession = {
        id: `session-osce-00${sessions.length + 1}`,
        ...payload,
        total_stations: payload.total_stations || 6,
        registered_participants: payload.max_participants || 6,
        total_examiners: payload.total_examiners || 6,
        created_at: new Date().toISOString(),
        current_round: 0,
        total_rounds: payload.total_stations || 6,
      };
      setSessions((prev) => [newSession, ...prev]);
    }

    setOpenModal(false);
    setSelectedSession(null);
  }

  async function handleDelete(id) {
    const ok = confirm(
      "Apakah Anda yakin ingin menghapus riwayat sesi ini?\n\nSemua stase, peserta, dan hasil nilai terkait juga akan dihapus."
    );
    if (!ok) return;

    try {
      await deleteSession(id);
    } catch (err) {
      console.warn("Deleted locally:", err);
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleStatusChange(id, newStatus) {
    if (newStatus === "running" || newStatus === "ongoing") {
      const active = sessions.find(
        (s) => getNormalizedStatus(s.status) === "running" && s.id !== id
      );
      if (active) {
        alert(
          `PERINGATAN: Sesi OSCE tidak dapat dijalankan secara paralel!\n\nSesi "${active.title}" saat ini sedang berlangsung. Harap selesaikan sesi tersebut terlebih dahulu.`
        );
        return;
      }
    }

    try {
      await updateSessionStatus(id, newStatus);
    } catch (err) {
      console.warn("Could not update status to Supabase:", err);
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: newStatus,
              current_round:
                newStatus === "running" || newStatus === "ongoing"
                  ? Math.max(1, s.current_round || 1)
                  : s.current_round,
            }
          : s
      )
    );

    if (newStatus === "running" || newStatus === "ongoing") {
      navigate("/admin/live");
    }
  }

  function handleStart(id) {
    handleStatusChange(id, "running");
  }

  function handleFinish(id) {
    handleStatusChange(id, "completed");
  }

  // Stats calculation
  const totalCount = sessions.length;
  const activeSession = sessions.find(
    (s) => getNormalizedStatus(s.status) === "running"
  );
  const runningCount = sessions.filter(
    (s) => getNormalizedStatus(s.status) === "running"
  ).length;
  const draftCount = sessions.filter(
    (s) => getNormalizedStatus(s.status) === "draft"
  ).length;
  const completedCount = sessions.filter(
    (s) => getNormalizedStatus(s.status) === "completed"
  ).length;
  const publishedCount = sessions.filter(
    (s) => getNormalizedStatus(s.status) === "published"
  ).length;

  return (
    <AdminLayout>
      <SessionModal
        open={openModal}
        initialData={selectedSession}
        onClose={() => {
          setOpenModal(false);
          setSelectedSession(null);
        }}
        onSave={handleSave}
      />

      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kelola Sesi OSCE
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar riwayat dan manajemen pelaksanaan ujian OSCE.
          </p>
        </div>
      </div>

      {/* Single Live Session Restriction Banner */}
      {activeSession && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Activity size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Sesi Ujian Sedang Berlangsung:</span>
                <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                  {activeSession.title}
                </span>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                Sesi OSCE bersifat eksklusif (hanya 1 sesi live dalam 1 waktu). Sesi lain tidak dapat dimulai paralel.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/live")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 active:scale-95 shadow-xs"
          >
            <Activity size={14} />
            Buka Monitor Live
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatSummaryCard
          label="Total Sesi"
          value={totalCount}
          icon={<Building2 size={18} className="text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatSummaryCard
          label="Sesi Berlangsung"
          value={runningCount}
          icon={<Activity size={18} className="text-emerald-600" />}
          bgColor="bg-emerald-50"
          badgeText="Live"
        />
        <StatSummaryCard
          label="Dipublikasikan"
          value={publishedCount}
          icon={<CheckCircle2 size={18} className="text-indigo-600" />}
          bgColor="bg-indigo-50"
        />
        <StatSummaryCard
          label="Sesi Draft"
          value={draftCount}
          icon={<FileEdit size={18} className="text-amber-600" />}
          bgColor="bg-amber-50"
        />
      </div>

      {/* Table Card Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {/* Table Controls (Search, Filters & Add Button) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4 bg-slate-50/50">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <FilterTabBtn
              label="Semua"
              count={totalCount}
              active={statusFilter === "all"}
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
            />
            <FilterTabBtn
              label="Berlangsung"
              count={runningCount}
              active={statusFilter === "running"}
              activeColor="text-emerald-700 bg-emerald-50 border-emerald-200"
              onClick={() => {
                setStatusFilter("running");
                setCurrentPage(1);
              }}
            />
            <FilterTabBtn
              label="Dipublikasikan"
              count={publishedCount}
              active={statusFilter === "published"}
              activeColor="text-indigo-700 bg-indigo-50 border-indigo-200"
              onClick={() => {
                setStatusFilter("published");
                setCurrentPage(1);
              }}
            />
            <FilterTabBtn
              label="Draft"
              count={draftCount}
              active={statusFilter === "draft"}
              activeColor="text-amber-700 bg-amber-50 border-amber-200"
              onClick={() => {
                setStatusFilter("draft");
                setCurrentPage(1);
              }}
            />
            <FilterTabBtn
              label="Selesai"
              count={completedCount}
              active={statusFilter === "completed"}
              activeColor="text-blue-700 bg-blue-50 border-blue-200"
              onClick={() => {
                setStatusFilter("completed");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Search Box & Tambah Sesi Button Side-by-Side */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari sesi atau lokasi..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-95 shadow-xs shrink-0"
            >
              <Plus size={15} />
              Tambah Sesi
            </button>
          </div>
        </div>

        {/* History Table */}
        {filteredSessions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Tidak ada sesi OSCE ditemukan
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Sesuaikan pencarian atau filter status yang dipilih.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-100/80 font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Nama Sesi & Lokasi</th>
                  <th scope="col" className="px-5 py-3.5">Waktu Ujian</th>
                  <th scope="col" className="px-5 py-3.5">Stase & Durasi</th>
                  <th scope="col" className="px-5 py-3.5">Peserta & Penguji</th>
                  <th scope="col" className="px-5 py-3.5">Status (Live Edit)</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedSessions.map((session) => {
                  const normStatus = getNormalizedStatus(session.status);

                  return (
                    <tr
                      key={session.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      {/* Title & Location */}
                      <td className="px-5 py-4">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {session.title}
                          </div>
                          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" />
                            <span>{session.location || "Gedung Skill Lab Kedokteran"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <CalendarDays size={13} className="text-slate-400" />
                          {session.session_date}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock size={13} className="text-slate-400" />
                          {session.start_time} - {session.end_time || "Selesai"}
                        </div>
                      </td>

                      {/* Station & Durations */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {session.total_stations || 6} Stase
                        </div>
                        <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                          <span>{session.station_duration_minutes || 15}m stase</span>
                          <span>•</span>
                          <span>{session.break_duration_minutes || 3}m break</span>
                        </div>
                      </td>

                      {/* Participants & Examiners */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Users size={13} className="text-slate-400" />
                          {session.registered_participants || session.max_participants || 6} Peserta
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <UserCheck size={13} className="text-slate-400" />
                          {session.total_examiners || session.total_stations || 6} Penguji
                        </div>
                      </td>

                      {/* Live Edit Status Dropdown */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <select
                          value={normStatus}
                          onChange={(e) => handleStatusChange(session.id, e.target.value)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition focus:outline-none focus:ring-2 ${
                            normStatus === "running"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-200"
                              : normStatus === "published"
                              ? "bg-indigo-50 text-indigo-800 border-indigo-300 focus:ring-indigo-200"
                              : normStatus === "completed"
                              ? "bg-blue-50 text-blue-800 border-blue-300 focus:ring-blue-200"
                              : normStatus === "cancelled"
                              ? "bg-rose-50 text-rose-800 border-rose-300 focus:ring-rose-200"
                              : "bg-amber-50 text-amber-800 border-amber-300 focus:ring-amber-200"
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Dipublikasikan</option>
                          <option value="running">Berlangsung (Live)</option>
                          <option value="completed">Selesai</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Published / Scheduled status -> Show Start & Edit */}
                          {normStatus === "published" && (
                            <>
                              <button
                                onClick={() => handleStart(session.id)}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 shadow-xs"
                                title="Mulai Sesi Ujian"
                              >
                                <Play size={13} />
                                Start
                              </button>

                              <button
                                onClick={() => handleEdit(session)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-amber-600"
                                title="Edit Sesi"
                              >
                                <Pencil size={13} />
                                Edit
                              </button>
                            </>
                          )}

                          {/* Draft status -> Show Edit only (No Start button) */}
                          {normStatus === "draft" && (
                            <button
                              onClick={() => handleEdit(session)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-amber-600"
                              title="Edit Sesi"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>
                          )}

                          {/* Running / Ongoing status -> Show Monitor & Akhiri */}
                          {normStatus === "running" && (
                            <>
                              <button
                                onClick={() => navigate("/admin/live")}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 shadow-xs"
                                title="Buka Monitor Live"
                              >
                                <Activity size={13} />
                                Monitor
                              </button>

                              <button
                                onClick={() => handleFinish(session.id)}
                                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                title="Akhiri Sesi"
                              >
                                <Square size={13} />
                                Akhiri
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => navigate(`/admin/sessions/${session.id}`)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                            title="Lihat Detail Sesi"
                          >
                            Detail
                            <ArrowRight size={12} />
                          </button>

                          <button
                            onClick={() => handleDelete(session.id)}
                            className="p-1 rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Hapus Sesi"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Enhanced Pagination Controls Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-200 px-5 py-3 text-xs text-slate-500 bg-slate-50/60 gap-4">
          <div className="flex items-center gap-4">
            <div>
              Menampilkan{" "}
              <span className="font-bold text-slate-900">
                {filteredSessions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="font-bold text-slate-900">
                {Math.min(currentPage * pageSize, filteredSessions.length)}
              </span>{" "}
              dari <span className="font-bold text-slate-900">{filteredSessions.length}</span> total sesi
            </div>

            <div className="flex items-center gap-1 text-slate-600">
              <span>Per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-bold text-xs focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {/* Pagination Page Number Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-7 w-7 rounded-md text-xs font-bold transition ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}


function StatSummaryCard({ label, value, icon, bgColor, badgeText }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bgColor}`}>
          {icon}
        </div>
        {badgeText && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            {badgeText}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="mt-0.5 text-xs font-medium text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function FilterTabBtn({ label, active, activeColor, onClick }) {
  const defaultActiveColor = "text-blue-700 bg-blue-50 border-blue-200";

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
        active
          ? `${activeColor || defaultActiveColor} border shadow-2xs`
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
      }`}
    >
      <span>{label}</span>
    </button>
  );
}

function StatusBadge({ status }) {
  const configs = {
    running: {
      label: "Berlangsung",
      dot: "bg-emerald-500",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    published: {
      label: "Dipublikasikan",
      dot: "bg-indigo-500",
      bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    draft: {
      label: "Draft",
      dot: "bg-amber-500",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
    },
    completed: {
      label: "Selesai",
      dot: "bg-blue-500",
      bg: "bg-blue-50 text-blue-700 border-blue-200",
    },
  };

  const cfg = configs[status] || configs.draft;


  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}