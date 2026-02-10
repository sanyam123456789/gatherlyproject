try {
    console.log('Loading modules...');

    const express = require('express');
    console.log('✓ Express');

    const http = require('http');
    console.log('✓ HTTP');

    const cors = require('cors');
    console.log('✓ CORS');

    const { Server } = require('socket.io');
    console.log('✓ Socket.IO');

    require('dotenv').config();
    console.log('✓ Dotenv');

    const connectDB = require('./config/db');
    console.log('✓ ConnectDB');

    const { authRoutes, eventRoutes, blogRoutes, profileRoutes } = require('./routes');
    console.log('✓ Routes index');

    const afterglowRoutes = require('./routes/afterglow');
    console.log('✓ Afterglow routes');

    const { generateMockEvent } = require('./utils/mockEventGenerator');
    console.log('✓ Mock event generator');

    console.log('\nAll modules loaded successfully!');

} catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
}
