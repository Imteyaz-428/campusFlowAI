import api from "./api";

/* =========================================================
   STAFF / ADMIN — EXCEPTION QUEUE
========================================================= */

export const getAdminOnboardingQueue = async () => {
  const response = await api.get(
    "/campus/onboarding/admin/queue"
  );

  return response.data;
};


/* =========================================================
   STAFF / ADMIN — STUDENT ONBOARDING
========================================================= */

export const getStudentOnboarding = async (studentId) => {
  const response = await api.get(
    `/campus/onboarding/student/${studentId}`
  );

  return response.data;
};


export const getOnboardingSummary = async (studentId) => {
  const response = await api.get(
    `/campus/onboarding/student/${studentId}/summary`
  );

  return response.data;
};


export const getNextOnboardingAction = async (studentId) => {
  const response = await api.get(
    `/campus/onboarding/student/${studentId}/next-action`
  );

  return response.data;
};


/* =========================================================
   STAFF — MANUAL INITIALIZATION / RECOVERY
========================================================= */

export const initializeOnboarding = async (studentId) => {
  const response = await api.post(
    `/campus/onboarding/student/${studentId}/initialize`
  );

  return response.data;
};


/* =========================================================
   STAFF — AUTOMATION RECHECK
========================================================= */

export const recheckStudentOnboarding = async (studentId) => {
  const response = await api.post(
    `/campus/onboarding/student/${studentId}/recheck`
  );

  return response.data;
};


/* =========================================================
   STAFF — HUMAN EXCEPTION REVIEW
========================================================= */

export const approveOnboardingTask = async (
  taskId,
  notes = null
) => {
  const response = await api.post(
    `/campus/onboarding/task/${taskId}/approve`,
    notes
      ? { notes }
      : {}
  );

  return response.data;
};


export const requestOnboardingChanges = async (
  taskId,
  notes = null
) => {
  const response = await api.post(
    `/campus/onboarding/task/${taskId}/request-changes`,
    notes
      ? { notes }
      : {}
  );

  return response.data;
};


/* =========================================================
   LEGACY STAFF ENDPOINT
========================================================= */

export const completeOnboardingTask = async (taskId) => {
  const response = await api.post(
    `/campus/onboarding/task/${taskId}/complete`
  );

  return response.data;
};


/* =========================================================
   LEGACY SPECIAL REGISTRATIONS
========================================================= */

export const completeAcademicRegistration = async (
  studentId
) => {
  const response = await api.post(
    `/campus/onboarding/student/${studentId}/academic-register`
  );

  return response.data;
};


export const completeLibraryRegistration = async (
  studentId
) => {
  const response = await api.post(
    `/campus/onboarding/student/${studentId}/library-register`
  );

  return response.data;
};


export const completeIdCardRegistration = async (
  studentId
) => {
  const response = await api.post(
    `/campus/onboarding/student/${studentId}/id-card-register`
  );

  return response.data;
};


/* =========================================================
   STUDENT — INITIALIZE
========================================================= */

export const initializeMyOnboarding = async () => {
  const response = await api.post(
    "/campus/onboarding/me/initialize"
  );

  return response.data;
};


/* =========================================================
   STUDENT — OWN ONBOARDING
========================================================= */

export const getMyOnboardingTasks = async () => {
  const response = await api.get(
    "/campus/onboarding/me/tasks"
  );

  return response.data;
};


export const getMyOnboardingSummary = async () => {
  const response = await api.get(
    "/campus/onboarding/me/summary"
  );

  return response.data;
};


export const getMyNextOnboardingAction = async () => {
  const response = await api.get(
    "/campus/onboarding/me/next-action"
  );

  return response.data;
};


/* =========================================================
   STUDENT — AUTOMATION RECHECK
========================================================= */

export const recheckMyOnboarding = async () => {
  const response = await api.post(
    "/campus/onboarding/me/recheck"
  );

  return response.data;
};


/* =========================================================
   STUDENT — SINGLE TASK
========================================================= */

export const getMyOnboardingTask = async (taskId) => {
  const response = await api.get(
    `/campus/onboarding/me/tasks/${taskId}`
  );

  return response.data;
};