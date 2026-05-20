const prisma = require('../prisma');

exports.create = async ({ trip_id, total_cost, itinerary_code, items }) => {
    return prisma.tbl_itinerary.create({
        data: {
            trip_id,
            total_cost,
            itinerary_code,
            tbl_itinerary_item: {
                create: items
            }
        },
        include: {
            tbl_itinerary_item: true
        }
    });
};

exports.updateLatestByTripId = async ({ trip_id, total_cost, items }) => {
    return prisma.$transaction(async (tx) => {
        const itinerary = await tx.tbl_itinerary.findFirst({
            where: {
                trip_id: Number(trip_id),
                is_deleted: false
            },
            orderBy: { generated_at: 'desc' }
        });

        if (!itinerary) return null;

        await tx.tbl_itinerary_item.deleteMany({
            where: { itinerary_id: itinerary.itinerary_id }
        });

        return tx.tbl_itinerary.update({
            where: { itinerary_id: itinerary.itinerary_id },
            data: {
                total_cost,
                tbl_itinerary_item: {
                    create: items
                }
            },
            include: {
                tbl_itinerary_item: true
            }
        });
    });
};

exports.findByTripId = async (tripId) => {
    return prisma.tbl_itinerary.findMany({
        where: { trip_id: Number(tripId) },
        include: {
            tbl_itinerary_item: {
                include: {
                    tbl_attraction: true
                }
            }
        },
        orderBy: { generated_at: 'desc' }
    });
};

exports.findAllByUserCode = async (userCode) => {
    return prisma.tbl_itinerary.findMany({
        where: {
            is_deleted: false,
            tbl_trip: {
                tbl_user: {
                    user_code: userCode,
                    is_deleted: false
                }
            }
        },
        include: {
            tbl_itinerary_item: {
                include: {
                    tbl_attraction: true
                }
            },
            tbl_trip: true
        },
        orderBy: { generated_at: 'desc' }
    });
};

exports.findByCode = async (itineraryCode) => {
    return prisma.tbl_itinerary.findFirst({
        where: {
            itinerary_code: itineraryCode,
            is_deleted: false
        },
        include: {
            tbl_trip: {
                include: {
                    tbl_user: true
                }
            },
            tbl_itinerary_item: {
                orderBy: [
                    { day_number: 'asc' },
                    { visit_start_time: 'asc' }
                ],
                include: {
                    tbl_attraction: true
                }
            }
        }
    });
};
