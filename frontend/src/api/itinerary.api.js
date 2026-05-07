import api from "./axios.js";

export const generateItinerary = (code) =>
    api.post(`/trips/${code}/generate-itinerary`);

export const saveItinerary = (code, payload) =>
    api.post(`/trips/${code}/itineraries`, payload);
