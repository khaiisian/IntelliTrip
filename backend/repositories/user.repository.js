const prisma = require('../src/prisma');

exports.getAllUsers = async () => {
    return await prisma.tbl_user.findMany();
}