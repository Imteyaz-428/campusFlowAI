import {
    useEffect,
    useRef,
    useState,
  } from "react";
  
  import {
    BookOpen,
    Upload,
    FileText,
    Trash2,
    RefreshCw,
    Loader2,
    CheckCircle2,
    Clock3,
    AlertCircle,
    ArrowLeft,
  } from "lucide-react";
  
  import toast from "react-hot-toast";
  
  import { useNavigate } from "react-router-dom";
  
  import Layout from "../../components/layout/Layout";
  
  import {
    getKnowledgeDocuments,
    uploadKnowledgeDocument,
    deleteKnowledgeDocument,
  } from "../../services/knowledge";
  
  
  function CollegeKnowledge() {
  
    const navigate = useNavigate();
  
    const fileInputRef = useRef(null);
  
    const [documents, setDocuments] =
      useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [uploading, setUploading] =
      useState(false);
  
    const [deletingId, setDeletingId] =
      useState(null);
  
  
   
    // LOAD DOCUMENTS
   
  
    const loadDocuments = async () => {
      try {
  
        setLoading(true);
  
        const data =
          await getKnowledgeDocuments();
  
        setDocuments(
          Array.isArray(data)
            ? data
            : []
        );
  
      } catch (error) {
  
        console.error(
          "Failed to load knowledge documents:",
          error
        );
  
        toast.error(
          error?.response?.data?.detail ||
            "Failed to load college knowledge."
        );
  
      } finally {
  
        setLoading(false);
  
      }
    };
  
  
   
    // INITIAL LOAD
   
  
    useEffect(() => {
      loadDocuments();
    }, []);
  
  
   
    // FILE SELECT
   
  
    const handleFileChange = async (
      event
    ) => {
  
      const file =
        event.target.files?.[0];
  
      // Reset input so the same file
      // can be selected again.
      event.target.value = "";
  
      if (!file) {
        return;
      }
  
      if (
        file.type !==
        "application/pdf"
      ) {
        toast.error(
          "Only PDF files are allowed."
        );
  
        return;
      }
  
      const maxSize =
        10 * 1024 * 1024;
  
      if (file.size > maxSize) {
        toast.error(
          "File size must not exceed 10 MB."
        );
  
        return;
      }
  
      try {
  
        setUploading(true);
  
        await uploadKnowledgeDocument(
          file
        );
  
        toast.success(
          "College document uploaded successfully."
        );
  
        await loadDocuments();
  
      } catch (error) {
  
        console.error(
          "Knowledge upload failed:",
          error
        );
  
        toast.error(
          error?.response?.data?.detail ||
            "Failed to upload document."
        );
  
      } finally {
  
        setUploading(false);
  
      }
    };
  
  
   
    // DELETE
   
  
    const handleDelete = async (
      document
    ) => {
  
      if (!document) {
        return;
      }
  
      const confirmed =
        window.confirm(
          `Delete "${document.original_filename}"?\n\nThis document will no longer be available to the RAG knowledge base.`
        );
  
      if (!confirmed) {
        return;
      }
  
      try {
  
        setDeletingId(
          document.id
        );
  
        await deleteKnowledgeDocument(
          document.id
        );
  
        toast.success(
          "Knowledge document deleted."
        );
  
        setDocuments(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !== document.id
            )
        );
  
      } catch (error) {
  
        console.error(
          "Failed to delete knowledge document:",
          error
        );
  
        toast.error(
          error?.response?.data?.detail ||
            "Failed to delete document."
        );
  
      } finally {
  
        setDeletingId(null);
  
      }
    };
  
  
   
    // STATUS
   
  
    const getStatus = (status) => {
  
      const normalized =
        String(status || "")
          .toLowerCase();
  
      if (
        normalized === "completed" ||
        normalized === "complete" ||
        normalized === "indexed" ||
        normalized === "ready"
      ) {
        return {
          label: "Indexed",
          icon: CheckCircle2,
          className:
            "bg-green-100 text-green-700",
        };
      }
  
      if (
        normalized === "processing" ||
        normalized === "pending"
      ) {
        return {
          label: "Processing",
          icon: Clock3,
          className:
            "bg-amber-100 text-amber-700",
        };
      }
  
      if (
        normalized === "failed" ||
        normalized === "error"
      ) {
        return {
          label: "Failed",
          icon: AlertCircle,
          className:
            "bg-red-100 text-red-700",
        };
      }
  
      return {
        label: status || "Unknown",
        icon: Clock3,
        className:
          "bg-gray-100 text-gray-600",
      };
    };
  
  
   
    // FILE SIZE
   
  
    const formatFileSize = (
      bytes
    ) => {
  
      if (!bytes) {
        return "0 KB";
      }
  
      if (bytes < 1024) {
        return `${bytes} B`;
      }
  
      if (bytes < 1024 * 1024) {
        return `${(
          bytes / 1024
        ).toFixed(1)} KB`;
      }
  
      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(1)} MB`;
    };
  
  
   
    // DATE
   
  
    const formatDate = (
      date
    ) => {
  
      if (!date) {
        return "—";
      }
  
      try {
  
        return new Date(
          date
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );
  
      } catch {
        return "—";
      }
    };
  
  
   
    // RENDER
   
  
    return (
      <Layout>
  
        <div className="mx-auto max-w-6xl space-y-6">
  
          {/* ====================================================
              HEADER
          ==================================================== */}
  
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  
            <div className="flex items-start gap-3">
  
              <button
                type="button"
                onClick={() =>
                  navigate("/settings")
                }
                className="mt-1 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                title="Back to Settings"
              >
                <ArrowLeft
                  size={20}
                />
              </button>
  
              <div>
  
                <div className="flex items-center gap-3">
  
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">
  
                    <BookOpen
                      size={21}
                      className="text-white"
                    />
  
                  </div>
  
                  <div>
  
                    <h1 className="text-2xl font-bold text-gray-900">
                      College Knowledge Base
                    </h1>
  
                    <p className="mt-1 text-sm text-gray-500">
                      Manage official college documents used by CampusFlow AI.
                    </p>
  
                  </div>
  
                </div>
  
              </div>
  
            </div>
  
            {/* UPLOAD */}
  
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploading}
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
  
              {uploading ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Upload
                  size={18}
                />
              )}
  
              {uploading
                ? "Uploading..."
                : "Upload Document"}
  
            </button>
  
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={
                handleFileChange
              }
              className="hidden"
            />
  
          </div>
  
  
          {/* ====================================================
              INFORMATION CARD
          ==================================================== */}
  
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
  
            <div className="flex items-start gap-3">
  
              <BookOpen
                size={20}
                className="mt-0.5 shrink-0 text-blue-600"
              />
  
              <div>
  
                <h2 className="font-semibold text-blue-900">
                  How the knowledge base works
                </h2>
  
                <p className="mt-1 text-sm leading-6 text-blue-800">
  
                  Upload official college documents such as admission
                  procedures, required documents, fee information,
                  academic rules, scholarships, and college policies.
                  CampusFlow AI processes these documents and makes
                  their content available to the RAG assistant.
  
                </p>
  
                <p className="mt-2 text-xs font-medium text-blue-700">
  
                  Only upload official college information that should
                  be used as a source of truth by the AI assistant.
  
                </p>
  
              </div>
  
            </div>
  
          </div>
  
  
          {/* ====================================================
              SUMMARY
          ==================================================== */}
  
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
  
              <p className="text-sm font-medium text-gray-500">
                Total Documents
              </p>
  
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {documents.length}
              </p>
  
            </div>
  
  
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
  
              <p className="text-sm font-medium text-gray-500">
                Indexed
              </p>
  
              <p className="mt-2 text-3xl font-bold text-green-600">
  
                {
                  documents.filter(
                    (document) => {
  
                      const status =
                        String(
                          document.status ||
                            ""
                        ).toLowerCase();
  
                      return [
                        "completed",
                        "complete",
                        "indexed",
                        "ready",
                      ].includes(
                        status
                      );
                    }
                  ).length
                }
  
              </p>
  
            </div>
  
  
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
  
              <p className="text-sm font-medium text-gray-500">
                Processing
              </p>
  
              <p className="mt-2 text-3xl font-bold text-amber-600">
  
                {
                  documents.filter(
                    (document) => {
  
                      const status =
                        String(
                          document.status ||
                            ""
                        ).toLowerCase();
  
                      return [
                        "processing",
                        "pending",
                      ].includes(
                        status
                      );
                    }
                  ).length
                }
  
              </p>
  
            </div>
  
          </div>
  
  
          {/* ====================================================
              DOCUMENTS
          ==================================================== */}
  
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
  
            <div className="flex items-center justify-between border-b px-6 py-5">
  
              <div>
  
                <h2 className="font-semibold text-gray-900">
                  College Documents
                </h2>
  
                <p className="mt-1 text-sm text-gray-500">
                  Documents available to the CampusFlow AI knowledge base.
                </p>
  
              </div>
  
              <button
                type="button"
                onClick={loadDocuments}
                disabled={loading}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                title="Refresh"
              >
  
                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
  
              </button>
  
            </div>
  
  
            {/* LOADING */}
  
            {loading ? (
  
              <div className="px-6 py-16 text-center">
  
                <Loader2
                  size={30}
                  className="mx-auto animate-spin text-gray-400"
                />
  
                <p className="mt-3 text-sm text-gray-500">
                  Loading knowledge documents...
                </p>
  
              </div>
  
            ) : documents.length === 0 ? (
  
              /* EMPTY */
  
              <div className="px-6 py-16 text-center">
  
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
  
                  <FileText
                    size={25}
                    className="text-gray-500"
                  />
  
                </div>
  
                <h3 className="mt-4 font-semibold text-gray-900">
                  No college documents yet
                </h3>
  
                <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                  Upload official college documents so CampusFlow AI can use them as knowledge sources.
                </p>
  
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  <Upload
                    size={17}
                  />
                  Upload First Document
                </button>
  
              </div>
  
            ) : (
  
              /* TABLE */
  
              <div className="overflow-x-auto">
  
                <table className="w-full min-w-[760px]">
  
                  <thead className="border-b bg-gray-50">
  
                    <tr>
  
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Document
                      </th>
  
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Size
                      </th>
  
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Uploaded
                      </th>
  
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
  
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Action
                      </th>
  
                    </tr>
  
                  </thead>
  
                  <tbody className="divide-y divide-gray-100">
  
                    {documents.map(
                      (document) => {
  
                        const status =
                          getStatus(
                            document.status
                          );
  
                        const StatusIcon =
                          status.icon;
  
                        return (
                          <tr
                            key={
                              document.id
                            }
                            className="transition hover:bg-gray-50"
                          >
  
                            {/* DOCUMENT */}
  
                            <td className="px-6 py-4">
  
                              <div className="flex items-center gap-3">
  
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
  
                                  <FileText
                                    size={19}
                                    className="text-red-500"
                                  />
  
                                </div>
  
                                <div className="min-w-0">
  
                                  <p className="truncate font-medium text-gray-900">
  
                                    {
                                      document.original_filename ||
                                      document.title ||
                                      "Untitled document"
                                    }
  
                                  </p>
  
                                  <p className="truncate text-xs text-gray-500">
  
                                    {
                                      document.title ||
                                      "College knowledge document"
                                    }
  
                                  </p>
  
                                </div>
  
                              </div>
  
                            </td>
  
  
                            {/* SIZE */}
  
                            <td className="px-6 py-4 text-sm text-gray-600">
  
                              {formatFileSize(
                                document.file_size
                              )}
  
                            </td>
  
  
                            {/* DATE */}
  
                            <td className="px-6 py-4 text-sm text-gray-600">
  
                              {formatDate(
                                document.uploaded_at
                              )}
  
                            </td>
  
  
                            {/* STATUS */}
  
                            <td className="px-6 py-4">
  
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                              >
  
                                <StatusIcon
                                  size={14}
                                />
  
                                {
                                  status.label
                                }
  
                              </span>
  
                            </td>
  
  
                            {/* ACTION */}
  
                            <td className="px-6 py-4">
  
                              <div className="flex justify-end">
  
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      document
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    document.id
                                  }
                                  title="Delete document"
                                  className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
  
                                  {deletingId ===
                                  document.id ? (
                                    <Loader2
                                      size={17}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={17}
                                    />
                                  )}
  
                                </button>
  
                              </div>
  
                            </td>
  
                          </tr>
                        );
                      }
                    )}
  
                  </tbody>
  
                </table>
  
              </div>
  
            )}
  
          </div>
  
        </div>
  
      </Layout>
    );
  }
  
  export default CollegeKnowledge;