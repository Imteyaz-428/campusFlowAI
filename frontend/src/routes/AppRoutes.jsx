import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Documents from "../pages/Documents/Documents";
import Chat from "../pages/Chat/Chat";
import Signup from "../pages/Signup/Signup";
import ProtectedRoute from "./ProtectedRoute";
import Users from "../pages/Users/Users";
import Upload from "../pages/Upload/Upload";
import Settings from "../pages/Settings/Settings";
import CollegeKnowledge from "../pages/Settings/CollegeKnowledge";
import Students from "../pages/Students/Students";
import Applications from "../pages/Applications/Applications";
import Fees from "../pages/Fees/Fees";

import ApplicantApply from "../pages/Applicant/Apply/ApplicantApply";
import ApplicantLogin from "../pages/Login/ApplicantLogin";
import ApplicantProtectedRoute from "./ApplicantProtectedRoute";
import ApplicantDashboard from "../pages/Applicant/ApplicantDashboard";
import ApplicantDocuments from "../pages/Applicant/Documents/ApplicantDocuments";

import StudentDocuments from "../pages/Documents/StudentDocuments";
import Onboarding from "../pages/Onboarding/Onboarding";
import StudentDashboard from "../pages/Students/StudentDashboard";
import StudentAdmission from "../pages/Students/StudentAdmission";
import StudentFees from "../pages/Students/StudentFees";

import Tickets from "../pages/Tickets/Tickets";
import StudentTickets from "../pages/Tickets/StudentTickets";

import StudentChat from "../pages/Chat/StudentChat";
import ApplicantChat from "../pages/Chat/ApplicantChat";

import ApplicantApplication from "../pages/Applications/ApplicantApplication";
import ApplicantFees from "../pages/Fees/ApplicantFees";
import ApplicantProfile from "../pages/Profile/ApplicantProfile";
import AdmissionCriteria from "../pages/Settings/AdmissionCriteria";
import AdminOnboarding from "../pages/AdminOnboarding/AdminOnboarding";
import RoleProtectedRoute from "../components/auth/RoleProtectedRoute";
import NewStudentChat from "../pages/Students/StudentChat";
import Landing from "../pages/Landing";


function AppRoutes() {
  return (
    <Routes>

      {/* ============================================================
          PUBLIC
      ============================================================ */}

      
      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />


      {/* ============================================================
          APPLICANT PUBLIC
      ============================================================ */}

      <Route
        path="/apply"
        element={<ApplicantApply />}
      />

      <Route
        path="/applicant/login"
        element={<ApplicantLogin />}
      />


      {/* ============================================================
          ADMIN / STAFF PROTECTED
      ============================================================ */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* ============================================================
          SETTINGS
      ============================================================ */}

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ============================================================
          ADMIN — COLLEGE KNOWLEDGE
      ============================================================ */}

      <Route
        path="/settings/college-knowledge"
        element={
          <ProtectedRoute>
            <CollegeKnowledge />
          </ProtectedRoute>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fees"
        element={
          <ProtectedRoute>
            <Fees />
          </ProtectedRoute>
        }
      />


      {/* ============================================================
          ADMIN — STUDENT DOCUMENTS
      ============================================================ */}

      <Route
        path="/student-documents"
        element={
          <ProtectedRoute>
            <StudentDocuments />
          </ProtectedRoute>
        }
      />


      {/* ============================================================
          ADMIN — ONBOARDING
      ============================================================ */}

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-onboarding"
        element={
          <RoleProtectedRoute allowedRoles={["admin", "teacher"]}>
            <AdminOnboarding />
          </RoleProtectedRoute>
        }
      />

      {/* ============================================================
          ADMIN — TICKETS
      ============================================================ */}

      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <Tickets />
          </ProtectedRoute>
        }
      />


      {/* ============================================================
          STUDENT PORTAL
      ============================================================ */}

      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admission"
        element={
          <ProtectedRoute>
            <StudentAdmission />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-fees"
        element={
          <ProtectedRoute>
            <StudentFees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-tickets"
        element={
          <ProtectedRoute>
            <StudentTickets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/students-chat"
        element={
          <ProtectedRoute>
            <StudentChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-chat"
        element={
          <ProtectedRoute>
            <NewStudentChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/admission-criteria"
        element={
          <ProtectedRoute>
            <AdmissionCriteria />
          </ProtectedRoute>
        }
      />


      {/* ============================================================
          APPLICANT PORTAL
      ============================================================ */}

      <Route
        path="/applicant/dashboard"
        element={
          <ApplicantProtectedRoute>
            <ApplicantDashboard />
          </ApplicantProtectedRoute>
        }
      />

      <Route
        path="/applicant/application"
        element={
          <ApplicantProtectedRoute>
            <ApplicantApplication />
          </ApplicantProtectedRoute>
        }
      />

      <Route
        path="/applicant/fees"
        element={
          <ApplicantProtectedRoute>
            <ApplicantFees />
          </ApplicantProtectedRoute>
        }
      />

      <Route
        path="/applicant/documents"
        element={
          <ApplicantProtectedRoute>
            <ApplicantDocuments />
          </ApplicantProtectedRoute>
        }
      />

      <Route
        path="/applicant/chat"
        element={
          <ApplicantProtectedRoute>
            <ApplicantChat />
          </ApplicantProtectedRoute>
        }
      />

      <Route
        path="/applicant/profile"
        element={
          <ApplicantProtectedRoute>
            <ApplicantProfile />
          </ApplicantProtectedRoute>
        }
      />


      {/* ============================================================
          CATCH ALL
      ============================================================ */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}


export default AppRoutes;