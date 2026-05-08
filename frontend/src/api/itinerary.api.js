import api from "./axios.js";

export const generateItinerary = (code) =>
    api.post(`/trips/${code}/generate-itinerary`);

export const saveItinerary = (code, payload) =>
    api.post(`/trips/${code}/itineraries`, payload);

export const recalculateItinerary = (code, payload) =>
    api.post(`/trips/${code}/itineraries/recalculate`, payload);

export const getSavedItinerary = (code) =>
    api.get(`/trips/${code}/itineraries`);

export const getUserItineraries = (code) =>
    api.get(`/users/${code}/itineraries`);
