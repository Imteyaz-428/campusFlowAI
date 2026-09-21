import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
  FileText,
  Upload,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
  RotateCcw,
  Info,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import ApplicantLayout from "../../../components/layout/ApplicantLayout";

import {
  getMyApplicantDocuments,
  uploadMyApplicantDocument,
} from "../../../services/document";



// DOCUMENT TYPES


const DOCUMENT_TYPES = [
  {
    value: "aadhaar",
    label: "Aadhaar Card",
    description: "Government-issued identity proof.",
  },
  {
    value: "10th_marksheet",
    label: "10th Marksheet",
    description: "Class 10 academic certificate/marksheet.",
  },
  {
    value: "12th_marksheet",
    label: "12th Marksheet",
    description: "Class 12 academic certificate/marksheet.",
  },
  {
    value: "photograph",
    label: "Passport Photograph",
    description: "Recent passport-size photograph.",
  },
  {
    value: "income_certificate",
    label: "Income Certificate",
    description: "Valid income certificate if required.",
  },
];



// CONSTANTS


const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
];



// STATUS CONFIG


const getStatusConfig = (status) => {
  const normalized = String(status || "")
    .toLowerCase()
    .trim();

  if (
    normalized === "verified" ||
    normalized === "approved"
  ) {
    return {
      label: "Verified",
      icon: CheckCircle2,
      className:
        "border-green-200 bg-green-50 text-green-700",
    };
  }

  if (
    normalized === "rejected" ||
    normalized === "invalid"
  ) {
    return {
      label: "Rejected",
      icon: XCircle,
      className:
        "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (
    normalized === "processing" ||
    normalized === "under_review" ||
    normalized === "review_required"
  ) {
    return {
      label: "Under Review",
      icon: Clock3,
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (
    normalized === "uploaded" ||
    normalized === "pending"
  ) {
    return {
      label: "Uploaded",
      icon: Clock3,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: status
      ? String(status)
          .replaceAll("_", " ")
          .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
          )
      : "Unknown",

    icon: AlertCircle,

    className:
      "border-gray-200 bg-gray-50 text-gray-700",
  };
};



// DOCUMENT LABEL


const getDocumentLabel = (documentType) => {
  const normalized = String(
    documentType || ""
  ).toLowerCase();

  const found = DOCUMENT_TYPES.find(
    (document) =>
      document.value === normalized
  );

  if (found) {
    return found.label;
  }

  return (
    String(documentType || "Document")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  );
};



// DOCUMENT TYPE DESCRIPTION


const getDocumentDescription = (
  documentType
) => {
  const found = DOCUMENT_TYPES.find(
    (document) =>
      document.value ===
      String(documentType || "").toLowerCase()
  );

  return (
    found?.description ||
    "Required admission document."
  );
};



// FILE SIZE


const formatFileSize = (bytes) => {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(
      bytes / 1024
    )} KB`;
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(2)} MB`;
};



// STATUS BADGE


function StatusBadge({ status }) {
  const config =
    getStatusConfig(status);

  const StatusIcon =
    config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <StatusIcon size={13} />

      {config.label}
    </span>
  );
}



// DOCUMENT CHECKLIST ITEM


function ChecklistItem({
  documentType,
  document,
}) {
  const label =
    getDocumentLabel(documentType);

  const isSubmitted =
    Boolean(document);

  const status =
    document?.verification_status ||
    document?.status;

  const isVerified =
    String(status || "")
      .toLowerCase() ===
    "verified";

  const isRejected =
    String(status || "")
      .toLowerCase() ===
    "rejected";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">

      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isVerified
            ? "bg-green-100 text-green-600"
            : isRejected
            ? "bg-red-100 text-red-600"
            : isSubmitted
            ? "bg-amber-100 text-amber-600"
            : "bg-white text-gray-400"
        }`}
      >

        {isVerified ? (
          <CheckCircle2 size={17} />
        ) : isRejected ? (
          <XCircle size={17} />
        ) : isSubmitted ? (
          <Clock3 size={17} />
        ) : (
          <FileText size={17} />
        )}

      </div>


      <div className="min-w-0 flex-1">

        <p className="truncate text-sm font-semibold text-gray-900">
          {label}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">

          {isVerified
            ? "Verified"
            : isRejected
            ? "Rejected — action required"
            : isSubmitted
            ? "Submitted — awaiting verification"
            : "Not submitted"}

        </p>

      </div>

    </div>
  );
}



// DOCUMENT CARD


function DocumentCard({
  document,
  onReupload,
}) {
  const documentType =
    document.document_type ||
    document.type;

  const fileName =
    document.file_name ||
    document.filename ||
    document.original_filename ||
    "Uploaded document";

  const status =
    document.verification_status ||
    document.status;

  const statusConfig =
    getStatusConfig(status);

  const StatusIcon =
    statusConfig.icon;

  const normalizedStatus =
    String(status || "")
      .toLowerCase();

  const isRejected =
    normalizedStatus ===
      "rejected" ||
    normalizedStatus ===
      "invalid";


  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

      {/* ======================================================
          TOP
      ======================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">

            <FileText
              size={19}
              className="text-gray-600"
            />

          </div>


          <div className="min-w-0">

            <p className="truncate text-sm font-bold text-gray-900">
              {getDocumentLabel(
                documentType
              )}
            </p>

            <p className="mt-0.5 truncate text-xs text-gray-500">
              {fileName}
            </p>

          </div>

        </div>


        <div className="flex items-center gap-2">

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold ${statusConfig.className}`}
          >

            <StatusIcon size={13} />

            {statusConfig.label}

          </span>

        </div>

      </div>


      {/* ======================================================
          REJECTION REASON
      ======================================================= */}

      {isRejected && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-start gap-3">

            <XCircle
              size={17}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div className="min-w-0">

              <p className="text-sm font-semibold text-red-900">
                Document rejected
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">

                {document.verification_reason ||
                  document.rejection_reason ||
                  "The uploaded document could not be verified. Please upload a corrected document."}

              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              onReupload(
                documentType
              )
            }
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
          >

            <RotateCcw size={14} />

            Upload Again

          </button>

        </div>
      )}


      {/* ======================================================
          VERIFICATION REASON
      ======================================================= */}

      {!isRejected &&
        document.verification_reason && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">

            <div className="flex items-start gap-2">

              <Info
                size={15}
                className="mt-0.5 shrink-0 text-gray-500"
              />

              <p className="text-xs leading-5 text-gray-600">
                {document.verification_reason}
              </p>

            </div>

          </div>
        )}


      {/* ======================================================
          META
      ======================================================= */}

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-gray-200 pt-3 text-xs text-gray-400">

        {document.uploaded_at && (
          <span>
            Uploaded:{" "}
            {new Date(
              document.uploaded_at
            ).toLocaleDateString(
              "en-IN"
            )}
          </span>
        )}

        {document.verified_at && (
          <span>
            Verified:{" "}
            {new Date(
              document.verified_at
            ).toLocaleDateString(
              "en-IN"
            )}
          </span>
        )}

      </div>

    </div>
  );
}



