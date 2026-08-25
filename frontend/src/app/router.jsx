import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, useRouteError, useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

// Public pages (immediate or light)
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

import ProtectedRoute from "@/routes/ProtectedRoute";

// Route error boundary fallback
function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Terjadi Kesalahan Aplikasi</h2>
          <p className="text-xs text-slate-500 mt-1">
            {error?.message || "Sistem mendeteksi kendala pada halaman ini. Anda dapat memuat ulang atau kembali ke beranda."}
          </p>
        </div>
        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer"
          >
            <RefreshCw size={14} /> Muat Ulang
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Home size={14} /> Halaman Utama
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#0D3A68] border-t-transparent" />
      <span className="text-xs font-semibold text-slate-500">Memuat halaman...</span>
    </div>
  </div>
);

const Lazy = (Component) => (props) => (
  <Suspense fallback={<PageLoader />}>
    <Component {...props} />
  </Suspense>
);

// ======================
// ADMIN (Lazy Loaded)
// ======================
const AdminPage = Lazy(lazy(() => import("@/features/admin/pages/AdminPage")));
const AdminLiveMonitorPage = Lazy(lazy(() => import("@/features/admin/pages/LiveMonitorPage")));
const SessionsPage = Lazy(lazy(() => import("@/features/admin/pages/SessionsPage")));
const SessionDetailPage = Lazy(lazy(() => import("@/features/admin/pages/SessionDetailPage")));
const ParticipantsPage = Lazy(lazy(() => import("@/features/admin/pages/ParticipantsPage")));
const ParticipantDetailPage = Lazy(lazy(() => import("@/features/admin/pages/ParticipantDetailPage")));
const ExaminersPage = Lazy(lazy(() => import("@/features/admin/pages/ExaminersPage")));
const ReportsPage = Lazy(lazy(() => import("@/features/admin/pages/ReportsPage")));
const SessionParticipantsPage = Lazy(lazy(() => import("@/features/admin/pages/SessionParticipantsPage")));
const SessionExaminersPage = Lazy(lazy(() => import("@/features/admin/pages/SessionExaminersPage")));
const StageQuestionPage = Lazy(lazy(() => import("@/features/admin/pages/StageQuestionPage")));
const CreateSessionPage = Lazy(lazy(() => import("@/features/admin/pages/CreateSessionPage")));
const CasesPage = Lazy(lazy(() => import("@/features/admin/pages/CasesPage")));
const CreateCasePage = Lazy(lazy(() => import("@/features/admin/pages/CreateCasePage")));
const SettingsPage = Lazy(lazy(() => import("@/features/admin/pages/SettingsPage")));
const ParticipantAnswerPage = Lazy(lazy(() => import("@/features/admin/pages/ParticipantAnswerPage")));
const StationMonitorDetailPage = Lazy(lazy(() => import("@/features/admin/pages/StationMonitorDetailPage")));
const SessionRotationSchedulePage = Lazy(lazy(() => import("@/features/admin/pages/SessionRotationSchedulePage")));
const AdminProfilePage = Lazy(lazy(() => import("@/features/admin/pages/AdminProfilePage")));

// ======================
// PARTICIPANT (Lazy Loaded)
// ======================
const ParticipantDashboardPage = Lazy(lazy(() => import("@/features/participant/pages/ParticipantDashboardPage")));
const ParticipantSessionPage = Lazy(lazy(() => import("@/features/participant/pages/ParticipantSessionPage")));
const ParticipantResultDetailPage = Lazy(lazy(() => import("@/features/participant/pages/ParticipantResultDetailPage")));
const ParticipantHistoryPage = Lazy(lazy(() => import("@/features/participant/pages/ParticipantHistoryPage")));
const ParticipantProfilePage = Lazy(lazy(() => import("@/features/participant/pages/ParticipantProfilePage")));

// ======================
// EXAMINER (Lazy Loaded)
// ======================
const ExaminerLayout = Lazy(lazy(() => import("@/layouts/ExaminerLayout")));
const ExaminerDashboardPage = Lazy(lazy(() => import("@/features/examiner/pages/DashboardPage")));
const ExaminerLiveMonitorPage = Lazy(lazy(() => import("@/features/examiner/pages/LiveMonitorPage")));
const ExaminerFeedbackPage = Lazy(lazy(() => import("@/features/examiner/pages/FeedbackPage")));
const ExaminerStagePage = Lazy(lazy(() => import("@/features/examiner/pages/ExaminerStagePage")));
const ExaminerHistoryPage = Lazy(lazy(() => import("@/features/examiner/pages/ExaminerHistoryPage")));
const ExaminerHistoryDetailPage = Lazy(lazy(() => import("@/features/examiner/pages/ExaminerHistoryDetailPage")));
const ExaminerProfilePage = Lazy(lazy(() => import("@/features/examiner/pages/ExaminerProfilePage")));

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
    errorElement: <RouteErrorBoundary />,
  },

  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },

  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
    errorElement: <RouteErrorBoundary />,
  },

  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
    errorElement: <RouteErrorBoundary />,
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
    path: "/admin/live/station/:stageId",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <StationMonitorDetailPage />
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
    path: "/admin/sessions/:id/schedule",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <SessionRotationSchedulePage />
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
    path: "/admin/participants/:id",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <ParticipantDetailPage />
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
    path: "/admin/cases/create",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <CreateCasePage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/cases/:id/edit",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <CreateCasePage />
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
    path: "/admin/profile",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <AdminProfilePage />
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
    path: "/participant/history",
    element: (
      <ProtectedRoute allow={["participant"]}>
        <ParticipantHistoryPage />
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

  {
    path: "/participant/profile",
    element: (
      <ProtectedRoute allow={["participant"]}>
        <ParticipantProfilePage />
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
        path: "session/:sessionId",
        element: <ExaminerStagePage />,
      },
      {
        path: "session/:sessionId/stage/:stageId",
        element: <ExaminerStagePage />,
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
        path: "profile",
        element: <ExaminerProfilePage />,
      },
      {
        path: "feedback/:answerId",
        element: <ExaminerFeedbackPage />,
      },
    ],
  },
]);