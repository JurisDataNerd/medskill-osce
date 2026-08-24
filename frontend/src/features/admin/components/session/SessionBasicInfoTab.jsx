import {
  FileText,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Save,
  ChevronRight,
} from "lucide-react";

export default function SessionBasicInfoTab({
  title,
  setTitle,
  description,
  setDescription,
  sessionDate,
  setSessionDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  location,
  setLocation,
  maxParticipants,
  setMaxParticipants,
  isPublishedSession,
  handleSaveCurrentSection,
  handleNextTab,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText size={19} className="text-blue-600" />
          1. Informasi Sesi Ujian
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Lengkapi judul, jadwal pelaksanaan, dan kapasitas peserta.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-slate-700">
            Judul Sesi Ujian <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Ujian OSCE Periodik Dokter Spesialis - Batch IV 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-slate-700">
            Deskripsi Pelaksanaan
          </label>
          <textarea
            rows={3}
            placeholder="Tuliskan petunjuk khusus, syarat peserta, atau catatan pelaksanaan..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
            <CalendarDays size={14} className="text-slate-400" />
            Tanggal Ujian
          </label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
            <MapPin size={14} className="text-slate-400" />
            Lokasi Ruangan
          </label>
          <input
            type="text"
            placeholder="Gedung Skill Lab Ruang OSCE Utama"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
            <Clock size={14} className="text-slate-400" />
            Jam Mulai Ujian
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
            <Clock size={14} className="text-slate-400" />
            Estimasi Jam Selesai
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
            <Users size={14} className="text-slate-400" />
            Kapasitas Peserta per Gelombang
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={maxParticipants}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setMaxParticipants(val === "" ? "" : Number(val));
            }}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Action Buttons for Tab 1 */}
      <div className="flex justify-between border-t border-slate-100 pt-4">
        {!isPublishedSession ? (
          <button
            type="button"
            onClick={() => handleSaveCurrentSection(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Save size={15} />
            Simpan Draft
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSaveCurrentSection(false)}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-100 transition cursor-pointer"
          >
            <Save size={15} />
            Simpan Perubahan
          </button>
        )}
        <button
          type="button"
          onClick={handleNextTab}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer"
        >
          Lanjutkan: Stase & Durasi
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
