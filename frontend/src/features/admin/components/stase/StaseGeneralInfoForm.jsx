import { UserCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { SYSTEM_ORGAN_LIST } from "@/constants/medicalSystems";

export default function StaseGeneralInfoForm({
  caseTitle,
  setCaseTitle,
  systemOrgan,
  setSystemOrgan,
  durationMinutes,
  setDurationMinutes,
  assignedExaminer,
  setAssignedExaminer,
  doctorList = [],
  scenario,
  setScenario,
  participantInstruction,
  setParticipantInstruction,
  examinerInstruction,
  setExaminerInstruction,
}) {
  const currentExaminer = assignedExaminer || "";
  const matchedDoctor = doctorList.find((doc) => {
    if (!currentExaminer) return false;
    const target = currentExaminer.trim().toLowerCase();
    const docName = (doc.name || "").trim().toLowerCase();
    return docName === target || target.includes(docName) || docName.includes(target);
  });
  const selectValue = matchedDoctor ? matchedDoctor.name : currentExaminer;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
      <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
        Identitas Soal & Skenario Klinis
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Judul Kasus / Topik Medis
          </label>
          <input
            type="text"
            value={caseTitle}
            onChange={(e) => setCaseTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-semibold"
            placeholder="misal: STEMI Anteroseptal Akut"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Sistem Organ SKDI
            </label>
            <select
              value={systemOrgan}
              onChange={(e) => setSystemOrgan(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
            >
              {SYSTEM_ORGAN_LIST.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Durasi Stase (Menit)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 font-bold focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Penugasan Dokter Penguji */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-blue-950 flex items-center gap-2">
            <UserCheck size={16} className="text-blue-600" />
            Penugasan Dokter Penguji
          </label>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border inline-flex items-center gap-1 ${
              assignedExaminer
                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                : "bg-amber-100 text-amber-900 border-amber-300"
            }`}
          >
            {assignedExaminer ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-700" />
                Dokter Penguji Terpenuhi
              </>
            ) : (
              <>
                <AlertCircle size={13} className="text-amber-700" />
                Belum Ditugaskan
              </>
            )}
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Pilih Dokter Penguji Spesialis
          </label>
          <select
            value={selectValue}
            onChange={(e) => setAssignedExaminer(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
          >
            <option value="">-- Pilih Dokter Penguji Spesialis --</option>
            {doctorList.map((doc) => (
              <option key={doc.id} value={doc.name}>
                {doc.name} ({doc.specialty || "Spesialis Medis"}){doc.institution ? ` - ${doc.institution}` : ""}
              </option>
            ))}
            {currentExaminer && !matchedDoctor && (
              <option value={currentExaminer}>{currentExaminer}</option>
            )}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Skenario Kasus Medis (Ditampilkan di Lembar Peserta & Penguji)
        </label>
        <textarea
          rows={4}
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder="Tuliskan skenario klinis pasien secara naratif..."
          className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed focus:border-blue-500 focus:outline-none font-medium"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Instruksi Peserta Ujian
          </label>
          <textarea
            rows={5}
            value={participantInstruction}
            onChange={(e) => setParticipantInstruction(e.target.value)}
            placeholder="Tuliskan daftar tugas yang harus dilakukan peserta..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed focus:border-blue-500 focus:outline-none font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Instruksi Dokter Penguji (Panduan Observasi)
          </label>
          <textarea
            rows={5}
            value={examinerInstruction}
            onChange={(e) => setExaminerInstruction(e.target.value)}
            placeholder="Tuliskan hal-hal penting yang harus diamati dokter penguji..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed focus:border-blue-500 focus:outline-none font-medium"
          />
        </div>
      </div>
    </div>
  );
}
