import api from "./api";

// Get all admissions for the current organization
export const getAdmissions = async () => {
  const response = await api.get("/campus/admissions/");
  return response.data;
};

// Get all admissions for a specific student
export const getStudentAdmissions = async (studentId) => {
  const response = await api.get(
    `/campus/admissions/student/${studentId}`
  );

  return response.data;
};

// Get a single admission
export const getAdmission = async (admissionId) => {
  const response = await api.get(
    `/campus/admissions/${admissionId}`
  );

  return response.data;
};

// Create an admission
export const createAdmission = async (data) => {
  const response = await api.post(
    "/campus/admissions/",
    data
  );

  return response.data;
};

// Update an admission
export const updateAdmission = async (
  admissionId,
  data
) => {
  const response = await api.put(
    `/campus/admissions/${admissionId}`,
    data
  );

  return response.data;
};

// Review eligibility
export const reviewEligibility = async (
  admissionId,
  data
) => {
  const response = await api.put(
    `/campus/admissions/${admissionId}/eligibility-review`,
    data
  );

  return response.data;
};

// Confirm admission
export const confirmAdmission = async (
  admissionId
) => {
  const response = await api.post(
    `/campus/admissions/${admissionId}/confirm`
  );

  return response.data;
};

// ================================================================
// ADMIN — AI ADMISSION REVIEW
// ================================================================

export const runAIAdmissionReview = async (admissionId) => {
    const response = await api.post(
      `/campus/admissions/${admissionId}/ai-review`
    );
  
    return response.data;
  };

// ================================================================
// STUDENT — GET MY ADMISSION
// ================================================================

export const getMyAdmission = async () => {
    const response = await api.get("/campus/admissions/me");
    return response.data;
  };