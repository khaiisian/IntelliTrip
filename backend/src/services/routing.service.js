const { calculateDistance } = require('../utils/distance');
const { calculateTravelMinutes } = require('../utils/travelTime');
const { addMinutes, parseTime, formatTime } = require('../utils/time');

const distanceCache = new Map();
const MAX_WAIT_MINUTES = 90;

/**
 * Convert Date → minutes since midnight
 */
function toMinutes(date) {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
}

/**
 * Get cached distance
 */
function getCachedDistance(lat1, lng1, lat2, lng2) {
    const key = `${lat1},${lng1}-${lat2},${lng2}`;
    const reverseKey = `${lat2},${lng2}-${lat1},${lng1}`;

    if (distanceCache.has(key)) return distanceCache.get(key);
    if (distanceCache.has(reverseKey)) return distanceCache.get(reverseKey);

    const distance = calculateDistance(lat1, lng1, lat2, lng2);
    distanceCache.set(key, distance);
    return distance;
}

/**
 * Time bonus (Layer 2 support — safe to keep here)
 */
function getTimeBonus(attraction, arrivalTime) {
    if (!attraction.experiences?.length) return 1;

    const arrivalMin = toMinutes(arrivalTime);
    let bestMultiplier = 1;

    for (const exp of attraction.experiences) {
        const start = toMinutes(parseTime(exp.best_time_start));
        const end = toMinutes(parseTime(exp.best_time_end));

        if (arrivalMin >= start && arrivalMin <= end) {
            bestMultiplier = Math.max(bestMultiplier, exp.time_bonus_multiplier);
        }
    }

    return bestMultiplier;
}

/**
 * HARD CONSTRAINT CHECK (Layer 1 core)
 */
function isFeasible(
    currentLocation,
    currentTime,
    attraction,
    dayEndTime,
    systemConfig,
    remainingBudget
) {
    // Budget
    if (Number(attraction.cost) > remainingBudget) {
        return { feasible: false, reason: 'budget' };
    }

    // Travel
    const distance = getCachedDistance(
        currentLocation.lat,
        currentLocation.lng,
        Number(attraction.latitude),
        Number(attraction.longitude)
    );

    const travelMinutes = calculateTravelMinutes(distance, systemConfig.travel_speed_kmh);
    const arrivalTime = addMinutes(currentTime, travelMinutes);

    const arrivalMin = toMinutes(arrivalTime);
    const openMin = toMinutes(parseTime(attraction.open_time));
    const closeMin = toMinutes(parseTime(attraction.close_time));
    const dayEndMin = toMinutes(dayEndTime);

    // Arrive after close
    if (arrivalMin > closeMin) {
        return { feasible: false, reason: 'after_close' };
    }

    // Waiting
    let wait = 0;
    if (arrivalMin < openMin) {
        wait = openMin - arrivalMin;
        if (wait > MAX_WAIT_MINUTES) {
            return { feasible: false, reason: 'too_much_wait' };
        }
    }

    // Visit end
    const visitEndMin = arrivalMin + wait + attraction.duration_minutes;

    if (visitEndMin > closeMin) {
        return { feasible: false, reason: 'cannot_finish_before_close' };
    }

    if (visitEndMin > dayEndMin) {
        return { feasible: false, reason: 'exceeds_day' };
    }

    return {
        feasible: true,
        distance,
        travelMinutes,
        arrivalTime,
        waitMinutes: wait
    };
}

/**
 * MAIN ROUTING FUNCTION
 */
