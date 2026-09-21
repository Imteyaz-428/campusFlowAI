import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  User,
  Mail,
  Phone,
  BookOpen,
  CalendarDays,
  Hash,
  ShieldCheck,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  RefreshCw,
  ClipboardCheck,
} from "lucide-react";

import ApplicantLayout from "../../components/layout/ApplicantLayout";
import applicantApi from "../../services/applicantApi";



// HELPERS


const formatStatus = (status) => {
  if (!status) {
    return "Not Available";
  }

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};


const getStatusConfig = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("approved") ||
    normalized.includes("confirmed") ||
    normalized.includes("verified") ||
    normalized === "eligible" ||
    normalized === "paid" ||
    normalized === "completed"
  ) {
    return {
      label: formatStatus(status),
      className:
        "border-green-200 bg-green-50 text-green-700",
      icon: CheckCircle2,
    };
  }


  if (
    normalized.includes("rejected") ||
    normalized.includes("failed") ||
    normalized.includes("not_eligible") ||
    normalized.includes("not eligible")
  ) {
    return {
      label: formatStatus(status),
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    };
  }


  if (
    normalized.includes("pending") ||
    normalized.includes("submitted") ||
    normalized.includes("processing") ||
    normalized.includes("review_required") ||
    normalized.includes("incomplete") ||
    normalized.includes("in_progress")
  ) {
    return {
      label: formatStatus(status),
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
      icon: Clock3,
    };
  }


  return {
    label: formatStatus(status),
    className:
      "border-gray-200 bg-gray-50 text-gray-700",
    icon: AlertCircle,
  };
};


const getSimpleStatus = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("approved") ||
    normalized.includes("confirmed") ||
    normalized.includes("verified") ||
    normalized === "eligible" ||
    normalized === "paid" ||
    normalized === "completed"
  ) {
    return "completed";
  }


  if (
    normalized.includes("rejected") ||
    normalized.includes("failed") ||
    normalized.includes("not_eligible") ||
    normalized.includes("not eligible")
  ) {
    return "rejected";
  }


  return "pending";
};


const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN")}`;
};



// STATUS BADGE


function StatusBadge({
  status,
}) {
  const config = getStatusConfig(status);

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <Icon size={14} />

      {config.label}
    </span>
  );
}



// INFORMATION ROW


function InfoRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-4 border-b border-gray-100 py-4 last:border-b-0">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
          {value || "Not provided"}
        </p>

      </div>

    </div>
  );
}



// PROGRESS STEP


