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
    RefreshCw,
    Save,
    Search,
    Send,
    Tag,
    Ticket,
    UserRound,
    X,
  } from "lucide-react";
  
  import toast from "react-hot-toast";
  
  import Layout from "../../components/layout/Layout";
  
  import {
    getAllTickets,
    updateTicket,
  } from "../../services/ticket";
  
  

  // CONSTANTS

  
  const STATUSES = [
    "open",
    "in_progress",
    "waiting_for_student",
    "escalated",
    "resolved",
    "closed",
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
  
  

  // STATUS CONFIG

  
  const STATUS_CONFIG = {
    open: {
      label: "Open",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
      icon: Ticket,
    },
  
    in_progress: {
      label: "In Progress",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    },
  
    waiting_for_student: {
      label: "Waiting for Student",
      className:
        "bg-purple-50 text-purple-700 border-purple-200",
      icon: UserRound,
    },
  
    escalated: {
      label: "Escalated",
      className:
        "bg-red-50 text-red-700 border-red-200",
      icon: AlertCircle,
    },
  
    resolved: {
      label: "Resolved",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
  
    closed: {
      label: "Closed",
      className:
        "bg-slate-100 text-slate-700 border-slate-200",
      icon: Check,
    },
  };
  
  

  // PRIORITY CONFIG

  
  const PRIORITY_CONFIG = {
    low: {
      label: "Low",
      className:
        "bg-slate-50 text-slate-600 border-slate-200",
    },
  
    medium: {
      label: "Medium",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
    },
  
    high: {
      label: "High",
      className:
        "bg-orange-50 text-orange-700 border-orange-200",
    },
  
    urgent: {
      label: "Urgent",
      className:
        "bg-red-50 text-red-700 border-red-200",
    },
  };
  
  

  // HELPERS

  
  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();
  
  
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
  
  
  const getPriorityConfig = (priority) => {
    return (
      PRIORITY_CONFIG[
        normalize(priority)
      ] ||
      PRIORITY_CONFIG.medium
    );
  };
  
  

  // STATUS BADGE

  
  function StatusBadge({ status }) {
    const config =
      getStatusConfig(status);
  
    const Icon = config.icon;
  
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
      >
        <Icon size={13} />
  
        {config.label}
      </span>
    );
  }
  
  

  // PRIORITY BADGE

  
  function PriorityBadge({
    priority,
  }) {
    const config =
      getPriorityConfig(priority);
  
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
      >
        <Flag size={12} />
  
        {config.label}
      </span>
    );
  }
  
  

  // SUMMARY CARD

  
  function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    active,
    onClick,
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
          active
            ? "border-gray-900 ring-2 ring-gray-900/5"
            : "border-gray-200"
        }`}
      >
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
  
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition group-hover:scale-105 ${
              active
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Icon size={19} />
          </div>
  
        </div>
      </button>
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
  
  

  // STATUS WORKFLOW

  
  function StatusWorkflow({
    currentStatus,
  }) {
    const currentIndex =
      STATUSES.indexOf(
        normalize(currentStatus)
      );
  
    return (
      <div className="overflow-x-auto">
  
        <div className="flex min-w-[760px] items-center">
  
          {STATUSES.map(
            (status, index) => {
  
              const isCurrent =
                normalize(
                  currentStatus
                ) === status;
  
              const completed =
                currentIndex >= 0 &&
                index < currentIndex;
  
              const config =
                getStatusConfig(status);
  
              const Icon =
                config.icon;
  
              return (
                <div
                  key={status}
                  className="flex flex-1 items-center"
                >
  
                  <div className="flex min-w-[100px] flex-col items-center">
  
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                        isCurrent
                          ? "border-gray-900 bg-gray-900 text-white shadow-md"
                          : completed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-200 bg-white text-gray-400"
                      }`}
                    >
  
                      {completed ? (
                        <Check size={15} />
                      ) : (
                        <Icon size={15} />
                      )}
  
                    </div>
  
                    <p
                      className={`mt-2 text-center text-[10px] font-semibold ${
                        isCurrent
                          ? "text-gray-900"
                          : completed
                          ? "text-emerald-600"
                          : "text-gray-400"
                      }`}
                    >
                      {config.label}
                    </p>
  
                  </div>
  
  
                  {index <
                    STATUSES.length -
                      1 && (
  
                    <div
                      className={`mb-5 h-0.5 flex-1 ${
                        index <
                        currentIndex
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
  
  

  // MAIN COMPONENT

  
  function Tickets() {
  
    const [tickets, setTickets] =
      useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [refreshing, setRefreshing] =
      useState(false);
  
    const [error, setError] =
      useState("");
  
    const [selectedTicket, setSelectedTicket] =
      useState(null);
  
    const [search, setSearch] =
      useState("");
  
    const [statusFilter, setStatusFilter] =
      useState("");
  
    const [priorityFilter, setPriorityFilter] =
      useState("");
  
    const [departmentFilter, setDepartmentFilter] =
      useState("");
  
    const [saving, setSaving] =
      useState(false);
  
  
    // ==============================================================
    // EDIT FORM
    // ==============================================================
  
    const [editForm, setEditForm] =
      useState({
        status: "open",
        priority: "medium",
        department: "general",
        resolution: "",
        escalation_reason: "",
      });
  
  
    // ==============================================================
    // LOAD TICKETS
    // ==============================================================
  
    const loadTickets = useCallback(
      async (showLoader = true) => {
  
        try {
  
          setError("");
  
          if (showLoader) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }
  
          const params = {};
  
          if (statusFilter) {
            params.status =
              statusFilter;
          }
  
          if (priorityFilter) {
            params.priority =
              priorityFilter;
          }
  
          if (departmentFilter) {
            params.department =
              departmentFilter;
          }
  
          const data =
            await getAllTickets(params);
  
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
  
          const message =
            err?.response?.data?.detail ||
            "Failed to load tickets.";
  
          setError(message);
  
          toast.error(message);
  
        } finally {
  
          setLoading(false);
          setRefreshing(false);
  
        }
  
      },
      [
        statusFilter,
        priorityFilter,
        departmentFilter,
      ]
    );
  
  
    // ==============================================================
    // INITIAL LOAD / FILTER CHANGE
    // ==============================================================
  
    useEffect(() => {
  
      loadTickets();
  
    }, [loadTickets]);
  
  
    // ==============================================================
    // MODAL KEYBOARD / BODY LOCK
    // ==============================================================
  
    useEffect(() => {
  
      if (!selectedTicket) {
        return;
      }
  
      const handleKeyDown = (
        event
      ) => {
  
        if (
          event.key === "Escape" &&
          !saving
        ) {
          setSelectedTicket(null);
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
      saving,
    ]);
  
  
    // ==============================================================
    // OPEN TICKET
    // ==============================================================
  
    const openTicket = (
      ticket
    ) => {
  
      setSelectedTicket(ticket);
  
      setEditForm({
  
        status:
          normalize(
            ticket.status
          ) || "open",
  
        priority:
          normalize(
            ticket.priority
          ) || "medium",
  
        department:
          normalize(
            ticket.department
          ) || "general",
  
        resolution:
          ticket.resolution || "",
  
        escalation_reason:
          ticket.escalation_reason ||
          "",
  
      });
  
    };
  
  
    // ==============================================================
    // CLOSE MODAL
    // ==============================================================
  
    const closeTicket = () => {
  
      if (saving) {
        return;
      }
  
      setSelectedTicket(null);
  
    };
  
  
    // ==============================================================
    // FORM CHANGE
    // ==============================================================
  
    const handleEditChange = (
      event
    ) => {
  
      const {
        name,
        value,
      } = event.target;
  
      setEditForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
  
    };
  
  
    // ==============================================================
    // QUICK RESOLVE
    // ==============================================================
  
    const handleResolveTicket = () => {
  
      setEditForm(
        (previous) => ({
          ...previous,
          status: "resolved",
        })
      );
  
      setTimeout(() => {
  
        document
          .getElementById(
            "ticket-resolution"
          )
          ?.focus();
  
      }, 100);
  
    };
  
  
    // ==============================================================
    // UPDATE TICKET
    // ==============================================================
  
    const handleUpdateTicket =
      async (event) => {
  
        event.preventDefault();
  
        if (!selectedTicket) {
          return;
        }
  
        const status =
          normalize(
            editForm.status
          );
  
  
        // ----------------------------------------------------------
        // STATUS VALIDATION
        // ----------------------------------------------------------
  
        if (!status) {
  
          toast.error(
            "Please select a status."
          );
  
          return;
        }
  
  
        // ----------------------------------------------------------
        // RESOLUTION VALIDATION
        // ----------------------------------------------------------
  
        if (
          status === "resolved" &&
          !editForm.resolution.trim()
        ) {
  
          toast.error(
            "Please write a response to the student before resolving this ticket."
          );
  
          document
            .getElementById(
              "ticket-resolution"
            )
            ?.focus();
  
          return;
        }
  
  
        // ----------------------------------------------------------
        // ESCALATION VALIDATION
        // ----------------------------------------------------------
  
        if (
          status === "escalated" &&
          !editForm.escalation_reason.trim()
        ) {
  
          toast.error(
            "Please enter an escalation reason."
          );
  
          document
            .getElementById(
              "ticket-escalation"
            )
            ?.focus();
  
          return;
        }
  
  
        try {
  
          setSaving(true);
  
  
          const payload = {
  
            status:
              editForm.status,
  
            priority:
              editForm.priority,
  
            department:
              editForm.department,
  
            resolution:
              editForm.resolution.trim()
                ? editForm.resolution.trim()
                : null,
  
            escalation_reason:
              editForm.escalation_reason.trim()
                ? editForm.escalation_reason.trim()
                : null,
  
          };
  
  
          const updatedTicket =
            await updateTicket(
              selectedTicket.id,
              payload
            );
  
  
          // --------------------------------------------------------
          // UPDATE LOCAL LIST
          // --------------------------------------------------------
  
          setTickets(
            (previous) =>
              previous
                .map((ticket) =>
                  ticket.id ===
                  updatedTicket.id
                    ? updatedTicket
                    : ticket
                )
                .filter((ticket) => {
  
                  const matchesStatus =
                    !statusFilter ||
                    normalize(
                      ticket.status
                    ) ===
                      normalize(
                        statusFilter
                      );
  
                  const matchesPriority =
                    !priorityFilter ||
                    normalize(
                      ticket.priority
                    ) ===
                      normalize(
                        priorityFilter
                      );
  
                  const matchesDepartment =
                    !departmentFilter ||
                    normalize(
                      ticket.department
                    ) ===
                      normalize(
                        departmentFilter
                      );
  
                  return (
                    matchesStatus &&
                    matchesPriority &&
                    matchesDepartment
                  );
  
                })
          );
  
  
          // --------------------------------------------------------
          // UPDATE MODAL
          // --------------------------------------------------------
  
          setSelectedTicket(
            updatedTicket
          );
  
          setEditForm({
  
            status:
              normalize(
                updatedTicket.status
              ) || "open",
  
            priority:
              normalize(
                updatedTicket.priority
              ) || "medium",
  
            department:
              normalize(
                updatedTicket.department
              ) || "general",
  
            resolution:
              updatedTicket.resolution ||
              "",
  
            escalation_reason:
              updatedTicket.escalation_reason ||
              "",
  
          });
  
  
          // --------------------------------------------------------
          // SUCCESS MESSAGE
          // --------------------------------------------------------
  
          if (
            normalize(
              updatedTicket.status
            ) === "resolved"
          ) {
  
            toast.success(
              "Ticket resolved. Response saved for the student."
            );
  
          } else {
  
            toast.success(
              "Ticket updated successfully."
            );
  
          }
  
        } catch (err) {
  
          console.error(
            "Failed to update ticket:",
            err
          );
  
          toast.error(
            err?.response?.data?.detail ||
              "Failed to update ticket."
          );
  
        } finally {
  
          setSaving(false);
  
        }
  
      };
  
  
    // ==============================================================
    // SEARCH
    // ==============================================================
  
    const filteredTickets =
      useMemo(() => {
  
        const query =
          search
            .trim()
            .toLowerCase();
  
        if (!query) {
          return tickets;
        }
  
        return tickets.filter(
          (ticket) => {
  
            return (
  
              String(
                ticket.ticket_number ||
                  ""
              )
                .toLowerCase()
                .includes(query) ||
  
              String(
                ticket.subject ||
                  ""
              )
                .toLowerCase()
                .includes(query) ||
  
              String(
                ticket.description ||
                  ""
              )
                .toLowerCase()
                .includes(query) ||
  
              String(
                ticket.category ||
                  ""
              )
                .toLowerCase()
                .includes(query) ||
  
              String(
                ticket.department ||
                  ""
              )
                .toLowerCase()
                .includes(query) ||
  
              String(
                ticket.student_id ||
                  ""
              ).includes(query)
  
            );
  
          }
        );
  
      }, [
        tickets,
        search,
      ]);
  
  
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
                ) ===
                "in_progress"
            ).length,
  
          waiting:
            tickets.filter(
              (ticket) =>
                normalize(
                  ticket.status
                ) ===
                "waiting_for_student"
            ).length,
  
          escalated:
            tickets.filter(
              (ticket) =>
                normalize(
                  ticket.status
                ) === "escalated"
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
    // CLEAR FILTERS
    // ==============================================================
  
    const clearFilters = () => {
  
      setSearch("");
  
      setStatusFilter("");
  
      setPriorityFilter("");
  
      setDepartmentFilter("");
  
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
  
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 shadow-lg">
  
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
                  Support Tickets
                </h1>
  
                <p className="mt-1 text-sm text-gray-500">
                  Manage student support requests and campus issues.
                </p>
  
              </div>
  
            </div>
  
  
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
  
          </div>
  
  
          {/* ======================================================
              ERROR
          ====================================================== */}
  
          {error && (
  
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
  
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />
  
              <div className="flex-1">
  
                <p className="text-sm font-bold text-red-800">
                  Unable to load tickets
                </p>
  
                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
  
              </div>
  
              <button
                type="button"
                onClick={() =>
                  loadTickets()
                }
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                Retry
              </button>
  
            </div>
  
          )}
  
  
          {/* ======================================================
              SUMMARY
          ====================================================== */}
  
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  
            <SummaryCard
              title="Total Tickets"
              value={summary.total}
              description="Tickets in current view"
              icon={Ticket}
              active={
                !statusFilter &&
                !priorityFilter &&
                !departmentFilter
              }
              onClick={() => {
  
                setStatusFilter("");
  
                setPriorityFilter("");
  
                setDepartmentFilter("");
  
              }}
            />
  
  
            <SummaryCard
              title="Open"
              value={summary.open}
              description="Waiting for action"
              icon={AlertCircle}
              active={
                statusFilter ===
                "open"
              }
              onClick={() =>
                setStatusFilter(
                  "open"
                )
              }
            />
  
  
            <SummaryCard
              title="In Progress"
              value={summary.inProgress}
              description="Currently being handled"
              icon={Clock3}
              active={
                statusFilter ===
                "in_progress"
              }
              onClick={() =>
                setStatusFilter(
                  "in_progress"
                )
              }
            />
  
  
            <SummaryCard
              title="Resolved"
              value={summary.resolved}
              description="Resolved or closed"
              icon={CheckCircle2}
              active={
                statusFilter ===
                "resolved"
              }
              onClick={() =>
                setStatusFilter(
                  "resolved"
                )
              }
            />
  
          </div>
  
  
          {/* ======================================================
              SECONDARY SUMMARY
          ====================================================== */}
  
          <div className="grid gap-4 md:grid-cols-3">
  
  
            {/* WAITING */}
  
            <button
              type="button"
              onClick={() =>
                setStatusFilter(
                  "waiting_for_student"
                )
              }
              className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                statusFilter ===
                "waiting_for_student"
                  ? "border-gray-900"
                  : "border-gray-200"
              }`}
            >
  
              <div className="flex items-center gap-3">
  
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
  
                  <UserRound
                    size={18}
                  />
  
                </div>
  
                <div>
  
                  <p className="text-sm text-gray-500">
                    Waiting for Student
                  </p>
  
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {summary.waiting}
                  </p>
  
                </div>
  
              </div>
  
            </button>
  
  
            {/* ESCALATED */}
  
            <button
              type="button"
              onClick={() =>
                setStatusFilter(
                  "escalated"
                )
              }
              className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                statusFilter ===
                "escalated"
                  ? "border-gray-900"
                  : "border-gray-200"
              }`}
            >
  
              <div className="flex items-center gap-3">
  
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
  
                  <AlertCircle
                    size={18}
                  />
  
                </div>
  
                <div>
  
                  <p className="text-sm text-gray-500">
                    Escalated
                  </p>
  
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {summary.escalated}
                  </p>
  
                </div>
  
              </div>
  
            </button>
  
  
            {/* ACTIVE */}
  
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
  
              <div className="flex items-center gap-3">
  
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
  
                  <MessageSquare
                    size={18}
                  />
  
                </div>
  
                <div>
  
                  <p className="text-sm text-gray-500">
                    Active Issues
                  </p>
  
                  <p className="mt-1 text-xl font-bold text-gray-900">
  
                    {summary.open +
                      summary.inProgress +
                      summary.waiting +
                      summary.escalated}
  
                  </p>
  
                </div>
  
              </div>
  
            </div>
  
          </div>
  
  
          {/* ======================================================
              FILTERS
          ====================================================== */}
  
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
  
            <div className="flex flex-col gap-3 lg:flex-row">
  
              {/* SEARCH */}
  
              <div className="relative flex-1">
  
                <Search
                  size={17}
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
                  placeholder="Search ticket, subject, student, category..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-900 focus:bg-white"
                />
  
              </div>
  
  
              {/* STATUS */}
  
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-gray-900"
              >
  
                <option value="">
                  All Statuses
                </option>
  
                {STATUSES.map(
                  (status) => (
  
                    <option
                      key={status}
                      value={status}
                    >
                      {
                        STATUS_CONFIG[
                          status
                        ].label
                      }
                    </option>
  
                  )
                )}
  
              </select>
  
  
              {/* PRIORITY */}
  
              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-gray-900"
              >
  
                <option value="">
                  All Priorities
                </option>
  
                {PRIORITIES.map(
                  (priority) => (
  
                    <option
                      key={priority}
                      value={priority}
                    >
                      {
                        PRIORITY_CONFIG[
                          priority
                        ].label
                      }
                    </option>
  
                  )
                )}
  
              </select>
  
  
              {/* DEPARTMENT */}
  
              <select
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-gray-900"
              >
  
                <option value="">
                  All Departments
                </option>
  
                {DEPARTMENTS.map(
                  (department) => (
  
                    <option
                      key={department}
                      value={department}
                    >
                      {formatText(
                        department
                      )}
                    </option>
  
                  )
                )}
  
              </select>
  
            </div>
  
  
            {(search ||
              statusFilter ||
              priorityFilter ||
              departmentFilter) && (
  
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
  
                <p className="text-xs text-gray-500">
                  Filters are active
                </p>
  
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="text-xs font-bold text-gray-700 hover:text-gray-900"
                >
                  Clear Filters
                </button>
  
              </div>
  
            )}
  
          </div>
  
  
          {/* ======================================================
              TABLE
          ====================================================== */}
  
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
  
            <div className="flex items-center justify-between border-b px-6 py-5">
  
              <div>
  
                <h2 className="text-lg font-bold text-gray-900">
                  Support Tickets
                </h2>
  
                <p className="mt-1 text-sm text-gray-500">
  
                  {filteredTickets.length} ticket
                  {filteredTickets.length ===
                  1
                    ? ""
                    : "s"} shown
  
                </p>
  
              </div>
  
              <div className="hidden items-center gap-2 text-xs text-gray-400 sm:flex">
  
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
  
                Live data
  
              </div>
  
            </div>
  
  
            {loading ? (
  
              <div className="flex min-h-[320px] items-center justify-center">
  
                <div className="text-center">
  
                  <RefreshCw
                    size={28}
                    className="mx-auto animate-spin text-gray-400"
                  />
  
                  <p className="mt-3 text-sm font-medium text-gray-500">
                    Loading tickets...
                  </p>
  
                </div>
  
              </div>
  
            ) : filteredTickets.length ===
              0 ? (
  
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
  
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
  
                  <Ticket
                    size={28}
                    className="text-gray-400"
                  />
  
                </div>
  
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  No tickets found
                </h3>
  
                <p className="mt-1 max-w-md text-sm text-gray-500">
                  No support tickets match your current search or filters.
                </p>
  
                {(search ||
                  statusFilter ||
                  priorityFilter ||
                  departmentFilter) && (
  
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="mt-4 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Clear Filters
                  </button>
  
                )}
  
              </div>
  
            ) : (
  
              <div className="overflow-x-auto">
  
                <table className="w-full min-w-[1050px]">
  
                  <thead>
  
                    <tr className="border-b bg-gray-50">
  
                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Ticket
                      </th>
  
                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Student
                      </th>
  
                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Problem
                      </th>
  
                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Priority
                      </th>
  
                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Status
                      </th>
  
                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Updated
                      </th>
  
                      <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
  
                    </tr>
  
                  </thead>
  
  
                  <tbody className="divide-y divide-gray-100">
  
                    {filteredTickets.map(
                      (ticket) => (
  
                        <tr
                          key={ticket.id}
                          className="group transition hover:bg-gray-50"
                        >
  
                          {/* TICKET */}
  
                          <td className="px-5 py-5">
  
                            <p className="font-mono text-sm font-bold text-gray-900">
                              {
                                ticket.ticket_number
                              }
                            </p>
  
                            <p className="mt-1 text-xs text-gray-400">
                              Ticket #{ticket.id}
                            </p>
  
                          </td>
  
  
                          {/* STUDENT */}
  
                          <td className="px-5 py-5">
  
                            <div className="flex items-center gap-3">
  
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
  
                                <UserRound
                                  size={16}
                                  className="text-gray-500"
                                />
  
                              </div>
  
                              <div>
  
                                <p className="text-sm font-semibold text-gray-900">
                                  Student #
                                  {
                                    ticket.student_id
                                  }
                                </p>
  
                                <p className="text-xs text-gray-400">
                                  ID{" "}
                                  {
                                    ticket.student_id
                                  }
                                </p>
  
                              </div>
  
                            </div>
  
                          </td>
  
  
                          {/* PROBLEM */}
  
                          <td className="max-w-[330px] px-5 py-5">
  
                            <p className="truncate text-sm font-semibold text-gray-900">
  
                              {
                                ticket.subject ||
                                "Untitled ticket"
                              }
  
                            </p>
  
                            <div className="mt-1 flex items-center gap-2">
  
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
  
                                <Tag
                                  size={11}
                                />
  
                                {formatText(
                                  ticket.category
                                )}
  
                              </span>
  
                              <span className="text-gray-300">
                                •
                              </span>
  
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
  
                                <Building2
                                  size={11}
                                />
  
                                {formatText(
                                  ticket.department
                                )}
  
                              </span>
  
                            </div>
  
                          </td>
  
  
                          {/* PRIORITY */}
  
                          <td className="px-5 py-5">
  
                            <PriorityBadge
                              priority={
                                ticket.priority
                              }
                            />
  
                          </td>
  
  
                          {/* STATUS */}
  
                          <td className="px-5 py-5">
  
                            <StatusBadge
                              status={
                                ticket.status
                              }
                            />
  
                          </td>
  
  
                          {/* UPDATED */}
  
                          <td className="px-5 py-5">
  
                            <p className="text-sm font-medium text-gray-700">
                              {getRelativeTime(
                                ticket.updated_at
                              )}
                            </p>
  
                            <p className="mt-1 text-xs text-gray-400">
                              {formatDate(
                                ticket.updated_at
                              )}
                            </p>
  
                          </td>
  
  
                          {/* ACTION */}
  
                          <td className="px-5 py-5 text-right">
  
                            <button
                              type="button"
                              onClick={() =>
                                openTicket(
                                  ticket
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                            >
  
                              View
  
                              <ChevronRight
                                size={15}
                              />
  
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
  
  
          {/* ========================================================
              TICKET MODAL
          ======================================================== */}
  
          {selectedTicket && (
  
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              onMouseDown={(
                event
              ) => {
  
                if (
                  event.target ===
                  event.currentTarget
                ) {
                  closeTicket();
                }
  
              }}
            >
  
              <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
  
  
                {/* ==================================================
                    MODAL HEADER
                ================================================== */}
  
                <div className="flex items-center justify-between border-b px-6 py-5">
  
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
                            editForm.status
                          }
                        />
  
                      </div>
  
                    </div>
  
                  </div>
  
  
                  <button
                    type="button"
                    onClick={
                      closeTicket
                    }
                    disabled={saving}
                    className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                  >
  
                    <X size={21} />
  
                  </button>
  
                </div>
  
  
                {/* ==================================================
                    MODAL BODY
                ================================================== */}
  
                <div className="overflow-y-auto">
  
                  <form
                    onSubmit={
                      handleUpdateTicket
                    }
                    className="space-y-5 p-6"
                  >
  
  
                    {/* =================================================
                        STATUS PROGRESS
                    ================================================= */}
  
                    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
  
                      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  
                        <div>
  
                          <h3 className="text-sm font-bold text-gray-900">
                            Ticket Progress
                          </h3>
  
                          <p className="mt-1 text-xs text-gray-500">
  
                            Current status:{" "}
  
                            <span className="font-semibold text-gray-700">
  
                              {
                                getStatusConfig(
                                  editForm.status
                                ).label
                              }
  
                            </span>
  
                          </p>
  
                        </div>
  
  
                        {![
                          "resolved",
                          "closed",
                        ].includes(
                          normalize(
                            editForm.status
                          )
                        ) && (
  
                          <button
                            type="button"
                            onClick={
                              handleResolveTicket
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                          >
  
                            <CheckCircle2
                              size={15}
                            />
  
                            Resolve Ticket
  
                          </button>
  
                        )}
  
                      </div>
  
  
                      <StatusWorkflow
                        currentStatus={
                          editForm.status
                        }
                      />
  
                    </section>
  
  
                    {/* =================================================
                        PROBLEM + INFORMATION
                    ================================================= */}
  
                    <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
  
  
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
                              Student Problem
                            </h3>
  
                            <p className="text-xs text-gray-400">
                              Issue submitted by the student
                            </p>
  
                          </div>
  
                        </div>
  
  
                        {/* SUBJECT */}
  
                        <div className="rounded-xl bg-gray-50 p-4">
  
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
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
  
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Description
                          </p>
  
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                            {
                              selectedTicket.description ||
                              "No description provided."
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
                              Ticket metadata
                            </p>
  
                          </div>
  
                        </div>
  
  
                        <div className="space-y-3">
  
                          <InfoItem
                            icon={UserRound}
                            label="Student"
                            value={
                              selectedTicket.student_id
                                ? `#${selectedTicket.student_id}`
                                : "—"
                            }
                          />
  
                          <InfoItem
                            icon={Tag}
                            label="Category"
                            value={formatText(
                              selectedTicket.category
                            )}
                          />
  
                          <InfoItem
                            icon={Building2}
                            label="Department"
                            value={formatText(
                              selectedTicket.department
                            )}
                          />
  
  
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
  
                              <PriorityBadge
                                priority={
                                  selectedTicket.priority
                                }
                              />
  
                            </div>
  
                          </div>
  
  
                          <InfoItem
                            icon={CalendarDays}
                            label="Created"
                            value={formatDate(
                              selectedTicket.created_at
                            )}
                          />
  
                          <InfoItem
                            icon={Clock3}
                            label="Last Updated"
                            value={formatDate(
                              selectedTicket.updated_at
                            )}
                          />
  
                        </div>
  
                      </section>
  
                    </div>
  
  
                    {/* =================================================
                        MANAGE TICKET
                    ================================================= */}
  
                    <section className="rounded-2xl border border-gray-200 bg-white">
  
  
                      {/* HEADER */}
  
                      <div className="border-b border-gray-200 px-5 py-4">
  
                        <div className="flex items-center gap-3">
  
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
  
                            <Save
                              size={17}
                              className="text-white"
                            />
  
                          </div>
  
                          <div>
  
                            <h3 className="text-sm font-bold text-gray-900">
                              Manage Ticket
                            </h3>
  
                            <p className="text-xs text-gray-400">
                              Update ticket status and communicate with the student.
                            </p>
  
                          </div>
  
                        </div>
  
                      </div>
  
  
                      <div className="space-y-5 p-5">
  
  
                        {/* =================================================
                            CONTROLS
                        ================================================= */}
  
                        <div className="grid gap-4 md:grid-cols-3">
  
  
                          {/* STATUS */}
  
                          <div>
  
                            <label
                              htmlFor="ticket-status"
                              className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                            >
                              Status
                            </label>
  
                            <select
                              id="ticket-status"
                              name="status"
                              value={
                                editForm.status
                              }
                              onChange={
                                handleEditChange
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                            >
  
                              {STATUSES.map(
                                (status) => (
  
                                  <option
                                    key={status}
                                    value={status}
                                  >
                                    {
                                      STATUS_CONFIG[
                                        status
                                      ].label
                                    }
                                  </option>
  
                                )
                              )}
  
                            </select>
  
                          </div>
  
  
                          {/* PRIORITY */}
  
                          <div>
  
                            <label
                              htmlFor="ticket-priority"
                              className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                            >
                              Priority
                            </label>
  
                            <select
                              id="ticket-priority"
                              name="priority"
                              value={
                                editForm.priority
                              }
                              onChange={
                                handleEditChange
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                            >
  
                              {PRIORITIES.map(
                                (priority) => (
  
                                  <option
                                    key={
                                      priority
                                    }
                                    value={
                                      priority
                                    }
                                  >
                                    {
                                      PRIORITY_CONFIG[
                                        priority
                                      ].label
                                    }
                                  </option>
  
                                )
                              )}
  
                            </select>
  
                          </div>
  
  
                          {/* DEPARTMENT */}
  
                          <div>
  
                            <label
                              htmlFor="ticket-department"
                              className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                            >
                              Department
                            </label>
  
                            <select
                              id="ticket-department"
                              name="department"
                              value={
                                editForm.department
                              }
                              onChange={
                                handleEditChange
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                            >
  
                              {DEPARTMENTS.map(
                                (
                                  department
                                ) => (
  
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
  
  
                        {/* =================================================
                            RESPONSE TO STUDENT
                            ALWAYS VISIBLE
                        ================================================= */}
  
                        <div
                          className={`rounded-2xl border p-4 transition ${
                            normalize(
                              editForm.status
                            ) === "resolved"
                              ? "border-emerald-200 bg-emerald-50/60"
                              : "border-gray-200 bg-gray-50/60"
                          }`}
                        >
  
                          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
  
  
                            {/* TITLE */}
  
                            <div>
  
                              <label
                                htmlFor="ticket-resolution"
                                className={`flex items-center gap-2 text-sm font-bold ${
                                  normalize(
                                    editForm.status
                                  ) === "resolved"
                                    ? "text-emerald-800"
                                    : "text-gray-800"
                                }`}
                              >
  
                                <Send
                                  size={16}
                                />
  
                                Response to Student
  
                                {normalize(
                                  editForm.status
                                ) ===
                                  "resolved" && (
  
                                  <span className="text-red-500">
                                    *
                                  </span>
  
                                )}
  
                              </label>
  
  
                              <p
                                className={`mt-1 text-xs ${
                                  normalize(
                                    editForm.status
                                  ) === "resolved"
                                    ? "text-emerald-700"
                                    : "text-gray-500"
                                }`}
                              >
                                This message will be shown to the student.
                              </p>
  
                            </div>
  
  
                            {/* STATUS */}
  
                            {normalize(
                              editForm.status
                            ) === "resolved" ? (
  
                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                Required
                              </span>
  
                            ) : (
  
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                Optional
                              </span>
  
                            )}
  
                          </div>
  
  
                          {/* TEXTAREA */}
  
                          <textarea
                            id="ticket-resolution"
                            name="resolution"
                            value={
                              editForm.resolution
                            }
                            onChange={
                              handleEditChange
                            }
                            rows={5}
                            placeholder="Write a clear response for the student. Example: Your documents have been verified successfully. The pending status has been updated in the admission portal. Please refresh your dashboard."
                            className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 ${
                              normalize(
                                editForm.status
                              ) === "resolved"
                                ? "border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                : "border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                            }`}
                          />
  
  
                          {/* FOOTER */}
  
                          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
  
                            <p
                              className={`text-xs ${
                                normalize(
                                  editForm.status
                                ) === "resolved"
                                  ? "text-emerald-700"
                                  : "text-gray-400"
                              }`}
                            >
  
                              {normalize(
                                editForm.status
                              ) === "resolved"
                                ? "The student will see this resolution after you save the ticket."
                                : "You can write a response now. It will be saved with the ticket."}
  
                            </p>
  
  
                            <span className="text-xs text-gray-400">
                              {
                                editForm
                                  .resolution
                                  .length
                              }{" "}
                              characters
                            </span>
  
                          </div>
  
                        </div>
  
  
                        {/* =================================================
                            ESCALATION REASON
                        ================================================= */}
  
                        {normalize(
                          editForm.status
                        ) === "escalated" && (
  
                          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
  
                            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
  
                              <div>
  
                                <label
                                  htmlFor="ticket-escalation"
                                  className="flex items-center gap-2 text-sm font-bold text-red-800"
                                >
  
                                  <AlertCircle
                                    size={16}
                                  />
  
                                  Escalation Reason
  
                                  <span className="text-red-500">
                                    *
                                  </span>
  
                                </label>
  
                                <p className="mt-1 text-xs text-red-700">
                                  Explain why this ticket needs another department or person.
                                </p>
  
                              </div>
  
  
                              <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
                                Required
                              </span>
  
                            </div>
  
  
                            <textarea
                              id="ticket-escalation"
                              name="escalation_reason"
                              value={
                                editForm.escalation_reason
                              }
                              onChange={
                                handleEditChange
                              }
                              rows={4}
                              placeholder="Example: This issue requires Finance Department verification."
                              className="w-full resize-none rounded-xl border border-red-200 bg-white px-4 py-3 text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            />
  
                          </div>
  
                        )}
  
  
                        {/* =================================================
                            PREVIOUS RESPONSE
                        ================================================= */}
  
                        {selectedTicket.resolution &&
                          normalize(
                            editForm.status
                          ) !== "resolved" && (
  
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
  
                              <div className="flex items-start gap-3">
  
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
  
                                  <MessageSquare
                                    size={16}
                                    className="text-emerald-600"
                                  />
  
                                </div>
  
                                <div className="min-w-0">
  
                                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                    Previous Response
                                  </p>
  
                                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-900">
                                    {
                                      selectedTicket.resolution
                                    }
                                  </p>
  
                                </div>
  
                              </div>
  
                            </div>
  
                          )}
  
  
                        {/* =================================================
                            PREVIOUS ESCALATION
                        ================================================= */}
  
                        {selectedTicket.escalation_reason &&
                          normalize(
                            editForm.status
                          ) !== "escalated" && (
  
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
  
                              <div className="flex items-start gap-3">
  
                                <AlertCircle
                                  size={18}
                                  className="mt-0.5 shrink-0 text-red-600"
                                />
  
                                <div className="min-w-0">
  
                                  <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                                    Previous Escalation Reason
                                  </p>
  
                                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-900">
                                    {
                                      selectedTicket.escalation_reason
                                    }
                                  </p>
  
                                </div>
  
                              </div>
  
                            </div>
  
                          )}
  
                      </div>
  
                    </section>
  
  
                    {/* =================================================
                        FOOTER
                    ================================================= */}
  
                    <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end">
  
                      <button
                        type="button"
                        onClick={
                          closeTicket
                        }
                        disabled={saving}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>
  
  
                      <button
                        type="submit"
                        disabled={saving}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          normalize(
                            editForm.status
                          ) === "resolved"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-gray-900 hover:bg-gray-800"
                        }`}
                      >
  
                        {saving ? (
  
                          <>
                            <RefreshCw
                              size={16}
                              className="animate-spin"
                            />
  
                            Saving...
  
                          </>
  
                        ) : normalize(
                            editForm.status
                          ) === "resolved" ? (
  
                          <>
                            <CheckCircle2
                              size={17}
                            />
  
                            Save & Resolve
  
                          </>
  
                        ) : (
  
                          <>
                            <Save
                              size={17}
                            />
  
                            Save Update
  
                          </>
  
                        )}
  
                      </button>
  
                    </div>
  
                  </form>
  
                </div>
  
              </div>
  
            </div>
  
          )}
  
        </div>
  
      </Layout>
    );
  }
  
  
  export default Tickets;