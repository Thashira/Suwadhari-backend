// Registration Validator Middleware - Validate registration data from online database
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Validates registration data before creating new user in online database
 * Expected body: { email, password, confirmPassword, name }
 */
const registerValidator = async (req, res, next) => {
  try {
    const { email, password, confirmPassword, name } = req.body;

    // Validate required fields
    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    console.log(`Attempting registration for email: ${email}`);

    // Query: Check if user already exists in online database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`User already exists: ${email}`);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Hashed password for new user: ${email}`);

    // Attach sanitized data to request
    req.newUser = {
      email,
      password: hashedPassword,
      name,
      role: 'user',  // Default role
    };

    next();
  } catch (error) {
    console.error('Registration validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration validation error',
      error: error.message,
    });
  }
};

module.exports = registerValidator;

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Attach sanitized data to request
    req.newUser = {
      email,
      password: hashedPassword,
      name,
      role: 'user',  // Default role
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration validation error',
      error: error.message,
    });
  }
};

module.exports = registerValidator;
