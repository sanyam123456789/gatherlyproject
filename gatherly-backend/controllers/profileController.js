const User = require('../models/User');
const Event = require('../models/Event');
const Blog = require('../models/Blog');

// Get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.userId;
        console.log('👤 Getting profile for userId:', userId);

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get joined events
        const joinedEvents = await Event.find({ attendees: userId })
            .populate('creator', 'username displayName')
            .sort({ date: 1 });

        // Get user's blogs
        const userBlogs = await Blog.find({ author: userId })
            .sort({ createdAt: -1 });

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar,
                penguinEnabled: user.penguinEnabled
            },
            joinedEvents,
            blogs: userBlogs
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { displayName, avatar, penguinEnabled } = req.body;
        const userId = req.userId;

        const updateData = {};

        if (displayName !== undefined) updateData.displayName = displayName;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (penguinEnabled !== undefined) updateData.penguinEnabled = penguinEnabled;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar,
                penguinEnabled: user.penguinEnabled
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
