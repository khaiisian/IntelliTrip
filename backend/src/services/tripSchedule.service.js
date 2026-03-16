const scheduleRepo = require('../repositories/tripSchedule.repository');
const ScheduleResponse = require('../models/tripSchedule/tripSchedule.response');
const { CreateScheduleRequest, UpdateScheduleRequest } = require('../models/tripSchedule/tripSchedule.request');

exports.getSchedulesByTrip = async (tripId) => {
    const schedules = await scheduleRepo.findByTrip(tripId);
    return schedules.map(x => new ScheduleResponse(x));
};

exports.getScheduleById = async (id) => {
    const schedule = await scheduleRepo.findById(id);

    if (!schedule)
        throw { statusCode: 404, message: "Schedule not found" };

    return new ScheduleResponse(schedule);
};

exports.createSchedule = async (payload) => {
    const request = new CreateScheduleRequest(payload);

    if (!request.trip_id)
        throw { statusCode: 400, message: "Trip is required" };

    if (!request.day_start_time || !request.day_end_time)
        throw { statusCode: 400, message: "Start and End time required" };

    request.day_start_time = new Date(`1970-01-01T${request.day_start_time}`);
    request.day_end_time = new Date(`1970-01-01T${request.day_end_time}`);

    if (request.day_start_time >= request.day_end_time)
        throw { statusCode: 400, message: "Start time must be before end time" };

    const schedule = await scheduleRepo.create(request);
    return new ScheduleResponse(schedule);
};

exports.updateSchedule = async (id, payload) => {

    const existing = await scheduleRepo.findById(id);

    if (!existing)
        throw { statusCode: 404, message: "Schedule not found" };

    const request = new UpdateScheduleRequest(payload);

    const start = request.day_start_time
        ? new Date(`1970-01-01T${request.day_start_time}`)
        : existing.day_start_time;

    const end = request.day_end_time
        ? new Date(`1970-01-01T${request.day_end_time}`)
        : existing.day_end_time;

    if (start >= end)
        throw { statusCode: 400, message: "Invalid schedule time range" };

    request.day_start_time = start;
    request.day_end_time = end;

    const schedule = await scheduleRepo.update(id, request);
    return new ScheduleResponse(schedule);
};

exports.deleteSchedule = async (id) => {

    const existing = await scheduleRepo.findById(id);

    if (!existing)
        throw { statusCode: 404, message: "Schedule not found" };

    const schedule = await scheduleRepo.remove(id);
    return new ScheduleResponse(schedule);
};