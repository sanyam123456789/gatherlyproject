const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    getAllAfterglows,
    createAfterglow,
    updateAfterglow,
    deleteAfterglow
} = require('../controllers/afterglowController');

// Public routes
router.get('/', getAllAfterglows);

// Protected routes
router.post('/', authMiddleware, createAfterglow);
router.put('/:id', authMiddleware, updateAfterglow);
router.delete('/:id', authMiddleware, deleteAfterglow);

module.exports = router;
