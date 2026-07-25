import api from "./api";

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const createUser = async (data) => {
  const res = await api.post("/users", data);
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};

export const updateUser = async (
  userId,
  data
) => {
  const res = await api.put(
    `/users/${userId}`,
    data
  );

  return res.data;
};

export const changePassword = async (data) => {
  const res = await api.put(
    "/users/change-password",
    data
  );

  return res.data;
};