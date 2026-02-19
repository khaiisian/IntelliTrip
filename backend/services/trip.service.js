const tripRepo = require('../repositories/trip.repository');
const TripResponse = require('../models/trips/trip.response');
const { CreateTripRequest, UpdateTripRequest } = require('../models/trips/trip.request');
const generateCode = require('../src/utils/generateCode');

exports.getTripsByUser = async (userId) => {
    const trips = await tripRepo.findAllByUser(userId);
    return trips.map(x => new TripResponse(x));
};

exports.getTripByCode = async (code) => {
    const trip = await tripRepo.findByCode(code);
    if (!trip)
        throw { status: false, statusCode: 404, message: 'Trip not found' };

    return new TripResponse(trip);
};

exports.createTrip = async (payload) => {
    const request = new CreateTripRequest(payload);

    request.start_date = new Date(request.start_date);
    request.end_date = new Date(request.end_date);

    request.trip_name = request.trip_name?.trim();
    if (!request.trip_name)
        throw { statusCode: 400, message: 'Trip name is required' };

    if (!request.user_id)
        throw { statusCode: 400, message: 'User is required' };

    if (request.start_lat < -90 || request.start_lat > 90 ||
        request.end_lat < -90 || request.end_lat > 90)
        throw { statusCode: 400, message: 'Invalid latitude' };

    if (request.start_lng < -180 || request.start_lng > 180 ||
        request.end_lng < -180 || request.end_lng > 180)
        throw { statusCode: 400, message: 'Invalid longitude' };

    if (request.budget < 0)
        throw { statusCode: 400, message: 'Budget cannot be negative' };

    if (new Date(request.start_date) >= new Date(request.end_date))
        throw { statusCode: 400, message: 'Start date must be before end date' };

    request.trip_code = await generateCode(
        'tbl_trip',
        'trip_code',
        'TRIP'
    );

    const trip = await tripRepo.create(request);
    return new TripResponse(trip);
};

exports.updateTrip = async (code, payload) => {
    const existing = await tripRepo.findByCode(code);
    if (!existing)
        throw { statusCode: 404, message: 'Trip not found' };

    const request = new UpdateTripRequest(payload);

    if (request.trip_name !== undefined) {
        request.trip_name = request.trip_name.trim();
        if (!request.trip_name)
            throw { statusCode: 400, message: 'Invalid trip name' };
    }

    if (request.budget !== undefined && request.budget < 0)
        throw { statusCode: 400, message: 'Budget cannot be negative' };

    if (request.start_date && request.end_date &&
        new Date(request.start_date) >= new Date(request.end_date))
        throw { statusCode: 400, message: 'Invalid date range' };

    const trip = await tripRepo.update(code, request);
    return new TripResponse(trip);
};

exports.deleteTrip = async (code) => {
    const existing = await tripRepo.findByCode(code);
    if (!existing)
        throw { statusCode: 404, message: 'Trip not found' };

    const trip = await tripRepo.remove(code);
    return new TripResponse(trip);
};
