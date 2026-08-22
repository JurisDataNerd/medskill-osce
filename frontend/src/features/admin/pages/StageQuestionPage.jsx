import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  FileText,
  FlaskConical,
  Stethoscope,
  Award,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import SuccessModal from "@/components/ui/SuccessModal";
import { getStageById, updateStageQuestion } from "@/services/stage.service";
import { fetchDoctorExaminers } from "@/services/examinerService";
import { DOCTOR_EXAMINER_LIST } from "@/features/admin/pages/CreateSessionPage";
import StaseGeneralInfoForm from "@/features/admin/components/stase/StaseGeneralInfoForm";
import StaseAuxiliaryBuilder from "@/features/admin/components/stase/StaseAuxiliaryBuilder";
import StaseDiagnosisRecipeBuilder from "@/features/admin/components/stase/StaseDiagnosisRecipeBuilder";
import StaseRubricBuilder from "@/features/admin/components/stase/StaseRubricBuilder";

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
  gold_standard_keys: {
    wdx: "STEMI Anteroseptal Akut (ICD-10: I21.0) / Penyakit Jantung Koroner (PJK)",
    ddx: ["NSTEMI", "Angina Pektoris Tidak Stabil (UAP)"],
    recipe: "",
  },
  rubric_items: [
    {
      id: "r1",
      question: "Komunikasi & Membina Sambung Rasa",
      competency: "Komunikasi & Edukasi",
      weight: 2,
      max_points: 3,
      answer_key: "Peserta mengucapkan salam, memperkenalkan diri, mengonfirmasi identitas pasien, empati pada rasa nyeri dada pasien.",
      descriptors: {
        0: "Tidak dilakukan salam/perkenalan sama sekali.",
        1: "Hanya menyebutkan nama tanpa konfirmasi identitas dan empati.",
        2: "Memperkenalkan diri, konfirmasi identitas pasien dengan lengkap.",
        3: "Sempurna: Memperkenalkan diri, empati, serta menjaga kenyamanan pasien selama wawancara klinis.",
      },
    },
    {
      id: "r2",
      question: "Anamnesis Terarah & Riwayat Penyakit Sekarang (RPS)",
      competency: "Anamnesis",
      weight: 3,
      max_points: 3,
      answer_key: "Menggali keluhan nyeri dada khas iskemik substernal menjalar ke lengan kiri, durasi >20 menit, onset saat istirahat, faktor risiko (merokok, DM, hipertensi).",
      descriptors: {
        0: "Tidak menanyakan karakteristik nyeri dada.",
        1: "Menanyakan lokasi nyeri saja tanpa penjalaran dan onset.",
        2: "Menanyakan lokasi, penjalaran, durasi, dan minimal 2 faktor risiko.",
        3: "Sempurna: Eksplorasi PQRST lengkap dan faktor risiko kardiovaskular secara sistematis.",
      },
    },
    {
      id: "r3",
      question: "Pemeriksaan Fisik Tanda Vital & Kardiovaskular",
      competency: "Pemeriksaan Fisik",
      weight: 3,
      max_points: 3,
      answer_key: "Menilai kesadaran, tekanan darah, nadi perifer, auskultasi suara jantung S1-S2, gallop S3/S4, ronkhi basah basal paru.",
      descriptors: {
        0: "Tidak melakukan pemeriksaan fisik kardiovaskular.",
        1: "Hanya memeriksa tekanan darah atau nadi.",
        2: "Memeriksa tanda vital dan auskultasi jantung paru secara tepat.",
        3: "Sempurna: Melakukan pemeriksaan tanda vital, JVP, auskultasi jantung paru lengkap dan aseptik.",
      },
    },
    {
      id: "r4",
      question: "Penetapan Kunci Diagnosis Kerja & Terapi Awal (MONA/Fibrinolisis)",
      competency: "Diagnosis & DDx",
      weight: 4,
      max_points: 3,
      answer_key: "Diagnosis: STEMI Anteroseptal Akut. Terapi Awal: Oksigenasi jika SpO2<90%, Aspirin 160-320 mg kunyah, Clopidogrel 300-600 mg loading, ISDN 5 mg SL, rujuk PCI segera.",
      descriptors: {
        0: "Diagnosis keliru dan tidak memberikan tatalaksana awal.",
        1: "Diagnosis benar namun tatalaksana aspirin/clopidogrel tidak tepat dosis.",
        2: "Diagnosis benar dan meresepkan DAPT loading dose dengan tepat.",
        3: "Sempurna: Diagnosis tepat (STEMI Anterior), tatalaksana MONA/DAPT lengkap, dan merencanakan reperfusi segera.",
      },
    },
  ],
};

