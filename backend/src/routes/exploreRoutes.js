const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/exploreController');

router.get('/destinations', exploreController.getDestinations);
router.get('/activities', exploreController.getActivities);

module.exports = router;
