import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  Search,
  RefreshCw,
  Eye,
  X,
  CheckCircle2,
  ClipboardList,
  User,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  CreditCard,
  AlertCircle,
  Bot,
  Sparkles,
  FileCheck,
  ShieldAlert,
  ExternalLink,
  Award,
} from "lucide-react";

import Layout from "../../components/layout/Layout";

import { openStudentDocumentFile } from "../../services/studentDocument";

import {
  getAdmissions,
  reviewEligibility,
  confirmAdmission,
  runAIAdmissionReview,
} from "../../services/admission";

import { getStudent } from "../../services/student";

import {
  getStudentFees,
  createFee,
  payFee,
} from "../../services/fee";


/* =========================================================
   Helpers
========================================================= */

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
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}


/* =========================================================
   Safe API Error Helper
========================================================= */

function getErrorMessage(
  error,
  fallback = "Something went wrong."
) {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.detail) {
    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          return item?.msg || "Validation error";
        })
        .join(", ");
    }

    if (typeof data.detail === "object") {
      return JSON.stringify(data.detail);
    }
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
}


/* =========================================================
   Status Badge
========================================================= */

function StatusBadge({ status }) {
  const value = String(
    status || "unknown"
  ).toLowerCase();

  let classes =
    "bg-gray-100 text-gray-600";

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
      "passed",
    ].includes(value)
  ) {
    classes =
      "bg-green-100 text-green-700";
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
      "manual_review",
      "unclear",
      "missing",
    ].includes(value)
  ) {
    classes =
      "bg-yellow-100 text-yellow-700";
  }

  if (
    [
      "rejected",
      "inactive",
      "failed",
      "not_eligible",
      "action_required",
    ].includes(value)
  ) {
    classes =
      "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {formatStatus(value)}
    </span>
  );
}


/* =========================================================
   Detail
========================================================= */

function Detail({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <div className="mt-1 flex items-center gap-2">
        {Icon && (
          <Icon
            size={15}
            className="shrink-0 text-gray-400"
          />
        )}

        <p className="break-words font-medium text-gray-900">
          {formatValue(value)}
        </p>
      </div>
    </div>
  );
}


/* =========================================================
   AI Recommendation Badge
========================================================= */

function AIRecommendationBadge({
  recommendation,
}) {
  const value = String(
    recommendation || "manual_review"
  ).toLowerCase();

  if (value === "eligible") {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
        <CheckCircle2 size={18} />
        Eligible
      </div>
    );
  }

  if (value === "not_eligible") {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
        <ShieldAlert size={18} />
        Not Eligible
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
      <AlertCircle size={18} />
      Manual Review
    </div>
  );
}


/* =========================================================
   Academic Marks
========================================================= */

