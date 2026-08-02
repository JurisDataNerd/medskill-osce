import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  HelpCircle,
  MapPin,
  CheckCircle2,
  Plus,
  ShieldAlert,
  Sliders,
  Users,
  ChevronRight,
  ChevronLeft,
  Save,
  Sparkles,
  BookOpen,
  Check,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";

export default function CreateSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Active Wizard Step (1: Detail, 2: Stase, 3: Soal & Kasus, 4: Rule OSCE)
  const [activeStep, setActiveStep] = useState(1);

  // Form State 1: Detail OSCE
  const [title, setTitle] = useState(
    isEdit ? "Ujian OSCE Periodik Dokter Spesialis" : ""
  );
  const [description, setDescription] = useState(
    isEdit ? "Evaluasi 6 stase komprehensif keterampilan klinis." : ""
  );
  const [sessionDate, setSessionDate] = useState("2026-08-20");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:30");
  const [location, setLocation] = useState("Gedung Skill Lab Ruang OSCE Utama");
  const [maxParticipants, setMaxParticipants] = useState(6);

  // Form State 2: Stase Configuration
  const [totalStations, setTotalStations] = useState(6);
  const [stationDurationMinutes, setStationDurationMinutes] = useState(15);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(3);
  const [totalRounds, setTotalRounds] = useState(6);

  // Form State 3: Soal & Kasus Medis per Stase
  const [stationsConfig, setStationsConfig] = useState([
    {
      station_number: 1,
      title: "Stase 1: Kardiovaskular",
      case_title: "Sindrom Koroner Akut (STEMI Anteroseptal)",
      instructions: "Lakukan anamnesis terarah, auskultasi jantung, dan interpretasi EKG 12 tetapan.",
      checklist_count: 18,
    },
    {
      station_number: 2,
      title: "Stase 2: Pulmonologi",
      case_title: "Status Asmatikus & Pneumotoraks Ventil",
      instructions: "Lakukan pemeriksaan fisik paru dan simulasikan dekompresi jarum dada.",
      checklist_count: 20,
    },
    {
      station_number: 3,
      title: "Stase 3: Bedah Umum",
      case_title: "Debridement & Penutupan Luka Vulnus Laceratum",
      instructions: "Jaga steril alat, debridement luka, dan lakukan penjahitan interrupted suture.",
      checklist_count: 15,
    },
    {
      station_number: 4,
      title: "Stase 4: Neurologi",
      case_title: "Stroke Iskemik Akut (GCS 15 & Hemiparesis)",
      instructions: "Pemeriksaan saraf kranial III, IV, VI, VII, XII dan refleks patologis Babinski.",
      checklist_count: 16,
    },
    {
      station_number: 5,
      title: "Stase 5: Penyakit Dalam",
      case_title: "Edukasi Diabetes Melitus & Dosis Insulin",
      instructions: "Lakukan edukasi pemberian injeksi insulin pen dan perencanaan diet diabetes.",
      checklist_count: 18,
    },
    {
      station_number: 6,
      title: "Stase 6: Otolaringologi (THT-KL)",
      case_title: "Pemeriksaan Otoskop Membran Timpani",
      instructions: "Gunakan otoskop dengan benar, sebutkan refleks cahaya dan ekstraksi serumen.",
      checklist_count: 14,
    },
  ]);

  // Form State 4: Rule & Aturan OSCE
  const [singleLiveSessionRule, setSingleLiveSessionRule] = useState(true);
  const [autoRollingRule, setAutoRollingRule] = useState(true);
  const [lateToleranceMinutes, setLateToleranceMinutes] = useState(5);
  const [autoLockAnswerRule, setAutoLockAnswerRule] = useState(true);
  const [autoPublishResults, setAutoPublishResults] = useState(false);

  function handleSave(status = "draft") {
    if (!title.trim()) {
      alert("Harap isi Nama Sesi OSCE terlebih dahulu!");
      setActiveStep(1);
      return;
    }

    const payload = {
      title,
      description,
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      location,
      max_participants: Number(maxParticipants),
      total_stations: Number(totalStations),
      total_examiners: Number(totalStations),
      station_duration_minutes: Number(stationDurationMinutes),
      break_duration_minutes: Number(breakDurationMinutes),
      total_rounds: Number(totalRounds),
      status,
      rules: {
        single_live_session: singleLiveSessionRule,
        auto_rolling: autoRollingRule,
        late_tolerance_minutes: lateToleranceMinutes,
        auto_lock_answer: autoLockAnswerRule,
        auto_publish_results: autoPublishResults,
      },
      stations: stationsConfig,
    };

    console.log("Saving OSCE Session:", payload);
    alert(
      `Sesi OSCE "${title}" berhasil disimpan sebagai ${
        status === "running" ? "Sesi Berlangsung (Live)" : "Draft Sesi"
      }!`
    );
    navigate("/admin/sessions");
  }

  return (
    <AdminLayout>
      {/* Top Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/sessions")}
          className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Kembali ke Kelola Sesi
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEdit ? "Edit Manajemen Sesi OSCE" : "Buat Sesi OSCE Baru"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pengaturan terstruktur detail sesi, stase rotasi, kasus soal, dan aturan otomatisasi OSCE.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave("draft")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
            >
              <Save size={15} />
              Simpan Draft
            </button>
            <button
              onClick={() => handleSave("draft")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95"
            >
              <CheckCircle2 size={15} />
              Terbitkan Sesi
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Navigation Tabs */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StepTabBtn
            step={1}
            active={activeStep === 1}
            title="1. Detail OSCE"
            subtitle="Informasi & Jadwal"
            icon={<FileText size={16} />}
            onClick={() => setActiveStep(1)}
          />
          <StepTabBtn
            step={2}
            active={activeStep === 2}
            title="2. Konfigurasi Stase"
            subtitle="Stase & Durasi Rotasi"
            icon={<Building2 size={16} />}
            onClick={() => setActiveStep(2)}
          />
          <StepTabBtn
            step={3}
            active={activeStep === 3}
            title="3. Soal & Kasus"
            subtitle="Kasus & Checklist Rubrik"
            icon={<BookOpen size={16} />}
            onClick={() => setActiveStep(3)}
          />
          <StepTabBtn
            step={4}
            active={activeStep === 4}
            title="4. Rule OSCE"
            subtitle="Aturan & Otomatisasi"
            icon={<Sliders size={16} />}
            onClick={() => setActiveStep(4)}
          />
        </div>
      </div>

      {/* STEP 1: DETAIL OSCE */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Informasi Umum Sesi Ujian OSCE
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Nama / Judul Sesi OSCE <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ujian OSCE Periodik Dokter Spesialis - Batch IV 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Deskripsi & Catatan Pelaksanaan
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan tujuan ujian, syarat peserta, atau catatan khusus..."
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
                  Lokasi Ruangan / Gedung
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
                  Estimasi Selesai Ujian
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Users size={14} className="text-slate-400" />
                  Maksimal Peserta per Gelombang
                </label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Standar OSCE setempat: 6 Peserta (1 peserta per stase per rotasi).
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95"
            >
              Lanjut ke Konfigurasi Stase
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: KONFIGURASI STASE */}
      {activeStep === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              Pengaturan Stase & Durasi Waktu Ujian
            </h2>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Jumlah Stase Ujian
                </label>
                <select
                  value={totalStations}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTotalStations(val);
                    setTotalRounds(val);
                  }}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value={4}>4 Stase</option>
                  <option value={6}>6 Stase (Standar OSCE)</option>
                  <option value={8}>8 Stase</option>
                  <option value={10}>10 Stase</option>
                  <option value={12}>12 Stase</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Durasi Pengerjaan per Stase (Menit)
                </label>
                <input
                  type="number"
                  value={stationDurationMinutes}
                  onChange={(e) => setStationDurationMinutes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Durasi Break / Istirahat antar Ronde (Menit)
                </label>
                <input
                  type="number"
                  value={breakDurationMinutes}
                  onChange={(e) => setBreakDurationMinutes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* List of Stations Summary */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase mb-3">
                Ringkasan Alokasi Rotasi {totalStations} Stase
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: totalStations }, (_, i) => i + 1).map((stgNum) => (
                  <div
                    key={stgNum}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-[11px] font-extrabold text-blue-800">
                        {stgNum}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        Stase {stgNum}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {stationDurationMinutes} menit
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep(1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft size={16} />
              Kembali
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95"
            >
              Lanjut ke Soal & Kasus
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SOAL & KASUS MEDIS */}
      {activeStep === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" />
                  Pemetaan Kasus Medis & Checklist Penilaian per Stase
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan skenario kasus medis, instruksi peserta, dan jumlah checklist penilaian penguji untuk tiap stase.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {stationsConfig.slice(0, totalStations).map((stg, idx) => (
                <div
                  key={stg.station_number}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
                      Stase {stg.station_number}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {stg.checklist_count} Checklist Items
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-600">
                        Judul Kasus Medis
                      </label>
                      <input
                        type="text"
                        value={stg.case_title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStationsConfig((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, case_title: val } : item
                            )
                          );
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-600">
                        Instruksi Peserta Ujian
                      </label>
                      <input
                        type="text"
                        value={stg.instructions}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStationsConfig((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, instructions: val } : item
                            )
                          );
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep(2)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft size={16} />
              Kembali
            </button>
            <button
              onClick={() => setActiveStep(4)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95"
            >
              Lanjut ke Rule & Aturan OSCE
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RULE & ATURAN OSCE */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
              <Sliders size={18} className="text-blue-600" />
              Aturan Pelaksanaan & Otomatisasi Sesi OSCE
            </h2>

            <div className="space-y-4">
              <RuleToggleItem
                title="Aturan Sesi Live Eksklusif (Single Live Session Rule)"
                description="Memastikan hanya 1 sesi OSCE yang dapat berjalan secara live dalam 1 waktu. Sesi lain tidak dapat dimulai bersamaan."
                checked={singleLiveSessionRule}
                onChange={(val) => setSingleLiveSessionRule(val)}
              />

              <RuleToggleItem
                title="Otomatisasi Perputaran Rolling Peserta"
                description="Peserta akan dipindahkan otomatis ke stase berikutnya setelah timer pengerjaan stase dan timer istirahat selesai."
                checked={autoRollingRule}
                onChange={(val) => setAutoRollingRule(val)}
              />

              <RuleToggleItem
                title="Penguncian Lembar Penilaian Penguji Otomatis"
                description="Mengunci formulir nilai penguji saat waktu stase berakhir untuk menghindari perubahan skor susulan."
                checked={autoLockAnswerRule}
                onChange={(val) => setAutoLockAnswerRule(val)}
              />

              <RuleToggleItem
                title="Publikasi Nilai Otomatis ke Peserta"
                description="Mempublikasikan hasil rekapitulasi nilai dan umpan balik ke akun peserta secara otomatis begitu sesi OSCE dinyatakan selesai oleh Admin."
                checked={autoPublishResults}
                onChange={(val) => setAutoPublishResults(val)}
              />

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Toleransi Keterlambatan Peserta (Menit)
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Waktu maksimal peserta diizinkan memasuki ruang ujian sebelum statusnya diubah menjadi diskualifikasi/absen.
                </p>
                <input
                  type="number"
                  value={lateToleranceMinutes}
                  onChange={(e) => setLateToleranceMinutes(Number(e.target.value))}
                  className="w-32 rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep(3)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft size={16} />
              Kembali
            </button>

            <button
              onClick={() => handleSave("draft")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95"
            >
              <CheckCircle2 size={16} />
              Simpan & Terbitkan Sesi OSCE
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function StepTabBtn({ step, active, title, subtitle, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl p-3 text-left transition border ${
        active
          ? "bg-blue-50/80 border-blue-300 text-blue-900 shadow-2xs"
          : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="font-bold text-xs">{title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </button>
  );
}

function RuleToggleItem({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white hover:border-blue-200 transition">
      <div className="pr-4">
        <p className="font-bold text-xs text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-blue-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
