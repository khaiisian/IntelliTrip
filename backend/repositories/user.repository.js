const prisma = require('../src/prisma');

exports.getAllUsers = async () => {
    return await prisma.tbl_user.findMany({
        where: { is_deleted: false }
    });
}

exports.findById = async (id) => {
    return await prisma.tbl_user.findFirst({
        where: { user_id: Number(id), is_deleted: false }
    })
}

exports.findByEmail = async (email) => {
    return await prisma.tbl_user.findFirst({
        where: { password: String(email), is_deleted: false }
    })
}

exports.create = async (data) => {
    return await prisma.tbl_user.create({ data });
}

exports.update = async (id, data) => {
    return await prisma.tbl_user.update({
        where: { user_id: Number(id), is_deleted: false },
        data
    })
}

exports.delete = async (id) => {
    return await prisma.tbl_user.update({
        where: { user_id: Number(id), is_deleted: false },
        data: { is_deleted: true }
    })
}