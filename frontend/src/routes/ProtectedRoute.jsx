import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { parseUserRole } from "@/services/role.service";

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
      <div className="flex h-screen items-center justify-center font-bold text-slate-600">
        Memuat Akses Halaman...
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

  // Parse active role from raw_user_meta_data JSON array / profile
  const userRole =
    parseUserRole(user?.user_metadata?.role || user?.user_metadata?.roles) ||
    parseUserRole(profile?.role) ||
    "participant";

  // Check matching role permission
  if (allow.includes(userRole)) {
    return children;
  }

  // Fallback checks for mentor / examiner
  if (profile?.mentor_id && allow.includes("examiner")) {
    return children;
  }

  // Fallback check for participant / user
  if (
    (userRole === "participant" || userRole === "user") &&
    allow.includes("participant")
  ) {
    return children;
  }

  return <Navigate to="/unauthorized" replace />;
}