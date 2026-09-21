import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../services/user";
import { useEffect, useState } from "react";

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load current user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">
          Checking permissions...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  const role = String(user.role || "").toLowerCase();

  const normalizedAllowedRoles = allowedRoles.map((item) =>
    String(item).toLowerCase()
  );

  if (!normalizedAllowedRoles.includes(role)) {
    if (role === "student") {
      return <Navigate to="/student-dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleProtectedRoute;