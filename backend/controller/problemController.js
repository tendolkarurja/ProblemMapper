const problem = require('../models/Problems.js');

const createProblem = async(req, res) =>{
    const newProblem = await problem.create(req.body);

    res.status(201).json({
        status:'success',
        data : {problem: newProblem}
    })
};

const getAllProblems = async(req, res) =>{
    const problems = await problem.find().sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: problems.length,
        data: { problems }
    });
};

const getProblemsNear = async(req, res) => {
    const { lon, lat, distance } = req.query;

    if (!lon || !lat || !distance) {
        return res.status(400).json({
            status: 'fail',
            message: 'Missing required query parameters: lon, lat, and distance.'
        });
    }

    try {
        const problems = await problem.find({
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

module.exports = {
    createProblem,
    getAllProblems,
    getProblemsNear
};