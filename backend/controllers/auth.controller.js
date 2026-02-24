const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const sendResponse = require('../src/utils/apiResponse');

exports.registerUser = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return sendResponse(res, {
            statusCode: 201,
            data: { token: result.accessToken, user: result.user },
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
        const result = await authService.loginUser(req.body);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return sendResponse(res, {
            statusCode: 200,
            data: { token: result.accessToken, user: result.user },
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
};

exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken; // get from HttpOnly cookie
        const result = await authService.refreshToken(refreshToken);

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