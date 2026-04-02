// itinerary.service.js
const { parseTime, formatTime } = require('../utils/time');

const tripRepo = require('../repositories/trip.repository');
const attractionRepo = require('../repositories/attraction.repository');
const experienceRepo = require('../repositories/attractionExperience.repository');
const systemConfigRepo = require('../repositories/systemConfig.repository');
// const itineraryRepo = require('../repositories/itinerary.repository'); // Uncomment when ready
// const itineraryItemRepo = require('../repositories/itineraryItem.repository'); // Uncomment when ready

const scoringService = require('../services/scoring.service');
const schedulingService = require('../services/scheduling.service');
const routingService = require('../services/routing.service');

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
        totalVisitTime += 60; // You'd calculate from attraction duration
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

        // 4. Filter by budget (simple greedy) – this will later be integrated into routing for better decision
        const selectedAttractions = scoringService.filterByBudget(preparedAttractions, trip.budget);
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
        const route = routingService.nearestNeighborRoute(
            { lat: trip.start_lat, lng: trip.start_lng },
            selectedAttractions,
            startTime,
            dayStartTime,
            dayEndTime,
            tripDays,
            trip.budget,
            systemConfig
        );

        console.log(route)

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
            visit_start_time: formatTime(item.visit_start_time),
            visit_end_time: formatTime(item.visit_end_time),
            distance_from_previous: item.distance_from_previous,
            travel_minutes: item.travel_minutes,
            final_score: item.final_score,
            is_best_time: (item.final_score > item.base_score) // approximate
        }));

        // 8. Calculate totals
        const totals = calculateTotals(scheduledItems);

        // 9. Group by day for easier frontend consumption
        const byDay = scheduledItems.reduce((acc, item) => {
            if (!acc[item.day_number]) acc[item.day_number] = [];
            acc[item.day_number].push(item);
            return acc;
        }, {});

        // 10. Return
        return {
            success: true,
            trip,
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