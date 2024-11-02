const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationsController');

// Get recommendations for a user
router.get('/:userId', getRecommendations);

module.exports = router;
