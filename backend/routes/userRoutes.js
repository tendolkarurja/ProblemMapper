const express = require('express');
const router = express.Router();
const authController = require('../controller/authController.js'); // Assuming 'controller' folder is correct

// Routes for Registration and Login
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

module.exports = router;