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

exports.saveItinerary = async (req, res) => {
    try {
        const { itineraryData } = req.body;
        const data = await itineraryService.saveItinerary(req.params.code, itineraryData);

        return sendResponse(res, {
            data,
            message: "Itinerary saved successfully"
        });
    } catch (err) {
        return sendResponse(res, err);
    }
};