function AcademicMarks({
  extractedData,
}) {
  if (
    !extractedData ||
    typeof extractedData !== "object"
  ) {
    return null;
  }

  const marks = Array.isArray(
    extractedData.marks
  )
    ? extractedData.marks
    : [];

  const percentage =
    extractedData.percentage;

  const totalObtained =
    extractedData.total_obtained;

  const totalMaximum =
    extractedData.total_maximum;

  const calculation =
    extractedData.percentage_calculation;

  const hasPercentage =
    percentage !== null &&
    percentage !== undefined &&
    percentage !== "";

  const hasTotal =
    totalObtained !== null &&
    totalObtained !== undefined &&
    totalMaximum !== null &&
    totalMaximum !== undefined;

  const hasMarks =
    marks.length > 0;

  if (
    !hasPercentage &&
    !hasTotal &&
    !hasMarks
  ) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">

      {/* =====================================================
          Academic Header
      ===================================================== */}

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">

          <Award
            size={18}
            className="text-white"
          />

        </div>

        <div>

          <h5 className="font-bold text-gray-900">
            Academic Information
          </h5>

          <p className="text-xs text-gray-500">
            Marks and percentage extracted from the document.
          </p>

        </div>

      </div>


      {/* =====================================================
          Summary
      ===================================================== */}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

        {hasPercentage && (

          <div className="rounded-xl border border-indigo-100 bg-white p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Calculated Percentage
            </p>

            <p className="mt-1 text-2xl font-bold text-indigo-700">
              {Number(
                percentage
              ).toFixed(2)}
              %
            </p>

            {calculation?.status ===
              "calculated" && (

              <p className="mt-1 text-xs text-gray-500">
                Calculated from extracted subject marks
              </p>

            )}

          </div>

        )}


        {hasTotal && (

          <div className="rounded-xl border border-gray-100 bg-white p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total Marks
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {totalObtained}
              {" / "}
              {totalMaximum}
            </p>

          </div>

        )}

      </div>


      {/* =====================================================
          Subject Marks
      ===================================================== */}

      {hasMarks && (

        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">

          <div className="border-b bg-gray-50 px-4 py-3">

            <p className="text-sm font-bold text-gray-900">
              Subject-wise Marks
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Subject
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Obtained
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Maximum
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Percentage
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {marks.map(
                  (mark, index) => {

                    const subject =
                      mark?.subject ||
                      mark?.subject_name ||
                      mark?.name ||
                      `Subject ${index + 1}`;

                    const obtained =
                      mark?.obtained ??
                      mark?.obtained_marks;

                    const maximum =
                      mark?.maximum ??
                      mark?.maximum_marks;

                    let subjectPercentage =
                      null;

                    if (
                      obtained !== null &&
                      obtained !== undefined &&
                      maximum !== null &&
                      maximum !== undefined &&
                      Number(maximum) > 0
                    ) {
                      subjectPercentage =
                        (
                          (Number(obtained) /
                            Number(maximum)) *
                          100
                        ).toFixed(2);
                    }

                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatValue(
                            subject
                          )}
                        </td>

                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {formatValue(
                            obtained
                          )}
                        </td>

                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {formatValue(
                            maximum
                          )}
                        </td>

                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">

                          {subjectPercentage !==
                          null
                            ? `${subjectPercentage}%`
                            : "—"}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* =====================================================
          Calculation Information
      ===================================================== */}

      {calculation?.status && (

        <div className="mt-3 rounded-lg bg-white p-3">

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Percentage Calculation
          </p>

          <p className="mt-1 text-sm text-gray-600">

            {calculation.status ===
            "calculated"
              ? "Percentage was calculated deterministically from the extracted subject marks."
              : calculation.reason ||
                "Percentage calculation was unavailable."}

          </p>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   AI Admission Review
========================================================= */

function AIAdmissionReview({
  application,
  aiReview,
  setAiReview,
}) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    openingDocumentId,
    setOpeningDocumentId,
  ] = useState(null);


  /* =========================================================
     Run AI Review
  ========================================================= */

  const handleRunReview =
    async () => {
      if (!application?.id) {
        toast.error(
          "Admission information is missing."
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        const result =
          await runAIAdmissionReview(
            application.id
          );

        console.log(
          "AI Admission Review:",
          result
        );

        setAiReview(result);

        toast.success(
          "AI admission review completed."
        );

      } catch (error) {
        console.error(
          "AI admission review failed:",
          error
        );

        const message =
          getErrorMessage(
            error,
            "Failed to generate AI admission review."
          );

        setError(message);

        toast.error(message);

      } finally {
        setLoading(false);
      }
    };


  /* =========================================================
     View Original Document
  ========================================================= */

  const handleViewDocument =
    async (documentId) => {
      if (!documentId) {
        toast.error(
          "Original document is not available."
        );

        return;
      }

      try {
        setOpeningDocumentId(
          documentId
        );

        await openStudentDocumentFile(
          documentId
        );

      } catch (error) {
        console.error(
          "Failed to open document:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Unable to open original document."
          )
        );

      } finally {
        setOpeningDocumentId(
          null
        );
      }
    };


  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5">

      {/* =====================================================
          Header
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">

            <Bot
              size={20}
              className="text-white"
            />

          </div>

          <div>

            <h3 className="font-bold text-gray-900">
              AI Admission Review
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Analyze eligibility criteria, submitted
              documents and verification evidence.
            </p>

          </div>

        </div>


        <button
          onClick={
            handleRunReview
          }
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >

          {loading ? (
            <>
              <RefreshCw
                size={16}
                className="animate-spin"
              />

              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={16} />

              {aiReview
                ? "Run Review Again"
                : "Run AI Review"}
            </>
          )}

        </button>

      </div>


      {/* =====================================================
          Error
      ===================================================== */}

      {error && (

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>

            <p className="font-semibold text-red-800">
              AI Review Failed
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

          </div>

        </div>

      )}


      {/* =====================================================
          Initial State
      ===================================================== */}

      {!aiReview &&
        !loading &&
        !error && (

          <div className="mt-5 rounded-xl border border-dashed border-indigo-200 bg-white p-7 text-center">

            <Bot
              size={32}
              className="mx-auto text-indigo-500"
            />

            <p className="mt-3 font-semibold text-gray-900">
              AI review has not been run yet
            </p>

            <p className="mx-auto mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Run AI review to analyze the applicant
              against institutional eligibility criteria
              and available document evidence.
            </p>

          </div>

        )}


      {/* =====================================================
          Loading State
      ===================================================== */}

      {loading && (

        <div className="mt-5 rounded-xl border border-indigo-100 bg-white p-8 text-center">

          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-gray-500"
          />

          <p className="mt-3 font-semibold text-gray-900">
            AI is reviewing this application...
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Checking institutional criteria and document
            evidence.
          </p>

        </div>

      )}


      {/* =====================================================
          AI RESULT
      ===================================================== */}

      {aiReview && !loading && (

        <div className="mt-5 space-y-5">

          {/* =================================================
              Recommendation
          ================================================= */}

          <div className="rounded-xl border border-gray-200 bg-white p-5">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  AI Recommendation
                </p>

                <div className="mt-3">

                  <AIRecommendationBadge
                    recommendation={
                      aiReview.recommendation
                    }
                  />

                </div>

              </div>


              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-gray-50 px-5 py-3">

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Confidence
                  </p>

                  <p className="mt-1 font-bold text-gray-900">
                    {String(
                      aiReview.confidence ||
                        "unknown"
                    ).toUpperCase()}
                  </p>

                </div>


                <div className="rounded-xl bg-gray-50 px-5 py-3">

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Source
                  </p>

                  <p className="mt-1 font-bold text-gray-900">
                    {formatStatus(
                      aiReview.criteria_source ||
                        "institutional_rag"
                    )}
                  </p>

                </div>

              </div>

            </div>


            {/* Manual Review */}

            {aiReview.requires_manual_review && (

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">

                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-yellow-700"
                />

                <div>

                  <p className="font-semibold text-yellow-900">
                    Manual Review Required
                  </p>

                  <p className="mt-1 text-sm leading-6 text-yellow-800">
                    AI could not establish eligibility
                    with sufficient evidence. The
                    administrator should review the
                    application and supporting documents
                    before making the final decision.
                  </p>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              Eligibility Criteria
          ================================================= */}

          {Array.isArray(
            aiReview.criteria
          ) &&
            aiReview.criteria.length > 0 && (

              <div className="rounded-xl border border-gray-200 bg-white p-5">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">

                    <CheckCircle2
                      size={18}
                      className="text-white"
                    />

                  </div>

                  <div>

                    <h4 className="font-bold text-gray-900">
                      Eligibility Criteria Analysis
                    </h4>

                    <p className="text-sm text-gray-500">
                      AI assessment against institutional
                      admission requirements.
                    </p>

                  </div>

                </div>


                <div className="space-y-3">

                  {aiReview.criteria.map(
                    (
                      criterion,
                      index
                    ) => (

                      <div
                        key={index}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                      >

                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">

                          <div className="flex-1">

                            <p className="font-semibold leading-6 text-gray-900">
                              {criterion.criterion}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                              {criterion.evidence}
                            </p>

                          </div>

                          <StatusBadge
                            status={
                              criterion.status
                            }
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


          {/* =================================================
              Document Analysis
          ================================================= */}

          {Array.isArray(
            aiReview.documents
          ) &&
            aiReview.documents.length > 0 && (

              <div className="rounded-xl border border-gray-200 bg-white p-5">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">

                    <FileCheck
                      size={18}
                      className="text-white"
                    />

                  </div>

                  <div>

                    <h4 className="font-bold text-gray-900">
                      Document Analysis
                    </h4>

                    <p className="text-sm text-gray-500">
                      Required documents and their
                      verification evidence.
                    </p>

                  </div>

                </div>


                <div className="space-y-4">

                  {aiReview.documents.map(
                    (
                      document,
                      index
                    ) => (

                      <div
                        key={
                          document.document_id ||
                          `${document.document_type}-${index}`
                        }
                        className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                      >

                        {/* =================================================
                            Document Header
                        ================================================= */}

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                          <div className="min-w-0">

                            <p className="font-semibold text-gray-900">
                              {formatStatus(
                                document.document_type ||
                                  "Document"
                              )}
                            </p>


                            {document.filename && (

                              <p className="mt-1 break-all text-xs text-gray-500">
                                {document.filename}
                              </p>

                            )}

                            {document.document_id && (

                              <p className="mt-1 text-xs text-gray-400">
                                Document ID:{" "}
                                {document.document_id}
                              </p>

                            )}

                          </div>


                          <div className="flex flex-wrap items-center gap-2">

                            {document.required && (

                              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                Required
                              </span>

                            )}

                            <StatusBadge
                              status={
                                document.verification_status
                              }
                            />

                          </div>

                        </div>


                        {/* =================================================
                            View Original Document
                        ================================================= */}

                        {document.document_id && (

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-white p-3">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">

                                <ExternalLink
                                  size={17}
                                  className="text-indigo-600"
                                />

                              </div>

                              <div>

                                <p className="text-sm font-semibold text-gray-900">
                                  Original Uploaded Document
                                </p>

                                <p className="text-xs text-gray-500">
                                  View the actual file submitted by the student.
                                </p>

                              </div>

                            </div>


                            <button
                              type="button"
                              onClick={() =>
                                handleViewDocument(
                                  document.document_id
                                )
                              }
                              disabled={
                                openingDocumentId ===
                                document.document_id
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                              {openingDocumentId ===
                              document.document_id ? (
                                <>
                                  <RefreshCw
                                    size={15}
                                    className="animate-spin"
                                  />

                                  Opening...
                                </>
                              ) : (
                                <>
                                  <Eye
                                    size={15}
                                  />

                                  View Original
                                </>
                              )}

                            </button>

                          </div>

                        )}


                        {/* =================================================
                            Missing Document
                        ================================================= */}

                        {!document.document_id &&
                          document.verification_status ===
                            "missing" && (

                            <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">

                              <div className="flex items-start gap-3">

                                <AlertCircle
                                  size={18}
                                  className="mt-0.5 shrink-0 text-yellow-700"
                                />

                                <div>

                                  <p className="font-semibold text-yellow-900">
                                    Document Missing
                                  </p>

                                  <p className="mt-1 text-sm text-yellow-800">
                                    {
                                      document.verification_reason ||
                                      "This required document has not been submitted."
                                    }
                                  </p>

                                </div>

                              </div>

                            </div>

                          )}


                        {/* =================================================
                            Verification Reason
                        ================================================= */}

                        {document.verification_reason &&
                          document.verification_status !==
                            "missing" && (

                            <div className="mt-4 rounded-lg bg-white p-3">

                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Verification
                              </p>

                              <p className="mt-1 text-sm leading-6 text-gray-600">
                                {
                                  document.verification_reason
                                }
                              </p>

                            </div>

                          )}


                        {/* =================================================
                            Academic Information
                        ================================================= */}

                        <AcademicMarks
                          extractedData={
                            document.extracted_data
                          }
                        />


                        {/* =================================================
                            Extracted General Data
                        ================================================= */}

                        {document.extracted_data &&
                          Object.keys(
                            document.extracted_data
                          ).length > 0 && (

                            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">

                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Extracted Information
                              </p>

                              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                                {Object.entries(
                                  document.extracted_data
                                )
                                  .filter(
                                    ([key]) =>
                                      ![
                                        "marks",
                                        "percentage_calculation",
                                        "total_obtained",
                                        "total_maximum",
                                      ].includes(
                                        key
                                      )
                                  )
                                  .map(
                                    (
                                      [key, value]
                                    ) => {

                                      if (
                                        value ===
                                          null ||
                                        value ===
                                          undefined ||
                                        value ===
                                          ""
                                      ) {
                                        return null;
                                      }

                                      if (
                                        typeof value ===
                                          "object"
                                      ) {
                                        return null;
                                      }

                                      return (
                                        <div
                                          key={key}
                                          className="rounded-lg bg-gray-50 p-3"
                                        >

                                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            {formatStatus(
                                              key
                                            )}
                                          </p>

                                          <p className="mt-1 break-words text-sm font-medium text-gray-900">
                                            {formatValue(
                                              value
                                            )}
                                          </p>

                                        </div>
                                      );
                                    }
                                  )}

                              </div>

                            </div>

                          )}


                        {/* =================================================
                            Findings
                        ================================================= */}

                        {Array.isArray(
                          document.findings
                        ) &&
                          document.findings.length > 0 && (

                            <div className="mt-4">

                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Findings
                              </p>

                              <ul className="mt-2 space-y-2">

                                {document.findings.map(
                                  (
                                    finding,
                                    findingIndex
                                  ) => (

                                    <li
                                      key={
                                        findingIndex
                                      }
                                      className="flex items-start gap-2 text-sm leading-6 text-gray-600"
                                    >

                                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />

                                      <span>
                                        {finding}
                                      </span>

                                    </li>

                                  )
                                )}

                              </ul>

                            </div>

                          )}

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


          {/* =================================================
              Issues
          ================================================= */}

          {Array.isArray(
            aiReview.issues
          ) &&
            aiReview.issues.length > 0 && (

              <div className="rounded-xl border border-red-200 bg-red-50 p-5">

                <div className="mb-4 flex items-center gap-3">

                  <AlertCircle
                    size={20}
                    className="text-red-600"
                  />

                  <div>

                    <h4 className="font-bold text-red-900">
                      Issues Requiring Attention
                    </h4>

                    <p className="text-sm text-red-700">
                      Items that may prevent an immediate
                      eligibility decision.
                    </p>

                  </div>

                </div>


                <ul className="space-y-2">

                  {aiReview.issues.map(
                    (
                      issue,
                      index
                    ) => (

                      <li
                        key={index}
                        className="flex items-start gap-3 rounded-lg bg-white/60 p-3 text-sm leading-6 text-red-800"
                      >

                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />

                        <span>
                          {issue}
                        </span>

                      </li>

                    )
                  )}

                </ul>

              </div>

            )}


          {/* =================================================
              AI Explanation
          ================================================= */}

          {aiReview.explanation && (

            <div className="rounded-xl border border-gray-200 bg-white p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">

                  <Bot
                    size={18}
                    className="text-white"
                  />

                </div>

                <div>

                  <h4 className="font-bold text-gray-900">
                    AI Explanation
                  </h4>

                  <p className="text-sm text-gray-500">
                    Reasoning summary based on available
                    institutional evidence.
                  </p>

                </div>

              </div>


              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">
                {aiReview.explanation}
              </p>


              <div className="mt-5 border-t border-gray-100 pt-4">

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">

                  <span>
                    Admission ID:{" "}
                    <strong className="text-gray-600">
                      {formatValue(
                        aiReview.admission_id
                      )}
                    </strong>
                  </span>

                  <span>
                    Student ID:{" "}
                    <strong className="text-gray-600">
                      {formatValue(
                        aiReview.student_id
                      )}
                    </strong>
                  </span>

                  <span>
                    Criteria Source:{" "}
                    <strong className="text-gray-600">
                      {formatValue(
                        aiReview.criteria_source
                      )}
                    </strong>
                  </span>

                </div>

              </div>

            </div>

          )}

        </div>

      )}

    </section>
  );
}


/* =========================================================
   Application Details Modal
========================================================= */

function ApplicationDetails({
  application,
  onClose,
  onRefresh,
}) {
  const [student, setStudent] =
    useState(null);

  const [fees, setFees] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [reviewing, setReviewing] =
    useState(false);

  const [creatingFee, setCreatingFee] =
    useState(false);

  const [payingFee, setPayingFee] =
    useState(false);

  const [confirming, setConfirming] =
    useState(false);

  const [aiReview, setAiReview] =
    useState(null);

  const [reviewStatus, setReviewStatus] =
    useState(
      String(
        application?.eligibility_status ||
          ""
      ).toLowerCase()
    );

  const [reason, setReason] =
    useState(
      application?.eligibility_reason ||
        ""
    );


  /* =========================================================
     Load Student + Fees
  ========================================================= */

  useEffect(() => {
    if (!application?.student_id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadDetails = async () => {
      try {
        setLoading(true);

        const [
          studentResult,
          feeResult,
        ] = await Promise.allSettled([
          getStudent(
            application.student_id
          ),

          getStudentFees(
            application.student_id
          ),
        ]);

        if (cancelled) {
          return;
        }

        if (
          studentResult.status ===
          "fulfilled"
        ) {
          setStudent(
            studentResult.value
          );
        }

        if (
          feeResult.status ===
          "fulfilled"
        ) {
          setFees(
            normalizeArray(
              feeResult.value,
              [
                "fees",
                "items",
                "data",
              ]
            )
          );
        }

      } catch (error) {
        console.error(
          "Failed to load application details:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Failed to load application details."
          )
        );

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };

  }, [
    application?.student_id,
  ]);


  /* =========================================================
     Reset AI Review
  ========================================================= */

  useEffect(() => {
    setAiReview(null);

    setReviewStatus(
      String(
        application?.eligibility_status ||
          ""
      ).toLowerCase()
    );

    setReason(
      application?.eligibility_reason ||
        ""
    );

  }, [application?.id]);


  /* =========================================================
     Fee Calculations
  ========================================================= */

  const totalFees = useMemo(() => {
    return fees.reduce(
      (total, fee) =>
        total +
        Number(fee.amount || 0),
      0
    );
  }, [fees]);


  const paidFees = useMemo(() => {
    return fees
      .filter(
        (fee) =>
          String(
            fee.status || ""
          ).toLowerCase() ===
          "paid"
      )
      .reduce(
        (total, fee) =>
          total +
          Number(fee.amount || 0),
        0
      );
  }, [fees]);


  const mandatoryFees = useMemo(() => {
    return fees.filter(
      (fee) =>
        String(
          fee.is_mandatory ??
            fee.mandatory ??
            ""
        ).toLowerCase() ===
        "true"
    );
  }, [fees]);


  const allMandatoryFeesPaid =
    useMemo(() => {
      if (
        mandatoryFees.length ===
        0
      ) {
        return false;
      }

      return mandatoryFees.every(
        (fee) =>
          String(
            fee.status || ""
          ).toLowerCase() ===
          "paid"
      );
    }, [mandatoryFees]);


  /* =========================================================
     Eligibility Review
  ========================================================= */

  const handleReview =
    async () => {
      if (!reviewStatus) {
        toast.error(
          "Select an eligibility status."
        );

        return;
      }

      try {
        setReviewing(true);

        await reviewEligibility(
          application.id,
          {
            eligibility_status:
              reviewStatus,

            eligibility_reason:
              reason.trim() ||
              null,
          }
        );

        toast.success(
          "Eligibility review updated."
        );

        onClose();

        if (onRefresh) {
          await onRefresh();
        }

      } catch (error) {
        console.error(
          "Eligibility review failed:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Failed to update eligibility."
          )
        );

      } finally {
        setReviewing(false);
      }
    };


  /* =========================================================
     Create Mandatory Admission Fee
  ========================================================= */

  const handleCreateMandatoryFee =
    async () => {
      if (!application?.id) {
        toast.error(
          "Admission information is missing."
        );

        return;
      }

      if (
        String(
          application?.status || ""
        ).toLowerCase() !==
        "approved"
      ) {
        toast.error(
          "Admission must be approved before creating the fee."
        );

        return;
      }

      try {
        setCreatingFee(true);

        await createFee({
          admission_id:
            application.id,

          fee_type:
            "admission",

          amount:
            25000,

          currency:
            "INR",

          is_mandatory:
            "true",
        });

        toast.success(
          "Mandatory admission fee created."
        );

        const updatedFees =
          await getStudentFees(
            application.student_id
          );

        setFees(
          normalizeArray(
            updatedFees,
            [
              "fees",
              "items",
              "data",
            ]
          )
        );

      } catch (error) {
        console.error(
          "Create mandatory fee failed:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Failed to create admission fee."
          )
        );

      } finally {
        setCreatingFee(false);
      }
    };


  /* =========================================================
     Pay Fee
  ========================================================= */

  const handlePayFee =
    async (fee) => {
      if (!fee?.id) {
        toast.error(
          "Fee ID is missing."
        );

        return;
      }

      if (
        !window.confirm(
          `Mark ${fee.fee_type} fee of ${
            fee.currency || "INR"
          } ${fee.amount} as paid?`
        )
      ) {
        return;
      }

      try {
        setPayingFee(true);

        await payFee(
          fee.id
        );

        toast.success(
          "Fee marked as paid."
        );

        const updatedFees =
          await getStudentFees(
            application.student_id
          );

        setFees(
          normalizeArray(
            updatedFees,
            [
              "fees",
              "items",
              "data",
            ]
          )
        );

      } catch (error) {
        console.error(
          "Fee payment failed:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Failed to mark fee as paid."
          )
        );

      } finally {
        setPayingFee(false);
      }
    };


  /* =========================================================
     Confirm Admission
  ========================================================= */

  const handleConfirmAdmission =
    async () => {
      const admissionStatus =
        String(
          application?.status || ""
        ).toLowerCase();

      if (
        admissionStatus !==
        "approved"
      ) {
        toast.error(
          "Admission must be approved before confirmation."
        );

        return;
      }

      if (
        mandatoryFees.length ===
        0
      ) {
        toast.error(
          "Create a mandatory admission fee first."
        );

        return;
      }

      if (
        !allMandatoryFeesPaid
      ) {
        toast.error(
          "All mandatory fees must be paid before confirmation."
        );

        return;
      }

      if (
        !window.confirm(
          "Confirm this student's admission?"
        )
      ) {
        return;
      }

      try {
        setConfirming(true);

        const result =
          await confirmAdmission(
            application.id
          );

        console.log(
          "Admission confirmation result:",
          result
        );

        toast.success(
          "Admission confirmed successfully."
        );

        if (onRefresh) {
          await onRefresh();
        }

        onClose();

      } catch (error) {
        console.error(
          "Admission confirmation failed:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Failed to confirm admission."
          )
        );

      } finally {
        setConfirming(false);
      }
    };


  /* =========================================================
     Modal UI
  ========================================================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* =====================================================
            Header
        ===================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">

              <ClipboardList
                size={21}
                className="text-white"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                Application Details
              </h2>

              <p className="text-sm text-gray-500">
                {formatValue(
                  application.application_number
                )}
              </p>

            </div>

          </div>


          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={22} />
          </button>

        </div>


        {/* =====================================================
            Body
        ===================================================== */}

        <div className="overflow-y-auto p-6">

          {loading ? (

            <div className="flex min-h-60 items-center justify-center">

              <div className="text-center">

                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                <p className="text-sm text-gray-500">
                  Loading application...
                </p>

              </div>

            </div>

          ) : (

            <div className="space-y-5">

              {/* =================================================
                  Application
              ================================================= */}

              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">

                    <ClipboardList
                      size={18}
                      className="text-white"
                    />

                  </div>

                  <h3 className="font-bold text-gray-900">
                    Application
                  </h3>

                </div>


                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                  <Detail
                    label="Application Number"
                    value={
                      application.application_number
                    }
                  />

                  <Detail
                    label="Program"
                    value={
                      application.program ||
                      student?.program
                    }
                  />

                  <Detail
                    label="Admission Type"
                    value={
                      application.admission_type
                    }
                  />


                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Admission Status
                    </p>

                    <div className="mt-2">

                      <StatusBadge
                        status={
                          application.status
                        }
                      />

                    </div>

                  </div>


                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Eligibility
                    </p>

                    <div className="mt-2">

                      <StatusBadge
                        status={
                          application.eligibility_status
                        }
                      />

                    </div>

                  </div>


                  <Detail
                    label="Application Date"
                    value={
                      application.application_date
                    }
                    icon={CalendarDays}
                  />


                  <Detail
                    label="Eligibility Reason"
                    value={
                      application.eligibility_reason
                    }
                  />


                  <Detail
                    label="Remarks"
                    value={
                      application.remarks
                    }
                  />

                </div>

              </section>


              {/* =================================================
                  Applicant
              ================================================= */}

              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">

                    <User
                      size={18}
                      className="text-white"
                    />

                  </div>

                  <h3 className="font-bold text-gray-900">
                    Applicant
                  </h3>

                </div>


                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                  <Detail
                    label="Full Name"
                    value={
                      student?.full_name
                    }
                  />

                  <Detail
                    label="Email"
                    value={
                      student?.email
                    }
                    icon={Mail}
                  />

                  <Detail
                    label="Phone"
                    value={
                      student?.phone
                    }
                    icon={Phone}
                  />

                  <Detail
                    label="Department"
                    value={
                      student?.department
                    }
                    icon={Building2}
                  />

                  <Detail
                    label="Academic Year"
                    value={
                      student?.academic_year
                    }
                  />

                  <Detail
                    label="Semester"
                    value={
                      student?.semester
                    }
                  />

                </div>

              </section>


              {/* =================================================
                  AI ADMISSION REVIEW
              ================================================= */}

              <AIAdmissionReview
                application={
                  application
                }
                aiReview={
                  aiReview
                }
                setAiReview={
                  setAiReview
                }
              />


              {/* =================================================
                  Admission Fee
              ================================================= */}

              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

                <div className="mb-5 flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">

                      <CreditCard
                        size={18}
                        className="text-white"
                      />

                    </div>

                    <div>

                      <h3 className="font-bold text-gray-900">
                        Admission Fee
                      </h3>

                      <p className="text-sm text-gray-500">
                        Mandatory fee required before admission confirmation.
                      </p>

                    </div>

                  </div>


                  {String(
                    application?.status || ""
                  ).toLowerCase() ===
                    "approved" &&
                    fees.length === 0 && (

                    <button
                      onClick={
                        handleCreateMandatoryFee
                      }
                      disabled={
                        creatingFee
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
                    >

                      {creatingFee ? (
                        <>
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />

                          Creating...
                        </>
                      ) : (
                        <>
                          <CreditCard
                            size={16}
                          />

                          Create ₹25,000 Fee
                        </>
                      )}

                    </button>

                  )}

                </div>


                {fees.length === 0 ? (

                  <div className="rounded-xl border border-dashed border-gray-200 bg-white p-5">

                    <div className="flex items-start gap-3">

                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />

                      <div>

                        <p className="font-medium text-gray-900">
                          No fee created
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Create the mandatory admission fee before confirming admission.
                        </p>

                      </div>

                    </div>

                  </div>

                ) : (

                  <div className="space-y-4">

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                      <div className="rounded-xl border border-gray-200 bg-white p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Total
                        </p>

                        <p className="mt-1 text-lg font-bold text-gray-900">
                          ₹
                          {totalFees.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>


                      <div className="rounded-xl border border-gray-200 bg-white p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Paid
                        </p>

                        <p className="mt-1 text-lg font-bold text-green-700">
                          ₹
                          {paidFees.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>


                      <div className="rounded-xl border border-gray-200 bg-white p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Pending
                        </p>

                        <p className="mt-1 text-lg font-bold text-yellow-700">
                          ₹
                          {(
                            totalFees -
                            paidFees
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>

                    </div>


                    {fees.map(
                      (fee, index) => {

                        const isPaid =
                          String(
                            fee.status || ""
                          ).toLowerCase() ===
                          "paid";

                        const isMandatory =
                          String(
                            fee.is_mandatory ??
                              fee.mandatory ??
                              ""
                          ).toLowerCase() ===
                          "true";

                        return (

                          <div
                            key={
                              fee.id ||
                              index
                            }
                            className="rounded-xl border border-gray-200 bg-white p-4"
                          >

                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                              <div>

                                <p className="font-semibold capitalize text-gray-900">
                                  {formatValue(
                                    fee.fee_type
                                  )}
                                </p>

                                <p className="mt-1 text-lg font-bold text-gray-900">

                                  {formatValue(
                                    fee.currency
                                  )}{" "}

                                  {Number(
                                    fee.amount ||
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}

                                </p>


                                {isMandatory && (

                                  <p className="mt-1 text-xs font-semibold text-gray-500">
                                    Mandatory
                                  </p>

                                )}

                              </div>


                              <div className="flex flex-wrap items-center gap-3">

                                <StatusBadge
                                  status={
                                    fee.status
                                  }
                                />


                                {!isPaid && (

                                  <button
                                    onClick={() =>
                                      handlePayFee(
                                        fee
                                      )
                                    }
                                    disabled={
                                      payingFee
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
                                  >

                                    {payingFee ? (
                                      <>
                                        <RefreshCw
                                          size={
                                            15
                                          }
                                          className="animate-spin"
                                        />

                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2
                                          size={
                                            15
                                          }
                                        />

                                        Pay Fee
                                      </>
                                    )}

                                  </button>

                                )}

                              </div>

                            </div>

                          </div>

                        );
                      }
                    )}


                    {String(
                      application?.status ||
                        ""
                    ).toLowerCase() ===
                      "approved" && (

                      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                          <div>

                            <p className="font-semibold text-gray-900">
                              Admission Confirmation
                            </p>

                            <p className="mt-1 text-sm text-gray-500">

                              {mandatoryFees.length ===
                                0
                                ? "A mandatory fee is required before confirmation."
                                : allMandatoryFeesPaid
                                  ? "All mandatory fees are paid. Admission can now be confirmed."
                                  : "Confirmation is available only after all mandatory fees are paid."}

                            </p>

                          </div>


                          <button
                            onClick={
                              handleConfirmAdmission
                            }
                            disabled={
                              confirming ||
                              !allMandatoryFeesPaid
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >

                            {confirming ? (
                              <>
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />

                                Confirming...
                              </>
                            ) : (
                              <>
                                <CheckCircle2
                                  size={16}
                                />

                                Confirm Admission
                              </>
                            )}

                          </button>

                        </div>

                      </div>

                    )}

                  </div>

                )}

              </section>


              {/* =================================================
                  Eligibility Review
              ================================================= */}

              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">

                    <CheckCircle2
                      size={18}
                      className="text-white"
                    />

                  </div>

                  <div>

                    <h3 className="font-bold text-gray-900">
                      Eligibility Review
                    </h3>

                    <p className="text-sm text-gray-500">
                      Update applicant eligibility.
                    </p>

                  </div>

                </div>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Eligibility Status
                    </label>

                    <select
                      value={
                        reviewStatus
                      }
                      onChange={(
                        event
                      ) =>
                        setReviewStatus(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400"
                    >

                      <option value="">
                        Select status
                      </option>

                      <option value="eligible">
                        Eligible
                      </option>

                      <option value="not_eligible">
                        Not Eligible
                      </option>

                      <option value="review_required">
                        Review Required
                      </option>

                    </select>

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Reason
                    </label>

                    <input
                      value={
                        reason
                      }
                      onChange={(
                        event
                      ) =>
                        setReason(
                          event.target.value
                        )
                      }
                      placeholder="Enter eligibility reason..."
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400"
                    />

                  </div>

                </div>


                <div className="mt-5 flex justify-end">

                  <button
                    onClick={
                      handleReview
                    }
                    disabled={
                      reviewing
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
                  >

                    {reviewing ? (
                      <>
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={16}
                        />

                        Save Review
                      </>
                    )}

                  </button>

                </div>

              </section>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   Applications Page
========================================================= */

function Applications() {
  const [applications, setApplications] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [
    selectedApplication,
    setSelectedApplication,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  /* =========================================================
     Load Applications
  ========================================================= */

  const loadApplications =
    async () => {
      try {
        setRefreshing(true);

        const data =
          await getAdmissions();

        setApplications(
          normalizeArray(
            data,
            [
              "admissions",
              "applications",
              "items",
              "data",
            ]
          )
        );

      } catch (error) {
        console.error(
          "Failed to load applications:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Failed to load applications."
          )
        );

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };


  useEffect(() => {
    loadApplications();
  }, []);


  /* =========================================================
     Search
  ========================================================= */

  const filteredApplications =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return applications;
      }

      return applications.filter(
        (application) =>
          [
            application.application_number,
            application.program,
            application.admission_type,
            application.status,
            application.eligibility_status,
            application.student_name,
            application.email,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(query)
            )
      );

    }, [
      applications,
      search,
    ]);


  /* =========================================================
     Summary Counts
  ========================================================= */

  const pendingCount =
    applications.filter(
      (application) =>
        [
          "pending",
          "submitted",
          "under_review",
        ].includes(
          String(
            application.status || ""
          ).toLowerCase()
        )
    ).length;


  const eligibleCount =
    applications.filter(
      (application) =>
        String(
          application.eligibility_status ||
            ""
        ).toLowerCase() ===
        "eligible"
    ).length;


  const confirmedCount =
    applications.filter(
      (application) =>
        String(
          application.status || ""
        ).toLowerCase() ===
        "confirmed"
    ).length;


  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <Layout>

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

            <p className="text-sm text-gray-500">
              Loading applications...
            </p>

          </div>

        </div>

      </Layout>
    );
  }


  /* =========================================================
     Page
  ========================================================= */

  return (
    <Layout>

      {/* =====================================================
          Header
      ===================================================== */}

      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">

            <ClipboardList
              size={21}
              className="text-white"
            />

          </div>

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Applications
            </h1>

            <p className="mt-1 text-gray-500">
              Review and manage student admission applications.
            </p>

          </div>

        </div>


        <button
          onClick={
            loadApplications
          }
          disabled={
            refreshing
          }
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
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

      </div>


      {/* =====================================================
          Summary
      ===================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Applications
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900">
            {applications.length}
          </p>

        </div>


        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Pending Review
          </p>

          <p className="mt-1 text-3xl font-bold text-yellow-700">
            {pendingCount}
          </p>

        </div>


        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Eligible
          </p>

          <p className="mt-1 text-3xl font-bold text-green-700">
            {eligibleCount}
          </p>

        </div>


        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Confirmed
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900">
            {confirmedCount}
          </p>

        </div>

      </div>


      {/* =====================================================
          Search
      ===================================================== */}

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="relative">

          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by application number, program, status..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
          />

        </div>

      </div>


      {/* =====================================================
          Table
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {filteredApplications.length ===
        0 ? (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">

              <ClipboardList
                size={25}
                className="text-gray-500"
              />

            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No applications found
            </h3>

            <p className="mt-1 text-sm text-gray-500">

              {search
                ? "Try a different search term."
                : "There are no applications in this organization yet."}

            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Application
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Program
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Eligibility
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {filteredApplications.map(
                  (
                    application,
                    index
                  ) => (

                    <tr
                      key={
                        application.id ||
                        index
                      }
                      className="transition hover:bg-gray-50"
                    >

                      <td className="px-6 py-5">

                        <p className="font-semibold text-gray-900">
                          {formatValue(
                            application.application_number
                          )}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Student ID:{" "}
                          {formatValue(
                            application.student_id
                          )}
                        </p>

                      </td>


                      <td className="px-6 py-5">

                        <p className="font-medium text-gray-900">
                          {formatValue(
                            application.program
                          )}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatValue(
                            application.admission_type
                          )}
                        </p>

                      </td>


                      <td className="whitespace-nowrap px-6 py-5">

                        <StatusBadge
                          status={
                            application.eligibility_status
                          }
                        />

                      </td>


                      <td className="whitespace-nowrap px-6 py-5">

                        <StatusBadge
                          status={
                            application.status
                          }
                        />

                      </td>


                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-600">

                        {formatValue(
                          application.application_date
                        )}

                      </td>


                      <td className="whitespace-nowrap px-6 py-5 text-right">

                        <button
                          onClick={() =>
                            setSelectedApplication(
                              application
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-900 hover:text-white"
                        >

                          <Eye
                            size={16}
                          />

                          Review

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


      {/* =====================================================
          Modal
      ===================================================== */}

      {selectedApplication && (

        <ApplicationDetails
          application={
            selectedApplication
          }

          onClose={() =>
            setSelectedApplication(
              null
            )
          }

          onRefresh={
            loadApplications
          }

        />

      )}

    </Layout>
  );
}


export default Applications;