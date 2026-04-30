// itinerary.service.js
const { parseTime, formatTime } = require('../utils/time');
const { calculateDistance } = require('../utils/distance');

const tripRepo = require('../repositories/trip.repository');
const attractionRepo = require('../repositories/attraction.repository');
const experienceRepo = require('../repositories/attractionExperience.repository');
const systemConfigRepo = require('../repositories/systemConfig.repository');
// const itineraryRepo = require('../repositories/itinerary.repository'); // Uncomment when ready
// const itineraryItemRepo = require('../repositories/itineraryItem.repository'); // Uncomment when ready

const scoringService = require('../services/scoring.service');
const routingService = require('../services/routing.service');

function isWithinBestTime(attraction, visitStartTime) {
    if (!attraction.experiences || attraction.experiences.length === 0) return false;
    const visitMin = visitStartTime.getUTCHours() * 60 + visitStartTime.getUTCMinutes();
    for (const exp of attraction.experiences) {
        const start = parseTime(exp.best_time_start);
        const end = parseTime(exp.best_time_end);
        const startMin = start.getUTCHours() * 60 + start.getUTCMinutes();
        const endMin = end.getUTCHours() * 60 + end.getUTCMinutes();
        if (visitMin >= startMin && visitMin <= endMin && exp.time_bonus_multiplier > 1.0) {
            return true;
        }
    }
    return false;
}

function estimateFutureScore(remaining, chosenId, remainingDays) {
    const nextOptions = remaining.filter(a => a.attraction_id !== chosenId);

    if (nextOptions.length === 0) return 0;

    // Take top K best future options, scaled by remaining days
    const sorted = nextOptions
        .sort((a, b) => b.base_score - a.base_score)
        .slice(0, remainingDays * 2);

    const avg = sorted.reduce((sum, a) => sum + a.base_score, 0) / sorted.length;

    return avg * remainingDays;
}

/**
 * Generate route using beam search for better optimization
 */
