import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  GraduationCap,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  FileText,
  Clock,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Building2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Activity,
  Award,
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import { fetchSessionById } from "@/services/sessionService";

export default function SessionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [session, setSession] = useState(null);
  const [stages, setStages] = useState([]);
  const [expandedStageIndex, setExpandedStageIndex] = useState(0);

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await fetchSessionById(id);
        if (data) {
          setSession(data);
          setStages(data.stations || []);
        } else {
          setSession(null);
          setStages([]);
        }
      } catch (err) {
        console.warn("Could not fetch session detail from Supabase:", err);
        setSession(null);
        setStages([]);
      }
    }

    loadDetail();
  }, [id]);

  if (!session) {
    return (
      <AdminLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Sesi tidak ditemukan.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Back Link & Header */}
      <div className="mb-6">
        <NavLink
          to="/admin/sessions"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          Kembali ke Kelola Sesi
        </NavLink>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {session.title}
              </h1>
              <StatusBadge status={session.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{session.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/admin/sessions/${session.id}/edit`)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
            >
              <Pencil size={15} />
              Edit Sesi Ini
            </button>

            {session.status === "running" ? (
              <button
                onClick={() => navigate("/admin/live")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95"
              >
                <Activity size={15} />
                Buka Monitor Live
              </button>
            ) : (
              <button
                onClick={() => navigate(`/admin/sessions/${session.id}/edit`)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
              >
                <CheckCircle2 size={15} />
                Ubah Pengaturan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Summary Cards Grid */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<CalendarDays size={18} className="text-blue-600" />}
          title="Tanggal & Jam Pelaksanaan"
          value={session.session_date}
          subtext={`${session.start_time} - ${session.end_time || "Selesai"}`}
        />
        <SummaryCard
          icon={<Users size={18} className="text-emerald-600" />}
          title="Kapasitas Peserta"
          value={`${session.registered_participants || session.max_participants} Peserta`}
          subtext="1 peserta per stase per rotasi"
        />
        <SummaryCard
          icon={<GraduationCap size={18} className="text-indigo-600" />}
          title="Jumlah Stase Ujian"
          value={`${session.total_stations || stages.length} Stase Ujian`}
          subtext={`${session.station_duration_minutes || 15}m stase • ${session.break_duration_minutes || 3}m jeda rotasi`}
        />
        <SummaryCard
          icon={<ClipboardList size={18} className="text-amber-600" />}
          title="Dokter Penguji"
          value={`${session.total_examiners || stages.length} Penguji`}
          subtext="1 penguji per stase"
        />
      </div>

      {/* Quick Navigation to Participants & Examiners */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <NavLink
          to={`/admin/sessions/${session.id}/participants`}
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-blue-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <Users size={18} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">Penugasan & Verifikasi Peserta</div>
              <div className="text-[11px] text-slate-500">Plotting daftar peserta ujian per gelombang</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 transition" />
        </NavLink>

        <NavLink
          to={`/admin/sessions/${session.id}/examiners`}
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-blue-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <UserCheck size={18} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">Penugasan Dokter Penguji</div>
              <div className="text-[11px] text-slate-500">Mapping 1 dokter penguji untuk tiap stase</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition" />
        </NavLink>
      </div>

      {/* OSCE Rules Summary Badge */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sliders size={16} className="text-blue-600" />
          Aturan Pelaksanaan & Otomatisasi Sesi Ini
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="font-bold text-slate-900 block">Single Live Session</span>
            <span className="text-slate-500 text-[11px]">Eksklusif 1 sesi live</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="font-bold text-slate-900 block">Otomatisasi Rolling</span>
            <span className="text-slate-500 text-[11px]">Rotasi otomatis per ronde</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="font-bold text-slate-900 block">Penguncian Nilai</span>
            <span className="text-slate-500 text-[11px]">Auto lock saat waktu habis</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="font-bold text-slate-900 block">Toleransi Keterlambatan</span>
            <span className="text-slate-500 text-[11px]">Batas maksimal 5 menit</span>
          </div>
        </div>
      </div>

      {/* Stages Showcase & Scenarios Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              Arsitektur Sirkuit 8 Stase & Urutan Rotasi (Kanban Order)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Urutan 6 Stase Ujian Aktif yang disusun secara terstruktur untuk rotasi sirkuit peserta.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
            Sirkuit 6 Stase Ujian Aktif
          </span>
        </div>

        {/* Station Order List with Reordering Controls */}
        <div className="space-y-3">
          {stages.map((stage, idx) => {
            const isExpanded = expandedStageIndex === idx;
            const isBreakStation = stage.is_break || stage.title.toLowerCase().includes("istirahat") || stage.title.toLowerCase().includes("break");

            const moveUp = (e) => {
              e.stopPropagation();
              if (idx === 0) return;
              const newStages = [...stages];
              const temp = newStages[idx];
              newStages[idx] = newStages[idx - 1];
              newStages[idx - 1] = temp;
              // Re-index station_number
              setStages(newStages.map((st, i) => ({ ...st, station_number: i + 1 })));
            };

            const moveDown = (e) => {
              e.stopPropagation();
              if (idx === stages.length - 1) return;
              const newStages = [...stages];
              const temp = newStages[idx];
              newStages[idx] = newStages[idx + 1];
              newStages[idx + 1] = temp;
              setStages(newStages.map((st, i) => ({ ...st, station_number: i + 1 })));
            };

            return (
              <div
                key={stage.id || idx}
                className={`overflow-hidden rounded-xl border transition ${
                  isBreakStation
                    ? "border-amber-200 bg-amber-50/60 hover:border-amber-400"
                    : "border-slate-200 bg-white shadow-2xs hover:border-blue-300"
                }`}
              >
                <div
                  onClick={() => setExpandedStageIndex(isExpanded ? null : idx)}
                  className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-100/50 transition gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg font-extrabold text-white text-xs ${
                        isBreakStation ? "bg-amber-600" : "bg-blue-600"
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xs text-slate-900">{stage.title}</h3>
                        {isBreakStation ? (
                          <span className="rounded-md bg-amber-200/90 border border-amber-300 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                            STASE BREAK / ISTIRAHAT
                          </span>
                        ) : (
                          <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                            STASE UJIAN AKTIF
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Kasus: <strong className="text-slate-800">{stage.case_title}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Order Move Up/Down Controls */}
                    <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={moveUp}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        title="Geser Stase Ke Atas"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === stages.length - 1}
                        onClick={moveDown}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        title="Geser Stase Ke Bawah"
                      >
                        <ChevronDown size={15} />
                      </button>
                    </div>

                    <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md whitespace-nowrap">
                      12 Menit (1m/10m/1m)
                    </span>

                    {isExpanded ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-4 text-xs bg-white">
                    {/* Doctor Examiner Assigned */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Dokter Penguji Stase</span>
                        <p className="font-bold text-slate-900 text-xs mt-0.5">
                          {stage.examiner_name || "dr. Alexander Budiman, Sp.JP"}
                        </p>
                      </div>
                      <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        Penguji Siap
                      </span>
                    </div>

                    {/* Skenario Kasus */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Skenario Kasus Medis</h4>
                      <p className="text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-xl leading-relaxed font-medium">
                        {stage.scenario || "Pasien datang dengan keluhan spesifik sesuai skenario stase medis ini. Peserta diwajibkan melakukan anamnesis terarah, pemeriksaan fisik kardiovaskular / spesifik, dan penetapan diagnosis kerja."}
                      </p>
                    </div>

                    {/* Instructions */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Instruksi Peserta Ujian</h4>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 whitespace-pre-line font-medium">
                          {stage.participant_instruction || "1. Lakukan anamnesis terarah.\n2. Lakukan pemeriksaan fisik sesuai standar SOP.\n3. Sampaikan diagnosis kerja & terapi."}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Instruksi Dokter Penguji</h4>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 whitespace-pre-line font-medium">
                          {stage.examiner_instruction || "Amati kepatuhan prosedur sterilitas tangan, ketepatan auskultasi/pemeriksaan fisik, dan penyampaian edukasi ke pasien."}
                        </div>
                      </div>
                    </div>

                    {/* Checklist & Answer Keys */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase mb-1 flex items-center justify-between">
                        <span>Checklist Penilaian & Kunci Jawaban Rubrik</span>
                        <span className="text-blue-600 text-[11px] font-semibold">
                          {stage.total_questions || 15} Item Terdaftar
                        </span>
                      </h4>

                      <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 space-y-2">
                        <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-1.5 text-[11px]">
                          <span>Item Rubrik & Kunci Jawaban Benar</span>
                          <span>Bobot Skor</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                          <p className="font-bold text-slate-900">1. Menyapa pasien & membina sambung rasa</p>
                          <p className="text-emerald-800 text-[11px] font-medium">Kunci: Menyapa salam, perkenalan diri, & konfirmasi identitas pasien (1 Poin)</p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                          <p className="font-bold text-slate-900">2. Anamnesis terarah & keluhan utama</p>
                          <p className="text-emerald-800 text-[11px] font-medium">Kunci: Menanyakan onset, lokasi, kualitas, dan riwayat penyakit terarah (3 Poin)</p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                          <p className="font-bold text-slate-900">3. Prosedur pemeriksaan fisik medis</p>
                          <p className="text-emerald-800 text-[11px] font-medium">Kunci: Melakukan pemeriksaan fisik dengan posisi & alat yang tepat sesuai SOP (3 Poin)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

function SummaryCard({ icon, title, value, subtext }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="mb-2">{icon}</div>
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <h2 className="mt-1 text-xl font-bold text-slate-900">{value}</h2>
      {subtext && <p className="mt-0.5 text-[11px] text-slate-400">{subtext}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    running: { label: "Berlangsung", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    published: { label: "Dipublikasikan", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    draft: { label: "Draft", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    completed: { label: "Selesai", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  };

  const cfg = configs[status] || configs.draft;

  return (
    <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}