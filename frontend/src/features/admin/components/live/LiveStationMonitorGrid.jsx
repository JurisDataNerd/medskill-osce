import { Grid, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LiveStationMonitorGrid({ liveStations = [] }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Grid size={18} className="text-blue-600" />
          Matriks Live Station Pos ({liveStations.length} Pos)
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {liveStations.map((stg) => (
          <div
            key={stg.id}
            className={`rounded-2xl border p-4 space-y-3 shadow-2xs transition ${
              stg.is_break
                ? "border-amber-300 bg-amber-50/70"
                : "border-slate-200 bg-slate-50/70 hover:border-blue-400 hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase ${
                  stg.is_break ? "bg-amber-200 text-amber-950" : "bg-blue-600 text-white"
                }`}
              >
                {stg.title || `Stase ${stg.station_number}`}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400">
                Pos #{stg.station_number}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                {stg.case_title || "Kasus Medis Terstandar"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Penguji: <span className="font-bold text-slate-700">{stg.examiner?.full_name || "Tidak ada data"}</span>
              </p>
            </div>

            {!stg.is_break && (
              <button
                onClick={() => navigate(`/admin/live/station/${stg.id}`)}
                className="w-full flex items-center justify-center gap-1 rounded-xl bg-blue-50 border border-blue-200 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
              >
                Inspect Stase
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
