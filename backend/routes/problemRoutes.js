const express = require('express');
const router = express.Router();

const problemController = require('../controller/problemController.js');
const { authMiddleware, restrictUser } = require('../middleware/authMiddleware.js');

// multer configuration for handling uploads in memory
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const { verifyLivePhoto } = require('../middleware/exifMiddleware.js');

// POST now expects a single photo field and verifies EXIF/live-photo constraints
router.post('/', authMiddleware, upload.single('photo'), verifyLivePhoto, problemController.createProblem);
router.get('/', problemController.getProblems);

// router.get('/near', problemController.getProblemsNear);
router.post('/:id/upvote', authMiddleware, problemController.upvoteProblem); // POST to add upvote
router.patch('/:id/status', authMiddleware, restrictUser('admin', 'officer'), problemController.updateProblemStatus); // PATCH to change status

module.exports = router;
    