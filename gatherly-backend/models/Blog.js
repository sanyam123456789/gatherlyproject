const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    minlength: 10
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],

  // Photo URLs from S3
  photos: [{
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        // Allow S3 URLs or base64 (for backwards compatibility)
        return v.startsWith('http') || v.startsWith('data:image/');
      },
      message: 'Invalid photo URL'
    }
  }],

  // Event reference
  eventRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false
  },

  category: {
    type: String,
    enum: ['events', 'travel', 'concerts', 'experiences', 'other'],
    default: 'other'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ eventRef: 1 });
blogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
