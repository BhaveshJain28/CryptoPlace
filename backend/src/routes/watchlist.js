const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

// GET /api/watchlist - Get user's watchlist
router.get('/', async (req, res) => {
    try {
        const watchlist = await Watchlist.findOne({ userId: req.user.userId });
        if (!watchlist) {
            return res.status(200).json({ coins: [] });
        }
        res.status(200).json({ coins: watchlist.coins });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/watchlist/:coinId - Add a coin to watchlist
router.post('/:coinId', async (req, res) => {
    try {
        const { coinId } = req.params;
        if (!coinId) {
            return res.status(400).json({ message: 'Coin ID is required' });
        }

        const watchlist = await Watchlist.findOneAndUpdate(
            { userId: req.user.userId },
            { $addToSet: { coins: coinId } },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Coin added to watchlist', coins: watchlist.coins });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/watchlist/:coinId - Remove a coin from watchlist
router.delete('/:coinId', async (req, res) => {
    try {
        const { coinId } = req.params;
        if (!coinId) {
            return res.status(400).json({ message: 'Coin ID is required' });
        }

        const watchlist = await Watchlist.findOneAndUpdate(
            { userId: req.user.userId },
            { $pull: { coins: coinId } },
            { new: true }
        );

        if (!watchlist) {
            return res.status(404).json({ message: 'Watchlist not found' });
        }

        res.status(200).json({ message: 'Coin removed from watchlist', coins: watchlist.coins });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
