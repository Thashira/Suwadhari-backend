// Main Server Entry Point - The "Glue"
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

// Test Database Connection and Start Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🏥 Medical App Backend Starting...');
    console.log('='.repeat(60));

    // Test database connection
    console.log('\n📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Test a simple query (do not crash if tables are missing)
    // try {
    //   //const userCount = await prisma.login.count();
    //   //console.log(`✅ Database query successful! Users in database: ${userCount}`);
    // } catch (queryError) {
    //   if (queryError.code === 'P2021') {
    //     console.log('⚠️  Database connected but tables are missing.');
    //     console.log('   Run: npx prisma migrate dev --name init');
    //   } else {
    //     throw queryError;
    //   }
    // }

    // Start the server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log(`🚀 Medical App Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Register: POST http://localhost:${PORT}/api/auth/register`);
      console.log(`🔓 Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.error('❌ FAILED TO START SERVER!');
    console.log('='.repeat(60));
    console.error('\n🚨 Error Details:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Cannot reach database server. Check:');
      console.log('   1. DATABASE_URL in .env file');
      console.log('   2. Internet connection');
      console.log('   3. Supabase database is running');
    } else if (error.code === 'P2021') {
      console.log('\n💡 Table does not exist. Run:');
      console.log('   npx prisma migrate dev --name init');
    } else {
      console.log('\n💡 Try running:');
      console.log('   1. npx prisma generate');
      console.log('   2. npx prisma migrate dev --name init');
    }
    
    console.log('\n');
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down server...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

startServer();
