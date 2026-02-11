const { generateMockEvent } = require('../utils/mockEventGenerator');
const { Message, User } = require('../models');

// Store connected users (socketId -> user info)
// TODO: Use Redis for scaling across multiple instances
const connectedUsers = new Map();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join event room
        socket.on('join-event', async ({ eventId, username }) => {
            try {
                socket.join(eventId);
                connectedUsers.set(socket.id, { eventId, username });

                console.log(`${username} joined event room: ${eventId}`);

                // Fetch previous messages from MongoDB
                const messages = await Message.find({ eventId })
                    .sort({ timestamp: 1 })
                    .limit(50); // Limit to last 50 messages

                const formattedMessages = messages.map(msg => ({
                    id: msg._id,
                    message: msg.content,
                    username: msg.senderName,
                    timestamp: msg.timestamp
                }));

                socket.emit('previous-messages', formattedMessages);

                // Notify others that user joined
                socket.to(eventId).emit('user-joined', {
                    message: `${username} joined the chat`,
                    username: 'System',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error joining event:', error);
            }
        });

        // Handle chat message
        socket.on('send-message', async ({ eventId, message, username, userId }) => {
            try {
                const messageData = {
                    eventId,
                    senderName: username,
                    content: message,
                    timestamp: new Date().toISOString()
                };

                // If userId is provided, link to user model
                if (userId) {
                    messageData.sender = userId;
                }

                // Save to MongoDB
                const newMessage = await Message.create(messageData);

                // Broadcast message to all users in the event room
                io.to(eventId).emit('new-message', {
                    id: newMessage._id,
                    message: newMessage.content,
                    username: newMessage.senderName,
                    timestamp: newMessage.timestamp
                });
            } catch (error) {
                console.error('Error sending message:', error);
            }
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

    // Broadcast mock events periodically
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

    // Start broadcasting
    console.log('Starting mock event broadcasts...');
    startMockEventBroadcast();

    // Return cleanup function
    return () => {
        clearInterval(mockEventInterval);
    };
};
