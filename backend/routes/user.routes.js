const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Users (protected)
router.get('/users', authMiddleware, userController.getUsers);
router.get('/users/:code', authMiddleware, userController.getUserByCode);
router.post('/users', authMiddleware, userController.createUser);
router.put('/users/:code', authMiddleware, userController.updateUser);
router.delete('/users/:code', authMiddleware, userController.deleteUser);

module.exports = router;