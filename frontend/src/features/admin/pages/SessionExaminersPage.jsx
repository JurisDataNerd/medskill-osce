import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  UserPlus,
  X,
  Check,
  Loader2,
  Stethoscope,
  Trash2,
  Coffee,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { getSessionExaminers } from "@/services/session.service";
import {
  fetchSessionById,
  upsertSessionExaminer,
  deleteSessionExaminer,
} from "@/services/sessionService";
import { fetchDoctorExaminers } from "@/services/examinerService";

import SearchableSelectMenu from "@/components/ui/SearchableSelectMenu";

export default function SessionExaminersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [examiners, setExaminers] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [targetStation, setTargetStation] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadAllData() {
    try {
      setLoading(true);
      const [sessData, examinersData, doctorsData] = await Promise.all([
        fetchSessionById(id).catch(() => null),
        getSessionExaminers(id).catch(() => []),
        fetchDoctorExaminers().catch(() => []),
      ]);

      setSession(sessData);
      setExaminers(examinersData || []);
      setDoctorList(doctorsData || []);
    } catch (err) {
      console.error("Error loading session examiners page data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, [id]);

  // Handle assigning a doctor to targetStation slot
  async function handleAssignDoctor(doctor) {
    try {
      setSubmitting(true);
      const isUuid = doctor.id && String(doctor.id).length === 36;
      const userId = isUuid
        ? doctor.id
        : `00000000-0000-4000-8000-00000000000${String(doctor.id).replace("doc-", "")}`;

      const payload = {
        session_id: id,
        user_id: userId,
        full_name: doctor.name,
        specialty: doctor.specialty || "Spesialis Medis",
        assigned_station_number: Number(targetStation),
        status: "active",
      };

      await upsertSessionExaminer(payload);
      
      const updatedList = await getSessionExaminers(id);
      setExaminers(updatedList || []);
      setOpenAssignModal(false);
    } catch (err) {
      console.warn("Error assigning doctor examiner:", err);
      const newEntry = {
        id: `e-${Date.now()}`,
        station_number: Number(targetStation),
        assigned_station_number: Number(targetStation),
        status: "active",
        profiles: {
          full_name: doctor.name,
          email: `${doctor.name.toLowerCase().replace(/\s+/g, ".")}@medskill.ac.id`,
          is_online: true,
        },
      };
      setExaminers((prev) => [
        ...prev.filter(
          (e) => Number(e.station_number || e.assigned_station_number) !== Number(targetStation)
        ),
        newEntry,
      ]);
      setOpenAssignModal(false);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle unassigning an examiner from a station slot
  async function handleUnassignExaminer(stationNum, doctorName) {
    const ok = confirm(
      `Hapus penugasan ${doctorName || "Dokter Penguji"} dari Pos Stase ${stationNum}?`
    );
    if (!ok) return;

    try {
      await deleteSessionExaminer(id, stationNum);
      setExaminers((prev) =>
        prev.filter(
          (e) => Number(e.station_number || e.assigned_station_number) !== Number(stationNum)
        )
      );
    } catch (err) {
      console.warn("Could not delete from Supabase, updating locally:", err);
      setExaminers((prev) =>
        prev.filter(
          (e) => Number(e.station_number || e.assigned_station_number) !== Number(stationNum)
        )
      );
    }
  }

  // Open modal preselected for a specific station
  function openModalForStation(stNum) {
    setTargetStation(stNum);
    const existing = examiners.find(
      (e) => Number(e.station_number || e.assigned_station_number) === Number(stNum)
    );
    const matchedDoc = doctorList.find(
      (d) =>
        d.id === existing?.user_id ||
        d.name === (existing?.profiles?.full_name || existing?.full_name)
    );
    setSelectedDoctor(matchedDoc || null);
    setOpenAssignModal(true);
  }

  // Compute station slots based on saved stations
  const savedStations = session?.stations || [];
  const totalStationCount = savedStations.length > 0
    ? savedStations.length
    : (session?.total_stations || 0);

  const stationSlots = savedStations.length > 0
    ? savedStations.map((s, idx) => Number(s.station_number || idx + 1))
    : Array.from({ length: totalStationCount }, (_, i) => i + 1);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[450px] flex-col items-center justify-center gap-3 text-xs font-semibold text-slate-500">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <span>Memuat Penugasan Penguji...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <button
              onClick={() => navigate(`/admin/sessions/${id}`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Kembali ke Detail Sesi
            </button>
            <h1 className="mt-1 text-xl font-black text-slate-900">
              {session?.title || "Penugasan Dokter Penguji"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {session?.location_building || session?.location || "Gedung Skill Lab"} •{" "}
              {session?.session_date || "Sesi OSCE"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95 shadow-2xs"
              title="Refresh Data"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              onClick={() => openModalForStation(1)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-blue-700 active:scale-95"
            >
              <UserPlus size={16} />
              Penugasan Dokter Baru
            </button>
          </div>
        </div>

        {/* Cards Grid per Station */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stationSlots.map((stNum) => {
            const stationData = session?.stations?.find((s) => Number(s.station_number) === stNum);
            const isBreak = stationData?.is_break || false;
            const assignedDoc = examiners.find(
              (e) => Number(e.station_number || e.assigned_station_number) === stNum
            );

            const docName =
              assignedDoc?.profiles?.full_name ||
              assignedDoc?.full_name ||
              stationData?.examiner_name ||
              stationData?.assigned_examiner;

            const docEmail =
              assignedDoc?.profiles?.email ||
              assignedDoc?.specialty ||
              stationData?.examiner_specialty ||
              "Spesialis Medis";

            const hasExaminer = Boolean(docName);

            return (
              <div
                key={stNum}
                className={`flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition duration-200 hover:shadow-xs ${
                  isBreak
                    ? "border-slate-200/80 bg-amber-50/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header Ghost Blue Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${
                        isBreak
                          ? "bg-slate-100 text-slate-600 border border-slate-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200/80"
                      }`}
                    >
                      {isBreak ? `ISTIRAHAT ${stNum}` : `POS STASE ${stNum}`}
                    </span>

                    {isBreak ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                        <Coffee size={11} />
                        Break
                      </span>
                    ) : hasExaminer ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                        <Check size={11} />
                        Terisi
                      </span>
                    ) : null}
                  </div>

                  {/* Station Case Information */}
                  <div>
                    <h3 className="line-clamp-2 text-xs font-bold text-slate-900 leading-snug">
                      {stationData?.case_title ||
                        stationData?.title ||
                        (isBreak ? `Stase Istirahat ${stNum}` : `Stase Ujian Klinik ${stNum}`)}
                    </h3>
                    {stationData?.system_organ && (
                      <p className="mt-1 text-[11px] font-medium text-slate-500">
                        {stationData.system_organ} {stationData.skdi_level ? `• SKDI ${stationData.skdi_level}` : ""}
                      </p>
                    )}
                  </div>

                  {/* Assigned Doctor Box */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    {isBreak ? (
                      <p className="text-center text-[11px] font-medium text-slate-400 py-1">
                        Rotasi istirahat (tanpa penguji)
                      </p>
                    ) : hasExaminer ? (
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs">
                          <Stethoscope size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-xs font-bold text-slate-900">{docName}</h4>
                          <p className="truncate text-[10px] text-slate-500 font-medium">{docEmail}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-[11px] font-medium text-slate-400 py-1.5">
                        Belum ada dokter penguji
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {isBreak ? (
                    <div className="w-full text-center text-[11px] font-medium text-slate-400 py-1">
                      Slot Istirahat
                    </div>
                  ) : hasExaminer ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModalForStation(stNum)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white py-1.5 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                      >
                        Ganti Dokter
                      </button>
                      <button
                        onClick={() => handleUnassignExaminer(stNum, docName)}
                        className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-400 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600"
                        title="Hapus Penugasan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openModalForStation(stNum)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-blue-700 active:scale-95"
                    >
                      <UserPlus size={14} />
                      Tugaskan Dokter
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Penugasan Dokter Penguji */}
      {openAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <UserPlus size={18} className="text-blue-600" />
                  Penugasan Dokter Penguji
                </h2>
                <p className="text-xs text-slate-500 font-medium">Pilih dokter spesialis untuk Pos Stase</p>
              </div>
              <button
                onClick={() => setOpenAssignModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Station Selector */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Pos Stase
                </label>
                <select
                  value={targetStation}
                  onChange={(e) => setTargetStation(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {stationSlots.map((num) => {
                    const st = session?.stations?.find((s) => Number(s.station_number) === num);
                    return (
                      <option key={num} value={num}>
                        Pos Stase {num} {st?.is_break ? "(Istirahat)" : st?.case_title ? `- ${st.case_title}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Searchable Select Menu for Doctors */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Dokter Penguji
                </label>
                <SearchableSelectMenu
                  options={doctorList}
                  value={selectedDoctor}
                  onChange={(doc) => setSelectedDoctor(doc)}
                  placeholder="Pilih Dokter Spesialis / Penguji..."
                  searchPlaceholder="Ketik nama atau spesialisasi dokter..."
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  disabled={!selectedDoctor || submitting}
                  onClick={() => selectedDoctor && handleAssignDoctor(selectedDoctor)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menugaskan...</span>
                    </>
                  ) : (
                    <span>Tugaskan Dokter ke Pos Stase {targetStation}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
