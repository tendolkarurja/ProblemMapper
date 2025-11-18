const User = require('../models/Users.js'); // Assuming you fixed the import path and name
const jwt = require('jsonwebtoken');

// Helper function to create the JWT token
const signToken = (id) => {
    // The token includes the user's ID and is signed using the secret from your .env file
    console.log("SIGN SECRET LENGTH:", process.env.JWT_SECRET.length);
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h' // Token expires after 1h
    });
};

// Helper function to send the JWT token back to the client
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Options for the cookie (optional but good practice for frontend security)
    const cookieOptions = {
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hr
        httpOnly: true // Cookie is inaccessible to client-side scripts
    };

    // Send the cookie and the JSON response
    res.cookie('jwt', token, cookieOptions);

    // Remove password from output (it was hidden by select: false, but this ensures it)
    user.password = undefined; 

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    });
};


exports.registerUser = async (req, res, next) => {
    try {
        // Create a new user (the password gets hashed automatically by Mongoose pre('save'))
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            // Optionally include role if you allow initial role setting
            role: req.body.role 
        });

        // Send a JWT token back to the client, logging them in immediately
        createSendToken(newUser, 201, res);
    } catch (err) {
        // Handle validation errors (e.g., duplicate email/username, short password)
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// ------------------------------------
// 2. USER LOGIN (POST /api/auth/login)
// ------------------------------------
exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return res.status(400).json({ 
            status: 'fail', 
            message: 'Please provide email and password!' 
        });
    }

    // 2) Check if user exists AND password is correct
    // .select('+password') is needed because we set select: false in the UserSchema
    const user = await User.findOne({ email }).select('+password'); 

    if (!user || !(await user.comparePassword(password, user.password))) {
        return res.status(401).json({ 
            status: 'fail', 
            message: 'Incorrect email or password' 
        });
    }

    // 3) If everything is ok, send token to client
    createSendToken(user, 200, res);
};