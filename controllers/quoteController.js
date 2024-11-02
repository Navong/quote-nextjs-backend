const { getAllQuotes, getRandomQuote } = require('../services/quoteService');

const getRandomQuoteHandler = async (req, res, next) => {
    try {
        const quote = await getRandomQuote();
        res.status(200).json(quote);
    } catch (error) {
        next(error);
    }
};

const getAllQuotesHandler = async (req, res, next) => {
    try {
        const quotes = await getAllQuotes();
        res.status(200).json(quotes);
    } catch (error) {
        next(error);
    }
};

module.exports = { getRandomQuoteHandler, getAllQuotesHandler };
