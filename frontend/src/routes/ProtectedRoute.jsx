import { Navigate } from "react-router-dom";
import { getToken } from "../utils/token";

function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;