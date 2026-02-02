// Registration Validator Middleware - Validate registration data from online database
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Validates registration data before creating new user in online database
 * Expected body: { email, password, confirmPassword, name, physicianId, birthDay, nic, username, addressId, tel, role }
 */
const registerValidator = async (req, res, next) => {
  try {
    const {
      email,
      password,
      confirmPassword,
      name,
      physicianId,
      birthDay,
      nic,
      username,
      addressId,
      tel,
      role
    } = req.body;

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

    // Query: Check if user already exists in online database by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      console.log(`User already exists with email: ${email}`);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUserByUsername) {
        console.log(`User already exists with username: ${username}`);
        return res.status(409).json({
          success: false,
          message: 'Username already taken',
        });
      }
    }

    // Check if NIC already exists (if provided)
    if (nic) {
      const existingUserByNic = await prisma.user.findUnique({
        where: { nic },
      });

      if (existingUserByNic) {
        console.log(`User already exists with NIC: ${nic}`);
        return res.status(409).json({
          success: false,
          message: 'User with this NIC already exists',
        });
      }
    }

    // Check if physicianId already exists (if provided)
    if (physicianId) {
      const existingUserByPhysicianId = await prisma.user.findUnique({
        where: { physicianId },
      });

      if (existingUserByPhysicianId) {
        console.log(`User already exists with Physician ID: ${physicianId}`);
        return res.status(409).json({
          success: false,
          message: 'Physician ID already registered',
        });
      }
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Hashed password for new user: ${email}`);

    // Validate and normalize role
    const allowedRoles = ['doctor', 'hospital', 'patient', 'pharmacy'];
    let normalizedRole = 'patient';
    if (role) {
      const r = String(role).toLowerCase();
      if (!allowedRoles.includes(r)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`,
        });
      }
      normalizedRole = r;
    }

    // Attach sanitized data to request
    req.newUser = {
      email,
      password: hashedPassword,
      name,
      physicianId: physicianId || null,
      birthDay: birthDay ? new Date(birthDay) : null,
      nic: nic || null,
      username: username || null,
      addressId: addressId ? parseInt(addressId) : null,
      tel: tel || null,
      role: normalizedRole,
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
