import { Eye } from "lucide-react";

export default function ExaminerGoldStandardReference({
  stationData,
  showScenario,
  setShowScenario,
  onSelectAuxModalResults,
}) {
  const masterAux =
    stationData?.station_auxiliary_configs ||
    stationData?.auxiliary_exam_configs ||
    stationData?.auxiliary_files ||
    [];

  return (
    <div className="rounded-3xl border border-emerald-300 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-emerald-400/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-emerald-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase">
            GOLD STANDARD REFERENCE
          </span>
          <h3 className="text-sm font-black text-white">
            Acuan Kunci Jawaban Resmi Admin
          </h3>
        </div>
        <button
          onClick={() => setShowScenario(!showScenario)}
          className="text-xs font-bold text-emerald-300 hover:text-white transition underline cursor-pointer"
        >
          {showScenario ? "Sembunyikan Skenario" : "Lihat Skenario Lengkap"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-300 uppercase block">
            Kunci Diagnosis (WDx & DDx):
          </span>
          <p className="font-semibold text-slate-100 leading-relaxed whitespace-pre-line">
            {stationData?.answer_key_diagnosis || "Belum ada kunci diagnosis yang dikonfigurasi untuk stase ini."}
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-300 uppercase block">
            Kunci Resep Baku (Rx):
          </span>
          <p className="font-semibold text-slate-100 leading-relaxed font-mono whitespace-pre-line">
            {stationData?.answer_key_prescription || "Belum ada kunci resep obat yang dikonfigurasi untuk stase ini."}
          </p>
        </div>

        {/* Master Kunci Berkas Penunjang Tambahan */}
        {masterAux && masterAux.length > 0 && (
          <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 space-y-1.5 sm:col-span-2">
            <span className="text-[10px] font-extrabold text-emerald-300 uppercase block">
              Kunci Berkas Penunjang Baku (Radiologi / EKG / Lab):
            </span>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {masterAux.map((aux, aIdx) => (
                <button
                  key={aIdx}
                  type="button"
                  onClick={() => onSelectAuxModalResults([aux])}
                  className="rounded-lg bg-emerald-500/20 border border-emerald-400/50 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/40 transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>{aux.name || aux.title || "Berkas Penunjang"}</span>
                  <span className="text-[9px] bg-emerald-400/30 text-emerald-200 px-1.5 py-0.5 rounded font-extrabold">
                    {aux.category || "RADIOLOGI"}
                  </span>
                  <Eye size={13} className="text-emerald-300 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {stationData?.answer_key_physical_exam && (
          <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 space-y-1 sm:col-span-2">
            <span className="text-[10px] font-extrabold text-emerald-300 uppercase block">
              Kunci Pemeriksaan Fisik Baku:
            </span>
            <p className="font-semibold text-slate-100 leading-relaxed whitespace-pre-line">
              {stationData.answer_key_physical_exam}
            </p>
          </div>
        )}
      </div>

      {showScenario && (
        <div className="rounded-2xl bg-slate-900/90 border border-emerald-400/40 p-4 space-y-2 text-xs text-slate-200 animate-in fade-in duration-200">
          <p>
            <strong>Skenario Klinis:</strong> {stationData?.scenario || "Skenario kasus medis terstandar untuk stase ini."}
          </p>
          <p>
            <strong>Instruksi Penguji:</strong> {stationData?.examiner_instructions || "Amati kesantunan, komunikasi, dan keterampilan klinis peserta."}
          </p>
        </div>
      )}
    </div>
  );
}
