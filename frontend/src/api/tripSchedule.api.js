import api from "../api/axios.js";

// Create schedule
export const createSchedule = (data) =>
    api.post("/trip-schedules", data);

// Get schedules by trip
export const getSchedulesByTrip = (tripId) =>
    api.get(`/trips/${tripId}/schedules`);

// Get single schedule by id
export const getScheduleById = (id) =>
    api.get(`/trip-schedules/${id}`);

// Update schedule
export const updateSchedule = (id, data) =>
    api.put(`/trip-schedules/${id}`, data);

// Delete schedule
export const deleteSchedule = (id) =>
    api.delete(`/trip-schedules/${id}`);