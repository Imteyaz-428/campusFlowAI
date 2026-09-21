import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  RefreshCw,
  CreditCard,
  Plus,
  X,
  IndianRupee,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Trash2,
} from "lucide-react";

import Layout from "../../components/layout/Layout";

import {
  getStudentFees,
  createFee,
  payFee,
  deleteFee,
} from "../../services/fee";

import { getStudents } from "../../services/student";


function normalizeArray(data, keys = []) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  return [];
}


function formatStatus(value) {
  return String(value || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


function StatusBadge({ status }) {
  const value = String(status || "unknown").toLowerCase();

  let classes = "bg-gray-100 text-gray-600";

  if (["paid", "completed"].includes(value)) {
    classes = "bg-green-100 text-green-700";
  }

  if (["pending", "processing"].includes(value)) {
    classes = "bg-yellow-100 text-yellow-700";
  }

  if (["failed", "rejected", "cancelled"].includes(value)) {
    classes = "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {formatStatus(value)}
    </span>
  );
}


function SummaryCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
          <Icon size={18} className="text-gray-600" />
        </div>
      </div>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}


function CreateFeeModal({
  students,
  onClose,
  onCreated,
}) {
  const [studentId, setStudentId] = useState("");
  const [feeType, setFeeType] = useState("admission");
  const [amount, setAmount] = useState("25000");
  const [currency, setCurrency] = useState("INR");
  const [mandatory, setMandatory] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedStudent = students.find(
    (student) => String(student.id) === String(studentId)
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!studentId) {
      toast.error("Please select a student.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid fee amount.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        student_id: Number(studentId),
        fee_type: feeType,
        amount: Number(amount),
        currency,
        is_mandatory: mandatory ? "true" : "false",
      };

      await createFee(payload);

      toast.success("Fee created successfully.");

      onCreated();
      onClose();
    } catch (error) {
      console.error("Create fee error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to create fee."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Create Fee
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a fee for a student.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={21} />
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Student
            </label>

            <select
              value={studentId}
              onChange={(event) =>
                setStudentId(event.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
            >
              <option value="">
                Select student
              </option>

              {students.map((student) => (
                <option
                  key={student.id}
                  value={student.id}
                >
                  {student.full_name} —{" "}
                  {student.application_number || student.email}
                </option>
              ))}
            </select>

            {selectedStudent && (
              <p className="mt-2 text-xs text-gray-500">
                Application:{" "}
                {selectedStudent.application_number || "—"}
              </p>
            )}
          </div>


          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Fee Type
            </label>

            <select
              value={feeType}
              onChange={(event) =>
                setFeeType(event.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
            >
              <option value="admission">
                Admission
              </option>

              <option value="tuition">
                Tuition
              </option>

              <option value="registration">
                Registration
              </option>

              <option value="hostel">
                Hostel
              </option>

              <option value="library">
                Library
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>


          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Amount
              </label>

              <input
                type="number"
                min="1"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Currency
              </label>

              <select
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
              >
                <option value="INR">
                  INR
                </option>

                <option value="USD">
                  USD
                </option>
              </select>
            </div>

          </div>


          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">

            <input
              type="checkbox"
              checked={mandatory}
              onChange={(event) =>
                setMandatory(event.target.checked)
              }
              className="h-4 w-4"
            />

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Mandatory fee
              </p>

              <p className="text-xs text-gray-500">
                Required before admission confirmation.
              </p>
            </div>

          </label>


          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
            >
              <Plus size={17} />

              {submitting
                ? "Creating..."
                : "Create Fee"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


function Fees() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreateModal, setShowCreateModal] =
    useState(false);


  const loadData = async () => {
    try {
      setRefreshing(true);

      const [
        studentResult,
        feeResult,
      ] = await Promise.all([
        getStudents(),
        fetchAllFees(),
      ]);

      setStudents(
        normalizeArray(studentResult, [
          "students",
          "items",
          "data",
        ])
      );

      setFees(
        normalizeArray(feeResult, [
          "fees",
          "items",
          "data",
        ])
      );
    } catch (error) {
      console.error("Fee page loading error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to load fee data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  const studentMap = useMemo(() => {
    const map = {};

    students.forEach((student) => {
      map[student.id] = student;
    });

    return map;
  }, [students]);


  const filteredFees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return fees;
    }

    return fees.filter((fee) => {
      const student =
        studentMap[fee.student_id];

      return [
        fee.fee_type,
        fee.status,
        fee.currency,
        fee.amount,
        student?.full_name,
        student?.email,
        student?.application_number,
        student?.admission_number,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [fees, search, studentMap]);


  const totalAmount = fees.reduce(
    (sum, fee) =>
      sum + Number(fee.amount || 0),
    0
  );


  const paidAmount = fees
    .filter(
      (fee) =>
        String(fee.status).toLowerCase() ===
        "paid"
    )
    .reduce(
      (sum, fee) =>
        sum + Number(fee.amount || 0),
      0
    );


  const pendingAmount = fees
    .filter(
      (fee) =>
        String(fee.status).toLowerCase() !==
        "paid"
    )
    .reduce(
      (sum, fee) =>
        sum + Number(fee.amount || 0),
      0
    );


  const handlePay = async (fee) => {
    if (
      !window.confirm(
        `Mark ${fee.fee_type} fee of ${fee.currency || "INR"} ${fee.amount} as paid?`
      )
    ) {
      return;
    }

    try {
      await payFee(fee.id);

      toast.success("Fee marked as paid.");

      await loadData();
    } catch (error) {
      console.error("Pay fee error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to pay fee."
      );
    }
  };


  const handleDelete = async (fee) => {
    if (
      !window.confirm(
        "Delete this fee record?"
      )
    ) {
      return;
    }

    try {
      await deleteFee(fee.id);

      toast.success("Fee deleted.");

      await loadData();
    } catch (error) {
      console.error("Delete fee error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to delete fee."
      );
    }
  };


  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

            <p className="text-sm text-gray-500">
              Loading fees...
            </p>

          </div>

        </div>
      </Layout>
    );
  }


  return (
    <Layout>

      {/* Header */}

      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">
            <CreditCard
              size={21}
              className="text-white"
            />
          </div>

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Fees
            </h1>

            <p className="mt-1 text-gray-500">
              Manage student fees and admission payments.
            </p>

          </div>

        </div>


        <div className="flex gap-3">

          <button
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>


          <button
            onClick={() =>
              setShowCreateModal(true)
            }
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
          >
            <Plus size={17} />

            Create Fee
          </button>

        </div>

      </div>


      {/* Summary */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <SummaryCard
          label="Total Fees"
          value={`₹${totalAmount.toLocaleString("en-IN")}`}
          icon={IndianRupee}
        />

        <SummaryCard
          label="Paid"
          value={`₹${paidAmount.toLocaleString("en-IN")}`}
          icon={CheckCircle2}
        />

        <SummaryCard
          label="Pending"
          value={`₹${pendingAmount.toLocaleString("en-IN")}`}
          icon={Clock3}
        />

      </div>


      {/* Search */}

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="relative">

          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by student, application, fee type, status..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-gray-400 focus:bg-white"
          />

        </div>

      </div>


      {/* Table */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {filteredFees.length === 0 ? (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <CreditCard
                size={25}
                className="text-gray-500"
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No fee records found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Create a fee to begin the payment workflow.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Fee
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {filteredFees.map((fee) => {

                  const student =
                    studentMap[fee.student_id];

                  const isPaid =
                    String(
                      fee.status
                    ).toLowerCase() ===
                    "paid";

                  return (
                    <tr
                      key={fee.id}
                      className="transition hover:bg-gray-50"
                    >

                      <td className="px-6 py-5">

                        <p className="font-semibold text-gray-900">
                          {student?.full_name ||
                            `Student #${fee.student_id}`}
                        </p>

                        <p className="text-sm text-gray-500">
                          {student?.application_number ||
                            student?.email ||
                            "—"}
                        </p>

                      </td>


                      <td className="px-6 py-5">

                        <p className="font-semibold text-gray-900">
                          {fee.fee_type || "—"}
                        </p>

                        {fee.transaction_reference && (
                          <p className="mt-1 text-xs text-gray-500">
                            Ref:{" "}
                            {fee.transaction_reference}
                          </p>
                        )}

                      </td>


                      <td className="whitespace-nowrap px-6 py-5 font-semibold text-gray-900">
                        {fee.currency || "INR"}{" "}
                        {Number(
                          fee.amount || 0
                        ).toLocaleString("en-IN")}
                      </td>


                      <td className="px-6 py-5">

                        {fee.is_mandatory ===
                          "true" ||
                        fee.mandatory ? (
                          <span className="text-xs font-semibold text-gray-600">
                            Mandatory
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Optional
                          </span>
                        )}

                      </td>


                      <td className="px-6 py-5">
                        <StatusBadge
                          status={fee.status}
                        />
                      </td>


                      <td className="whitespace-nowrap px-6 py-5 text-right">

                        <div className="flex justify-end gap-2">

                          {!isPaid && (
                            <button
                              onClick={() =>
                                handlePay(fee)
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                            >
                              <CheckCircle2 size={15} />

                              Pay
                            </button>
                          )}


                          <button
                            onClick={() =>
                              handleDelete(fee)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={15} />

                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {showCreateModal && (
        <CreateFeeModal
          students={students}
          onClose={() =>
            setShowCreateModal(false)
          }
          onCreated={loadData}
        />
      )}

    </Layout>
  );
}


/*
 * The backend currently exposes GET /campus/fees/
 * for the organization, so use the existing API
 * directly rather than making one request per student.
 */

async function fetchAllFees() {
  const response = await fetch(
    "http://localhost:8001/campus/fees/",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          "access_token"
        )}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(
      () => ({})
    );

    throw new Error(
      error.detail ||
        "Failed to load fees."
    );
  }

  return response.json();
}


export default Fees;