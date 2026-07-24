import api from "./api";

export const login = (data) => {
    return api.post("/auth/login", data);
};

export const register = (data) => {
    return api.post("/auth/register", data);
};