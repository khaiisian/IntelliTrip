const { calculateDistance } = require('../utils/distance');
const { calculateTravelMinutes } = require('../utils/travelTime');
const { addMinutes, parseTime } = require('../utils/time');

const distanceCache = new Map();
const MAX_WAIT_MINUTES = 90;

function toMinutes(date) {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function getCachedDistance(lat1, lng1, lat2, lng2) {
    const key = `${lat1},${lng1}-${lat2},${lng2}`;
    const reverseKey = `${lat2},${lng2}-${lat1},${lng1}`;

    if (distanceCache.has(key)) return distanceCache.get(key);
    if (distanceCache.has(reverseKey)) return distanceCache.get(reverseKey);

    const distance = calculateDistance(lat1, lng1, lat2, lng2);
    distanceCache.set(key, distance);
    return distance;
}

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

function isFeasible(currentLocation, currentTime, attraction, dayEndTime, systemConfig, remainingBudget) {

    if (Number(attraction.cost) > remainingBudget) {
        return { feasible: false };
    }

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

    if (arrivalMin > closeMin) return { feasible: false };

    let wait = 0;
    if (arrivalMin < openMin) {
        wait = openMin - arrivalMin;
        if (wait > MAX_WAIT_MINUTES) return { feasible: false };
    }

    const visitEndMin = arrivalMin + wait + attraction.duration_minutes;

    if (visitEndMin > closeMin) return { feasible: false };
    if (visitEndMin > dayEndMin) return { feasible: false };

    return {
        feasible: true,
        distance,
        travelMinutes,
        arrivalTime,
        waitMinutes: wait
    };
}

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

        const tripStart = new Date(startTime);
        tripStart.setUTCHours(0, 0, 0, 0);

        const dayDate = new Date(tripStart);
        dayDate.setUTCDate(tripStart.getUTCDate() + (currentDay - 1));

        const dayStart = new Date(dayDate);
        dayStart.setUTCHours(dayStartTime.getUTCHours(), dayStartTime.getUTCMinutes(), 0, 0);

        const dayEnd = new Date(dayDate);
        dayEnd.setUTCHours(dayEndTime.getUTCHours(), dayEndTime.getUTCMinutes(), 0, 0);

        if (currentTime < dayStart) currentTime = new Date(dayStart);

        // -------------------------
        // 1. Build candidates
        // -------------------------
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

            if (!check.feasible) continue;

            if (attr.base_score < 0.5) continue;

            candidates.push({ attr, ...check });
        }

        if (candidates.length === 0) {
            currentDay++;
            if (currentDay > tripDays) break;
            currentTime = new Date(dayStart);
            continue;
        }

        // -------------------------
        // 2. Score ALL candidates (no lookahead)
        // -------------------------
        for (const c of candidates) {

            const timeBonus = getTimeBonus(c.attr, c.arrivalTime);
            const preferenceScore = c.attr.base_score * timeBonus;

            const travelPenalty = Math.pow(c.travelMinutes, 1.15) * 0.02;
            const waitPenalty = c.waitMinutes * 0.005;

            const futureBudgetAfterCurrent = remainingBudget - Number(c.attr.cost);

            let costPenalty = 0;
            if (futureBudgetAfterCurrent > 0) {
                const costRatio = Number(c.attr.cost) / futureBudgetAfterCurrent;
                costPenalty = costRatio * 0.6;
            }

            c.scoreNow = preferenceScore - travelPenalty - waitPenalty - costPenalty;
        }

        // -------------------------
        // 3. Apply smart threshold
        // -------------------------
        const STRICT_THRESHOLD = 0.4;
        const RELAXED_THRESHOLD = 0.2;

        let filteredCandidates = candidates.filter(c => c.scoreNow >= STRICT_THRESHOLD);

        if (filteredCandidates.length === 0) {
            filteredCandidates = candidates.filter(c => c.scoreNow >= RELAXED_THRESHOLD);
        }

        if (filteredCandidates.length === 0) {
            // nothing worth visiting → end day
            currentDay++;
            currentTime = new Date(dayStart);
            continue;
        }

        // -------------------------
        // 4. Choose best with lookahead
        // -------------------------
        let best = null;
        let bestTotalScore = -Infinity;
        let bestScoreNow = 0;

        for (const c of filteredCandidates) {

            const scoreNow = c.scoreNow;

            // simulate future
            let futureVisitStart = c.arrivalTime;
            if (c.waitMinutes > 0) {
                futureVisitStart = addMinutes(futureVisitStart, c.waitMinutes);
            }

            const futureVisitEnd = addMinutes(futureVisitStart, c.attr.duration_minutes);
            const futureTime = addMinutes(futureVisitEnd, systemConfig.break_minutes);

            const futureLocation = {
                lat: Number(c.attr.latitude),
                lng: Number(c.attr.longitude)
            };

            const futureRemaining = remaining.filter(
                a => a.attraction_id !== c.attr.attraction_id
            );

            const futureBudget = remainingBudget - Number(c.attr.cost);

            let bestNextScore = -Infinity;

            for (const nextAttr of futureRemaining) {

                const nextCheck = isFeasible(
                    futureLocation,
                    futureTime,
                    nextAttr,
                    dayEnd,
                    systemConfig,
                    futureBudget
                );

                if (!nextCheck.feasible) continue;

                const nextTimeBonus = getTimeBonus(nextAttr, nextCheck.arrivalTime);
                const nextPreferenceScore = nextAttr.base_score * nextTimeBonus;

                const nextTravelPenalty = nextCheck.travelMinutes * 0.01;
                const nextWaitPenalty = nextCheck.waitMinutes * 0.005;

                let nextCostPenalty = 0;
                if (futureBudget > 0) {
                    const nextCostRatio = Number(nextAttr.cost) / futureBudget;
                    nextCostPenalty = nextCostRatio * 0.3;
                }

                const nextScore =
                    nextPreferenceScore -
                    nextTravelPenalty -
                    nextWaitPenalty -
                    nextCostPenalty;

                if (nextScore > bestNextScore) {
                    bestNextScore = nextScore;
                }
            }

            if (bestNextScore === -Infinity) bestNextScore = 0;

            const totalScore = scoreNow + bestNextScore * 0.5;

            if (totalScore > bestTotalScore) {
                bestTotalScore = totalScore;
                best = c;
                bestScoreNow = scoreNow;
            }
        }

        if (!best) break;

        // -------------------------
        // 5. Schedule
        // -------------------------
        const chosen = best.attr;

        let visitStart = best.arrivalTime;
        if (best.waitMinutes > 0) {
            visitStart = addMinutes(visitStart, best.waitMinutes);
        }

        const visitEnd = addMinutes(visitStart, chosen.duration_minutes);

        currentLocation = {
            lat: Number(chosen.latitude),
            lng: Number(chosen.longitude)
        };

        currentTime = addMinutes(visitEnd, systemConfig.break_minutes);
        remainingBudget -= Number(chosen.cost);

        const index = remaining.findIndex(
            a => a.attraction_id === chosen.attraction_id
        );

        if (index !== -1) remaining.splice(index, 1);

        route.push({
            ...chosen,
            day_number: currentDay,
            distance_from_previous: best.distance,
            travel_minutes: best.travelMinutes,
            visit_start_time: visitStart,
            visit_end_time: visitEnd,
            final_score: bestScoreNow,
            lookahead_score: bestTotalScore
        });
    }

    return route;
};

exports.clearDistanceCache = () => {
    distanceCache.clear();
};