const prefService = require('../services/tripPreference.service');
const sendResponse = require('../utils/apiResponse');

exports.getPreferencesByTrip = async (req, res) => {
    try {
        const data = await prefService.getPreferencesByTrip(req.params.tripId);
        return sendResponse(res, {
            statusCode: 200,
            data,
            message: "Successfully fetched preferences for the trip."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to fetch trip preferences."
        });
    }
};

exports.getPreferenceByCode = async (req, res) => {
    try {
        const data = await prefService.getPreferenceByCode(req.params.code);
        return sendResponse(res, {
            statusCode: 200,
            data,
            message: "Successfully fetched preference."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to fetch preference."
        });
    }
};

exports.createPreference = async (req, res) => {
    try {
        const data = await prefService.createPreference(req.body);
        return sendResponse(res, {
            statusCode: 201,
            data,
            message: "Preference created successfully."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to create preference."
        });
    }
};

exports.updatePreference = async (req, res) => {
    try {
        const data = await prefService.updatePreference(req.params.code, req.body);
        return sendResponse(res, {
            statusCode: 200,
            data,
            message: "Preference updated successfully."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to update preference."
        });
    }
};

exports.deletePreference = async (req, res) => {
    try {
        const data = await prefService.deletePreference(req.params.code);
        return sendResponse(res, {
            statusCode: 200,
            data,
            message: "Preference deleted successfully."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to delete preference."
        });
    }
};