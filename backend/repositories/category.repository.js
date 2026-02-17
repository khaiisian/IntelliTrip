const prisma = require('../src/prisma');

exports.findAll = async () => {
    return await prisma.tbl_category.findMany({
        where: { is_deleted: false }
    });
}

exports.findByCode = async (code) => {
    return await prisma.tbl_category.findFirst({
        where: { category_code: code, is_deleted: false }
    });
}

exports.findByName = async (name) => {
    return await prisma.tbl_category.findFirst({
        where: {
            AND: [
                { is_deleted: false },
                { category_name: { equals: name.toLowerCase() } }
            ]
        }
    });
}

exports.create = async (data) => {
    return await prisma.tbl_category.create({ data });
}

exports.updateByCode = async (code, data) => {
    return await prisma.tbl_category.update({
        where: { category_code: code },
        data
    });
}

exports.removeByCode = async (code) => {
    return await prisma.tbl_category.update({
        where: { category_code: code },
        data: { is_deleted: true }
    });
}
