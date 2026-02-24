import api from "../api/axios.js"

export const register = (data) =>
    api.post("/auth/register", data);

export const loginApi = (data) =>
    api.post("/auth/login", data);

export const getMe = () =>
    api.get("auth/me");

export const refreshToken = (data) =>
    api.post("auth/refresh", data);