require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const problemRoutes = require('./routes/problemRoutes.js');
app.use('/api/problems', problemRoutes);

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

