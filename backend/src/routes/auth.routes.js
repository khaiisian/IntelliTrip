const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Auth
router.post("/auth/register", authController.registerUser);
router.post("/auth/login", authController.loginUser);
router.post("/auth/refresh", authController.refreshToken);
router.get("/auth/me", authMiddleware, authController.getMe);
router.put("/auth/profile", authMiddleware, upload.single('profile_image'), authController.updateProfile);
router.post("/auth/logout", authMiddleware, authController.logoutUser);

module.exports = router;