function generateRoute(startLocation, attractions, startTime, dayStartTime, dayEndTime, tripDays, tripBudget, systemConfig, scoring, maxCost) {

    if (!attractions?.length) return [];

    const BEAM_WIDTH = 5;
    const MIN_HIGH_QUALITY_SCORE = 0.5;
    const MIN_ACCEPTABLE_SCORE = 0.3;

    // State: { route: [], currentLocation, currentTime, currentDay, remainingBudget, remainingAttractions: [], totalScore }
    const initialState = {
        route: [],
        currentLocation: { lat: Number(startLocation.lat), lng: Number(startLocation.lng) },
        currentTime: new Date(startTime),
        currentDay: 1,
        remainingBudget: Number(tripBudget) || 0,
        remainingAttractions: [...attractions],
        totalScore: 0,
        hasLunchBreak: false
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
                dayEnd: dayEnd
            };

            // Build feasible candidates
            const candidates = routingService.buildCandidates(state.remainingAttractions, currentState, systemConfig, state.remainingBudget);

            // ===============================
            // 🔥 NEW: Optional END_DAY action
            // ===============================
            const canEndDayEarly = state.currentDay < tripDays;

            // Heuristic: allow early day end if:
            // - already visited at least two attractions today
            // - AND it is late enough or daily budget is nearly exhausted
            const currentHour = currentTime.getUTCHours();
            const todaySpent = state.route
                .filter(r => r.day_number === state.currentDay)
                .reduce((sum, r) => sum + Number(r.cost || 0), 0);
            const idealDailyBudget = tripBudget / tripDays;
            const visitsToday = state.route.filter(r => r.day_number === state.currentDay).length;

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

                const remainingDays = tripDays - state.currentDay + 1;
                const endDayPenalty = 0.1 * (1 / remainingDays);

                const endDayState = {
                    ...state,
                    currentDay: nextDay,
                    currentTime: nextDayStart,
                    hasLunchBreak: false,
                    totalScore: state.totalScore - endDayPenalty
                };

                newBeam.push(endDayState);
                newBeam.push({
                    ...endDayState,
                    totalScore: endDayState.totalScore - 0.02
                });
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

                const todaySpent = state.route
                    .filter(r => r.day_number === state.currentDay)
                    .reduce((sum, r) => sum + Number(r.cost || 0), 0);

                const projectedSpend = todaySpent + Number(c.attraction.cost || 0);

                const dailyBudgetPenalty =
                    projectedSpend > idealDailyBudget
                        ? (projectedSpend - idealDailyBudget) / idealDailyBudget
                        : 0;

                const score = scoring.computeScore({
                    basePreference: c.attraction.base_score,
                    experienceScore,
                    travelMinutes: c.travelMinutes,
                    waitMinutes: c.waitMinutes,
                    cost: c.attraction.cost,
                    distance: c.distance,
                    maxCost,

                    currentDay: state.currentDay,
                    totalDays: tripDays,
                    currentTime: c.arrivalTime,
                    remainingBudget: state.remainingBudget
                }) - dailyBudgetPenalty * 0.3;

                const futurePotential = estimateFutureScore(
                    state.remainingAttractions,
                    c.attraction.attraction_id,
                    tripDays - state.currentDay + 1
                );

                c.score = score + 0.2 * futurePotential;
                c.futurePotential = futurePotential;
                c.experienceScore = experienceScore;
            }

            // Define score tiers (adjustable)
            const HIGH_QUALITY = MIN_HIGH_QUALITY_SCORE;
            const ACCEPTABLE = MIN_ACCEPTABLE_SCORE;

            candidates.sort((a, b) => b.score - a.score);

            // 1. First try: high quality
            let topCandidates = candidates.filter(c => c.score >= HIGH_QUALITY);

            // 2. Second try: acceptable (but not great)
            if (topCandidates.length === 0) {
                topCandidates = candidates.filter(c => c.score >= ACCEPTABLE);
            }

            // 3. Last resort: take the single best candidate (avoids empty itinerary)
            if (topCandidates.length === 0 && candidates.length > 0) {
                topCandidates = [candidates[0]];
            }

            // Limit to beam width (e.g., 5)
            topCandidates = topCandidates.slice(0, 5);

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
                // else dynamicBreak stays 0 → no forced break

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
                    lookahead_score: candidate.futurePotential,
                    cost: chosen.cost,
                    total_score: state.totalScore + candidate.score
                };

                const newState = {
                    route: [...state.route, scheduledItem],
                    currentLocation: { lat: Number(chosen.latitude), lng: Number(chosen.longitude) },
                    currentTime: newTime,
                    currentDay: newDay,
                    remainingBudget: state.remainingBudget - Number(chosen.cost),
                    remainingAttractions: state.remainingAttractions.filter(a => a.attraction_id !== chosen.attraction_id),
                    totalScore: state.totalScore + candidate.score,
                    hasLunchBreak: newHasLunchBreak
                };

                // Log when a candidate is selected
                console.log(`[DAY ${state.currentDay}] Selected: ${chosen.attraction_name} (score: ${candidate.score.toFixed(3)}, cost: ${chosen.cost}) | Time: ${formatTime(actualStart)} → ${formatTime(visitEnd)} | Remaining budget: ${(state.remainingBudget - chosen.cost).toFixed(2)}`);

                newBeam.push(newState);
            }
        }

        function computeBalancedScore(state) {
            const dayCounts = {};

            for (const item of state.route) {
                dayCounts[item.day_number] = (dayCounts[item.day_number] || 0) + 1;
            }

            const usedDays = Object.keys(dayCounts).length;
            const dayUsageBonus = usedDays * 0.2;

            const expectedDays = Math.min(tripDays, state.route.length / 3 + 1);
            const underusePenalty = Math.max(0, expectedDays - usedDays) * 0.3;

            const counts = Object.values(dayCounts);
            const avg = counts.reduce((a, b) => a + b, 0) / (counts.length || 1);
            const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0);
            const balancePenalty = variance * 0.05;

            return state.totalScore + dayUsageBonus - balancePenalty - underusePenalty;
        }

        // Select top BEAM_WIDTH states by balanced score
        newBeam.sort((a, b) => computeBalancedScore(b) - computeBalancedScore(a));
        beam = newBeam.slice(0, BEAM_WIDTH);

        // If all states are complete or no progress, break
        const allComplete = beam.every(s => s.remainingAttractions.length === 0 || s.currentDay > tripDays);
        if (allComplete) break;
    }

    // Return the best route
    if (beam.length === 0) return [];
    const bestState = beam.reduce((a, b) => a.totalScore > b.totalScore ? a : b);
    console.log(`Beam search completed after ${iteration} iterations. Best state has ${bestState.route.length} attractions, total score ${bestState.totalScore.toFixed(2)}, last day ${bestState.currentDay}`);
    return bestState.route;
}

