import { SYSTEM_ORGAN_LIST, SKDI_LEVEL_LIST } from "@/constants/medicalSystems";

export default function CaseScenarioTab({
  title,
  setTitle,
  systemOrgan,
  setSystemOrgan,
  skdiLevel,
  setSkdiLevel,
  scenario,
  setScenario,
  participantInstructions,
  setParticipantInstructions,
  examinerInstructions,
  setExaminerInstructions,
}) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Judul Kasus Medis <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Nyeri Dada Khas Infark Miokard Akut (STEMI Anteroseptal)"
            className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Sistem Organ SKDI</label>
            <select
              value={systemOrgan}
              onChange={(e) => setSystemOrgan(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
            >
              {SYSTEM_ORGAN_LIST.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Level SKDI</label>
            <select
              value={skdiLevel}
              onChange={(e) => setSkdiLevel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
            >
              {SKDI_LEVEL_LIST.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1">Skenario Klinis Utama</label>
        <textarea
          rows={4}
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder="Deskripsi skenario klinis lengkap yang ditampilkan di pintu stase/layar peserta..."
          className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Instruksi Peserta Ujian</label>
          <p className="text-[10px] text-blue-600 font-semibold mb-1.5">
            Tuliskan instruksi per baris. Sistem otomatis merapikan menjadi poin bernomor (1, 2, 3...) di layar Peserta.
          </p>
          <textarea
            rows={5}
            value={participantInstructions}
            onChange={(e) => setParticipantInstructions(e.target.value)}
            placeholder="1. Lakukan anamnesis terarah...&#10;2. Lakukan pemeriksaan fisik...&#10;3. Tentukan diagnosis & resep..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Instruksi Dokter Penguji</label>
          <p className="text-[10px] text-blue-600 font-semibold mb-1.5">
            Tuliskan instruksi per baris. Sistem otomatis merapikan menjadi poin bernomor (1, 2, 3...) di layar Dokter Penguji.
          </p>
          <textarea
            rows={5}
            value={examinerInstructions}
            onChange={(e) => setExaminerInstructions(e.target.value)}
            placeholder="1. Amati kesantunan & komunikasi...&#10;2. Nilai teknik auskultasi katup jantung...&#10;3. Evaluasi ketepatan diagnosis..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
