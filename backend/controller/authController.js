const User = require('../models/Users.js'); // Assuming you fixed the import path and name
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// // Helper function to create the JWT token
// const signToken = (id) => {
//     console.log("SIGN SECRET LENGTH:", process.env.JWT_SECRET);
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN || '1h' // Token expires after 1h
//     });
// };

// // Helper function to send the JWT token back to the client
// const createSendToken = (user, statusCode, res) => {
//     const token = signToken(user._id);

//     // Remove password from output (it was hidden by select: false, but this ensures it)
//     user.password = undefined; 

//     res.status(statusCode).json({
//         status: 'success',
//         token,
//         data: { user }
//     });
// };

exports.userLogin = async(req, res) => {
    const key = process.env.JWT_SECRET;

    try{
        const {email, password} = req.body;
        const account = await User.findOne({email}).select('+password'); // did this because schema has password select = false, so to compensate for that.

        if (!account){
            res.status(404).json({'message':'No such user found'});
        }

        console.log('Hash: ', account.password);
        
        const match = await bcrypt.compare(password, account.password);
        if(!match){
            res.status(401).json({'message':'Authentication failed'});

        }

        const token = jwt.sign({
            userId: account._id,
            email: account.email,
        }, key, {expiresIn: '1h'});


        res.status(200).json({ token, userId: account._id });
    }

    catch(error){
        res.status(400).json({'error': error.message})
    }
}

exports.userRegister = async(req, res) => {
    try {
        const { username, email, password } = req.body; 
        const user = new User({ username, email, password }); 
        await user.save(); 
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}