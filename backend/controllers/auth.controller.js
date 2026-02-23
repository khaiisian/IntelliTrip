const userService = require('../services/user.service');
const sendResponse = require('../src/utils/apiResponse');

exports.registerUser = async (req, res) => {
    try {
        const result = await userService.registerUser(req.body);
        return sendResponse(res, {
            statusCode: 201,
            data: result,
            message: "Registration successful"
        });
    } catch (err) {
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Registration failed"
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const result = await userService.loginUser(req.body);
        return sendResponse(res, {
            statusCode: 200,
            data: result,
            message: "Login successful"
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Login failed"
        });
    }
}

exports.refreshToken = async (req, res) => {
    try {
        const result = await userService.refreshToken(req.body.refreshToken);

        return sendResponse(res, {
            data: result,
            message: "Token refreshed"
        });
    } catch (err) {
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 401,
            message: err.message ?? "Invalid refresh token"
        });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await userService.getUserByCode(req.user.userCode);

        return sendResponse(res, {
            data: user,
            message: "Fetched current user."
        });
    } catch (err) {
        sendResponse(res, {
            status: false,
            statusCode: 500,
            message: err.message ?? "Failed to fetch user."
        })
    }
};