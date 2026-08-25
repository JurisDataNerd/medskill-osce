import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  BookOpen,
  FileText,
  Award,
  Layers,
  Plus,
  Trash2,
  Info,
  ChevronRight,
  Stethoscope,
  FlaskConical,
  Activity,
  HelpCircle,
  RotateCw,
} from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import ConfirmModal from "@/components/ConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import { getCaseById, createCase, updateCase } from "@/services/case.service";
import { supabase } from "@/lib/supabaseClient";
import CaseScenarioTab from "@/features/admin/components/case/CaseScenarioTab";
import CaseAnswerKeyTab from "@/features/admin/components/case/CaseAnswerKeyTab";
import CaseRubricTab from "@/features/admin/components/case/CaseRubricTab";
import CaseAuxiliaryTab from "@/features/admin/components/case/CaseAuxiliaryTab";
import { formatDiagnosisText, parseDiagnosisText } from "@/utils/diagnosisParser";

export default function CreateCasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Active Tab: 1 (Skenario), 2 (Kunci Jawaban), 3 (Rubrik Penilaian), 4 (Penunjang)
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Success Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState("Berhasil Disimpan");
  const [successModalMessage, setSuccessModalMessage] = useState("");

  // Confirmation & Alert Modals State
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [deleteRubricModalOpen, setDeleteRubricModalOpen] = useState(false);
  const [targetRubricIndex, setTargetRubricIndex] = useState(null);

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // Tab 1: Basic Info & Scenario
  const [title, setTitle] = useState("");
  const [systemOrgan, setSystemOrgan] = useState("Kardiovaskular");
  const [skdiLevel, setSkdiLevel] = useState("4A (Tuntas Mandiri)");
  const [scenario, setScenario] = useState("");
  const [participantInstructions, setParticipantInstructions] = useState("");
  const [examinerInstructions, setExaminerInstructions] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(12);

  // Tab 2: Gold Standard Answer Keys
  const [wdxKey, setWdxKey] = useState("");
  const [ddxKeys, setDdxKeys] = useState(["", ""]);
  const [recipeKey, setRecipeKey] = useState("");
  const [answerKeyDiagnosis, setAnswerKeyDiagnosis] = useState("");
  const [answerKeyPrescription, setAnswerKeyPrescription] = useState("");

  // Tab 3: SKDI Rubric Items (Dynamic list with 4-level descriptors)
  const [rubricItems, setRubricItems] = useState([
    {
      id: "rubric-1",
      question_number: 1,
      question: "Anamnesis terarah mengenai riwayat keluhan utama & faktor risiko",
      answer_key: "Menggali onset, PQRST, gejala vegetatif, dan riwayat komorbiditas pasien",
      weight: 1.0,
      max_points: 3,
      competency_area: "ANAMNESIS",
      descriptors: {
        score_0: "Tidak melakukan anamnesis sama sekali",
        score_1: "Anamnesis sangat minimal (kurang dari 2 poin PQRST)",
        score_2: "Anamnesis cukup lengkap tapi ada poin risiko yang terlewat",
        score_3: "Anamnesis sangat sistematis, lengkap, dan terarah (PQRST + Faktor Risiko)",
      },
    },
  ]);

  // Tab 4: Auxiliary Exam Configs
  const [auxAnswerKey, setAuxAnswerKey] = useState("");
  const [auxiliaryConfigs, setAuxiliaryConfigs] = useState([]);

  function addDdxKey() {
    setDdxKeys((prev) => [...prev, ""]);
  }

  function removeDdxKey(idx) {
    setDdxKeys((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateDdxKey(idx, val) {
    setDdxKeys((prev) => prev.map((item, i) => (i === idx ? val : item)));
  }

  // Draft Auto-save & Exit Confirmation State
  const [showRestoreDraftBanner, setShowRestoreDraftBanner] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check for saved draft on mount
  useEffect(() => {
    if (!isEdit) {
      try {
        const savedDraft = localStorage.getItem("medskill_create_case_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && parsed.title && parsed.title.trim() !== "") {
            setShowRestoreDraftBanner(true);
          }
        }
      } catch (err) {
        console.error("Error reading draft from localStorage:", err);
      }
    }
  }, [isEdit]);

  const draftKey = `medskill_create_case_draft_${id || "new"}`;

  // Auto-save form state to localStorage continuously
  useEffect(() => {
    if (isSubmitted) return;

    const draftData = {
      title,
      systemOrgan,
      skdiLevel,
      scenario,
      participantInstructions,
      examinerInstructions,
      wdxKey,
      ddxKeys,
      recipeKey,
      answerKeyDiagnosis,
      answerKeyPrescription,
      auxAnswerKey,
      rubricItems,
      auxiliaryConfigs,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    } catch (err) {
      console.error("Error saving case draft to localStorage:", err);
    }
  }, [
    draftKey,
    isSubmitted,
    title,
    systemOrgan,
    skdiLevel,
    scenario,
    participantInstructions,
    examinerInstructions,
    wdxKey,
    ddxKeys,
    recipeKey,
    answerKeyDiagnosis,
    answerKeyPrescription,
    auxAnswerKey,
    rubricItems,
    auxiliaryConfigs,
  ]);

  // Prevent accidental tab close or page refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmitted && !isEdit && title.trim() !== "") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitted, isEdit, title]);

  function handleRestoreDraft() {
    try {
      const savedDraft = localStorage.getItem("medskill_create_case_draft");
      if (!savedDraft) return;
      const data = JSON.parse(savedDraft);
      if (data.title !== undefined) setTitle(data.title);
      if (data.systemOrgan) setSystemOrgan(data.systemOrgan);
      if (data.skdiLevel) setSkdiLevel(data.skdiLevel);
      if (data.scenario !== undefined) setScenario(data.scenario);
      if (data.participantInstructions !== undefined) setParticipantInstructions(data.participantInstructions);
      if (data.examinerInstructions !== undefined) setExaminerInstructions(data.examinerInstructions);
      if (data.wdxKey !== undefined) setWdxKey(data.wdxKey);
      if (data.ddxKeys && Array.isArray(data.ddxKeys)) setDdxKeys(data.ddxKeys);
      if (data.recipeKey !== undefined) setRecipeKey(data.recipeKey);
      if (data.answerKeyDiagnosis !== undefined) setAnswerKeyDiagnosis(data.answerKeyDiagnosis);
      if (data.answerKeyPrescription !== undefined) setAnswerKeyPrescription(data.answerKeyPrescription);
      if (data.auxAnswerKey !== undefined) setAuxAnswerKey(data.auxAnswerKey);
      if (data.rubricItems && data.rubricItems.length > 0) setRubricItems(data.rubricItems);
      if (data.auxiliaryConfigs) setAuxiliaryConfigs(data.auxiliaryConfigs);

      setShowRestoreDraftBanner(false);
      setAlertModal({
        isOpen: true,
        title: "Draf Kasus Berhasil Dipulihkan!",
        message: "Data formulir kasus medis berhasil dipulihkan dari memori lokal browser.",
      });
    } catch (err) {
      console.error("Error restoring case draft:", err);
    }
  }

  function handleDiscardDraft() {
    localStorage.removeItem("medskill_create_case_draft");
    setShowRestoreDraftBanner(false);
  }

  function handleNavigateAway(targetPath) {
    if (!isSubmitted && !isEdit && title.trim() !== "") {
      setAlertModal({
        isOpen: true,
        title: "Tinggalkan Halaman Buat Kasus?",
        message: "Perubahan formulir kasus medis Anda yang belum disimpan akan hilang (namun draf otomatis tersimpan di memori browser Anda).",
      });
    } else {
      navigate(targetPath);
    }
  }

  // Load existing case if editing
  useEffect(() => {
    if (!isEdit || !id) return;

    async function loadExistingCase() {
      try {
        setLoading(true);
        const data = await getCaseById(id);
        if (data) {
          setTitle(data.case_title || data.title || "");
          setSystemOrgan(data.system_organ || "Kardiovaskular");
          setSkdiLevel(data.skdi_level || "4A (Tuntas Mandiri)");
          setDurationMinutes(data.duration_minutes || 12);
          setScenario(data.scenario || "");
          setParticipantInstructions(data.participant_instructions || "");
          setExaminerInstructions(data.examiner_instructions || "");
          setAuxAnswerKey(data.auxiliary_answer_key || "");

          const { wdx: parsedWdx, ddxList: parsedDdxArr } = parseDiagnosisText(data.answer_key_diagnosis || data.answer_key_wdx || "");

          const parsedRecipe = data.answer_key_prescription || data.gold_standard_keys?.recipe || "";
          setWdxKey(parsedWdx);
          setDdxKeys(parsedDdxArr);
          setRecipeKey(parsedRecipe);
          setAnswerKeyDiagnosis(parsedWdx);
          setAnswerKeyPrescription(parsedRecipe);

          const fetchedRubrics = data.checklist_items || data.question_bank_rubric_items || [];
          if (fetchedRubrics.length > 0) {
            setRubricItems(
              fetchedRubrics.map((item, idx) => ({
                id: item.id || `rubric-${idx}`,
                question_number: item.question_number || idx + 1,
                question: item.question || item.title || item.name || "",
                answer_key: item.answer_key || item.description || "",
                weight: Number(item.weight) || 1.0,
                max_points: Number(item.max_points) || 3,
                competency_area: item.competency_area || "ANAMNESIS",
                descriptors: item.descriptors || {
                  score_0: item.description_score_0 || "",
                  score_1: item.description_score_1 || "",
                  score_2: item.description_score_2 || "",
                  score_3: item.description_score_3 || "",
                },
              }))
            );
          }

          const fetchedAux = data.auxiliary_exam_configs || data.question_bank_auxiliary_configs || [];
          if (fetchedAux.length > 0) {
            setAuxiliaryConfigs(
              fetchedAux.map((cfg, idx) => ({
                itemId: cfg.item_id || cfg.itemId || `aux-${idx}`,
                name: cfg.name || "Berkas Penunjang",
                category: cfg.category || "PEMERIKSAAN",
                imageUrl: cfg.image_storage_path || cfg.imageUrl || "",
                reportText: cfg.report_text || cfg.reportText || "",
                matched_key: cfg.matched_key !== false,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Error loading case for edit:", err);
        toast.error("Gagal memuat data kasus medis untuk di-edit.");
      } finally {
        setLoading(false);
      }
    }

    loadExistingCase();
  }, [id, isEdit]);

  // Handlers for Rubric Items
  function handleAddRubricItem() {
    const newId = `rubric-${Date.now()}`;
    setRubricItems((prev) => [
      ...prev,
      {
        id: newId,
        question_number: prev.length + 1,
        question: "",
        answer_key: "",
        weight: 1.0,
        max_points: 3,
        competency_area: "ANAMNESIS",
        descriptors: { score_0: "", score_1: "", score_2: "", score_3: "" },
      },
    ]);
  }

  function requestRemoveRubricItem(index) {
    if (rubricItems.length <= 1) {
      setAlertModal({
        isOpen: true,
        title: "Peringatan Rubrik",
        message: "Minimal terdapat 1 Item Rubrik Penilaian!",
      });
      return;
    }
    setTargetRubricIndex(index);
    setDeleteRubricModalOpen(true);
  }

  function handleConfirmRemoveRubricItem() {
    if (targetRubricIndex === null) return;
    setRubricItems((prev) =>
      prev
        .filter((_, idx) => idx !== targetRubricIndex)
        .map((item, idx) => ({ ...item, question_number: idx + 1 }))
    );
    setDeleteRubricModalOpen(false);
    setTargetRubricIndex(null);
  }

  function handleUpdateRubricField(index, field, value) {
    setRubricItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  }

  function handleUpdateRubricDescriptor(index, scoreKey, text) {
    setRubricItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            descriptors: {
              ...item.descriptors,
              [scoreKey]: text,
            },
          };
        }
        return item;
      })
    );
  }

  // Save Case to Supabase osce schema
  async function handleSaveCase() {
    if (!title.trim()) {
      setAlertModal({
        isOpen: true,
        title: "Judul Kasus Diperlukan",
        message: "Harap isi Judul Kasus Medis terlebih dahulu!",
      });
      return;
    }

    try {
      setSaving(true);

      const finalWdx = (wdxKey || answerKeyDiagnosis || "").trim();
      const finalRecipe = (recipeKey || answerKeyPrescription || "").trim();
      const finalDdxArr = Array.isArray(ddxKeys) ? ddxKeys.map((s) => (s || "").trim()).filter(Boolean) : [];

      const combinedDiag = formatDiagnosisText(finalWdx, finalDdxArr);

      const casePayload = {
        title,
        case_title: title,
        system_organ: systemOrgan,
        skdi_level: skdiLevel,
        scenario,
        participant_instructions: participantInstructions,
        examiner_instructions: examinerInstructions,
        answer_key_diagnosis: combinedDiag || finalWdx,
        answer_key_prescription: finalRecipe,
        answer_key_wdx: finalWdx,
        answer_key_ddx: finalDdxArr.join(", "),
        auxiliary_answer_key: auxAnswerKey || "",
        gold_standard_keys: {
          wdx: finalWdx,
          ddx: finalDdxArr,
          recipe: finalRecipe,
        },
      };

      let savedCase;
      if (isEdit) {
        savedCase = await updateCase(id, casePayload);
      } else {
        savedCase = await createCase(casePayload);
      }

      const caseId = isEdit ? id : savedCase.id;

      // Save Rubric Items to osce.question_bank_rubric_items
      await supabase.schema("osce").from("question_bank_rubric_items").delete().eq("question_bank_id", caseId);

      const formattedRubrics = rubricItems.map((item, idx) => ({
        question_bank_id: caseId,
        question_number: idx + 1,
        question: item.question,
        answer_key: item.answer_key,
        max_points: Number(item.max_points) || 3,
        weight: Number(item.weight) || 1.0,
        competency_area: item.competency_area || "ANAMNESIS",
        descriptors: item.descriptors || {},
        sort_order: idx,
      }));

      if (formattedRubrics.length > 0) {
        await supabase.schema("osce").from("question_bank_rubric_items").insert(formattedRubrics);
      }

      // Save Auxiliary Configs to osce.question_bank_auxiliary_configs
      await supabase.schema("osce").from("question_bank_auxiliary_configs").delete().eq("question_bank_id", caseId);

      const formattedAux = (auxiliaryConfigs || []).map((cfg, idx) => ({
        question_bank_id: caseId,
        item_id: cfg.itemId || cfg.item_id || cfg.id || `aux-${idx}`,
        name: cfg.name || cfg.title || "Berkas Penunjang",
        category: cfg.category || "LAIN-LAIN",
        image_storage_path: cfg.imageUrl || cfg.image_storage_path || cfg.file_url || null,
        report_text: cfg.reportText || cfg.report_text || null,
        matched_key: cfg.matched_key !== false,
        sort_order: idx,
      }));

      if (formattedAux.length > 0) {
        const { error: auxErr } = await supabase.schema("osce").from("question_bank_auxiliary_configs").insert(formattedAux);
        if (auxErr) {
          console.error("Error inserting auxiliary configs to osce.question_bank_auxiliary_configs:", auxErr);
          throw auxErr;
        }
      }

      localStorage.removeItem(draftKey);
      localStorage.removeItem("medskill_create_case_draft");
      setIsSubmitted(true);
      toast.success(`Kasus Medis "${title}" berhasil disimpan!`);

      setTimeout(() => {
        navigate("/admin/cases");
      }, 1000);
    } catch (err) {
      console.error("Error saving question bank case:", err);
      const errMsg = err?.message || err?.details || JSON.stringify(err);
      toast.error(`Gagal menyimpan kasus: ${errMsg}`);
      
      setAlertModal({
        isOpen: true,
        title: "Gagal Menyimpan Kasus Medis",
        message: `Terjadi kesalahan: ${errMsg}.\n\nFormulir Anda tidak akan hilang dan Anda tetap berada di halaman ini.`,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center text-slate-500">Memuat data kasus medis...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Auto-saved Draft Restore Notification Banner */}
      {showRestoreDraftBanner && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <RotateCw size={20} className="animate-spin" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Draf Kasus Medis Ditemukan!
              </h4>
              <p className="text-xs font-semibold text-amber-900 mt-0.5">
                Draf kasus medis tersimpan otomatis di memori browser dari pembuatan sebelumnya. Apakah Anda ingin memulihkannya?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition"
            >
              <RotateCw size={14} />
              Pulihkan Draf Kasus
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
            >
              Buang Draf
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavigateAway("/admin/cases")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {isEdit ? "Edit Kasus Medis" : "Buat Kasus Medis"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola skenario klinis, rubrik penilaian, dan berkas penunjang.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/cases")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => setSaveModalOpen(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 size={16} />
            {saving ? "Menyimpan..." : "Simpan Kasus"}
          </button>
        </div>
      </div>

      {/* Tab Navigation Header */}
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab(1)}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === 1
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen size={16} />
          1. Informasi & Skenario
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === 2
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award size={16} />
          2. Kunci Jawaban
        </button>

        <button
          onClick={() => setActiveTab(3)}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === 3
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers size={16} />
          3. Rubrik Penilaian ({rubricItems.length})
        </button>

        <button
          onClick={() => setActiveTab(4)}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === 4
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FlaskConical size={16} />
          4. Berkas Penunjang ({auxiliaryConfigs.length})
        </button>
      </div>

      {/* Tab 1: Basic Info & Scenario */}
      {activeTab === 1 && (
        <CaseScenarioTab
          title={title}
          setTitle={setTitle}
          systemOrgan={systemOrgan}
          setSystemOrgan={setSystemOrgan}
          skdiLevel={skdiLevel}
          setSkdiLevel={setSkdiLevel}
          scenario={scenario}
          setScenario={setScenario}
          participantInstructions={participantInstructions}
          setParticipantInstructions={setParticipantInstructions}
          examinerInstructions={examinerInstructions}
          setExaminerInstructions={setExaminerInstructions}
        />
      )}

      {/* Tab 2: Gold Standard Answer Keys */}
      {activeTab === 2 && (
        <CaseAnswerKeyTab
          wdxKey={wdxKey}
          setWdxKey={setWdxKey}
          ddxKeys={ddxKeys}
          addDdxKey={addDdxKey}
          removeDdxKey={removeDdxKey}
          updateDdxKey={updateDdxKey}
          recipeKey={recipeKey}
          setRecipeKey={setRecipeKey}
          answerKeyDiagnosis={answerKeyDiagnosis}
          setAnswerKeyDiagnosis={setAnswerKeyDiagnosis}
          answerKeyPrescription={answerKeyPrescription}
          setAnswerKeyPrescription={setAnswerKeyPrescription}
        />
      )}

      {/* Tab 3: SKDI Rubric Items */}
      {activeTab === 3 && (
        <CaseRubricTab
          rubricItems={rubricItems}
          handleAddRubricItem={handleAddRubricItem}
          requestRemoveRubricItem={requestRemoveRubricItem}
          handleUpdateRubricField={handleUpdateRubricField}
          handleUpdateRubricDescriptor={handleUpdateRubricDescriptor}
        />
      )}

      {/* Tab 4: Auxiliary Exam Configs */}
      {activeTab === 4 && (
        <CaseAuxiliaryTab
          auxAnswerKey={auxAnswerKey}
          setAuxAnswerKey={setAuxAnswerKey}
          auxiliaryConfigs={auxiliaryConfigs}
          setAuxiliaryConfigs={setAuxiliaryConfigs}
        />
      )}

      {/* Confirmation Modal: Simpan Kasus Medis */}
      <ConfirmModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onConfirm={() => {
          setSaveModalOpen(false);
          handleSaveCase();
        }}
        title="Simpan Kasus Medis"
        message={`Apakah Anda yakin ingin menyimpan seluruh perubahan kasus medis "${title || "Kasus Baru"}"?`}
        confirmText="Simpan Kasus"
        cancelText="Batal"
        variant="primary"
        loading={saving}
      />

      {/* Confirmation Modal: Hapus Indikator Rubrik */}
      <ConfirmModal
        isOpen={deleteRubricModalOpen}
        onClose={() => {
          setDeleteRubricModalOpen(false);
          setTargetRubricIndex(null);
        }}
        onConfirm={handleConfirmRemoveRubricItem}
        title="Hapus Indikator Rubrik Penilaian"
        message="Apakah Anda yakin ingin menghapus indikator rubrik penilaian ini dari paket soal?"
        confirmText="Hapus Indikator"
        cancelText="Batal"
        variant="danger"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/admin/cases");
        }}
        title={successModalTitle}
        message={successModalMessage}
        actionText="Kembali ke Bank Soal"
        onAction={() => navigate("/admin/cases")}
      />

      {/* Alert Modal */}
      <ConfirmModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        confirmText="Mengerti"
        variant="warning"
        isAlert={true}
      />
    </AdminLayout>
  );
}
