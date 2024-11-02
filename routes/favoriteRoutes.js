const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController'); // Controller for handling logic

// Add a favorite for a specific user
router.post('/', favoriteController.addFavorite);

// Get all favorites for a specific user
router.get('/:userId', favoriteController.getFavoritesForUser);

// Remove a favorite for a specific user
router.delete('/:userId', favoriteController.removeFavorite);

module.exports = router;