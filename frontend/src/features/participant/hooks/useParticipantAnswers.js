import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  saveParticipantStepAnswer,
  fetchParticipantAnswer,
} from "@/services/participantService";
import { AUXILIARY_EXAM_CATALOG } from "@/features/participant/data/auxiliaryExamsCatalog";

export function useParticipantAnswers({
  sessionId,
  currentStationNum,
  currentRound,
  dbStations,
  activeStationInfo,
  viewMode,
}) {
  const [examStep, setExamStep] = useState(1);

  // Candidate Answer Sheet Form State
  const [differentialDiagnosis, setDifferentialDiagnosis] = useState("");
  const [workingDiagnosis, setWorkingDiagnosis] = useState("");
  const [prescriptionText, setPrescriptionText] = useState("");

  // Direct Checkbox Auxiliary Exams State
  const [checkedAuxiliaryIds, setCheckedAuxiliaryIds] = useState([]);

  // Result Modal State for Penunjang
  const [isAuxiliaryResultOpen, setIsAuxiliaryResultOpen] = useState(false);
  const [auxiliaryResults, setAuxiliaryResults] = useState([]);

  // Auxiliary Exams Search & Filter State
  const [auxSearchQuery, setAuxSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [expandedCategories, setExpandedCategories] = useState({
    RADIOLOGI: true,
    HEMATOLOGI: true,
    ENZIM: true,
    "LAIN-LAIN": true,
  });

  const filteredCatalog = useMemo(() => {
    return (AUXILIARY_EXAM_CATALOG || [])
      .map((cat) => {
        if (
          selectedCategoryFilter !== "ALL" &&
          cat.category.toUpperCase() !== selectedCategoryFilter.toUpperCase()
        ) {
          return { ...cat, subcategories: [] };
        }

        if (!auxSearchQuery.trim()) return cat;

        const q = auxSearchQuery.toLowerCase();
        const matchingSub = (cat.subcategories || [])
          .map((sub) => {
            const matchingItems = (sub.items || []).filter(
              (item) =>
                item.name.toLowerCase().includes(q) ||
                item.id.toLowerCase().includes(q) ||
                sub.name.toLowerCase().includes(q) ||
                cat.category.toLowerCase().includes(q)
            );
            return { ...sub, items: matchingItems };
          })
          .filter((sub) => sub.items.length > 0);

        return { ...cat, subcategories: matchingSub };
      })
      .filter((cat) => cat.subcategories.length > 0);
  }, [auxSearchQuery, selectedCategoryFilter]);

  const allCatalogItems = useMemo(() => {
    const items = [];
    (AUXILIARY_EXAM_CATALOG || []).forEach((cat) => {
      (cat.subcategories || []).forEach((sub) => {
        (sub.items || []).forEach((it) => {
          items.push({
            ...it,
            category: cat.category,
          });
        });
      });
    });
    return items;
  }, []);

  // Auto-load candidate answer from Supabase database or localStorage when station or round changes
  useEffect(() => {
    async function loadAnswer() {
      if (!sessionId || !currentStationNum) return;

      const draftKey = `osce_draft_ans_${sessionId}_round_${currentRound}`;
      const localDraftRaw = localStorage.getItem(draftKey);
      let localDraft = null;
      if (localDraftRaw) {
        try {
          localDraft = JSON.parse(localDraftRaw);
        } catch (e) {}
      }

      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id || localStorage.getItem("osce_user_id") || "participant-user";

        const st = dbStations.find((s) => Number(s.station_number) === currentStationNum);
        const stationId = st?.id || `station-${currentStationNum}`;

        const ans = await fetchParticipantAnswer(sessionId, stationId, userId, currentRound);
        if (ans) {
          if (ans.current_step && Number(ans.current_step) >= 1 && Number(ans.current_step) <= 4) {
            setExamStep(Number(ans.current_step));
          }
          setWorkingDiagnosis(localDraft?.workingDiagnosis || ans.working_diagnosis || "");
          setDifferentialDiagnosis(localDraft?.differentialDiagnosis || ans.differential_dx_1 || "");
          setPrescriptionText(localDraft?.prescriptionText || ans.prescription_text || "");
          setCheckedAuxiliaryIds(
            localDraft?.checkedAuxiliaryIds ||
              (Array.isArray(ans.requested_auxiliary_json) ? ans.requested_auxiliary_json : [])
          );
        } else if (localDraft) {
          if (localDraft.examStep) setExamStep(Number(localDraft.examStep));
          setWorkingDiagnosis(localDraft.workingDiagnosis || "");
          setDifferentialDiagnosis(localDraft.differentialDiagnosis || "");
          setPrescriptionText(localDraft.prescriptionText || "");
          setCheckedAuxiliaryIds(localDraft.checkedAuxiliaryIds || []);
        } else {
          setExamStep(1);
          setWorkingDiagnosis("");
          setDifferentialDiagnosis("");
          setPrescriptionText("");
          setCheckedAuxiliaryIds([]);
        }
      } catch (err) {
        console.warn("Could not load candidate answer from DB, falling back to local draft:", err);
        if (localDraft) {
          if (localDraft.examStep) setExamStep(Number(localDraft.examStep));
          setWorkingDiagnosis(localDraft.workingDiagnosis || "");
          setDifferentialDiagnosis(localDraft.differentialDiagnosis || "");
          setPrescriptionText(localDraft.prescriptionText || "");
          setCheckedAuxiliaryIds(localDraft.checkedAuxiliaryIds || []);
        }
      }
    }
    loadAnswer();
  }, [sessionId, currentStationNum, currentRound, dbStations]);

  // Step persistence via localStorage across page reloads
  useEffect(() => {
    if (!sessionId) return;
    const savedStep = localStorage.getItem(`osce_exam_step_${sessionId}_${currentRound}`);
    if (savedStep && Number(savedStep) >= 1 && Number(savedStep) <= 4) {
      setExamStep(Number(savedStep));
    }
  }, [sessionId, currentRound]);

  useEffect(() => {
    if (sessionId && examStep) {
      localStorage.setItem(`osce_exam_step_${sessionId}_${currentRound}`, examStep.toString());
    }
  }, [sessionId, currentRound, examStep]);

  // Auto-save candidate answer to Supabase osce.participant_answers & localStorage
  const performAutoSave = useCallback(
    async (overrides = {}) => {
      try {
        if (!sessionId || activeStationInfo?.is_break) return;

        const draftKey = `osce_draft_ans_${sessionId}_round_${currentRound}`;
        const draftPayload = {
          workingDiagnosis: overrides.workingDiagnosis ?? workingDiagnosis,
          differentialDiagnosis: overrides.differentialDiagnosis ?? differentialDiagnosis,
          prescriptionText: overrides.prescriptionText ?? prescriptionText,
          checkedAuxiliaryIds: overrides.checkedAuxiliaryIds ?? checkedAuxiliaryIds,
          examStep: overrides.current_step || examStep,
          timestamp: Date.now(),
        };
        localStorage.setItem(draftKey, JSON.stringify(draftPayload));

        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id || localStorage.getItem("osce_user_id") || "participant-user";

        const st = dbStations.find((s) => Number(s.station_number) === currentStationNum);
        if (!st?.id) return;

        await saveParticipantStepAnswer({
          session_id: sessionId,
          station_id: st.id,
          participant_id: userId,
          rotation_round: currentRound,
          current_step: overrides.current_step || examStep,
          working_diagnosis: overrides.workingDiagnosis ?? workingDiagnosis,
          differential_dx_1: overrides.differentialDiagnosis ?? differentialDiagnosis,
          prescription_text: overrides.prescriptionText ?? prescriptionText,
          requested_auxiliary_json: overrides.checkedAuxiliaryIds ?? checkedAuxiliaryIds,
          status: overrides.status || "in_progress",
        });
      } catch (e) {
        console.warn("Auto-save candidate answer error:", e);
      }
    },
    [
      sessionId,
      activeStationInfo?.is_break,
      currentRound,
      currentStationNum,
      dbStations,
      examStep,
      workingDiagnosis,
      differentialDiagnosis,
      prescriptionText,
      checkedAuxiliaryIds,
    ]
  );

  // Debounced auto-save on answer change during live round
  useEffect(() => {
    if (viewMode !== "live_round") return;
    const timer = setTimeout(() => {
      performAutoSave();
    }, 1000);
    return () => clearTimeout(timer);
  }, [workingDiagnosis, differentialDiagnosis, prescriptionText, checkedAuxiliaryIds, examStep, viewMode, performAutoSave]);

  const toggleAuxiliaryCheckbox = (id) => {
    if (checkedAuxiliaryIds.includes(id)) {
      setCheckedAuxiliaryIds(checkedAuxiliaryIds.filter((item) => item !== id));
    } else {
      setCheckedAuxiliaryIds([...checkedAuxiliaryIds, id]);
    }
  };

  const handleSubmitAuxiliaryRequests = () => {
    if (checkedAuxiliaryIds.length === 0) {
      setExamStep(4);
      performAutoSave({ current_step: 4, status: "in_progress" });
      return;
    }

    const stationConfigs = activeStationInfo?.auxiliary_configs || [];
    const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const indicatedResults = [];

    checkedAuxiliaryIds.forEach((id) => {
      const catalogInfo = allCatalogItems.find((i) => i.id === id);
      const catNameNorm = catalogInfo ? norm(catalogInfo.name) : norm(id);

      const matchedConfig = stationConfigs.find((cfg) => {
        if (cfg.item_id && cfg.item_id === id) return true;
        if (cfg.id && cfg.id === id) return true;
        const cfgNameNorm = norm(cfg.name || cfg.title);
        if (cfgNameNorm && (cfgNameNorm.includes(catNameNorm) || catNameNorm.includes(cfgNameNorm))) return true;
        return false;
      });

      if (matchedConfig) {
        indicatedResults.push({
          id,
          name: matchedConfig.name || catalogInfo?.name || id,
          category: matchedConfig.category || catalogInfo?.category || "PENUNJANG",
          hasData: true,
          imageUrl: matchedConfig.image_url || matchedConfig.imageUrl || matchedConfig.file_url || "",
          reportText: matchedConfig.report_text || matchedConfig.reportText || "Hasil pemeriksaan dalam batas normal / sesuai skenario klinis.",
          isMatched: true,
        });
      } else {
        indicatedResults.push({
          id,
          name: catalogInfo ? catalogInfo.name : id,
          category: catalogInfo ? catalogInfo.category : "PENUNJANG",
          hasData: true,
          imageUrl: catalogInfo?.imageUrl || "",
          reportText: catalogInfo?.reportText || `Hasil pemeriksaan ${catalogInfo ? catalogInfo.name : id} dalam batas normal.`,
          isMatched: false,
        });
      }
    });

    if (indicatedResults.length > 0) {
      setAuxiliaryResults(indicatedResults);
      setIsAuxiliaryResultOpen(true);
      performAutoSave({ current_step: 3, status: "in_progress" });
    } else {
      setExamStep(4);
      performAutoSave({ current_step: 4, status: "in_progress" });
    }
  };

  return {
    examStep,
    setExamStep,
    workingDiagnosis,
    setWorkingDiagnosis,
    differentialDiagnosis,
    setDifferentialDiagnosis,
    prescriptionText,
    setPrescriptionText,
    checkedAuxiliaryIds,
    setCheckedAuxiliaryIds,
    toggleAuxiliaryCheckbox,
    performAutoSave,
    handleSubmitAuxiliaryRequests,
    auxSearchQuery,
    setAuxSearchQuery,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    expandedCategories,
    setExpandedCategories,
    filteredCatalog,
    allCatalogItems,
    isAuxiliaryResultOpen,
    setIsAuxiliaryResultOpen,
    auxiliaryResults,
    setAuxiliaryResults,
  };
}
