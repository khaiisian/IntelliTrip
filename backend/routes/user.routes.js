const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/users', userController.getUsers);
router.get('/users/:code', userController.getUserByCode);
router.post('/users', userController.createUser);
router.put('/users/:code', userController.updateUser);
router.delete('/users/:code', userController.deleteUser);

module.exports = router;