export default function StageQuestionPage() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [stage, setStage] = useState(DEFAULT_EMPTY_STAGE);
  const [doctorList, setDoctorList] = useState(DOCTOR_EXAMINER_LIST);

  const [caseTitle, setCaseTitle] = useState("");
  const [systemOrgan, setSystemOrgan] = useState("Kardiovaskular");
  const [competencyLevel, setCompetencyLevel] = useState("4A (Tuntas Mandiri)");
  const [durationMinutes, setDurationMinutes] = useState(12);
  const [assignedExaminer, setAssignedExaminer] = useState("");
  const [scenario, setScenario] = useState("");
  const [participantInstruction, setParticipantInstruction] = useState("");
  const [examinerInstruction, setExaminerInstruction] = useState("");
  const [auxAnswerKey, setAuxAnswerKey] = useState("");
  const [auxFiles, setAuxFiles] = useState([]);
  const [wdxKey, setWdxKey] = useState("");
  const [ddxKeys, setDdxKeys] = useState(["", ""]);
  const [recipeKey, setRecipeKey] = useState("");
  const [rubricItems, setRubricItems] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadStageConfig();
  }, [stageId]);

  async function loadStageConfig() {
    setLoading(true);
    try {
      const realDoctors = await fetchDoctorExaminers();
      if (realDoctors && realDoctors.length > 0) setDoctorList(realDoctors);
    } catch (err) {
      console.warn("Using fallback static doctor list:", err);
    }
    let data = await getStageById(stageId);
    if (!data) data = { ...DEFAULT_EMPTY_STAGE, id: stageId || "stg-101" };
    setStage(data);
    setCaseTitle(data.case_title || data.title || "");
    setSystemOrgan(data.system_organ || "Kardiovaskular");
    setCompetencyLevel(data.competency_level || "4A (Tuntas Mandiri)");
    setDurationMinutes(data.duration_minutes || 12);
    setAssignedExaminer(data.assigned_examiner || "");
    setScenario(data.scenario || "");
    setParticipantInstruction(data.participant_instruction || data.participant_instructions || "");
    setExaminerInstruction(data.examiner_instruction || data.examiner_instructions || "");
    setAuxAnswerKey(data.auxiliary_answer_key || "");
    setAuxFiles(data.auxiliary_files || []);
    let parsedWdx = "";
    let parsedDdxArr = [];
    if (data.gold_standard_keys) {
      parsedWdx = data.gold_standard_keys.wdx || "";
      if (Array.isArray(data.gold_standard_keys.ddx)) parsedDdxArr = [...data.gold_standard_keys.ddx];
      else if (typeof data.gold_standard_keys.ddx === "string") parsedDdxArr = [data.gold_standard_keys.ddx];
    } else {
      parsedWdx = data.answer_key_diagnosis || "";
      parsedDdxArr = data.answer_key_ddx ? [data.answer_key_ddx] : [];
    }
    while (parsedDdxArr.length < 2) parsedDdxArr.push("");
    setWdxKey(parsedWdx);
    setDdxKeys(parsedDdxArr);
    setRecipeKey(data.answer_key_prescription || data.gold_standard_keys?.recipe || "");
    setRubricItems(data.rubric_items || []);
    setLoading(false);
  }

  function addAuxFile() {
    setAuxFiles([...auxFiles, { id: `ax-${Date.now()}`, name: "", category: "Radiologi", matched_key: true, file_url: "", report_text: "" }]);
  }
  function removeAuxFile(idx) {
    const updated = [...auxFiles];
    updated.splice(idx, 1);
    setAuxFiles(updated);
  }
  function updateAuxFile(idx, field, value) {
    const updated = [...auxFiles];
    updated[idx][field] = value;
    setAuxFiles(updated);
  }
  function addDdxKey() { setDdxKeys([...ddxKeys, ""]); }
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
  function addRubricItem() {
    setRubricItems([...rubricItems, { id: `r-${Date.now()}`, question: "Item Baru", competency: "Anamnesis", weight: 1, max_points: 3, answer_key: "", descriptors: { 0: "", 1: "", 2: "", 3: "" } }]);
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
    updated[itemIdx].descriptors = { ...updated[itemIdx].descriptors, [level]: value };
    setRubricItems(updated);
  }
  async function handleSaveAll() {
    const payload = { case_title: caseTitle, system_organ: systemOrgan, competency_level: competencyLevel, assigned_examiner: assignedExaminer, scenario, participant_instruction: participantInstruction, examiner_instruction: examinerInstruction, duration_minutes: Number(durationMinutes), auxiliary_answer_key: auxAnswerKey, auxiliary_files: auxFiles, gold_standard_keys: { wdx: wdxKey, ddx: ddxKeys, recipe: recipeKey }, rubric_items: rubricItems };
    await updateStageQuestion(stageId, payload);
    setShowSuccessModal(true);
  }

  if (loading) return <AdminLayout><div className="flex h-96 items-center justify-center text-xs text-slate-500">Memuat...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button onClick={() => navigate(`/admin/sessions/${stage.session_id || "session-osce-001"}`)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition cursor-pointer">
          <ArrowLeft size={16} /> Kembali ke Detail Sesi OSCE
        </button>
        <button onClick={handleSaveAll} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition cursor-pointer">
          <Save size={16} /> Simpan Seluruh Soal & Rubrik
        </button>
      </div>

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
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition border-b-2 cursor-pointer ${isActive ? "border-blue-600 text-blue-600 bg-white rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-900"}`}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "info" && (
        <StaseGeneralInfoForm
          caseTitle={caseTitle} setCaseTitle={setCaseTitle} systemOrgan={systemOrgan} setSystemOrgan={setSystemOrgan} durationMinutes={durationMinutes} setDurationMinutes={setDurationMinutes} assignedExaminer={assignedExaminer} setAssignedExaminer={setAssignedExaminer} doctorList={doctorList} scenario={scenario} setScenario={setScenario} participantInstruction={participantInstruction} setParticipantInstruction={setParticipantInstruction} examinerInstruction={examinerInstruction} setExaminerInstruction={setExaminerInstruction}
        />
      )}
      {activeTab === "penunjang" && (
        <StaseAuxiliaryBuilder
          auxAnswerKey={auxAnswerKey} setAuxAnswerKey={setAuxAnswerKey} auxFiles={auxFiles} addAuxFile={addAuxFile} removeAuxFile={removeAuxFile} updateAuxFile={updateAuxFile}
        />
      )}
      {activeTab === "diagnosis" && (
        <StaseDiagnosisRecipeBuilder
          wdxKey={wdxKey} setWdxKey={setWdxKey} ddxKeys={ddxKeys} addDdxKey={addDdxKey} removeDdxKey={removeDdxKey} updateDdxKey={updateDdxKey} recipeKey={recipeKey} setRecipeKey={setRecipeKey}
        />
      )}
      {activeTab === "rubric" && (
        <StaseRubricBuilder
          rubricItems={rubricItems} addRubricItem={addRubricItem} removeRubricItem={removeRubricItem} updateRubricItem={updateRubricItem} updateDescriptor={updateDescriptor}
        />
      )}

      {/* Floating Bottom Save Action */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <span className="text-xs font-semibold text-slate-500">
          Pastikan seluruh skenario, berkas penunjang, dan rubrik 0-3 telah terisi sebelum menyimpan.
        </span>
        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
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