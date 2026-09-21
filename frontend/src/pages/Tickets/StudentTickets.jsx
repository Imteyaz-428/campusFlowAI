import {
    useCallback,
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    AlertCircle,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Flag,
    MessageSquare,
    Plus,
    RefreshCw,
    Send,
    Tag,
    Ticket,
    UserRound,
    X,
  } from "lucide-react";
  
  import toast from "react-hot-toast";
  
  import Layout from "../../components/layout/Layout";
  
  import {
    createTicket,
    getMyTickets,
  } from "../../services/ticket";
  
  

  // CONSTANTS

  
  const CATEGORIES = [
    "fees",
    "admission",
    "documents",
    "id_card",
    "library",
    "academic",
    "hostel",
    "transport",
    "technical",
    "general",
  ];
  
  const PRIORITIES = [
    "low",
    "medium",
    "high",
    "urgent",
  ];
  
  const DEPARTMENTS = [
    "general",
    "admission",
    "accounts",
    "academic",
    "library",
    "hostel",
    "transport",
    "it",
  ];
  
  const STATUSES = [
    "open",
    "in_progress",
    "waiting_for_student",
    "escalated",
    "resolved",
    "closed",
  ];
  
  

  // STATUS CONFIG

  
  const STATUS_CONFIG = {
    open: {
      label: "Open",
      description: "Your ticket has been submitted.",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
      icon: Ticket,
    },
  
    in_progress: {
      label: "In Progress",
      description: "The campus team is working on your issue.",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    },
  
    waiting_for_student: {
      label: "Waiting for You",
      description: "The campus team needs something from you.",
      className:
        "bg-purple-50 text-purple-700 border-purple-200",
      icon: UserRound,
    },
  
    escalated: {
      label: "Escalated",
      description: "Your issue has been forwarded for further review.",
      className:
        "bg-red-50 text-red-700 border-red-200",
      icon: AlertCircle,
    },
  
    resolved: {
      label: "Resolved",
      description: "The campus team has resolved your issue.",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
  
    closed: {
      label: "Closed",
      description: "This support ticket has been closed.",
      className:
        "bg-gray-100 text-gray-700 border-gray-200",
      icon: Check,
    },
  };
  
  

  // HELPERS

  
  const normalize = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase();
  };
  
  
  const formatText = (value) => {
    if (!value) {
      return "—";
    }
  
    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };
  
  
  const formatDate = (value) => {
    if (!value) {
      return "—";
    }
  
    const date = new Date(value);
  
    if (Number.isNaN(date.getTime())) {
      return "—";
    }
  
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  
  const getRelativeTime = (value) => {
    if (!value) {
      return "—";
    }
  
    const date = new Date(value);
  
    if (Number.isNaN(date.getTime())) {
      return "—";
    }
  
    const difference =
      Date.now() - date.getTime();
  
    const minutes = Math.floor(
      difference / (1000 * 60)
    );
  
    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );
  
    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );
  
    if (minutes < 1) {
      return "Just now";
    }
  
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
  
    if (hours < 24) {
      return `${hours}h ago`;
    }
  
    if (days < 7) {
      return `${days}d ago`;
    }
  
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  
  
  const getStatusConfig = (status) => {
    return (
      STATUS_CONFIG[normalize(status)] ||
      STATUS_CONFIG.open
    );
  };
  
  
  const getPriorityClass = (priority) => {
    switch (normalize(priority)) {
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200";
  
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200";
  
      case "medium":
        return "bg-blue-50 text-blue-700 border-blue-200";
  
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };
  
  

  // STATUS BADGE

  
  function StatusBadge({ status }) {
    const config =
      getStatusConfig(status);
  
    const Icon = config.icon;
  
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
      >
        <Icon size={13} />
  
        {config.label}
      </span>
    );
  }
  
  

  // STATUS PROGRESS

  
  function StatusProgress({
    currentStatus,
  }) {
    const currentIndex =
      STATUSES.indexOf(
        normalize(currentStatus)
      );
  
    return (
      <div className="overflow-x-auto">
  
        <div className="flex min-w-[720px] items-center">
  
          {STATUSES.map(
            (status, index) => {
  
              const config =
                STATUS_CONFIG[status];
  
              const Icon =
                config.icon;
  
              const isCurrent =
                normalize(
                  currentStatus
                ) === status;
  
              const isCompleted =
                currentIndex >= 0 &&
                index < currentIndex;
  
              return (
                <div
                  key={status}
                  className="flex flex-1 items-center"
                >
  
                  <div className="flex min-w-[90px] flex-col items-center">
  
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                        isCurrent
                          ? "border-gray-900 bg-gray-900 text-white shadow-md"
                          : isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-200 bg-white text-gray-400"
                      }`}
                    >
  
                      {isCompleted ? (
                        <Check size={15} />
                      ) : (
                        <Icon size={15} />
                      )}
  
                    </div>
  
                    <p
                      className={`mt-2 text-center text-[10px] font-semibold ${
                        isCurrent
                          ? "text-gray-900"
                          : isCompleted
                          ? "text-emerald-600"
                          : "text-gray-400"
                      }`}
                    >
                      {config.label}
                    </p>
  
                  </div>
  
  
                  {index <
                    STATUSES.length - 1 && (
  
                    <div
                      className={`mb-5 h-0.5 flex-1 ${
                        index < currentIndex
                          ? "bg-emerald-400"
                          : "bg-gray-200"
                      }`}
                    />
  
                  )}
  
                </div>
              );
            }
          )}
  
        </div>
  
      </div>
    );
  }
  
  

  // SUMMARY CARD

  
  function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
  }) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
  
        <div className="flex items-start justify-between">
  
          <div>
  
            <p className="text-sm font-medium text-gray-500">
              {title}
            </p>
  
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              {value}
            </p>
  
            <p className="mt-1 text-xs text-gray-400">
              {description}
            </p>
  
          </div>
  
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
  
            <Icon
              size={19}
              className="text-gray-600"
            />
  
          </div>
  
        </div>
  
      </div>
    );
  }
  
  

  // MAIN COMPONENT

  
  function StudentTickets() {
  
    const [tickets, setTickets] =
      useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [refreshing, setRefreshing] =
      useState(false);
  
    const [showCreateForm, setShowCreateForm] =
      useState(false);
  
    const [selectedTicket, setSelectedTicket] =
      useState(null);
  
    const [submitting, setSubmitting] =
      useState(false);
  
  
    // ==============================================================
    // CREATE FORM
    // ==============================================================
  
    const [form, setForm] =
      useState({
        category: "",
        subject: "",
        description: "",
        department: "general",
        priority: "medium",
      });
  
  
    // ==============================================================
    // LOAD TICKETS
    // ==============================================================
  
    const loadTickets = useCallback(
      async (showLoader = true) => {
  
        try {
  
          if (showLoader) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }
  
          const data =
            await getMyTickets();
  
          setTickets(
            Array.isArray(data)
              ? data
              : []
          );
  
        } catch (err) {
  
          console.error(
            "Failed to load tickets:",
            err
          );
  
          toast.error(
            err?.response?.data?.detail ||
              "Failed to load tickets."
          );
  
        } finally {
  
          setLoading(false);
          setRefreshing(false);
  
        }
  
      },
      []
    );
  
  
    // ==============================================================
    // INITIAL LOAD
    // ==============================================================
  
    useEffect(() => {
  
      loadTickets();
  
    }, [loadTickets]);
  
  
    // ==============================================================
    // ESCAPE KEY / BODY LOCK
    // ==============================================================
  
    useEffect(() => {
  
      if (
        !selectedTicket &&
        !showCreateForm
      ) {
        return;
      }
  
      const handleKeyDown = (
        event
      ) => {
  
        if (
          event.key === "Escape" &&
          !submitting
        ) {
  
          if (showCreateForm) {
            setShowCreateForm(false);
          }
  
          if (selectedTicket) {
            setSelectedTicket(null);
          }
  
        }
  
      };
  
      document.addEventListener(
        "keydown",
        handleKeyDown
      );
  
      document.body.style.overflow =
        "hidden";
  
      return () => {
  
        document.removeEventListener(
          "keydown",
          handleKeyDown
        );
  
        document.body.style.overflow =
          "";
  
      };
  
    }, [
      selectedTicket,
      showCreateForm,
      submitting,
    ]);
  
  
    // ==============================================================
    // FORM CHANGE
    // ==============================================================
  
    const handleChange = (
      event
    ) => {
  
      const {
        name,
        value,
      } = event.target;
  
      setForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
  
    };
  
  
    // ==============================================================
    // CREATE TICKET
    // ==============================================================
  
    const handleCreateTicket =
      async (event) => {
  
        event.preventDefault();
  
  
        if (!form.category) {
  
          toast.error(
            "Please select a category."
          );
  
          return;
        }
  
  
        if (!form.subject.trim()) {
  
          toast.error(
            "Please enter a subject."
          );
  
          return;
        }
  
  
        if (
          form.subject.trim().length <
          3
        ) {
  
          toast.error(
            "Subject must contain at least 3 characters."
          );
  
          return;
        }
  
  
        if (!form.description.trim()) {
  
          toast.error(
            "Please describe your issue."
          );
  
          return;
        }
  
  
        if (
          form.description.trim().length <
          5
        ) {
  
          toast.error(
            "Please provide a little more detail about your issue."
          );
  
          return;
        }
  
  
        try {
  
          setSubmitting(true);
  
          const newTicket =
            await createTicket({
  
              category:
                form.category,
  
              subject:
                form.subject.trim(),
  
              description:
                form.description.trim(),
  
              department:
                form.department,
  
              priority:
                form.priority,
  
            });
  
  
          setTickets(
            (previous) => [
              newTicket,
              ...previous,
            ]
          );
  
  
          setForm({
  
            category: "",
  
            subject: "",
  
            description: "",
  
            department: "general",
  
            priority: "medium",
  
          });
  
  
          setShowCreateForm(
            false
          );
  
  
          toast.success(
            `Ticket ${newTicket.ticket_number} created successfully.`
          );
  
        } catch (err) {
  
          console.error(
            "Failed to create ticket:",
            err
          );
  
          toast.error(
            err?.response?.data?.detail ||
              "Failed to create ticket."
          );
  
        } finally {
  
          setSubmitting(false);
  
        }
  
      };
  
  
    // ==============================================================
    // SUMMARY
    // ==============================================================
  
    const summary =
      useMemo(() => {
  
        return {
  
          total:
            tickets.length,
  
          open:
            tickets.filter(
              (ticket) =>
                normalize(
                  ticket.status
                ) === "open"
            ).length,
  
          inProgress:
            tickets.filter(
              (ticket) =>
                normalize(
                  ticket.status
                ) === "in_progress"
            ).length,
  
          waiting:
            tickets.filter(
              (ticket) =>
                normalize(
                  ticket.status
                ) ===
                "waiting_for_student"
            ).length,
  
          resolved:
            tickets.filter(
              (ticket) =>
                [
                  "resolved",
                  "closed",
                ].includes(
                  normalize(
                    ticket.status
                  )
                )
            ).length,
  
        };
  
      }, [tickets]);
  
  
    // ==============================================================
    // OPEN CREATE FORM
    // ==============================================================
  
    const openCreateForm = () => {
  
      setSelectedTicket(null);
  
      setShowCreateForm(true);
  
    };
  
  
    // ==============================================================
    // OPEN TICKET
    // ==============================================================
  
    const openTicket = (
      ticket
    ) => {
  
      setShowCreateForm(false);
  
      setSelectedTicket(
        ticket
      );
  
    };
  
  
    // ==============================================================
    // RENDER
    // ==============================================================
  
    return (
      <Layout>
  
        <div className="space-y-6">
  
  
          {/* ======================================================
              HEADER
          ====================================================== */}
  
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
  
            <div className="flex items-center gap-3">
  
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 shadow-sm">
  
                <Ticket
                  size={23}
                  className="text-white"
                />
  
              </div>
  
              <div>
  
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  CampusFlow AI
                </p>
  
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  My Support Tickets
                </h1>
  
                <p className="mt-1 text-sm text-gray-500">
                  Raise an issue and track its resolution.
                </p>
  
              </div>
  
            </div>
  
  
            <div className="flex flex-wrap gap-3">
  
              <button
                type="button"
                onClick={() =>
                  loadTickets(false)
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
  
  
              <button
                type="button"
                onClick={
                  openCreateForm
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
              >
  
                <Plus size={17} />
  
                New Ticket
  
              </button>
  
            </div>
  
          </div>
  
  
          {/* ======================================================
              SUMMARY
          ====================================================== */}
  
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  
            <SummaryCard
              title="Total Tickets"
              value={summary.total}
              description="All your support requests"
              icon={Ticket}
            />
  
            <SummaryCard
              title="Open"
              value={summary.open}
              description="Waiting for review"
              icon={AlertCircle}
            />
  
            <SummaryCard
              title="In Progress"
              value={summary.inProgress}
              description="Currently being handled"
              icon={Clock3}
            />
  
            <SummaryCard
              title="Resolved"
              value={summary.resolved}
              description="Resolved or closed"
              icon={CheckCircle2}
            />
  
          </div>
  
  
          {/* ======================================================
              CREATE FORM
          ====================================================== */}
  
          {showCreateForm && (
  
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
  
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
  
                <div>
  
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Support
                  </p>
  
                  <h2 className="mt-1 text-lg font-bold text-gray-900">
                    Create Support Ticket
                  </h2>
  
                  <p className="mt-1 text-sm text-gray-500">
                    Tell us what went wrong and the campus team will review it.
                  </p>
  
                </div>
  
  
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                  disabled={submitting}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                >
  
                  <X size={20} />
  
                </button>
  
              </div>
  
  
              <form
                onSubmit={
                  handleCreateTicket
                }
                className="space-y-5 p-6"
              >
  
  
                {/* CATEGORY + DEPARTMENT */}
  
                <div className="grid gap-5 md:grid-cols-2">
  
  
                  {/* CATEGORY */}
  
                  <div>
  
                    <label
                      htmlFor="ticket-category"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Category
                    </label>
  
                    <select
                      id="ticket-category"
                      name="category"
                      value={
                        form.category
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                    >
  
                      <option value="">
                        Select category
                      </option>
  
                      {CATEGORIES.map(
                        (category) => (
  
                          <option
                            key={category}
                            value={category}
                          >
                            {formatText(
                              category
                            )}
                          </option>
  
                        )
                      )}
  
                    </select>
  
                  </div>
  
  
                  {/* DEPARTMENT */}
  
                  <div>
  
                    <label
                      htmlFor="ticket-department"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Department
                    </label>
  
                    <select
                      id="ticket-department"
                      name="department"
                      value={
                        form.department
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                    >
  
                      {DEPARTMENTS.map(
                        (department) => (
  
                          <option
                            key={
                              department
                            }
                            value={
                              department
                            }
                          >
                            {formatText(
                              department
                            )}
                          </option>
  
                        )
                      )}
  
                    </select>
  
                  </div>
  
                </div>
  
  
                {/* SUBJECT */}
  
                <div>
  
                  <label
                    htmlFor="ticket-subject"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Subject
                  </label>
  
                  <input
                    id="ticket-subject"
                    type="text"
                    name="subject"
                    value={
                      form.subject
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Uploaded documents are still showing as pending"
                    maxLength={255}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                  />
  
                  <div className="mt-1 text-right text-xs text-gray-400">
                    {form.subject.length}/255
                  </div>
  
                </div>
  
  
                {/* DESCRIPTION */}
  
                <div>
  
                  <label
                    htmlFor="ticket-description"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Describe Your Issue
                  </label>
  
                  <textarea
                    id="ticket-description"
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    rows={6}
                    placeholder="Explain what happened, what you already tried, and what help you need..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                  />
  
                  <div className="mt-1 flex justify-between text-xs text-gray-400">
  
                    <span>
                      Please provide enough detail for the support team.
                    </span>
  
                    <span>
                      {
                        form.description
                          .length
                      }{" "}
                      characters
                    </span>
  
                  </div>
  
                </div>
  
  
                {/* PRIORITY */}
  
                <div className="max-w-sm">
  
                  <label
                    htmlFor="ticket-priority"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Priority
                  </label>
  
                  <select
                    id="ticket-priority"
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                  >
  
                    {PRIORITIES.map(
                      (priority) => (
  
                        <option
                          key={priority}
                          value={priority}
                        >
                          {formatText(
                            priority
                          )}
                        </option>
  
                      )
                    )}
  
                  </select>
  
                </div>
  
  
                {/* FORM FOOTER */}
  
                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
  
                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateForm(
                        false
                      )
                    }
                    disabled={submitting}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
  
  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
  
                    {submitting ? (
  
                      <>
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />
  
                        Submitting...
  
                      </>
  
                    ) : (
  
                      <>
                        <Send size={16} />
  
                        Submit Ticket
  
                      </>
  
                    )}
  
                  </button>
  
                </div>
  
              </form>
  
            </div>
  
          )}
  
  
          {/* ======================================================
              TICKETS LIST
          ====================================================== */}
  
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
  
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
  
              <div>
  
                <h2 className="text-lg font-bold text-gray-900">
                  My Tickets
                </h2>
  
                <p className="mt-1 text-sm text-gray-500">
                  View your submitted issues and support responses.
                </p>
  
              </div>
  
              <span className="hidden text-xs font-medium text-gray-400 sm:block">
                {tickets.length} ticket
                {tickets.length === 1
                  ? ""
                  : "s"}
              </span>
  
            </div>
  
  
            {/* LOADING */}
  
            {loading ? (
  
              <div className="flex min-h-[320px] items-center justify-center">
  
                <div className="text-center">
  
                  <RefreshCw
                    size={28}
                    className="mx-auto animate-spin text-gray-400"
                  />
  
                  <p className="mt-3 text-sm font-medium text-gray-500">
                    Loading your tickets...
                  </p>
  
                </div>
  
              </div>
  
            ) : tickets.length === 0 ? (
  
              /* EMPTY */
  
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
  
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
  
                  <Ticket
                    size={28}
                    className="text-gray-400"
                  />
  
                </div>
  
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  No tickets yet
                </h3>
  
                <p className="mt-1 max-w-md text-sm leading-6 text-gray-500">
                  If you have a problem with fees, documents, admission, academics, or another campus service, create a support ticket.
                </p>
  
                <button
                  type="button"
                  onClick={
                    openCreateForm
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
  
                  <Plus size={16} />
  
                  Create Your First Ticket
  
                </button>
  
              </div>
  
            ) : (
  
              /* LIST */
  
              <div className="divide-y divide-gray-100">
  
                {tickets.map(
                  (ticket) => {
  
                    const status =
                      getStatusConfig(
                        ticket.status
                      );
  
                    const StatusIcon =
                      status.icon;
  
                    const hasResponse =
                      Boolean(
                        ticket.resolution
                      );
  
                    return (
  
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() =>
                          openTicket(
                            ticket
                          )
                        }
                        className="group w-full text-left transition hover:bg-gray-50"
                      >
  
                        <div className="px-6 py-5">
  
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
  
  
                            {/* LEFT */}
  
                            <div className="flex min-w-0 items-start gap-4">
  
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
  
                                <Ticket
                                  size={20}
                                  className="text-gray-600"
                                />
  
                              </div>
  
  
                              <div className="min-w-0">
  
                                <div className="flex flex-wrap items-center gap-2">
  
                                  <p className="font-semibold text-gray-900">
                                    {
                                      ticket.subject
                                    }
                                  </p>
  
                                </div>
  
  
                                <p className="mt-1 font-mono text-xs font-medium text-gray-400">
                                  {
                                    ticket.ticket_number
                                  }
                                </p>
  
  
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                                  {
                                    ticket.description
                                  }
                                </p>
  
  
                                <div className="mt-3 flex flex-wrap items-center gap-2">
  
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
  
                                    <Tag
                                      size={11}
                                    />
  
                                    {formatText(
                                      ticket.category
                                    )}
  
                                  </span>
  
  
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
  
                                    <Building2
                                      size={11}
                                    />
  
                                    {formatText(
                                      ticket.department
                                    )}
  
                                  </span>
  
                                </div>
  
                              </div>
  
                            </div>
  
  
                            {/* RIGHT */}
  
                            <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
  
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                              >
  
                                <StatusIcon
                                  size={13}
                                />
  
                                {status.label}
  
                              </span>
  
  
                              <span
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getPriorityClass(
                                  ticket.priority
                                )}`}
                              >
                                {formatText(
                                  ticket.priority
                                )}
                              </span>
  
                            </div>
  
                          </div>
  
  
                          {/* RESPONSE PREVIEW */}
  
                          {hasResponse && (
  
                            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
  
                              <div className="flex items-start gap-3">
  
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
  
                                  <MessageSquare
                                    size={15}
                                    className="text-emerald-600"
                                  />
  
                                </div>
  
  
                                <div className="min-w-0">
  
                                  <div className="flex flex-wrap items-center gap-2">
  
                                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                      Campus Support Response
                                    </p>
  
                                    {normalize(
                                      ticket.status
                                    ) ===
                                      "resolved" && (
  
                                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                        Resolved
                                      </span>
  
                                    )}
  
                                  </div>
  
  
                                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-emerald-900">
                                    {
                                      ticket.resolution
                                    }
                                  </p>
  
                                </div>
  
                              </div>
  
                            </div>
  
                          )}
  
  
                          {/* UPDATED */}
  
                          <div className="mt-4 flex items-center justify-between">
  
                            <p className="text-xs text-gray-400">
                              Updated{" "}
                              {
                                getRelativeTime(
                                  ticket.updated_at
                                )
                              }
                            </p>
  
  
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 transition group-hover:text-gray-700">
  
                              View Details
  
                              <ChevronRight
                                size={14}
                              />
  
                            </span>
  
                          </div>
  
                        </div>
  
                      </button>
  
                    );
                  }
                )}
  
              </div>
  
            )}
  
          </div>
  
        </div>
  
  
        {/* ========================================================
            TICKET DETAILS MODAL
        ======================================================== */}
  
        {selectedTicket && (
  
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
  
              if (
                event.target ===
                event.currentTarget
              ) {
  
                setSelectedTicket(
                  null
                );
  
              }
  
            }}
          >
  
            <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
  
  
              {/* ==================================================
                  MODAL HEADER
              ================================================== */}
  
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
  
                <div className="flex min-w-0 items-center gap-3">
  
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900">
  
                    <Ticket
                      size={21}
                      className="text-white"
                    />
  
                  </div>
  
  
                  <div className="min-w-0">
  
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Support Ticket
                    </p>
  
                    <div className="mt-1 flex flex-wrap items-center gap-2">
  
                      <h2 className="font-mono text-lg font-bold text-gray-900">
                        {
                          selectedTicket.ticket_number
                        }
                      </h2>
  
                      <StatusBadge
                        status={
                          selectedTicket.status
                        }
                      />
  
                    </div>
  
                  </div>
  
                </div>
  
  
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTicket(
                      null
                    )
                  }
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
  
                  <X size={21} />
  
                </button>
  
              </div>
  
  
              {/* ==================================================
                  MODAL BODY
              ================================================== */}
  
              <div className="overflow-y-auto">
  
                <div className="space-y-5 p-6">
  
  
                  {/* =================================================
                      CURRENT STATUS
                  ================================================= */}
  
                  <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
  
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
  
                      <div>
  
                        <h3 className="text-sm font-bold text-gray-900">
                          Ticket Status
                        </h3>
  
                        <p className="mt-1 text-xs text-gray-500">
  
                          {
                            getStatusConfig(
                              selectedTicket.status
                            ).description
                          }
  
                        </p>
  
                      </div>
  
                      <StatusBadge
                        status={
                          selectedTicket.status
                        }
                      />
  
                    </div>
  
  
                    <StatusProgress
                      currentStatus={
                        selectedTicket.status
                      }
                    />
  
                  </section>
  
  
                  {/* =================================================
                      ADMIN RESPONSE
                  ================================================= */}
  
                  {selectedTicket.resolution && (
  
                    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
  
                      <div className="flex items-start gap-3">
  
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
  
                          <MessageSquare
                            size={18}
                            className="text-emerald-600"
                          />
  
                        </div>
  
  
                        <div className="min-w-0 flex-1">
  
                          <div className="flex flex-wrap items-center gap-2">
  
                            <h3 className="text-sm font-bold text-emerald-900">
                              Response from Campus Support
                            </h3>
  
                            {[
                              "resolved",
                              "closed",
                            ].includes(
                              normalize(
                                selectedTicket.status
                              )
                            ) && (
  
                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                Issue Resolved
                              </span>
  
                            )}
  
                          </div>
  
  
                          <p className="mt-1 text-xs text-emerald-700">
                            The support team has responded to your ticket.
                          </p>
  
  
                          <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-4">
  
                            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                              {
                                selectedTicket.resolution
                              }
                            </p>
  
                          </div>
  
  
                          {[
                            "resolved",
                            "closed",
                          ].includes(
                            normalize(
                              selectedTicket.status
                            )
                          ) && (
  
                            <div className="mt-4 rounded-xl bg-emerald-100/70 p-3">
  
                              <p className="text-xs font-semibold text-emerald-800">
                                What should you do next?
                              </p>
  
                              <p className="mt-1 text-xs leading-5 text-emerald-700">
                                Follow the instructions in the response above. If the issue is fixed, no further action is required.
                              </p>
  
                            </div>
  
                          )}
  
                        </div>
  
                      </div>
  
                    </section>
  
                  )}
  
  
                  {/* =================================================
                      WAITING FOR STUDENT
                  ================================================= */}
  
                  {normalize(
                    selectedTicket.status
                  ) ===
                    "waiting_for_student" && (
  
                    <section className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
  
                      <div className="flex items-start gap-3">
  
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
  
                          <UserRound
                            size={18}
                            className="text-purple-600"
                          />
  
                        </div>
  
                        <div>
  
                          <h3 className="text-sm font-bold text-purple-900">
                            Action Required From You
                          </h3>
  
                          <p className="mt-1 text-sm leading-6 text-purple-700">
                            The campus team is waiting for information or action from you. Please check the support response above and provide the requested information if necessary.
                          </p>
  
                        </div>
  
                      </div>
  
                    </section>
  
                  )}
  
  
                  {/* =================================================
                      ESCALATION
                  ================================================= */}
  
                  {selectedTicket.escalation_reason && (
  
                    <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
  
                      <div className="flex items-start gap-3">
  
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
  
                          <AlertCircle
                            size={18}
                            className="text-red-600"
                          />
  
                        </div>
  
  
                        <div>
  
                          <h3 className="text-sm font-bold text-red-900">
                            Ticket Escalated
                          </h3>
  
                          <p className="mt-1 text-xs text-red-700">
                            Your issue has been forwarded for further review.
                          </p>
  
  
                          <div className="mt-3 rounded-xl border border-red-100 bg-white p-4">
  
                            <p className="whitespace-pre-wrap text-sm leading-6 text-red-800">
                              {
                                selectedTicket.escalation_reason
                              }
                            </p>
  
                          </div>
  
                        </div>
  
                      </div>
  
                    </section>
  
                  )}
  
  
                  {/* =================================================
                      STUDENT PROBLEM
                  ================================================= */}
  
                  <section className="rounded-2xl border border-gray-200 bg-white p-5">
  
                    <div className="mb-4 flex items-center gap-3">
  
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
  
                        <MessageSquare
                          size={17}
                          className="text-white"
                        />
  
                      </div>
  
                      <div>
  
                        <h3 className="text-sm font-bold text-gray-900">
                          Your Problem
                        </h3>
  
                        <p className="text-xs text-gray-400">
                          Issue submitted by you
                        </p>
  
                      </div>
  
                    </div>
  
  
                    {/* SUBJECT */}
  
                    <div className="rounded-xl bg-gray-50 p-4">
  
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        Subject
                      </p>
  
                      <p className="mt-2 text-base font-bold text-gray-900">
                        {
                          selectedTicket.subject
                        }
                      </p>
  
                    </div>
  
  
                    {/* DESCRIPTION */}
  
                    <div className="mt-3 rounded-xl border border-gray-100 p-4">
  
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        Description
                      </p>
  
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                        {
                          selectedTicket.description
                        }
                      </p>
  
                    </div>
  
                  </section>
  
  
                  {/* =================================================
                      TICKET INFORMATION
                  ================================================= */}
  
                  <section className="rounded-2xl border border-gray-200 bg-white p-5">
  
                    <div className="mb-4 flex items-center gap-3">
  
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
  
                        <Tag
                          size={17}
                          className="text-gray-700"
                        />
  
                      </div>
  
                      <div>
  
                        <h3 className="text-sm font-bold text-gray-900">
                          Ticket Information
                        </h3>
  
                        <p className="text-xs text-gray-400">
                          Ticket details
                        </p>
  
                      </div>
  
                    </div>
  
  
                    <div className="grid gap-3 sm:grid-cols-2">
  
  
                      {/* CATEGORY */}
  
                      <InfoItem
                        icon={Tag}
                        label="Category"
                        value={formatText(
                          selectedTicket.category
                        )}
                      />
  
  
                      {/* DEPARTMENT */}
  
                      <InfoItem
                        icon={Building2}
                        label="Department"
                        value={formatText(
                          selectedTicket.department
                        )}
                      />
  
  
                      {/* PRIORITY */}
  
                      <div className="rounded-xl bg-gray-50 p-4">
  
                        <div className="flex items-center gap-2">
  
                          <Flag
                            size={15}
                            className="text-gray-400"
                          />
  
                          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                            Priority
                          </p>
  
                        </div>
  
                        <div className="mt-2">
  
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityClass(
                              selectedTicket.priority
                            )}`}
                          >
                            {formatText(
                              selectedTicket.priority
                            )}
                          </span>
  
                        </div>
  
                      </div>
  
  
                      {/* CREATED */}
  
                      <InfoItem
                        icon={CalendarDays}
                        label="Created"
                        value={formatDate(
                          selectedTicket.created_at
                        )}
                      />
  
  
                      {/* UPDATED */}
  
                      <InfoItem
                        icon={Clock3}
                        label="Last Updated"
                        value={formatDate(
                          selectedTicket.updated_at
                        )}
                      />
  
                    </div>
  
                  </section>
  
  
                  {/* =================================================
                      RESOLVED NOTICE
                  ================================================= */}
  
                  {[
                    "resolved",
                    "closed",
                  ].includes(
                    normalize(
                      selectedTicket.status
                    )
                  ) && (
  
                    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
  
                      <div className="flex items-start gap-3">
  
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
  
                          <CheckCircle2
                            size={19}
                            className="text-emerald-600"
                          />
  
                        </div>
  
  
                        <div>
  
                          <h3 className="text-sm font-bold text-emerald-900">
                            {normalize(
                              selectedTicket.status
                            ) === "closed"
                              ? "Ticket Closed"
                              : "Issue Resolved"}
                          </h3>
  
                          <p className="mt-1 text-sm leading-6 text-emerald-700">
  
                            {normalize(
                              selectedTicket.status
                            ) === "closed"
                              ? "This support request has been completed and closed."
                              : "The campus support team has marked this issue as resolved. Please follow the response provided above."}
  
                          </p>
  
                        </div>
  
                      </div>
  
                    </section>
  
                  )}
  
                </div>
  
              </div>
  
  
              {/* ==================================================
                  MODAL FOOTER
              ================================================== */}
  
              <div className="flex justify-end border-t border-gray-200 px-6 py-4">
  
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTicket(
                      null
                    )
                  }
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Close
                </button>
  
              </div>
  
            </div>
  
          </div>
  
        )}
  
      </Layout>
    );
  }
  
  

  // INFO ITEM

  
  function InfoItem({
    icon: Icon,
    label,
    value,
  }) {
  
    return (
  
      <div className="rounded-xl bg-gray-50 p-4">
  
        <div className="flex items-center gap-2">
  
          <Icon
            size={15}
            className="text-gray-400"
          />
  
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
            {label}
          </p>
  
        </div>
  
        <p className="mt-2 text-sm font-semibold text-gray-900">
          {value || "—"}
        </p>
  
      </div>
  
    );
  }
  
  
  export default StudentTickets;