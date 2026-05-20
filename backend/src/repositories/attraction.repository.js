const prisma = require('../prisma');

exports.findAll = async () => {
    return prisma.tbl_attraction.findMany({
        where: {
            is_deleted: false
        },
        include: { tbl_category: true },
        orderBy: { created_at: 'desc' }
    });
};

exports.findByCode = async (code) => {
    return prisma.tbl_attraction.findFirst({
        where: {
            attraction_code: code,
            is_deleted: false
        },
        include: { tbl_category: true }
    });
};

exports.create = async (data) => {
    return prisma.tbl_attraction.create({
        data,
        include: { tbl_category: true }
    });
};

exports.update = async (code, data) => {
    return prisma.tbl_attraction.update({
        where: { attraction_code: code },
        data,
        include: { tbl_category: true }
    });
};

exports.remove = async (code) => {
    return prisma.tbl_attraction.update({
        where: { attraction_code: code },
        data: { is_deleted: true }
    });
};
