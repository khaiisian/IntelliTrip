const tripRepo = require('../repositories/trip.repository');
const attractionRepo = require('../repositories/attraction.repository');
const experienceRepo = require('../repositories/attractionExperience.repository');
const systemConfigRepo = require('../repositories/systemConfig.repository')

exports.generateItinerary = async (tripCode) => {
    const trip = await tripRepo.findByCode(tripCode);

    if (!trip)
        throw { statusCode: 404, message: "Trip not found" };

    const preferences = await tripRepo.getTripPreferences(trip.trip_id);

    const schedules = await tripRepo.getTripSchedule(trip.trip_id);

    const attractions = await attractionRepo.findAll();

    const experiences = await experienceRepo.getAllExperiences();

    const systemConfig = await systemConfigRepo.getSystemConfig();

    return {
        trip,
        preferences,
        schedules,
        attractions,
        experiences,
        systemConfig
    }
}