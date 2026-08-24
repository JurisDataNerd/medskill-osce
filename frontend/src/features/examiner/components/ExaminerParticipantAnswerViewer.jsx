import { UserCheck, FileSpreadsheet, CheckCircle2, Eye } from "lucide-react";

export default function ExaminerParticipantAnswerViewer({
  currentParticipant,
  liveAnswer,
  renderDifferentialDiagnosis,
  safeParseAuxiliaryList,
  onOpenAuxiliaryModal,
}) {
  const auxList = safeParseAuxiliaryList(liveAnswer);

  return (
    <div className="space-y-6">
      {/* Candidate Header Profile & Step Progress Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                {currentParticipant
                  ? currentParticipant.full_name || currentParticipant.name
                  : "Belum Ada Peserta di Pos Stase"}
              </h3>
              <p className="text-[11px] font-bold text-blue-600">
                NIM: {currentParticipant ? currentParticipant.nim || "—" : "—"} • Mahasiswa Klinik
              </p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-[10px] font-black text-emerald-900 uppercase">
            LIVE UJIAN
          </span>
        </div>

        {/* Step Progress Badge Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Tahapan Pengerjaan Stase:</span>
            <span className="text-blue-600 font-extrabold">Tahap 4 dari 4 (Diagnosis & Resep)</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            <div className="h-2 rounded-full bg-emerald-500" title="1. Anamnesis" />
            <div className="h-2 rounded-full bg-emerald-500" title="2. Pemeriksaan Fisik" />
            <div className="h-2 rounded-full bg-emerald-500" title="3. Penunjang" />
            <div className="h-2 rounded-full bg-blue-600 animate-pulse" title="4. Diagnosis & Resep" />
          </div>
        </div>
      </div>

      {/* Candidate Answers Live Display Card */}
      <div className="rounded-3xl border border-blue-200 bg-blue-50/40 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
          <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-blue-600" />
            Lembar Isian Live Peserta
          </h3>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
            Sync Real-Time
          </span>
        </div>

        {/* 1. Differential Diagnoses DDx */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
            1. Diagnosis Banding (DDx):
          </label>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs">
            {renderDifferentialDiagnosis(liveAnswer)}
          </div>
        </div>

        {/* 2. Working Diagnosis WDx */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
            2. Diagnosis Kerja Utama (WDx):
          </label>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-900 leading-relaxed whitespace-pre-line shadow-2xs">
            {liveAnswer?.working_diagnosis ||
              (currentParticipant ? "Peserta belum mengisi WDx" : "Belum ada peserta di stase ini")}
          </div>
        </div>

        {/* 3. Prescription Text Area */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
            3. Penulisan Resep Obat (Farmakoterapi / Rx):
          </label>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-900 leading-relaxed whitespace-pre-line shadow-2xs">
            {liveAnswer?.prescription_text || "Belum ada penulisan resep obat oleh peserta"}
          </div>
        </div>

        {/* Opened Auxiliary Tests List */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase block">
              Berkas Penunjang yang Diberikan ke Peserta:
            </label>
            {auxList.length > 0 && (
              <button
                onClick={() => onOpenAuxiliaryModal(auxList)}
                className="text-[10px] font-extrabold text-blue-600 hover:text-blue-800 underline flex items-center gap-1 cursor-pointer"
              >
                <Eye size={12} /> Buka Semua ({auxList.length})
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {auxList.length > 0 ? (
              auxList.map((aux, aIdx) => (
                <button
                  key={aIdx}
                  onClick={() => onOpenAuxiliaryModal([aux])}
                  className="rounded-md bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[10px] font-extrabold text-emerald-900 inline-flex items-center gap-1 hover:bg-emerald-200 transition cursor-pointer active:scale-95 shadow-2xs"
                  title="Klik untuk membuka pratinjau berkas penunjang"
                >
                  <CheckCircle2 size={12} className="text-emerald-700" />
                  {aux.name}
                  <Eye size={11} className="text-emerald-700 ml-0.5" />
                </button>
              ))
            ) : (
              <span className="text-[11px] font-semibold text-slate-400">
                Belum ada berkas penunjang yang diminta oleh peserta pada stase ini.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
