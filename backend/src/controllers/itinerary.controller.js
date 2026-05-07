const itineraryService = require('../services/itinerary.service');
const sendResponse = require('../utils/apiResponse');

exports.generateItinerary = async (req, res) => {
    try {
        const data = await itineraryService.generateItinerary(req.params.code);

        return sendResponse(res, {
            data,
            message: "Itinerary generated successfully"
        });
    } catch (err) {
        return sendResponse(res, err);
    }
};

exports.getSavedItinerary = async (req, res) => {
    try {
        const data = await itineraryService.getSavedItinerary(req.params.code);

        return sendResponse(res, {
            data,
            message: "Itinerary retrieved successfully"
        });
    } catch (err) {
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to retrieve itinerary'
        });
    }
};

exports.getItinerariesByUserCode = async (req, res) => {
    try {
        const data = await itineraryService.getItinerariesByUserCode(req.params.code);
        return sendResponse(res, { data });
    } catch (err) {
        return sendResponse(res, err);
    }
};

exports.saveItinerary = async (req, res) => {
    try {
        const data = await itineraryService.saveItinerary(req.params.code, req.body);

        return sendResponse(res, {
            statusCode: 201,
            data,
            message: "Itinerary saved successfully"
        });
    } catch (err) {
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to save itinerary'
        });
    }
};