const tripRepo = require('../repositories/trip.repository');
const categoryRepo = require('../repositories/category.repository');
const TripResponse = require('../models/trips/trip.response');
const { CreateTripRequest, UpdateTripRequest } = require('../models/trips/trip.request');
const generateCode = require('../utils/generateCode');
const {
    parsePreferences,
    createNeutralPreferences
} = require('./preferenceParser.service');
const { parseFullTrip: parseFullTripWithAi } = require('./aiTripParser.service');

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

const clampWeight = (value) => {
    const weight = Number(value);
    if (Number.isNaN(weight))
        return 0.5;

    return Math.min(1, Math.max(0, weight));
};

const normalizeOption = (value, allowedValues) => {
    return allowedValues.includes(value) ? value : 'none';
};

const normalizeOptionWithDefault = (value, allowedValues, defaultValue) => {
    return allowedValues.includes(value) ? value : defaultValue;
};

const normalizeDate = (value) => {
    if (!value)
        return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return null;

    return date.toISOString().slice(0, 10);
};

const normalizeBudget = (value) => {
    const budget = Number(value);
    return budget > 0 ? budget : null;
};

const normalizeTime = (value, defaultValue) => {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? '') ? value : defaultValue;
};

exports.parseUserPreferences = async (tripCode, userInput) => {
    if (!userInput?.trim())
        throw { statusCode: 400, message: 'userInput is required' };

    const trip = await tripRepo.findByCode(tripCode);
    if (!trip)
        throw { statusCode: 404, message: 'Trip not found' };

    const categories = await categoryRepo.findAll();
    if (!categories.length)
        throw { statusCode: 400, message: 'No categories found to parse preferences against' };

    let parsed;
    let usedFallback = false;
    let parserError = null;

    try {
        parsed = await parsePreferences(userInput.trim(), categories);
    } catch (err) {
        console.error('Preference parsing fallback:', err);
        parsed = createNeutralPreferences(categories);
        usedFallback = true;
        parserError = err.message;
    }

    const categoryWeights = parsed?.category_weights ?? {};
    const validatedWeights = {};

    for (const category of categories) {
        const categoryId = String(category.category_id);
        validatedWeights[categoryId] = clampWeight(categoryWeights[categoryId]);
    }

    await tripRepo.deleteTripPreferences(trip.trip_id);

    for (const [categoryId, weight] of Object.entries(validatedWeights)) {
        const tripPrefCode = await generateCode(
            'tbl_trip_preference',
            'trip_pref_code',
            'TPREF'
        );

        await tripRepo.createTripPreference({
            trip_pref_code: tripPrefCode,
            trip_id: trip.trip_id,
            category_id: Number(categoryId),
            preference_weight: weight
        });
    }

    return {
        success: true,
        parsed: {
            category_weights: validatedWeights,
            time_preference: normalizeOption(
                parsed?.time_preference,
                ['morning', 'afternoon', 'evening', 'none']
            ),
            budget_flexibility: normalizeOption(
                parsed?.budget_flexibility,
                ['low', 'medium', 'high', 'none']
            )
        },
        weights: validatedWeights,
        usedFallback,
        parserError
    };
};

exports.parseFullTrip = async (userInput) => {
    if (!userInput?.trim())
        throw { statusCode: 400, message: 'userInput is required' };

    const categories = await categoryRepo.findAll();
    if (!categories.length)
        throw { statusCode: 400, message: 'No categories found' };

    let parsed;
    try {
        parsed = await parseFullTripWithAi(userInput.trim(), categories);
    } catch (err) {
        console.error('AI full trip parse error:', err);
        throw { statusCode: 500, message: 'AI parsing failed' };
    }

    const startDate = normalizeDate(parsed.trip?.start_date);
    const endDate = normalizeDate(parsed.trip?.end_date);
    const hasValidDateRange = startDate && endDate && new Date(startDate) <= new Date(endDate);

    const result = {
        trip: {
            trip_name: parsed.trip?.trip_name?.trim().substring(0, 50) || null,
            start_date: hasValidDateRange ? startDate : null,
            end_date: hasValidDateRange ? endDate : null,
            budget: normalizeBudget(parsed.trip?.budget),
            start_location_name: parsed.trip?.start_location_name || null,
            end_location_name: parsed.trip?.end_location_name || null
        },
        schedule: {
            day_start_time: normalizeTime(parsed.schedule?.day_start_time, '09:00'),
            day_end_time: normalizeTime(parsed.schedule?.day_end_time, '17:00')
        },
        preferences: {
            category_weights: {},
            travel_pace: normalizeOptionWithDefault(
                parsed.preferences?.travel_pace,
                ['relaxed', 'moderate', 'packed'],
                'moderate'
            ),
            budget_style: normalizeOptionWithDefault(
                parsed.preferences?.budget_style,
                ['budget', 'mid-range', 'luxury'],
                'mid-range'
            ),
            time_preference: normalizeOption(
                parsed.preferences?.time_preference,
                ['morning', 'afternoon', 'evening', 'none']
            )
        }
    };

    for (const category of categories) {
        const categoryId = String(category.category_id);
        result.preferences.category_weights[categoryId] = clampWeight(
            parsed.preferences?.category_weights?.[categoryId]
        );
    }

    return result;
};
