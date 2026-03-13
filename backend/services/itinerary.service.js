const tripRepo = require('../repositories/trip.repository');
const attractionRepo = require('../repositories/attraction.repository');
const experienceRepo = require('../repositories/experience.repository');

exports.generateItinerary = async (tripCode) => {
    const trip = await tripRepo.findByCode(tripCode);

    if (!trip) {
        throw { statusCode: 404, message: "Trip not found" };
    }

    const preferences = trip.tbl_trip_preference;

    const attractions = await attractionRepo.findAll();
}