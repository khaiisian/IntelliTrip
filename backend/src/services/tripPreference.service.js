const prefRepo = require('../repositories/tripPreference.repository');
const PreferenceResponse = require('../models/tripPreference/tripPreference.response');
const { CreatePreferenceRequest, UpdatePreferenceRequest } = require('../models/tripPreference/tripPreference.request');
const generateCode = require('../utils/generateCode');

exports.getPreferencesByTrip = async (tripId) => {

    const prefs = await prefRepo.findByTrip(tripId);

    return prefs.map(x => new PreferenceResponse(x));
};

exports.getPreferenceByCode = async (code) => {

    const pref = await prefRepo.findByCode(code);

    if (!pref)
        throw { statusCode: 404, message: "Preference not found" };

    return new PreferenceResponse(pref);
};

exports.createPreference = async (payload) => {

    const request = new CreatePreferenceRequest(payload);

    if (!request.trip_id)
        throw { statusCode: 400, message: "Trip is required" };

    if (!request.category_id)
        throw { statusCode: 400, message: "Category is required" };

    if (request.preference_weight < 0)
        throw { statusCode: 400, message: "Weight cannot be negative" };

    request.trip_pref_code = await generateCode(
        'tbl_trip_preference',
        'trip_pref_code',
        'TPREF'
    );

    const pref = await prefRepo.create(request);

    return new PreferenceResponse(pref);
};

exports.updatePreference = async (code, payload) => {

    const existing = await prefRepo.findByCode(code);

    if (!existing)
        throw { statusCode: 404, message: "Preference not found" };

    const request = new UpdatePreferenceRequest(payload);

    if (request.preference_weight !== undefined && request.preference_weight < 0)
        throw { statusCode: 400, message: "Invalid preference weight" };

    const pref = await prefRepo.update(code, request);

    return new PreferenceResponse(pref);
};

exports.deletePreference = async (code) => {

    const existing = await prefRepo.findByCode(code);

    if (!existing)
        throw { statusCode: 404, message: "Preference not found" };

    const pref = await prefRepo.remove(code);

    return new PreferenceResponse(pref);
};