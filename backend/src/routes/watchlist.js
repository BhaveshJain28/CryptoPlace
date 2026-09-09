const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controller/watchlistController');

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

// GET /api/watchlist - Get user's watchlist
router.get('/', getWatchlist);

// POST /api/watchlist/:coinId - Add a coin to watchlist
router.post('/:coinId', addToWatchlist);

// DELETE /api/watchlist/:coinId - Remove a coin from watchlist
router.delete('/:coinId', removeFromWatchlist);

module.exports = router;
