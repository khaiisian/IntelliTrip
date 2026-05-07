// itinerary.service.js
const { parseTime, formatTime } = require('../utils/time');
const prisma = require('../prisma');
const generateCode = require('../utils/generateCode');

const tripRepo = require('../repositories/trip.repository');
const attractionRepo = require('../repositories/attraction.repository');
const experienceRepo = require('../repositories/attractionExperience.repository');
const systemConfigRepo = require('../repositories/systemConfig.repository');
const itineraryRepo = require('../repositories/itinerary.repository');

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

exports.saveItinerary = async (tripCode, itineraryData) => {
    console.log(`Saving itinerary for trip: ${tripCode}`);

    try {
        // 1. Get trip
        const trip = await tripRepo.findByCode(tripCode);
        if (!trip) {
            throw { statusCode: 404, message: "Trip not found" };
        }

        // 2. Calculate totals
        const totals = calculateTotals(itineraryData.itinerary);

        // Use a transaction to ensure atomicity and avoid race conditions in code generation
        const result = await prisma.$transaction(async (tx) => {
            // 3. Create itinerary record
            const itinerary = await tx.tbl_itinerary.create({
                data: {
                    itinerary_code: await generateCode('tbl_itinerary', 'itinerary_code', 'ITINERARY'),
                    trip_id: trip.trip_id,
                    total_distance: totals.totalDistance,
                    total_cost: totals.totalCost,
                    total_travel_time: totals.totalTravelTime,
                    total_visit_time: totals.totalVisitTime
                }
            });

            // 4. Generate unique codes for all items first (timestamp-based to ensure uniqueness)
            const timestamp = Date.now();
            const itemCodes = [];
            for (let i = 0; i < itineraryData.itinerary.length; i++) {
                itemCodes.push(`ITEM-${timestamp}-${String(i + 1).padStart(3, '0')}`);
            }

            // 5. Create itinerary items
            const itemPromises = itineraryData.itinerary.map(async (item, index) => {
                // Convert times to DateTime objects for MySQL Time fields (Prisma expects DateTime for @db.Time(0))
                let startTime, endTime;

                if (typeof item.visit_start_time === 'string') {
                    if (item.visit_start_time.match(/^\d{1,2}:\d{2}$/)) {
                        // HH:MM format, add :00 for seconds
                        startTime = new Date(`1970-01-01T${item.visit_start_time}:00.000Z`);
                    } else if (item.visit_start_time.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
                        // HH:MM:SS format
                        startTime = new Date(`1970-01-01T${item.visit_start_time}.000Z`);
                    } else {
                        throw new Error(`Invalid time format for start time: ${item.visit_start_time}`);
                    }
                } else if (item.visit_start_time instanceof Date) {
                    // Use the Date object directly (it should have the correct time)
                    startTime = item.visit_start_time;
                } else {
                    throw new Error(`Invalid type for visit_start_time: ${typeof item.visit_start_time}`);
                }

                if (typeof item.visit_end_time === 'string') {
                    if (item.visit_end_time.match(/^\d{1,2}:\d{2}$/)) {
                        endTime = new Date(`1970-01-01T${item.visit_end_time}:00.000Z`);
                    } else if (item.visit_end_time.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
                        endTime = new Date(`1970-01-01T${item.visit_end_time}.000Z`);
                    } else {
                        throw new Error(`Invalid time format for end time: ${item.visit_end_time}`);
                    }
                } else if (item.visit_end_time instanceof Date) {
                    endTime = item.visit_end_time;
                } else {
                    throw new Error(`Invalid type for visit_end_time: ${typeof item.visit_end_time}`);
                }

                return tx.tbl_itinerary_item.create({
                    data: {
                        item_code: itemCodes[index],
                        itinerary_id: itinerary.itinerary_id,
                        day_number: item.day_number,
                        visit_start_time: startTime,
                        visit_end_time: endTime,
                        attraction_id: item.attraction_id,
                        distance_from_previous: item.distance_from_previous,
                        final_score: item.final_score
                    }
                });
            });

            const items = await Promise.all(itemPromises);

            return {
                itinerary: {
                    ...itinerary,
                    tbl_itinerary_item: items
                }
            };
        });

        console.log(`Saved itinerary ${result.itinerary.itinerary_code} with ${itineraryData.itinerary.length} items`);

        return {
            success: true,
            itinerary: result.itinerary
        };
    } catch (error) {
        console.error('Error saving itinerary:', error);
        if (error.statusCode) throw error;
        throw { statusCode: 500, message: error.message || 'Failed to save itinerary' };
    }
};
