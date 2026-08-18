import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  FlaskConical,
  Stethoscope,
  Award,
  HelpCircle,
  CheckCircle2,
  Image as ImageIcon,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import SuccessModal from "@/components/ui/SuccessModal";
import { getStageById, updateStageQuestion } from "@/services/stage.service";
import { fetchDoctorExaminers } from "@/services/examinerService";
import { DOCTOR_EXAMINER_LIST } from "@/features/admin/pages/CreateSessionPage";

const DEFAULT_EMPTY_STAGE = {
  id: "stg-101",
  session_id: "session-osce-001",
  station_number: 1,
  title: "Stase Baru Ujian OSCE",
  case_title: "",
  system_organ: "Kardiovaskular",
  competency_level: "4A (Tuntas Mandiri)",
  scenario: "",
  participant_instruction: "",
  examiner_instruction: "",
  duration_minutes: 12,
  auxiliary_answer_key: "",
  auxiliary_files: [],

  // Kunci Diagnosis & Resep (Tahap 4)
  gold_standard_keys: {
    wdx: "STEMI Anteroseptal Akut (ICD-10: I21.0) / Penyakit Jantung Koroner (PJK)",
    ddx: [
      "NSTEMI (Non-ST Segment Elevation Myocardial Infarction)",
      "Angina Pektoris Tidak Stabil (UAP)",
      "Diseksi Aorta Thorakalis Akut",
      "Perikarditis Akut",
    ],
    recipe: "R/ Aspirin tab 80 mg No. IV\n    S 1 dd tab IV (chewable / kunyah)\n-\nR/ Clopidogrel tab 75 mg No. IV\n    S 1 dd tab IV (loading dose)\n-\nR/ ISDN tab 5 mg No. III\n    S prn 1 dd tab I sublingual",
  },

  // Rubrik Penilaian Penguji (Items 1-4)
  rubric_items: [
    {
      id: "r1",
      question: "Komunikasi & Membina Sambung Rasa",
      competency: "Komunikasi & Edukasi",
      weight: 2,
      max_points: 3,
      answer_key: "Peserta mengucapkan salam, memperkenalkan diri, mengonfirmasi identitas pasien, empati pada rasa nyeri dada pasien.",
      descriptors: {
        0: "Peserta tidak melakukan pembinaan sambung rasa dan tidak empati.",
        1: "Peserta hanya menyapa tanpa memperkenalkan diri atau tidak empati.",
        2: "Peserta menyapa, memperkenalkan diri, dan menanyakan identitas pasien.",
        3: "Peserta menyapa, memperkenalkan diri, mengonfirmasi identitas, dan empati sempurna terhadap kondisi darurat pasien.",
      },
    },
    {
      id: "r2",
      question: "Anamnesis Terarah Nyeri Dada Infark",
      competency: "Anamnesis",
      weight: 4,
      max_points: 3,
      answer_key: "Menanyakan onset (2 jam), lokasi/radiasi (dada kiri ke lengan/leher), kualitas (ditindih beban berat), gejala penyerta (keringat dingin, mual), dan faktor risiko (hipertensi, merokok).",
      descriptors: {
        0: "Peserta tidak melakukan anamnesis nyeri dada.",
        1: "Peserta menanyakan keluhan utama tetapi tidak menanyakan karakteristik/radiasi nyeri.",
        2: "Peserta menanyakan onset, lokasi, dan radiasi tetapi lupa menanyakan faktor risiko.",
        3: "Peserta melakukan anamnesis PQRST lengkap beserta faktor risiko kardiovaskular secara terstruktur.",
      },
    },
    {
      id: "r3",
      question: "Pemeriksaan Penunjang (Radiologi, EKG, Lab)",
      competency: "Pemeriksaan Penunjang",
      weight: 3,
      max_points: 3,
      answer_key: "Meminta EKG 12 lead (identifikasi ST elevasi V1-V4), Foto Thorax PA, dan Troponin T.",
      descriptors: {
        0: "Peserta tidak merencanakan pemeriksaan penunjang.",
        1: "Peserta meminta EKG tetapi tidak bisa menginterpretasikan elevasi segmen ST.",
        2: "Peserta meminta EKG & Troponin T serta mampu membaca ST elevasi anteroseptal.",
        3: "Peserta mengusulkan Thorax PA, EKG, & Troponin T serta menginterpretasikan ST elevasi V1-V4 dan peningkatan Troponin T dengan sangat tepat.",
      },
    },
    {
      id: "r4",
      question: "Penetapan Diagnosis & Penulisan Resep Medis",
      competency: "Diagnosis & Resep Medis",
      weight: 4,
      max_points: 3,
      answer_key: "WDx: STEMI Anteroseptal Akut. DDx: NSTEMI, UAP, Perikarditis. Resep: ISDN 5mg sublingual + DAPT (Aspirin 320mg + Clopidogrel 300mg).",
      descriptors: {
        0: "Peserta salah menetapkan diagnosis dan tidak menulis resep medis.",
        1: "Peserta menyebutkan diagnosis tetapi tidak lengkap (hanya PJK) dan dosis resep salah.",
        2: "Peserta menegakkan WDx STEMI dan DDx tepat, serta menuliskan resep DAPT tetapi aturan minum kurang lengkap.",
        3: "Peserta menegakkan WDx STEMI Anteroseptal, minimal 2 DDx tepat, dan menuliskan resep DAPT + ISDN sublingual dengan dosis loading & aturan pakai yang sempurna.",
      },
    },
  ],
};

