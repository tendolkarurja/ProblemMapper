const express = require('express');
const router = express.Router();

const problemController = require('../controller/problemController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

router
    .route('/')
    .post('''authMiddleware.protect,''' problemController.createProblem) 
    .get(problemController.getAllProblems);

router.get('/near', problemController.getProblemsNear);

module.exports = router;
    