exports.nearestNeighborRoute = (
    startLocation,
    attractions,
    startTime,
    dayStartTime,
    dayEndTime,
    tripDays,
    tripBudget,
    systemConfig
) => {
    if (!attractions?.length) return [];

    const route = [];

    let currentLocation = {
        lat: Number(startLocation.lat),
        lng: Number(startLocation.lng)
    };

    let currentTime = new Date(startTime);
    let currentDay = 1;
    let remainingBudget = tripBudget;

    const remaining = [...attractions];

    while (remaining.length > 0 && currentDay <= tripDays) {

        // --- 1. Get day boundaries ---
        const tripStart = new Date(startTime);
        tripStart.setUTCHours(0, 0, 0, 0);

        const dayDate = new Date(tripStart);
        dayDate.setUTCDate(tripStart.getUTCDate() + (currentDay - 1));

        const dayStart = new Date(dayDate);
        dayStart.setUTCHours(dayStartTime.getUTCHours(), dayStartTime.getUTCMinutes(), 0, 0);

        const dayEnd = new Date(dayDate);
        dayEnd.setUTCHours(dayEndTime.getUTCHours(), dayEndTime.getUTCMinutes(), 0, 0);

        // If currentTime is before day start → snap to start
        if (currentTime < dayStart) {
            currentTime = new Date(dayStart);
        }

        // --- 2. Find feasible candidates ---
        const candidates = [];

        for (const attr of remaining) {
            const check = isFeasible(
                currentLocation,
                currentTime,
                attr,
                dayEnd,
                systemConfig,
                remainingBudget
            );

            if (check.feasible) {
                candidates.push({ attr, ...check });
            } else {
                // DEBUG (keep this)
                // console.log(`Rejected ${attr.attraction_name}: ${check.reason}`);
            }
        }

        // --- 3. No candidates → next day ---
        if (candidates.length === 0) {
            currentDay++;

            if (currentDay > tripDays) break;

            currentTime = new Date(dayStart);
            continue;
        }

        // --- 4. Choose best (context‑aware scoring, Layer 2) ---
        let best = null;
        let bestScore = -Infinity;

        for (const c of candidates) {
            // 1. Preference × time quality
            const timeBonus = getTimeBonus(c.attr, c.arrivalTime);
            const preferenceScore = c.attr.base_score * timeBonus;

            // 2. Travel penalty (minutes → 0.01 per minute)
            const travelPenalty = c.travelMinutes * 0.01;

            // 3. Waiting penalty (minutes → 0.02 per minute)
            const waitPenalty = c.waitMinutes * 0.02;

            // 4. Cost penalty (cost / remainingBudget) * 0.3
            let costPenalty = 0;
            if (remainingBudget > 0) {
                const costRatio = Number(c.attr.cost) / remainingBudget;
                costPenalty = costRatio * 0.3;
            }

            // 5. Final score (can be negative)
            const score = preferenceScore - travelPenalty - waitPenalty - costPenalty;

            // Optional debug logging during tuning (remove later)
            // console.log(`${c.attr.attraction_name}: pref=${preferenceScore.toFixed(2)}, travel=${travelPenalty.toFixed(2)}, wait=${waitPenalty.toFixed(2)}, cost=${costPenalty.toFixed(2)} → score=${score.toFixed(2)}`);

            if (score > bestScore) {
                bestScore = score;
                best = c;
            }
        }

        const chosen = best.attr;

        // --- 5. Schedule ---
        let visitStart = best.arrivalTime;

        if (best.waitMinutes > 0) {
            visitStart = addMinutes(visitStart, best.waitMinutes);
        }

        const visitEnd = addMinutes(visitStart, chosen.duration_minutes);

        // --- 6. Update state ---
        currentLocation = {
            lat: Number(chosen.latitude),
            lng: Number(chosen.longitude)
        };

        currentTime = addMinutes(visitEnd, systemConfig.break_minutes);
        remainingBudget -= Number(chosen.cost);

        // Remove from remaining
        const index = remaining.findIndex(a => a.attraction_id === chosen.attraction_id);
        if (index !== -1) remaining.splice(index, 1);

        // --- 7. Push result ---
        route.push({
            ...chosen,
            day_number: currentDay,
            distance_from_previous: best.distance,
            travel_minutes: best.travelMinutes,
            visit_start_time: visitStart,
            visit_end_time: visitEnd,
            final_score: bestScore
        });
    }

    return route;
};

/**
 * Clear cache
 */
exports.clearDistanceCache = () => {
    distanceCache.clear();
};