import api from "./axios.js";

export const generateItinerary = (code) =>
    api.post(`/trips/${code}/generate-itinerary`);
