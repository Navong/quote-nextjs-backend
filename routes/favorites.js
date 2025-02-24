const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');

// Get all favorites for a user
router.get('/:userId', favoritesController.getFavorites);

// Add a quote to favorites
router.post('/', favoritesController.addFavorite);

// Remove a quote from favorites
router.delete('/:userId', favoritesController.deleteFavorite);

module.exports = router;
