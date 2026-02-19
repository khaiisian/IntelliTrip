const userService = require('../services/user.service');
const sendResponse = require('../src/utils/apiResponse');

exports.getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();
        return sendResponse(res, { data: users, message: "Successfully fetched user data." });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to fetch users."
        });
    }
}

exports.getUserByCode = async (req, res) => {
    try {
        const user = await userService.getUserByCode(req.params.code);
        return sendResponse(res, { data: user });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to fetch user."
        });
    }
}

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

exports.createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        return sendResponse(res, {
            statusCode: 201,
            data: user,
            message: "User is created successfully."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to create user."
        });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.code, req.body);
        return sendResponse(res, {
            data: user,
            message: "User is updated successfully."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to update user."
        });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await userService.deleteUser(req.params.code);
        return sendResponse(res, {
            data: user,
            message: "User is deleted successfully."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to delete user."
        });
    }
}
