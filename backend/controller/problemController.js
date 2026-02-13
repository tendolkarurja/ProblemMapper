const Problem = require('../models/Problems.js'); 
const mongoose = require('mongoose');

// ------------------------------------
// 1. CREATE Problem
// ------------------------------------
exports.createProblem = async(req, res) =>{
    const PLACEHOLDER_USER_ID = '656e18f2f2545f1b0a8f8d9a';
    const reporterId = req.user && req.user.userId
        ? req.user.userId // Success: Use the verified ID
        : PLACEHOLDER_USER_ID;

    console.log(reporterId);
    try {
        const newProblem = await Problem.create({ 
            ...req.body,
            reportedBy : reporterId
        });

        res.status(201).json({
            status:'success',
            data : { problem: newProblem }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.upvoteProblem = async (req, res) => {
    try {
        // 1. Validate User Presence immediately
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ status: 'fail', message: 'User missing or not logged in.' });
        }

        const problemId = req.params.id;
        const voterId = req.user.userId;

        // 2. Fetch the problem
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({ status: 'fail', message: 'Problem not found.' });
        }

        // 3. Self-Upvote Check (using .toString() for safety)
        if (problem.reportedBy && problem.reportedBy.toString() === voterId) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'You cannot upvote a problem that you reported.' 
            });
        }

        // 4. Determine Vote Logic
        // Check if voterId exists in the upvotedBy array
        const hasVoted = (problem.upvotedBy||[]).some(id => id.toString() === voterId);
        
        let updateQuery;
        if (hasVoted) {
            updateQuery = {
                $pull: { upvotedBy: new mongoose.Types.ObjectId(voterId) },
                $inc: { upvoteCount: -1 } // Corrected field name from your screenshot
            };
        } else {
            updateQuery = {
                $push: { upvotedBy: new mongoose.Types.ObjectId(voterId) },
                $inc: { upvoteCount: 1 } // Corrected field name from your screenshot
            };
        }

        // 5. Execute Atomic Update
        const updatedProblem = await Problem.findByIdAndUpdate(problemId, updateQuery, {
            new: true, // Returns the document AFTER update so Postman sees the change
            runValidators: true
        });

        return res.status(200).json({
            status: 'success',
            message: 'Votes successfully updated.',
            data: { problem: updatedProblem }
        });

    } catch (err) {
        // Handle Invalid ObjectID formats or server errors
        return res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.updateProblemStatus = async (req, res) => {
    const problemId = req.params.id;
    const newStatus = req.body.status; 

    if (!newStatus || !['Reported', 'In Progress', 'Resolved'].includes(newStatus)) {
        return res.status(400).json({ status: 'fail', message: 'Invalid status provided.' });
    }


    try {
        const updatedProblem = await Problem.findByIdAndUpdate(problemId, {
            status: newStatus 
        }, {
            new: true,
            runValidators: true
        });

        if (!updatedProblem) {
            return res.status(404).json({ status: 'fail', message: 'Problem not found.' });
        }

        return res.status(200).json({
            status: 'success',
            message: `Status updated to ${newStatus}.`,
            data: { problem: updatedProblem }
        });

    } catch (err) {
        return res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getProblems = async (req, res) => {
    try {
        
        const { lon, lat, distance, category, problemId } = req.query;
        let query = {};

        if (lon && lon >= 0 && lat  && lat >= 0 && distance) {
            
            const longitude = parseFloat(lon);
            const latitude = parseFloat(lat);
            const dist = parseInt(distance);

            query.location = {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: dist
                }
            };
            
        }

        if (category) {
            const categoryFilter = Array.isArray(category) ? category : [category];
            query.category = { $in: categoryFilter }
        }

        if (problemId) {
            query.qid = problemId;
        }

        // Execute query
        const problems = await Problem.find(query);

        res.status(200).json({
            status: 'success',
            results: problems.length,
            data: { problems }
        });

    } catch (err) {
        console.error("Query Error:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};