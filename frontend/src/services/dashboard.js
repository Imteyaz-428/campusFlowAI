import api from "./api";

export const getDashboardOverview = async () => {
  const response = await api.get("/campus/dashboard/overview");
  return response.data;
};