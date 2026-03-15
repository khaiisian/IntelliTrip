const prisma = require('../src/prisma');

exports.getSystemConfig = async () => {
    return prisma.tbl_system_config.findFirst();
};

exports.findAll = async () => {
    return prisma.tbl_system_config.findMany();
};

exports.findById = async (id) => {
    return prisma.tbl_system_config.findUnique({
        where: {
            config_id: Number(id)
        }
    });
};

exports.create = async (data) => {
    return prisma.tbl_system_config.create({ data });
};

exports.update = async (id, data) => {
    return prisma.tbl_system_config.update({
        where: { config_id: Number(id) },
        data
    });
};

exports.remove = async (id) => {
    return prisma.tbl_system_config.delete({
        where: { config_id: Number(id) }
    });
};