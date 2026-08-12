import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Users,
  GraduationCap,
  ClipboardList,
  Play,
  Square,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import StaseModal from "@/features/admin/components/StaseModal";
import ConfirmModal from "@/components/ConfirmModal";

import {
  getSessionById,
  startSession,
  finishSession,
} from "@/services/session.service";

import {
  getStages,
  createStage,
  updateStage,
  deleteStage,
} from "@/services/stage.service";

export default function SessionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [stages, setStages] = useState([]);

  const [openStage, setOpenStage] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Ya, Lanjutkan",
    cancelText: "Batal",
    variant: "primary",
    onConfirm: null,
  });

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);

    const sessionData = await getSessionById(id);
    setSession(sessionData);

    const stageRows = await getStages(id);
    setStages(stageRows);

    setLoading(false);
  }

  async function handleSaveStage(payload) {
    if (selectedStage) {
      await updateStage(selectedStage.id, payload);
    } else {
      await createStage(id, payload);
    }

    setSelectedStage(null);
    setOpenStage(false);

    load();
  }

  async function handleDeleteStage(stageId) {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Stase?",
      message: "Apakah Anda yakin ingin menghapus stase ini?",
      confirmText: "Ya, Hapus Stase",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await deleteStage(stageId);
        load();
      },
    });
  }

  async function handleStart() {
    setConfirmModal({
      isOpen: true,
      title: "Mulai Sesi Simulasi?",
      message: "Apakah Anda yakin ingin memulai sesi simulasi OSCE sekarang?",
      confirmText: "Ya, Mulai Sesi",
      cancelText: "Batal",
      variant: "primary",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await startSession(id);
        load();
      },
    });
  }

  async function handleFinish() {
    setConfirmModal({
      isOpen: true,
      title: "Akhiri Sesi Simulasi?",
      message: "Apakah Anda yakin ingin mengakhiri sesi simulasi ini?",
      confirmText: "Ya, Selesaikan Sesi",
      cancelText: "Batal",
      variant: "warning",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await finishSession(id);
        load();
      },
    });
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[500px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  if (!session) {
    return (
      <AdminLayout>
        <div className="rounded-2xl bg-white p-12 text-center shadow">
          Sesi tidak ditemukan.
        </div>
      </AdminLayout>
    );
  }

  const isDraft = session.status === "draft";
  const isRunning = session.status === "running";

  return (
    <AdminLayout>

      <button
        onClick={() => navigate("/admin/sessions")}
        className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft size={18} />
        Kembali ke Daftar Sesi
      </button>

      <div className="mb-8 flex items-start justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            {session.title}
          </h1>

          <p className="mt-2 text-slate-500">
            {session.description}
          </p>

        </div>

        <div className="flex gap-3">

          {isDraft && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              <Play size={18} />
              Mulai Sesi
            </button>
          )}

          {isRunning && (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
            >
              <Square size={18} />
              Akhiri Sesi
            </button>
          )}

        </div>

      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <Card
          icon={<CalendarDays />}
          title="Tanggal"
          value={session.session_date}
        />

        <Card
          icon={<Clock />}
          title="Durasi per Stase"
          value={`${session.station_duration_minutes} Menit`}
        />

        <Card
          icon={<Users />}
          title="Maksimal Peserta"
          value={session.max_participants}
        />

        <Card
          icon={<GraduationCap />}
          title="Jumlah Stase"
          value={stages.length}
        />

      </div>

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold">
            Daftar Stase
          </h2>

          <p className="text-slate-500">
            Tambahkan seluruh stase yang digunakan pada sesi ini.
          </p>

        </div>

        <button
          onClick={() => {
            setSelectedStage(null);
            setOpenStage(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Tambah Stase
        </button>

      </div>

      <div className="space-y-5">
                {stages.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow">
            <ClipboardList
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />

            <h3 className="text-xl font-semibold">
              Belum Ada Stase
            </h3>

            <p className="mt-2 text-slate-500">
              Tambahkan stase terlebih dahulu sebelum mengisi soal.
            </p>
          </div>
        )}

        {stages.map((stage) => (
          <div
            key={stage.id}
            className="rounded-2xl bg-white p-6 shadow transition hover:shadow-lg"
          >
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                  <ClipboardList
                    className="text-blue-600"
                    size={24}
                  />
                </div>

                <div>

                  <h3 className="text-xl font-bold">
                    Stase {stage.station_number}
                  </h3>

                  <p className="text-slate-500">
                    {stage.title}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <button
                  onClick={() => {
                    setSelectedStage(stage);
                    setOpenStage(true);
                  }}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-slate-50"
                >
                  <Pencil size={17} />
                  Edit
                </button>

                <button
                  onClick={() =>
                    navigate(`/admin/stages/${stage.id}`)
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Kelola Soal
                </button>

                <button
                  onClick={() =>
                    handleDeleteStage(stage.id)
                  }
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>

              </div>

            </div>
          </div>
        ))}

      </div>

      <StaseModal
        open={openStage}
        initialData={selectedStage}
        onClose={() => {
          setSelectedStage(null);
          setOpenStage(false);
        }}
        onSave={handleSaveStage}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
      />

    </AdminLayout>
  );
}

function Card({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <div className="mb-4 text-blue-600">
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {value}
      </h2>

    </div>
  );
}