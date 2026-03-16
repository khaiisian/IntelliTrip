const tripRepo = require('../repositories/trip.repository');
const attractionRepo = require('../repositories/attraction.repository');
const experienceRepo = require('../repositories/attractionExperience.repository');
const systemConfigRepo = require('../repositories/systemConfig.repository')
const scoringService = require('../services/scoring.service')

exports.generateItinerary = async (tripCode) => {
    const trip = await tripRepo.findByCode(tripCode);

    if (!trip)
        throw { statusCode: 404, message: "Trip not found" };

    const preferences = await tripRepo.getTripPreferences(trip.trip_id);

    const schedules = await tripRepo.getTripSchedule(trip.trip_id);

    const attractions = await attractionRepo.findAll();

    const experiences = await experienceRepo.getAllExperiences();

    const systemConfig = await systemConfigRepo.getSystemConfig();

    const tripDays = scoringService.calculateTripDays(
        trip.start_date,
        trip.end_date
    );

    const scoredAttractions =
        scoringService.calculateAttractionScores(
            attractions,
            experiences,
            preferences
        );

    const rankedAttractions =
        scoringService.rankAttractions(scoredAttractions);

    const selectedAttractions =
        scoringService.filterByBudget(
            rankedAttractions,
            trip.budget
        );

    return {
        selectedAttractions
    }
}