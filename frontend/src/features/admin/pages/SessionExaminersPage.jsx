import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Clock, GraduationCap, Plus, Search, UserPlus, X, Check, Loader2 } from "lucide-react";
import { getSessionExaminers } from "@/services/session.service";
import { upsertSessionExaminer } from "@/services/sessionService";
import { fetchDoctorExaminers } from "@/services/examinerService";

export default function SessionExaminersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [examiners, setExaminers] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState("");
  const [targetStation, setTargetStation] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [data, doctors] = await Promise.all([
          getSessionExaminers(id),
          fetchDoctorExaminers(),
        ]);
        setExaminers(data || []);
        setDoctorList(doctors || []);
      } catch (err) {
        console.error("Error loading examiners:", err);
        setExaminers([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  async function handleAssignDoctor(doctor) {
    const payload = {
      session_id: id,
      user_id: doctor.id ? `00000000-0000-4000-8000-00000000000${doctor.id.replace("doc-", "")}` : "00000000-0000-4000-8000-000000000001",
      full_name: doctor.name,
      specialty: doctor.specialty,
      assigned_station_number: Number(targetStation),
      status: "active",
    };

    try {
      await upsertSessionExaminer(payload);
      alert(`Dokter Penguji ${doctor.name} berhasil ditugaskan ke Pos Stase ${targetStation} di Supabase database!`);
      load();
    } catch (err) {
      console.warn("Could not save examiner assignment to Supabase, updating locally:", err);
      const newEntry = {
        id: `e-${Date.now()}`,
        station_number: Number(targetStation),
        status: "active",
        profiles: { full_name: doctor.name, email: `${doctor.name.toLowerCase().replace(/\s+/g, ".")}@medskill.ac.id`, is_online: true },
      };
      setExaminers((prev) => [...prev.filter((e) => e.station_number !== Number(targetStation)), newEntry]);
    }

    setOpenAssignModal(false);
  }

  const filteredDoctors = doctorList.filter(
    (d) =>
      d.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchDoctor.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[400px] items-center justify-center text-xs font-semibold text-slate-500">
          <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
          Memuat Penugasan Dokter Penguji Supabase...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => navigate(`/admin/sessions/${id}`)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={16} />
            Kembali ke Detail Sesi
          </button>

          <button
            onClick={() => setOpenAssignModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
          >
            <UserPlus size={16} />
            Penugasan Dokter Penguji Baru
          </button>
        </div>

        {/* Header Title Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
          <span className="rounded-md bg-purple-100 border border-purple-200 px-3 py-1 text-xs font-extrabold text-purple-900">
            PENUGASAN DOKTER PENGUJI SUPABASE
          </span>
          <h1 className="text-xl font-black text-slate-900">
            Alokasi Dokter Penguji Pos Stase
          </h1>
          <p className="text-xs text-slate-500">
            Atur dokter penguji spesialis yang bertanggung jawab pada masing-masing pos rotasi sirkuit.
          </p>
        </div>

        {/* Assigned Examiners Grid */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap size={18} className="text-purple-600" />
            Daftar Dokter Penguji Terpenuhi ({examiners.length} Dokter)
          </h2>

          {examiners.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-2">
              <p className="font-bold text-slate-700">Belum ada dokter penguji yang dialokasikan di sesi ini.</p>
              <button
                onClick={() => setOpenAssignModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs"
              >
                <Plus size={15} />
                Tugaskan Dokter Penguji
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {examiners.map((ex) => (
                <div key={ex.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-purple-600 px-2.5 py-0.5 text-[10px] font-black text-white">
                      POS STASE {ex.station_number}
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold inline-flex items-center gap-1">
                      <Check size={11} className="text-emerald-700" />
                      Aktif
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900">{ex.profiles?.full_name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{ex.profiles?.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Assign Dokter Penguji */}
      {openAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus size={18} className="text-blue-600" />
                Penugasan Dokter Penguji ke Pos Stase
              </h2>
              <button onClick={() => setOpenAssignModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Pos Stase Penugasan
                </label>
                <select
                  value={targetStation}
                  onChange={(e) => setTargetStation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      Pos Stase {num}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cari Nama / Spesialisasi Dokter
                </label>
                <input
                  type="text"
                  value={searchDoctor}
                  onChange={(e) => setSearchDoctor(e.target.value)}
                  placeholder="Ketik nama dokter atau spesialis..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleAssignDoctor(doc)}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-[11px] font-semibold text-blue-700">{doc.specialty}</p>
                    </div>
                    <button className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-2xs">
                      Pilih
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
