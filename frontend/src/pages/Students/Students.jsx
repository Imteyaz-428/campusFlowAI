import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  RefreshCw,
  GraduationCap,
  Eye,
  X,
  FileCheck,
  CreditCard,
  ClipboardList,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

import Layout from "../../components/layout/Layout";

import { getStudents } from "../../services/student";
import { getStudentAdmissions } from "../../services/admission";
import { getStudentDocuments } from "../../services/document";
import { getStudentFees } from "../../services/fee";
import { getOnboardingSummary } from "../../services/onboarding";

/* =========================================================
   Helpers
========================================================= */

function normalizeArray(data, keys = []) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  // Handle nested { data: { items: [] } }
  if (data.data && typeof data.data === "object") {
    for (const key of keys) {
      if (Array.isArray(data.data[key])) {
        return data.data[key];
      }
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }
  }

  // Some endpoints may return a single object
  // rather than an array.
  if (
    data.id !== undefined ||
    data.student_id !== undefined ||
    data.admission_number !== undefined ||
    data.application_number !== undefined
  ) {
    return [data];
  }

  return [];
}

function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function formatStatus(value) {
  return String(value || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* =========================================================
   Status Badge
========================================================= */

function StatusBadge({ status }) {
  const value = String(status || "unknown").toLowerCase();

  let classes = "bg-gray-100 text-gray-600";

  if (
    [
      "active",
      "confirmed",
      "approved",
      "verified",
      "paid",
      "completed",
      "complete",
    ].includes(value)
  ) {
    classes = "bg-green-100 text-green-700";
  }

  if (
    [
      "pending",
      "submitted",
      "under_review",
      "processing",
      "uploaded",
      "in_progress",
      "review_required",
    ].includes(value)
  ) {
    classes = "bg-yellow-100 text-yellow-700";
  }

  if (
    [
      "rejected",
      "inactive",
      "failed",
      "action_required",
    ].includes(value)
  ) {
    classes = "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {formatStatus(value)}
    </span>
  );
}

/* =========================================================
   Detail
========================================================= */

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words font-medium text-gray-900">
        {formatValue(value)}
      </p>
    </div>
  );
}

/* =========================================================
   Section
========================================================= */

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
          <Icon size={18} className="text-white" />
        </div>

        <h3 className="font-bold text-gray-900">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   Loading
========================================================= */

function LoadingLine() {
  return (
    <div className="flex items-center gap-3 py-6 text-sm text-gray-500">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      Loading...
    </div>
  );
}

/* =========================================================
   Empty
========================================================= */

function EmptyState({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-500">
      <AlertCircle size={18} />
      {text}
    </div>
  );
}

/* =========================================================
   Onboarding Summary
========================================================= */

