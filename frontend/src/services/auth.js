import api from "./api";

export const signup = (data) => {
  return api.post("/auth/signup", data);
};

export const login = (data) => {
  const form = new URLSearchParams();

  form.append("username", data.email);
  form.append("password", data.password);

  return api.post("/auth/login", form, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

export const me = () => {
    return api.get("/auth/me");
  };