function ProgressStep({
  title,
  description,
  status,
  last = false,
}) {
  const isCompleted = status === "completed";
  const isRejected = status === "rejected";
  const isPending = status === "pending";

  return (
    <div className="relative flex gap-4">

      {!last && (
        <div
          className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-px ${
            isCompleted
              ? "bg-gray-900"
              : "bg-gray-200"
          }`}
        />
      )}


      <div
        className={`
          relative z-10 flex h-8 w-8 shrink-0
          items-center justify-center rounded-full border
          ${
            isCompleted
              ? "border-gray-900 bg-gray-900 text-white"
              : isRejected
              ? "border-red-300 bg-red-50 text-red-600"
              : "border-gray-300 bg-white text-gray-400"
          }
        `}
      >

        {isCompleted ? (
          <CheckCircle2 size={17} />
        ) : isRejected ? (
          <XCircle size={17} />
        ) : (
          <Clock3 size={16} />
        )}

      </div>


      <div className="pb-7">

        <p className="text-sm font-semibold text-gray-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>

      </div>

    </div>
  );
}



// APPLICATION PAGE


function ApplicantApplication() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ============================================================
  // LOAD APPLICATION
  // ============================================================

  const loadApplication = async () => {
    setLoading(true);
    setError("");

    try {
      /*
       * We intentionally reuse the existing applicant dashboard
       * endpoint.
       *
       * GET /campus/applicant/dashboard
       *
       * It already contains all information required for this page.
       */

      const response =
        await applicantApi.get(
          "/campus/applicant/dashboard"
        );

      setDashboard(response.data);

    } catch (err) {
      console.error(
        "Failed to load applicant application:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        localStorage.removeItem(
          "applicant_token"
        );

        navigate(
          "/applicant/login",
          {
            replace: true,
          }
        );

        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load your application."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadApplication();
  }, []);


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <ApplicantLayout>

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="text-center">

            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-gray-500"
            />

            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading your application...
            </p>

          </div>

        </div>

      </ApplicantLayout>
    );
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error || !dashboard) {
    return (
      <ApplicantLayout>

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">

              <AlertCircle
                size={24}
                className="text-red-600"
              />

            </div>


            <h1 className="mt-5 text-xl font-bold text-gray-900">
              Unable to Load Application
            </h1>


            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error ||
                "Something went wrong while loading your application."}
            </p>


            <button
              type="button"
              onClick={loadApplication}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <RefreshCw size={16} />

              Try Again
            </button>

          </div>

        </div>

      </ApplicantLayout>
    );
  }


  // ============================================================
  // DATA
  // ============================================================

  const student =
    dashboard.student || {};

  const application =
    dashboard.application || {};

  const documents = {
    required: Number(
      dashboard.documents?.required || 0
    ),

    submitted: Number(
      dashboard.documents?.submitted || 0
    ),

    missing: Number(
      dashboard.documents?.missing || 0
    ),

    verification_status:
      dashboard.documents
        ?.verification_status ||
      "not_started",
  };


  const fees = {
    total: Number(
      dashboard.fees?.total || 0
    ),

    paid: Number(
      dashboard.fees?.paid || 0
    ),

    pending: Number(
      dashboard.fees?.pending || 0
    ),

    mandatory_pending:
      Boolean(
        dashboard.fees?.mandatory_pending
      ),
  };


  // ============================================================
  // APPLICATION STATUS
  // ============================================================

  const applicationStatus =
    getSimpleStatus(
      application.status
    );


  const eligibilityStatus =
    getSimpleStatus(
      application.eligibility_status
    );


  const admissionStatus =
    getSimpleStatus(
      application.admission_status
    );


  const documentStatus =
    documents.missing === 0 &&
    documents.required > 0
      ? getSimpleStatus(
          documents.verification_status
        )
      : "pending";


  const feeStatus =
    !fees.mandatory_pending
      ? "completed"
      : "pending";


  // ============================================================
  // NEXT STEP
  // ============================================================

  const getNextStep = () => {

    if (
      applicationStatus ===
      "rejected"
    ) {
      return {
        title: "Application requires attention",
        description:
          "Your application has been rejected. Please contact the college admission office for further information.",
        action: null,
      };
    }


    if (
      eligibilityStatus ===
      "rejected"
    ) {
      return {
        title: "Eligibility decision recorded",
        description:
          application.eligibility_reason ||
          "Your application was found not eligible based on the admission review.",
        action: null,
      };
    }


    if (
      documents.missing > 0
    ) {
      return {
        title: "Complete your documents",
        description:
          `${documents.missing} required document${
            documents.missing > 1
              ? "s"
              : ""
          } ${
            documents.missing > 1
              ? "are"
              : "is"
          } still missing.`,
        action: {
          label: "Manage Documents",
          to: "/applicant/documents",
        },
      };
    }


    if (
      fees.mandatory_pending
    ) {
      return {
        title: "Mandatory fee is pending",
        description:
          `${formatCurrency(
            fees.pending
          )} is currently pending. Follow the instructions provided by your college for fee payment.`,
        action: null,
      };
    }


    if (
      application.admission_status ===
      "confirmed"
    ) {
      return {
        title: "Admission confirmed",
        description:
          "Your admission has been confirmed. You can continue with the student onboarding process.",
        action: null,
      };
    }


    if (
      application.eligibility_status ===
      "eligible"
    ) {
      return {
        title: "Eligibility approved",
        description:
          "Your eligibility has been approved. Your application is progressing through the admission workflow.",
        action: null,
      };
    }


    return {
      title: "Application is under review",
      description:
        "Your application is being processed. Check this page regularly for status updates.",
      action: null,
    };
  };


  const nextStep =
    getNextStep();


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <ApplicantLayout>

      <div className="mx-auto max-w-6xl space-y-6">

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div>

          <Link
            to="/applicant/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={16} />

            Back to Dashboard
          </Link>


          <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Applicant Portal
              </p>


              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                My Application
              </h1>


              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                View your submitted application,
                eligibility review, admission status,
                and current requirements.
              </p>

            </div>


            <button
              type="button"
              onClick={loadApplication}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >

              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

          </div>

        </div>


        {/* ====================================================
            APPLICATION OVERVIEW
        ===================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900">

                <ClipboardCheck
                  size={23}
                  className="text-white"
                />

              </div>


              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Application Number
                </p>


                <h2 className="mt-1 break-all text-2xl font-bold tracking-wide text-gray-900">
                  {application.application_number ||
                    "Not Available"}
                </h2>


                <p className="mt-2 text-sm text-gray-500">
                  Your application identifier for admission-related communication.
                </p>

              </div>

            </div>


            <div className="flex flex-wrap gap-2">

              <StatusBadge
                status={
                  application.status
                }
              />

              <StatusBadge
                status={
                  application.eligibility_status
                }
              />

              <StatusBadge
                status={
                  application.admission_status
                }
              />

            </div>

          </div>

        </section>


        {/* ====================================================
            STATUS SUMMARY
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <SummaryCard
            icon={
              <FileText
                size={19}
                className="text-blue-600"
              />
            }
            iconClass="bg-blue-50"
            label="Application Status"
            value={formatStatus(
              application.status
            )}
          />


          <SummaryCard
            icon={
              <ShieldCheck
                size={19}
                className="text-purple-600"
              />
            }
            iconClass="bg-purple-50"
            label="Eligibility"
            value={formatStatus(
              application.eligibility_status
            )}
          />


          <SummaryCard
            icon={
              <GraduationCap
                size={19}
                className="text-green-600"
              />
            }
            iconClass="bg-green-50"
            label="Admission"
            value={formatStatus(
              application.admission_status
            )}
          />

        </div>


        {/* ====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ==================================================
              APPLICANT INFORMATION
          =================================================== */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">

                <User
                  size={19}
                  className="text-gray-700"
                />

              </div>


              <div>

                <h2 className="font-bold text-gray-900">
                  Applicant Information
                </h2>

                <p className="text-xs text-gray-500">
                  Information submitted with your application.
                </p>

              </div>

            </div>


            <div className="mt-5">

              <InfoRow
                icon={<User size={17} />}
                label="Full Name"
                value={student.full_name}
              />

              <InfoRow
                icon={<Mail size={17} />}
                label="Email"
                value={student.email}
              />

              <InfoRow
                icon={<Phone size={17} />}
                label="Phone"
                value={student.phone}
              />

              <InfoRow
                icon={<BookOpen size={17} />}
                label="Program"
                value={student.program}
              />

              <InfoRow
                icon={<GraduationCap size={17} />}
                label="Department"
                value={student.department}
              />

              <InfoRow
                icon={<CalendarDays size={17} />}
                label="Academic Year"
                value={student.academic_year}
              />

              <InfoRow
                icon={<Hash size={17} />}
                label="Semester"
                value={student.semester}
              />

            </div>

          </section>


          {/* ==================================================
              ADMISSION IDENTIFIERS
          =================================================== */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">

                <GraduationCap
                  size={19}
                  className="text-gray-700"
                />

              </div>


              <div>

                <h2 className="font-bold text-gray-900">
                  Admission Information
                </h2>

                <p className="text-xs text-gray-500">
                  Campus identifiers assigned during the admission process.
                </p>

              </div>

            </div>


            <div className="mt-5">

              <InfoRow
                icon={<Hash size={17} />}
                label="Application Number"
                value={
                  application.application_number
                }
              />

              <InfoRow
                icon={<Hash size={17} />}
                label="Admission Number"
                value={
                  application.admission_number ||
                  "Not assigned yet"
                }
              />

              <InfoRow
                icon={<Hash size={17} />}
                label="Roll Number"
                value={
                  application.roll_number ||
                  "Not assigned yet"
                }
              />

              <InfoRow
                icon={<BookOpen size={17} />}
                label="Program"
                value={student.program}
              />

              <InfoRow
                icon={<ShieldCheck size={17} />}
                label="Admission Status"
                value={formatStatus(
                  application.admission_status
                )}
              />

            </div>

          </section>

        </div>


        {/* ====================================================
            ELIGIBILITY
        ===================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50">

                <ShieldCheck
                  size={21}
                  className="text-purple-600"
                />

              </div>


              <div>

                <h2 className="font-bold text-gray-900">
                  Eligibility Review
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review the current eligibility decision for your application.
                </p>

              </div>

            </div>


            <StatusBadge
              status={
                application.eligibility_status
              }
            />

          </div>


          <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Review Result
            </p>


            <p className="mt-2 text-lg font-bold text-gray-900">
              {formatStatus(
                application.eligibility_status
              )}
            </p>


            <div className="mt-4">

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Reason
              </p>


              <p className="mt-2 text-sm leading-6 text-gray-600">

                {application.eligibility_reason ||
                  "No eligibility reason has been recorded yet. Your application may still be under review."}

              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            APPLICATION PROGRESS
        ===================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">

              <ClipboardCheck
                size={19}
                className="text-white"
              />

            </div>


            <div>

              <h2 className="font-bold text-gray-900">
                Admission Progress
              </h2>

              <p className="text-xs text-gray-500">
                Track the major stages of your application.
              </p>

            </div>

          </div>


          <div className="mt-7">

            <ProgressStep
              title="Application Submitted"
              description={
                application.status
                  ? `Current application status: ${formatStatus(
                      application.status
                    )}.`
                  : "Application information received."
              }
              status={
                applicationStatus
              }
            />


            <ProgressStep
              title="Eligibility Review"
              description={
                application.eligibility_status
                  ? `Eligibility status: ${formatStatus(
                      application.eligibility_status
                    )}.`
                  : "Eligibility review has not been completed."
              }
              status={
                eligibilityStatus
              }
            />


            <ProgressStep
              title="Document Submission"
              description={
                documents.missing > 0
                  ? `${documents.submitted} of ${documents.required} required documents submitted.`
                  : documents.required > 0
                  ? "All required documents have been submitted."
                  : "No document requirement information is available."
              }
              status={
                documentStatus
              }
            />


            <ProgressStep
              title="Fee Requirement"
              description={
                fees.mandatory_pending
                  ? `${formatCurrency(
                      fees.pending
                    )} is currently pending.`
                  : "No mandatory fee is currently pending."
              }
              status={
                feeStatus
              }
            />


            <ProgressStep
              title="Admission Decision"
              description={
                application.admission_status
                  ? `Admission status: ${formatStatus(
                      application.admission_status
                    )}.`
                  : "Admission decision is pending."
              }
              status={
                admissionStatus
              }
              last
            />

          </div>

        </section>


        {/* ====================================================
            DOCUMENT + FEE SNAPSHOT
        ===================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Documents */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">

                  <FileText
                    size={19}
                    className="text-amber-600"
                  />

                </div>


                <div>

                  <h2 className="font-bold text-gray-900">
                    Documents
                  </h2>

                  <p className="text-xs text-gray-500">
                    Required admission documents.
                  </p>

                </div>

              </div>


              <Link
                to="/applicant/documents"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:underline"
              >
                Manage
                <ArrowRight size={15} />
              </Link>

            </div>


            <div className="mt-5">

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-2xl font-bold text-gray-900">
                    {documents.submitted}
                    <span className="text-base font-medium text-gray-400">
                      {" "}
                      / {documents.required}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Documents submitted
                  </p>

                </div>


                <StatusBadge
                  status={
                    documents.verification_status
                  }
                />

              </div>


              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="h-full rounded-full bg-gray-900 transition-all duration-500"
                  style={{
                    width:
                      documents.required > 0
                        ? `${Math.min(
                            100,
                            Math.round(
                              (documents.submitted /
                                documents.required) *
                                100
                            )
                          )}%`
                        : "0%",
                  }}
                />

              </div>


              <p className="mt-2 text-xs text-gray-500">

                {documents.missing > 0
                  ? `${documents.missing} required document${
                      documents.missing > 1
                        ? "s"
                        : ""
                    } remaining.`
                  : "All required documents submitted."}

              </p>

            </div>

          </section>


          {/* Fees */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">

                <CreditCard
                  size={19}
                  className="text-green-600"
                />

              </div>


              <div>

                <h2 className="font-bold text-gray-900">
                  Fee Summary
                </h2>

                <p className="text-xs text-gray-500">
                  Current recorded admission fees.
                </p>

              </div>

            </div>


            <div className="mt-5 grid grid-cols-3 gap-3">

              <FeeItem
                label="Total"
                value={formatCurrency(
                  fees.total
                )}
              />

              <FeeItem
                label="Paid"
                value={formatCurrency(
                  fees.paid
                )}
                valueClass="text-green-700"
              />

              <FeeItem
                label="Pending"
                value={formatCurrency(
                  fees.pending
                )}
                valueClass="text-amber-700"
              />

            </div>


            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">

              <div className="flex items-center gap-2">

                {fees.mandatory_pending ? (
                  <Clock3
                    size={16}
                    className="text-amber-600"
                  />
                ) : (
                  <CheckCircle2
                    size={16}
                    className="text-green-600"
                  />
                )}


                <p className="text-sm font-semibold text-gray-900">

                  {fees.mandatory_pending
                    ? "Mandatory fee pending"
                    : "No mandatory fee pending"}

                </p>

              </div>


              <p className="mt-1 text-xs leading-5 text-gray-500">

                {fees.mandatory_pending
                  ? "Complete the required fee payment according to your college's payment instructions."
                  : "There is currently no mandatory unpaid fee recorded for your application."}

              </p>

            </div>

          </section>

        </div>


        {/* ====================================================
            NEXT STEP
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 p-6 text-white shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">

                <AlertCircle size={21} />

              </div>


              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Current Next Step
                </p>


                <h2 className="mt-1 text-lg font-bold">
                  {nextStep.title}
                </h2>


                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-300">
                  {nextStep.description}
                </p>

              </div>

            </div>


            {nextStep.action && (
              <Link
                to={nextStep.action.to}
                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                {nextStep.action.label}

                <ArrowRight size={16} />
              </Link>
            )}

          </div>

        </section>


        {/* ====================================================
            QUICK LINKS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <Link
            to="/applicant/documents"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">

                <FileText
                  size={19}
                  className="text-gray-700"
                />

              </div>


              <ArrowRight
                size={17}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-900"
              />

            </div>


            <h3 className="mt-4 font-bold text-gray-900">
              Manage Documents
            </h3>


            <p className="mt-1 text-sm text-gray-500">
              Upload missing documents and check verification status.
            </p>

          </Link>


          <Link
            to="/applicant/chat"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">

                <GraduationCap
                  size={19}
                  className="text-gray-700"
                />

              </div>


              <ArrowRight
                size={17}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-900"
              />

            </div>


            <h3 className="mt-4 font-bold text-gray-900">
              Ask CampusFlow AI
            </h3>


            <p className="mt-1 text-sm text-gray-500">
              Ask about your admission, documents, fees, or college information.
            </p>

          </Link>

        </div>

      </div>

    </ApplicantLayout>
  );
}



// SUMMARY CARD


function SummaryCard({
  icon,
  iconClass,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>


      <p className="mt-4 text-sm font-medium text-gray-500">
        {label}
      </p>


      <p className="mt-1 truncate text-lg font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}



// FEE ITEM


function FeeItem({
  label,
  value,
  valueClass = "text-gray-900",
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">

      <p className="text-xs font-medium text-gray-400">
        {label}
      </p>


      <p
        className={`mt-1 text-sm font-bold ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}


export default ApplicantApplication;