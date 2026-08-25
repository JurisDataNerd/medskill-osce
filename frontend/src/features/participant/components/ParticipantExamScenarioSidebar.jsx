export default function ParticipantExamScenarioSidebar({ activeStationInfo }) {
  let rawInstructions = [];
  const instSource = activeStationInfo?.participant_instructions;

  if (Array.isArray(instSource)) {
    rawInstructions = instSource.flatMap((item) =>
      typeof item === "string" ? item.split("\n") : [String(item)]
    );
  } else if (typeof instSource === "string") {
    rawInstructions = instSource.split("\n");
  }

  const cleanInstructions = rawInstructions
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="lg:col-span-4 space-y-4">
      {/* Station Title Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            Stase Ujian Live
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            Penguji: <strong>{activeStationInfo.examiner_name}</strong>
          </span>
        </div>

        <h1 className="text-sm font-extrabold text-slate-900 leading-snug">
          {`Stase ${activeStationInfo.station_number}${activeStationInfo.is_break ? " (Istirahat)" : ""}`}
        </h1>
      </div>

      {/* Skenario Kasus Medis */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Skenario Kasus Medis
        </h2>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-900 font-semibold leading-relaxed text-justify whitespace-pre-line shadow-2xs">
          {activeStationInfo.scenario || "Skenario kasus medis terstandar untuk stase ini."}
        </div>
      </div>

      {/* Instruksi Peserta Ujian */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Instruksi Peserta Ujian
        </h2>
        <div className="space-y-2 text-xs text-slate-800 font-medium">
          {cleanInstructions.length > 0 ? (
            cleanInstructions.map((inst, idx) => {
              const cleanText = inst.replace(/^(\d+[\.\)]|[a-zA-Z][\.\)]|[-•*])\s*/, "").trim();
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/90 p-3 flex items-start gap-2.5 shadow-2xs hover:border-blue-200 transition"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white text-[10px] font-black mt-0.5 shadow-xs">
                    {idx + 1}
                  </span>
                  <span className="text-xs leading-relaxed text-slate-900 font-semibold text-justify flex-1">
                    {cleanText || inst}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 italic">Belum ada instruksi peserta khusus.</p>
          )}
        </div>
      </div>
    </div>
  );
}
