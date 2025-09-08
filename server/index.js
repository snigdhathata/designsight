const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
console.log("DEBUG MONGODB_URI:", process.env.MONGODB_URI);


// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const feedbackRoutes = require('./routes/feedback');
const commentRoutes = require('./routes/comments');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 5000;

// ================== Security Middleware ==================
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// ================== Rate Limiting ==================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// ================== Body Parsing ==================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ================== MongoDB Connection ==================
const databaseUri =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/designsight';

// Mask credentials in logs
const maskedUri = databaseUri.replace(/:\/\/.*@/, '://***:***@');
console.log(`[DB] Attempting MongoDB connection to: ${maskedUri}`);

mongoose
  .connect(databaseUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // safe to include even if deprecated
  })
  .then(() => {
    console.log('✅ MongoDB Connected');

    // Start server only after DB connection succeeds
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB Connection Error:', err.message || err);
    process.exit(1); // fail fast if DB connection fails
  });

// Handle runtime DB issues
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err.message || err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

// ================== Routes ==================
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/export', exportRoutes);

// ================== Health Check ==================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ================== Error Handling ==================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// ================== 404 Handler ==================
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Export app for testing or further integration
module.exports = app;
