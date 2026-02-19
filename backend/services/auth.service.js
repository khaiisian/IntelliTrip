const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require("../config/env");
const userRepository = require("../repositories/user.repository");

exports.login = async (email, password) => {
    const user = userRepository.findByEmail(email);
    if (!user) {
        throw { status: false, statusCode: 404, message: 'User Not Found.' };
    }
}