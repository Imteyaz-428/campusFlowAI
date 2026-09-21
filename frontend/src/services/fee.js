import api from "./api";


// STUDENT — GET MY FEES


export const getMyFees = async () => {
  const response = await api.get("/campus/fees/me");

  return response.data;
};



// GET ALL FEES FOR A SPECIFIC STUDENT
// STAFF ONLY


export const getStudentFees = async (studentId) => {
  const response = await api.get(
    `/campus/fees/student/${studentId}`
  );

  return response.data;
};



// GET FEES FOR AN ADMISSION


export const getAdmissionFees = async (admissionId) => {
  const response = await api.get(
    `/campus/fees/admission/${admissionId}`
  );

  return response.data;
};



// GET A SINGLE FEE


export const getFee = async (feeId) => {
  const response = await api.get(
    `/campus/fees/${feeId}`
  );

  return response.data;
};



// CREATE A FEE


export const createFee = async (data) => {
  const response = await api.post(
    "/campus/fees/",
    data
  );

  return response.data;
};



// UPDATE A FEE


export const updateFee = async (feeId, data) => {
  const response = await api.put(
    `/campus/fees/${feeId}`,
    data
  );

  return response.data;
};



// PAY A FEE


export const payFee = async (feeId, data = {}) => {
  const response = await api.post(
    `/campus/fees/${feeId}/pay`,
    data
  );

  return response.data;
};



// DELETE A FEE


export const deleteFee = async (feeId) => {
  const response = await api.delete(
    `/campus/fees/${feeId}`
  );

  return response.data;
};