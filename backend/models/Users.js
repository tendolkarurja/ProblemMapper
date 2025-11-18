// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  //
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // Crucial: Hides password from queries by default
    },
    role: { // Added for Role-Based Dashboards (SCMSC standard)
        type: String,
        enum: ['citizen', 'officer', 'admin'],
        default: 'citizen'
    }
}, { 
    timestamps: true 
});

// PRE-SAVE HOOK: Hashing the password before saving
UserSchema.pre('save', async function(next) {
    // Only run if the password field was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with a cost factor of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Instance method to compare passwords (used at login)
UserSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', UserSchema);