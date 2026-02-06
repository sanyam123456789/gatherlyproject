const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const auth = require('../middleware/auth');

// Get profile (own profile if no userId, or specific user's profile)
router.get('/:userId?', auth, getProfile);

// Update own profile
router.put('/', auth, updateProfile);

module.exports = router;
