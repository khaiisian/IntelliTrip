const prisma = require('../src/prisma');

exports.findAllByAttraction = async (attraction_id) => {
    return prisma.tbl_attraction_experience.findMany({
        where: { attraction_id, is_deleted: false },
        include: { tbl_attraction: true }
    });
};

exports.findByCode = async (experience_code) => {
    return prisma.tbl_attraction_experience.findFirst({
        where: { experience_code, is_deleted: false },
        include: { tbl_attraction: true }
    });
};

exports.create = async (data) => {
    return prisma.tbl_attraction_experience.create({ data });
};

exports.update = async (experience_code, data) => {
    return prisma.tbl_attraction_experience.update({
        where: { experience_code },
        data
    });
};

exports.remove = async (experience_code) => {
    return prisma.tbl_attraction_experience.update({
        where: { experience_code },
        data: { is_deleted: true }
    });
};
