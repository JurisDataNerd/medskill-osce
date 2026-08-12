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
import AdminAuxiliaryExamBuilder from "@/features/admin/components/AdminAuxiliaryExamBuilder";
import ConfirmModal from "@/components/ConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import { getCaseById, createCase, updateCase } from "@/services/case.service";
import { supabase } from "@/lib/supabaseClient";

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

  // Tab 2: Gold Standard Answer Keys
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
  const [auxiliaryConfigs, setAuxiliaryConfigs] = useState([]);

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

  // Auto-save form state to localStorage
  useEffect(() => {
    if (isEdit || isSubmitted) return;
    if (!title || !title.trim()) return;

    const draftData = {
      title,
      systemOrgan,
      skdiLevel,
      scenario,
      participantInstructions,
      examinerInstructions,
      answerKeyDiagnosis,
      answerKeyPrescription,
      rubricItems,
      auxiliaryConfigs,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("medskill_create_case_draft", JSON.stringify(draftData));
    } catch (err) {
      console.error("Error saving case draft to localStorage:", err);
    }
  }, [
    isEdit,
    isSubmitted,
    title,
    systemOrgan,
    skdiLevel,
    scenario,
    participantInstructions,
    examinerInstructions,
    answerKeyDiagnosis,
    answerKeyPrescription,
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
      if (data.answerKeyDiagnosis !== undefined) setAnswerKeyDiagnosis(data.answerKeyDiagnosis);
      if (data.answerKeyPrescription !== undefined) setAnswerKeyPrescription(data.answerKeyPrescription);
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
    if (!isEdit) return;

    async function loadExistingCase() {
      try {
        setLoading(true);
        const data = await getCaseById(id);
        if (data) {
          setTitle(data.case_title || data.title || "");
          setSystemOrgan(data.system_organ || "Kardiovaskular");
          setSkdiLevel(data.skdi_level || "4A (Tuntas Mandiri)");
          setScenario(data.scenario || "");
          setParticipantInstructions(data.participant_instructions || "");
          setExaminerInstructions(data.examiner_instructions || "");
          setAnswerKeyDiagnosis(data.answer_key_diagnosis || "");
          setAnswerKeyPrescription(data.answer_key_prescription || "");

          if (data.checklist_items && data.checklist_items.length > 0) {
            setRubricItems(
              data.checklist_items.map((item, idx) => ({
                id: item.id || `rubric-${idx}`,
                question_number: idx + 1,
                question: item.question || "",
                answer_key: item.answer_key || "",
                weight: Number(item.weight) || 1.0,
                max_points: Number(item.max_points) || 3,
                competency_area: item.competency_area || "ANAMNESIS",
                descriptors: item.descriptors || {
                  score_0: "",
                  score_1: "",
                  score_2: "",
                  score_3: "",
                },
              }))
            );
          }

          if (data.auxiliary_exam_configs) {
            setAuxiliaryConfigs(
              data.auxiliary_exam_configs.map((cfg) => ({
                itemId: cfg.item_id || cfg.itemId || `aux-${Math.random()}`,
                name: cfg.name || "Berkas Penunjang",
                category: cfg.category || "PEMERIKSAAN",
                imageUrl: cfg.image_storage_path || cfg.imageUrl || "",
                reportText: cfg.report_text || cfg.reportText || "",
              }))
            );
          }
        }
      } catch (err) {
        console.error("Error loading case for edit:", err);
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

      const casePayload = {
        title,
        case_title: title,
        system_organ: systemOrgan,
        skdi_level: skdiLevel,
        scenario,
        participant_instructions: participantInstructions,
        examiner_instructions: examinerInstructions,
        answer_key_diagnosis: answerKeyDiagnosis,
        answer_key_prescription: answerKeyPrescription,
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

      const formattedAux = auxiliaryConfigs.map((cfg, idx) => ({
        question_bank_id: caseId,
        item_id: cfg.itemId || cfg.item_id || `aux-${idx}`,
        name: cfg.name || "Berkas Penunjang",
        category: cfg.category || "LAIN-LAIN",
        image_storage_path: cfg.imageUrl || cfg.image_storage_path || null,
        report_text: cfg.reportText || cfg.report_text || null,
        sort_order: idx,
      }));

      if (formattedAux.length > 0) {
        await supabase.schema("osce").from("question_bank_auxiliary_configs").insert(formattedAux);
      }

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
              {isEdit ? "Edit Kasus Medis (Bank Soal)" : "Buat Kasus Medis Baru (Bank Soal)"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Repository soal medis terstandarisasi untuk 1-click auto-fill stase sirkuit OSCE.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/cases")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => setSaveModalOpen(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition disabled:opacity-50"
          >
            <CheckCircle2 size={16} />
            {saving ? "Menyimpan..." : "Simpan Kasus Medis ke Supabase"}
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
          2. Kunci Jawaban Baku (Gold Standard)
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
          3. Rubrik Penilaian SKDI ({rubricItems.length})
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
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Judul Kasus Medis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Nyeri Dada Khas Infark Miokard Akut (STEMI Anteroseptal)"
                className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Sistem Organ</label>
                <select
                  value={systemOrgan}
                  onChange={(e) => setSystemOrgan(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="Kardiovaskular">Kardiovaskular</option>
                  <option value="Respirasi">Respirasi</option>
                  <option value="Neurologi">Neurologi</option>
                  <option value="Digestif">Digestif</option>
                  <option value="Muskuloskeletal">Muskuloskeletal</option>
                  <option value="Endokrin">Endokrin</option>
                  <option value="Urologi">Urologi</option>
                  <option value="THT-KL">THT-KL</option>
                  <option value="Pediatri">Pediatri</option>
                  <option value="Bedah Umum">Bedah Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Level SKDI</label>
                <select
                  value={skdiLevel}
                  onChange={(e) => setSkdiLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="4A (Tuntas Mandiri)">4A (Tuntas Mandiri)</option>
                  <option value="3B (Gawat Darurat)">3B (Gawat Darurat)</option>
                  <option value="3A (Non Gawat Darurat)">3A (Non Gawat Darurat)</option>
                  <option value="2">Level 2</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Skenario Klinis Utama</label>
            <textarea
              rows={4}
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Deskripsi skenario klinis lengkap yang ditampilkan di pintu stase/layar peserta..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Instruksi Peserta Ujian</label>
              <textarea
                rows={4}
                value={participantInstructions}
                onChange={(e) => setParticipantInstructions(e.target.value)}
                placeholder="1. Lakukan anamnesis terarah...&#10;2. Lakukan pemeriksaan fisik...&#10;3. Tentukan diagnosis & resep..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Instruksi Dokter Penguji</label>
              <textarea
                rows={4}
                value={examinerInstructions}
                onChange={(e) => setExaminerInstructions(e.target.value)}
                placeholder="Panduan khusus untuk dokter penguji spesialis saat menilai di stase..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Gold Standard Answer Keys */}
      {activeTab === 2 && (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3">
            <Award size={20} className="shrink-0 text-blue-600 mt-0.5" />
            <div>
              <span className="font-bold">Gold Standard Answer Key:</span> Kunci jawaban baku ini akan disandingkan secara *side-by-side* di layar dokter penguji berdampingan dengan ketikan realtime peserta.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Kunci Jawaban Baku: Diagnosis Kerja (WDx) & Diagnosis Banding (DDx)
            </label>
            <textarea
              rows={4}
              value={answerKeyDiagnosis}
              onChange={(e) => setAnswerKeyDiagnosis(e.target.value)}
              placeholder="Contoh: WDx: STEMI Anteroseptal (I21.0). DDx: Angina Pektoris Tidak Stabil (UAP), Diseksi Aorta, Perikarditis Akut."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Kunci Jawaban Baku: Resep Obat & Tatalaksana Farmakoterapi
            </label>
            <textarea
              rows={5}
              value={answerKeyPrescription}
              onChange={(e) => setAnswerKeyPrescription(e.target.value)}
              placeholder="Contoh:&#10;R/ Aspirin tab 80mg No. IV S 1 dd tab IV (chewed)&#10;R/ Clopidogrel tab 75mg No. IV S 1 dd tab IV&#10;R/ ISDN tab 5mg No. III S 1 dd tab I sublingual"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-800 bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Tab 3: SKDI Rubric Items */}
      {activeTab === 3 && (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Checklist Rubrik Penilaian SKDI</h3>
              <p className="text-xs text-slate-500">Konfigurasi indikator penilaian dengan skor 0-3 dan deskriptor kinerja 4-level.</p>
            </div>
            <button
              onClick={handleAddRubricItem}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Plus size={15} />
              Tambah Indikator Rubrik
            </button>
          </div>

          <div className="space-y-6">
            {rubricItems.map((item, idx) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">Indikator #{idx + 1}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => requestRemoveRubricItem(idx)}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Indikator Penilaian</label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => handleUpdateRubricField(idx, "question", e.target.value)}
                      placeholder="Misal: Anamnesis terarah PQRST nyeri dada"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Area Kompetensi SKDI</label>
                    <select
                      value={item.competency_area || "ANAMNESIS"}
                      onChange={(e) => handleUpdateRubricField(idx, "competency_area", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
                    >
                      <option value="ANAMNESIS">ANAMNESIS</option>
                      <option value="PHYSICAL_EXAM">PHYSICAL_EXAM</option>
                      <option value="AUXILIARY_EXAM">AUXILIARY_EXAM</option>
                      <option value="DIAGNOSIS_DDX">DIAGNOSIS_DDX</option>
                      <option value="PHARMACOTHERAPY">PHARMACOTHERAPY</option>
                      <option value="NON_PHARMACOTHERAPY">NON_PHARMACOTHERAPY</option>
                      <option value="COMMUNICATION">COMMUNICATION</option>
                      <option value="PROFESSIONALISM">PROFESSIONALISM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pedoman Penskoran (Level 3 Sempurna)</label>
                  <input
                    type="text"
                    value={item.answer_key}
                    onChange={(e) => handleUpdateRubricField(idx, "answer_key", e.target.value)}
                    placeholder="Pedoman skor maksimal 3..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
                  />
                </div>

                {/* 4-Level Descriptors */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Info size={14} className="text-blue-600" />
                    Deskriptor Kinerja 4-Level (Standar AIPKI)
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <span className="block text-[11px] font-bold text-red-600 mb-1">Skor 0 (Tidak Dilakukan / Salah Total)</span>
                      <input
                        type="text"
                        value={item.descriptors?.score_0 || ""}
                        onChange={(e) => handleUpdateRubricDescriptor(idx, "score_0", e.target.value)}
                        placeholder="Deskripsi skor 0..."
                        className="w-full rounded-lg border border-red-200 p-2 text-xs bg-red-50/30"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-amber-600 mb-1">Skor 1 (Minimal / Kurang Tepat)</span>
                      <input
                        type="text"
                        value={item.descriptors?.score_1 || ""}
                        onChange={(e) => handleUpdateRubricDescriptor(idx, "score_1", e.target.value)}
                        placeholder="Deskripsi skor 1..."
                        className="w-full rounded-lg border border-amber-200 p-2 text-xs bg-amber-50/30"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-blue-600 mb-1">Skor 2 (Cukup / Sebagian Besar Tepat)</span>
                      <input
                        type="text"
                        value={item.descriptors?.score_2 || ""}
                        onChange={(e) => handleUpdateRubricDescriptor(idx, "score_2", e.target.value)}
                        placeholder="Deskripsi skor 2..."
                        className="w-full rounded-lg border border-blue-200 p-2 text-xs bg-blue-50/30"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-emerald-600 mb-1">Skor 3 (Sempurna / Tepat Total)</span>
                      <input
                        type="text"
                        value={item.descriptors?.score_3 || ""}
                        onChange={(e) => handleUpdateRubricDescriptor(idx, "score_3", e.target.value)}
                        placeholder="Deskripsi skor 3..."
                        className="w-full rounded-lg border border-emerald-200 p-2 text-xs bg-emerald-50/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Auxiliary Exam Configs */}
      {activeTab === 4 && (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <AdminAuxiliaryExamBuilder
            configs={auxiliaryConfigs}
            onChangeConfigs={setAuxiliaryConfigs}
          />
        </div>
      )}

      {/* Confirmation Modal: Simpan Kasus Medis */}
      <ConfirmModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onConfirm={() => {
          setSaveModalOpen(false);
          handleSaveCase();
        }}
        title="Konfirmasi Simpan Kasus Medis"
        message={`Apakah Anda yakin ingin menyimpan seluruh perubahan paket soal "${title || "Kasus Baru"}" ke database Supabase?`}
        confirmText="Ya, Simpan ke Supabase"
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
        confirmText="Ya, Hapus Indikator"
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
        actionText="Ke Repository Bank Soal"
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
