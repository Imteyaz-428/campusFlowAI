import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Bot,
  FileText,
} from "lucide-react";

import ApplicantLayout from "../../components/layout/ApplicantLayout";
import applicantApi from "../../services/applicantApi";

function ApplicantFees() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await applicantApi.get(
        "/campus/applicant/dashboard"
      );

      setDashboard(response.data);
    } catch (err) {
      console.error(
        "Failed to load applicant fees:",
        err
      );

      if (err?.response?.status === 401) {
        localStorage.removeItem("applicant_token");

        navigate("/applicant/login", {
          replace: true,
        });

        return;
      }

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load your fee information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const fees = dashboard?.fees || {};

  const total = Number(fees.total || 0);
  const paid = Number(fees.paid || 0);
  const pending = Number(fees.pending || 0);

  const mandatoryPending = Boolean(
    fees.mandatory_pending
  );

  const paymentPercentage = useMemo(() => {
    if (total <= 0) {
      return 0;
    }

    return Math.min(
      Math.round((paid / total) * 100),
      100
    );
  }, [total, paid]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const getOverallStatus = () => {
    if (total <= 0) {
      return {
        label: "Not Generated",
        description:
          "No fee amount has been generated for your application yet.",
        classes:
          "bg-gray-100 text-gray-700 border-gray-200",
        icon: Clock3,
      };
    }

    if (pending <= 0) {
      return {
        label: "Fully Paid",
        description:
          "All currently recorded fees have been paid.",
        classes:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };
    }

    if (mandatoryPending) {
      return {
        label: "Payment Required",
        description:
          "A mandatory fee is still pending.",
        classes:
          "bg-red-50 text-red-700 border-red-200",
        icon: AlertCircle,
      };
    }

    return {
      label: "Payment Pending",
      description:
        "You still have an outstanding fee amount.",
      classes:
        "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  return (
    <ApplicantLayout>
      <div className="min-h-full bg-gray-50">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mx-auto max-w-7xl">

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <Link
                  to="/applicant/dashboard"
                  className="transition hover:text-gray-900"
                >
                  Dashboard
                </Link>

                <span>/</span>

                <span className="text-gray-700">
                  Fees
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Fees & Payments
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                View your current fee status and payment
                progress.
              </p>
            </div>

            <button
              type="button"
              onClick={loadFees}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              {loading ? "Refreshing..." : "Refresh"}
            </button>

          </div>


          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <AlertCircle
                    size={21}
                    className="text-red-600"
                  />
                </div>

                <div className="flex-1">

                  <h2 className="font-semibold text-red-800">
                    Unable to load fees
                  </h2>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadFees}
                    className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-2"
                  >
                    Try again
                  </button>

                </div>

              </div>

            </div>
          )}


          {/* =====================================================
              LOADING
          ===================================================== */}

          {loading && (
            <div className="space-y-6">

              <div className="grid gap-5 md:grid-cols-3">

                <div className="h-36 animate-pulse rounded-2xl bg-white" />
                <div className="h-36 animate-pulse rounded-2xl bg-white" />
                <div className="h-36 animate-pulse rounded-2xl bg-white" />

              </div>

              <div className="h-56 animate-pulse rounded-2xl bg-white" />

            </div>
          )}


          {/* =====================================================
              CONTENT
          ===================================================== */}

          {!loading && !error && (
            <>

              {/* =================================================
                  SUMMARY CARDS
              ================================================= */}

              <div className="grid gap-5 md:grid-cols-3">

                {/* TOTAL */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm font-medium text-gray-500">
                        Total Fees
                      </p>

                      <p className="mt-3 text-3xl font-bold text-gray-900">
                        {formatCurrency(total)}
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                      <CreditCard
                        size={21}
                        className="text-gray-700"
                      />
                    </div>

                  </div>

                </div>


                {/* PAID */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm font-medium text-gray-500">
                        Amount Paid
                      </p>

                      <p className="mt-3 text-3xl font-bold text-emerald-600">
                        {formatCurrency(paid)}
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                      <CheckCircle2
                        size={21}
                        className="text-emerald-600"
                      />
                    </div>

                  </div>

                </div>


                {/* PENDING */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm font-medium text-gray-500">
                        Pending Amount
                      </p>

                      <p className="mt-3 text-3xl font-bold text-amber-600">
                        {formatCurrency(pending)}
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                      <Clock3
                        size={21}
                        className="text-amber-600"
                      />
                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  PAYMENT STATUS
              ================================================= */}

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <StatusIcon
                        size={23}
                        className="text-gray-700"
                      />
                    </div>

                    <div>

                      <p className="text-sm font-medium text-gray-500">
                        Overall Payment Status
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-gray-900">
                        {overallStatus.label}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {overallStatus.description}
                      </p>

                    </div>

                  </div>

                  <div
                    className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold md:self-center ${overallStatus.classes}`}
                  >
                    <StatusIcon size={16} />

                    {overallStatus.label}
                  </div>

                </div>


                {/* Progress */}

                <div className="mt-7">

                  <div className="mb-2 flex items-center justify-between">

                    <p className="text-sm font-semibold text-gray-700">
                      Payment Progress
                    </p>

                    <p className="text-sm font-bold text-gray-900">
                      {paymentPercentage}%
                    </p>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                    <div
                      className="h-full rounded-full bg-gray-900 transition-all duration-700"
                      style={{
                        width: `${paymentPercentage}%`,
                      }}
                    />

                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">

                    <span>
                      Paid: {formatCurrency(paid)}
                    </span>

                    <span>
                      Remaining:{" "}
                      {formatCurrency(pending)}
                    </span>

                  </div>

                </div>

              </div>


              {/* =================================================
                  MANDATORY FEE ALERT
              ================================================= */}

              {mandatoryPending && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

                  <div className="flex items-start gap-3">

                    <AlertCircle
                      size={21}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>

                      <h3 className="font-semibold text-amber-900">
                        Mandatory payment pending
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        A mandatory fee is still pending.
                        Please check with the admission
                        office for payment instructions and
                        the applicable deadline.
                      </p>

                    </div>

                  </div>

                </div>
              )}


              {/* =================================================
                  FEE INFORMATION
              ================================================= */}

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    <CreditCard
                      size={21}
                      className="text-gray-700"
                    />
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-gray-900">
                      Fee Information
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Your current applicant portal provides
                      the overall fee summary associated with
                      your application.
                    </p>

                  </div>

                </div>


                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Total Fee
                    </p>

                    <p className="mt-2 text-lg font-bold text-gray-900">
                      {formatCurrency(total)}
                    </p>

                  </div>


                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Outstanding
                    </p>

                    <p className="mt-2 text-lg font-bold text-amber-600">
                      {formatCurrency(pending)}
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  QUICK ACTIONS
              ================================================= */}

              <div className="mt-6 grid gap-4 md:grid-cols-3">

                <Link
                  to="/applicant/dashboard"
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                      <ArrowLeft
                        size={20}
                        className="text-gray-700"
                      />
                    </div>

                    <div>

                      <h3 className="font-semibold text-gray-900">
                        Dashboard
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Return to your overview
                      </p>

                    </div>

                  </div>

                </Link>


                <Link
                  to="/applicant/documents"
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                      <FileText
                        size={20}
                        className="text-gray-700"
                      />
                    </div>

                    <div>

                      <h3 className="font-semibold text-gray-900">
                        Documents
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Manage submitted documents
                      </p>

                    </div>

                  </div>

                </Link>


                <Link
                  to="/applicant/chat"
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                      <Bot
                        size={20}
                        className="text-gray-700"
                      />
                    </div>

                    <div>

                      <h3 className="font-semibold text-gray-900">
                        AI Assistant
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Ask questions about your admission
                      </p>

                    </div>

                  </div>

                </Link>

              </div>

            </>
          )}

        </div>
      </div>
    </ApplicantLayout>
  );
}

export default ApplicantFees;