import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import AuxiliaryExamResultModal from "@/components/AuxiliaryExamResultModal";
import ConfirmModal from "@/components/ConfirmModal";

// Views
import ParticipantApprovalPendingView from "@/features/participant/components/ParticipantApprovalPendingView";
import ParticipantWaitingRoomView from "@/features/participant/components/ParticipantWaitingRoomView";
import ParticipantTransitView from "@/features/participant/components/ParticipantTransitView";
import ParticipantBreakStationView from "@/features/participant/components/ParticipantBreakStationView";
import ParticipantPauseOverlay from "@/features/participant/components/ParticipantPauseOverlay";
import ParticipantCompletedView from "@/features/participant/components/ParticipantCompletedView";
import ParticipantStationCompletedWaitView from "@/features/participant/components/ParticipantStationCompletedWaitView";
import ParticipantExamHeader from "@/features/participant/components/ParticipantExamHeader";
import ParticipantExamScenarioSidebar from "@/features/participant/components/ParticipantExamScenarioSidebar";

// Steps
import ParticipantStepAnamnesis from "@/features/participant/components/steps/ParticipantStepAnamnesis";
import ParticipantStepPhysicalExam from "@/features/participant/components/steps/ParticipantStepPhysicalExam";
import ParticipantStepAuxiliaryExam from "@/features/participant/components/steps/ParticipantStepAuxiliaryExam";
import ParticipantStepDiagnosisPrescription from "@/features/participant/components/steps/ParticipantStepDiagnosisPrescription";

// Modals
import ParticipantCheatingWarningModal from "@/features/participant/components/ParticipantCheatingWarningModal";
import ParticipantStepConfirmModal from "@/features/participant/components/ParticipantStepConfirmModal";

// Custom Hooks
import { useParticipantPresence } from "@/features/participant/hooks/useParticipantPresence";
import { useParticipantAntiCheating } from "@/features/participant/hooks/useParticipantAntiCheating";
import { useParticipantSessionData } from "@/features/participant/hooks/useParticipantSessionData";
import { useParticipantTimer } from "@/features/participant/hooks/useParticipantTimer";
import { useParticipantAnswers } from "@/features/participant/hooks/useParticipantAnswers";

