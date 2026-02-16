const userRepo = require('../repositories/user.repository');
const userResponse = require('../models/users/user.response');
const { CreateUserRequest, UpdateUserRequest } = require('../models/users/user.model');

exports.getUsers = async () => {
    const users = await userRepo.getAllUsers();
    return users.map(x => new userResponse(x));
}

exports.getUserById = async (id) => {
    const user = await userRepo.findById(id);
    if (!user) throw new Error('User not found.');

    return new userResponse(user);
}

exports.createUser = async (payload) => {
    const request = new CreateUserRequest(payload);

    const existing = await userRepo.findByEmail(request.email);
    if (existing) {
        throw new Error('User already exists.')
    }

    const user = await userRepo.create(request);

    return new userResponse(user);
}

exports.updateUser = async (id, payload) => {
    const request = new UpdateUserRequest(payload);

    const user = await userRepo.update(id, request);

    return new userResponse(user);
}

exports.deleteUser = async (id) => {
    const user = await userRepo.delete(id);

    return new userResponse(user);
}