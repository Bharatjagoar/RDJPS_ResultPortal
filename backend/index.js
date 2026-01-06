// server.js - Main Entry Point

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


// Load environment variables
dotenv.config();

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const activityRoutes = require("./routes/activity");
const adminROutes = require("./routes/adminRoutes");
const classVerificationRoutes = require("./routes/classVerificationRoutes")

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

// Connect to Database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: '🎓 School Results API is running!' });
});

// API Routes
app.use('/api/students', studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/admin", adminROutes)
app.use("/api/class-verification", classVerificationRoutes);


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});