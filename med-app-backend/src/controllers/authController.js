// Authentication Controller - Developer 1
//test
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Safe JWT fallbacks for development if env vars are not set
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set. Using development fallback secret.');
}

//doctor register
// Register User (uses registerValidator middleware)
const register = async (req, res) => {
  try {
    const newUser = req.newUser;

    console.log(`Creating user in database: ${newUser.email}`);

    // Query: Create user in online PostgreSQL database
    const user = await prisma.user.create({
      data: {
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        physicianId: newUser.physicianId,
        birthDay: newUser.birthDay,
        nic: newUser.nic,
        username: newUser.username,
        addressId: newUser.addressId,
        tel: newUser.tel,
        role: newUser.role,
        isActive: true,
      },
      select: {
        id: true,
        physicianId: true,
        name: true,
        birthDay: true,
        nic: true,
        username: true,
        addressId: true,
        email: true,
        tel: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`User created successfully: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration error',
      error: error.message,
    });
  }
};

// Login User (uses loginValidator middleware)
const login = async (req, res) => {
  try {
    const user = req.user;
    const token = req.token;

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: {
        token,
        user: {
          id: user.id,
          physicianId: user.physicianId,
          name: user.name,
          birthDay: user.birthDay,
          nic: user.nic,
          username: user.username,
          addressId: user.addressId,
          email: user.email,
          tel: user.tel,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login error',
      error: error.message,
    });
  }
};

// Logout User
const logout = async (req, res) => {
  try {
    // Optional: Add token to blacklist or database for invalidation
    // TODO: Implement token blacklist logic if needed

    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout error',
      error: error.message,
    });
  }
};

// Create a test patient for quick testing
const createTestPatient = async (req, res) => {
  try {
    const testEmail = 'test.patient@example.com';
    const plainPassword = 'Testing@123';

    // Check if test patient already exists
    let user = await prisma.user.findUnique({ where: { email: testEmail } });

    if (user) {
      return res.status(200).json({
        success: true,
        message: 'Test patient already exists',
        data: {
          email: testEmail,
          username: user.username || 'testing',
        },
      });
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Test Patient',
        username: 'testing',
        role: 'patient',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Test patient created',
      data: { user, credentials: { email: testEmail, password: plainPassword } },
    });
  } catch (error) {
    console.error('Create test patient error:', error);
    res.status(500).json({ success: false, message: 'Error creating test patient', error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  createTestPatient,
};
