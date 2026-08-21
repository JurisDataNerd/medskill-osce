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
            <label className="block text-xs font-bold text-slate-800 mb-1">Sistem Organ</label>
            <select
              value={systemOrgan}
              onChange={(e) => setSystemOrgan(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="Kardiovaskular">Kardiovaskular</option>
              <option value="Respirasi">Respirasi</option>
              <option value="Neurologi">Neurologi</option>
              <option value="Digestif">Digestif</option>
              <option value="Muskuloskeletal">Muskuloskeletal</option>
              <option value="Endokrin">Endokrin</option>
              <option value="Urologi">Urologi</option>
              <option value="THT-KL">THT-KL</option>
              <option value="Pediatri">Pediatri</option>
              <option value="Bedah Umum">Bedah Umum</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Level SKDI</label>
            <select
              value={skdiLevel}
              onChange={(e) => setSkdiLevel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="4A (Tuntas Mandiri)">Tingkat 4A</option>
              <option value="3B (Gawat Darurat)">Tingkat 3B</option>
              <option value="3A (Non Gawat Darurat)">Tingkat 3A</option>
              <option value="2">Tingkat 2</option>
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
          <textarea
            rows={4}
            value={participantInstructions}
            onChange={(e) => setParticipantInstructions(e.target.value)}
            placeholder="1. Lakukan anamnesis terarah...&#10;2. Lakukan pemeriksaan fisik...&#10;3. Tentukan diagnosis & resep..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Instruksi Dokter Penguji</label>
          <textarea
            rows={4}
            value={examinerInstructions}
            onChange={(e) => setExaminerInstructions(e.target.value)}
            placeholder="Panduan khusus untuk dokter penguji spesialis saat menilai di stase..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
