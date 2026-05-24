import axios from "./axios.js";

export const getUsers = async () => {
    const res = await axios.get("/users");
    return res.data;
};

export const getUserByCode = async (code) => {
    const res = await axios.get(`/users/${code}`);
    return res.data;
};

export const createUser = async (payload) => {
    const res = await axios.post("/users", payload);
    return res.data;
};

export const updateUser = async (code, payload) => {
    const res = await axios.put(`/users/${code}`, payload);
    return res.data;
};

export const deleteUser = async (code) => {
    const res = await axios.delete(`/users/${code}`);
    return res.data;
};