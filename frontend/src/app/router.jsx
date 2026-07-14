import { createBrowserRouter } from "react-router-dom";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import ProtectedRoute from "@/routes/ProtectedRoute";

// ADMIN
import AdminPage from "@/features/admin/pages/AdminPage";
import LiveMonitorPage from "@/features/admin/pages/LiveMonitorPage";
import SessionsPage from "@/features/admin/pages/SessionsPage";
import CasesPage from "@/features/admin/pages/CasesPage";
import StationsPage from "@/features/admin/pages/StationsPage";
import ExaminersPage from "@/features/admin/pages/ExaminersPage";
import ReportsPage from "@/features/admin/pages/ReportsPage";
import SettingsPage from "@/features/admin/pages/SettingsPage";
import CaseSectionsPage from "@/features/admin/components/CaseSectionsPage";
import CaseChecklistPage from "@/features/admin/components/CaseChecklistPage";
import SessionParticipantsPage from "@/features/admin/pages/SessionParticipantsPage";
import ParticipantsPage from "@/features/admin/pages/ParticipantsPage";

// USER
import ParticipantPage from "@/features/participant/pages/ParticipantPage";
import ExaminerPage from "@/features/examiner/pages/ExaminerPage";
import MentorPage from "@/features/mentor/pages/MentorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },

  {
    path: "/login",
    element: <LoginPage />,
  },

  // ======================
  // ADMIN
  // ======================

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
        <LiveMonitorPage />
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
    path: "/admin/cases",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <CasesPage />
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
    path: "/admin/stations",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <StationsPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/sessions/:id/participants",
    element: (
      <ProtectedRoute>
        <SessionParticipantsPage />
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
    path: "/admin/settings",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },

  {
  path: "/admin/cases/:id/sections",
  element: (
    <ProtectedRoute allow={["admin"]}>
      <CaseSectionsPage />
    </ProtectedRoute>
  ),
},
{
  path: "/admin/cases/:id/checklist",
  element: (
    <ProtectedRoute allow={["admin"]}>
      <CaseChecklistPage />
    </ProtectedRoute>
  ),
},
  

  // ======================
  // PARTICIPANT
  // ======================

  {
    path: "/participant",
    element: (
      <ProtectedRoute allow={["participant"]}>
        <ParticipantPage />
      </ProtectedRoute>
    ),
  },

  // ======================
  // EXAMINER
  // ======================

  {
    path: "/examiner",
    element: (
      <ProtectedRoute allow={["examiner"]}>
        <ExaminerPage />
      </ProtectedRoute>
    ),
  },

  // ======================
  // MENTOR
  // ======================

  {
    path: "/mentor",
    element: (
      <ProtectedRoute allow={["mentor"]}>
        <MentorPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
]);