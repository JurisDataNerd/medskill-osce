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
  id: "stg-new",
  session_id: null,
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
    wdx: "",
    ddx: ["", ""],
    recipe: "",
  },
  rubric_items: [],
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