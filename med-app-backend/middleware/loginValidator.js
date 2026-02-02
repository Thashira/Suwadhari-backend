// Login Validator Middleware - Validate credentials from online database
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Ensure JWT secret and expiration have safe fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set. Using development fallback secret.');
}

/**
 * Validates login credentials against online PostgreSQL database
 * Expected body: { email, password }
 */
const loginValidator = async (req, res, next) => {
  try {
    // Accept `username` or a generic `identifier` (username, nic, or tel)
    const { username, identifier, password } = req.body;

    // Validate input: require password and either username or identifier
    if ((!username && !identifier) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/identifier and password are required',
      });
    }

    const searchValue = username || identifier;
    console.log(`Attempting login for identifier: ${searchValue}`);

    // Query: Find user by username, nic, or tel
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: searchValue },
          { nic: searchValue },
          { tel: searchValue },
        ],
      },
    });

    if (!user) {
      console.log(`User not found: ${searchValue}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    // Validate password against hashed password in database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${searchValue}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    console.log(`Login successful for user: ${searchValue}`);

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // Update last login timestamp in database
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Attach user and token to request for controller to use
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Login validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Login validation error',
      error: error.message,
    });
  }
};

module.exports = loginValidator;
