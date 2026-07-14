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

  // kalau route tidak memberi allow,
  // cukup pastikan user sudah login
  if (allow.length === 0) {
    return children;
  }

  if (
    user?.user_metadata?.role === "admin" &&
    allow.includes("admin")
  ) {
    return children;
  }

  if (
    profile?.osce_role &&
    allow.includes(profile.osce_role)
  ) {
    return children;
  }

  return <Navigate to="/unauthorized" replace />;
}