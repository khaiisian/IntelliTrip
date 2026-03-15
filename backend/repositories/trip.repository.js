const prisma = require('../src/prisma');

exports.findAllByUser = async (userId) => {
    return prisma.tbl_trip.findMany({
        where: {
            user_id: Number(userId),
            is_deleted: false
        },
        include: {
            tbl_user: true,
            tbl_itinerary: true,
            tbl_trip_preference: true
        }
    });
};

exports.findByCode = async (code) => {
    return prisma.tbl_trip.findFirst({
        where: {
            trip_code: code,
            is_deleted: false
        },
        include: {
            tbl_user: true,
            tbl_itinerary: true,
            tbl_trip_preference: true
        }
    });
};

exports.create = async (data) => {
    return prisma.tbl_trip.create({ data });
};

exports.update = async (code, data) => {
    return prisma.tbl_trip.update({
        where: { trip_code: code },
        data
    });
};

exports.remove = async (code) => {
    return prisma.tbl_trip.update({
        where: { trip_code: code },
        data: { is_deleted: true }
    });
};

exports.getTripPreferences = async (tripId) => {
    return prisma.tbl_trip_preference.findMany({
        where: {
            trip_id: tripId,
            is_deleted: false
        }
    });
};

exports.getTripSchedule = async (tripId) => {
    return prisma.trip_schedule.findFirst({
        where: {
            trip_id: tripId
        }
    });
};