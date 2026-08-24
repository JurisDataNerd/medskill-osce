export default function ParticipantExamScenarioSidebar({ activeStationInfo }) {
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
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">
          {activeStationInfo.scenario}
        </div>
      </div>

      {/* Instruksi Peserta Ujian */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Instruksi Peserta Ujian
        </h2>
        <div className="space-y-2 text-xs text-slate-700 font-medium">
          {activeStationInfo.participant_instructions.map((inst, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 flex items-start gap-2"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold mt-0.5">
                {idx + 1}
              </span>
              <span className="text-[11px] leading-snug">{inst}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
