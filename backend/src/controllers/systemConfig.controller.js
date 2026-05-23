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

exports.getMetrics = async (req, res) => {
    try {
        const svc = require('../services/systemConfig.service');
        const data = await svc.getDashboardMetrics();
        return sendResponse(res, { data });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to fetch metrics'
        });
    }
};

exports.getTripsOverTime = async (req, res) => {
    try {
        const svc = require('../services/systemConfig.service');
        const data = await svc.getTripsOverTime(req.query.period || 'daily');
        return sendResponse(res, { data });
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: err.status ?? false, statusCode: err.statusCode ?? 500, message: err.message ?? 'Failed' });
    }
};

exports.getVisitsByCategory = async (req, res) => {
    try {
        const svc = require('../services/systemConfig.service');
        const data = await svc.getVisitsByCategory();
        return sendResponse(res, { data });
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: err.status ?? false, statusCode: err.statusCode ?? 500, message: err.message ?? 'Failed' });
    }
};

exports.getTopAttractions = async (req, res) => {
    try {
        const svc = require('../services/systemConfig.service');
        const limit = Number(req.query.limit) || 10;
        const data = await svc.getTopAttractions(limit);
        return sendResponse(res, { data });
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: err.status ?? false, statusCode: err.statusCode ?? 500, message: err.message ?? 'Failed' });
    }
};

exports.getExperienceUsage = async (req, res) => {
    try {
        const svc = require('../services/systemConfig.service');
        const data = await svc.getExperienceUsage();
        return sendResponse(res, { data });
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: err.status ?? false, statusCode: err.statusCode ?? 500, message: err.message ?? 'Failed' });
    }
};