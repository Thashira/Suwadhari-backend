// Authentication Routes - Developer 1
const express = require('express');
const authController = require('../controllers/authController');
const loginValidator = require('../../middleware/loginValidator');
const registerValidator = require('../../middleware/registerValidator');

const router = express.Router();

// Registration route with validation middleware
router.post('/register', registerValidator, authController.register);

// Login route with validation middleware (Base middleware)
router.post('/login', loginValidator, authController.login);

// Logout route
router.post('/logout', authController.logout);

module.exports = router;
