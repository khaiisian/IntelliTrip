const configService = require('../services/systemConfig.service');
const sendResponse = require('../utils/apiResponse');

exports.getConfigs = async (req, res) => {
    try {
        const data = await configService.getConfigs();
        return sendResponse(res, {
            data,
            message: "Successfully fetched system configs."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to fetch system configs."
        });
    }
};

exports.getConfigById = async (req, res) => {
    try {
        const data = await configService.getConfigById(req.params.id);
        return sendResponse(res, {
            data,
            message: "Successfully fetched system config."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to fetch system config."
        });
    }
};

exports.createConfig = async (req, res) => {
    try {
        const data = await configService.createConfig(req.body);
        return sendResponse(res, {
            statusCode: 201,
            data,
            message: "System config created successfully."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to create system config."
        });
    }
};

exports.updateConfig = async (req, res) => {
    try {
        const data = await configService.updateConfig(req.params.id, req.body);
        return sendResponse(res, {
            data,
            message: "System config updated successfully."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to update system config."
        });
    }
};

exports.deleteConfig = async (req, res) => {
    try {
        const data = await configService.deleteConfig(req.params.id);
        return sendResponse(res, {
            data,
            message: "System config deleted successfully."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to delete system config."
        });
    }
};