import {
  RotateCw,
  Clock,
  Building2,
  Plus,
  Coffee,
  GripVertical,
  Trash2,
  Save,
  ChevronRight,
} from "lucide-react";

export default function SessionStationsTimerTab({
  stationDurationMinutes,
  setStationDurationMinutes,
  breakSlotDurationMinutes,
  setBreakSlotDurationMinutes,
  transitionDurationMinutes,
  setTransitionDurationMinutes,
  totalRounds,
  stationsConfig,
  examCount,
  breakCount,
  draggedIndex,
  dragOverIndex,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  handleSetPresetStations,
  handleAddStationInline,
  handleAddBreakInline,
  handleRemoveStationInline,
  handleSaveCurrentSection,
  handleNextTab,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <RotateCw size={19} className="text-blue-600" />
          2. Durasi & Sirkuit Stase
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur durasi stase, waktu istirahat, jeda transisi, dan susunan stase dalam sirkuit.
        </p>
      </div>

      {/* SEKSI 1: PENGATURAN WAKTU & TIMER ROTASI */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Clock size={16} className="text-blue-600" />
          Pengaturan Waktu Ujian
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600"></span>
              Durasi Stase (Menit)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={stationDurationMinutes}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setStationDurationMinutes(val === "" ? "" : Number(val));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              Durasi Istirahat (Menit)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={breakSlotDurationMinutes}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setBreakSlotDurationMinutes(val === "" ? "" : Number(val));
              }}
              className="w-full rounded-xl border border-amber-300 bg-amber-50/50 p-3 text-xs font-bold text-amber-950 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Durasi Transisi (Menit)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={transitionDurationMinutes}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setTransitionDurationMinutes(val === "" ? "" : Number(val));
              }}
              className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 p-3 text-xs font-bold text-emerald-950 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Ringkasan Kalkulasi Sirkuit */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs grid gap-4 sm:grid-cols-3">
          <div>
            <span className="text-slate-500 block text-[11px] font-medium">Total Stase Sirkuit</span>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="font-black text-slate-900 text-sm">
                {stationsConfig.length} Stase
              </span>
              <span className="rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                {examCount} Ujian
              </span>
              {breakCount > 0 && (
                <span className="rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-200">
                  {breakCount} Istirahat
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-medium">Total Ronde Rotasi</span>
            <span className="font-black text-blue-800 text-base block mt-0.5">
              {totalRounds} Ronde
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-medium">Estimasi Waktu Rotasi</span>
            <span className="font-black text-emerald-800 text-base block mt-0.5">
              {(stationDurationMinutes + transitionDurationMinutes) * totalRounds} Menit
            </span>
          </div>
        </div>
      </div>

      {/* SEKSI 2: KONFIGURASI POS RUANGAN & SLOT SIRKUIT */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                Susunan Stase Sirkuit
              </h3>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                {stationsConfig.length} Stase
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tarik kartu stase untuk mengatur urutan rotasi peserta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold px-1.5">Preset:</span>
              <button
                type="button"
                onClick={() => handleSetPresetStations(4)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  stationsConfig.length === 4
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                4 Stase
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetStations(6)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  stationsConfig.length === 6
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                6 Stase
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetStations(8)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  stationsConfig.length === 8
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                8 Stase
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddStationInline}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              Tambah Stase Ujian
            </button>
            <button
              type="button"
              onClick={handleAddBreakInline}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              <Coffee size={15} />
              Tambah Stase Istirahat
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stationsConfig.map((stg, idx) => {
            const isDragging = draggedIndex === idx;
            const isDragOver = dragOverIndex === idx;
            const isBreak = stg.is_break;

            return (
              <div
                key={stg.id || idx}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`group relative flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition duration-150 space-y-2.5 ${
                  isBreak
                    ? "border-amber-300 bg-amber-50/70 hover:border-amber-400"
                    : "border-slate-200 bg-white hover:border-blue-300"
                } ${
                  isDragging ? "opacity-30 scale-95 border-dashed" : ""
                } ${isDragOver ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 transition rounded hover:bg-slate-100"
                      title="Tarik untuk menggeser posisi slot"
                    >
                      <GripVertical size={16} />
                    </span>

                    <span
                      className={`flex h-6 px-2 items-center justify-center rounded-md font-extrabold text-[11px] ${
                        isBreak
                          ? "bg-amber-200 text-amber-950"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      Slot {stg.station_number}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveStationInline(idx)}
                    className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                    title="Hapus Slot Ini"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div>
                  {/* Station Title Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-full rounded-lg border p-2.5 text-xs font-bold text-center ${
                        isBreak
                          ? "border-amber-300 bg-amber-100 text-amber-950"
                          : "border-slate-200 bg-slate-50 text-slate-900"
                      }`}
                    >
                      {isBreak ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Coffee size={14} className="text-amber-700" />
                          Stase Istirahat
                        </span>
                      ) : (
                        `Stase Ujian ${stg.exam_number || idx + 1}`
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons for Tab 2 */}
      <div className="flex justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => handleSaveCurrentSection(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
        >
          <Save size={15} />
          Simpan Draft
        </button>
        <button
          type="button"
          onClick={handleNextTab}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer"
        >
          Lanjutkan: Soal & Rubrik
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
