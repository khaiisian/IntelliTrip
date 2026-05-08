// itinerary.service.js
const { parseTime, formatTime } = require('../utils/time');

const tripRepo = require('../repositories/trip.repository');
const attractionRepo = require('../repositories/attraction.repository');
const experienceRepo = require('../repositories/attractionExperience.repository');
const systemConfigRepo = require('../repositories/systemConfig.repository');
const itineraryRepo = require('../repositories/itinerary.repository');
const CreateItineraryRequest = require('../models/itinerary/itinerary.request');
const ItineraryResponse = require('../models/itinerary/itinerary.response');
const toTime = require('../utils/formatTime');
const generateCode = require('../utils/generateCode');

const scoringService = require('../services/scoring.service');
const routingService = require('../services/routing.service');
const orsService = require('../services/ors.service');

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
            // 🔥 NEW: Optional END_DAY action
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
                console.log(`[DAY ${state.currentDay}] Selected: ${chosen.attraction_name} (score: ${candidate.score.toFixed(3)}, cost: ${chosen.cost}) | Time: ${formatTime(actualStart)} → ${formatTime(visitEnd)} | Remaining budget: ${(state.remainingBudget - chosen.cost).toFixed(2)}`);

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

exports.saveItinerary = async (tripCode, payload) => {
    const request = new CreateItineraryRequest(payload);
    const trip = await tripRepo.findByCode(tripCode);
    if (!trip) throw { statusCode: 404, message: 'Trip not found' };
    if (!request.itinerary || request.itinerary.length === 0) {
        throw { statusCode: 400, message: 'Itinerary items are required' };
    }

    const startingItemCode = await generateCode('tbl_itinerary_item', 'item_code', 'ITEM');
    const initialItemNumber = Number(startingItemCode.match(/\d+$/)?.[0] ?? 0);

    const items = request.itinerary.map((item, index) => {
        if (!item.attraction_id) {
            throw { statusCode: 400, message: `Itinerary item ${index + 1} is missing attraction_id` };
        }
        if (!item.visit_start_time) {
            throw { statusCode: 400, message: `Itinerary item ${index + 1} is missing visit_start_time` };
        }
        if (!item.visit_end_time) {
            throw { statusCode: 400, message: `Itinerary item ${index + 1} is missing visit_end_time` };
        }

        const itemCodeNumber = initialItemNumber + index;
        const itemCode = `ITEM-${itemCodeNumber.toString().padStart(4, '0')}`;

        return {
            item_code: itemCode,
            day_number: Number(item.day_number || 1),
            visit_start_time: toTime(item.visit_start_time),
            visit_end_time: toTime(item.visit_end_time),
            attraction_id: Number(item.attraction_id),
            distance_from_previous: Number(item.distance_from_previous || 0),
            final_score: Number(item.final_score || 0)
        };
    });

    const totalCost = request.total_cost !== null && !Number.isNaN(request.total_cost)
        ? request.total_cost
        : request.itinerary.reduce((sum, item) => sum + Number(item.cost || 0), 0);

    const itineraryCode = await generateCode('tbl_itinerary', 'itinerary_code', 'ITIN');

    const itinerary = await itineraryRepo.create({
        trip_id: trip.trip_id,
        total_cost: Number(totalCost.toFixed(2)),
        itinerary_code: itineraryCode,
        items
    });

    return new ItineraryResponse(itinerary);
};

exports.getItinerariesByUserCode = async (userCode) => {
    const itineraries = await itineraryRepo.findAllByUserCode(userCode);
    return itineraries.map(x => new ItineraryResponse(x));
};

