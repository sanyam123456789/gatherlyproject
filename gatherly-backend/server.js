const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const { authRoutes, eventRoutes, blogRoutes, profileRoutes } = require('./routes');
const { generateMockEvent } = require('./utils/mockEventGenerator');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gatherly API is running' });
});

// Socket.io connection handling
const eventChats = new Map(); // Store chat messages in memory (eventId -> messages array)
const connectedUsers = new Map(); // Store connected users (socketId -> user info)

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join event room
  socket.on('join-event', ({ eventId, username }) => {
    socket.join(eventId);
    connectedUsers.set(socket.id, { eventId, username });

    console.log(`${username} joined event room: ${eventId}`);

    // Send previous messages to the user
    if (eventChats.has(eventId)) {
      socket.emit('previous-messages', eventChats.get(eventId));
    }

    // Notify others that user joined
    socket.to(eventId).emit('user-joined', {
      message: `${username} joined the chat`,
      username: 'System',
      timestamp: new Date().toISOString()
    });
  });

  // Handle chat message
  socket.on('send-message', ({ eventId, message, username }) => {
    const messageData = {
      id: Date.now().toString(),
      message,
      username,
      timestamp: new Date().toISOString()
    };

    // Store message in memory
    if (!eventChats.has(eventId)) {
      eventChats.set(eventId, []);
    }
    eventChats.get(eventId).push(messageData);

    // Limit stored messages to last 100 per event
    if (eventChats.get(eventId).length > 100) {
      eventChats.set(eventId, eventChats.get(eventId).slice(-100));
    }

    // Broadcast message to all users in the event room
    io.to(eventId).emit('new-message', messageData);
  });

  // Handle typing indicator
  socket.on('typing', ({ eventId, username, isTyping }) => {
    socket.to(eventId).emit('user-typing', { username, isTyping });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      const { eventId, username } = userInfo;
      socket.to(eventId).emit('user-left', {
        message: `${username} left the chat`,
        username: 'System',
        timestamp: new Date().toISOString()
      });
      connectedUsers.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Broadcast mock events periodically for real-time demonstration
let mockEventInterval;
const MOCK_EVENT_INTERVAL = 45000; // 45 seconds

function startMockEventBroadcast() {
  mockEventInterval = setInterval(() => {
    const mockEvent = generateMockEvent();

    // Broadcast to all connected clients
    io.emit('new-mock-event', {
      ...mockEvent,
      isMockEvent: true,
      timestamp: new Date().toISOString()
    });

    console.log(`Broadcasted mock ${mockEvent.category} event: ${mockEvent.title}`);
  }, MOCK_EVENT_INTERVAL);
}

// Cleanup on server shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  clearInterval(mockEventInterval);
  process.exit(0);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5002;

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start broadcasting mock events
  console.log('Starting mock event broadcasts...');
  startMockEventBroadcast();
});

