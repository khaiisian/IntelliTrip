import api from "../api/axios.js";

// Create preference
export const createPreference = (data) =>
    api.post("/trip-preferences", data);

// Get preferences by trip
export const getPreferencesByTrip = (tripId) =>
    api.get(`/trips/${tripId}/preferences`);

// Get single preference by code
export const getPreferenceByCode = (code) =>
    api.get(`/trip-preferences/${code}`);

// Update preference
export const updatePreference = (code, data) =>
    api.put(`/trip-preferences/${code}`, data);

// Delete preference
export const deletePreference = (code) =>
    api.delete(`/trip-preferences/${code}`);