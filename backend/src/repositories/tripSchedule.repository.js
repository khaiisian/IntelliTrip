const prisma = require('../prisma');

exports.findByTrip = async (tripId) => {
    return prisma.trip_schedule.findMany({
        where: {
            trip_id: Number(tripId)
        },
        include: {
            tbl_trip: true
        }
    });
};

exports.findById = async (id) => {
    return prisma.trip_schedule.findUnique({
        where: {
            schedule_id: Number(id)
        },
        include: {
            tbl_trip: true
        }
    });
};

exports.create = async (data) => {
    return prisma.trip_schedule.create({ data });
};

exports.update = async (id, data) => {
    return prisma.trip_schedule.update({
        where: { schedule_id: Number(id) },
        data
    });
};

exports.remove = async (id) => {
    return prisma.trip_schedule.delete({
        where: { schedule_id: Number(id) }
    });
};