import api from "./api";

/**
 * Get all documents for a student
 */
export const getStudentDocuments = async (studentId) => {
  const response = await api.get(
    `/campus/documents/student/${studentId}`
  );

  return response.data;
};

/**
 * Get a single student document's metadata
 */
export const getStudentDocument = async (documentId) => {
  const response = await api.get(
    `/campus/documents/${documentId}`
  );

  return response.data;
};

/**
 * Open the original uploaded document in a new browser tab.
 *
 * The backend endpoint returns the actual file as a blob.
 */
export const openStudentDocumentFile = async (documentId) => {
  if (!documentId) {
    throw new Error("Document ID is missing.");
  }

  const response = await api.get(
    `/campus/documents/${documentId}/file`,
    {
      responseType: "blob",
    }
  );

  const contentType =
    response.headers["content-type"] ||
    "application/octet-stream";

  const blob = new Blob([response.data], {
    type: contentType,
  });

  const url = window.URL.createObjectURL(blob);

  const newWindow = window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

  if (!newWindow) {
    window.URL.revokeObjectURL(url);

    throw new Error(
      "Browser blocked the document window. Please allow pop-ups and try again."
    );
  }

  // Keep the URL alive long enough for the browser to load the document.
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 60000);
};

/**
 * Download the original uploaded document.
 */
export const downloadStudentDocument = async (documentId, filename) => {
  if (!documentId) {
    throw new Error("Document ID is missing.");
  }

  const response = await api.get(
    `/campus/documents/${documentId}/file`,
    {
      responseType: "blob",
    }
  );

  const contentType =
    response.headers["content-type"] ||
    "application/octet-stream";

  const blob = new Blob([response.data], {
    type: contentType,
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename || "student-document";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};