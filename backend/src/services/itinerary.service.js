// itinerary.service.js

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
        // 1. Load all required data
        const trip = await tripRepo.findByCode(tripCode);
        const preferences = await tripRepo.getTripPreferences(trip?.trip_id);
        const schedule = await tripRepo.getTripSchedule(trip?.trip_id);
        const attractions = await attractionRepo.findAll();
        const experiences = await experienceRepo.getAllExperiences();
        const systemConfig = await systemConfigRepo.getSystemConfig();

        // 2. Validate data
        validateData(trip, preferences, schedule, attractions, experiences, systemConfig);

        // 3. Calculate trip days
        const tripDays = scoringService.calculateTripDays(
            trip.start_date,
            trip.end_date
        );
        console.log(`Trip duration: ${tripDays} days`);

        // 4. Score attractions for all time slots
        const scoredAttractions = scoringService.calculateAttractionScores(
            attractions,
            experiences,
            preferences
        );
        console.log(`Scored ${scoredAttractions.length} attraction-time combinations`);

        // 5. Rank attractions by score
        const rankedAttractions = scoringService.rankAttractions(scoredAttractions);

        // 6. Filter by budget
        const selectedAttractions = scoringService.filterByBudget(
            rankedAttractions,
            trip.budget
        );
        console.log(`Selected ${selectedAttractions.length} attractions within budget`);

        if (selectedAttractions.length === 0) {
            throw { statusCode: 400, message: "No attractions fit within budget" };
        }

        // 7. Optimize route (combines score and distance)
        const route = routingService.nearestNeighborRoute(
            {
                lat: trip.start_lat,
                lng: trip.start_lng
            },
            selectedAttractions,
            { scoreWeight: 0.6 } // 60% score, 40% distance
        );
        console.log(`Created route with ${route.length} stops`);

        // 8. Schedule the route
        const scheduledItems = schedulingService.scheduleRoute(
            route,
            schedule,
            systemConfig,
            tripDays,
            trip.start_date
        );
        console.log(`Scheduled ${scheduledItems.length} items`);

        if (scheduledItems.length === 0) {
            throw { statusCode: 400, message: "Could not schedule any attractions" };
        }

        // 9. Calculate totals
        const totals = calculateTotals(scheduledItems);

        // 10. Save to database (uncomment when repositories ready)
        /*
        const itinerary = await itineraryRepo.create({
            trip_id: trip.trip_id,
            total_cost: totals.totalCost,
            total_distance: totals.totalDistance,
            total_travel_time: totals.totalTravelTime,
            total_visit_time: totals.totalVisitTime
        });

        for (const item of scheduledItems) {
            await itineraryItemRepo.create({
                itinerary_id: itinerary.itinerary_id,
                day_number: item.day_number,
                attraction_id: item.attraction_id,
                visit_start_time: item.visit_start_time,
                visit_end_time: item.visit_end_time,
                distance_from_previous: item.distance_from_previous,
                final_score: item.final_score
            });
        }
        */

        // 11. Return comprehensive result
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
            // Group by day for easier frontend consumption
            byDay: scheduledItems.reduce((acc, item) => {
                if (!acc[item.day_number]) acc[item.day_number] = [];
                acc[item.day_number].push(item);
                return acc;
            }, {})
        };

        // return {
        //     scheduledItems
        // }

    } catch (error) {
        console.error('Error generating itinerary:', error);

        // Re-throw with proper status code
        if (error.statusCode) {
            throw error;
        }
        throw {
            statusCode: 500,
            message: error.message || 'Failed to generate itinerary'
        };
    }
};