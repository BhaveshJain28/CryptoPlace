const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPortfolio, addOrUpdateHolding, removeHolding } = require('../controller/portfolioController');

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

// GET /api/portfolio
router.get('/', getPortfolio);

// POST /api/portfolio
router.post('/', addOrUpdateHolding);

// DELETE /api/portfolio/:coinId
router.delete('/:coinId', removeHolding);

module.exports = router;
