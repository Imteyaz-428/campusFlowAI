import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  Upload,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import Layout from "../../components/layout/Layout";

import { getMyStudentProfile } from "../../services/student";

import {
  getStudentDocumentList,
  uploadStudentDocument,
} from "../../services/document";


const DOCUMENT_TYPES = [
  {
    value: "10th_marksheet",
    label: "10th Marksheet",
  },
  {
    value: "12th_marksheet",
    label: "12th Marksheet",
  },
  {
    value: "id_proof",
    label: "ID Proof",
  },
  {
    value: "photo",
    label: "Photograph",
  },
  {
    value: "transfer_certificate",
    label: "Transfer Certificate",
  },
  {
    value: "migration_certificate",
    label: "Migration Certificate",
  },
  {
    value: "income_certificate",
    label: "Income Certificate",
  },
  {
    value: "other",
    label: "Other Document",
  },
];


function StudentDocuments() {
  const [student, setStudent] = useState(null);

  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [documentType, setDocumentType] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);



  // LOAD STUDENT DOCUMENTS


  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      // Get authenticated student's profile
      const studentResponse =
        await getMyStudentProfile();

      const studentData =
        studentResponse?.data ??
        studentResponse;

      if (!studentData?.id) {
        throw new Error(
          "Unable to identify your student account."
        );
      }

      setStudent(studentData);

      // IMPORTANT:
      // Use the student-only endpoint.
      //
      // GET
      // /campus/documents/students/{student_id}
      //
      // NOT:
      // /all
      // /queue
      const documentResponse =
        await getStudentDocumentList(
          studentData.id
        );

      const documentData =
        documentResponse?.data ??
        documentResponse;

      setDocuments(
        Array.isArray(documentData)
          ? documentData
          : []
      );

    } catch (err) {
      console.error(
        "Failed to load student documents:",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to load your documents."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDocuments();
  }, []);



  // FILE SELECT


  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError("");
    setSuccess("");
  };



  // UPLOAD


  const handleUpload = async (event) => {
    event.preventDefault();

    if (!student?.id) {
      setError(
        "Student account could not be identified."
      );
      return;
    }

    if (!documentType) {
      setError(
        "Please select a document type."
      );
      return;
    }

    if (!selectedFile) {
      setError(
        "Please select a file."
      );
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      await uploadStudentDocument(
        student.id,
        documentType,
        selectedFile
      );

      setSuccess(
        "Document uploaded successfully. It is now waiting for verification."
      );

      setDocumentType("");
      setSelectedFile(null);

      // Reset file input
      const input =
        document.getElementById(
          "student-document-file"
        );

      if (input) {
        input.value = "";
      }

      await loadDocuments();

    } catch (err) {
      console.error(
        "Document upload failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to upload document."
      );

    } finally {
      setUploading(false);
    }
  };



  // STATUS UI


  const getStatusConfig = (status) => {
    const normalized =
      status?.toLowerCase();

    if (normalized === "verified") {
      return {
        label: "Verified",
        className:
          "bg-green-100 text-green-700",
        icon: CheckCircle2,
      };
    }

    if (normalized === "rejected") {
      return {
        label: "Rejected",
        className:
          "bg-red-100 text-red-700",
        icon: XCircle,
      };
    }

    if (
      normalized ===
      "review_required"
    ) {
      return {
        label: "Review Required",
        className:
          "bg-orange-100 text-orange-700",
        icon: AlertCircle,
      };
    }

    if (
      normalized === "processing"
    ) {
      return {
        label: "Processing",
        className:
          "bg-blue-100 text-blue-700",
        icon: Clock3,
      };
    }

    return {
      label: "Uploaded",
      className:
        "bg-gray-100 text-gray-700",
      icon: Clock3,
    };
  };



  // FORMAT DOCUMENT TYPE


  const formatDocumentType = (
    documentType
  ) => {
    const found =
      DOCUMENT_TYPES.find(
        (item) =>
          item.value === documentType
      );

    if (found) {
      return found.label;
    }

    return documentType
      ?.replaceAll("_", " ")
      ?.replace(/\b\w/g, (char) =>
        char.toUpperCase()
      ) || "Document";
  };



  // SUMMARY


  const verifiedCount =
    documents.filter(
      (document) =>
        document.verification_status ===
        "verified"
    ).length;

  const pendingCount =
    documents.filter(
      (document) =>
        ![
          "verified",
          "rejected",
        ].includes(
          document.verification_status
        )
    ).length;

  const rejectedCount =
    documents.filter(
      (document) =>
        document.verification_status ===
        "rejected"
    ).length;


  return (
    <Layout>

      <div className="space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">

              <ShieldCheck
                size={22}
                className="text-white"
              />

            </div>

            <div>

              <p className="text-sm font-medium text-gray-500">
                CampusFlow AI
              </p>

              <h1 className="text-2xl font-bold text-gray-900">
                My Documents
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Upload and track your admission documents.
              </p>

            </div>

          </div>


          <button
            onClick={loadDocuments}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >

            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>

          </div>
        )}


        {/* =====================================================
            SUCCESS
        ===================================================== */}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">

            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{success}</p>

          </div>
        )}


        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Total Documents
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {documents.length}
            </p>

          </div>


          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Verified
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {verifiedCount}
            </p>

          </div>


          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-600">
              {pendingCount}
            </p>

          </div>

        </div>


        {/* =====================================================
            UPLOAD DOCUMENT
        ===================================================== */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-gray-900">
              Upload Document
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Submit a PDF, JPG, JPEG, or PNG document for verification.
            </p>

          </div>


          <form
            onSubmit={handleUpload}
            className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
          >

            {/* Document Type */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Document Type
              </label>

              <select
                value={documentType}
                onChange={(event) =>
                  setDocumentType(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900"
              >

                <option value="">
                  Select document type
                </option>

                {DOCUMENT_TYPES.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* File */}

            <div>

              <label
                htmlFor="student-document-file"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                File
              </label>

              <input
                id="student-document-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold"
              />

            </div>


            {/* Upload Button */}

            <button
              type="submit"
              disabled={
                uploading ||
                !documentType ||
                !selectedFile
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {uploading ? (
                <>
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />

                  Uploading...

                </>
              ) : (
                <>
                  <Upload size={17} />

                  Upload

                </>
              )}

            </button>

          </form>

        </div>


        {/* =====================================================
            DOCUMENT LIST
        ===================================================== */}

        <div className="rounded-2xl border bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <h2 className="text-lg font-bold text-gray-900">
              Submitted Documents
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Track the verification status of your submitted documents.
            </p>

          </div>


          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">

              <div className="text-center">

                <RefreshCw
                  size={28}
                  className="mx-auto animate-spin text-gray-400"
                />

                <p className="mt-3 text-sm text-gray-500">
                  Loading your documents...
                </p>

              </div>

            </div>
          ) : documents.length === 0 ? (

            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">

                <FileText
                  size={25}
                  className="text-gray-400"
                />

              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No documents uploaded
              </h3>

              <p className="mt-1 max-w-md text-sm text-gray-500">
                Upload your required admission documents above.
              </p>

            </div>

          ) : (

            <div className="divide-y">

              {documents.map(
                (document) => {

                  const status =
                    getStatusConfig(
                      document.verification_status
                    );

                  const StatusIcon =
                    status.icon;

                  return (
                    <div
                      key={document.id}
                      className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                    >

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">

                          <FileText
                            size={20}
                            className="text-gray-600"
                          />

                        </div>

                        <div className="min-w-0">

                          <p className="font-semibold text-gray-900">
                            {formatDocumentType(
                              document.document_type
                            )}
                          </p>

                          <p className="truncate text-sm text-gray-500">
                            {document.original_filename}
                          </p>

                        </div>

                      </div>


                      <div className="flex flex-wrap items-center gap-3">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >

                          <StatusIcon
                            size={14}
                          />

                          {status.label}

                        </span>


                        {document.verification_reason && (
                          <span className="max-w-md text-sm text-gray-500">
                            {document.verification_reason}
                          </span>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>


        {/* =====================================================
            INFORMATION
        ===================================================== */}

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex gap-3">

            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>

              <h3 className="font-semibold text-blue-900">
                Document verification
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Uploaded documents are reviewed by authorized
                campus staff. A document marked as rejected will
                show the reason so you can upload a corrected version.
              </p>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default StudentDocuments;