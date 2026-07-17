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
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import StaseModal from "@/features/admin/components/StaseModal";

import { getSessionById } from "@/services/session.service";
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
  const [selectedStage, setSelectedStage] = useState(null);
  const [openStageModal, setOpenStageModal] = useState(false);

  async function load() {
    setLoading(true);

    const sessionData = await getSessionById(id);
    const stageRows = await getStages(id);

    setSession(sessionData);
    setStages(stageRows);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleSaveStage(payload) {
    try {
      if (selectedStage) {
        await updateStage(selectedStage.id, payload);
      } else {
        await createStage(id, payload);
      }

      setSelectedStage(null);
      setOpenStageModal(false);
      await load();
      alert("Stase berhasil disimpan.");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan stase. Coba lagi.");
    }
  }

  async function handleDeleteStage(stageId) {
    if (!confirm("Hapus stase ini?")) return;

    try {
      await deleteStage(stageId);
      await load();
      alert("Stase berhasil dihapus.");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus stase. Coba lagi.");
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[500px] items-center justify-center">
          Loading...
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

  return (
    <AdminLayout>
      <div className="mb-8">
        <NavLink
          to="/admin/sessions"
          className="mb-5 inline-flex items-center gap-2 text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Kembali ke Daftar Sesi
        </NavLink>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{session?.title}</h1>
            <p className="mt-2 text-slate-500">{session?.description}</p>
          </div>

          <button
            onClick={() => {
              setSelectedStage(null);
              setOpenStageModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Tambah Stase
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<CalendarDays />} title="Tanggal" value={session?.session_date} />
        <SummaryCard icon={<Users />} title="Maksimal Peserta" value={session?.max_participants} />
        <SummaryCard icon={<GraduationCap />} title="Jumlah Stase" value={stages.length} />
        <SummaryCard icon={<ClipboardList />} title="Status" value={session?.status ?? "draft"} />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Daftar Stase</h2>
            <p className="text-slate-500">Kelola stase yang digunakan pada sesi ini.</p>
          </div>
        </div>

        {stages.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-slate-400">
            Belum ada stase.
          </div>
        ) : (
          <div className="space-y-3">
            {stages.map((stage) => (
              <div key={stage.id} className="flex items-center justify-between rounded-2xl border p-4">
                <div>
                  <div className="font-semibold">Stase {stage.station_number}</div>
                  <div className="text-sm text-slate-500">{stage.title}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStage(stage);
                      setOpenStageModal(true);
                    }}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => navigate(`/admin/stages/${stage.id}`)}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Kelola Soal
                  </button>

                  <button
                    onClick={() => handleDeleteStage(stage.id)}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    <Trash2 size={16} />
                    Hapus
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

function SummaryCard({ icon, title, value }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="mb-4 text-blue-600">{icon}</div>
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="mt-2 text-3xl font-bold">{value}</h2>
    </div>
  );
}