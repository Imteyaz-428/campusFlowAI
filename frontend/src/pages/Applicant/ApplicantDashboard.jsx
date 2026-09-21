import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  GraduationCap,
  User,
  FileText,
  CreditCard,
  AlertCircle,
  ArrowRight,
  LogOut,
  RefreshCw,
  Bot,
  ShieldCheck,
  ClipboardCheck,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";

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


const getStatusStyle = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("approved") ||
    normalized.includes("confirmed") ||
    normalized.includes("verified") ||
    normalized.includes("completed") ||
    normalized === "paid"
  ) {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (
    normalized.includes("rejected") ||
    normalized.includes("failed") ||
    normalized.includes("cancelled")
  ) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("submitted") ||
    normalized.includes("processing") ||
    normalized.includes("incomplete") ||
    normalized.includes("in_progress")
  ) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
};


const getStatusTextStyle = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("approved") ||
    normalized.includes("confirmed") ||
    normalized.includes("verified") ||
    normalized.includes("completed") ||
    normalized === "paid"
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    normalized.includes("rejected") ||
    normalized.includes("failed") ||
    normalized.includes("cancelled")
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("submitted") ||
    normalized.includes("processing") ||
    normalized.includes("incomplete") ||
    normalized.includes("in_progress")
  ) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-gray-50 text-gray-700";
};


const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN")}`;
};



// SIDEBAR


function ApplicantSidebar({
  active = "dashboard",
  onLogout,
}) {
  const navigate = useNavigate();

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/applicant/dashboard",
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      path: "/applicant/documents",
    },
    {
      id: "assistant",
      label: "AI Assistant",
      icon: Bot,
      path: "/applicant/chat",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[212px] flex-col border-r border-gray-200 bg-white">

      {/* ======================================================
          BRAND
      ======================================================= */}

      <div className="border-b border-gray-200 px-4 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
            <GraduationCap
              size={19}
              className="text-white"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              CampusFlow AI
            </p>

            <p className="text-[15px] font-bold text-gray-900">
              Applicant Portal
            </p>
          </div>

        </div>

      </div>


      {/* ======================================================
          NAVIGATION
      ======================================================= */}

      <div className="px-2.5 pt-5">

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Portal
        </p>


        <nav className="space-y-1">

          {navigation.map((item) => {

            const Icon = item.icon;

            const isActive =
              active === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={17} />

                <span>
                  {item.label}
                </span>
              </button>
            );
          })}

        </nav>

      </div>


      {/* ======================================================
          BOTTOM ACCOUNT
      ======================================================= */}

      <div className="mt-auto border-t border-gray-200 p-2.5">

        <div className="mb-2 rounded-xl bg-gray-50 px-3 py-3">

          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Account Type
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-900">
            Applicant
          </p>

        </div>


        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut size={17} />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}



// COMPONENT


