// routing.service.js

const { calculateDistance } = require('../utils/distance');
const { calculateTravelMinutes } = require('../utils/travelTime');
const { addMinutes, parseTime } = require('../utils/time');
const { SCORING_CONFIG } = require('./scoring.config');

const distanceCache = new Map();

function getDistance(a, b) {
    const key = `${a.lat},${a.lng}-${b.lat},${b.lng}`;
    if (distanceCache.has(key)) return distanceCache.get(key);

    const dist = calculateDistance(a.lat, a.lng, b.lat, b.lng);
    distanceCache.set(key, dist);
    return dist;
}

function isFeasible(currentLocation, currentTime, attraction, dayEnd, systemConfig, remainingBudget) {

    // HARD CONSTRAINT: Budget must be respected
    if (Number(attraction.cost) > remainingBudget) {
        return null;
    }

    const distance = getDistance(currentLocation, {
        lat: attraction.latitude,
        lng: attraction.longitude
    });

    const travelMinutes = calculateTravelMinutes(distance, systemConfig.travel_speed_kmh);
    const arrivalTime = addMinutes(currentTime, travelMinutes);

    const open = parseTime(attraction.open_time);
    const close = parseTime(attraction.close_time);

    const arrivalMin = arrivalTime.getUTCHours() * 60 + arrivalTime.getUTCMinutes();
    const openMin = open.getUTCHours() * 60 + open.getUTCMinutes();
    const closeMin = close.getUTCHours() * 60 + close.getUTCMinutes();

    if (arrivalMin > closeMin) return null;

    let wait = Math.max(0, openMin - arrivalMin);
    if (wait > SCORING_CONFIG.limits.maxWaitMin) return null;

    const endTime = arrivalMin + wait + attraction.duration_minutes;
    const dayEndMin = dayEnd.getUTCHours() * 60 + dayEnd.getUTCMinutes();

    if (endTime > closeMin || endTime > dayEndMin) return null;

    return {
        attraction,
        distance,
        travelMinutes,
        waitMinutes: wait,
        arrivalTime
    };
}

/**
 * PURE selection only (no scoring here)
 */
exports.buildCandidates = (remaining, currentState, systemConfig, budget) => {

    const candidates = [];

    for (const attr of remaining) {
        const result = isFeasible(
            currentState.location,
            currentState.time,
            attr,
            currentState.dayEnd,
            systemConfig,
            budget
        );

        if (result) candidates.push(result);
    }

    return candidates;
};