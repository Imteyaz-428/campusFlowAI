import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RefreshCw,
  IndianRupee,
} from "lucide-react";

import Layout from "../../components/layout/Layout";

import {
  getMyFees,
  payFee,
} from "../../services/fee";

function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // LOAD FEES


  const loadFees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyFees();

      const data = response?.data ?? response;

      if (Array.isArray(data)) {
        setFees(data);
      } else if (Array.isArray(data?.fees)) {
        setFees(data.fees);
      } else if (Array.isArray(data?.items)) {
        setFees(data.items);
      } else {
        setFees([]);
      }
    } catch (err) {
      console.error("Failed to load student fees:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load your fee information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);


  // PAY FEE


  const handlePay = async (fee) => {
    try {
      setPayingId(fee.id);
      setError("");
      setSuccess("");

      await payFee(fee.id);

      setSuccess(
        "Fee payment successful."
      );

      await loadFees();
    } catch (err) {
      console.error("Fee payment failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to process fee payment."
      );
    } finally {
      setPayingId(null);
    }
  };


  // HELPERS


  const getAmount = (fee) => {
    return Number(
      fee.amount ??
        fee.total_amount ??
        fee.fee_amount ??
        0
    );
  };

  const getStatus = (fee) => {
    return String(
      fee.status ??
        fee.payment_status ??
        "pending"
    ).toLowerCase();
  };

  const isPaid = (fee) => {
    return getStatus(fee) === "paid";
  };

  const totalAmount = fees.reduce(
    (sum, fee) => sum + getAmount(fee),
    0
  );

  const paidAmount = fees
    .filter(isPaid)
    .reduce(
      (sum, fee) => sum + getAmount(fee),
      0
    );

  const pendingAmount = totalAmount - paidAmount;

  const paidCount = fees.filter(isPaid).length;

  const pendingCount =
    fees.length - paidCount;


  // LOADING


  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={30}
              className="mx-auto mb-3 animate-spin text-gray-700"
            />

            <p className="text-sm text-gray-500">
              Loading fee information...
            </p>
          </div>
        </div>
      </Layout>
    );
  }


  // PAGE


  return (
    <Layout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
              <CreditCard
                size={24}
                className="text-white"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                CampusFlow AI
              </p>

              <h1 className="text-2xl font-bold text-gray-900">
                My Fees
              </h1>

              <p className="text-sm text-gray-500">
                View and manage your admission fees.
              </p>
            </div>

          </div>

          <button
            onClick={loadFees}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Total Fees
            </p>

            <div className="mt-2 flex items-center gap-1">
              <IndianRupee size={20} />
              <p className="text-2xl font-bold text-gray-900">
                {totalAmount.toLocaleString("en-IN")}
              </p>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              {fees.length} fee record
              {fees.length !== 1 ? "s" : ""}
            </p>

          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Paid
            </p>

            <div className="mt-2 flex items-center gap-1">
              <IndianRupee
                size={20}
                className="text-green-600"
              />

              <p className="text-2xl font-bold text-green-600">
                {paidAmount.toLocaleString("en-IN")}
              </p>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              {paidCount} paid
            </p>

          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Pending
            </p>

            <div className="mt-2 flex items-center gap-1">
              <IndianRupee
                size={20}
                className="text-orange-600"
              />

              <p className="text-2xl font-bold text-orange-600">
                {pendingAmount.toLocaleString("en-IN")}
              </p>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              {pendingCount} pending
            </p>

          </div>

        </div>

        {/* FEE LIST */}
        <div className="rounded-2xl border bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
                <CreditCard
                  size={19}
                  className="text-white"
                />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Fee Details
                </h2>

                <p className="text-sm text-gray-500">
                  Your admission and campus fee records.
                </p>
              </div>

            </div>

          </div>

          {fees.length === 0 ? (
            <div className="p-12 text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <CreditCard
                  size={22}
                  className="text-gray-500"
                />
              </div>

              <h3 className="font-semibold text-gray-900">
                No fees assigned
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                No fee records are currently available for your account.
              </p>

            </div>
          ) : (
            <div className="divide-y">

              {fees.map((fee) => {

                const amount = getAmount(fee);
                const paid = isPaid(fee);

                return (
                  <div
                    key={fee.id}
                    className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                  >

                    <div className="flex items-start gap-4">

                      <div
                        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          paid
                            ? "bg-green-100"
                            : "bg-orange-100"
                        }`}
                      >
                        {paid ? (
                          <CheckCircle2
                            size={20}
                            className="text-green-600"
                          />
                        ) : (
                          <Clock3
                            size={20}
                            className="text-orange-600"
                          />
                        )}
                      </div>

                      <div>

                        <h3 className="font-semibold text-gray-900">
                          {fee.fee_type ||
                            fee.name ||
                            fee.title ||
                            "Campus Fee"}
                        </h3>

                        {fee.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {fee.description}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">

                          {fee.is_mandatory === "true" ||
                          fee.is_mandatory === true ? (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              Mandatory
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                              Optional
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              paid
                                ? "bg-green-50 text-green-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {paid
                              ? "Paid"
                              : "Pending"}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="flex items-center justify-between gap-6 md:justify-end">

                      <div className="text-right">

                        <p className="text-lg font-bold text-gray-900">
                          ₹{amount.toLocaleString("en-IN")}
                        </p>

                        <p className="text-xs text-gray-400">
                          Fee amount
                        </p>

                      </div>

                      {!paid && (
                        <button
                          onClick={() =>
                            handlePay(fee)
                          }
                          disabled={
                            payingId === fee.id
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {payingId === fee.id ? (
                            <>
                              <RefreshCw
                                size={15}
                                className="animate-spin"
                              />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard
                                size={15}
                              />
                              Pay Now
                            </>
                          )}
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* PAYMENT INFORMATION */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

          <div className="flex items-start gap-3">

            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>

              <h3 className="font-semibold text-blue-900">
                Payment Information
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Pay all mandatory admission fees to complete your
                admission confirmation. Once all required fees are
                paid, the campus admission workflow can proceed.
              </p>

            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}

export default StudentFees;