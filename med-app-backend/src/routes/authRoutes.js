// Authentication Routes - Developer 1
const express = require('express');
const authController = require('../controllers/authController');
const loginValidator = require('../../middleware/loginValidator');
const registerValidator = require('../../middleware/registerValidator');

const router = express.Router();

// Registration route with validation middleware
router.post('/register', registerValidator, authController.register);

// Create a test patient for testing purposes
router.post('/register/test-patient', authController.createTestPatient);

// Login route with validation middleware (Base middleware)
router.post('/login', loginValidator, authController.login);

// Logout route
router.post('/logout', authController.logout);

module.exports = router;
