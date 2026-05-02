// routing.service.js

const { calculateDistance } = require('../utils/distance');
const { calculateTravelMinutes } = require('../utils/travelTime');
const { addMinutes, parseTime, formatTime } = require('../utils/time');
const { SCORING_CONFIG } = require('./scoring.config');

const distanceCache = new Map();

function getDistance(a, b) {
    const key = `${a.lat},${a.lng}-${b.lat},${b.lng}`;
    if (distanceCache.has(key)) return distanceCache.get(key);

    const dist = calculateDistance(a.lat, a.lng, b.lat, b.lng);
    distanceCache.set(key, dist);
    return dist;
}

function isFeasible(currentLocation, currentTime, attraction, dayEnd, systemConfig, remainingBudget, endLocation) {

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

    // ===============================
    // RETURN FEASIBILITY CHECK (NEW)
    // Ensure we can finish the visit and return to the endpoint before day end
    const endpoint = endLocation || {
        lat: systemConfig.end_lat ?? systemConfig.start_lat,
        lng: systemConfig.end_lng ?? systemConfig.start_lng
    };

    const returnDistance = getDistance({
        lat: attraction.latitude,
        lng: attraction.longitude
    }, endpoint);

    const returnMinutes = calculateTravelMinutes(returnDistance, systemConfig.travel_speed_kmh);

    const finishVisitTime = arrivalTime.getTime() + (wait * 60000) + (attraction.duration_minutes * 60000);
    const finishDate = new Date(finishVisitTime);
    const finishMin = finishDate.getUTCHours() * 60 + finishDate.getUTCMinutes();

    if (finishMin + returnMinutes > dayEndMin) return null;

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

    // derive endpoint (prefer explicit endLocation in currentState)
    const endLocation = currentState.endLocation || {
        lat: systemConfig.end_lat ?? systemConfig.start_lat,
        lng: systemConfig.end_lng ?? systemConfig.start_lng
    };

    for (const attr of remaining) {
        const result = isFeasible(
            currentState.location,
            currentState.time,
            attr,
            currentState.dayEnd,
            systemConfig,
            budget,
            endLocation
        );

        if (result) candidates.push(result);
    }

    // Enrich candidates with endpoint-aware distance metrics (normalized)
    for (const c of candidates) {
        try {
            const toEndDistance = getDistance({
                lat: c.attraction.latitude,
                lng: c.attraction.longitude
            }, endLocation);

            const maxD = SCORING_CONFIG.limits.maxConsideredDistanceKm || 20;
            const toEndNormalized = Math.min(toEndDistance / maxD, 1);

            c.toEndDistance = toEndDistance;
            c.toEndDistanceNormalized = toEndNormalized;
        } catch (err) {
            c.toEndDistance = null;
            c.toEndDistanceNormalized = 1; // be conservative
        }
    }

    // Optional debug summary: if no candidates, log context to help debugging
    if (candidates.length === 0 && remaining.length > 0) {
        const names = remaining.map(r => r.attraction_name || r.attraction_id).slice(0, 5).join(', ');
        console.log(`No candidates for remaining attractions (${names}${remaining.length > 5 ? ', ...' : ''}). Budget: ${budget}, time: ${formatTime(currentState.time)}`);
    }

    return candidates;
};
