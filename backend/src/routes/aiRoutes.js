const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/chat', aiController.handleChat);
router.post('/generate-plan', aiController.handleGeneratePlan);

module.exports = router;
