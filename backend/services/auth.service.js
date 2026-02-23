const userRepo = require('../repositories/user.repository');
const UserResponse = require('../models/users/user.response');
const { CreateUserRequest, UpdateUserRequest, LoginUserRequest, RegisterUserRequest } = require('../models/users/user.request');
const generateCode = require('../src/utils/generateCode');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (payload) => {
    const request = new RegisterUserRequest(payload);

    // Validate email
    if (!request.email)
        throw { status: false, statusCode: 400, message: 'Email is required' };

    request.email = request.email.trim().toLowerCase();

    const existing = await userRepo.findByEmail(request.email);
    if (existing)
        throw { status: false, statusCode: 409, message: 'User already exists' };

    // Hash password
    if (!request.password)
        throw { status: false, statusCode: 400, message: 'Password is required' };

    request.password = await bcrypt.hash(request.password, 10);

    // Generate unique user code
    request.user_code = await generateCode('tbl_user', 'user_code', 'USR');

    try {
        const user = await userRepo.create(request);
        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        return {
            token: accessToken,
            refreshToken,
            user: new UserResponse(user)
        };
    } catch (err) {
        throw { status: false, statusCode: 500, message: "Registration failed" };
    }
};

exports.loginUser = async (payload) => {
    const request = new LoginUserRequest(payload);

    if (!request.email || !request.password) {
        throw { status: false, statusCode: 400, message: "Email and password are required" };
    }

    const user = await userRepo.findByEmail(request.email.trim().toLowerCase());
    if (!user) throw { status: false, statusCode: 401, message: "Invalid credentials" };

    const validPassword = await bcrypt.compare(request.password, user.password);
    if (!validPassword) {
        throw { status: false, statusCode: 401, message: "Invalid credentials" };
    }

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
        token: accessToken,
        refreshToken,
        user: new UserResponse(user)
    };
}

exports.refreshToken = async (refreshToken) => {
    if (!refreshToken) {
        throw { status: false, statusCode: 401, message: "Refresh token required" };
    }

    let decoded;
    try {
        decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );
    } catch (err) {
        throw { status: false, statusCode: 401, message: "Invalid refresh token" };
    }

    const user = await userRepo.findByCode(decoded.userCode);
    if (!user) {
        throw { status: false, statusCode: 401, message: "User not found" };
    }

    const newAccessToken = generateToken(user);

    return {
        token: newAccessToken
    };
};

const generateToken = (user) => {
    return jwt.sign(
        {
            userCode: user.user_code,
            email: user.email,
            userName: user.user_name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            userCode: user.user_code
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );
};