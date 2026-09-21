import api from "./api";


// Get all students in the current organization
export const getStudents = async () => {
  const response = await api.get("/campus/students/");
  return response.data;
};

// Get a single student
export const getStudent = async (studentId) => {
  const response = await api.get(`/campus/students/${studentId}`);
  return response.data;
};

// Create a new student/application
export const createStudent = async (data) => {
  const response = await api.post("/campus/students/", data);
  return response.data;
};

// Update student profile
export const updateStudent = async (studentId, data) => {
  const response = await api.put(
    `/campus/students/${studentId}`,
    data
  );

  return response.data;
};
export const getMyStudentProfile = () => {
    return api.get("/campus/students/me");
  };

