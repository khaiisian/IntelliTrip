import api from "./axios.js";

export const getAdminMetrics = () =>
    api.get('/admin/metrics');

export const getTripsOverTime = (period = 'daily') =>
    api.get('/admin/metrics/trips-over-time', { params: { period } });

export const getVisitsByCategory = () =>
    api.get('/admin/metrics/visits-by-category');

export const getTopAttractions = (limit = 10) =>
    api.get('/admin/metrics/top-attractions', { params: { limit } });

export const getExperienceUsage = () =>
    api.get('/admin/metrics/experience-usage');
