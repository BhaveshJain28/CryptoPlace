const express = require('express');
const router = express.Router();
const {getMarkets,getCoinById,getMarketChart, getGlobal, getTrending}=require('../controller/controller');

router.get('/markets',getMarkets);
router.get('/coins/:id',getCoinById);
router.get('/coins/:id/market_chart',getMarketChart);
router.get('/global', getGlobal);
router.get('/trending', getTrending);

module.exports = router;