/**
 * Validate that all required data is present
 */
function validateData(trip, preferences, schedule, attractions, experiences, systemConfig) {
    if (!trip) throw { statusCode: 404, message: "Trip not found" };
    if (!preferences || preferences.length === 0) {
        console.warn('No preferences found for trip, using defaults');
    }
    if (!schedule) throw { statusCode: 400, message: "Trip schedule not found" };
    if (!attractions || attractions.length === 0) {
        throw { statusCode: 500, message: "No attractions in database" };
    }
    if (!systemConfig) throw { statusCode: 500, message: "System configuration not found" };
}

/**
 * Calculate totals from scheduled items
 */
function calculateTotals(scheduledItems) {
    let totalDistance = 0;
    let totalTravelTime = 0;
    let totalVisitTime = 0;
    let totalCost = 0;

    for (const item of scheduledItems) {
        totalDistance += Number(item.distance_from_previous || 0);
        totalTravelTime += Number(item.travel_minutes || 0);
        totalVisitTime += Number(item.duration_minutes || 0);
        totalCost += Number(item.cost || 0);
    }

    return {
        totalDistance: Number(totalDistance.toFixed(2)),
        totalTravelTime,
        totalVisitTime,
        totalCost
    };
}

exports.generateItinerary = async (tripCode) => {
    console.log(`Generating itinerary for trip: ${tripCode}`);

    try {
        // 1. Load data
        const trip = await tripRepo.findByCode(tripCode);
        const preferences = await tripRepo.getTripPreferences(trip?.trip_id);
        const schedule = await tripRepo.getTripSchedule(trip?.trip_id);
        const attractions = await attractionRepo.findAll();
        const experiences = await experienceRepo.getAllExperiences();
        const systemConfig = await systemConfigRepo.getSystemConfig();

        validateData(trip, preferences, schedule, attractions, experiences, systemConfig);

        // 2. Trip days
        const tripDays = scoringService.calculateTripDays(trip.start_date, trip.end_date);

        // 3. Prepare attractions (base_score + experiences)
        const preparedAttractions = scoringService.prepareAttractions(attractions, experiences, preferences);
        console.log(`Prepared ${preparedAttractions.length} attractions`);

        const maxCost = Math.max(...preparedAttractions.map(a => a.cost));

        console.log("PREPARED ATTRS:", preparedAttractions.map(a => ({
            id: a.attraction_id,
            name: a.attraction_name,
            base_score: a.base_score,
            cost: a.cost
        })));

        // 4. Let routing handle budget constraints dynamically
        const selectedAttractions = preparedAttractions;

        console.log(`Selected ${selectedAttractions.length} attractions within budget`);

        if (selectedAttractions.length === 0) {
            throw { statusCode: 400, message: "No attractions fit within budget" };
        }

        // 5. Determine start time (first day start)
        const startDateTime = new Date(trip.start_date);
        const dayStartTime = parseTime(schedule.day_start_time);
        const dayEndTime = parseTime(schedule.day_end_time);

        const startTime = new Date(Date.UTC(
            startDateTime.getUTCFullYear(),
            startDateTime.getUTCMonth(),
            startDateTime.getUTCDate(),
            dayStartTime.getUTCHours(),
            dayStartTime.getUTCMinutes(),
            0, 0
        ));

        // 6. Time‑aware routing with hard constraints (Layer 1)
        const route = generateRoute(
            { lat: trip.start_lat, lng: trip.start_lng },
            selectedAttractions,
            startTime,
            dayStartTime,
            dayEndTime,
            tripDays,
            trip.budget,
            systemConfig,
            scoringService,
            maxCost
        );

        console.log(route)
        console.log("FINAL ROUTE:");
        console.table(route.map(r => ({
            name: r.attraction_name,
            score: r.final_score,
            time: `${formatTime(r.visit_start_time)} - ${formatTime(r.visit_end_time)}`
        })));

        console.log(`Created route with ${route.length} stops`);

        if (route.length === 0) {
            throw { statusCode: 400, message: "Could not schedule any attractions" };
        }

        // Add return to start point
        if (route.length > 0) {
            const lastItem = route[route.length - 1];
            const lastLocation = { lat: lastItem.latitude, lng: lastItem.longitude };
            const endLat = trip.end_lat ?? trip.start_lat;
            const endLng = trip.end_lng ?? trip.start_lng;
            const returnDistance = calculateDistance(lastLocation.lat, lastLocation.lng, endLat, endLng);
            const returnTravelMinutes = Math.ceil(returnDistance / systemConfig.travel_speed_kmh * 60);

            // Determine if this is a point-to-point trip (different end location)
            const isPointToPoint = (Number(trip.end_lat) !== Number(trip.start_lat)) || (Number(trip.end_lng) !== Number(trip.start_lng));
            const returnName = isPointToPoint ? "Return to end point" : "Return to start point";
            const destLat = isPointToPoint ? trip.end_lat : trip.start_lat;
            const destLng = isPointToPoint ? trip.end_lng : trip.start_lng;

            const returnItem = {
                day_number: lastItem.day_number,
                attraction_id: null,
                attraction_code: null,
                attraction_name: returnName,
                latitude: destLat,
                longitude: destLng,
                visit_start_time: lastItem.visit_end_time,
                visit_end_time: new Date(lastItem.visit_end_time.getTime() + returnTravelMinutes * 60000),
                distance_from_previous: returnDistance,
                travel_minutes: returnTravelMinutes,
                final_score: 0,
                duration_minutes: 0,
                cost: 0,
                experienceScore: 0,
                lookahead_score: 0
            };

            route.push(returnItem);
        }

        // 7. Convert route items to the format expected by the response (use day_number from route)
        const scheduledItems = route.map(item => ({
            day_number: item.day_number,
            attraction_id: item.attraction_id,
            attraction_code: item.attraction_code,
            attraction_name: item.attraction_name,
            visit_start_time: formatTime(item.visit_start_time),
            visit_end_time: formatTime(item.visit_end_time),
            distance_from_previous: item.distance_from_previous,
            travel_minutes: item.travel_minutes,
            final_score: item.final_score,
            duration_minutes: item.duration_minutes,
            cost: item.cost,
            experienceScore: item.experienceScore,
            is_best_time: item.attraction_id ? isWithinBestTime(item, item.visit_start_time) : false
        }));

        // 8. Calculate totals
        const totals = calculateTotals(scheduledItems);

        // 9. Group by day for easier frontend consumption
        const byDay = scheduledItems.reduce((acc, item) => {
            if (!acc[item.day_number]) acc[item.day_number] = [];
            acc[item.day_number].push(item);
            return acc;
        }, {});

        const safeTrip = {
            ...trip,
            tbl_user: trip.tbl_user ? { ...trip.tbl_user } : null
        };

        if (safeTrip.tbl_user) {
            delete safeTrip.tbl_user.password;
        }

        // 10. Return
        return {
            success: true,
            trip: safeTrip,
            summary: {
                totalAttractions: scheduledItems.length,
                totalCost: totals.totalCost,
                totalDistance: `${totals.totalDistance} km`,
                totalTravelTime: `${totals.totalTravelTime} minutes`,
                totalVisitTime: `${totals.totalVisitTime} minutes`
            },
            itinerary: scheduledItems,
            byDay
        };
    } catch (error) {
        console.error('Error generating itinerary:', error);
        if (error.statusCode) throw error;
        throw { statusCode: 500, message: error.message || 'Failed to generate itinerary' };
    }
};
