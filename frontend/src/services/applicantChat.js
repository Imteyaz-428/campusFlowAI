import axios from "axios";



// APPLICANT AGENT API


const applicantAgentApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});



// GET APPLICANT TOKEN


const getApplicantToken = () => {
  const token = localStorage.getItem(
    "applicant_token"
  );

  if (!token) {
    throw new Error(
      "Applicant authentication token not found."
    );
  }

  return token;
};



// AUTH HEADERS


const getHeaders = () => ({
  Authorization: `Bearer ${getApplicantToken()}`,
  "Content-Type": "application/json",
});



// SEND MESSAGE


export const sendApplicantAgentMessage = async ({
  message,
  sessionId = null,
}) => {

  const response =
    await applicantAgentApi.post(
      "/agent/chat",
      {
        message: message.trim(),
        session_id: sessionId,
      },
      {
        headers: getHeaders(),
      }
    );

  return response.data;
};



// GET SESSIONS


export const getApplicantAgentSessions =
  async () => {

    const response =
      await applicantAgentApi.get(
        "/agent/sessions",
        {
          headers: getHeaders(),
        }
      );

    return response.data;
  };



// GET ONE SESSION


export const getApplicantAgentSession =
  async (sessionId) => {

    const response =
      await applicantAgentApi.get(
        `/agent/sessions/${sessionId}`,
        {
          headers: getHeaders(),
        }
      );

    return response.data;
  };



// DELETE SESSION


export const deleteApplicantAgentSession =
  async (sessionId) => {

    const response =
      await applicantAgentApi.delete(
        `/agent/sessions/${sessionId}`,
        {
          headers: getHeaders(),
        }
      );

    return response.data;
  };