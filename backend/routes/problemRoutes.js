const express = require('express');
const router = express.Router();

const problemController = require('../controller/problemController.js');

router
    .route('/')
    .post(problemController.createProblem)
    .get(problemController.getAllProblems);

router.get('/near', problemController.getProblemsNear);

module.exports = router;
    