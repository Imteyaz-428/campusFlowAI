import api from "./api";
import applicantApi from "./applicantApi";

/* =========================================================
   ORGANIZATION / RAG DOCUMENTS
   ========================================================= */

export const getDocuments = async () => {
  const response = await api.get("/documents");
  return response.data;
};

export const uploadDocument = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


/* =========================================================
   REGISTERED STUDENT DOCUMENTS
   ========================================================= */

/*
 * Get documents belonging to the authenticated student.
 *
 * Backend:
 * GET /campus/documents/students/{student_id}
 *
 * This endpoint verifies that the logged-in student
 * owns the student profile.
 */
export const getStudentDocumentList = async (studentId) => {
  const response = await api.get(
    `/campus/documents/students/${studentId}`
  );

  return response.data;
};


/*
 * Staff-only:
 * Get all documents for a student.
 */
export const getStudentDocuments = async (studentId) => {
  const response = await api.get(
    `/campus/documents/students/${studentId}/all`
  );

  return response.data;
};


/*
 * Upload document for authenticated student.
 */
export const uploadStudentDocument = async (
  studentId,
  documentType,
  file
) => {
  const formData = new FormData();

  formData.append(
    "document_type",
    documentType
  );

  formData.append(
    "file",
    file
  );

  const response = await api.post(
    `/campus/documents/students/${studentId}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


/* =========================================================
   STAFF DOCUMENT VERIFICATION
   ========================================================= */

export const getDocumentQueue = async (
  verificationStatus = "uploaded"
) => {
  const response = await api.get(
    `/campus/documents/queue/${verificationStatus}`
  );

  return response.data;
};

export const getStudentDocument = async (documentId) => {
  const response = await api.get(
    `/campus/documents/${documentId}`
  );

  return response.data;
};

export const processStudentDocument = async (
  documentId
) => {
  const response = await api.post(
    `/campus/documents/${documentId}/process`
  );

  return response.data;
};

export const updateDocumentVerification = async (
  documentId,
  verificationStatus,
  verificationReason = null
) => {
  const response = await api.put(
    `/campus/documents/${documentId}/verify`,
    {
      verification_status: verificationStatus,
      verification_reason: verificationReason,
    }
  );

  return response.data;
};


/* =========================================================
   APPLICANT DOCUMENTS
   ========================================================= */

export const getMyApplicantDocuments = async () => {
  const response = await applicantApi.get(
    "/campus/documents/me"
  );

  return response.data;
};

export const uploadMyApplicantDocument = async (
  documentType,
  file
) => {
  const formData = new FormData();

  formData.append(
    "document_type",
    documentType
  );

  formData.append(
    "file",
    file
  );

  const response = await applicantApi.post(
    "/campus/documents/me/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await api.delete(
    `/campus/documents/${documentId}`
  );

  return response.data;
};




export const openStudentDocumentFile = async (
  documentId
) => {
  if (!documentId) {
    throw new Error(
      "Document ID is required."
    );
  }

  const response = await api.get(
    `/campus/documents/${documentId}/file`,
    {
      responseType: "blob",
    }
  );

  const blob = new Blob(
    [response.data],
    {
      type:
        response.headers[
          "content-type"
        ] ||
        "application/octet-stream",
    }
  );

  const url =
    window.URL.createObjectURL(blob);

  const newWindow =
    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  if (!newWindow) {
    window.URL.revokeObjectURL(url);

    throw new Error(
      "Browser blocked the document window. Please allow pop-ups."
    );
  }

  // Give the browser enough time to load the
  // document before releasing the object URL.
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 60_000);

  return true;
};