const scheduleService = require('../services/tripSchedule.service');
const sendResponse = require('../utils/apiResponse');

exports.getSchedulesByTrip = async (req, res) => {
    try {
        const data = await scheduleService.getSchedulesByTrip(req.params.tripId);
        return sendResponse(res, { data });
    } catch (err) {
        return sendResponse(res, err);
    }
};

exports.getScheduleById = async (req, res) => {
    try {
        const data = await scheduleService.getScheduleById(req.params.id);
        return sendResponse(res, { data });
    } catch (err) {
        return sendResponse(res, err);
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const data = await scheduleService.createSchedule(req.body);
        return sendResponse(res, {
            statusCode: 201,
            data,
            message: "Schedule created successfully"
        });
    } catch (err) {
        return sendResponse(res, err);
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const data = await scheduleService.updateSchedule(req.params.id, req.body);
        return sendResponse(res, { data });
    } catch (err) {
        return sendResponse(res, err);
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const data = await scheduleService.deleteSchedule(req.params.id);
        return sendResponse(res, { data });
    } catch (err) {
        return sendResponse(res, err);
    }
};