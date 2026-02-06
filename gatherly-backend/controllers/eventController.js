const { Event, User } = require('../models');

// @desc    Create new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, maxAttendees, category } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      maxAttendees: maxAttendees || 50,
      category: category || 'concert',
      creator: req.userId,
      attendees: [req.userId] // Creator automatically joins
    });

    // Populate creator info
    await event.populate('creator', 'username email');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('creator', 'username email')
      .populate('attendees', 'username')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'username email')
      .populate('attendees', 'username email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Join event
// @route   POST /api/events/:id/join
// @access  Private
const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already attending
    if (event.attendees.includes(req.userId)) {
      return res.status(400).json({ message: 'You are already attending this event' });
    }

    // Check if event is full
    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Add user to attendees
    event.attendees.push(req.userId);
    await event.save();

    await event.populate('attendees', 'username');

    res.json({
      message: 'Successfully joined event',
      event
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Leave event
// @route   POST /api/events/:id/leave
// @access  Private
const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is attending
    if (!event.attendees.includes(req.userId)) {
      return res.status(400).json({ message: 'You are not attending this event' });
    }

    // Remove user from attendees
    event.attendees = event.attendees.filter(
      attendee => attendee.toString() !== req.userId
    );
    await event.save();

    await event.populate('attendees', 'username');

    res.json({
      message: 'Successfully left event',
      event
    });
  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  joinEvent,
  leaveEvent,
  deleteEvent
};
