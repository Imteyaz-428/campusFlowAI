import axios from "axios";

const applicantApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

applicantApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "applicant_token"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default applicantApi;