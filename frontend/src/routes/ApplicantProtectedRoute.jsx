import { Navigate } from "react-router-dom";

function ApplicantProtectedRoute({ children }) {
  const token = localStorage.getItem(
    "applicant_token"
  );

  if (!token) {
    return (
      <Navigate
        to="/applicant/login"
        replace
      />
    );
  }

  return children;
}

export default ApplicantProtectedRoute;