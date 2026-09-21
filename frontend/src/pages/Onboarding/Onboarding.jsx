import {
    useCallback,
    useEffect,
    useState,
  } from "react";
  
  import {
    CheckCircle2,
    CircleDashed,
    Clock3,
    GraduationCap,
    IdCard,
    Library,
    Loader2,
    RefreshCw,
    ShieldCheck,
    AlertTriangle,
    RotateCcw,
  } from "lucide-react";
  
  import toast from "react-hot-toast";
  
  import Layout from "../../components/layout/Layout";
  
  import {
    initializeMyOnboarding,
    getMyOnboardingTasks,
    getMyOnboardingSummary,
    getMyNextOnboardingAction,
    recheckMyOnboarding,
  } from "../../services/onboarding";
  
  
  /* =========================================================
     TASK ICON
  ========================================================= */
  
  function getTaskIcon(taskKey) {
    switch (taskKey) {
      case "academic_registration":
        return GraduationCap;
  
      case "library_registration":
        return Library;
  
      case "id_card_registration":
        return IdCard;
  
      default:
        return CircleDashed;
    }
  }
  
  
  /* =========================================================
     STATUS FORMATTER
  ========================================================= */
  
  function formatStatus(value) {
    return String(value || "pending")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }
  
  
  /* =========================================================
     STATUS BADGE
  ========================================================= */
  
  function StatusBadge({ status }) {
    const value = String(
      status || "pending"
    ).toLowerCase();
  
    const styles = {
      pending:
        "bg-gray-100 text-gray-600",
  
      in_progress:
        "bg-blue-100 text-blue-700",
  
      processing:
        "bg-purple-100 text-purple-700",
  
      waiting_for_student:
        "bg-yellow-100 text-yellow-700",
  
      needs_human_review:
        "bg-orange-100 text-orange-700",
  
      failed:
        "bg-red-100 text-red-700",
  
      completed:
        "bg-green-100 text-green-700",
  
      ready_for_review:
        "bg-orange-100 text-orange-700",
  
      changes_requested:
        "bg-red-100 text-red-700",
  
      submitted:
        "bg-blue-100 text-blue-700",
    };
  
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          styles[value] ||
          "bg-gray-100 text-gray-600"
        }`}
      >
        {formatStatus(value)}
      </span>
    );
  }
  
  
  /* =========================================================
     STATUS MESSAGE
  ========================================================= */
  
  function getStatusMessage(task) {
    const status = String(
      task?.status || ""
    ).toLowerCase();
  
    switch (status) {
      case "pending":
        return {
          type: "info",
          text:
            "This task is waiting for the onboarding automation system.",
        };
  
      case "in_progress":
        return {
          type: "info",
          text:
            "This task is currently being processed.",
        };
  
      case "processing":
        return {
          type: "info",
          text:
            "The onboarding automation agent is processing this task.",
        };
  
      case "waiting_for_student":
        return {
          type: "warning",
          text:
            task?.review_notes ||
            "Action is required from you before onboarding can continue.",
        };
  
      case "needs_human_review":
        return {
          type: "warning",
          text:
            "This task requires college staff attention. You do not need to submit it manually.",
        };
  
      case "failed":
        return {
          type: "error",
          text:
            task?.review_notes ||
            "Automation could not complete this task. Please try again.",
        };
  
      case "completed":
        return {
          type: "success",
          text:
            "This onboarding task has been completed automatically.",
        };
  
      default:
        return null;
    }
  }
  
  
  /* =========================================================
     STATUS MESSAGE COMPONENT
  ========================================================= */
  
  function TaskStatusMessage({ task }) {
    const message = getStatusMessage(task);
  
    if (!message) {
      return null;
    }
  
    const styles = {
      info:
        "bg-blue-50 text-blue-700 border-blue-100",
  
      warning:
        "bg-yellow-50 text-yellow-700 border-yellow-100",
  
      error:
        "bg-red-50 text-red-700 border-red-100",
  
      success:
        "bg-green-50 text-green-700 border-green-100",
    };
  
    return (
      <div
        className={`mt-4 rounded-xl border px-4 py-3 text-sm ${styles[message.type]}`}
      >
        {message.text}
      </div>
    );
  }
  
  
  /* =========================================================
     MAIN COMPONENT
  ========================================================= */
  
  export default function Onboarding() {
    const [tasks, setTasks] = useState([]);
    const [summary, setSummary] = useState(null);
    const [nextAction, setNextAction] = useState(null);
  
    const [loading, setLoading] =
      useState(true);
  
    const [refreshing, setRefreshing] =
      useState(false);
  
    const [initializing, setInitializing] =
      useState(false);
  
    const [rechecking, setRechecking] =
      useState(false);
  
  
    /* =======================================================
       LOAD DATA
    ======================================================= */
  
    const loadOnboarding = useCallback(
      async (showRefresh = false) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          }
  
          const [
            tasksResponse,
            summaryResponse,
            nextActionResponse,
          ] = await Promise.all([
            getMyOnboardingTasks(),
            getMyOnboardingSummary(),
            getMyNextOnboardingAction(),
          ]);
  
          setTasks(
            Array.isArray(tasksResponse)
              ? tasksResponse
              : []
          );
  
          setSummary(
            summaryResponse || null
          );
  
          setNextAction(
            nextActionResponse || null
          );
        } catch (error) {
          console.error(
            "Failed to load onboarding:",
            error
          );
  
          toast.error(
            error?.response?.data?.detail ||
            "Unable to load onboarding."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );
  
  
    /* =======================================================
       INITIAL LOAD
    ======================================================= */
  
    useEffect(() => {
      loadOnboarding();
    }, [loadOnboarding]);
  
  
    /* =======================================================
       INITIALIZATION
    ======================================================= */
  
    const initialized =
      tasks.length > 0;
  
  
    const handleInitialize = async () => {
      try {
        setInitializing(true);
  
        await initializeMyOnboarding();
  
        toast.success(
          "Onboarding initialized successfully."
        );
  
        await loadOnboarding();
      } catch (error) {
        console.error(
          "Failed to initialize onboarding:",
          error
        );
  
        toast.error(
          error?.response?.data?.detail ||
          "Unable to initialize onboarding."
        );
      } finally {
        setInitializing(false);
      }
    };
  
  
    /* =======================================================
       RECHECK AUTOMATION
    ======================================================= */
  
    const handleRecheck = async () => {
      try {
        setRechecking(true);
  
        await recheckMyOnboarding();
  
        toast.success(
          "Onboarding automation has been rechecked."
        );
  
        await loadOnboarding(true);
      } catch (error) {
        console.error(
          "Failed to recheck onboarding:",
          error
        );
  
        toast.error(
          error?.response?.data?.detail ||
          "Unable to recheck onboarding."
        );
      } finally {
        setRechecking(false);
      }
    };
  
  
    /* =======================================================
       PROGRESS
    ======================================================= */
  
    const progress =
      Number(
        summary?.progress_percentage || 0
      );
  
  
    const isCompleted =
      String(
        summary?.onboarding_status || ""
      ).toLowerCase() === "completed";
  
  
    const humanReviewCount =
      Number(
        summary?.needs_human_review_tasks || 0
      );
  
  
    const waitingCount =
      Number(
        summary?.waiting_for_student_tasks || 0
      );
  
  
    /* =======================================================
       LOADING
    ======================================================= */
  
    if (loading) {
      return (
        <Layout>
          <div className="flex min-h-[60vh] items-center justify-center">
  
            <div className="text-center">
  
              <Loader2
                size={32}
                className="mx-auto animate-spin text-gray-600"
              />
  
              <p className="mt-3 text-sm text-gray-500">
                Loading onboarding...
              </p>
  
            </div>
  
          </div>
        </Layout>
      );
    }
  
  
    /* =======================================================
       RENDER
    ======================================================= */
  
    return (
      <Layout>
  
        {/* ===================================================
            HEADER
        =================================================== */}
  
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
  
          <div>
  
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Student Portal
            </p>
  
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
              Onboarding
            </h1>
  
            <p className="mt-1 text-sm text-gray-500">
              Your campus onboarding is handled automatically.
            </p>
  
          </div>
  
  
          <div className="flex gap-3">
  
            <button
              onClick={handleRecheck}
              disabled={rechecking}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
            >
  
              {rechecking ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <RotateCcw size={16} />
              )}
  
              {rechecking
                ? "Checking..."
                : "Recheck"}
  
            </button>
  
  
            <button
              onClick={() =>
                loadOnboarding(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
            >
  
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
  
              Refresh
  
            </button>
  
          </div>
  
        </div>
  
  
        {/* ===================================================
            NOT INITIALIZED
        =================================================== */}
  
        {!initialized && (
  
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-7">
  
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
  
              <div>
  
                <div className="flex items-center gap-3">
  
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
  
                    <ShieldCheck
                      size={21}
                      className="text-white"
                    />
  
                  </div>
  
  
                  <div>
  
                    <h2 className="text-xl font-bold text-gray-900">
                      Start your onboarding
                    </h2>
  
                    <p className="mt-1 text-sm text-gray-600">
                      Initialize your campus onboarding
                      workflow. The system will automatically
                      process your required registrations.
                    </p>
  
                  </div>
  
                </div>
  
  
                <div className="mt-5 grid gap-2 text-sm text-gray-600 md:grid-cols-3">
  
                  <p>✓ Academic Registration</p>
                  <p>✓ Library Registration</p>
                  <p>✓ ID Card Registration</p>
  
                </div>
  
              </div>
  
  
              <button
                onClick={handleInitialize}
                disabled={initializing}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-60"
              >
  
                {initializing ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <ShieldCheck size={17} />
                )}
  
                {initializing
                  ? "Initializing..."
                  : "Start Onboarding"}
  
              </button>
  
            </div>
  
          </div>
        )}
  
  
        {/* ===================================================
            ONBOARDING CONTENT
        =================================================== */}
  
        {initialized && (
  
          <>
  
            {/* ===============================================
                PROGRESS CARD
            =============================================== */}
  
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
  
              <div className="flex items-start justify-between">
  
                <div>
  
                  <h2 className="font-bold text-gray-900">
                    Onboarding Progress
                  </h2>
  
                  <p className="mt-1 text-sm text-gray-500">
  
                    {summary?.completed_tasks || 0}
                    {" "}of{" "}
                    {summary?.required_tasks || 0}
                    {" "}required tasks completed
  
                  </p>
  
                </div>
  
  
                <div className="text-right">
  
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(progress)}%
                  </p>
  
                  <p className="text-xs text-gray-500">
                    {formatStatus(
                      summary?.onboarding_status
                    )}
                  </p>
  
                </div>
  
              </div>
  
  
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
  
                <div
                  className="h-full rounded-full bg-gray-900 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      progress
                    )}%`,
                  }}
                />
  
              </div>
  
  
              {/* SMALL STATUS STATS */}
  
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
  
                <div className="rounded-xl bg-green-50 p-4">
  
                  <p className="text-xs font-semibold text-green-600">
                    Completed
                  </p>
  
                  <p className="mt-1 text-xl font-bold text-green-800">
                    {summary?.completed_tasks || 0}
                  </p>
  
                </div>
  
  
                <div className="rounded-xl bg-yellow-50 p-4">
  
                  <p className="text-xs font-semibold text-yellow-600">
                    Waiting For You
                  </p>
  
                  <p className="mt-1 text-xl font-bold text-yellow-800">
                    {waitingCount}
                  </p>
  
                </div>
  
  
                <div className="rounded-xl bg-orange-50 p-4">
  
                  <p className="text-xs font-semibold text-orange-600">
                    Human Review
                  </p>
  
                  <p className="mt-1 text-xl font-bold text-orange-800">
                    {humanReviewCount}
                  </p>
  
                </div>
  
              </div>
  
            </div>
  
  
            {/* ===============================================
                NEXT ACTION
            =============================================== */}
  
            {nextAction?.has_next_action &&
              nextAction?.action && (
  
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-6">
  
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Next Action
                </p>
  
                <h2 className="mt-2 text-xl font-bold text-gray-900">
                  {nextAction.action.title}
                </h2>
  
                <p className="mt-1 text-sm text-gray-600">
                  {nextAction.action.description}
                </p>
  
                <div className="mt-3">
  
                  <StatusBadge
                    status={
                      nextAction.action.status
                    }
                  />
  
                </div>
  
              </div>
  
            )}
  
  
            {/* ===============================================
                COMPLETED
            =============================================== */}
  
            {isCompleted && (
  
              <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-6">
  
                <div className="flex items-center gap-3">
  
                  <CheckCircle2
                    size={27}
                    className="text-green-600"
                  />
  
                  <div>
  
                    <h2 className="font-bold text-green-800">
                      Onboarding Completed
                    </h2>
  
                    <p className="mt-1 text-sm text-green-700">
                      All required onboarding tasks have
                      been successfully processed.
                    </p>
  
                  </div>
  
                </div>
  
              </div>
  
            )}
  
  
            {/* ===============================================
                TASKS
            =============================================== */}
  
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
  
              <div className="border-b border-gray-200 p-6">
  
                <h2 className="font-bold text-gray-900">
                  Onboarding Tasks
                </h2>
  
                <p className="mt-1 text-sm text-gray-500">
                  The onboarding automation system processes
                  these tasks automatically.
                </p>
  
              </div>
  
  
              <div className="divide-y divide-gray-100">
  
                {tasks.length === 0 && (
  
                  <div className="p-8 text-center">
  
                    <CircleDashed
                      size={30}
                      className="mx-auto text-gray-400"
                    />
  
                    <p className="mt-3 text-sm text-gray-500">
                      No onboarding tasks found.
                    </p>
  
                  </div>
  
                )}
  
  
                {tasks.map((task) => {
  
                  const TaskIcon =
                    getTaskIcon(
                      task.task_key
                    );
  
  
                  return (
  
                    <div
                      key={task.id}
                      className="p-6"
                    >
  
                      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
  
                        {/* TASK INFORMATION */}
  
                        <div className="flex gap-4">
  
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
  
                            <TaskIcon
                              size={20}
                              className="text-gray-700"
                            />
  
                          </div>
  
  
                          <div className="min-w-0">
  
                            <div className="flex flex-wrap items-center gap-2">
  
                              <h3 className="font-bold text-gray-900">
                                {task.title}
                              </h3>
  
  
                              {task.required && (
  
                                <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600">
                                  Required
                                </span>
  
                              )}
  
  
                              <StatusBadge
                                status={
                                  task.status
                                }
                              />
  
                            </div>
  
  
                            <p className="mt-1 text-sm text-gray-500">
                              {task.description}
                            </p>
  
  
                            <TaskStatusMessage
                              task={task}
                            />
  
                          </div>
  
                        </div>
  
  
                        {/* STATUS ICON */}
  
                        <div className="shrink-0">
  
                          {task.status ===
                            "completed" && (
  
                            <div className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
  
                              <CheckCircle2
                                size={17}
                              />
  
                              Completed
  
                            </div>
  
                          )}
  
  
                          {task.status ===
                            "processing" && (
  
                            <div className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700">
  
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
  
                              Processing
  
                            </div>
  
                          )}
  
  
                          {task.status ===
                            "in_progress" && (
  
                            <div className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700">
  
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
  
                              Processing
  
                            </div>
  
                          )}
  
  
                          {task.status ===
                            "waiting_for_student" && (
  
                            <div className="inline-flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-yellow-700">
  
                              <Clock3
                                size={17}
                              />
  
                              Action Required
  
                            </div>
  
                          )}
  
  
                          {task.status ===
                            "needs_human_review" && (
  
                            <div className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700">
  
                              <AlertTriangle
                                size={17}
                              />
  
                              Staff Review
  
                            </div>
  
                          )}
  
  
                          {task.status ===
                            "failed" && (
  
                            <button
                              onClick={handleRecheck}
                              disabled={rechecking}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                            >
  
                              <RotateCcw
                                size={16}
                              />
  
                              Retry
  
                            </button>
  
                          )}
  
  
                          {task.status ===
                            "pending" && (
  
                            <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-600">
  
                              <Clock3
                                size={16}
                              />
  
                              Waiting
  
                            </div>
  
                          )}
  
                        </div>
  
                      </div>
  
                    </div>
  
                  );
                })}
  
              </div>
  
            </div>
  
          </>
  
        )}
  
      </Layout>
    );
  }