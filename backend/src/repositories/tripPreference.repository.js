const prisma = require('../prisma');

exports.findByTrip = async (tripId) => {
    return prisma.tbl_trip_preference.findMany({
        where: {
            trip_id: Number(tripId),
            is_deleted: false
        },
        include: {
            tbl_trip: true,
            tbl_category: true
        }
    });
};

exports.findByCode = async (code) => {
    return prisma.tbl_trip_preference.findFirst({
        where: {
            trip_pref_code: code,
            is_deleted: false
        },
        include: {
            tbl_trip: true,
            tbl_category: true
        }
    });
};

exports.create = async (data) => {
    return prisma.tbl_trip_preference.create({ data });
};

exports.update = async (code, data) => {
    return prisma.tbl_trip_preference.update({
        where: { trip_pref_code: code },
        data
    });
};

exports.remove = async (code) => {
    return prisma.tbl_trip_preference.update({
        where: { trip_pref_code: code },
        data: { is_deleted: true }
    });
};