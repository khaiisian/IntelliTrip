const userRepo = require('../repositories/user.repository');

exports.getUsers = async() => {
    return await userRepo.getAllUsers();
}