import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  FileCheck,
  CreditCard,
  Ticket,
  AlertTriangle,
  Bot,
  RefreshCw,
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import { getDashboardOverview } from "../../services/dashboard";
import { me } from "../../services/auth";


function StatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}


function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [overviewData, userResponse] = await Promise.all([
        getDashboardOverview(),
        me(),
      ]);

      setOverview(overviewData);
      setUser(userResponse.data);
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

            <p className="text-gray-500">
              Loading CampusFlow Dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }


  if (error) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle
                size={24}
                className="text-red-600"
              />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Dashboard Error
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


  return (
    <Layout>

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-medium text-gray-500">
            CampusFlow AI
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Campus Overview
          </h1>

          <p className="mt-2 text-gray-500">
            Welcome back,{" "}
            <span className="font-semibold text-gray-700">
              {user?.name || user?.full_name || user?.email || "Admin"}
            </span>
            .
          </p>
        </div>


        <button
          onClick={loadDashboard}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>


      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Students"
          value={overview?.students ?? 0}
          description="Registered students"
          icon={Users}
        />

        <StatCard
          title="Applications"
          value={overview?.applications ?? 0}
          description="Total applications"
          icon={FileText}
        />

        <StatCard
          title="Pending Documents"
          value={overview?.pending_documents ?? 0}
          description="Awaiting verification"
          icon={FileCheck}
        />

        <StatCard
          title="Pending Fees"
          value={overview?.pending_fees ?? 0}
          description="Payments pending"
          icon={CreditCard}
        />

      </div>


      {/* Operational Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

        <StatCard
          title="Open Tickets"
          value={overview?.open_tickets ?? 0}
          description="Issues requiring attention"
          icon={Ticket}
        />

        <StatCard
          title="Escalated Tickets"
          value={overview?.escalated_tickets ?? 0}
          description="Tickets requiring escalation"
          icon={AlertTriangle}
        />

        <StatCard
          title="AI Actions Today"
          value={overview?.agent_actions_today ?? 0}
          description="Agent actions executed"
          icon={Bot}
        />

      </div>


      {/* AI Operations Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Agent Activity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
              <Bot size={20} className="text-white" />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                AI Agent Operations
              </h2>

              <p className="text-sm text-gray-500">
                Controlled AI actions across campus workflows
              </p>
            </div>
          </div>


          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Actions Today
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {overview?.agent_actions_today ?? 0}
              </p>
            </div>


            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Open Issues
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {overview?.open_tickets ?? 0}
              </p>
            </div>


            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Escalations
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {overview?.escalated_tickets ?? 0}
              </p>
            </div>

          </div>

        </div>


        {/* Workflow Health */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="font-semibold text-gray-900">
            Workflow Health
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current campus operations
          </p>


          <div className="mt-6 space-y-5">

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Documents
                </span>

                <span className="font-semibold text-gray-900">
                  {overview?.pending_documents === 0
                    ? "Clear"
                    : `${overview?.pending_documents} pending`}
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-gray-900"
                  style={{
                    width:
                      overview?.pending_documents === 0
                        ? "100%"
                        : "50%",
                  }}
                />
              </div>
            </div>


            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Fees
                </span>

                <span className="font-semibold text-gray-900">
                  {overview?.pending_fees === 0
                    ? "Clear"
                    : `${overview?.pending_fees} pending`}
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-gray-900"
                  style={{
                    width:
                      overview?.pending_fees === 0
                        ? "100%"
                        : "50%",
                  }}
                />
              </div>
            </div>


            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Tickets
                </span>

                <span className="font-semibold text-gray-900">
                  {overview?.open_tickets === 0
                    ? "Clear"
                    : `${overview?.open_tickets} open`}
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-gray-900"
                  style={{
                    width:
                      overview?.open_tickets === 0
                        ? "100%"
                        : "50%",
                  }}
                />
              </div>
            </div>

          </div>

        </div>

      </div>


      {/* System Information */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-900 p-6 text-white shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-sm font-medium text-gray-400">
              CampusFlow AI
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Intelligent Campus Process Automation
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              Monitor admissions, documents, fees, tickets,
              onboarding and AI-assisted campus operations from
              one centralized workspace.
            </p>
          </div>

          <div className="rounded-xl border border-gray-700 px-4 py-3 text-sm">
            <span className="text-gray-400">
              Organization
            </span>

            <p className="mt-1 font-semibold">
              {user?.organization?.name ||
                user?.organization?.slug ||
                "Campus"}
            </p>
          </div>

        </div>

      </div>

    </Layout>
  );
}

export default Dashboard;