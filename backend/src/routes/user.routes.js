const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Users (protected)
router.get('/users', authMiddleware, userController.getUsers);
router.get('/users/:code', authMiddleware, userController.getUserByCode);
router.post('/users', authMiddleware, upload.single('profile_image'), userController.createUser);
router.put('/users/:code', authMiddleware, upload.single('profile_image'), userController.updateUser);
router.delete('/users/:code', authMiddleware, userController.deleteUser);

module.exports = router;