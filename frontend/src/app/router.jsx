import { createBrowserRouter, Outlet } from "react-router-dom";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

import ProtectedRoute from "@/routes/ProtectedRoute";

// ======================
// ADMIN
// ======================

import AdminPage from "@/features/admin/pages/AdminPage";
import AdminLiveMonitorPage from "@/features/admin/pages/LiveMonitorPage";
import SessionsPage from "@/features/admin/pages/SessionsPage";
import SessionDetailPage from "@/features/admin/pages/SessionDetailPage";
import ParticipantsPage from "@/features/admin/pages/ParticipantsPage";
import ExaminersPage from "@/features/admin/pages/ExaminersPage";
import ReportsPage from "@/features/admin/pages/ReportsPage";
import SessionParticipantsPage from "@/features/admin/pages/SessionParticipantsPage";
import SessionExaminersPage from "@/features/admin/pages/SessionExaminersPage";
import StageQuestionPage from "@/features/admin/pages/StageQuestionPage";
import CreateSessionPage from "@/features/admin/pages/CreateSessionPage";
import CasesPage from "@/features/admin/pages/CasesPage";
import SettingsPage from "@/features/admin/pages/SettingsPage";
import ParticipantAnswerPage from "@/features/admin/pages/ParticipantAnswerPage";


// ======================
// PARTICIPANT
// ======================

import ParticipantDashboardPage from "@/features/participant/pages/ParticipantDashboardPage";
import ParticipantSessionPage from "@/features/participant/pages/ParticipantSessionPage";
import ParticipantResultDetailPage from "@/features/participant/pages/ParticipantResultDetailPage";


// ======================
// EXAMINER
// ======================

import ExaminerLayout from "@/layouts/ExaminerLayout";
import ExaminerDashboardPage from "@/features/examiner/pages/DashboardPage";
import ExaminerLiveMonitorPage from "@/features/examiner/pages/LiveMonitorPage";
import ExaminerFeedbackPage from "@/features/examiner/pages/FeedbackPage";
import ExaminerStagePage from "@/features/examiner/pages/ExaminerStagePage";
import ExaminerHistoryPage from "@/features/examiner/pages/ExaminerHistoryPage";
import ExaminerHistoryDetailPage from "@/features/examiner/pages/ExaminerHistoryDetailPage";



function ExaminerRoot() {
  return (
    <ExaminerLayout>
      <Outlet />
    </ExaminerLayout>
  );
}

export const router = createBrowserRouter([
  // ==================================================
  // PUBLIC
  // ==================================================

  {
    path: "/",
    element: <LandingPage />,
  },

  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },

  // ==================================================
  // ADMIN
  // ==================================================

  {
    path: "/admin",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/live",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <AdminLiveMonitorPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/live/participant/:participantId",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <ParticipantAnswerPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/sessions",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <SessionsPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/sessions/create",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <CreateSessionPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/sessions/:id/edit",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <CreateSessionPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/sessions/:id",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <SessionDetailPage />
      </ProtectedRoute>
    ),
  },


  {
    path: "/admin/sessions/:id/participants",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <SessionParticipantsPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/sessions/:id/examiners",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <SessionExaminersPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/participants",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <ParticipantsPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/examiners",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <ExaminersPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/reports",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <ReportsPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/stages/:stageId",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <StageQuestionPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/cases",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <CasesPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/settings",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },

  // ==================================================
  // PARTICIPANT
  // ==================================================

  {
    path: "/participant",
    element: (
      <ProtectedRoute allow={["participant"]}>
        <ParticipantDashboardPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/participant/session/:sessionId",
    element: (
      <ProtectedRoute allow={["participant"]}>
        <ParticipantSessionPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/participant/results/:resultId",
    element: (
      <ProtectedRoute allow={["participant"]}>
        <ParticipantResultDetailPage />
      </ProtectedRoute>
    ),
  },


  // ==================================================
  // EXAMINER
  // ==================================================

  {
    path: "/examiner",
    element: (
      <ProtectedRoute allow={["examiner"]}>
        <ExaminerRoot />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ExaminerDashboardPage />,
      },
      {
        path: "live",
        element: <ExaminerLiveMonitorPage />,
      },
      {
        path: "live/:stageId",
        element: <ExaminerLiveMonitorPage />,
      },
      {
        path: "stage",
        element: <ExaminerStagePage />,
      },
      {
        path: "stage/:stageId",
        element: <ExaminerStagePage />,
      },
      {
        path: "history",
        element: <ExaminerHistoryPage />,
      },
      {
        path: "history/:historyId",
        element: <ExaminerHistoryDetailPage />,
      },

      {
        path: "feedback/:answerId",
        element: <ExaminerFeedbackPage />,
      },
    ],
  },
]);