export default function StageQuestionPage() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("info"); // info, penunjang, diagnosis, rubric
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(null);

  // Form State
  const [caseTitle, setCaseTitle] = useState("");
  const [systemOrgan, setSystemOrgan] = useState("Kardiovaskular");
  const [competencyLevel, setCompetencyLevel] = useState("4A (Tuntas Mandiri)");
  const [assignedExaminer, setAssignedExaminer] = useState("");
  const [scenario, setScenario] = useState("");
  const [participantInstruction, setParticipantInstruction] = useState("");
  const [examinerInstruction, setExaminerInstruction] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);

  // Auxiliary State (Tahap 3)
  const [auxAnswerKey, setAuxAnswerKey] = useState("");
  const [auxFiles, setAuxFiles] = useState([]);

  // Diagnosis State (Tahap 4)
  const [wdxKey, setWdxKey] = useState("");
  const [ddxKeys, setDdxKeys] = useState([]);
  const [recipeKey, setRecipeKey] = useState("");

  // Rubric Items State
  const [rubricItems, setRubricItems] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    async function initExaminers() {
      try {
        const docs = await fetchDoctorExaminers();
        if (docs && docs.length > 0) setDoctorList(docs);
      } catch (e) {}
    }
    initExaminers();
    loadData();
  }, [stageId]);

  async function loadData() {
    setLoading(true);
    let data = null;
    try {
      data = await getStageById(stageId);
    } catch (err) {
      console.error(err);
    }

    if (!data || !data.case_title) {
      data = { ...DEFAULT_EMPTY_STAGE, id: stageId || "stg-101" };
    }

    setStage(data);
    setCaseTitle(data.case_title || "");
    setSystemOrgan(data.system_organ || "Kardiovaskular");
    setCompetencyLevel(data.competency_level || "4A (Tuntas Mandiri)");
    setAssignedExaminer(data.assigned_examiner || "");
    setScenario(data.scenario || "");
    setParticipantInstruction(data.participant_instructions || data.participant_instruction || "");
    setExaminerInstruction(data.examiner_instructions || data.examiner_instruction || "");
    setDurationMinutes(data.duration_minutes || 15);

    setAuxAnswerKey(data.auxiliary_answer_key || "");
    setAuxFiles(data.auxiliary_files || []);

    const rawDiagStr = data.answer_key_diagnosis || data.gold_standard_keys?.wdx || "";
    let parsedWdx = data.gold_standard_keys?.wdx || "";
    let parsedDdxArr = Array.isArray(data.gold_standard_keys?.ddx) ? [...data.gold_standard_keys.ddx] : [];

    if (!parsedWdx && rawDiagStr) {
      const diagLines = rawDiagStr.split("\n");
      const ddxExtracted = [];
      diagLines.forEach((l) => {
        if (/wdx|kerja/i.test(l)) {
          parsedWdx = l.replace(/^(wdx|diagnosis kerja utama|kerja)[\s:]*/i, "").trim();
        } else if (/ddx|banding/i.test(l)) {
          const dVal = l.replace(/^(ddx\s*\d*|diagnosis banding\s*\d*|banding\s*\d*)[\s:]*/i, "").trim();
          if (dVal) ddxExtracted.push(dVal);
        }
      });
      if (!parsedWdx && diagLines[0]) parsedWdx = diagLines[0];
      if (ddxExtracted.length > 0) parsedDdxArr = ddxExtracted;
      else if (diagLines.length > 1 && parsedDdxArr.length === 0) parsedDdxArr = diagLines.slice(1);
    }

    while (parsedDdxArr.length < 2) {
      parsedDdxArr.push("");
    }

    setWdxKey(parsedWdx);
    setDdxKeys(parsedDdxArr);
    setRecipeKey(data.answer_key_prescription || data.gold_standard_keys?.recipe || "");

    setRubricItems(data.rubric_items || []);
    setLoading(false);
  }

  // Handlers for Aux Files
  function addAuxFile() {
    setAuxFiles([
      ...auxFiles,
      {
        id: `ax-${Date.now()}`,
        name: "",
        category: "Radiologi",
        matched_key: true,
        file_url: "",
        image_url: "",
        report_text: "",
      },
    ]);
  }

  function removeAuxFile(idx) {
    const updated = [...auxFiles];
    updated.splice(idx, 1);
    setAuxFiles(updated);
  }

  function updateAuxFile(idx, field, value) {
    const updated = [...auxFiles];
    updated[idx][field] = value;
    if (field === "file_url" || field === "image_url" || field === "imageUrl") {
      updated[idx]["file_url"] = value;
      updated[idx]["image_url"] = value;
      updated[idx]["imageUrl"] = value;
    }
    if (field === "report_text" || field === "reportText") {
      updated[idx]["report_text"] = value;
      updated[idx]["reportText"] = value;
    }
    setAuxFiles(updated);
  }

  // Handlers for DDx
  function addDdxKey() {
    setDdxKeys([...ddxKeys, ""]);
  }

  function removeDdxKey(idx) {
    const updated = [...ddxKeys];
    updated.splice(idx, 1);
    setDdxKeys(updated);
  }

  function updateDdxKey(idx, val) {
    const updated = [...ddxKeys];
    updated[idx] = val;
    setDdxKeys(updated);
  }

  // Handlers for Rubric Items
  function addRubricItem() {
    setRubricItems([
      ...rubricItems,
      {
        id: `r-${Date.now()}`,
        question: "Item Kompetensi Baru",
        competency: "Pemeriksaan Fisik",
        weight: 2,
        max_points: 3,
        answer_key: "",
        descriptors: {
          0: "Tidak dilakukan.",
          1: "Minimal / Tidak lengkap.",
          2: "Memadai.",
          3: "Sempurna & Tepat.",
        },
      },
    ]);
  }

  function removeRubricItem(idx) {
    const updated = [...rubricItems];
    updated.splice(idx, 1);
    setRubricItems(updated);
  }

  function updateRubricItem(idx, field, value) {
    const updated = [...rubricItems];
    updated[idx][field] = value;
    setRubricItems(updated);
  }

  function updateDescriptor(itemIdx, level, value) {
    const updated = [...rubricItems];
    updated[itemIdx].descriptors = {
      ...updated[itemIdx].descriptors,
      [level]: value,
    };
    setRubricItems(updated);
  }

  async function handleSaveAll() {
    const payload = {
      case_title: caseTitle,
      system_organ: systemOrgan,
      competency_level: competencyLevel,
      assigned_examiner: assignedExaminer,
      scenario,
      participant_instruction: participantInstruction,
      participant_instructions: participantInstruction,
      examiner_instruction: examinerInstruction,
      examiner_instructions: examinerInstruction,
      duration_minutes: Number(durationMinutes),
      auxiliary_answer_key: auxAnswerKey,
      auxiliary_files: auxFiles,
      gold_standard_keys: {
        wdx: wdxKey,
        ddx: ddxKeys,
        recipe: recipeKey,
      },
      rubric_items: rubricItems,
    };

    try {
      await updateStageQuestion(stageId, payload);
    } catch (err) {
      console.error(err);
    }

    setShowSuccessModal(true);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[400px] items-center justify-center text-xs font-semibold text-slate-500">
          Memuat Konfigurasi Soal Stase...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Top Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/admin/sessions/${stage.session_id || "session-osce-001"}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          Kembali ke Detail Sesi OSCE
        </button>

        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
        >
          <Save size={16} />
          Simpan Seluruh Soal & Rubrik
        </button>
      </div>

      {/* Header Info */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
            STASE {stage.station_number}
          </span>
          <span className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
            {systemOrgan} • SKDI {competencyLevel}
          </span>
        </div>
        <h1 className="text-xl font-black text-slate-900 pt-1">
          {stage.title}
        </h1>
        <p className="text-xs text-slate-500">
          Kelola skenario klinis, kunci indikasi penunjang, jawaban baku diagnosis/resep, serta deskriptor rubrik penilaian 0-3.
        </p>
      </div>

      {/* Tabbed Navigation */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        {[
          { id: "info", label: "1. Skenario & Instruksi Stase", icon: FileText },
          { id: "penunjang", label: "2. Kunci Penunjang (Tahap 3)", icon: FlaskConical },
          { id: "diagnosis", label: "3. Kunci Diagnosis & Resep (Tahap 4)", icon: Stethoscope },
          { id: "rubric", label: "4. Rubrik Penilaian Penguji (0-3)", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition border-b-2 ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SKENARIO & INSTRUKSI STASE */}
      {activeTab === "info" && (
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
                  <option value="Kardiovaskular">Kardiovaskular</option>
                  <option value="Respirasi">Respirasi</option>
                  <option value="Neurologi">Neurologi</option>
                  <option value="Digestif">Digestif</option>
                  <option value="Muskuloskeletal">Muskuloskeletal</option>
                  <option value="Endokrin">Endokrin & Metabolik</option>
                  <option value="Urologi">Urologi & Nefrologi</option>
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
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border inline-flex items-center gap-1 ${
                assignedExaminer
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : "bg-amber-100 text-amber-900 border-amber-300"
              }`}>
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

            {(() => {
              const currentExaminer = assignedExaminer || "";
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
                      <option value={currentExaminer}>
                        {currentExaminer}
                      </option>
                    )}
                  </select>
                </div>
              );
            })()}
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
      )}

      {/* TAB 2: KUNCI PENUNJANG (TAHAP 3) */}
      {activeTab === "penunjang" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900">
              Konfigurasi Pemeriksaan Penunjang (Candidate Step 3)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur kunci indikasi penunjang serta berkas hasil (Foto X-Ray, EKG, Hasil Lab) yang muncul saat diminta peserta.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Kunci Indikasi Pemeriksaan Penunjang (Kunci Baku Stase)
            </label>
            <textarea
              rows={3}
              value={auxAnswerKey}
              onChange={(e) => setAuxAnswerKey(e.target.value)}
              placeholder="Tuliskan daftar pemeriksaan penunjang yang berindikasi dan tepat..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed focus:border-blue-500 focus:outline-none font-semibold"
            />
          </div>

          {/* Auxiliary Files Management */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase">
                Daftar Berkas Lampiran Hasil Penunjang ({auxFiles.length} Berkas)
              </h3>
              <button
                type="button"
                onClick={addAuxFile}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
              >
                <Plus size={15} />
                Tambah Berkas Penunjang
              </button>
            </div>

            <div className="space-y-3">
              {auxFiles.map((file, idx) => (
                <div
                  key={file.id || idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-bold text-slate-900">
                      Berkas #{idx + 1}: {file.name || "Nama Berkas Belum Diisi"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAuxFile(idx)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Nama Berkas</label>
                      <input
                        type="text"
                        value={file.name}
                        onChange={(e) => updateAuxFile(idx, "name", e.target.value)}
                        placeholder="misal: EKG 12 Lead"
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Kategori Berkas</label>
                      <select
                        value={file.category}
                        onChange={(e) => updateAuxFile(idx, "category", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
                      >
                        <option value="Radiologi">Radiologi (X-Ray / CT / USG)</option>
                        <option value="EKG">EKG / Elektrokardiogram</option>
                        <option value="Laboratorium">Laboratorium Darah / Urin</option>
                        <option value="Lainnya">Pemeriksaan Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Status Indikasi Medis</label>
                      <select
                        value={file.matched_key ? "true" : "false"}
                        onChange={(e) => updateAuxFile(idx, "matched_key", e.target.value === "true")}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-bold"
                      >
                        <option value="true">Kunci Indikasi (Matched Key)</option>
                        <option value="false">Non-Indikasi (Tambahan)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">URL Berkas Gambar / PDF Hasil / Link Storage</label>
                      <input
                        type="text"
                        value={file.image_url || file.file_url || ""}
                        onChange={(e) => updateAuxFile(idx, "file_url", e.target.value)}
                        placeholder="https://images.unsplash.com/... atau URL berkas hasil"
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Catatan Laporan / Ekspertise Medis Teks</label>
                      <input
                        type="text"
                        value={file.report_text || file.reportText || ""}
                        onChange={(e) => updateAuxFile(idx, "report_text", e.target.value)}
                        placeholder="misal: ST Elevation pada Lead V1-V4 (STEMI Anteroseptal)"
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KUNCI DIAGNOSIS & RESEP (TAHAP 4) */}
      {activeTab === "diagnosis" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900">
              Kunci Jawaban Baku Diagnosis & Resep (Candidate Step 4)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan kunci diagnosis kerja (WDx), diagnosis banding (DDx), dan lembar resep medis baku sebagai acuan pembanding penguji.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              1. Kunci Diagnosis Kerja Baku (Working Diagnosis - WDx)
            </label>
            <textarea
              rows={3}
              value={wdxKey}
              onChange={(e) => setWdxKey(e.target.value)}
              placeholder="Tuliskan kunci diagnosis kerja utama (WDx) secara lengkap..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                2. Kunci Diagnosis Banding Baku (Differential Diagnosis - DDx)
              </label>
              <button
                type="button"
                onClick={addDdxKey}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus size={14} /> Tambah DDx
              </button>
            </div>

            <div className="space-y-3">
              {ddxKeys.map((ddx, dIdx) => (
                <div key={dIdx} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-slate-400 w-6 mt-2.5">{dIdx + 1}.</span>
                  <textarea
                    rows={2}
                    value={ddx}
                    onChange={(e) => updateDdxKey(dIdx, e.target.value)}
                    placeholder={`Tuliskan kunci diagnosis banding #${dIdx + 1} (DDx ${dIdx + 1})...`}
                    className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-semibold focus:border-blue-500 focus:outline-none leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={() => removeDdxKey(dIdx)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg mt-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              3. Kunci Penulisan Resep Medis Baku (Prescription Sheet Key)
            </label>
            <textarea
              rows={6}
              value={recipeKey}
              onChange={(e) => setRecipeKey(e.target.value)}
              placeholder="Tuliskan format penulisan resep obat baku lengkap beserta dosis & signa..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 font-mono whitespace-pre-line leading-relaxed focus:border-blue-500 focus:outline-none font-semibold"
            />
          </div>
        </div>
      )}

      {/* TAB 4: RUBRIK PENILAIAN PENGUJI (0-3) */}
      {activeTab === "rubric" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                Pengaturan Item Rubrik & Matriks Deskriptor Kriteria (0 - 3)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi item penilaian, bobot kompetensi, kunci baku, serta acuan deskriptor skor 0, 1, 2, dan 3.
              </p>
            </div>

            <button
              type="button"
              onClick={addRubricItem}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
            >
              <Plus size={15} />
              Tambah Item Kompetensi
            </button>
          </div>

          <div className="space-y-6">
            {rubricItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 shadow-2xs"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Item Kompetensi #{idx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeRubricItem(idx)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Hapus Item
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Pertanyaan / Prosedur Kompetensi</label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateRubricItem(idx, "question", e.target.value)}
                      placeholder="misal: 1. Anamnesis Terarah"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Area Kompetensi</label>
                      <select
                        value={item.competency}
                        onChange={(e) => updateRubricItem(idx, "competency", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 font-medium focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Komunikasi & Edukasi">Komunikasi & Edukasi</option>
                        <option value="Anamnesis">Anamnesis</option>
                        <option value="Pemeriksaan Fisik">Pemeriksaan Fisik</option>
                        <option value="Pemeriksaan Penunjang">Pemeriksaan Penunjang</option>
                        <option value="Diagnosis & DDx">Diagnosis & DDx</option>
                        <option value="Tata Laksana & Resep">Tata Laksana & Resep</option>
                        <option value="Perilaku Profesional">Perilaku Profesional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Bobot Soal</label>
                      <select
                        value={item.weight}
                        onChange={(e) => updateRubricItem(idx, "weight", Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
                      >
                        <option value={1}>1x (Standar)</option>
                        <option value={2}>2x (Sedang)</option>
                        <option value={3}>3x (Tinggi)</option>
                        <option value={4}>4x (Sangat Tinggi)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Kunci Jawaban & Prosedur Baku Penguji</label>
                  <textarea
                    rows={2}
                    value={item.answer_key}
                    onChange={(e) => updateRubricItem(idx, "answer_key", e.target.value)}
                    placeholder="Tuliskan rangkuman kunci tindakan yang benar..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 leading-relaxed font-semibold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Deskriptor Kriteria Level 0, 1, 2, 3 */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                    Matriks Deskriptor Kriteria Penilaian (Level 0 - 3)
                  </label>
                  <div className="grid gap-2 sm:grid-cols-4">
                    <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-2.5 space-y-1">
                      <span className="text-[10px] font-black text-rose-900 block uppercase">Skor 0 (Tidak Dilakukan)</span>
                      <textarea
                        rows={3}
                        value={item.descriptors?.[0] || ""}
                        onChange={(e) => updateDescriptor(idx, 0, e.target.value)}
                        className="w-full rounded-lg border border-rose-200 bg-white p-2 text-[11px] text-rose-950 font-medium focus:outline-none"
                      />
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 space-y-1">
                      <span className="text-[10px] font-black text-amber-900 block uppercase">Skor 1 (Minimal)</span>
                      <textarea
                        rows={3}
                        value={item.descriptors?.[1] || ""}
                        onChange={(e) => updateDescriptor(idx, 1, e.target.value)}
                        className="w-full rounded-lg border border-amber-200 bg-white p-2 text-[11px] text-amber-950 font-medium focus:outline-none"
                      />
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-2.5 space-y-1">
                      <span className="text-[10px] font-black text-blue-900 block uppercase">Skor 2 (Memadai)</span>
                      <textarea
                        rows={3}
                        value={item.descriptors?.[2] || ""}
                        onChange={(e) => updateDescriptor(idx, 2, e.target.value)}
                        className="w-full rounded-lg border border-blue-200 bg-white p-2 text-[11px] text-blue-950 font-medium focus:outline-none"
                      />
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 space-y-1">
                      <span className="text-[10px] font-black text-emerald-900 block uppercase">Skor 3 (Sempurna)</span>
                      <textarea
                        rows={3}
                        value={item.descriptors?.[3] || ""}
                        onChange={(e) => updateDescriptor(idx, 3, e.target.value)}
                        className="w-full rounded-lg border border-emerald-200 bg-white p-2 text-[11px] text-emerald-950 font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Bottom Save Action */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <span className="text-xs font-semibold text-slate-500">
          Pastikan seluruh skenario, berkas penunjang, dan rubrik 0-3 telah terisi sebelum menyimpan.
        </span>
        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
        >
          <Save size={16} />
          Simpan Seluruh Soal & Rubrik
        </button>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Konfigurasi Soal Disimpan"
        message="Seluruh konfigurasi soal, kunci jawaban baku, berkas penunjang, dan rubrik 0-3 berhasil disimpan."
        actionText="Selesai"
        onAction={() => setShowSuccessModal(false)}
      />
    </AdminLayout>
  );
}