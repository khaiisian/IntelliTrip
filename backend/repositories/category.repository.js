const prisma = require('../src/prisma');

exports.findAll = async () => {
    return await prisma.tbl_category.findMany({
        where: { is_deleted: false }
    })
}

exports.findById = async (id) => {
    return await prisma.tbl_category.findFirst({
        where: { category_id: Number(id), is_deleted: false }
    })
}

exports.create = async (data) => {
    return await prisma.tbl_category.create(data)
}

exports.update = async (id, data) => {
    return await prisma.tbl_category.update({
        where: { category_id: Number(id), is_deleted: false },
        data
    })
}

exports.remove = async (id) => {
    return await prisma.tbl_category.update({
        where: { category_id: id, is_deleted: false },
        data: { is_deleted: true }
    })
}