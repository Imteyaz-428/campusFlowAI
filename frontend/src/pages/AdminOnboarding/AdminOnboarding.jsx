import {
    useCallback,
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Eye,
    Loader2,
    RefreshCw,
    Search,
    ShieldAlert,
    UserRound,
    XCircle,
  } from "lucide-react";
  
  import toast from "react-hot-toast";
  
  import Layout from "../../components/layout/Layout";
  
  import {
    getAdminOnboardingQueue,
    approveOnboardingTask,
    requestOnboardingChanges,
  } from "../../services/onboarding";
  
  
  /* =========================================================
     HELPERS
  ========================================================= */
  
  function formatStatus(value) {
    return String(value || "unknown")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }
  
  
  function getTaskType(task) {
    switch (task?.task_key) {
      case "academic_registration":
        return "Academic Registration";
  
      case "library_registration":
        return "Library Registration";
  
      case "id_card_registration":
        return "ID Card Registration";
  
      default:
        return task?.title || "Onboarding Task";
    }
  }
  
  
  /* =========================================================
     MAIN COMPONENT
  ========================================================= */
  
  export default function AdminOnboarding() {
    const [queue, setQueue] = useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [refreshing, setRefreshing] =
      useState(false);
  
    const [processingTaskId, setProcessingTaskId] =
      useState(null);
  
    const [search, setSearch] =
      useState("");
  
    const [selectedTask, setSelectedTask] =
      useState(null);
  
    const [reviewNotes, setReviewNotes] =
      useState("");
  
  
    /* =======================================================
       LOAD EXCEPTION QUEUE
    ======================================================= */
  
    const loadQueue = useCallback(
      async (showRefresh = false) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          }
  
          const response =
            await getAdminOnboardingQueue();
  
          setQueue(
            Array.isArray(response)
              ? response
              : response?.items || []
          );
  
        } catch (error) {
          console.error(
            "Failed to load onboarding exception queue:",
            error
          );
  
          toast.error(
            error?.response?.data?.detail ||
            "Unable to load onboarding exceptions."
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
      loadQueue();
    }, [loadQueue]);
  
  
    /* =======================================================
       SEARCH
    ======================================================= */
  
    const filteredQueue = useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();
  
      if (!query) {
        return queue;
      }
  
      return queue.filter((task) => {
  
        const searchable = [
          task?.student_name,
          task?.student_email,
          task?.application_number,
          task?.admission_number,
          task?.roll_number,
          task?.title,
          task?.task_key,
          task?.description,
          task?.review_notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
  
        return searchable.includes(query);
      });
    }, [queue, search]);
  
  
    /* =======================================================
       APPROVE / RESOLVE
    ======================================================= */
  
    const handleApprove = async (task) => {
      try {
        setProcessingTaskId(task.id);
  
        await approveOnboardingTask(
          task.id,
          reviewNotes.trim() || null
        );
  
        toast.success(
          "Exception resolved successfully."
        );
  
        setSelectedTask(null);
        setReviewNotes("");
  
        await loadQueue();
  
      } catch (error) {
        console.error(
          "Failed to resolve onboarding exception:",
          error
        );
  
        toast.error(
          error?.response?.data?.detail ||
          "Unable to resolve exception."
        );
  
      } finally {
        setProcessingTaskId(null);
      }
    };
  
  
    /* =======================================================
       REQUEST CHANGES
    ======================================================= */
  
    const handleRequestChanges = async (
      task
    ) => {
      if (!reviewNotes.trim()) {
        toast.error(
          "Please enter a note explaining what the student needs to fix."
        );
  
        return;
      }
  
      try {
        setProcessingTaskId(task.id);
  
        await requestOnboardingChanges(
          task.id,
          reviewNotes.trim()
        );
  
        toast.success(
          "Changes requested from the student."
        );
  
        setSelectedTask(null);
        setReviewNotes("");
  
        await loadQueue();
  
      } catch (error) {
        console.error(
          "Failed to request changes:",
          error
        );
  
        toast.error(
          error?.response?.data?.detail ||
          "Unable to request changes."
        );
  
      } finally {
        setProcessingTaskId(null);
      }
    };
  
  
    /* =======================================================
       STATS
    ======================================================= */
  
    const exceptionCount =
      queue.length;
  
    const studentCount =
      new Set(
        queue
          .map(
            (item) =>
              item.student_id
          )
          .filter(Boolean)
      ).size;
  
    const idCardExceptions =
      queue.filter(
        (item) =>
          item.task_key ===
          "id_card_registration"
      ).length;
  
  
    /* =======================================================
       LOADING
    ======================================================= */
  
    if (loading) {
      return (
        <Layout>
  
          <div className="flex min-h-[60vh] items-center justify-center">
  
            <div className="text-center">
  
              <Loader2
                size={34}
                className="mx-auto animate-spin text-gray-700"
              />
  
              <p className="mt-3 text-sm text-gray-500">
                Loading exception queue...
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
  
            <div className="flex items-center gap-3">
  
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">
  
                <ShieldAlert
                  size={22}
                  className="text-white"
                />
  
              </div>
  
              <div>
  
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Administration
                </p>
  
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Onboarding Exceptions
                </h1>
  
              </div>
  
            </div>
  
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Review only onboarding cases that the
              automation system could not safely resolve.
            </p>
  
          </div>
  
  
          <button
            onClick={() =>
              loadQueue(true)
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
  
  
        {/* ===================================================
            STATS
        =================================================== */}
  
        <div className="grid gap-4 md:grid-cols-3">
  
          {/* ACTIVE EXCEPTIONS */}
  
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
  
            <div className="flex items-center justify-between">
  
              <div>
  
                <p className="text-sm font-semibold text-orange-700">
                  Active Exceptions
                </p>
  
                <p className="mt-1 text-3xl font-bold text-orange-900">
                  {exceptionCount}
                </p>
  
              </div>
  
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
  
                <ShieldAlert
                  size={21}
                  className="text-orange-600"
                />
  
              </div>
  
            </div>
  
          </div>
  
  
          {/* STUDENTS AFFECTED */}
  
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
  
            <div className="flex items-center justify-between">
  
              <div>
  
                <p className="text-sm font-semibold text-blue-700">
                  Students Affected
                </p>
  
                <p className="mt-1 text-3xl font-bold text-blue-900">
                  {studentCount}
                </p>
  
              </div>
  
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
  
                <UserRound
                  size={21}
                  className="text-blue-600"
                />
  
              </div>
  
            </div>
  
          </div>
  
  
          {/* ID CARD EXCEPTIONS */}
  
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
  
            <div className="flex items-center justify-between">
  
              <div>
  
                <p className="text-sm font-semibold text-purple-700">
                  ID Card Exceptions
                </p>
  
                <p className="mt-1 text-3xl font-bold text-purple-900">
                  {idCardExceptions}
                </p>
  
              </div>
  
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
  
                <Clock3
                  size={21}
                  className="text-purple-600"
                />
  
              </div>
  
            </div>
  
          </div>
  
        </div>
  
  
        {/* ===================================================
            SEARCH
        =================================================== */}
  
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
  
          <div className="relative">
  
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
  
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search student, email, admission, task..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white"
            />
  
          </div>
  
        </div>
  
  
        {/* ===================================================
            QUEUE
        =================================================== */}
  
        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
  
          <div className="border-b border-gray-200 p-6">
  
            <div className="flex items-center justify-between">
  
              <div>
  
                <h2 className="font-bold text-gray-900">
                  Human Review Queue
                </h2>
  
                <p className="mt-1 text-sm text-gray-500">
                  Only tasks marked as{" "}
                  <span className="font-semibold text-orange-600">
                    needs_human_review
                  </span>{" "}
                  appear here.
                </p>
  
              </div>
  
              <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
                {filteredQueue.length} exception
                {filteredQueue.length === 1
                  ? ""
                  : "s"}
              </span>
  
            </div>
  
          </div>
  
  
          {/* EMPTY */}
  
          {filteredQueue.length === 0 && (
  
            <div className="px-6 py-16 text-center">
  
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
  
                <CheckCircle2
                  size={28}
                  className="text-green-600"
                />
  
              </div>
  
              <h3 className="mt-4 text-base font-bold text-gray-900">
                No onboarding exceptions
              </h3>
  
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                All onboarding cases are either being
                handled automatically or are waiting for
                the student. No human intervention is
                currently required.
              </p>
  
            </div>
  
          )}
  
  
          {/* TABLE */}
  
          {filteredQueue.length > 0 && (
  
            <div className="overflow-x-auto">
  
              <table className="w-full min-w-[900px]">
  
                <thead>
  
                  <tr className="border-b border-gray-100 bg-gray-50">
  
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Student
                    </th>
  
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Exception
                    </th>
  
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Reason
                    </th>
  
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
  
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                      Action
                    </th>
  
                  </tr>
  
                </thead>
  
  
                <tbody className="divide-y divide-gray-100">
  
                  {filteredQueue.map((task) => {
  
                    const processing =
                      processingTaskId ===
                      task.id;
  
                    return (
  
                      <tr
                        key={task.id}
                        className="hover:bg-gray-50"
                      >
  
                        {/* STUDENT */}
  
                        <td className="px-6 py-5">
  
                          <div className="flex items-center gap-3">
  
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
  
                              <UserRound
                                size={18}
                                className="text-gray-600"
                              />
  
                            </div>
  
                            <div>
  
                              <p className="font-semibold text-gray-900">
                                {task.student_name ||
                                  "Unknown Student"}
                              </p>
  
                              <p className="mt-0.5 text-xs text-gray-500">
                                {task.student_email ||
                                  "No email available"}
                              </p>
  
                              {task.admission_number && (
  
                                <p className="mt-0.5 text-xs text-gray-400">
                                  Admission:{" "}
                                  {task.admission_number}
                                </p>
  
                              )}
  
                            </div>
  
                          </div>
  
                        </td>
  
  
                        {/* TASK */}
  
                        <td className="px-6 py-5">
  
                          <p className="font-semibold text-gray-900">
                            {getTaskType(task)}
                          </p>
  
                          <p className="mt-1 text-xs text-gray-500">
                            {task.task_key ||
                              "Onboarding task"}
                          </p>
  
                        </td>
  
  
                        {/* REASON */}
  
                        <td className="max-w-[320px] px-6 py-5">
  
                          <p className="text-sm text-gray-600">
                            {task.review_notes ||
                              task.description ||
                              "Automation requires human review."}
                          </p>
  
                        </td>
  
  
                        {/* STATUS */}
  
                        <td className="px-6 py-5">
  
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-700">
  
                            <AlertTriangle
                              size={13}
                            />
  
                            {formatStatus(
                              task.status ||
                              "needs_human_review"
                            )}
  
                          </span>
  
                        </td>
  
  
                        {/* ACTION */}
  
                        <td className="px-6 py-5 text-right">
  
                          <button
                            onClick={() => {
                              setSelectedTask(
                                task
                              );
  
                              setReviewNotes(
                                task.review_notes ||
                                ""
                              );
                            }}
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                          >
  
                            <Eye
                              size={16}
                            />
  
                            Review
  
                          </button>
  
                        </td>
  
                      </tr>
  
                    );
                  })}
  
                </tbody>
  
              </table>
  
            </div>
  
          )}
  
        </div>
  
  
        {/* ===================================================
            REVIEW MODAL
        =================================================== */}
  
        {selectedTask && (
  
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
  
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
  
              {/* MODAL HEADER */}
  
              <div className="flex items-start justify-between border-b border-gray-200 p-6">
  
                <div>
  
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                    Human Review
                  </p>
  
                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {getTaskType(
                      selectedTask
                    )}
                  </h2>
  
                </div>
  
  
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setReviewNotes("");
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
  
                  <XCircle
                    size={22}
                  />
  
                </button>
  
              </div>
  
  
              {/* MODAL BODY */}
  
              <div className="space-y-5 p-6">
  
                {/* STUDENT */}
  
                <div className="rounded-xl bg-gray-50 p-4">
  
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Student
                  </p>
  
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedTask.student_name ||
                      "Unknown Student"}
                  </p>
  
                  {selectedTask.student_email && (
  
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedTask.student_email}
                    </p>
  
                  )}
  
                </div>
  
  
                {/* REASON */}
  
                <div>
  
                  <p className="text-sm font-bold text-gray-900">
                    Why human review is required
                  </p>
  
                  <div className="mt-2 rounded-xl border border-orange-200 bg-orange-50 p-4">
  
                    <p className="text-sm leading-6 text-orange-800">
                      {selectedTask.review_notes ||
                        selectedTask.description ||
                        "The automation system could not safely resolve this onboarding task."}
                    </p>
  
                  </div>
  
                </div>
  
  
                {/* NOTES */}
  
                <div>
  
                  <label className="text-sm font-bold text-gray-900">
                    Review notes
                  </label>
  
                  <p className="mt-1 text-xs text-gray-500">
                    Add an explanation for the decision.
                  </p>
  
                  <textarea
                    value={reviewNotes}
                    onChange={(event) =>
                      setReviewNotes(
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Enter review notes..."
                    className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 outline-none focus:border-gray-400"
                  />
  
                </div>
  
              </div>
  
  
              {/* MODAL FOOTER */}
  
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 p-5 sm:flex-row sm:justify-end">
  
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setReviewNotes("");
                  }}
                  disabled={
                    processingTaskId ===
                    selectedTask.id
                  }
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
  
  
                <button
                  onClick={() =>
                    handleRequestChanges(
                      selectedTask
                    )
                  }
                  disabled={
                    processingTaskId ===
                    selectedTask.id
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 disabled:opacity-60"
                >
  
                  {processingTaskId ===
                  selectedTask.id ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <AlertTriangle
                      size={16}
                    />
                  )}
  
                  Request Changes
  
                </button>
  
  
                <button
                  onClick={() =>
                    handleApprove(
                      selectedTask
                    )
                  }
                  disabled={
                    processingTaskId ===
                    selectedTask.id
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                >
  
                  {processingTaskId ===
                  selectedTask.id ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2
                      size={16}
                    />
                  )}
  
                  Resolve Exception
  
                </button>
  
              </div>
  
            </div>
  
          </div>
  
        )}
  
      </Layout>
    );
  }