function ApplicantDashboard() {

  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  const loadDashboard = async () => {

    setLoading(true);
    setError("");

    try {

      const response = await applicantApi.get(
        "/campus/applicant/dashboard"
      );

      setDashboard(response.data);

    } catch (err) {

      console.error(
        "Failed to load applicant dashboard:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
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
          "Unable to load your application dashboard."
      );

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadDashboard();

  }, []);


  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "applicant_token"
    );

    localStorage.removeItem(
      "applicant_application_number"
    );

    localStorage.removeItem(
      "applicant_organization_slug"
    );

    navigate(
      "/applicant/login",
      {
        replace: true,
      }
    );
  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-50">

        <ApplicantSidebar
          active="dashboard"
          onLogout={handleLogout}
        />


        <main className="ml-[212px] flex min-h-screen items-center justify-center">

          <div className="text-center">

            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-gray-700"
            />

            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading your application...
            </p>

          </div>

        </main>

      </div>
    );
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error || !dashboard) {

    return (
      <div className="min-h-screen bg-gray-50">

        <ApplicantSidebar
          active="dashboard"
          onLogout={handleLogout}
        />


        <main className="ml-[212px] flex min-h-screen items-center justify-center px-6">

          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">

              <AlertCircle
                size={24}
                className="text-red-600"
              />

            </div>


            <h1 className="mt-5 text-xl font-bold text-gray-900">
              Unable to Load Dashboard
            </h1>


            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error ||
                "Something went wrong while loading your application."}
            </p>


            <button
              type="button"
              onClick={loadDashboard}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <RefreshCw size={16} />

              Try Again
            </button>

          </div>

        </main>

      </div>
    );
  }


  // ============================================================
  // SAFE DATA
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
  };


  // ============================================================
  // ADMISSION MESSAGE
  // ============================================================

  const getAdmissionMessage = () => {

    const status = String(
      application.admission_status || ""
    ).toLowerCase();

    const eligibility = String(
      application.eligibility_status || ""
    ).toLowerCase();


    if (
      status.includes("confirmed")
    ) {

      return "Your admission has been confirmed.";

    }


    if (
      status.includes("approved")
    ) {

      return "Your admission has been approved. Complete the remaining requirements.";

    }


    if (
      eligibility.includes("rejected") ||
      eligibility.includes("failed")
    ) {

      return "Your application requires attention regarding eligibility.";

    }


    if (
      status.includes("submitted") ||
      status.includes("pending") ||
      status.includes("processing")
    ) {

      return "Your application is currently being processed.";

    }


    return "Track your application progress and complete the required steps.";
  };


  // ============================================================
  // DOCUMENT PROGRESS
  // ============================================================

  const documentPercentage =
    documents.required > 0
      ? Math.min(
          100,
          Math.round(
            (documents.submitted /
              documents.required) *
              100
          )
        )
      : 0;


  // ============================================================
  // FEE PROGRESS
  // ============================================================

  const feePercentage =
    fees.total > 0
      ? Math.min(
          100,
          Math.round(
            (fees.paid /
              fees.total) *
              100
          )
        )
      : 0;


  // ============================================================
  // FIRST NAME
  // ============================================================

  const firstName =
    String(
      student.full_name ||
        "Applicant"
    )
      .trim()
      .split(/\s+/)[0];


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ======================================================
          SIDEBAR
      ======================================================= */}

      <ApplicantSidebar
        active="dashboard"
        onLogout={handleLogout}
      />


      {/* ======================================================
          MAIN CONTENT
      ======================================================= */}

      <main className="ml-[212px] min-h-screen">

        {/* ==================================================
            TOP BAR
        =================================================== */}

        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">

          <div className="flex items-center justify-between px-6 py-4 lg:px-8">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Applicant Dashboard
              </p>

              <p className="mt-0.5 text-sm font-medium text-gray-600">
                Track your admission application
              </p>

            </div>


            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">

                <p className="text-sm font-semibold text-gray-900">
                  {student.full_name ||
                    "Applicant"}
                </p>

                <p className="text-xs text-gray-500">
                  Applicant
                </p>

              </div>


              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">

                <User
                  size={17}
                  className="text-gray-600"
                />

              </div>

            </div>

          </div>

        </header>


        {/* ==================================================
            PAGE
        =================================================== */}

        <div className="mx-auto max-w-[1400px] px-6 py-7 lg:px-8">


          {/* ==================================================
              WELCOME
          =================================================== */}

          <div className="mb-7">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

              <div>

                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Welcome, {firstName} 👋
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                  Track your admission application,
                  documents, fees, and remaining
                  requirements from one place.
                </p>

              </div>


              {/* APPLICATION NUMBER */}

              <div className="w-fit rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm">

                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Application Number
                </p>

                <p className="mt-1 text-lg font-bold tracking-wide text-gray-900">
                  {application.application_number ||
                    "Not Available"}
                </p>

              </div>

            </div>

          </div>


          {/* ==================================================
              ADMISSION STATUS
          =================================================== */}

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900">

                  <ShieldCheck
                    size={23}
                    className="text-white"
                  />

                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Admission Status
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {formatStatus(
                      application.admission_status
                    )}
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                    {getAdmissionMessage()}
                  </p>

                </div>

              </div>


              <span
                className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                  application.admission_status
                )}`}
              >
                {formatStatus(
                  application.admission_status
                )}
              </span>

            </div>

          </section>


          {/* ==================================================
              STATUS CARDS
          =================================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">


            {/* APPLICATION */}

            <StatusCard
              icon={
                <FileText
                  size={19}
                  className="text-blue-600"
                />
              }
              iconClass="bg-blue-50"
              title="Application"
              value={formatStatus(
                application.status
              )}
              status={formatStatus(
                application.status
              )}
              statusClass={getStatusStyle(
                application.status
              )}
            />


            {/* ELIGIBILITY */}

            <StatusCard
              icon={
                <ShieldCheck
                  size={19}
                  className="text-purple-600"
                />
              }
              iconClass="bg-purple-50"
              title="Eligibility"
              value={formatStatus(
                application.eligibility_status
              )}
              status={formatStatus(
                application.eligibility_status
              )}
              statusClass={getStatusStyle(
                application.eligibility_status
              )}
            />


            {/* DOCUMENTS */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">

                  <FileText
                    size={19}
                    className="text-amber-600"
                  />

                </div>


                <span className="text-sm font-bold text-gray-900">
                  {documents.submitted}/
                  {documents.required}
                </span>

              </div>


              <p className="mt-5 text-sm font-medium text-gray-500">
                Documents
              </p>


              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="h-full rounded-full bg-gray-900 transition-all duration-500"
                  style={{
                    width: `${documentPercentage}%`,
                  }}
                />

              </div>


              <p className="mt-2 text-xs text-gray-500">
                {documents.missing > 0
                  ? `${documents.missing} document${
                      documents.missing > 1
                        ? "s"
                        : ""
                    } remaining`
                  : "All required documents submitted"}
              </p>

            </div>

          </div>


          {/* ==================================================
              CONTENT GRID
          =================================================== */}

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">


            {/* =================================================
                APPLICATION DETAILS
            ================================================== */}

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
                    Application Details
                  </h2>

                  <p className="text-xs text-gray-500">
                    Information submitted with your application.
                  </p>

                </div>

              </div>


              <div className="mt-6 divide-y divide-gray-100">

                <DetailRow
                  label="Full Name"
                  value={
                    student.full_name ||
                    "Not provided"
                  }
                />

                <DetailRow
                  label="Email"
                  value={
                    student.email ||
                    "Not provided"
                  }
                />

                <DetailRow
                  label="Phone"
                  value={
                    student.phone ||
                    "Not provided"
                  }
                />

                <DetailRow
                  label="Program"
                  value={
                    student.program ||
                    "Not specified"
                  }
                />

                <DetailRow
                  label="Department"
                  value={
                    student.department ||
                    "Not specified"
                  }
                />

                <DetailRow
                  label="Academic Year"
                  value={
                    student.academic_year ||
                    "Not specified"
                  }
                />

                <DetailRow
                  label="Semester"
                  value={
                    student.semester ||
                    "Not specified"
                  }
                />


                {application.admission_number && (
                  <DetailRow
                    label="Admission Number"
                    value={
                      application.admission_number
                    }
                  />
                )}


                {application.roll_number && (
                  <DetailRow
                    label="Roll Number"
                    value={
                      application.roll_number
                    }
                  />
                )}

              </div>

            </section>


            {/* =================================================
                REQUIRED ACTIONS
            ================================================== */}

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
                    Required Actions
                  </h2>

                  <p className="text-xs text-gray-500">
                    Complete the remaining admission requirements.
                  </p>

                </div>

              </div>


              <div className="mt-6 space-y-3">


                {/* DOCUMENTS */}

                <ActionLink
                  to="/applicant/documents"
                  icon={
                    <FileText size={17} />
                  }
                  title="Complete Documents"
                  description={
                    documents.missing > 0
                      ? `${documents.missing} required document${
                          documents.missing > 1
                            ? "s"
                            : ""
                        } remaining`
                      : "All required documents submitted"
                  }
                  status={
                    documents.missing > 0
                      ? "Pending"
                      : "Completed"
                  }
                  statusClass={
                    documents.missing > 0
                      ? "bg-amber-50 text-amber-700"
                      : "bg-green-50 text-green-700"
                  }
                />


                {/* FEES */}

                <ActionLink
                  to="/applicant/fees"
                  icon={
                    <CreditCard size={17} />
                  }
                  title="Admission Fee"
                  description={
                    fees.pending > 0
                      ? `${formatCurrency(
                          fees.pending
                        )} pending`
                      : "No pending fee"
                  }
                  status={
                    fees.pending > 0
                      ? "Pending"
                      : "Completed"
                  }
                  statusClass={
                    fees.pending > 0
                      ? "bg-amber-50 text-amber-700"
                      : "bg-green-50 text-green-700"
                  }
                />


                {/* AI ASSISTANT */}

                <ActionLink
                  to="/applicant/chat"
                  icon={
                    <Bot size={17} />
                  }
                  title="CampusFlow AI"
                  description="Ask about your application, documents, and admission."
                  status="Available"
                  statusClass="bg-blue-50 text-blue-700"
                />

              </div>

            </section>

          </div>


          {/* ==================================================
              FEE STATUS
          =================================================== */}

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">

                  <CreditCard
                    size={19}
                    className="text-green-600"
                  />

                </div>


                <div>

                  <h2 className="font-bold text-gray-900">
                    Fee Status
                  </h2>

                  <p className="text-xs text-gray-500">
                    Track your admission fee payment.
                  </p>

                </div>

              </div>


              <Link
                to="/applicant/fees"
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-gray-900 transition hover:underline"
              >
                View Fee Details

                <ArrowRight size={15} />

              </Link>

            </div>


            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

              <FeeStat
                label="Total"
                value={formatCurrency(
                  fees.total
                )}
              />

              <FeeStat
                label="Paid"
                value={formatCurrency(
                  fees.paid
                )}
                valueClass="text-green-700"
              />

              <FeeStat
                label="Pending"
                value={formatCurrency(
                  fees.pending
                )}
                valueClass="text-amber-700"
              />

            </div>


            <div className="mt-5">

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="h-full rounded-full bg-gray-900 transition-all duration-500"
                  style={{
                    width: `${feePercentage}%`,
                  }}
                />

              </div>


              <div className="mt-2 flex items-center justify-between gap-4">

                <p className="text-xs text-gray-500">
                  {feePercentage}% of recorded fees paid
                </p>


                {fees.pending > 0 && (
                  <p className="text-xs font-semibold text-amber-700">
                    {formatCurrency(
                      fees.pending
                    )}{" "}
                    remaining
                  </p>
                )}

              </div>

            </div>

          </section>


          {/* ==================================================
              AI ASSISTANT BANNER
          =================================================== */}

          <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 p-6 text-white shadow-sm">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">

                  <Bot size={22} />

                </div>


                <div>

                  <h2 className="text-lg font-bold">
                    CampusFlow AI
                  </h2>


                  <p className="mt-1 max-w-xl text-sm leading-6 text-gray-300">
                    Ask questions about your
                    application, required documents,
                    admission status, or fees.
                  </p>

                </div>

              </div>


              <Link
                to="/applicant/chat"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Ask CampusFlow AI

                <ArrowRight size={16} />

              </Link>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}



// STATUS CARD


function StatusCard({
  icon,
  iconClass,
  title,
  value,
  status,
  statusClass,
}) {

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>


        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}
        >
          {status}
        </span>

      </div>


      <p className="mt-5 text-sm font-medium text-gray-500">
        {title}
      </p>


      <p className="mt-1 truncate text-lg font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}



// DETAIL ROW


function DetailRow({
  label,
  value,
}) {

  return (
    <div className="flex items-center justify-between gap-5 py-3">

      <span className="text-sm text-gray-500">
        {label}
      </span>


      <span className="max-w-[60%] break-words text-right text-sm font-semibold text-gray-900">
        {value}
      </span>

    </div>
  );
}



// ACTION LINK


function ActionLink({
  to,
  icon,
  title,
  description,
  status,
  statusClass,
}) {

  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-gray-200 hover:bg-gray-50"
    >

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600 transition group-hover:bg-white">
        {icon}
      </div>


      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-gray-900">
          {title}
        </p>


        <p className="mt-0.5 truncate text-xs text-gray-500">
          {description}
        </p>

      </div>


      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
      >
        {status}
      </span>


      <ArrowRight
        size={15}
        className="hidden shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700 sm:block"
      />

    </Link>
  );
}



// FEE STAT


function FeeStat({
  label,
  value,
  valueClass = "text-gray-900",
}) {

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

      <p className="text-xs font-medium text-gray-400">
        {label}
      </p>


      <p
        className={`mt-1 text-lg font-bold ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}


export default ApplicantDashboard;