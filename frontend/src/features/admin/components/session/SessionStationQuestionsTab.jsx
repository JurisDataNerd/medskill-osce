import {
  BookOpen,
  Coffee,
  GripVertical,
  Info,
  Sparkles,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Award,
  Plus,
  Trash2,
  Save,
  ChevronRight,
} from "lucide-react";
import AdminAuxiliaryExamBuilder from "@/features/admin/components/AdminAuxiliaryExamBuilder";

export default function SessionStationQuestionsTab({
  stationsConfig,
  setStationsConfig,
  selectedStationIndex,
  setSelectedStationIndex,
  totalStations,
  draggedIndex,
  dragOverIndex,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  setIsQuestionBankOpen,
  doctorList,
  handleAddChecklistItem,
  handleUpdateChecklistItem,
  handleRemoveChecklistItem,
  handleSaveCurrentSection,
  handleNextTab,
}) {
  const activeStation = stationsConfig[selectedStationIndex] || stationsConfig[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={19} className="text-blue-600" />
            3. Soal & Kunci Jawaban Rubrik Medis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola skenario kasus medis, instruksi, serta item soal-soal dan kunci jawaban rubrik secara inline tanpa modal.
          </p>
        </div>
      </div>

      {/* Station Selection Tabs with Drag & Drop */}
      <div className="space-y-1.5 border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Klik tab untuk memilih stase, atau{" "}
            <span className="font-bold text-slate-700">Tarik (Drag & Drop) tab</span> untuk mengubah urutan posisi stase:
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {stationsConfig.slice(0, totalStations).map((stg, idx) => {
            const isSelected = selectedStationIndex === idx;
            const isDragging = draggedIndex === idx;
            const isDragOver = dragOverIndex === idx;
            const isBreak = stg.is_break;

            return (
              <button
                key={stg.station_number || idx}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedStationIndex(idx)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 cursor-grab active:cursor-grabbing ${
                  isSelected
                    ? isBreak
                      ? "bg-amber-500 text-white shadow-2xs ring-2 ring-amber-400"
                      : "bg-blue-600 text-white shadow-2xs ring-2 ring-blue-400"
                    : isBreak
                    ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                } ${isDragging ? "opacity-30 scale-95" : ""} ${
                  isDragOver ? "ring-2 ring-blue-500 ring-offset-1" : ""
                }`}
              >
                <GripVertical
                  size={14}
                  className={isBreak && !isSelected ? "text-amber-600" : "text-slate-400"}
                />
                <span className="flex items-center gap-1.5 shrink-0">
                  {isBreak && <Coffee size={13} className={isSelected ? "text-white" : "text-amber-700"} />}
                  <span>{stg.title}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Station Form Editor */}
      {activeStation?.is_break ? (
        /* BREAK SLOT EDITOR (YELLOW THEME) */
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950 shadow-2xs">
                {activeStation.title} (SLOT ISTIRAHAT)
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-amber-950">
                Keterangan Ringkas
              </label>
              <input
                type="text"
                value={activeStation.case_title || `Rotasi Istirahat`}
                onChange={(e) => {
                  const val = e.target.value;
                  setStationsConfig((prev) =>
                    prev.map((item, i) =>
                      i === selectedStationIndex
                        ? { ...item, case_title: val }
                        : item
                    )
                  );
                }}
                className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs font-medium text-amber-950 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-amber-950">
                Instruksi untuk Peserta Ujian Saat Istirahat
              </label>
              <textarea
                rows={3}
                value={activeStation.participant_instructions || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setStationsConfig((prev) =>
                    prev.map((item, i) =>
                      i === selectedStationIndex
                        ? { ...item, participant_instructions: val }
                        : item
                    )
                  );
                }}
                className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs text-amber-950 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-amber-950">
                Instruksi untuk Dokter Penguji Saat Istirahat
              </label>
              <textarea
                rows={3}
                value={activeStation.examiner_instructions || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setStationsConfig((prev) =>
                    prev.map((item, i) =>
                      i === selectedStationIndex
                        ? { ...item, examiner_instructions: val }
                        : item
                    )
                  );
                }}
                className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs text-amber-950 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-100/50 p-3 flex items-center gap-2.5 text-xs text-amber-900">
            <Info size={16} className="text-amber-700 shrink-0" />
            <span>
              Slot istirahat digunakan untuk rotasi jeda fisik peserta & penguji. Tidak memerlukan item soal rubrik medis.
            </span>
          </div>
        </div>
      ) : (
        /* EXAM STATION EDITOR (DEFAULT BLUE THEME) */
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
                {activeStation.title}
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                {activeStation.case_title}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsQuestionBankOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
            >
              <Sparkles size={14} />
              Pilih dari Bank Soal
            </button>
          </div>

          {/* Skenario & Judul Kasus */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Judul Kasus Medis Stase
              </label>
              <input
                type="text"
                value={activeStation.case_title}
                onChange={(e) => {
                  const val = e.target.value;
                  setStationsConfig((prev) =>
                    prev.map((item, i) =>
                      i === selectedStationIndex
                        ? { ...item, case_title: val }
                        : item
                    )
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900"
              />
            </div>

            {/* Penugasan Dokter Penguji Stase */}
            <div className="sm:col-span-2 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-950 flex items-center gap-2">
                  <UserCheck size={16} className="text-blue-600" />
                  Penugasan Dokter Penguji
                </label>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border inline-flex items-center gap-1 ${
                  activeStation.assigned_examiner || activeStation.examiner_name
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : "bg-amber-100 text-amber-900 border-amber-300"
                }`}>
                  {activeStation.assigned_examiner || activeStation.examiner_name ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-700" />
                      Penguji Ditugaskan
                    </>
                  ) : (
                    <>
                      <AlertCircle size={13} className="text-amber-700" />
                      Belum Ditugaskan
                    </>
                  )}
                </span>
              </div>

              {(() => {
                const currentExaminer = activeStation.assigned_examiner || activeStation.examiner_name || "";
                const matchedDoctor = doctorList.find((doc) => {
                  if (!currentExaminer) return false;
                  const target = currentExaminer.trim().toLowerCase();
                  const docName = (doc.name || "").trim().toLowerCase();
                  return docName === target || target.includes(docName) || docName.includes(target);
                });
                const selectValue = matchedDoctor ? matchedDoctor.name : currentExaminer;

                return (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pilih Dokter Penguji
                    </label>
                    <select
                      value={selectValue}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        const foundDoc = doctorList.find((d) => d.name === selectedName);
                        setStationsConfig((prev) =>
                          prev.map((item, i) =>
                            i === selectedStationIndex
                              ? {
                                  ...item,
                                  assigned_examiner: selectedName,
                                  examiner_name: selectedName,
                                  examiner_user_id: foundDoc ? foundDoc.id : item.examiner_user_id || null,
                                  examiner_specialty: foundDoc ? foundDoc.specialty : item.examiner_specialty || "Spesialis Medis",
                                }
                              : item
                          )
                        );
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Pilih Dokter Penguji --</option>
                      {doctorList.map((doc) => (
                        <option key={doc.id} value={doc.name}>
                          {doc.name} ({doc.specialty || "Spesialis Medis"}){doc.institution ? ` - ${doc.institution}` : ""}
                        </option>
                      ))}
                      {currentExaminer && !matchedDoctor && (
                        <option value={currentExaminer}>
                          {currentExaminer}
                        </option>
                      )}
                    </select>
                  </div>
                );
              })()}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Skenario Kasus Medis Lengkap
              </label>
              <textarea
                rows={2}
                value={activeStation.scenario}
                onChange={(e) => {
                  const val = e.target.value;
                  setStationsConfig((prev) =>
                    prev.map((item, i) =>
                      i === selectedStationIndex
                        ? { ...item, scenario: val }
                        : item
                    )
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-800">
                Instruksi Peserta Ujian
              </label>
              <p className="text-[10px] text-blue-600 font-semibold mb-1">
                Tuliskan instruksi per baris. Sistem otomatis merapikan menjadi poin bernomor (1, 2, 3...) di layar Peserta.
              </p>
              <textarea
                rows={4}
                value={activeStation.participant_instructions || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setStationsConfig((prev) =>
                    prev.map((item, i) =>
                      i === selectedStationIndex
                        ? { ...item, participant_instructions: val }
                        : item
                    )
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 font-medium leading-relaxed"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-800">
                Instruksi Dokter Penguji
              </label>
              <p className="text-[10px] text-blue-600 font-semibold mb-1">
                Tuliskan instruksi per baris. Sistem otomatis merapikan menjadi poin bernomor (1, 2, 3...) di layar Dokter Penguji.
              </p>
              <textarea
                rows={4}
                value={activeStation.examiner_instructions || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setStationsConfig((prev) =>
                    prev.map((item, i) =>
                      i === selectedStationIndex
                        ? { ...item, examiner_instructions: val }
                        : item
                    )
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 font-medium leading-relaxed"
              />
            </div>
          </div>

          {/* Rubrik Penilaian: Item Soal & Kunci Jawaban */}
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                  <Award size={15} className="text-blue-600" />
                  Daftar Soal Rubrik & Kunci Jawaban (
                  {activeStation.checklist_items
                    ? activeStation.checklist_items.length
                    : 0}{" "}
                  Item)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tambah & edit item pertanyaan rubrik dan kunci jawaban secara langsung di halaman ini.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition active:scale-95 shadow-2xs cursor-pointer"
              >
                <Plus size={14} />
                Tambah Soal Rubrik
              </button>
            </div>

            <div className="space-y-3">
              {activeStation.checklist_items &&
                activeStation.checklist_items.map((item, itemIdx) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-blue-700">
                        Soal #{itemIdx + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-slate-500 font-medium">
                            Bobot:
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={item.max_points}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              handleUpdateChecklistItem(
                                item.id,
                                "max_points",
                                val === "" ? "" : Number(val)
                              );
                            }}
                            className="w-12 rounded-md border border-slate-200 text-center py-0.5 text-xs font-bold text-slate-900"
                          />
                          <span className="text-slate-500">Poin</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Hapus Soal Rubrik"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-0.5 block text-[10px] font-bold text-slate-600 uppercase">
                        Pertanyaan / Item Rubrik
                      </label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) =>
                          handleUpdateChecklistItem(
                            item.id,
                            "question",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 block text-[10px] font-bold text-emerald-700 uppercase">
                        Kunci Jawaban / Kriteria Penilaian Benar
                      </label>
                      <input
                        type="text"
                        value={item.answer_key}
                        onChange={(e) =>
                          handleUpdateChecklistItem(
                            item.id,
                            "answer_key",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-emerald-200 bg-emerald-50/40 p-2 text-xs text-emerald-900 font-medium"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Konfigurasi Kunci Jawaban Pemeriksaan Penunjang (Auxiliary Examination Builder) */}
          <div className="border-t border-slate-200 pt-5">
            <AdminAuxiliaryExamBuilder
              configs={activeStation.auxiliary_exam_configs || []}
              onChangeConfigs={(updatedAux) => {
                setStationsConfig((prev) =>
                  prev.map((item, i) =>
                    i === selectedStationIndex
                      ? { ...item, auxiliary_exam_configs: updatedAux }
                      : item
                  )
                );
              }}
            />
          </div>

          {/* Kunci Jawaban Diagnosis (3 Diagnosis: WDx, DDx 1, DDx 2) & Resep Medis Baku */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Kunci Jawaban Diagnosis Medis (WDx, DDx 1, DDx 2) & Resep Medis Baku
              </h4>
              <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                Kunci Baku Stase
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">
                  1. Diagnosis Kerja Utama (WDx)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan kunci diagnosis kerja utama (WDx) secara lengkap..."
                  value={activeStation.answer_key_wdx || ""}
                  onChange={(e) => {
                    const wdx = e.target.value;
                    const ddx1 = activeStation.answer_key_ddx1 || "";
                    const ddx2 = activeStation.answer_key_ddx2 || "";
                    const combined = [
                      wdx ? `WDx (Diagnosis Kerja Utama): ${wdx}` : "",
                      ddx1 ? `DDx 1 (Diagnosis Banding 1): ${ddx1}` : "",
                      ddx2 ? `DDx 2 (Diagnosis Banding 2): ${ddx2}` : "",
                    ].filter(Boolean).join("\n");

                    setStationsConfig((prev) =>
                      prev.map((item, i) =>
                        i === selectedStationIndex
                          ? {
                              ...item,
                              answer_key_wdx: wdx,
                              answer_key_diagnosis: combined || wdx,
                              answer_key_ddx: [ddx1, ddx2].filter(Boolean).join(", "),
                              gold_standard_keys: {
                                wdx,
                                ddx: [ddx1, ddx2].filter(Boolean),
                                recipe: item.answer_key_prescription || "",
                              },
                            }
                          : item
                      )
                    );
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-900 focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">
                  2. Diagnosis Banding 1 (DDx 1)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan kunci diagnosis banding 1 (DDx 1)..."
                  value={activeStation.answer_key_ddx1 || ""}
                  onChange={(e) => {
                    const ddx1 = e.target.value;
                    const wdx = activeStation.answer_key_wdx || "";
                    const ddx2 = activeStation.answer_key_ddx2 || "";
                    const combined = [
                      wdx ? `WDx (Diagnosis Kerja Utama): ${wdx}` : "",
                      ddx1 ? `DDx 1 (Diagnosis Banding 1): ${ddx1}` : "",
                      ddx2 ? `DDx 2 (Diagnosis Banding 2): ${ddx2}` : "",
                    ].filter(Boolean).join("\n");

                    setStationsConfig((prev) =>
                      prev.map((item, i) =>
                        i === selectedStationIndex
                          ? {
                              ...item,
                              answer_key_ddx1: ddx1,
                              answer_key_diagnosis: combined || wdx,
                              answer_key_ddx: [ddx1, ddx2].filter(Boolean).join(", "),
                              gold_standard_keys: {
                                wdx,
                                ddx: [ddx1, ddx2].filter(Boolean),
                                recipe: item.answer_key_prescription || "",
                              },
                            }
                          : item
                      )
                    );
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">
                  3. Diagnosis Banding 2 (DDx 2)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan kunci diagnosis banding 2 (DDx 2)..."
                  value={activeStation.answer_key_ddx2 || ""}
                  onChange={(e) => {
                    const ddx2 = e.target.value;
                    const wdx = activeStation.answer_key_wdx || "";
                    const ddx1 = activeStation.answer_key_ddx1 || "";
                    const combined = [
                      wdx ? `WDx (Diagnosis Kerja Utama): ${wdx}` : "",
                      ddx1 ? `DDx 1 (Diagnosis Banding 1): ${ddx1}` : "",
                      ddx2 ? `DDx 2 (Diagnosis Banding 2): ${ddx2}` : "",
                    ].filter(Boolean).join("\n");

                    setStationsConfig((prev) =>
                      prev.map((item, i) =>
                        i === selectedStationIndex
                          ? {
                              ...item,
                              answer_key_ddx2: ddx2,
                              answer_key_diagnosis: combined || wdx,
                              answer_key_ddx: [ddx1, ddx2].filter(Boolean).join(", "),
                              gold_standard_keys: {
                                wdx,
                                ddx: [ddx1, ddx2].filter(Boolean),
                                recipe: item.answer_key_prescription || "",
                              },
                            }
                          : item
                      )
                    );
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-800">
                Kunci Jawaban Resep Medis Baku (Farmakoterapi)
              </label>
              <textarea
                rows={3}
                placeholder="R/ Aspirin tab 80 mg No. IV..."
                value={activeStation.answer_key_prescription || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setStationsConfig((prev) =>
                    prev.map((item, i) =>
                      i === selectedStationIndex
                        ? { ...item, answer_key_prescription: val }
                        : item
                    )
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-900 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons for Tab 3 */}
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
          Lanjutkan: Aturan Ujian
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