// MAIN COMPONENT


function ApplicantDocuments() {

  const navigate =
    useNavigate();

  const fileInputRef =
    useRef(null);


  // ==============================================================
  // STATE
  // ==============================================================

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [selectedType, setSelectedType] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [error, setError] =
    useState("");


  // ==============================================================
  // LOAD DOCUMENTS
  // ==============================================================

  const loadDocuments = async () => {

    setLoading(true);
    setError("");

    try {

      const response =
        await getMyApplicantDocuments();

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (
        Array.isArray(
          response?.documents
        )
      ) {
        data =
          response.documents;
      } else if (
        Array.isArray(
          response?.data
        )
      ) {
        data =
          response.data;
      } else if (
        Array.isArray(
          response?.data?.documents
        )
      ) {
        data =
          response.data.documents;
      }

      setDocuments(data);

    } catch (err) {

      console.error(
        "Failed to load applicant documents:",
        err
      );

      if (
        err?.response?.status === 401
      ) {

        localStorage.removeItem(
          "applicant_token"
        );

        navigate(
          "/applicant/login",
          {
            replace: true,
          }
        );

        return;
      }

      const message =
        err?.response?.data?.detail ||
        "Unable to load your documents.";

      setError(message);

    } finally {

      setLoading(false);

    }
  };


  // ==============================================================
  // INITIAL LOAD
  // ==============================================================

  useEffect(() => {

    loadDocuments();

  }, []);


  // ==============================================================
  // FILE SELECT
  // ==============================================================

  const handleFileChange = (
    event
  ) => {

    const file =
      event.target.files?.[0];

    setError("");

    if (!file) {

      setSelectedFile(null);

      return;
    }


    const extension =
      `.${file.name
        .split(".")
        .pop()
        .toLowerCase()}`;


    if (
      !ALLOWED_EXTENSIONS.includes(
        extension
      )
    ) {

      toast.error(
        "Please select a PDF, JPG, JPEG, or PNG file."
      );

      event.target.value =
        "";

      setSelectedFile(null);

      return;
    }


    if (
      file.size >
      MAX_FILE_SIZE
    ) {

      toast.error(
        "File size must be 10 MB or less."
      );

      event.target.value =
        "";

      setSelectedFile(null);

      return;
    }


    setSelectedFile(file);

  };


  // ==============================================================
  // UPLOAD
  // ==============================================================

  const handleUpload = async () => {

    if (!selectedType) {

      toast.error(
        "Please select a document type."
      );

      return;
    }


    if (!selectedFile) {

      toast.error(
        "Please select a file."
      );

      return;
    }


    setUploading(true);
    setError("");


    try {

      await uploadMyApplicantDocument(
        selectedType,
        selectedFile
      );


      toast.success(
        "Document uploaded successfully."
      );


      setSelectedType("");
      setSelectedFile(null);


      if (
        fileInputRef.current
      ) {

        fileInputRef.current.value =
          "";

      }


      await loadDocuments();

    } catch (err) {

      console.error(
        "Document upload failed:",
        err
      );


      if (
        err?.response?.status === 401
      ) {

        localStorage.removeItem(
          "applicant_token"
        );

        navigate(
          "/applicant/login",
          {
            replace: true,
          }
        );

        return;
      }


      toast.error(
        err?.response?.data?.detail ||
          "Unable to upload document."
      );

    } finally {

      setUploading(false);

    }
  };


  // ==============================================================
  // REUPLOAD
  // ==============================================================

  const handleReupload = (
    documentType
  ) => {

    setSelectedType(
      documentType
    );

    setSelectedFile(null);

    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";

    }


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });


    toast(
      `Select a new ${getDocumentLabel(
        documentType
      )} file.`,
      {
        icon: "↻",
      }
    );
  };


  // ==============================================================
  // CLEAR FILE
  // ==============================================================

  const clearSelectedFile = () => {

    setSelectedFile(null);

    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";

    }
  };


  // ==============================================================
  // REQUIRED DOCUMENT MAP
  // ==============================================================

  const getLatestDocumentForType = (
    documentType
  ) => {

    const matches =
      documents.filter(
        (document) => {

          const type =
            String(
              document.document_type ||
                document.type ||
                ""
            ).toLowerCase();

          return (
            type ===
            documentType
          );
        }
      );


    if (!matches.length) {
      return null;
    }


    return matches[
      matches.length - 1
    ];
  };


  // ==============================================================
  // COUNTS
  // ==============================================================

  const submittedCount =
    DOCUMENT_TYPES.filter(
      (documentType) =>
        Boolean(
          getLatestDocumentForType(
            documentType.value
          )
        )
    ).length;


  const verifiedCount =
    documents.filter(
      (document) =>
        String(
          document.verification_status ||
            document.status ||
            ""
        ).toLowerCase() ===
        "verified"
    ).length;


  const rejectedCount =
    documents.filter(
      (document) =>
        ["rejected", "invalid"].includes(
          String(
            document.verification_status ||
              document.status ||
              ""
          ).toLowerCase()
        )
    ).length;


  const pendingCount =
    documents.filter(
      (document) => {

        const status =
          String(
            document.verification_status ||
              document.status ||
              ""
          ).toLowerCase();

        return (
          ![
            "verified",
            "rejected",
            "invalid",
          ].includes(status)
        );

      }
    ).length;


  const requiredCount =
    DOCUMENT_TYPES.length;


  const missingCount =
    Math.max(
      0,
      requiredCount -
        submittedCount
    );


  const progress =
    requiredCount > 0
      ? Math.min(
          100,
          Math.round(
            (submittedCount /
              requiredCount) *
              100
          )
        )
      : 0;


  // ==============================================================
  // LOADING
  // ==============================================================

  if (loading) {

    return (
      <ApplicantLayout>

        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">

          <div className="text-center">

            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-gray-700"
            />

            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading your documents...
            </p>

          </div>

        </div>

      </ApplicantLayout>
    );
  }


  // ==============================================================
  // ERROR
  // ==============================================================

  if (error) {

    return (
      <ApplicantLayout>

        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4">

          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">

              <AlertCircle
                size={24}
                className="text-red-600"
              />

            </div>


            <h1 className="mt-5 text-xl font-bold text-gray-900">
              Unable to Load Documents
            </h1>


            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error}
            </p>


            <button
              type="button"
              onClick={loadDocuments}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >

              <RefreshCw size={16} />

              Try Again

            </button>

          </div>

        </div>

      </ApplicantLayout>
    );
  }


  // ==============================================================
  // RENDER
  // ==============================================================

  return (
    <ApplicantLayout>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="mb-8">

          <Link
            to="/applicant/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
          >

            <ArrowLeft size={16} />

            Back to Dashboard

          </Link>


          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Applicant Portal
              </p>


              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                My Documents
              </h1>


              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Upload the documents required for your
                admission application and track their
                verification status.
              </p>

            </div>


            <button
              type="button"
              onClick={loadDocuments}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >

              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>

          </div>

        </div>


        {/* ======================================================
            PROGRESS
        ======================================================= */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                <ShieldCheck
                  size={21}
                  className="text-blue-600"
                />

              </div>


              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Document Progress
                </p>


                <h2 className="mt-1 text-lg font-bold text-gray-900">

                  {submittedCount} of{" "}
                  {requiredCount} required
                  documents submitted

                </h2>


                <p className="mt-1 text-sm text-gray-500">

                  {missingCount > 0
                    ? `${missingCount} document${
                        missingCount > 1
                          ? "s"
                          : ""
                      } still required.`
                    : "All required documents have been submitted."}

                </p>

              </div>

            </div>


            <div className="text-left md:text-right">

              <p className="text-2xl font-bold text-gray-900">
                {progress}%
              </p>

              <p className="text-xs text-gray-500">
                Complete
              </p>

            </div>

          </div>


          <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">

            <div
              className="h-full rounded-full bg-gray-900 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </section>


        {/* ======================================================
            SUMMARY
        ======================================================= */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <SummaryCard
            label="Submitted"
            value={submittedCount}
            icon={
              <FileText
                size={18}
              />
            }
            iconClass="bg-blue-50 text-blue-600"
          />


          <SummaryCard
            label="Verified"
            value={verifiedCount}
            icon={
              <CheckCircle2
                size={18}
              />
            }
            iconClass="bg-green-50 text-green-600"
          />


          <SummaryCard
            label="Pending"
            value={pendingCount}
            icon={
              <Clock3
                size={18}
              />
            }
            iconClass="bg-amber-50 text-amber-600"
          />


          <SummaryCard
            label="Rejected"
            value={rejectedCount}
            icon={
              <XCircle
                size={18}
              />
            }
            iconClass="bg-red-50 text-red-600"
          />

        </div>


        {/* ======================================================
            REQUIRED DOCUMENTS
        ======================================================= */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div>

            <h2 className="font-bold text-gray-900">
              Required Documents
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Check the submission and verification
              status of your admission documents.
            </p>

          </div>


          <div className="mt-5 grid gap-3 md:grid-cols-2">

            {DOCUMENT_TYPES.map(
              (documentType) => (

                <ChecklistItem
                  key={
                    documentType.value
                  }
                  documentType={
                    documentType.value
                  }
                  document={getLatestDocumentForType(
                    documentType.value
                  )}
                />

              )
            )}

          </div>

        </section>


        {/* ======================================================
            UPLOAD SECTION
        ======================================================= */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900">

              <Upload
                size={19}
                className="text-white"
              />

            </div>


            <div>

              <h2 className="font-bold text-gray-900">
                Upload Document
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Select the document type and upload your file.
              </p>

            </div>

          </div>


          <div className="mt-6 grid gap-5 lg:grid-cols-2">

            {/* ==================================================
                DOCUMENT TYPE
            =================================================== */}

            <div>

              <label
                htmlFor="document-type"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Document Type
              </label>


              <select
                id="document-type"
                value={selectedType}
                onChange={(event) =>
                  setSelectedType(
                    event.target.value
                  )
                }
                disabled={uploading}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50"
              >

                <option value="">
                  Select document type
                </option>


                {DOCUMENT_TYPES.map(
                  (document) => (

                    <option
                      key={
                        document.value
                      }
                      value={
                        document.value
                      }
                    >
                      {document.label}
                    </option>

                  )
                )}

              </select>


              {selectedType && (

                <div className="mt-2 flex items-start gap-2">

                  <Info
                    size={14}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <p className="text-xs text-gray-500">

                    {getDocumentDescription(
                      selectedType
                    )}

                  </p>

                </div>

              )}

            </div>


            {/* ==================================================
                FILE
            =================================================== */}

            <div>

              <label
                htmlFor="document-file"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Select File
              </label>


              <input
                ref={fileInputRef}
                id="document-file"
                type="file"
                onChange={
                  handleFileChange
                }
                disabled={uploading}
                accept=".pdf,.jpg,.jpeg,.png"
                className="block w-full cursor-pointer rounded-xl border border-gray-200 bg-white text-sm text-gray-600 file:mr-4 file:border-0 file:bg-gray-50 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-100 disabled:cursor-not-allowed"
              />


              <p className="mt-2 text-xs text-gray-400">
                Supported formats: PDF, JPG, JPEG, PNG.
                Maximum size: 10 MB.
              </p>

            </div>

          </div>


          {/* ====================================================
              SELECTED FILE
          ===================================================== */}

          {selectedFile && (

            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

                  <FileText
                    size={17}
                    className="text-gray-600"
                  />

                </div>


                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-gray-800">
                    {selectedFile.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {formatFileSize(
                      selectedFile.size
                    )}
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  clearSelectedFile
                }
                disabled={uploading}
                className="w-fit text-xs font-semibold text-gray-500 transition hover:text-gray-900 disabled:opacity-50"
              >
                Remove
              </button>

            </div>

          )}


          {/* ====================================================
              UPLOAD BUTTON
          ===================================================== */}

          <div className="mt-5 flex justify-end">

            <button
              type="button"
              onClick={
                handleUpload
              }
              disabled={
                uploading ||
                !selectedType ||
                !selectedFile
              }
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {uploading ? (

                <>
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />

                  Uploading...
                </>

              ) : (

                <>
                  <Upload size={16} />

                  Upload Document
                </>

              )}

            </button>

          </div>

        </section>


        {/* ======================================================
            SUBMITTED DOCUMENTS
        ======================================================= */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="font-bold text-gray-900">
                Submitted Documents
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Track the verification status of your uploaded documents.
              </p>

            </div>


            <span className="w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600">
              {documents.length} submitted
            </span>

          </div>


          <div className="mt-6">

            {documents.length === 0 ? (

              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white">

                  <FileText
                    size={22}
                    className="text-gray-500"
                  />

                </div>


                <h3 className="mt-4 text-sm font-bold text-gray-900">
                  No documents uploaded yet
                </h3>


                <p className="mt-1 text-sm text-gray-500">
                  Upload your required admission documents using the form above.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {documents.map(
                  (document, index) => (

                    <DocumentCard
                      key={
                        document.id ||
                        index
                      }
                      document={
                        document
                      }
                      onReupload={
                        handleReupload
                      }
                    />

                  )
                )}

              </div>

            )}

          </div>

        </section>


        {/* ======================================================
            INFORMATION
        ======================================================= */}

        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex items-start gap-3">

            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>

              <h3 className="font-semibold text-blue-900">
                Document verification
              </h3>


              <p className="mt-1 text-sm leading-6 text-blue-800">

                Uploaded documents are reviewed by
                authorized campus staff. Documents that
                require correction or are rejected will show
                the reason so you can upload a new version.

              </p>

            </div>

          </div>

        </section>

      </main>

    </ApplicantLayout>
  );
}



// SUMMARY CARD


function SummaryCard({
  label,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
      >
        {icon}
      </div>


      <p className="mt-3 text-xs font-medium text-gray-500">
        {label}
      </p>


      <p className="mt-1 text-2xl font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}


export default ApplicantDocuments;