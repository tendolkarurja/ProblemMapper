const express = require('express');
const router = express.Router();
const authController = require('../controller/authController.js'); // Assuming 'controller' folder is correct

// Routes for Registration and Login
router.post('/register', authController.userRegister);
router.post('/login', authController.userLogin);

module.exports = router;