const attractionService = require('../services/attraction.service');
const sendResponse = require('../src/utils/apiResponse');

exports.getAttractions = async (req, res) => {
    try {
        const data = await attractionService.getAttractions();
        return sendResponse(res, { data });
    } catch (err) {
        console.error(err)
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to fetch attractions'
        });
    }
};

exports.getAttractionByCode = async (req, res) => {
    try {
        const data = await attractionService.getAttractionByCode(req.params.code);
        return sendResponse(res, { data });
    } catch (err) {
        console.error(err)
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to fetch attraction'
        });
    }
};

exports.createAttraction = async (req, res) => {
    try {
        const data = await attractionService.createAttraction(req.body);
        return sendResponse(res, {
            statusCode: 201,
            data,
            message: 'Attraction created successfully'
        });
    } catch (err) {
        console.error(err)
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to create attraction'
        });
    }
};

exports.updateAttraction = async (req, res) => {
    try {
        const data = await attractionService.updateAttraction(
            req.params.code,
            req.body
        );
        return sendResponse(res, {
            data,
            message: 'Attraction updated successfully'
        });
    } catch (err) {
        console.error(err)
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to update attraction'
        });
    }
};

exports.deleteAttraction = async (req, res) => {
    try {
        const data = await attractionService.deleteAttraction(req.params.code);
        return sendResponse(res, {
            data,
            message: 'Attraction deleted successfully'
        });
    } catch (err) {
        console.error(err)
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to delete attraction'
        });
    }
};
