const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // Node.js utility to convert callbacks to promises
const User = require('../models/Users.js'); 

exports.protect = async (req, res, next) => {
    let token;

    // 1) Get token ONLY from the Authorization Header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ 
            status: 'fail', 
            message: 'You must provide a valid token to report a problem.' 
        });
    }

    try {
        // 2) Verify token (decoded payload contains the user ID)
        console.log("Verify Secret Length: ", process.env.JWT_SECRET.length);
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        // We use .select('+password') in login, but findById is fine here since password is not needed.
        const currentUser = await User.findById(decoded.id); 
        if (!currentUser) {
            return res.status(401).json({
                status: 'fail',
                message: 'User not found or token invalid.'
            });
        }
        
        // 4) GRANT ACCESS & Attach user to the request object
        req.user = currentUser; 
        next();
       
    } catch (err) {
        res.status(401).json({
            status: 'fail',
            message: 'Invalid or expired token.'
        });
    }
};