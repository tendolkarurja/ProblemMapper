require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// allow clients to retrieve stored photos
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const problemRoutes = require('./routes/problemRoutes.js');
app.use('/api/problems', problemRoutes);

const userRoutes = require('./routes/userRoutes.js');
app.use('/api/auth', userRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully!'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); 
    });

app.get('/', (req, res) => {
    res.send('Welcome to the Problem Mapper Backend API!');
});

// --- 5. Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running... on port ${PORT}`);
});

