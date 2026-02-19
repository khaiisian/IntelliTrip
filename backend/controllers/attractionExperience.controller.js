const expService = require('../services/attractionExperience.service');
const sendResponse = require('../src/utils/apiResponse');

// GET all experiences for an attraction
exports.getExperiencesByAttraction = async (req, res) => {
    try {
        const data = await expService.getExperiencesByAttraction(Number(req.params.id));
        return sendResponse(res, { data });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to fetch experiences'
        });
    }
};

// GET experience by experience_code
exports.getExperienceByCode = async (req, res) => {
    try {
        const data = await expService.getExperienceByCode(req.params.code);
        return sendResponse(res, { data });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to fetch experience'
        });
    }
};

// POST create
exports.createExperience = async (req, res) => {
    try {
        const data = await expService.createExperience(req.body);
        return sendResponse(res, { statusCode: 201, data, message: 'Experience created successfully' });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to create experience'
        });
    }
};

// PUT update
exports.updateExperience = async (req, res) => {
    try {
        const data = await expService.updateExperience(req.params.code, req.body);
        return sendResponse(res, { data, message: 'Experience updated successfully' });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to update experience'
        });
    }
};

// DELETE
exports.deleteExperience = async (req, res) => {
    try {
        const data = await expService.deleteExperience(req.params.code);
        return sendResponse(res, { data, message: 'Experience deleted successfully' });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to delete experience'
        });
    }
};
