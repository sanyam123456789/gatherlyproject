const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB connected: ${conn.connection.host} (attempt ${attempt}/${retries})`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection failed (attempt ${attempt}/${retries}):`, error.message);

      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('🚨 All connection attempts failed. Exiting...');
        process.exit(1);
      }
    }
  }
};

// Event listeners for connection monitoring
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Auto-reconnect enabled.');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

module.exports = connectDB;