exports.getSavedItinerary = async (tripCode) => {
    const trip = await tripRepo.findByCode(tripCode);
    if (!trip) throw { statusCode: 404, message: 'Trip not found' };

    const itineraries = await itineraryRepo.findByTripId(trip.trip_id);
    if (!itineraries || itineraries.length === 0) throw { statusCode: 404, message: 'No saved itinerary found for this trip' };

    const itinerary = itineraries[0]; // Get the latest itinerary (ordered by generated_at desc)

    const experiences = await experienceRepo.getAllExperiences();

    const sortedItems = [...itinerary.tbl_itinerary_item].sort((a, b) => {
        if (a.day_number !== b.day_number) return a.day_number - b.day_number;
        return new Date(a.visit_start_time) - new Date(b.visit_start_time);
    });

    const scheduledItems = sortedItems.map((item, index) => {
        const attraction = item.tbl_attraction || {};
        const attractionExperiences = experiences.filter(e => e.attraction_id === item.attraction_id);

        const startTime = new Date(item.visit_start_time);
        const endTime = new Date(item.visit_end_time);
        const durationMinutes = Math.max(0, Math.round((endTime - startTime) / 60000));

        let travelMinutes = 0;
        const previousItem = sortedItems[index - 1];
        if (previousItem && previousItem.day_number === item.day_number) {
            const previousEnd = new Date(previousItem.visit_end_time);
            travelMinutes = Math.max(0, Math.round((startTime - previousEnd) / 60000));
        }

        return {
            day_number: item.day_number,
            attraction_id: item.attraction_id,
            attraction_code: attraction.attraction_code,
            attraction_name: attraction.attraction_name,
            latitude: attraction.latitude,
            longitude: attraction.longitude,
            visit_start_time: formatTime(item.visit_start_time),
            visit_end_time: formatTime(item.visit_end_time),
            distance_from_previous: Number(item.distance_from_previous || 0),
            travel_minutes: travelMinutes,
            final_score: Number(item.final_score || 0),
            duration_minutes: durationMinutes,
            cost: Number(attraction.cost || 0),
            experienceScore: scoringService.computeExperienceScore(attractionExperiences, item.visit_start_time),
            is_best_time: item.attraction_id ? isWithinBestTime(attraction, item.visit_start_time) : false
        };
    });

    const totals = calculateTotals(scheduledItems);
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
};

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
        orsService.resetORSStats();

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
        const route = await generateRoute(
            { lat: trip.start_lat, lng: trip.start_lng },
            selectedAttractions,
            startTime,
            dayStartTime,
            dayEndTime,
            tripDays,
            trip.budget,
            systemConfig,
            scoringService,
            maxCost,
            { lat: trip.end_lat ?? trip.start_lat, lng: trip.end_lng ?? trip.start_lng }
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

        // 7. Convert route items to the format expected by the response (use day_number from route)
        const scheduledItems = route.map(item => ({
            day_number: item.day_number,
            attraction_id: item.attraction_id,
            attraction_code: item.attraction_code,
            attraction_name: item.attraction_name,
            latitude: item.latitude,
            longitude: item.longitude,
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
    } finally {
        const { requestCount, fallbackCount, skippedByLimit } = orsService.getORSStats();
        console.log('=== ORS SUMMARY ===');
        console.log('Successful ORS calls:', requestCount);
        console.log('Fallback used:', fallbackCount);
        console.log('Skipped due to limit:', skippedByLimit);
        console.log('====================');
    }
};

/**
 * Recalculate and validate itinerary based on user actions (e.g., move, delete, edit time).
 * Does not save changes; returns a preview for feasibility check.
 * Locked items are immutable anchors: their day_number, position, visit_start_time, and visit_end_time never change.
 * @param {string} tripCode - Trip code to fetch details.
 * @param {Array} currentItinerary - Current scheduled items.
 * @param {Object} action - Action details (e.g., { type: 'move', itemCode: 'ITEM-0001', newDay: 2, newPosition: 1 }).
 * @param {Array} lockedItems - Array of locked item codes.
 * @returns {Object} - { isValid, errors, recalculatedItinerary, freeTimeGaps, suggestions, totals }
 */
function applyAction(itinerary, action, lockedItems, tripDays) {
    let updated = JSON.parse(JSON.stringify(itinerary));

    if (action.type === 'move' || action.type === 'reorder') {
        if (lockedItems.includes(action.itemCode)) {
            throw { statusCode: 400, message: 'Cannot move locked item' };
        }
        const dayMap = updated.reduce((acc, i) => {
            acc[i.day_number] = acc[i.day_number] || [];
            acc[i.day_number].push(i);
            return acc;
        }, {});
        const targetItem = updated.find(i => i.item_code === action.itemCode);
        if (!targetItem) {
            throw {
                statusCode: 400,
                message: `Item not found for code: ${action.itemCode}`
            };
        }

        const oldDay = targetItem.day_number;
        const oldIndex = dayMap[oldDay]?.findIndex(i => i.item_code === action.itemCode);
        if (oldIndex === -1 || oldIndex === undefined) {
            throw {
                statusCode: 400,
                message: `Item index not found for code: ${action.itemCode}`
            };
        }

        const [item] = dayMap[oldDay].splice(oldIndex, 1);
        if (!item) {
            throw {
                statusCode: 400,
                message: `Failed to move item: ${action.itemCode}`
            };
        }

        item.day_number = action.newDay || item.day_number;
        dayMap[item.day_number] = dayMap[item.day_number] || [];
        const insertPos = action.newPosition !== undefined ? action.newPosition : dayMap[item.day_number].length;
        dayMap[item.day_number].splice(insertPos, 0, item);
        updated = [];
        for (let d = 1; d <= tripDays; d++) {
            if (dayMap[d]) updated.push(...dayMap[d]);
        }
    } else if (action.type === 'delete') {
        if (lockedItems.includes(action.itemCode)) {
            throw { statusCode: 400, message: 'Cannot delete locked item' };
        }
        updated = updated.filter(i => i.item_code !== action.itemCode);
    } else if (action.type === 'editTime') {
        if (lockedItems.includes(action.itemCode)) {
            throw { statusCode: 400, message: 'Cannot edit time for locked item' };
        }
        const item = updated.find(i => i.item_code === action.itemCode);
        if (!item) throw { statusCode: 400, message: 'Item not found' };
        item.visit_start_time = new Date(action.newStartTime);
        item.visit_end_time = new Date(item.visit_start_time.getTime() + item.duration_minutes * 60000);
    }

    return updated;
}

async function buildTimeline(itinerary, tripConfig, lockedItems) {
    const { trip, schedule, experiences, systemConfig, tripDays, maxCost } = tripConfig;
    let updated = JSON.parse(JSON.stringify(itinerary));

    const dayStartTime = parseTime(schedule.day_start_time);
    const dayEndTime = parseTime(schedule.day_end_time);

    for (let day = 1; day <= tripDays; day++) {
        const dayItems = updated.filter(i => Number(i.day_number) === Number(day)).sort((a, b) => new Date(a.visit_start_time) - new Date(b.visit_start_time));
        if (dayItems.length === 0) continue;

        let currentTime = new Date(dayStartTime);
        let prevLatLng = null;
        for (let i = 0; i < dayItems.length; i++) {
            const item = dayItems[i];
            if (lockedItems.includes(item.item_code)) {
                // Locked: keep original times, update currentTime to its end
                currentTime = new Date(item.visit_end_time);
                prevLatLng = {
                    lat: Number(item.latitude),
                    lng: Number(item.longitude)
                };
                continue;
            }
            // Unlocked: recompute
            if (i === 0 || !prevLatLng) {
                item.visit_start_time = new Date(currentTime);
            } else {
                const travel = await orsService.getTravelTime(
                    prevLatLng,
                    {
                        lat: Number(item.latitude),
                        lng: Number(item.longitude)
                    }
                );
                item.travel_minutes = travel;
                item.distance_from_previous = require('../utils/distance').calculateDistance(
                    prevLatLng.lat,
                    prevLatLng.lng,
                    Number(item.latitude),
                    Number(item.longitude)
                );
                item.visit_start_time = new Date(currentTime.getTime() + travel * 60000);
            }
            item.visit_end_time = new Date(item.visit_start_time.getTime() + item.duration_minutes * 60000);
            currentTime = new Date(item.visit_end_time);
            prevLatLng = {
                lat: Number(item.latitude),
                lng: Number(item.longitude)
            };
            // Recalc score
            const expScore = scoringService.computeExperienceScore(experiences.filter(e => e.attraction_id === item.attraction_id), item.visit_start_time);
            item.final_score = scoringService.computeScore({
                basePreference: item.base_score || 0,
                experienceScore: expScore,
                travelMinutes: item.travel_minutes,
                waitMinutes: 0,
                cost: item.cost,
                distance: item.distance_from_previous,
                toEndDistance: 0, // Simplified
                toEndDistanceNormalized: 0,
                maxCost,
                currentDay: day,
                totalDays: tripDays,
                currentTime: item.visit_start_time,
                remainingBudget: trip.budget - updated.reduce((sum, it) => sum + Number(it.cost || 0), 0),
                todaySpent: 0, // Simplified
                idealDailyBudget: trip.budget / tripDays
            });
        }
        // Check day end
        if (currentTime > dayEndTime) {
            throw { statusCode: 400, message: `Day ${day} exceeds end time` };
        }
    }

    // Ensure all times are returned as 'HH:mm' strings
    updated = updated.map(item => ({
        ...item,
        visit_start_time: formatTime(item.visit_start_time),
        visit_end_time: formatTime(item.visit_end_time)
    }));
    return updated;
}

function detectFreeTime(itinerary, dayStart, dayEnd, tripDays) {
    const freeTimeGaps = [];
    for (let day = 1; day <= tripDays; day++) {
        const dayItems = itinerary.filter(i => i.day_number === day).sort((a, b) => new Date(a.visit_start_time) - new Date(b.visit_start_time));
        if (dayItems.length === 0) continue;

        // Gap before first item
        const firstStart = new Date(dayItems[0].visit_start_time);
        const gapBefore = (firstStart - dayStart) / 60000;
        if (gapBefore > 30) {
            freeTimeGaps.push({
                day,
                start: formatTime(dayStart),
                end: formatTime(firstStart),
                minutes: gapBefore
            });
        }

        // Gaps between items
        for (let i = 0; i < dayItems.length - 1; i++) {
            const gap = (new Date(dayItems[i + 1].visit_start_time) - new Date(dayItems[i].visit_end_time)) / 60000;
            if (gap > 30) {
                freeTimeGaps.push({
                    day,
                    start: formatTime(dayItems[i].visit_end_time),
                    end: formatTime(dayItems[i + 1].visit_start_time),
                    minutes: gap
                });
            }
        }

        // Gap after last item
        const lastEnd = new Date(dayItems[dayItems.length - 1].visit_end_time);
        const gapAfter = (dayEnd - lastEnd) / 60000;
        if (gapAfter > 30) {
            freeTimeGaps.push({
                day,
                start: formatTime(lastEnd),
                end: formatTime(dayEnd),
                minutes: gapAfter
            });
        }
    }
    return freeTimeGaps;
}

function generateSuggestions(freeTimeGaps, attractions, usedIds, budgetRemaining) {
    const suggestions = [];
    const remainingAttractions = attractions.filter(a => !usedIds.includes(a.attraction_id));
    for (const gap of freeTimeGaps) {
        if (gap.minutes > 30) { // Use 30 min threshold
            const feasible = remainingAttractions.filter(a => a.duration_minutes <= gap.minutes && a.cost <= budgetRemaining);
            const topAttr = feasible.sort((a, b) => b.base_score - a.base_score)[0];
            if (topAttr) {
                const placementTime = new Date(gap.start).getTime() + (gap.minutes / 2) * 60000; // Mid-gap
                suggestions.push({
                    gapIndex: freeTimeGaps.indexOf(gap),
                    suggestedAttraction: {
                        attraction_id: topAttr.attraction_id,
                        name: topAttr.attraction_name,
                        placementTime: formatTime(new Date(placementTime)),
                        duration: topAttr.duration_minutes,
                        cost: topAttr.cost
                    }
                });
            }
        }
    }
    return suggestions;
}

function validateItinerary(itinerary, trip, tripDays) {
    const errors = [];
    const totalCost = itinerary.reduce((sum, i) => sum + Number(i.cost || 0), 0);
    if (totalCost > trip.budget) errors.push('Budget exceeded');
    const maxDay = itinerary.length
        ? Math.max(...itinerary.map(i => i.day_number || 1))
        : 1;
    if (maxDay > tripDays) errors.push('Exceeds trip days');
    // Overlaps (simplified)
    for (const dayItems of Object.values(itinerary.reduce((acc, i) => { acc[i.day_number] = acc[i.day_number] || []; acc[i.day_number].push(i); return acc; }, {}))) {
        const sorted = dayItems.sort((a, b) => new Date(a.visit_start_time) - new Date(b.visit_start_time));
        for (let i = 1; i < sorted.length; i++) {
            if (new Date(sorted[i].visit_start_time) < new Date(sorted[i - 1].visit_end_time)) {
                errors.push(`Time overlap on day ${sorted[i].day_number}`);
            }
        }
    }
    return { isValid: errors.length === 0, errors };
}

exports.recalculateAndValidateItinerary = async (tripCode, currentItinerary, action, lockedItems = []) => {
    try {
        // Fetch trip, schedule, etc.
        const trip = await tripRepo.findByCode(tripCode);
        const schedule = await tripRepo.getTripSchedule(trip?.trip_id);
        const attractions = await attractionRepo.findAll();
        const experiences = await experienceRepo.getAllExperiences();
        const systemConfig = await systemConfigRepo.getSystemConfig();

        // Log critical inputs
        console.log("trip:", trip);
        console.log("schedule:", schedule);
        console.log("currentItinerary:", currentItinerary);
        console.log("action:", action);

        if (!trip) {
            throw {
                statusCode: 404,
                message: `Trip not found: ${tripCode}`
            };
        }
        if (!schedule) {
            throw {
                statusCode: 404,
                message: 'Trip schedule not found'
            };
        }

        const tripDays = scoringService.calculateTripDays(trip.start_date, trip.end_date);
        const dayStartTime = parseTime(schedule.day_start_time);
        const dayEndTime = parseTime(schedule.day_end_time);
        console.log("dayStartTime:", dayStartTime);
        console.log("dayEndTime:", dayEndTime);
        const maxCost = attractions.length
            ? Math.max(...attractions.map(a => a.cost || 0))
            : 0;

        const tripConfig = { trip, schedule, experiences, systemConfig, tripDays, maxCost };

        let updated = applyAction(currentItinerary, action, lockedItems, tripDays);

        updated = await buildTimeline(updated, tripConfig, lockedItems);

        const freeTime = detectFreeTime(updated, dayStartTime, dayEndTime, tripDays);

        const usedIds = updated.map(i => i.attraction_id);
        const totalCost = updated.reduce((sum, i) => sum + Number(i.cost || 0), 0);
        const budgetRemaining = trip.budget - totalCost;
        const suggestions = generateSuggestions(freeTime, attractions, usedIds, budgetRemaining);

        const validation = validateItinerary(updated, trip, tripDays);

        return {
            isValid: validation.isValid,
            errors: validation.errors,
            recalculatedItinerary: updated,
            freeTimeGaps: freeTime,
            suggestions,
            totals: calculateTotals(updated)
        };
    } catch (error) {
        console.error("RECALCULATE ERROR:", error);
        throw { statusCode: error.statusCode || 500, message: error.message || 'Recalculation failed' };
    }
};
