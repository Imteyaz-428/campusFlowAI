import api from "./api";

export const signup = (data) => {
  return api.post("/auth/signup", data);
};

export const login = (data) => {
  return api.post("/auth/login", {
    organization_slug: data.organization_slug,
    email: data.email,
    password: data.password,
  });
};

export const applicantLogin = (data) => {
  return api.post("/auth/applicant-login", {
    organization_slug: data.organization_slug,
    application_number: data.application_number,
    password: data.password,
  });
};

export const me = () => {
  return api.get("/auth/me");
};

