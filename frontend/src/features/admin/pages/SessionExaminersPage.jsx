import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Clock, GraduationCap, Plus, Search, UserPlus, X, Check } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { getSessionExaminers } from "@/services/session.service";
import { MOCK_DOCTOR_REGISTRY } from "@/features/admin/data/mockAdminData";

const MOCK_EXAMINERS = [
  { id: "e1", station_number: 1, role: "examiner", status: "approved", profiles: { full_name: "dr. Alexander Budiman, Sp.JP", email: "alex.b@med.ac.id", is_online: true } },
  { id: "e2", station_number: 2, role: "examiner", status: "approved", profiles: { full_name: "dr. Faisal Hasibuan, Sp.P", email: "faisal.h@med.ac.id", is_online: true } },
  { id: "e3", station_number: 3, role: "examiner", status: "approved", profiles: { full_name: "dr. Citra Dewi, Sp.B", email: "citra.d@med.ac.id", is_online: false, last_seen: "2026-08-02T10:00:00Z" } },
  { id: "e4", station_number: 4, role: "examiner", status: "approved", profiles: { full_name: "dr. Doni Prasetyo, Sp.N", email: "doni.p@med.ac.id", is_online: true } },
  { id: "e5", station_number: 5, role: "examiner", status: "approved", profiles: { full_name: "dr. Eka Rahmawati, Sp.PD", email: "eka.r@med.ac.id", is_online: true } },
  { id: "e6", station_number: 6, role: "examiner", status: "approved", profiles: { full_name: "dr. Farhan Gunawan, Sp.THT-KL", email: "farhan.g@med.ac.id", is_online: true } },
];

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

export default function SessionExaminersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState("");
  const [targetStation, setTargetStation] = useState(1);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      const data = await getSessionExaminers(id);
      setExaminers(data && data.length > 0 ? data : MOCK_EXAMINERS);
    } catch (err) {
      console.error(err);
      setExaminers(MOCK_EXAMINERS);
    } finally {
      setLoading(false);
    }
  }

  function handleAssignDoctor(doctor) {
    const existing = examiners.find((e) => e.station_number === Number(targetStation));
    const newEntry = {
      id: `e-${Date.now()}`,
      station_number: Number(targetStation),
      role: "examiner",
      status: "approved",
      profiles: { full_name: doctor.name, email: doctor.email, is_online: true },
    };

    if (existing) {
      setExaminers((prev) =>
        prev.map((e) => (e.station_number === Number(targetStation) ? newEntry : e))
      );
    } else {
      setExaminers((prev) => [...prev, newEntry]);
    }

    setOpenAssignModal(false);
  }

  // Filter doctors in modal search
  const filteredDoctors = MOCK_DOCTOR_REGISTRY.filter(
    (d) =>
      d.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchDoctor.toLowerCase())
  );

  const byStation = examiners.reduce((acc, item) => {
    const key = item.station_number ?? 0;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const stationKeys = Object.keys(byStation)
    .map(Number)
    .sort((a, b) => a - b);

  const online = examiners.filter((e) => e.profiles?.is_online).length;

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
              Penugasan Penguji OSCE
            </h1>
            <p className="text-sm text-slate-500">
              Cari & tugaskan dokter penguji pada stase-stase yang ditentukan (1 penguji per stase).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenAssignModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
            >
              <UserPlus size={16} />
              Cari & Tugaskan Penguji
            </button>

            <div className="flex gap-2">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-center shadow-2xs">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total</p>
                <p className="text-sm font-bold text-slate-700">{examiners.length}</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center shadow-2xs">
                <p className="text-[10px] text-emerald-600 font-semibold uppercase">Online</p>
                <p className="text-sm font-bold text-emerald-700">{online}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content: Flex Grid of Station Cards */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-xs">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : examiners.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-white shadow-xs border border-slate-200">
          <GraduationCap size={36} className="mb-3 text-slate-300" />
          <p className="font-medium text-slate-400 text-xs">Belum ada penguji terdaftar.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((stationNum) => {
            const stationExaminer = examiners.find((e) => e.station_number === stationNum);
            const profile = stationExaminer?.profiles;
            const isOnline = profile?.is_online;

            return (
              <div
                key={stationNum}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
              >
                <div>
                  {/* Station Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800">
                      STASE {stationNum}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                        stationExaminer
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          stationExaminer ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {stationExaminer ? "Telah Ditugaskan" : "Belum Ada Penguji"}
                    </span>
                  </div>

                  {/* Examiner Body */}
                  <div className="mt-4">
                    {stationExaminer ? (
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-base shadow-sm">
                          {(profile?.full_name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-slate-900 text-sm truncate">
                            {profile?.full_name}
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            {profile?.email}
                          </div>
                          <div className="mt-2 inline-flex items-center gap-1 text-[11px]">
                            {isOnline ? (
                              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                Status: Online
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                {formatLastSeen(profile?.last_seen)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs text-slate-400">
                        Belum ada dokter penguji yang diplot ke Stase {stationNum}.
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-5 border-t border-slate-100 pt-3 text-right">
                  <button
                    onClick={() => {
                      setTargetStation(stationNum);
                      setOpenAssignModal(true);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95 shadow-xs"
                  >
                    <UserPlus size={14} />
                    {stationExaminer ? "Ganti Penguji Stase" : "Tugaskan Penguji"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Doctor Search & Assign Modal */}
      {openAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Cari & Penugasan Dokter Penguji</h2>
                <p className="text-xs text-slate-500">
                  Pilih dokter dari registri. 1 Dokter hanya dapat bertugas pada 1 stase dalam sesi ini.
                </p>
              </div>
              <button onClick={() => setOpenAssignModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Target Stase</label>
                <select
                  value={targetStation}
                  onChange={(e) => setTargetStation(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((stg) => (
                    <option key={stg} value={stg}>
                      Stase {stg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Cari Dokter</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nama atau spesialisasi..."
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs focus:border-blue-500 focus:outline-none"
                    value={searchDoctor}
                    onChange={(e) => setSearchDoctor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Doctor Registry List with 1 Doctor per Station Enforcement */}
            <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
              {filteredDoctors.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">Dokter tidak ditemukan.</div>
              ) : (
                filteredDoctors.map((doc) => {
                  // Check if doctor is already assigned to ANY station in this session
                  const assignedStation = examiners.find((e) => e.profiles?.full_name === doc.name);
                  const isAssigned = Boolean(assignedStation);
                  const isSameStation = assignedStation?.station_number === Number(targetStation);

                  return (
                    <div
                      key={doc.id}
                      className={`flex items-center justify-between rounded-xl border p-3 transition ${
                        isAssigned && !isSameStation
                          ? "bg-slate-100/70 border-slate-200 opacity-60"
                          : "bg-white border-slate-200 hover:border-blue-300 shadow-2xs"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-xs">{doc.name}</p>
                          {isAssigned && (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                              Stase {assignedStation.station_number}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{doc.specialty} • {doc.email}</p>
                      </div>

                      {isAssigned && !isSameStation ? (
                        <button
                          disabled
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 cursor-not-allowed"
                        >
                          Sudah Bertugas
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAssignDoctor(doc)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition active:scale-95 shadow-2xs"
                        >
                          <Check size={13} />
                          {isSameStation ? "Dipilih" : "Tugaskan"}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}



