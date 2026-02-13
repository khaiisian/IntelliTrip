const userService = require('../services/user.services');

exports.getAllUsers = async(req, res) => {
    try{
        const users = await userService.getUsers();
        res.status(201).json(users);
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Failed to fetch users."})
    }
}