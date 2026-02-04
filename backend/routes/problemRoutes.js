const express = require('express');
const router = express.Router();

const problemController = require('../controller/problemController.js');
const { authMiddleware, restrictUser } = require('../middleware/authMiddleware.js');

router.post('/', authMiddleware, problemController.createProblem);
router.get('/', problemController.getAllProblems);

router.get('/near', problemController.getProblemsNear);
router.post('/:id/upvote', authMiddleware, problemController.upvoteProblem); // POST to add upvote
router.patch('/:id/status', authMiddleware, restrictUser('admin', 'officer'), problemController.updateProblemStatus); // PATCH to change status

module.exports = router;
    