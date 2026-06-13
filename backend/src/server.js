import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// 1. Connect to MongoDB
connectDB();

// 2. Start the Express Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🌍 API available at http://localhost:${PORT}/api`);
});

// 3. Handle unhandled promise rejections (e.g., DB connection failure)
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});