const express = require('express');
const { getRandomQuoteHandler, getAllQuotesHandler } = require('../controllers/quoteController');
const router = express.Router();

router.get('/random', getRandomQuoteHandler);
router.get('/all', getAllQuotesHandler);

module.exports = router;
