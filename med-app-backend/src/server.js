// Main Server Entry Point - The "Glue"
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Middleware
const authMiddleware = require('../middleware/authMiddleware');
const errorHandler = require('../middleware/errorHandler');
const validationMiddleware = require('../middleware/validationMiddleware');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const recordRoutes = require('./routes/recordRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(validationMiddleware);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clinics', authMiddleware, clinicRoutes);
app.use('/api/records', authMiddleware, recordRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler (Must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Medical App Backend running on port ${PORT}`);
});
