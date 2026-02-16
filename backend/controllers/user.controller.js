const userService = require("../services/user.service");
const sendResponse = require("../src/utils/apiResponse");

exports.getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();
        return sendResponse(res, { data: users });

        // res.status(201).json(users);
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: false,
            statusCode: 500,
            message: "Failed to fetch users.",
        });

        // res.status(500).json({error: "Failed to fetch users."})
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        console.log(user)
        return sendResponse(res, { data: user });

        // res.status(201).json(result);
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: false,
            statusCode: 404,
            message: "Failed to fetch user.",
        });

        // res.status(404).json({ message: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        return sendResponse(res, {
            statusCode: 201,
            data: result,
            message: "User is created successfully."
        })

        // res.status(201).json(result);
    } catch (err) {
        console.error(err)
        return sendResponse(res, {
            status: false,
            statusCode: 500,
            message: "Failed to create user.",
        });

        // res.status(400).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const result = await userService.updateUser(req.params.id, req.body);
        return sendResponse(res, {
            data: result,
            message: "User is updated successfully."
        })
    } catch (err) {
        console.error(err)
        return sendResponse(res, {
            status: false,
            statusCode: 500,
            message: "Failed to update user."
        })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const result = await userService.deleteUser(req.params.id);
        return sendResponse(res, {
            data: result,
            message: "User is deleted successfully."
        })
    } catch (err) {
        console.error(err)
        return sendResponse(res, {
            status: false,
            statusCode: 500,
            message: "Failed to delete user."
        })
    }
}