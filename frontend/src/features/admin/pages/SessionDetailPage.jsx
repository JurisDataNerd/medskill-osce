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
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import StaseModal from "@/features/admin/components/StaseModal";
import {
  INITIAL_MOCK_SESSIONS,
  MOCK_STAGES_BY_SESSION,
} from "@/features/admin/data/mockAdminData";


export default function SessionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [session, setSession] = useState(null);
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);
  const [openStageModal, setOpenStageModal] = useState(false);

  useEffect(() => {
    // Find mock session by ID or fallback to first mock session
    const mockSession =
      INITIAL_MOCK_SESSIONS.find((s) => s.id === id) || INITIAL_MOCK_SESSIONS[0];

    const mockStages =
      MOCK_STAGES_BY_SESSION[id] || MOCK_STAGES_BY_SESSION["session-osce-001"] || [];

    setSession(mockSession);
    setStages(mockStages);
  }, [id]);

  function handleSaveStage(payload) {
    if (selectedStage) {
      setStages((prev) =>
        prev.map((s) => (s.id === selectedStage.id ? { ...s, ...payload } : s))
      );
    } else {
      const newStage = {
        id: `stage-${Date.now()}`,
        station_number: payload.station_number || stages.length + 1,
        title: payload.title || `Stase ${stages.length + 1}`,
        case_title: payload.scenario || "Kasus Medis Standar",
        duration_minutes: payload.duration_minutes || 15,
        examiner_name: "dr. Penguji Stase",
        total_questions: 15,
      };
      setStages((prev) => [...prev, newStage]);
    }

    setSelectedStage(null);
    setOpenStageModal(false);
  }

  function handleDeleteStage(stageId) {
    if (!confirm("Apakah Anda yakin ingin menghapus stase ini?")) return;
    setStages((prev) => prev.filter((s) => s.id !== stageId));
  }

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
          Kembali ke Daftar Sesi
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
              onClick={() => {
                setSelectedStage(null);
                setOpenStageModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
            >
              <Plus size={16} />
              Tambah Stase
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<CalendarDays size={18} className="text-blue-600" />}
          title="Tanggal & Jam"
          value={session.session_date}
          subtext={`${session.start_time} - ${session.end_time || "Selesai"}`}
        />
        <SummaryCard
          icon={<Users size={18} className="text-emerald-600" />}
          title="Maksimal Peserta"
          value={`${session.registered_participants || session.max_participants} Peserta`}
          subtext="Terdaftar di sesi"
        />
        <SummaryCard
          icon={<GraduationCap size={18} className="text-indigo-600" />}
          title="Jumlah Stase"
          value={`${stages.length} Stase`}
          subtext={`${session.station_duration_minutes || 15} menit / stase`}
        />
        <SummaryCard
          icon={<ClipboardList size={18} className="text-amber-600" />}
          title="Penguji Terplot"
          value={`${session.total_examiners || stages.length} Penguji`}
          subtext="1 penguji per stase"
        />
      </div>

      {/* Quick Navigation to Participants & Examiners */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <NavLink
          to={`/admin/sessions/${session.id}/participants`}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-blue-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <Users size={18} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Kelola Peserta Sesi</div>
              <div className="text-xs text-slate-500">Plotting & verifikasi hadir peserta</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 transition" />
        </NavLink>

        <NavLink
          to={`/admin/sessions/${session.id}/examiners`}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-blue-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <UserCheck size={18} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Kelola Penguji Sesi</div>
              <div className="text-xs text-slate-500">Penugasan dokter penguji per stase</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition" />
        </NavLink>
      </div>

      {/* Stages List */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daftar Stase OSCE</h2>
            <p className="text-xs text-slate-500">Kelola stase, skenario kasus, dan lembar soal ujian.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {stages.length} Stase Terkonfigurasi
          </span>
        </div>

        {stages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
            Belum ada stase yang ditambahkan pada sesi ini.
          </div>
        ) : (
          <div className="space-y-3">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                      Stase {stage.station_number}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {stage.title}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText size={13} className="text-slate-400" />
                      Kasus: <strong className="text-slate-700">{stage.case_title}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-400" />
                      {stage.duration_minutes || 15} Menit
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <UserCheck size={13} className="text-slate-400" />
                      Penguji: {stage.examiner_name || "Belum diassign"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedStage(stage);
                      setOpenStageModal(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>

                  <button
                    onClick={() => navigate(`/admin/stages/${stage.id}`)}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-xs"
                  >
                    Kelola Soal
                    <ArrowRight size={12} />
                  </button>

                  <button
                    onClick={() => handleDeleteStage(stage.id)}
                    className="p-1.5 rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Hapus Stase"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StaseModal
        open={openStageModal}
        initialData={selectedStage}
        onClose={() => {
          setSelectedStage(null);
          setOpenStageModal(false);
        }}
        onSave={handleSaveStage}
      />
    </AdminLayout>
  );
}

function SummaryCard({ icon, title, value, subtext }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
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
    draft: { label: "Draft", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    completed: { label: "Selesai", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  };

  const cfg = configs[status] || configs.draft;

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}