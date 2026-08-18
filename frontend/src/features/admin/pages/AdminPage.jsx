import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import {
  Users,
  UserCheck,
  GraduationCap,
  Building2,
  Activity,
  Clock,
  ArrowRight,
  Loader2,
  Plus,
  BookOpen,
  CheckCircle2,
  Layers,
  Sparkles,
  ShieldCheck,
  Play,
  Calendar,
  MapPin,
  ChevronRight,
  FileSpreadsheet,
  Settings,
  Database,
} from "lucide-react";
import { getDashboardStats, subscribeLive } from "@/services/live.service";

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const channel = subscribeLive(load);
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const session = stats?.activeSession ?? null;
  const recentSessions = stats?.recentSessions ?? [];

  return (
    <AdminLayout>
      {/* Top Banner Header */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 -translate-y-8">
          <Database size={320} />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-extrabold text-emerald-300 backdrop-blur-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Control Room Aktif
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur-xs">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
              MedSkill OSCE Control Room
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-medium">
              Pusat kendali ujian sirkuit OSCE terpadu. Pantau sesi berjalan, kelola bank soal medis terstandar, dan atur alokasi peserta serta penguji secara real-time.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/admin/sessions/create")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-95"
            >
              <Plus size={16} />
              Buat Sesi OSCE
            </button>

            <button
              onClick={() => navigate("/admin/cases")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white shadow-xs backdrop-blur-xs transition hover:bg-white/20 active:scale-95"
            >
              <BookOpen size={16} />
              Bank Soal Medis
            </button>

            <button
              onClick={() => navigate("/admin/live")}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2.5 text-xs font-bold text-emerald-300 shadow-xs backdrop-blur-xs transition hover:bg-emerald-500/30 active:scale-95"
            >
              <Activity size={16} />
              Live Monitor
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-white shadow-xs border border-slate-100"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-8">
          <StatCard
            title="Total Sesi OSCE"
            value={stats?.sessions ?? 0}
            subtitle="Sesi Ujian Terdaftar"
            icon={<Building2 size={20} />}
            color="blue"
            onClick={() => navigate("/admin/sessions")}
          />
          <StatCard
            title="Bank Soal Medis"
            value={stats?.questionBankCount ?? 10}
            subtitle="Kasus Medis Terstandar"
            icon={<BookOpen size={20} />}
            color="indigo"
            onClick={() => navigate("/admin/cases")}
          />
          <StatCard
            title="Peserta Terdaftar"
            value={stats?.participants ?? 0}
            subtitle="Peserta Ujian"
            icon={<Users size={20} />}
            color="emerald"
            onClick={() => navigate("/admin/participants")}
          />
          <StatCard
            title="Dokter Penguji"
            value={stats?.examiners ?? 0}
            subtitle="Penguji Terverifikasi"
            icon={<UserCheck size={20} />}
            color="violet"
            onClick={() => navigate("/admin/examiners")}
          />
          <StatCard
            title="Status Sistem"
            value="ONLINE"
            subtitle="Sistem Terhubung"
            icon={<ShieldCheck size={20} />}
            color="teal"
          />
        </div>
      )}

      {/* 2-Column Main Dashboard Content */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN (8 COLS): Live Session Banner + Recent Sessions Grid */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live / Ongoing Session Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Activity size={18} className="text-emerald-600" />
                Status Live Monitoring Sirkuit
              </h2>
              <button
                onClick={() => navigate("/admin/live")}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
              >
                Buka Panel Live
                <ChevronRight size={14} />
              </button>
            </div>

            {!session ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    Tidak Ada Sesi yang Sedang Berjalan Saat Ini
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Anda memiliki draft sesi ujian sirkuit yang siap diterbitkan. Pilih sesi dari daftar di bawah ini untuk memulai rotasi timer OSCE live.
                  </p>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => navigate("/admin/sessions")}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition active:scale-95"
                  >
                    <Play size={15} />
                    Lihat & Jalankan Draft Sesi
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      SESI ONGOING • SEDANG BERLANGSUNG
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-200/80 px-3 py-1 text-xs font-extrabold text-emerald-900 border border-emerald-300">
                    Sirkuit Aktif
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {session.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-slate-400" />
                      {session.location_building || "Gedung Skill Lab"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-400" />
                      Mulai:{" "}
                      {session.started_at
                        ? new Date(session.started_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "08:00 WIB"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Pos Stase</p>
                    <p className="text-base font-black text-emerald-950">{session.total_stations || 8} Pos</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Durasi Stase</p>
                    <p className="text-base font-black text-emerald-950">{session.station_duration_minutes || 12} Menit</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-2xs col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status Rotasi</p>
                    <p className="text-base font-black text-emerald-600">Rolling Auto</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/admin/live")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
                >
                  <Activity size={16} />
                  Buka Live Monitor
                </button>
              </div>
            )}
          </div>

          {/* Recent Sessions List */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 size={18} className="text-blue-600" />
                  Daftar Sesi OSCE Terbaru
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar 4 sesi OSCE terbaru.
                </p>
              </div>

              <button
                onClick={() => navigate("/admin/sessions")}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
              >
                Lihat Semua Sesi
                <ChevronRight size={14} />
              </button>
            </div>

            {recentSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada sesi OSCE di database.
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((sess) => {
                  const isDraft = sess.status === "draft";
                  const isOngoing = sess.status === "ongoing";
                  const isCompleted = sess.status === "completed";

                  return (
                    <div
                      key={sess.id}
                      className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-300 hover:bg-white hover:shadow-md flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-[240px]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md border px-2.5 py-0.5 text-[10px] font-black uppercase ${
                              isOngoing
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : isDraft
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : isCompleted
                                ? "bg-blue-100 text-blue-900 border-blue-300"
                                : "bg-slate-200 text-slate-800 border-slate-300"
                            }`}
                          >
                            {sess.status}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            <Calendar size={13} />
                            {sess.session_date || "15 Agustus 2026"}
                          </span>
                        </div>

                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition">
                          {sess.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" />
                            {sess.location_building || "Gedung Skill Lab"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Layers size={13} className="text-blue-500" />
                            {sess.total_stations || 8} Station Pos
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/sessions/${sess.id}/edit`)}
                          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition active:scale-95 shadow-2xs"
                        >
                          Edit Sesi
                        </button>
                        <button
                          onClick={() => navigate(`/admin/sessions/${sess.id}`)}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition active:scale-95 shadow-xs"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS): Organ Matrix & Quick Links */}
        <div className="lg:col-span-4 space-y-6">
          {/* Question Bank Organ System Summary */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                Matriks Bank Soal Medis
              </h2>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                8 Kategori
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Koleksi 10 kasus medis terstandar lengkap dengan rubrik 4-level dan berkas penunjang (EKG, Radiologi, Lab).
            </p>

            <div className="grid grid-cols-2 gap-2">
              <OrganChip label="Kardiovaskular" count="2 Kasus" color="blue" />
              <OrganChip label="Respirasi" count="2 Kasus" color="teal" />
              <OrganChip label="Neurologi" count="1 Kasus" color="indigo" />
              <OrganChip label="Digestif" count="1 Kasus" color="amber" />
              <OrganChip label="Endokrin" count="2 Kasus" color="rose" />
              <OrganChip label="Pediatri" count="1 Kasus" color="emerald" />
              <OrganChip label="THT-KL" count="1 Kasus" color="violet" />
              <OrganChip label="Muskuloskeletal" count="1 Kasus" color="slate" />
            </div>

            <button
              onClick={() => navigate("/admin/cases/create")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100 transition active:scale-95"
            >
              <Plus size={15} />
              Buat Kasus Bank Soal Baru
            </button>
          </div>

          {/* Quick Links Menu Panel */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Menu Navigasi Administrator
            </h2>

            <QuickMenuBtn
              title="Kelola Sesi Ujian OSCE"
              subtitle="Sirkuit 6 Stase + Rest"
              icon={<Building2 size={18} className="text-blue-600" />}
              onClick={() => navigate("/admin/sessions")}
            />

            <QuickMenuBtn
              title="Katalog Bank Soal"
              subtitle="Kasus Baku & Penunjang"
              icon={<BookOpen size={18} className="text-indigo-600" />}
              onClick={() => navigate("/admin/cases")}
            />

            <QuickMenuBtn
              title="Registrasi Peserta"
              subtitle="Data Mahasiswa / Gelombang"
              icon={<Users size={18} className="text-emerald-600" />}
              onClick={() => navigate("/admin/participants")}
            />

            <QuickMenuBtn
              title="Penugasan Dokter Penguji"
              subtitle="Alokasi Stase Spesialis"
              icon={<UserCheck size={18} className="text-violet-600" />}
              onClick={() => navigate("/admin/examiners")}
            />

            <QuickMenuBtn
              title="Laporan & Rekap Nilai"
              subtitle="Ekspor Transkrip OSCE"
              icon={<FileSpreadsheet size={18} className="text-amber-600" />}
              onClick={() => navigate("/admin/reports")}
            />

            <QuickMenuBtn
              title="Pengaturan Sistem"
              subtitle="Konfigurasi Instansi"
              icon={<Settings size={18} className="text-slate-600" />}
              onClick={() => navigate("/admin/settings")}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, subtitle, icon, color, onClick }) {
  const colors = {
    blue: "bg-blue-600 text-white",
    indigo: "bg-indigo-600 text-white",
    violet: "bg-violet-600 text-white",
    emerald: "bg-emerald-600 text-white",
    teal: "bg-teal-600 text-white",
    amber: "bg-amber-500 text-white",
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${
        onClick ? "hover:border-blue-300" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-xs ${colors[color]}`}
        >
          {icon}
        </div>
        <span className="text-2xl font-black text-slate-900">{value}</span>
      </div>
      <p className="text-xs font-bold text-slate-900">{title}</p>
      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

function OrganChip({ label, count, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs flex items-center justify-between">
      <span className="font-bold text-slate-700 truncate">{label}</span>
      <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-900 shrink-0 ml-1">
        {count}
      </span>
    </div>
  );
}

function QuickMenuBtn({ title, subtitle, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-blue-200 hover:bg-white hover:shadow-xs group"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-2xs border border-slate-200 group-hover:border-blue-200">
          {icon}
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
            {title}
          </p>
          <p className="text-[10px] font-semibold text-slate-400">{subtitle}</p>
        </div>
      </div>
      <ChevronRight size={15} className="text-slate-400 group-hover:text-blue-600 transition" />
    </button>
  );
}