const tripService = require('../services/trip.service');
const sendResponse = require('../utils/apiResponse');

exports.getTripsByUser = async (req, res) => {
    try {
        const data = await tripService.getTripsByUser(req.params.userId);
        return sendResponse(res, { data });
    } catch (err) {
        return sendResponse(res, err);
    }
};

exports.getTripByCode = async (req, res) => {
    try {
        const data = await tripService.getTripByCode(req.params.code);
        return sendResponse(res, { data });
    } catch (err) {
        return sendResponse(res, err);
    }
};

exports.createTrip = async (req, res) => {
    try {
        const data = await tripService.createTrip(req.body);
        return sendResponse(res, {
            statusCode: 201,
            data,
            message: 'Trip created successfully'
        });
    } catch (err) {
        return sendResponse(res, err);
    }
};

exports.updateTrip = async (req, res) => {
    try {
        const data = await tripService.updateTrip(req.params.code, req.body);
        return sendResponse(res, { data });
    } catch (err) {
        return sendResponse(res, err);
    }
};

exports.deleteTrip = async (req, res) => {
    try {
        const data = await tripService.deleteTrip(req.params.code);
        return sendResponse(res, { data });
    } catch (err) {
        return sendResponse(res, err);
    }
};

exports.parseUserPreferences = async (req, res) => {
    try {
        const data = await tripService.parseUserPreferences(req.params.code, req.body.userInput);
        return sendResponse(res, {
            data,
            message: data.usedFallback
                ? 'Preferences saved with neutral fallback weights'
                : 'Preferences parsed and saved'
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to parse preferences'
        });
    }
};

exports.parseFullTrip = async (req, res) => {
    try {
        const data = await tripService.parseFullTrip(req.body.userInput);
        return sendResponse(res, {
            data,
            message: 'Full trip details parsed successfully'
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to parse full trip'
        });
    }
};
