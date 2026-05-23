import api from "./axios.js";

export const getExperiencesByAttraction = (attractionId) =>
    api.get(`/attractions/${attractionId}/experiences`);

export const getExperienceByCode = (code) =>
    api.get(`/attraction-experiences/${code}`);

export const createExperience = (data) =>
    api.post(`/attraction-experiences`, data);

export const updateExperience = (code, data) =>
    api.put(`/attraction-experiences/${code}`, data);

export const deleteExperience = (code) =>
    api.delete(`/attraction-experiences/${code}`);
