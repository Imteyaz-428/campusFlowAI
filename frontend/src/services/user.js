import api from "./api";


// GET ALL USERS
// Admin only


export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};



// GET CURRENT USER


export const getCurrentUser = async () => {
  const response = await api.get("/users/me");
  return response.data;
};



// CREATE USER


export const createUser = async (data) => {
  const response = await api.post("/users", data);
  return response.data;
};



// UPDATE USER


export const updateUser = async (userId, data) => {
  const response = await api.put(
    `/users/${userId}`,
    data
  );

  return response.data;
};



// DELETE USER


export const deleteUser = async (userId) => {
  const response = await api.delete(
    `/users/${userId}`
  );

  return response.data;
};



// CHANGE CURRENT USER PASSWORD


export const changePassword = async (data) => {
  const response = await api.put(
    "/users/change-password",
    data
  );

  return response.data;
};