import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

export default function ProtectedRoute({
  children,
  allow = [],
}) {
  const {
    loading,
    session,
    user,
    profile,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  // Route bebas, cukup login
  if (allow.length === 0) {
    return children;
  }

  // Admin dari metadata Supabase
  if (
    user?.user_metadata?.role === "admin" &&
    allow.includes("admin")
  ) {
    return children;
  }

  // Mentor / Examiner
  if (
    profile?.mentor_id &&
    allow.includes("examiner")
  ) {
    return children;
  }

  // Semua user login dianggap participant
  if (
    !profile?.mentor_id &&
    allow.includes("participant")
  ) {
    return children;
  }

  return <Navigate to="/unauthorized" replace />;
}