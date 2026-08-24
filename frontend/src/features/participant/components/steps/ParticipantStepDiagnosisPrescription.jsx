export default function ParticipantStepDiagnosisPrescription({
  differentialDiagnosis,
  setDifferentialDiagnosis,
  workingDiagnosis,
  setWorkingDiagnosis,
  prescriptionText,
  setPrescriptionText,
  activeStationNumber = 1,
  onRequestFinishStation,
}) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
            Tahap 4 dari 4 (Terakhir)
          </span>
          <h2 className="text-base font-black text-slate-900 mt-1 uppercase tracking-wider">
            Pengujian Diagnosis & Resep Obat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Isi lembar jawaban diagnosis dan resep obat di bawah ini.
          </p>
        </div>
      </div>

      {/* 1. Form Diagnosis Banding */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800">
          1. Diagnosis Banding (DDx)
        </label>
        <textarea
          rows={4}
          value={differentialDiagnosis}
          onChange={(e) => setDifferentialDiagnosis(e.target.value)}
          placeholder={"1. [Diagnosis Banding 1]\n2. [Diagnosis Banding 2]\n3. [Diagnosis Banding 3]"}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition font-medium leading-relaxed"
        />
      </div>

      {/* 2. Form Diagnosis Kerja */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800">
          2. Diagnosis Kerja (WDx)
        </label>
        <textarea
          rows={3}
          value={workingDiagnosis}
          onChange={(e) => setWorkingDiagnosis(e.target.value)}
          placeholder="1. [Diagnosis Kerja Utama]"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition font-semibold leading-relaxed"
        />
      </div>

      {/* 3. Form Penulisan Resep Obat */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
          <span>3. Penulisan Resep Obat</span>
          <span className="text-[10px] font-semibold text-slate-400">Format R/, Signa, Dosis</span>
        </label>
        <textarea
          rows={5}
          value={prescriptionText}
          onChange={(e) => setPrescriptionText(e.target.value)}
          placeholder="R/ Nama obat, dosis, jumlah&#10;S Signa cara aturan pakai..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-mono focus:border-blue-500 focus:bg-white focus:outline-none transition leading-relaxed"
        />
      </div>

      {/* Finish Station CTA Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <p className="font-bold text-xs text-emerald-900">Selesaikan Pos Stase {activeStationNumber}</p>
          <p className="text-[11px] text-emerald-700 font-medium">
            Pastikan lembar jawaban diagnosis dan resep obat telah diisi dengan benar sebelum menyelesaikan stase.
          </p>
        </div>

        <button
          type="button"
          onClick={onRequestFinishStation}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
        >
          Selesaikan Stase Ini
        </button>
      </div>
    </div>
  );
}
