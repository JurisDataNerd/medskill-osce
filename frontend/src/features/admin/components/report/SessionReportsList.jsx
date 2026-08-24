import { useState, useMemo } from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  Award,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  Building2,
  ChevronLeft,
} from "lucide-react";

export default function SessionReportsList({
  sessions = [],
  onSelectSession,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'completed', 'published', 'ongoing'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        s.title?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.location_building?.toLowerCase().includes(q);

      if (!matchQuery) return false;

      const st = String(s.status || "").toLowerCase();
      if (statusFilter === "all") return true;
      if (statusFilter === "completed") return st === "completed";
      if (statusFilter === "published") return st === "published" || st === "scheduled";
      if (statusFilter === "ongoing") return st === "ongoing" || st === "running" || st === "waiting_room";
      return true;
    });
  }, [sessions, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage) || 1;
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSessions.slice(start, start + itemsPerPage);
  }, [filteredSessions, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    const published = sessions.filter((s) => s.status === "published" || s.status === "scheduled").length;
    return { total, completed, published };
  }, [sessions]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Laporan & Rekapitulasi Nilai OSCE
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Pilih sesi ujian OSCE untuk melihat rekap nilai mahasiswa, analitik standar kelulusan, dan unduh berita acara resmi.
          </p>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Sesi OSCE</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total} Sesi</p>
            <p className="text-[11px] text-slate-500 font-medium">Terdaftar di database</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
            <Building2 size={24} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Sesi Selesai Dievaluasi</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.completed} Sesi</p>
            <p className="text-[11px] text-slate-500 font-medium">Rekap nilai & kelulusan final</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Sesi Terjadwal / Aktif</span>
            <p className="text-2xl font-black text-indigo-700 mt-1">{stats.published} Sesi</p>
            <p className="text-[11px] text-slate-500 font-medium">Siap atau sedang berlangsung</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari judul sesi atau gedung skill lab..."
            className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setStatusFilter("all");
              setCurrentPage(1);
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({sessions.length})
          </button>
          <button
            onClick={() => {
              setStatusFilter("completed");
              setCurrentPage(1);
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              statusFilter === "completed"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            Selesai ({stats.completed})
          </button>
          <button
            onClick={() => {
              setStatusFilter("published");
              setCurrentPage(1);
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              statusFilter === "published"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
            }`}
          >
            Terjadwal ({stats.published})
          </button>
        </div>
      </div>

      {/* Grid of Sessions Cards */}
      {paginatedSessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <FileText size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Tidak ada sesi OSCE yang ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau filter status untuk melihat laporan sesi OSCE lainnya.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedSessions.map((sess) => {
            const isCompleted = sess.status === "completed";
            const isOngoing = sess.status === "ongoing" || sess.status === "running";

            return (
              <div
                key={sess.id}
                onClick={() => onSelectSession(sess.id)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md cursor-pointer"
              >
                <div className="space-y-3">
                  {/* Top Status & Date */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : isOngoing
                          ? "bg-blue-100 text-blue-900 border-blue-300"
                          : "bg-indigo-100 text-indigo-900 border-indigo-300"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={11} /> Selesai
                        </>
                      ) : isOngoing ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" /> Sedang Berjalan
                        </>
                      ) : (
                        <>
                          <Clock size={11} /> Terjadwal
                        </>
                      )}
                    </span>

                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <CalendarDays size={12} />
                      {sess.session_date || "Tanggal belum ditentukan"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                      {sess.title || "Sesi OSCE"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {sess.description || "Tidak ada deskripsi tambahan untuk sesi ini."}
                    </p>
                  </div>

                  {/* Location & Stations Info */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate font-medium">
                        {sess.location_building || "Lokasi belum ditentukan"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Award size={13} className="text-amber-500" />
                        {sess.total_stations || sess.stations?.length || 0} Pos Stase
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-blue-500" />
                        {sess.max_participants || sess.session_participants?.length || 0} Mahasiswa
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700">
                    Buka Rekapitulasi Nilai
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs font-semibold text-slate-600">
          <div>
            Menampilkan halaman <strong className="text-slate-900">{currentPage}</strong> dari{" "}
            <strong className="text-slate-900">{totalPages}</strong> (Total {filteredSessions.length} Sesi)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              <ChevronLeft size={14} />
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`h-8 w-8 rounded-xl text-xs font-black transition cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              Selanjutnya
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
