const itineraryService = require('../services/itinerary.service');
const sendResponse = require('../src/utils/apiResponse');

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