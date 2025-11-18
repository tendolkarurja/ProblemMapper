// backend/controller/problemController.js

const Problem = require('../models/Problems.js'); // Assuming this is the correct Model constant

// ------------------------------------
// 1. CREATE Problem
// ------------------------------------
exports.createProblem = async(req, res) =>{ // <-- FIX: Changed from 'const' to 'exports.'
    try {
        const newProblem = await Problem.create({ // Use uppercase 'Problem'
            ...req.body, 
            reportedBy: req.user._id 
        });

        res.status(201).json({
            status:'success',
            data : { problem: newProblem } // ✅ NOTE: Changed back to lowercase 'problem' here, as it's cleaner for JSON data keys
        });

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// ------------------------------------
// 2. GET All Problems
// ------------------------------------
exports.getAllProblems = async(req, res) =>{ // <-- FIX: Changed from 'const' to 'exports.'
    const problems = await Problem.find().sort({ createdAt: -1 }); // Use uppercase 'Problem'
    res.status(200).json({
        status: 'success',
        results: problems.length,
        data: { problems }
    });
};

// ------------------------------------
// 3. GET Problems Near Me
// ------------------------------------
exports.getProblemsNear = async(req, res) => { // <-- FIX: Changed from 'const' to 'exports.'
    const { lon, lat, distance } = req.query;

    if (!lon || !lat || !distance) {
        return res.status(400).json({
            status: 'fail',
            message: 'Missing required query parameters: lon, lat, and distance.'
        });
    }

    try {
        const problems = await Problem.find({ // Use uppercase 'Problem'
            location: {
                $nearSphere: {
                    $geometry:{
                        type: "Point",
                        coordinates: [parseFloat(lon), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(distance) 
                }
            }
        });

        res.status(200).json({
            status: 'success',
            results: problems.length,
            data: { problems }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Error executing geospatial query.'
        });
    }
};

// ❌ REMOVE THIS BLOCK ENTIRELY
/* module.exports = {
    createProblem,
    getAllProblems,
    getProblemsNear
};
*/