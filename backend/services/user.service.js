const userRepo = require('../repositories/user.repository');
const UserResponse = require('../models/users/user.response');
const { CreateUserRequest, UpdateUserRequest } = require('../models/users/user.model');
const generateCode = require('../src/utils/generateCode');

exports.getUsers = async () => {
    const users = await userRepo.findAll();
    return users.map(x => new UserResponse(x));
}

exports.getUserByCode = async (code) => {
    const user = await userRepo.findByCode(code);
    if (!user) throw { status: false, statusCode: 404, message: 'User not found' };
    return new UserResponse(user);
}

exports.createUser = async (payload) => {
    const request = new CreateUserRequest(payload);

    // Validate email
    if (!request.email)
        throw { status: false, statusCode: 400, message: 'Email is required' };

    request.email = request.email.trim().toLowerCase();

    const existing = await userRepo.findByEmail(request.email);
    if (existing)
        throw { status: false, statusCode: 409, message: 'User already exists' };

    // Generate unique user code
    request.user_code = await generateCode('tbl_user', 'user_code', 'USR');

    const user = await userRepo.create(request);
    return new UserResponse(user);
};

exports.updateUser = async (code, payload) => {
    const existing = await userRepo.findByCode(code);
    if (!existing)
        throw { status: false, statusCode: 404, message: 'User not found' };

    const request = new UpdateUserRequest(payload);

    if (request.email !== undefined) {
        request.email = request.email.trim().toLowerCase();
        if (!request.email)
            throw { status: false, statusCode: 400, message: 'Invalid email' };

        const duplicate = await userRepo.findByEmail(request.email);
        if (duplicate && duplicate.user_code !== code)
            throw { status: false, statusCode: 409, message: 'Email already in use' };
    }

    const user = await userRepo.update(code, request);
    return new UserResponse(user);
};

exports.deleteUser = async (code) => {
    const existing = await userRepo.findByCode(code);
    if (!existing) throw { status: false, statusCode: 404, message: 'User not found' };

    const user = await userRepo.remove(code);
    return new UserResponse(user);
}
