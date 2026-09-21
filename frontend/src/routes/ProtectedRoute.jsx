import { Navigate, useLocation } from "react-router-dom";

import { getToken } from "../utils/token";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const token = getToken();
  const location = useLocation();

  const {
    user,
    loading,
  } = useAuth();

  // No JWT → login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Wait until AuthContext knows the current user
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

          <p className="text-sm text-gray-500">
            Loading CampusFlow...
          </p>
        </div>
      </div>
    );
  }

  const role = user?.role?.toUpperCase();

  /*
   * Students have their own dashboard.
   *
   * If a student somehow visits /dashboard,
   * send them to /student-dashboard instead.
   */
  if (
    role === "STUDENT" &&
    location.pathname === "/dashboard"
  ) {
    return <Navigate to="/student-dashboard" replace />;
  }

  /*
   * Registered students use the student document page,
   * not the staff document page.
   */
  if (
    role === "STUDENT" &&
    location.pathname === "/documents"
  ) {
    return <Navigate to="/student-documents" replace />;
  }

  return children;
}

export default ProtectedRoute;