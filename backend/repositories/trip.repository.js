const prisma = require('../src/prisma');

exports.findAllByUser = async (userId) => {
    return prisma.tbl_trip.findMany({
        where: {
            user_id: Number(userId),
            is_deleted: false
        }
    });
};

exports.findByCode = async (code) => {
    return prisma.tbl_trip.findFirst({
        where: {
            trip_code: code,
            is_deleted: false
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
