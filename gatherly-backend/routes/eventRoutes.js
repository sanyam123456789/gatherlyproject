const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  joinEvent,
  leaveEvent,
  deleteEvent
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', authMiddleware, createEvent);
router.post('/:id/join', authMiddleware, joinEvent);
router.post('/:id/leave', authMiddleware, leaveEvent);
router.delete('/:id', authMiddleware, deleteEvent);

module.exports = router;
