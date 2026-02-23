const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Auth
router.post("/auth/register", userController.registerUser);
router.post("/auth/login", userController.loginUser);
router.post("/auth/refresh", userController.refreshToken);
router.get("/auth/me", authMiddleware, userController.getMe);