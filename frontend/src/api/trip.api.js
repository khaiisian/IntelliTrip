import api from "../api/axios.js";

// Create trip
export const createTrip = (data) =>
    api.post("/trips", data);

// Get trips by user
export const getTripsByUser = (userId, params) =>
    api.get(`/users/${userId}/trips`, { params });

// Get single trip by code
export const getTripByCode = (code) =>
    api.get(`/trips/${code}`);

// Update trip
export const updateTrip = (code, data) =>
    api.put(`/trips/${code}`, data);

// Delete trip
export const deleteTrip = (code) =>
    api.delete(`/trips/${code}`);