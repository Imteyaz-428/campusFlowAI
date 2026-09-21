import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  GraduationCap,
  BookOpen,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock3,
  CircleDashed,
  ClipboardList,
  ArrowRight,
  RefreshCw,
  User,
  AlertCircle,
  Ticket,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";

import Layout from "../../components/layout/Layout";

import { getMyStudentProfile } from "../../services/student";

import {
  getMyOnboardingTasks,
  getMyOnboardingSummary,
  getMyNextOnboardingAction,
} from "../../services/onboarding";

import { getMyFees } from "../../services/fee";


/* =========================================================
   Helpers
========================================================= */

function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return String(value);
}


function formatStatus(value) {
  return String(value || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}


/* =========================================================
   Status Badge
========================================================= */

function StatusBadge({ status }) {
  const value = normalizeStatus(status);

  let classes = "bg-gray-100 text-gray-600";

  if (
    [
      "active",
      "confirmed",
      "approved",
      "eligible",
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
      "waiting_for_student",
    ].includes(value)
  ) {
    classes = "bg-yellow-100 text-yellow-700";
  }

  if (
    [
      "rejected",
      "inactive",
      "failed",
      "not_eligible",
      "action_required",
      "cancelled",
      "closed",
    ].includes(value)
  ) {
    classes = "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {formatStatus(value || "unknown")}
    </span>
  );
}


/* =========================================================
   Stat Card
========================================================= */

function StatCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 break-words text-2xl font-bold text-gray-900">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-gray-500">
              {description}
            </p>
          )}

        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
          <Icon
            size={19}
            className="text-gray-700"
          />
        </div>

      </div>
    </div>
  );
}


/* =========================================================
   Quick Action
========================================================= */

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:border-gray-300 hover:bg-gray-50"
    >

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <Icon
            size={18}
            className="text-gray-700"
          />
        </div>

        <div className="min-w-0">

          <p className="text-sm font-semibold text-gray-900">
            {title}
          </p>

          {description && (
            <p className="mt-0.5 text-xs text-gray-500">
              {description}
            </p>
          )}

        </div>

      </div>

      <ArrowRight
        size={16}
        className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700"
      />

    </Link>
  );
}


/* =========================================================
   Student Dashboard
========================================================= */

