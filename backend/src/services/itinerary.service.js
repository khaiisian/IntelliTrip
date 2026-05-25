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
const itineraryPlanner = require('../services/itineraryPlanner.service');
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

async function buildItineraryItems(request) {
    const startingItemCode = await generateCode('tbl_itinerary_item', 'item_code', 'ITEM');
    const initialItemNumber = Number(startingItemCode.match(/\d+$/)?.[0] ?? 0);

    return request.itinerary.map((item, index) => {
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
}

function getItineraryTotalCost(request) {
    return request.total_cost !== null && !Number.isNaN(request.total_cost)
        ? request.total_cost
        : request.itinerary.reduce((sum, item) => sum + Number(item.cost || 0), 0);
}

exports.saveItinerary = async (tripCode, payload) => {
    const request = new CreateItineraryRequest(payload);
    const trip = await tripRepo.findByCode(tripCode);
    if (!trip) throw { statusCode: 404, message: 'Trip not found' };
    if (!request.itinerary || request.itinerary.length === 0) {
        throw { statusCode: 400, message: 'Itinerary items are required' };
    }

    const items = await buildItineraryItems(request);
    const totalCost = getItineraryTotalCost(request);

    const itineraryCode = await generateCode('tbl_itinerary', 'itinerary_code', 'ITIN');

    const itinerary = await itineraryRepo.create({
        trip_id: trip.trip_id,
        total_cost: Number(totalCost.toFixed(2)),
        itinerary_code: itineraryCode,
        items
    });

    return new ItineraryResponse(itinerary);
};

exports.updateItinerary = async (tripCode, payload) => {
    const request = new CreateItineraryRequest(payload);
    const trip = await tripRepo.findByCode(tripCode);
    if (!trip) throw { statusCode: 404, message: 'Trip not found' };
    if (!request.itinerary || request.itinerary.length === 0) {
        throw { statusCode: 400, message: 'Itinerary items are required' };
    }

    const items = await buildItineraryItems(request);
    const totalCost = getItineraryTotalCost(request);

    const itinerary = await itineraryRepo.updateLatestByTripId({
        trip_id: trip.trip_id,
        total_cost: Number(totalCost.toFixed(2)),
        items
    });

    if (!itinerary) {
        throw { statusCode: 404, message: 'No saved itinerary found for this trip' };
    }

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
        // If this is the first attraction of day 1, estimate travel from trip start
        if (index === 0 && item.day_number === 1) {
            const startLat = parseFloat(trip.start_lat);
            const startLng = parseFloat(trip.start_lng);
            const attractionLat = parseFloat(attraction.latitude);
            const attractionLng = parseFloat(attraction.longitude);
            if (!isNaN(startLat) && !isNaN(startLng) && !isNaN(attractionLat) && !isNaN(attractionLng)) {
                const distance = require('../utils/distance').calculateDistance(startLat, startLng, attractionLat, attractionLng);
                // Use same fallback as buildTimeline (3 minutes per km)
                travelMinutes = Math.max(1, Math.ceil(distance * 3));
            }
        } else if (previousItem && previousItem.day_number === item.day_number) {
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
        const route = await itineraryPlanner.generateRoute(
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

        // Apply new start time if provided
        if (action.newStartTime) {
            // Use parseTime to handle "HH:MM" time strings reliably
            item.visit_start_time = parseTime(action.newStartTime);
        }
        // Apply new duration if provided
        if (action.newDuration !== undefined && !isNaN(action.newDuration)) {
            item.duration_minutes = action.newDuration;
        }
        // Recalculate end time based on (possibly new) start and duration
        item.visit_end_time = new Date(item.visit_start_time.getTime() + item.duration_minutes * 60000);
    }

    else if (action.type === 'add') {
        // Expect action.suggestion to contain attraction details (id, name, duration_minutes, cost, latitude, longitude)
        const suggestion = action.suggestion;
        if (!suggestion || !suggestion.attraction_id) {
            throw { statusCode: 400, message: 'Invalid suggestion data for add action' };
        }

        if (lockedItems.includes(suggestion.attraction_id)) {
            throw { statusCode: 400, message: 'Cannot add a locked attraction' };
        }

        const newCode = `new:${suggestion.attraction_id}:${Date.now()}`;
        const targetDay = action.targetDay || suggestion.targetDay || 1;
        const proposedStart = action.proposedStart || suggestion.proposedStart || null;

        const newItem = {
            item_code: newCode,
            attraction_id: suggestion.attraction_id,
            attraction_name: suggestion.name || suggestion.attraction_name || '',
            latitude: suggestion.latitude || suggestion.lat || 0,
            longitude: suggestion.longitude || suggestion.lng || 0,
            duration_minutes: suggestion.duration_minutes || suggestion.duration || 60,
            cost: suggestion.cost || 0,
            base_score: suggestion.base_score || 0,
            day_number: targetDay,
            visit_start_time: proposedStart ? new Date(proposedStart) : formatTime(new Date()),
            visit_end_time: proposedStart ? new Date(new Date(proposedStart).getTime() + (suggestion.duration_minutes || suggestion.duration || 60) * 60000) : formatTime(new Date()),
            // mark as not locked
            locked: false
        };

        updated.push(newItem);
    }

    return updated;
}

async function buildTimeline(itinerary, tripConfig, lockedItems, action = null) {
    const { trip, schedule, experiences, systemConfig, tripDays, maxCost } = tripConfig;

    // 1. Save original times for locked items
    const lockedOriginalTimes = new Map();
    for (const item of (itinerary || [])) {
        if (lockedItems.includes(item.item_code)) {
            lockedOriginalTimes.set(item.item_code, {
                start: item.visit_start_time,
                end: item.visit_end_time
            });
        }
    }

    let updated = JSON.parse(JSON.stringify(itinerary || []));

    const dayStartTime = parseTime(schedule.day_start_time);
    const dayEndTime = parseTime(schedule.day_end_time);
    const startLocation = { lat: Number(trip.start_lat), lng: Number(trip.start_lng) };
    const calculateDistance = require('../utils/distance').calculateDistance;

    function estimateTravelTime(distanceKm) {
        if (distanceKm < 3) return Math.max(1, Math.ceil(distanceKm * 2));
        if (distanceKm < 10) return Math.max(2, Math.ceil(distanceKm * 2.5));
        return null;
    }

    for (let day = 1; day <= tripDays; day++) {
        // Get items for the day, keep original order for manual reorder/edit actions
        let dayItems = updated.filter(i => Number(i.day_number) === Number(day));
        // Keep original order for manual edits/moves/reorders
        const keepOrder = action && (action.type === 'editTime' || action.type === 'move' || action.type === 'reorder');
        if (!keepOrder) {
            dayItems = dayItems.sort((a, b) => new Date(a.visit_start_time) - new Date(b.visit_start_time));
        }
        if (dayItems.length === 0) continue;

        let currentTime = new Date(dayStartTime);
        let prevLatLng = null;
        const dayStartPoint = (day === 1) ? startLocation : null;

        // Determine if this day contains the edited item
        let editedIndex = -1;
        let editingThisDay = false;
        if (action && action.type === 'editTime') {
            editedIndex = dayItems.findIndex(i => i.item_code === action.itemCode);
            if (editedIndex !== -1) editingThisDay = true;
        }

        for (let i = 0; i < dayItems.length; i++) {
            const item = dayItems[i];
            if (lockedItems.includes(item.item_code)) {
                // Keep original times, update currentTime to its end
                currentTime = new Date(item.visit_end_time);
                prevLatLng = { lat: Number(item.latitude), lng: Number(item.longitude) };
                continue;
            }

            const itemLatLng = { lat: Number(item.latitude), lng: Number(item.longitude) };

            // If this is the edited item, preserve its manually set start time
            if (editingThisDay && i === editedIndex) {
                currentTime = new Date(item.visit_end_time);
                prevLatLng = itemLatLng;
                continue;
            }

            if (i === 0 && dayStartPoint) {
                const distance = calculateDistance(dayStartPoint.lat, dayStartPoint.lng, Number(item.latitude), Number(item.longitude));
                let travel = estimateTravelTime(distance);
                if (travel === null) travel = await orsService.getTravelTime(dayStartPoint, itemLatLng);
                item.travel_minutes = travel;
                item.distance_from_previous = distance;
                item.visit_start_time = new Date(currentTime.getTime() + travel * 60000);
            } else if (i === 0 && !dayStartPoint) {
                item.travel_minutes = 0;
                item.distance_from_previous = 0;
                item.visit_start_time = new Date(currentTime);
            } else if (prevLatLng) {
                const distance = calculateDistance(prevLatLng.lat, prevLatLng.lng, Number(item.latitude), Number(item.longitude));
                let travel = estimateTravelTime(distance);
                if (travel === null) travel = await orsService.getTravelTime(prevLatLng, itemLatLng);
                item.travel_minutes = travel;
                item.distance_from_previous = distance;
                item.visit_start_time = new Date(currentTime.getTime() + travel * 60000);
            }

            item.visit_end_time = new Date(item.visit_start_time.getTime() + item.duration_minutes * 60000);
            currentTime = new Date(item.visit_end_time);
            prevLatLng = itemLatLng;
        }

        if (currentTime > dayEndTime) {
            throw { statusCode: 400, message: `Day ${day} exceeds end time` };
        }
    }

    // 2. Restore original times for locked items (preserve exact original Date objects)
    for (const item of updated) {
        const original = lockedOriginalTimes.get(item.item_code);
        if (original) {
            item.visit_start_time = original.start;
            item.visit_end_time = original.end;
        }
    }

    // 3. Convert all time fields back to Date objects (safe for JSON)
    updated = (updated || []).map(item => ({
        ...item,
        visit_start_time: new Date(item.visit_start_time),
        visit_end_time: new Date(item.visit_end_time)
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
                start: dayStart,
                end: firstStart,
                minutes: gapBefore
            });
        }

        // Gaps between items
        for (let i = 0; i < dayItems.length - 1; i++) {
            const gap = (new Date(dayItems[i + 1].visit_start_time) - new Date(dayItems[i].visit_end_time)) / 60000;
            if (gap > 30) {
                freeTimeGaps.push({
                    day,
                    start: new Date(dayItems[i].visit_end_time),
                    end: new Date(dayItems[i + 1].visit_start_time),
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
                start: lastEnd,
                end: dayEnd,
                minutes: gapAfter
            });
        }
    }
    return freeTimeGaps;
}

function generateSuggestions(freeTimeGaps, attractions, usedIds, budgetRemaining, tripStartLocation = null, currentDayAttractions = [], experiences = []) {
    const suggestions = [];
    const remainingAttractions = attractions.filter(a => !usedIds.includes(a.attraction_id));

    for (const gap of freeTimeGaps) {
        if (gap.minutes < 30) continue;

        const gapDuration = gap.minutes;
        const proposedStartDate = new Date(gap.start.getTime() + (gap.minutes / 2) * 60000); // middle of gap

        // Filter attractions that fit in the gap and budget
        let feasible = remainingAttractions.filter(a => a.duration_minutes <= gapDuration && a.cost <= budgetRemaining);

        // If we have location info, compute distance and score including experience score
        if (tripStartLocation && currentDayAttractions && currentDayAttractions.length >= 0) {
            // Find the attraction before the gap (if any)
            const prevAttraction = (currentDayAttractions || []).find(att => att.visit_end_time === gap.start);
            const prevLocation = prevAttraction
                ? { lat: Number(prevAttraction.latitude), lng: Number(prevAttraction.longitude) }
                : tripStartLocation;

            feasible = feasible.map(attr => {
                const distance = require('../utils/distance').calculateDistance(
                    prevLocation.lat, prevLocation.lng,
                    Number(attr.latitude), Number(attr.longitude)
                );

                // Experience score at proposed time
                const attractionExperiences = experiences.filter(e => e.attraction_id === attr.attraction_id);
                const experienceScore = scoringService.computeExperienceScore(attractionExperiences, proposedStartDate);

                // Composite score: base_preference (40%) + experience (30%) + distance (20%) + cost (10%)
                const compositeScore = (attr.base_score * 0.4)
                    + (experienceScore * 0.3)
                    + (1 / (distance + 1)) * 0.2
                    + (1 / (Number(attr.cost || 0) + 1)) * 0.1;

                return { ...attr, distance, experienceScore, score: compositeScore };
            }).sort((a, b) => b.score - a.score).slice(0, 3);
        } else {
            feasible = feasible.sort((a, b) => b.base_score - a.base_score).slice(0, 3);
        }

        if (!feasible || feasible.length === 0) continue;

        suggestions.push({
            gapIndex: freeTimeGaps.indexOf(gap),
            gap,
            options: feasible.map(attr => ({
                attraction_id: attr.attraction_id,
                name: attr.attraction_name,
                duration: attr.duration_minutes,
                cost: attr.cost,
                latitude: attr.latitude,
                longitude: attr.longitude,
                distance: attr.distance || null,
                experienceScore: attr.experienceScore || 0,
                compositeScore: attr.score,
                proposedStart: formatTime(proposedStartDate)
            }))
        });
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

        // Normalise currentItinerary: convert time strings to Date objects (using parseTime)
        // This ensures that JSON serialisation later produces ISO strings, not plain "HH:MM"
        const normalisedItinerary = (currentItinerary || []).map(item => {
            const copy = { ...item };
            if (typeof copy.visit_start_time === 'string') {
                copy.visit_start_time = parseTime(copy.visit_start_time);
            }
            if (typeof copy.visit_end_time === 'string') {
                copy.visit_end_time = parseTime(copy.visit_end_time);
            }
            return copy;
        });

        // Compute original free time gaps (from the current itinerary before any modification)
        const originalFreeTime = detectFreeTime(normalisedItinerary, dayStartTime, dayEndTime, tripDays);

        let updated = applyAction(normalisedItinerary, action, lockedItems, tripDays);

        updated = await buildTimeline(updated, tripConfig, lockedItems, action);

        const freeTime = detectFreeTime(updated, dayStartTime, dayEndTime, tripDays);

        // Create a Set of original gap signatures (day + start time + end time + minutes)
        const originalGapKeys = new Set(originalFreeTime.map(g => {
            return `${g.day}|${formatTime(g.start)}|${formatTime(g.end)}|${g.minutes}`;
        }));

        // Filter freeTime to only gaps that did NOT exist before the action
        const trulyNewGaps = freeTime.filter(gap => {
            const key = `${gap.day}|${formatTime(gap.start)}|${formatTime(gap.end)}|${gap.minutes}`;
            return !originalGapKeys.has(key);
        });

        // Determine which days were affected by the action
        let affectedDays = new Set();

        if (action && (action.type === 'move' || action.type === 'reorder')) {
            const originalItem = normalisedItinerary.find(i => i.item_code === action.itemCode);
            if (originalItem) affectedDays.add(Number(originalItem.day_number));
            if (action.newDay) affectedDays.add(Number(action.newDay));
            else if (originalItem) affectedDays.add(Number(originalItem.day_number));
        } else if (action && action.type === 'delete') {
            const originalItem = normalisedItinerary.find(i => i.item_code === action.itemCode);
            if (originalItem) affectedDays.add(Number(originalItem.day_number));
        } else if (action && action.type === 'editTime') {
            const originalItem = normalisedItinerary.find(i => i.item_code === action.itemCode);
            if (originalItem) affectedDays.add(Number(originalItem.day_number));
        } else if (action && action.type === 'add') {
            if (action.targetDay) affectedDays.add(Number(action.targetDay));
        }

        // If no affected days could be determined, fallback to all days
        if (affectedDays.size === 0) {
            for (let d = 1; d <= tripDays; d++) affectedDays.add(d);
        }

        const filteredFreeTime = trulyNewGaps.filter(gap => affectedDays.has(Number(gap.day)));

        const usedIds = updated.map(i => i.attraction_id);
        const totalCost = updated.reduce((sum, i) => sum + Number(i.cost || 0), 0);
        const budgetRemaining = trip.budget - totalCost;

        // Provide trip start location and current day's attractions to the generator
        const tripStartLocation = { lat: Number(trip.start_lat), lng: Number(trip.start_lng) };
        const currentDayAttractionsForRanking = (trulyNewGaps && trulyNewGaps.length)
            ? updated.filter(i => Number(i.day_number) === Number(trulyNewGaps[0].day))
            : [];

        const suggestions = generateSuggestions(filteredFreeTime, attractions, usedIds, budgetRemaining, tripStartLocation, currentDayAttractionsForRanking, experiences);

        const validation = validateItinerary(updated, trip, tripDays);

        // Format times for the response (keep Date objects internally)
        const formattedItinerary = updated.map(item => ({
            ...item,
            visit_start_time: formatTime(item.visit_start_time),
            visit_end_time: formatTime(item.visit_end_time)
        }));

        const formattedFreeTime = filteredFreeTime.map(g => ({
            ...g,
            start: formatTime(g.start),
            end: formatTime(g.end)
        }));

        return {
            isValid: validation.isValid,
            errors: validation.errors,
            recalculatedItinerary: formattedItinerary,
            freeTimeGaps: formattedFreeTime,
            suggestions,
            totals: calculateTotals(formattedItinerary)
        };
    } catch (error) {
        console.error("RECALCULATE ERROR:", error);
        throw { statusCode: error.statusCode || 500, message: error.message || 'Recalculation failed' };
    }
};
