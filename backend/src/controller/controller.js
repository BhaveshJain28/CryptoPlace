const coingeckoApi = require('../config/coingeckoApi');

const getMarkets = async (req, res) => {
    try {
        const params = {
            vs_currency: req.query.vs_currency || 'usd',
            ...req.query,
        };
        const { data } = await coingeckoApi.get('/coins/markets', { params });
        res.status(200).json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch market data' });
    }
}

const getCoinById = async (req, res) => {
    try {
        const { data } = await coingeckoApi.get(`/coins/${req.params.id}`);
        res.status(200).json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch coin data' });
    }
}

const getMarketChart = async (req, res) => {
    try {
        const { data } = await coingeckoApi.get(`/coins/${req.params.id}/market_chart`, { params: req.query });
        res.status(200).json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch market chart data' });
    }
}

module.exports = {
    getMarkets, getCoinById, getMarketChart
}