function StudentDashboard() {

  const navigate = useNavigate();

  const [student, setStudent] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [nextAction, setNextAction] = useState(null);

  const [fees, setFees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");


  /* =========================================================
     Load Dashboard
  ========================================================= */

  const loadDashboard = async () => {

    try {

      setError("");
      setRefreshing(true);

      /*
       * Load everything together.
       *
       * This is faster than loading fees after the
       * onboarding requests finish.
       */

      const results = await Promise.allSettled([
        getMyStudentProfile(),
        getMyOnboardingTasks(),
        getMyOnboardingSummary(),
        getMyNextOnboardingAction(),
        getMyFees(),
      ]);


      const [
        studentResult,
        tasksResult,
        summaryResult,
        nextActionResult,
        feesResult,
      ] = results;


      /* =====================================================
         Student Profile
      ===================================================== */

      if (studentResult.status === "fulfilled") {

        const studentData =
          studentResult.value?.data ??
          studentResult.value;

        setStudent(studentData || null);

      } else {

        const response =
          studentResult.reason?.response;

        if (response?.status === 401) {

          localStorage.removeItem("token");

          navigate("/", {
            replace: true,
          });

          return;
        }

        throw studentResult.reason;
      }


      /* =====================================================
         Onboarding Tasks
      ===================================================== */

      if (tasksResult.status === "fulfilled") {

        const taskData =
          tasksResult.value?.data ??
          tasksResult.value;

        setTasks(
          Array.isArray(taskData)
            ? taskData
            : []
        );

      } else {

        console.error(
          "Failed to load onboarding tasks:",
          tasksResult.reason
        );

        /*
         * Don't destroy existing data during refresh
         * if a secondary request fails.
         */

        if (loading) {
          setTasks([]);
        }
      }


      /* =====================================================
         Onboarding Summary
      ===================================================== */

      if (summaryResult.status === "fulfilled") {

        const summaryData =
          summaryResult.value?.data ??
          summaryResult.value;

        setSummary(
          summaryData || null
        );

      } else {

        console.error(
          "Failed to load onboarding summary:",
          summaryResult.reason
        );

        if (loading) {
          setSummary(null);
        }
      }


      /* =====================================================
         Next Action
      ===================================================== */

      if (
        nextActionResult.status ===
        "fulfilled"
      ) {

        const nextActionData =
          nextActionResult.value?.data ??
          nextActionResult.value;

        setNextAction(
          nextActionData || null
        );

      } else {

        console.error(
          "Failed to load next onboarding action:",
          nextActionResult.reason
        );

        if (loading) {
          setNextAction(null);
        }
      }


      /* =====================================================
         Fees
      ===================================================== */

      if (
        feesResult.status ===
        "fulfilled"
      ) {

        const feeData =
          feesResult.value?.data ??
          feesResult.value;

        if (Array.isArray(feeData)) {

          setFees(feeData);

        } else if (
          Array.isArray(feeData?.fees)
        ) {

          setFees(feeData.fees);

        } else if (
          Array.isArray(feeData?.items)
        ) {

          setFees(feeData.items);

        } else {

          if (loading) {
            setFees([]);
          }
        }

      } else {

        console.error(
          "Failed to load fees:",
          feesResult.reason
        );

        /*
         * Keep previously loaded fees during refresh.
         */

        if (loading) {
          setFees([]);
        }
      }

    } catch (err) {

      console.error(
        "Failed to load student dashboard:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to load student dashboard.";

      setError(message);

      toast.error(message);

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  useEffect(() => {

    loadDashboard();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /* =========================================================
     Logout
  ========================================================= */

  const handleLogout = () => {

    localStorage.removeItem("token");

    navigate("/", {
      replace: true,
    });

  };


  /* =========================================================
     Fee Calculations
  ========================================================= */

  const totalFees = useMemo(() => {

    return fees.reduce(
      (total, fee) =>
        total + Number(fee?.amount || 0),
      0
    );

  }, [fees]);


  const paidFees = useMemo(() => {

    return fees
      .filter(
        (fee) =>
          normalizeStatus(fee?.status) ===
          "paid"
      )
      .reduce(
        (total, fee) =>
          total + Number(fee?.amount || 0),
        0
      );

  }, [fees]);


  const pendingFees = useMemo(() => {

    return Math.max(
      0,
      totalFees - paidFees
    );

  }, [totalFees, paidFees]);


  /* =========================================================
     Onboarding
  ========================================================= */

  const onboardingProgress = Math.min(
    100,
    Math.max(
      0,
      Number(
        summary?.progress_percentage || 0
      )
    )
  );


  const completedTasks = Number(
    summary?.completed_tasks || 0
  );


  const totalTasks = Number(
    summary?.total_tasks ||
    tasks.length ||
    0
  );


  const onboardingComplete =
    totalTasks > 0 &&
    completedTasks >= totalTasks;


  /* =========================================================
     Student Status
  ========================================================= */

  const studentStatus = normalizeStatus(
    student?.status
  );


  const admissionStatus = normalizeStatus(
    student?.admission_status
  );


  const admissionConfirmed =
    [
      "confirmed",
      "approved",
    ].includes(admissionStatus);


  /* =========================================================
     Admission Banner
  ========================================================= */

  const getAdmissionBanner = () => {

    if (
      admissionStatus ===
      "rejected"
    ) {

      return {
        title: "Admission Not Approved",
        description:
          "Your admission application requires attention. Please check your admission details.",
        badge: admissionStatus,
        icon: AlertCircle,
        container:
          "border-red-200 bg-red-50",
        iconBg:
          "bg-red-100",
        iconColor:
          "text-red-600",
        titleColor:
          "text-red-900",
        descriptionColor:
          "text-red-700",
      };
    }


    if (
      [
        "pending",
        "under_review",
        "review_required",
      ].includes(admissionStatus)
    ) {

      return {
        title: "Admission Under Review",
        description:
          "Your admission application is currently being reviewed by the college.",
        badge: admissionStatus,
        icon: Clock3,
        container:
          "border-yellow-200 bg-yellow-50",
        iconBg:
          "bg-yellow-100",
        iconColor:
          "text-yellow-600",
        titleColor:
          "text-yellow-900",
        descriptionColor:
          "text-yellow-700",
      };
    }


    if (admissionConfirmed) {

      return {
        title: "Admission Confirmed",
        description:
          "Your student account is active and your campus onboarding has started.",
        badge: admissionStatus,
        icon: CheckCircle2,
        container:
          "border-green-200 bg-green-50",
        iconBg:
          "bg-green-100",
        iconColor:
          "text-green-600",
        titleColor:
          "text-green-900",
        descriptionColor:
          "text-green-700",
      };
    }


    return {
      title: "Admission Status",
      description:
        "Your current admission status is shown below.",
      badge:
        admissionStatus || "unknown",
      icon: ClipboardList,
      container:
        "border-gray-200 bg-white",
      iconBg:
        "bg-gray-100",
      iconColor:
        "text-gray-600",
      titleColor:
        "text-gray-900",
      descriptionColor:
        "text-gray-600",
    };
  };


  const admissionBanner =
    getAdmissionBanner();


  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {

    return (
      <Layout>

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-gray-500"
            />

            <p className="mt-4 text-sm text-gray-500">
              Loading student dashboard...
            </p>

          </div>

        </div>

      </Layout>
    );
  }


  /* =========================================================
     Error
  ========================================================= */

  if (error && !student) {

    return (
      <Layout>

        <div className="flex min-h-[60vh] items-center justify-center px-4">

          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <AlertCircle
              size={32}
              className="mx-auto text-red-600"
            />

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Unable to Load Dashboard
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              onClick={loadDashboard}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>

        </div>

      </Layout>
    );
  }


  /* =========================================================
     Dashboard
  ========================================================= */

  return (
    <Layout>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">

              <GraduationCap
                size={21}
                className="text-white"
              />

            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                CampusFlow AI
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Student Dashboard
              </h1>

              <p className="mt-1 text-gray-500">
                Welcome back,{" "}
                <span className="font-semibold text-gray-900">
                  {student?.full_name || "Student"}
                </span>
              </p>

            </div>

          </div>

        </div>


        <button
          onClick={loadDashboard}
          disabled={refreshing}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >

          <RefreshCw
            size={16}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>


      {/* =====================================================
          ADMISSION STATUS
      ===================================================== */}

      <div
        className={`mb-6 rounded-2xl border p-5 ${admissionBanner.container}`}
      >

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-start gap-3">

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${admissionBanner.iconBg}`}
            >

              <admissionBanner.icon
                size={21}
                className={
                  admissionBanner.iconColor
                }
              />

            </div>

            <div>

              <p
                className={`font-bold ${admissionBanner.titleColor}`}
              >
                {admissionBanner.title}
              </p>

              <p
                className={`mt-1 text-sm ${admissionBanner.descriptionColor}`}
              >
                {admissionBanner.description}
              </p>

            </div>

          </div>

          <StatusBadge
            status={
              admissionBanner.badge
            }
          />

        </div>

      </div>


      {/* =====================================================
          QUICK STATS
      ===================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          icon={GraduationCap}
          title="Admission Number"
          value={
            student?.admission_number ||
            "—"
          }
          description="Official admission ID"
        />

        <StatCard
          icon={User}
          title="Roll Number"
          value={
            student?.roll_number ||
            "Pending"
          }
          description="Student roll number"
        />

        <StatCard
          icon={ClipboardList}
          title="Onboarding"
          value={`${Math.round(
            onboardingProgress
          )}%`}
          description={
            totalTasks > 0
              ? `${completedTasks} of ${totalTasks} tasks completed`
              : "No onboarding tasks"
          }
        />

        <StatCard
          icon={CreditCard}
          title="Fees Paid"
          value={`₹${paidFees.toLocaleString(
            "en-IN"
          )}`}
          description={`of ₹${totalFees.toLocaleString(
            "en-IN"
          )}`}
        />

      </div>


      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ===================================================
            LEFT COLUMN
        =================================================== */}

        <div className="space-y-6 lg:col-span-2">


          {/* =================================================
              ONBOARDING
          ================================================= */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Onboarding Progress
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {onboardingComplete
                    ? "All required campus registration steps are complete."
                    : "Complete all required campus registration steps."
                  }
                </p>

              </div>

              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >

                {onboardingComplete
                  ? "View Onboarding"
                  : "Open Onboarding"
                }

                <ArrowRight size={16} />

              </Link>

            </div>


            {/* Progress */}

            <div className="mt-6">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-sm font-medium text-gray-600">
                  Progress
                </span>

                <span className="text-sm font-bold text-gray-900">
                  {Math.round(
                    onboardingProgress
                  )}
                  %
                </span>

              </div>


              <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                <div
                  className={`h-full rounded-full transition-all ${
                    onboardingComplete
                      ? "bg-green-600"
                      : "bg-gray-900"
                  }`}
                  style={{
                    width: `${onboardingProgress}%`,
                  }}
                />

              </div>

            </div>


            {/* Tasks */}

            <div className="mt-6 space-y-3">

              {tasks.length === 0 ? (

                <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center">

                  <CircleDashed
                    size={25}
                    className="mx-auto text-gray-400"
                  />

                  <p className="mt-2 text-sm text-gray-500">
                    No onboarding tasks found.
                  </p>

                </div>

              ) : (

                tasks.map((task) => {

                  const taskStatus =
                    normalizeStatus(
                      task?.status
                    );

                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        {taskStatus ===
                        "completed" ? (

                          <CheckCircle2
                            size={20}
                            className="shrink-0 text-green-600"
                          />

                        ) : taskStatus ===
                          "in_progress" ? (

                          <Clock3
                            size={20}
                            className="shrink-0 text-blue-600"
                          />

                        ) : (

                          <CircleDashed
                            size={20}
                            className="shrink-0 text-gray-400"
                          />

                        )}

                        <div className="min-w-0">

                          <p className="font-semibold text-gray-900">
                            {task?.title ||
                              "Onboarding Task"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {task?.description ||
                              "Complete this onboarding task."}
                          </p>

                        </div>

                      </div>

                      <StatusBadge
                        status={
                          taskStatus
                        }
                      />

                    </div>
                  );
                })

              )}

            </div>

          </section>


          {/* =================================================
              NEXT ACTION
          ================================================= */}

          {!onboardingComplete &&
            nextAction?.has_next_action &&
            nextAction?.next_action && (

              <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Next Action
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-blue-950">
                      {
                        nextAction
                          .next_action
                          .title
                      }
                    </h2>

                    <p className="mt-1 text-sm text-blue-700">
                      {
                        nextAction
                          .next_action
                          .description
                      }
                    </p>

                  </div>

                  <Link
                    to="/onboarding"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </Link>

                </div>

              </section>

            )}


          {/* =================================================
              ONBOARDING COMPLETE
          ================================================= */}

          {onboardingComplete && (

            <section className="rounded-2xl border border-green-200 bg-green-50 p-6">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">

                  <ShieldCheck
                    size={21}
                    className="text-green-600"
                  />

                </div>

                <div>

                  <h2 className="font-bold text-green-900">
                    Onboarding Complete
                  </h2>

                  <p className="mt-1 text-sm text-green-700">
                    You have completed all required campus onboarding steps.
                  </p>

                </div>

              </div>

            </section>

          )}


          {/* =================================================
              STUDENT INFORMATION
          ================================================= */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">

                <User
                  size={18}
                  className="text-white"
                />

              </div>

              <div>

                <h2 className="font-bold text-gray-900">
                  Student Information
                </h2>

                <p className="text-sm text-gray-500">
                  Your registered academic profile.
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Full Name
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatValue(
                    student?.full_name
                  )}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Email
                </p>

                <p className="mt-1 break-all font-medium text-gray-900">
                  {formatValue(
                    student?.email
                  )}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Phone
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatValue(
                    student?.phone
                  )}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Program
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatValue(
                    student?.program
                  )}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Department
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatValue(
                    student?.department
                  )}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Academic Year
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatValue(
                    student?.academic_year
                  )}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Semester
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatValue(
                    student?.semester
                  )}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Application Number
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatValue(
                    student?.application_number
                  )}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Admission Number
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatValue(
                    student?.admission_number
                  )}
                </p>
              </div>

            </div>

          </section>

        </div>


        {/* ===================================================
            RIGHT COLUMN
        =================================================== */}

        <div className="space-y-6">


          {/* =================================================
              ACCOUNT STATUS
          ================================================= */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  studentStatus === "active"
                    ? "bg-green-100"
                    : "bg-gray-100"
                }`}
              >

                <CheckCircle2
                  size={20}
                  className={
                    studentStatus === "active"
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                />

              </div>

              <div>

                <p className="font-bold text-gray-900">
                  {studentStatus ===
                  "active"
                    ? "Account Active"
                    : "Account Status"}
                </p>

                <p className="text-sm text-gray-500">
                  {studentStatus ===
                  "active"
                    ? "Student account is activated."
                    : "Current status of your student account."}
                </p>

              </div>

            </div>


            <div className="mt-5 space-y-3">

              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">

                <span className="text-sm text-gray-500">
                  Student Status
                </span>

                <StatusBadge
                  status={
                    student?.status
                  }
                />

              </div>


              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">

                <span className="text-sm text-gray-500">
                  Admission
                </span>

                <StatusBadge
                  status={
                    student?.admission_status
                  }
                />

              </div>

            </div>

          </section>


          {/* =================================================
              FEES
          ================================================= */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">

                <CreditCard
                  size={18}
                  className="text-white"
                />

              </div>

              <div>

                <h2 className="font-bold text-gray-900">
                  Fees
                </h2>

                <p className="text-xs text-gray-500">
                  Admission fee summary
                </p>

              </div>

            </div>


            <div className="mt-5 space-y-3">

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Total
                </span>

                <span className="font-bold text-gray-900">
                  ₹{totalFees.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Paid
                </span>

                <span className="font-bold text-green-700">
                  ₹{paidFees.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>


              <div className="flex items-center justify-between border-t pt-3">

                <span className="text-sm text-gray-500">
                  Pending
                </span>

                <span
                  className={`font-bold ${
                    pendingFees > 0
                      ? "text-yellow-700"
                      : "text-green-700"
                  }`}
                >
                  ₹{pendingFees.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

            </div>


            <Link
              to="/student-fees"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              View Fee Details
              <ArrowRight size={15} />
            </Link>

          </section>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="font-bold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Quickly access your campus services.
            </p>


            <div className="mt-4 space-y-3">

              <QuickAction
                to="/admission"
                icon={GraduationCap}
                title="Admission"
                description="View admission details"
              />


              <QuickAction
                to="/student-documents"
                icon={FileText}
                title="Documents"
                description="Upload and track documents"
              />


              <QuickAction
                to="/student-fees"
                icon={CreditCard}
                title="Fees"
                description="View payment records"
              />


              <QuickAction
                to="/onboarding"
                icon={BookOpen}
                title="Onboarding"
                description="Complete registration tasks"
              />


              <QuickAction
                to="/student-tickets"
                icon={Ticket}
                title="Support"
                description="Raise or track an issue"
              />

            </div>

          </section>


          {/* =================================================
              ACADEMIC SNAPSHOT
          ================================================= */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">

                <CalendarCheck
                  size={18}
                  className="text-gray-700"
                />

              </div>

              <div>

                <h2 className="font-bold text-gray-900">
                  Academic Snapshot
                </h2>

                <p className="text-xs text-gray-500">
                  Current academic information
                </p>

              </div>

            </div>


            <div className="mt-5 space-y-3">

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Program
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {formatValue(
                    student?.program
                  )}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Department
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {formatValue(
                    student?.department
                  )}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Academic Year
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {formatValue(
                    student?.academic_year
                  )}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Semester
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {formatValue(
                    student?.semester
                  )}
                </span>

              </div>

            </div>

          </section>

        </div>

      </div>

    </Layout>
  );
}


export default StudentDashboard;