function OnboardingSummary({ summary }) {
  if (!summary) {
    return (
      <EmptyState text="No onboarding information found." />
    );
  }

  const source =
    summary.data &&
    typeof summary.data === "object"
      ? summary.data
      : summary;

  const completed =
    source.completed_tasks ??
    source.completed ??
    source.completed_count ??
    source.tasks_completed;

  const total =
    source.total_tasks ??
    source.total ??
    source.total_count ??
    source.tasks_total;

  const pending =
    source.pending_tasks ??
    source.pending ??
    source.pending_count ??
    source.tasks_pending;

  const progress =
    source.progress_percentage ??
    source.progress ??
    source.completion_percentage ??
    null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryBox
        icon={CheckCircle2}
        label="Completed"
        value={
          completed !== undefined
            ? completed
            : "—"
        }
      />

      <SummaryBox
        icon={Clock3}
        label="Pending"
        value={
          pending !== undefined
            ? pending
            : "—"
        }
      />

      <SummaryBox
        icon={ClipboardList}
        label="Total Tasks"
        value={
          total !== undefined
            ? total
            : "—"
        }
      />

      {progress !== null &&
        progress !== undefined && (
          <div className="sm:col-span-3">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-gray-600">
                Progress
              </span>

              <span className="font-semibold text-gray-900">
                {progress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gray-900 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      Number(progress) || 0
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
    </div>
  );
}

/* =========================================================
   Summary Box
========================================================= */

function SummaryBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <Icon
          size={18}
          className="text-gray-500"
        />

        <div>
          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="text-xl font-bold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Student Details Modal
========================================================= */

function StudentDetails({
  student,
  onClose,
}) {
  const [loading, setLoading] = useState(true);

  const [admissions, setAdmissions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [fees, setFees] = useState([]);
  const [onboarding, setOnboarding] = useState(null);

  useEffect(() => {
    if (!student?.id) {
      return;
    }

    let cancelled = false;

    const loadDetails = async () => {
      setLoading(true);

      const results = await Promise.allSettled([
        getStudentAdmissions(student.id),
        getStudentDocuments(student.id),
        getStudentFees(student.id),
        getOnboardingSummary(student.id),
      ]);

      if (cancelled) {
        return;
      }

      const [
        admissionResult,
        documentResult,
        feeResult,
        onboardingResult,
      ] = results;

      /* ---------------------------------------------
         Admission
      --------------------------------------------- */

      if (admissionResult.status === "fulfilled") {
        console.log(
          "Student admission response:",
          admissionResult.value
        );

        setAdmissions(
          normalizeArray(
            admissionResult.value,
            [
              "admissions",
              "items",
              "results",
              "data",
            ]
          )
        );
      } else {
        console.error(
          "Admission API failed:",
          admissionResult.reason
        );

        setAdmissions([]);
      }

      /* ---------------------------------------------
         Documents
      --------------------------------------------- */

      if (documentResult.status === "fulfilled") {
        console.log(
          "Student documents response:",
          documentResult.value
        );

        setDocuments(
          normalizeArray(
            documentResult.value,
            [
              "documents",
              "items",
              "results",
              "data",
            ]
          )
        );
      } else {
        console.error(
          "Documents API failed:",
          documentResult.reason
        );

        setDocuments([]);
      }

      /* ---------------------------------------------
         Fees
      --------------------------------------------- */

      if (feeResult.status === "fulfilled") {
        console.log(
          "Student fees response:",
          feeResult.value
        );

        setFees(
          normalizeArray(
            feeResult.value,
            [
              "fees",
              "items",
              "results",
              "data",
            ]
          )
        );
      } else {
        console.error(
          "Fees API failed:",
          feeResult.reason
        );

        setFees([]);
      }

      /* ---------------------------------------------
         Onboarding
      --------------------------------------------- */

      if (onboardingResult.status === "fulfilled") {
        console.log(
          "Student onboarding response:",
          onboardingResult.value
        );

        setOnboarding(
          onboardingResult.value
        );
      } else {
        console.error(
          "Onboarding API failed:",
          onboardingResult.reason
        );

        setOnboarding(null);
      }

      /* ---------------------------------------------
         Error notification
      --------------------------------------------- */

      const failedCount = results.filter(
        (result) =>
          result.status === "rejected"
      ).length;

      if (failedCount > 0) {
        toast.error(
          `${failedCount} student detail section${
            failedCount > 1 ? "s" : ""
          } could not be loaded.`
        );
      }

      setLoading(false);
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [student?.id]);

  /* =====================================================
     Onboarding Tasks
  ===================================================== */

  const onboardingTasks = useMemo(() => {
    if (!onboarding) {
      return [];
    }

    const source =
      onboarding.data &&
      typeof onboarding.data === "object"
        ? onboarding.data
        : onboarding;

    if (Array.isArray(source)) {
      return source;
    }

    if (Array.isArray(source.tasks)) {
      return source.tasks;
    }

    if (Array.isArray(source.items)) {
      return source.items;
    }

    if (Array.isArray(source.results)) {
      return source.results;
    }

    return [];
  }, [onboarding]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">
              <GraduationCap
                size={21}
                className="text-white"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {student.full_name ||
                  "Student Details"}
              </h2>

              <p className="text-sm text-gray-500">
                {student.application_number ||
                  student.admission_number ||
                  "Student profile"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">

          {/* =================================================
              Student Information
          ================================================= */}

          <Section
            icon={GraduationCap}
            title="Student Information"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Detail
                label="Full Name"
                value={student.full_name}
              />

              <Detail
                label="Email"
                value={student.email}
              />

              <Detail
                label="Phone"
                value={student.phone}
              />

              <Detail
                label="Program"
                value={student.program}
              />

              <Detail
                label="Department"
                value={student.department}
              />

              <Detail
                label="Academic Year"
                value={student.academic_year}
              />

              <Detail
                label="Semester"
                value={student.semester}
              />

              <Detail
                label="Application Number"
                value={student.application_number}
              />

              <Detail
                label="Admission Number"
                value={student.admission_number}
              />

              <Detail
                label="Roll Number"
                value={student.roll_number}
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Student Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={student.status}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Admission Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      student.admission_status
                    }
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* =================================================
              Admission
          ================================================= */}

          <div className="mt-5">
            <Section
              icon={ClipboardList}
              title="Admission"
            >
              {loading ? (
                <LoadingLine />
              ) : admissions.length === 0 ? (
                <EmptyState
                  text="No admission record found."
                />
              ) : (
                <div className="space-y-4">
                  {admissions.map(
                    (admission, index) => (
                      <div
                        key={
                          admission.id ||
                          index
                        }
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <Detail
                            label="Application Number"
                            value={
                              admission.application_number ||
                              student.application_number
                            }
                          />

                          <Detail
                            label="Admission Number"
                            value={
                              admission.admission_number ||
                              student.admission_number
                            }
                          />

                          <Detail
                            label="Program"
                            value={
                              admission.program ||
                              student.program
                            }
                          />

                          <Detail
                            label="Admission Type"
                            value={
                              admission.admission_type
                            }
                          />

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Status
                            </p>

                            <div className="mt-2">
                              <StatusBadge
                                status={
                                  admission.status ||
                                  student.admission_status
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Eligibility
                            </p>

                            <div className="mt-2">
                              <StatusBadge
                                status={
                                  admission.eligibility_status
                                }
                              />
                            </div>
                          </div>

                          <Detail
                            label="Eligibility Reason"
                            value={
                              admission.eligibility_reason
                            }
                          />

                          <Detail
                            label="Remarks"
                            value={
                              admission.remarks
                            }
                          />

                          <Detail
                            label="Application Date"
                            value={
                              admission.application_date
                            }
                          />

                          <Detail
                            label="Reviewed At"
                            value={
                              admission.reviewed_at
                            }
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </Section>
          </div>

          {/* =================================================
              Documents
          ================================================= */}

          <div className="mt-5">
            <Section
              icon={FileCheck}
              title="Documents"
            >
              {loading ? (
                <LoadingLine />
              ) : documents.length === 0 ? (
                <EmptyState
                  text="No documents submitted."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Document
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          File
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Status
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Reason
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {documents.map(
                        (document, index) => (
                          <tr
                            key={
                              document.id ||
                              index
                            }
                          >
                            <td className="px-3 py-3 font-medium text-gray-900">
                              {formatValue(
                                document.document_type
                              )}
                            </td>

                            <td className="px-3 py-3 text-sm text-gray-600">
                              {formatValue(
                                document.original_filename ||
                                  document.filename
                              )}
                            </td>

                            <td className="px-3 py-3">
                              <StatusBadge
                                status={
                                  document.verification_status ||
                                  document.status
                                }
                              />
                            </td>

                            <td className="max-w-xs px-3 py-3 text-sm text-gray-600">
                              {formatValue(
                                document.verification_reason
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </div>

          {/* =================================================
              Fees
          ================================================= */}

          <div className="mt-5">
            <Section
              icon={CreditCard}
              title="Fees"
            >
              {loading ? (
                <LoadingLine />
              ) : fees.length === 0 ? (
                <EmptyState
                  text="No fee records found."
                />
              ) : (
                <div className="space-y-3">
                  {fees.map((fee, index) => (
                    <div
                      key={
                        fee.id || index
                      }
                      className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatValue(
                            fee.fee_type
                          )}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatValue(
                            fee.currency
                          )}{" "}
                          {formatValue(
                            fee.amount
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusBadge
                          status={
                            fee.status
                          }
                        />

                        {(fee.mandatory === true ||
                          fee.is_mandatory ===
                            true ||
                          String(
                            fee.mandatory
                          ).toLowerCase() ===
                            "true" ||
                          String(
                            fee.is_mandatory
                          ).toLowerCase() ===
                            "true") && (
                          <span className="text-xs font-medium text-gray-500">
                            Mandatory
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* =================================================
              Onboarding
          ================================================= */}

          <div className="mt-5">
            <Section
              icon={GraduationCap}
              title="Onboarding"
            >
              {loading ? (
                <LoadingLine />
              ) : onboardingTasks.length === 0 ? (
                <OnboardingSummary
                  summary={onboarding}
                />
              ) : (
                <div className="space-y-3">
                  {onboardingTasks.map(
                    (task, index) => (
                      <div
                        key={
                          task.id ||
                          index
                        }
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatValue(
                              task.task_name ||
                                task.name ||
                                task.task_type ||
                                task.type
                            )}
                          </p>

                          {task.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {
                                task.description
                              }
                            </p>
                          )}
                        </div>

                        <StatusBadge
                          status={
                            task.status
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Students Page
========================================================= */

function Students() {
  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadStudents = async () => {
    try {
      setRefreshing(true);

      const data = await getStudents();

      console.log(
        "Students API response:",
        data
      );

      const studentList =
        normalizeArray(
          data,
          [
            "students",
            "items",
            "results",
            "data",
          ]
        );

      setStudents(studentList);
    } catch (error) {
      console.error(
        "Failed to load students:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
          "Failed to load students."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter(
      (student) =>
        [
          student.full_name,
          student.email,
          student.application_number,
          student.admission_number,
          student.roll_number,
          student.program,
          student.department,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          )
    );
  }, [students, search]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

            <p className="text-sm text-gray-500">
              Loading students...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">
            <GraduationCap
              size={21}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Students
            </h1>

            <p className="mt-1 text-gray-500">
              Manage registered students in your organization.
            </p>
          </div>
        </div>

        <button
          onClick={loadStudents}
          disabled={refreshing}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Students
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900">
            {students.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active Students
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900">
            {
              students.filter(
                (student) =>
                  String(
                    student.status
                  ).toLowerCase() ===
                  "active"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Confirmed Admissions
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900">
            {
              students.filter(
                (student) =>
                  String(
                    student.admission_status
                  ).toLowerCase() ===
                  "confirmed"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by name, email, application, admission, roll number..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {filteredStudents.length ===
        0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <GraduationCap
                size={25}
                className="text-gray-500"
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No students found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {search
                ? "Try a different search term."
                : "There are no students in this organization yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Application
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Admission
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Roll No.
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Program
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map(
                  (student) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                            <GraduationCap
                              size={18}
                              className="text-gray-600"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {student.full_name ||
                                "—"}
                            </p>

                            <p className="truncate text-sm text-gray-500">
                              {student.email ||
                                "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 font-medium text-gray-900">
                        {student.application_number ||
                          "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 font-medium text-gray-900">
                        {student.admission_number ||
                          "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 font-medium text-gray-900">
                        {student.roll_number ||
                          "—"}
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-gray-900">
                          {student.program ||
                            "—"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {student.department ||
                            "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <div className="space-y-2">
                          <StatusBadge
                            status={
                              student.status
                            }
                          />

                          <div>
                            <StatusBadge
                              status={
                                student.admission_status
                              }
                            />
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            setSelectedStudent(
                              student
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-900 hover:text-white"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedStudent && (
        <StudentDetails
          student={selectedStudent}
          onClose={() =>
            setSelectedStudent(null)
          }
        />
      )}
    </Layout>
  );
}

export default Students;