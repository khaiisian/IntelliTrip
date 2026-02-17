const prisma = require('../src/prisma');

exports.findAll = async () => {
    return await prisma.tbl_user.findMany({
        where: { is_deleted: false }
    });
}

exports.findByCode = async (code) => {
    return await prisma.tbl_user.findFirst({
        where: { user_code: code, is_deleted: false }
    });
}

exports.findByEmail = async (email) => {
    return await prisma.tbl_user.findFirst({
        where: { email: email.toLowerCase(), is_deleted: false }
    });
}

exports.create = async (data) => {
    return await prisma.tbl_user.create({ data });
}

exports.update = async (code, data) => {
    return await prisma.tbl_user.update({
        where: { user_code: code },
        data
    });
}

exports.remove = async (code) => {
    return await prisma.tbl_user.update({
        where: { user_code: code },
        data: { is_deleted: true }
    });
}
