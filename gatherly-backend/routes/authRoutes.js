const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getMe);

module.exports = router;
