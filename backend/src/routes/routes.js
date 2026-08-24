const express = require('express');
const router = express.Router();
const {getMarkets,getCoinById,getMarketChart}=require('../controller/controller');

router.get('/markets',getMarkets);
router.get('/coins/:id',getCoinById);
router.get('/coins/:id/market_chart',getMarketChart);




module.exports = router;