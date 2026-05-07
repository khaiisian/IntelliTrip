const prisma = require('../prisma');
const generateCode = require('../utils/generateCode');

exports.createItinerary = async (data) => {
    return prisma.tbl_itinerary.create({
        data: {
            itinerary_code: await generateCode('tbl_itinerary', 'itinerary_code', 'ITINERARY'),
            ...data
        }
    });
};

exports.createItineraryItem = async (data) => {
    return prisma.tbl_itinerary_item.create({
        data: {
            item_code: await generateCode('tbl_itinerary_item', 'item_code', 'ITEM'),
            ...data
        }
    });
};

exports.findByTripId = async (tripId) => {
    return prisma.tbl_itinerary.findMany({
        where: {
            trip_id: Number(tripId),
            is_deleted: false
        },
        include: {
            tbl_itinerary_item: {
                include: {
                    tbl_attraction: true
                },
                orderBy: {
                    day_number: 'asc'
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};

exports.findByCode = async (code) => {
    return prisma.tbl_itinerary.findFirst({
        where: {
            itinerary_code: code,
            is_deleted: false
        },
        include: {
            tbl_itinerary_item: {
                include: {
                    tbl_attraction: true
                },
                orderBy: {
                    day_number: 'asc'
                }
            }
        }
    });
};