import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  GraduationCap,
  CalendarDays,
  FileText,
  RefreshCw,
} from "lucide-react";

import Layout from "../../components/layout/Layout";

import { getMyAdmission } from "../../services/admission";
import { getMyStudentProfile } from "../../services/student";


function StudentAdmission() {
  const [admission, setAdmission] = useState(null);
  const [student, setStudent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const loadAdmission = async () => {
    try {
      setLoading(true);
      setError("");

      const [admissionResponse, studentResponse] =
        await Promise.all([
          getMyAdmission(),
          getMyStudentProfile(),
        ]);

      setAdmission(
        admissionResponse?.data ??
        admissionResponse
      );

      setStudent(
        studentResponse?.data ??
        studentResponse
      );

    } catch (err) {
      console.error("Failed to load admission:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load admission information."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadAdmission();
  }, []);


  const getStatusIcon = () => {
    const status =
      admission?.status?.toLowerCase();

    if (status === "confirmed") {
      return (
        <CheckCircle2
          size={24}
          className="text-green-600"
        />
      );
    }

    if (
      status === "rejected" ||
      status === "not_eligible"
    ) {
      return (
        <XCircle
          size={24}
          className="text-red-600"
        />
      );
    }

    if (
      status === "approved" ||
      status === "pending"
    ) {
      return (
        <Clock3
          size={24}
          className="text-amber-600"
        />
      );
    }

    return (
      <AlertCircle
        size={24}
        className="text-gray-500"
      />
    );
  };


  const getStatusLabel = () => {
    const status =
      admission?.status || "Unknown";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };


  const getStatusClasses = () => {
    const status =
      admission?.status?.toLowerCase();

    if (status === "confirmed") {
      return "border-green-200 bg-green-50";
    }

    if (
      status === "rejected" ||
      status === "not_eligible"
    ) {
      return "border-red-200 bg-red-50";
    }

    return "border-amber-200 bg-amber-50";
  };


  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={30}
              className="mx-auto mb-3 animate-spin text-gray-700"
            />

            <p className="text-sm text-gray-500">
              Loading admission information...
            </p>
          </div>
        </div>
      </Layout>
    );
  }


  if (error) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertCircle
                size={24}
                className="text-red-600"
              />
            </div>

            <h2 className="text-lg font-bold text-gray-900">
              Unable to Load Admission
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              onClick={loadAdmission}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>
        </div>
      </Layout>
    );
  }


  if (!admission) {
    return (
      <Layout>
        <div className="p-6">
          <div className="rounded-2xl border bg-white p-8 text-center">
            <p className="text-gray-500">
              No admission record found.
            </p>
          </div>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
              <GraduationCap
                size={24}
                className="text-white"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                CampusFlow AI
              </p>

              <h1 className="text-2xl font-bold text-gray-900">
                My Admission
              </h1>

              <p className="text-sm text-gray-500">
                View your admission status and academic information.
              </p>
            </div>

          </div>


          <button
            onClick={loadAdmission}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>


        {/* Status Banner */}
        <div
          className={`rounded-2xl border p-6 ${getStatusClasses()}`}
        >
          <div className="flex items-start gap-4">

            <div className="mt-0.5">
              {getStatusIcon()}
            </div>

            <div className="flex-1">

              <h2 className="text-lg font-bold text-gray-900">
                Admission {getStatusLabel()}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {admission.status?.toLowerCase() ===
                "confirmed"
                  ? "Your admission has been confirmed and your student account is active."
                  : admission.status?.toLowerCase() ===
                    "approved"
                  ? "Your admission has been approved. Complete the required fee payment to confirm your admission."
                  : admission.status?.toLowerCase() ===
                    "rejected"
                  ? "Your admission application has been rejected."
                  : "Your admission application is currently being processed."}
              </p>

            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-gray-700 shadow-sm">
              {getStatusLabel()}
            </span>

          </div>
        </div>


        {/* Admission Numbers */}
        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Application Number
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              {admission.application_number || "—"}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Your application reference
            </p>

          </div>


          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Admission Number
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              {student?.admission_number || "Not generated"}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Official admission ID
            </p>

          </div>


          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Roll Number
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              {student?.roll_number || "Not assigned"}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Student roll number
            </p>

          </div>

        </div>


        {/* Academic Information */}
        <div className="rounded-2xl border bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
                <GraduationCap
                  size={20}
                  className="text-white"
                />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Academic Information
                </h2>

                <p className="text-sm text-gray-500">
                  Your registered academic details.
                </p>
              </div>

            </div>

          </div>


          <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Full Name
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {student?.full_name || "—"}
              </p>
            </div>


            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Program
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {admission.program ||
                  student?.program ||
                  "—"}
              </p>
            </div>


            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Department
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {student?.department || "—"}
              </p>
            </div>


            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Academic Year
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {student?.academic_year || "—"}
              </p>
            </div>


            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Semester
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {student?.semester || "—"}
              </p>
            </div>


            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Admission Type
              </p>

              <p className="mt-1 font-semibold capitalize text-gray-900">
                {admission.admission_type || "—"}
              </p>
            </div>

          </div>

        </div>


        {/* Eligibility */}
        <div className="rounded-2xl border bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
                <FileText
                  size={19}
                  className="text-white"
                />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Eligibility Review
                </h2>

                <p className="text-sm text-gray-500">
                  Current eligibility decision.
                </p>
              </div>

            </div>

          </div>


          <div className="grid gap-5 p-6 md:grid-cols-2">

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Eligibility Status
              </p>

              <p className="mt-2 font-semibold capitalize text-gray-900">
                {admission.eligibility_status
                  ?.replaceAll("_", " ") ||
                  "Pending Review"}
              </p>

            </div>


            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Review Reason
              </p>

              <p className="mt-2 text-sm text-gray-700">
                {admission.eligibility_reason ||
                  "No review reason has been provided."}
              </p>

            </div>

          </div>

        </div>


        {/* Timeline */}
        <div className="rounded-2xl border bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
                <CalendarDays
                  size={19}
                  className="text-white"
                />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Admission Timeline
                </h2>

                <p className="text-sm text-gray-500">
                  Important admission milestones.
                </p>
              </div>

            </div>

          </div>


          <div className="space-y-5 p-6">

            <TimelineItem
              title="Application Submitted"
              date={admission.applied_at}
              completed={Boolean(admission.applied_at)}
            />

            <TimelineItem
              title="Eligibility Review"
              date={admission.reviewed_at}
              completed={Boolean(admission.reviewed_at)}
            />

            <TimelineItem
              title="Admission Decision"
              date={admission.decision_at}
              completed={Boolean(admission.decision_at)}
            />

            <TimelineItem
              title="Admission Confirmation"
              date={
                student?.admission_status === "confirmed"
                  ? admission.decision_at
                  : null
              }
              completed={
                student?.admission_status === "confirmed"
              }
            />

          </div>

        </div>

      </div>
    </Layout>
  );
}


function TimelineItem({
  title,
  date,
  completed,
}) {
  return (
    <div className="flex items-start gap-4">

      <div
        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          completed
            ? "bg-green-100"
            : "bg-gray-100"
        }`}
      >
        {completed ? (
          <CheckCircle2
            size={17}
            className="text-green-600"
          />
        ) : (
          <Clock3
            size={17}
            className="text-gray-400"
          />
        )}
      </div>

      <div className="flex-1">

        <p className="font-semibold text-gray-900">
          {title}
        </p>

        <p className="text-sm text-gray-500">
          {date
            ? new Date(date).toLocaleString()
            : "Pending"}
        </p>

      </div>

    </div>
  );
}


export default StudentAdmission;