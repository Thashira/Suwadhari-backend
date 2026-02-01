// Authentication Controller - Developer 1
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
        role: newUser.role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
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
          email: user.email,
          name: user.name,
          role: user.role,
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

module.exports = {
  register,
  login,
  logout,
};