export default function ParticipantSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Confirmation & Alert Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Mengerti",
    variant: "info",
    isAlert: true,
    onConfirm: null,
  });

  // Step Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState(null);

  // Hook 1: Realtime Presence & Approval Status Guard
  const { onlineUsers, candidateApprovalStatus } = useParticipantPresence(sessionId);

  // Round Break Configuration (Default: Istirahat setelah Ronde 3)
  const breakAfterRound = 3;

  // Refs for cross-hook callbacks
  const performAutoSaveRef = useRef(null);
  const handleFinishActiveRoundRef = useRef(null);

  // Temporary local state for initial hook initialization
  const [tempRound] = useState(() => {
    if (!sessionId) return 1;
    const savedRound = localStorage.getItem(`osce_current_round_${sessionId}`);
    return savedRound ? Number(savedRound) : 1;
  });

  // Hook 2: Session Data & Active Station Info
  const {
    sessionDetail,
    setSessionDetail,
    dbStations,
    myStartingStation,
    stationDurationSeconds,
    transitDurationSeconds,
    breakDurationSeconds,
    totalRoundsInSession,
    activeStationInfo,
  } = useParticipantSessionData(sessionId, tempRound);

  // Hook 3: Real-Time Timer & ViewMode Navigation
  const {
    viewMode,
    setViewMode,
    currentRound,
    setCurrentRound,
    globalTimerState,
    isSessionLive,
    roundSecondsLeft,
    setRoundSecondsLeft,
    transitSecondsLeft,
    setTransitSecondsLeft,
    breakSecondsLeft,
    setBreakSecondsLeft,
    activeBroadcast,
    setActiveBroadcast,
  } = useParticipantTimer({
    sessionId,
    sessionDetail,
    setSessionDetail,
    stationDurationSeconds,
    transitDurationSeconds,
    breakDurationSeconds,
    totalRoundsInSession,
    navigate,
    activeStationInfo,
    performAutoSaveRef,
    handleFinishActiveRoundRef,
  });

  // Hook 4: Screen Wake Lock & Anti-Cheating Grace Period
  const { tabSwitchCount, showCheatingWarning, setShowCheatingWarning } =
    useParticipantAntiCheating(viewMode);

  // Hook 5: Answer Form State, Continuous Local Backup & Auxiliary Requests
  const {
    examStep,
    setExamStep,
    workingDiagnosis,
    setWorkingDiagnosis,
    differentialDiagnosis,
    setDifferentialDiagnosis,
    prescriptionText,
    setPrescriptionText,
    checkedAuxiliaryIds,
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
    isAuxiliaryResultOpen,
    setIsAuxiliaryResultOpen,
    auxiliaryResults,
  } = useParticipantAnswers({
    sessionId,
    currentStationNum: activeStationInfo.station_number,
    currentRound,
    dbStations,
    activeStationInfo,
    viewMode,
  });

  // Assign refs for timer hook auto-triggers
  performAutoSaveRef.current = performAutoSave;

  const handleFinishActiveRound = () => {
    const isPaused =
      globalTimerState?.phase === "paused" ||
      globalTimerState?.phase?.startsWith("paused") ||
      sessionDetail?.status === "paused";

    if (isPaused) return;

    if (currentRound >= totalRoundsInSession) {
      setViewMode("completed");
    } else if (currentRound === breakAfterRound) {
      setViewMode("round_break");
      setBreakSecondsLeft(breakDurationSeconds);
    } else {
      setViewMode("transit");
      setTransitSecondsLeft(transitDurationSeconds);
    }
  };
  handleFinishActiveRoundRef.current = handleFinishActiveRound;

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function handleStartSimulationFromWaiting() {
    if (!isSessionLive) {
      setConfirmModal({
        isOpen: true,
        title: "Sesi Ujian Belum Dimulai",
        message:
          "Sesi ujian sirkuit ini belum diaktifkan secara live oleh Admin Control Room. Harap tunggu hingga Admin menekan tombol Start Live Ujian di Control Room.",
        confirmText: "Saya Mengerti (Menunggu Admin)",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }
    const currentPhase = globalTimerState?.phase;
    if (currentPhase === "initial_transition" || currentPhase === "transition") {
      setViewMode("transit");
    } else if (currentPhase === "break") {
      setViewMode("round_break");
    } else if (currentPhase === "completed_waiting" || currentPhase === "finished") {
      setViewMode("completed");
    } else {
      setViewMode("live_round");
      setExamStep(1);
    }
    setCurrentRound(globalTimerState?.round_number || 1);
  }

  function handleStartNextRoundFromBreak() {
    const nextR = currentRound + 1;
    setCurrentRound(nextR);
    setViewMode("live_round");
    setExamStep(1);
    setRoundSecondsLeft(stationDurationSeconds);
    setWorkingDiagnosis("");
    setDifferentialDiagnosis("");
    setPrescriptionText("");
  }

  function requestNextStep(nextStepNumber) {
    setPendingNextStep(nextStepNumber);
    setIsConfirmModalOpen(true);
  }

  function confirmNextStep() {
    if (pendingNextStep) {
      if (pendingNextStep === 5) {
        performAutoSave({ current_step: 4, status: "submitted" });
        if (sessionId && currentRound) {
          localStorage.setItem(`osce_station_submitted_${sessionId}_round_${currentRound}`, "true");
        }
        setPendingNextStep(null);
        setIsConfirmModalOpen(false);

        const isTimerStillRunning = roundSecondsLeft > 0 && globalTimerState?.phase !== "transition";
        if (isTimerStillRunning) {
          setViewMode("station_completed_wait");
        } else {
          handleFinishActiveRound();
        }
        return;
      }
      setExamStep(pendingNextStep);
      performAutoSave({ current_step: pendingNextStep, status: "in_progress" });
      setPendingNextStep(null);
    }
    setIsConfirmModalOpen(false);
  }

  function handleExitWaitingRoom() {
    setConfirmModal({
      isOpen: true,
      title: "Keluar dari Waiting Room?",
      message: "Apakah Anda yakin ingin keluar dari Waiting Room sesi ujian ini dan kembali ke Dashboard Peserta?",
      confirmText: "Ya, Keluar Waiting Room",
      cancelText: "Batal",
      variant: "danger",
      isAlert: false,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        navigate("/participant");
      },
    });
  }

  /* ============================================================
     GUARD CHECK: PESERTA HANYA BISA MASUK KIOSK JIKA STATUS APPROVAL === 'approved'
  ============================================================ */
  if (candidateApprovalStatus === "pending" || candidateApprovalStatus === "rejected") {
    return (
      <ParticipantApprovalPendingView
        candidateApprovalStatus={candidateApprovalStatus}
        onNavigateBack={() => navigate("/participant")}
      />
    );
  }

  /* ============================================================
     RENDER VIEW 1: RUANG TUNGGU PESERTA (PRE-EXAM WAITING ROOM)
  ============================================================ */
  if (viewMode === "waiting_room") {
    return (
      <>
        <ParticipantWaitingRoomView
          sessionDetail={sessionDetail}
          isSessionLive={isSessionLive}
          sessionId={sessionId}
          user={user}
          currentRound={currentRound}
          onlineUsers={onlineUsers}
          onExitWaitingRoom={handleExitWaitingRoom}
          onStartSimulation={handleStartSimulationFromWaiting}
        />
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          variant={confirmModal.variant}
          isAlert={confirmModal.isAlert}
        />
      </>
    );
  }

  /* ============================================================
     RENDER VIEW 2: RUANG TRANSIT PERPINDAHAN STASE (TRANSIT WAITING ROOM - 2 MINS)
  ============================================================ */
  if (viewMode === "transit") {
    const isInitialStartTransition = globalTimerState?.phase === "initial_transition";

    const targetRoundNumber = isInitialStartTransition
      ? 1
      : Math.min(totalRoundsInSession, (globalTimerState?.round_number || currentRound) + 1);

    const totalStationsCount = sessionDetail?.total_stations || dbStations?.length || 4;
    const targetStationNum = ((myStartingStation - 1 + (targetRoundNumber - 1)) % totalStationsCount) + 1;

    const nextSt = dbStations.find((s) => Number(s.station_number) === targetStationNum);
    const isNextBreak = Boolean(
      nextSt?.is_break ||
      nextSt?.title?.toLowerCase().includes("istirahat") ||
      nextSt?.title?.toLowerCase().includes("break") ||
      nextSt?.case_title?.toLowerCase().includes("istirahat")
    );

    const nextStationInfo = {
      station_number: targetStationNum,
      is_break: isNextBreak,
      title: nextSt?.title || (isNextBreak ? `Stase ${targetStationNum}: Istirahat` : `Stase ${targetStationNum}: Klinis Terpadu`),
      case_title: nextSt?.case_title || (isNextBreak ? "Rotasi Istirahat (Stase Istirahat)" : "Evaluasi Skenario SKDI"),
      location: sessionDetail?.location_building ? `${sessionDetail.location_building} Ruang 10${targetStationNum}` : `Gedung Skill Lab Ruang 10${targetStationNum}`,
    };

    return (
      <ParticipantTransitView
        targetRoundNumber={targetRoundNumber}
        nextStationInfo={nextStationInfo}
        currentRound={currentRound}
        transitSecondsLeft={transitSecondsLeft}
        isSessionLive={isSessionLive}
        formatTime={formatTime}
        onProceedToRound={(roundNum) => {
          setCurrentRound(roundNum);
          setViewMode("live_round");
          setExamStep(1);
          setRoundSecondsLeft(stationDurationSeconds);
        }}
      />
    );
  }

  /* ============================================================
     RENDER VIEW 3: RUANG ISTIRAHAT RONDE (ROUND BREAK - 10 MINS)
  ============================================================ */
  if (viewMode === "round_break") {
    const nextRoundNumber = currentRound + 1;
    const totalStationsCount = sessionDetail?.total_stations || dbStations?.length || 4;
    const nextStationNum = ((myStartingStation - 1 + (nextRoundNumber - 1)) % totalStationsCount) + 1;

    const nextSt = dbStations.find((s) => Number(s.station_number) === nextStationNum);
    const isNextBreak = Boolean(
      nextSt?.is_break ||
      nextSt?.title?.toLowerCase().includes("istirahat") ||
      nextSt?.title?.toLowerCase().includes("break") ||
      nextSt?.case_title?.toLowerCase().includes("istirahat")
    );

    const nextStationInfo = {
      station_number: nextStationNum,
      is_break: isNextBreak,
      title: nextSt?.title || (isNextBreak ? `Stase ${nextStationNum}: Istirahat` : `Stase ${nextStationNum}: Klinis Terpadu`),
      case_title: nextSt?.case_title || (isNextBreak ? "Rotasi Istirahat (Stase Istirahat)" : "Evaluasi Skenario SKDI"),
      location: sessionDetail?.location_building ? `${sessionDetail.location_building} Ruang 10${nextStationNum}` : `Gedung Skill Lab Ruang 10${nextStationNum}`,
    };

    return (
      <ParticipantTransitView
        targetRoundNumber={nextRoundNumber}
        nextStationInfo={nextStationInfo}
        currentRound={currentRound}
        transitSecondsLeft={breakSecondsLeft}
        isSessionLive={isSessionLive}
        formatTime={formatTime}
        onProceedToRound={handleStartNextRoundFromBreak}
      />
    );
  }

  /* ============================================================
     RENDER VIEW 4: HALAMAN TERIMAKASIH MENGIKUTI UJIAN (COMPLETED)
  ============================================================ */
  const isSessionPaused =
    globalTimerState?.phase === "paused" ||
    globalTimerState?.phase?.startsWith("paused") ||
    sessionDetail?.status === "paused";

  if (!isSessionPaused && (viewMode === "completed" || sessionDetail?.status === "completed" || sessionDetail?.status === "finished")) {
    return (
      <>
        <ParticipantCompletedView
          sessionDetail={sessionDetail}
          totalRoundsInSession={totalRoundsInSession}
          onNavigateHome={() => navigate("/participant")}
          onNavigateHistory={() => navigate("/participant/history")}
        />
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          variant={confirmModal.variant}
          isAlert={confirmModal.isAlert}
        />
      </>
    );
  }

  /* ============================================================
     RENDER VIEW 5: RUANG UJIAN LIVE MULTI-STEP (LIVE ROUND EXAM)
  ============================================================ */
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Header Component */}
      <ParticipantExamHeader
        activeBroadcast={activeBroadcast}
        onCloseBroadcast={() => setActiveBroadcast(null)}
        currentRound={currentRound}
        totalRoundsInSession={totalRoundsInSession}
        activeStationInfo={activeStationInfo}
        viewMode={viewMode}
        examStep={examStep}
        globalTimerState={globalTimerState}
        sessionDetail={sessionDetail}
        roundSecondsLeft={roundSecondsLeft}
        formatTime={formatTime}
      />

      {/* Main Workspace */}
      {viewMode === "station_completed_wait" ? (
        <ParticipantStationCompletedWaitView
          activeStationInfo={activeStationInfo}
          roundSecondsLeft={roundSecondsLeft}
          formatTime={formatTime}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid gap-6 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN: SCENARIO SIDEBAR */}
          <ParticipantExamScenarioSidebar activeStationInfo={activeStationInfo} />

          {/* RIGHT COLUMN: PRIMARY EXAM WORKSPACE */}
          <div className="lg:col-span-8 space-y-6">
            {activeStationInfo.is_break ? (
              <ParticipantBreakStationView
                currentRound={currentRound}
                roundSecondsLeft={roundSecondsLeft}
                formatTime={formatTime}
                onFinishActiveRound={handleFinishActiveRound}
              />
            ) : (
              <>
                {examStep === 1 && (
                  <ParticipantStepAnamnesis onRequestNextStep={requestNextStep} />
                )}

                {examStep === 2 && (
                  <ParticipantStepPhysicalExam onRequestNextStep={requestNextStep} />
                )}

                {examStep === 3 && (
                  <ParticipantStepAuxiliaryExam
                    checkedAuxiliaryIds={checkedAuxiliaryIds}
                    onToggleAuxiliaryCheckbox={toggleAuxiliaryCheckbox}
                    onResetChecked={() => toggleAuxiliaryCheckbox(null)}
                    auxSearchQuery={auxSearchQuery}
                    setAuxSearchQuery={setAuxSearchQuery}
                    selectedCategoryFilter={selectedCategoryFilter}
                    setSelectedCategoryFilter={setSelectedCategoryFilter}
                    expandedCategories={expandedCategories}
                    setExpandedCategories={setExpandedCategories}
                    filteredCatalog={filteredCatalog}
                    onSubmitAuxiliaryRequests={handleSubmitAuxiliaryRequests}
                  />
                )}

                {examStep === 4 && (
                  <ParticipantStepDiagnosisPrescription
                    differentialDiagnosis={differentialDiagnosis}
                    setDifferentialDiagnosis={setDifferentialDiagnosis}
                    workingDiagnosis={workingDiagnosis}
                    setWorkingDiagnosis={setWorkingDiagnosis}
                    prescriptionText={prescriptionText}
                    setPrescriptionText={setPrescriptionText}
                    activeStationNumber={activeStationInfo.station_number}
                    onRequestFinishStation={() => requestNextStep(5)}
                  />
                )}
              </>
            )}
          </div>
        </main>
      )}

      {/* Auxiliary Exam Results Modal */}
      <AuxiliaryExamResultModal
        isOpen={isAuxiliaryResultOpen}
        onClose={() => setIsAuxiliaryResultOpen(false)}
        results={auxiliaryResults}
        onConfirmNext={() => {
          setIsAuxiliaryResultOpen(false);
          setExamStep(4);
          performAutoSave({ current_step: 4, status: "in_progress" });
        }}
      />

      {/* Modal 1: Step Transition Confirmation */}
      <ParticipantStepConfirmModal
        isOpen={isConfirmModalOpen}
        pendingNextStep={pendingNextStep}
        activeStationNumber={activeStationInfo.station_number}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmNextStep}
      />

      {/* Modal 2: Anti-Cheating Tab Switch & Fullscreen Warning */}
      <ParticipantCheatingWarningModal
        isOpen={showCheatingWarning}
        tabSwitchCount={tabSwitchCount}
        onConfirm={() => {
          setShowCheatingWarning(false);
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        }}
      />

      {/* Fullscreen Pause Overlay */}
      <ParticipantPauseOverlay
        globalTimerState={globalTimerState}
        sessionDetail={sessionDetail}
        currentRound={currentRound}
        assignedStation={activeStationInfo}
      />

      {/* General Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        isAlert={confirmModal.isAlert}
      />
    </div>
  );
}