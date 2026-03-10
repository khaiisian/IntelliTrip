import api from "../api/axios.js";

// Create attraction
export const createAttraction = (data) =>
    api.post("/attractions", data);

// Get all attractions
export const getAttractions = (params) =>
    api.get("/attractions", { params });

// Get single attraction by code
export const getAttractionByCode = (code) =>
    api.get(`/attractions/${code}`);

// Update attraction
export const updateAttraction = (code, data) =>
    api.put(`/attractions/${code}`, data);

// Delete attraction
export const deleteAttraction = (code) =>
    api.delete(`/attractions/${code}`);