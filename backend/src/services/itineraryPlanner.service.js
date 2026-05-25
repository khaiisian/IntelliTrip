const { formatTime } = require('../utils/time');
const routingService = require('./routing.service');

function advanceToNextDay(state, dayDate, dayStartTime, tripDays) {
    const nextDay = state.currentDay + 1;

    if (nextDay > tripDays) return null;

    const nextDayStart = new Date(dayDate);
    nextDayStart.setUTCDate(dayDate.getUTCDate() + 1);
    nextDayStart.setUTCHours(
        dayStartTime.getUTCHours(),
        dayStartTime.getUTCMinutes(),
        0, 0
    );

    return {
        ...state,
        currentDay: nextDay,
        currentTime: nextDayStart,
        hasLunchBreak: false,
        todaySpent: 0,
        visitsToday: 0
    };
}

/**
 * Generate route using beam search for better optimization
 */
async function generateRoute(startLocation, attractions, startTime, dayStartTime, dayEndTime, tripDays, tripBudget, systemConfig, scoring, maxCost, endLocation) {

    if (!attractions?.length) return [];

    const BEAM_WIDTH = 6;

    // State: { route: [], currentLocation, currentTime, currentDay, remainingBudget, remainingAttractions: [], totalScore, todaySpent, visitsToday }
    const initialState = {
        route: [],
        currentLocation: { id: 'start', lat: Number(startLocation.lat), lng: Number(startLocation.lng) },
        currentTime: new Date(startTime),
        currentDay: 1,
        remainingBudget: Number(tripBudget) || 0,
        remainingAttractions: [...attractions],
        totalScore: 0,
        hasLunchBreak: false,
        todaySpent: 0,
        visitsToday: 0
    };

    let beam = [initialState];

    const maxIterations = 1000; // safety
    let iteration = 0;

    while (beam.length > 0 && iteration < maxIterations) {
        iteration++;
        const newBeam = [];

        for (const state of beam) {
            if (state.remainingAttractions.length === 0 || state.currentDay > tripDays) {
                // Complete state, keep it
                newBeam.push(state);
                continue;
            }

            // Calculate day times
            const tripStart = new Date(startTime);
            tripStart.setUTCHours(0, 0, 0, 0);

            const dayDate = new Date(tripStart);
            dayDate.setUTCDate(tripStart.getUTCDate() + (state.currentDay - 1));

            const dayStart = new Date(dayDate);
            dayStart.setUTCHours(dayStartTime.getUTCHours(), dayStartTime.getUTCMinutes(), 0, 0);

            const dayEnd = new Date(dayDate);
            dayEnd.setUTCHours(dayEndTime.getUTCHours(), dayEndTime.getUTCMinutes(), 0, 0);

            let currentTime = new Date(state.currentTime);
            if (currentTime < dayStart) currentTime = new Date(dayStart);

            const currentState = {
                location: state.currentLocation,
                time: currentTime,
                dayEnd: dayEnd,
                endLocation: endLocation
            };

            // Build feasible candidates
            const candidates = await routingService.buildCandidates(state.remainingAttractions, currentState, systemConfig, state.remainingBudget);

            // ===============================
            // ðŸ”¥ NEW: Optional END_DAY action
            // ===============================
            const canEndDayEarly = state.currentDay < tripDays;

            // Heuristic: allow early day end if:
            // - already visited at least two attractions today
            // - AND it is late enough or daily budget is nearly exhausted
            const currentHour = currentTime.getUTCHours();
            const todaySpent = state.todaySpent;
            const idealDailyBudget = tripBudget / tripDays;
            const visitsToday = state.visitsToday;

            const allowEarlyEnd =
                visitsToday >= 2 &&
                (
                    currentHour >= 16 ||
                    todaySpent >= idealDailyBudget * 0.8
                );

            if (canEndDayEarly && allowEarlyEnd) {
                const nextDay = state.currentDay + 1;

                const nextDayStart = new Date(dayDate);
                nextDayStart.setUTCDate(dayDate.getUTCDate() + 1);
                nextDayStart.setUTCHours(
                    dayStartTime.getUTCHours(),
                    dayStartTime.getUTCMinutes(),
                    0, 0
                );

                const endDayState = {
                    ...state,
                    currentDay: nextDay,
                    currentTime: nextDayStart,
                    hasLunchBreak: false
                };

                newBeam.push(endDayState);
            }

            if (candidates.length === 0) {
                // No candidates, try next day
                console.log(`[DAY ${state.currentDay}] No candidates at ${formatTime(currentTime)}. Moving to day ${state.currentDay + 1}`);
                const nextDay = state.currentDay + 1;
                if (nextDay > tripDays) {
                    newBeam.push(state);
                    continue;
                }
                const nextDayStart = new Date(dayDate);
                nextDayStart.setUTCDate(dayDate.getUTCDate() + 1);
                nextDayStart.setUTCHours(dayStartTime.getUTCHours(), dayStartTime.getUTCMinutes(), 0, 0);

                const nextState = {
                    ...state,
                    currentDay: nextDay,
                    currentTime: nextDayStart,
                    hasLunchBreak: false
                };
                newBeam.push(nextState);
                continue;
            }

            // Score candidates
            for (const c of candidates) {
                const experienceScore = scoring.computeExperienceScore(
                    c.attraction.experiences,
                    c.arrivalTime
                );

                const idealDailyBudget = tripBudget / tripDays;

                const todaySpent = state.todaySpent;

                const score = scoring.computeScore({
                    basePreference: c.attraction.base_score,
                    experienceScore,
                    travelMinutes: c.travelMinutes,
                    waitMinutes: c.waitMinutes,
                    cost: c.attraction.cost,
                    distance: c.distance,
                    toEndDistance: c.toEndDistance,
                    toEndDistanceNormalized: c.toEndDistanceNormalized,
                    maxCost,

                    currentDay: state.currentDay,
                    totalDays: tripDays,
                    currentTime: c.arrivalTime,
                    remainingBudget: state.remainingBudget,
                    todaySpent,
                    idealDailyBudget
                });

                c.score = score;
                c.experienceScore = experienceScore;
            }

            candidates.sort((a, b) => b.score - a.score);
            const topCandidates = candidates.slice(0, BEAM_WIDTH);

            // Create new states for each candidate
            for (const candidate of topCandidates) {
                const chosen = candidate.attraction;
                const actualStart = new Date(candidate.arrivalTime.getTime() + candidate.waitMinutes * 60000);
                const visitEnd = new Date(actualStart.getTime() + chosen.duration_minutes * 60000);

                // === DYNAMIC BREAK ===
                let dynamicBreak = 0;
                let newHasLunchBreak = state.hasLunchBreak;   // start with current state's flag
                const hour = visitEnd.getUTCHours();

                // Rule 1: Lunch break (once per day, between 11:00 and 14:00)
                if (!state.hasLunchBreak && hour >= 11 && hour <= 14) {
                    dynamicBreak = 30;
                    newHasLunchBreak = true;   // mark for this candidate only
                }
                // Rule 2: Short buffer after long travel (only if no lunch taken)
                else if (candidate.travelMinutes > 15) {
                    dynamicBreak = 5;
                }
                // else dynamicBreak stays 0 â†’ no forced break

                let newTime = new Date(visitEnd.getTime() + dynamicBreak * 60000);
                let newDay = state.currentDay;

                // Check if time exceeds day end
                if (newTime > dayEnd) {
                    newDay++;
                    if (newDay > tripDays) continue; // Skip if exceeds trip days
                    const nextDayStart = new Date(dayDate);
                    nextDayStart.setUTCDate(dayDate.getUTCDate() + 1);
                    nextDayStart.setUTCHours(dayStartTime.getUTCHours(), dayStartTime.getUTCMinutes(), 0, 0);
                    newTime = nextDayStart;
                    newHasLunchBreak = false;   // reset for the new day
                    console.log(`[DAY ${state.currentDay}] Ended at ${formatTime(visitEnd)}. Moving to day ${newDay} at ${formatTime(nextDayStart)}`);
                }

                const scheduledItem = {
                    ...chosen,
                    day_number: state.currentDay,
                    distance_from_previous: candidate.distance,
                    travel_minutes: candidate.travelMinutes,
                    visit_start_time: actualStart,
                    visit_end_time: visitEnd,
                    final_score: candidate.score,
                    experienceScore: candidate.experienceScore,
                    cost: chosen.cost,
                    total_score: state.totalScore + candidate.score
                };

                const newState = {
                    route: [...state.route, scheduledItem],
                    currentLocation: { id: chosen.attraction_id, lat: Number(chosen.latitude), lng: Number(chosen.longitude) },
                    currentTime: newTime,
                    currentDay: newDay,
                    remainingBudget: state.remainingBudget - Number(chosen.cost),
                    remainingAttractions: state.remainingAttractions.filter(a => a.attraction_id !== chosen.attraction_id),
                    totalScore: state.totalScore + candidate.score,
                    hasLunchBreak: newHasLunchBreak,
                    todaySpent: newDay === state.currentDay ? state.todaySpent + Number(chosen.cost) : Number(chosen.cost),
                    visitsToday: newDay === state.currentDay ? state.visitsToday + 1 : 1
                };

                // Log when a candidate is selected
                console.log(`[DAY ${state.currentDay}] Selected: ${chosen.attraction_name} (score: ${candidate.score.toFixed(3)}, cost: ${chosen.cost}) | Time: ${formatTime(actualStart)} â†’ ${formatTime(visitEnd)} | Remaining budget: ${(state.remainingBudget - chosen.cost).toFixed(2)}`);

                newBeam.push(newState);
            }
        }

        // Select top BEAM_WIDTH states by totalScore
        beam = newBeam
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, BEAM_WIDTH);

        // If all states are complete or no progress, break
        const allComplete = beam.every(s => s.remainingAttractions.length === 0 || s.currentDay > tripDays);
        if (allComplete) break;
    }

    // Return the best route
    if (beam.length === 0) return [];

    // Sort beam by totalScore descending
    beam.sort((a, b) => b.totalScore - a.totalScore);

    // Find the first valid route
    let bestState = null;
    for (const state of beam) {
        if (validateRoute(state.route, tripBudget, tripDays)) {
            bestState = state;
            break;
        }
    }

    if (!bestState) {
        console.warn('No valid route found, returning best invalid route');
        bestState = beam[0];
    }

    console.log(`Beam search completed after ${iteration} iterations. Best state has ${bestState.route.length} attractions, total score ${bestState.totalScore.toFixed(2)}, last day ${bestState.currentDay}`);
    return bestState.route;
}

/**
 * Validate the final route for correctness
 */
function validateRoute(route, tripBudget, tripDays) {
    if (!route || route.length === 0) return false;

    let totalCost = 0;
    const daysUsed = new Set();

    for (const item of route) {
        totalCost += Number(item.cost || 0);
        daysUsed.add(item.day_number);

        // Basic time validation - visit_end should be after visit_start
        if (item.visit_end_time && item.visit_start_time) {
            const start = new Date(item.visit_start_time);
            const end = new Date(item.visit_end_time);
            if (end <= start) {
                console.warn(`Invalid time for ${item.attraction_name}: end <= start`);
                return false;
            }
        }
    }

    // Check budget
    if (totalCost > tripBudget * 1.1) { // Allow 10% buffer
        console.warn(`Budget exceeded: ${totalCost} > ${tripBudget}`);
        return false;
    }

    // Check days
    if (daysUsed.size > tripDays) {
        console.warn(`Too many days used: ${daysUsed.size} > ${tripDays}`);
        return false;
    }

    return true;
}

module.exports = {
    advanceToNextDay,
    generateRoute,
    validateRoute
};
