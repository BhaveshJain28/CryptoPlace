const Portfolio = require('../models/Portfolio');
const coingeckoApi = require('../config/coingeckoApi');

const getPortfolio = async (req, res) => {
    try {
        const vs_currency = req.query.vs_currency || 'usd';
        const portfolio = await Portfolio.findOne({ userId: req.user.userId });
        
        if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
            return res.status(200).json({ 
                holdings: [], 
                totalCurrentValue: 0, 
                totalInvestedValue: 0, 
                totalGainLoss: 0 
            });
        }

        const coinIds = portfolio.holdings.map(h => h.coinId);
        let pricesData = {};
        
        try {
            const { data } = await coingeckoApi.get('/simple/price', {
                params: {
                    ids: coinIds.join(','),
                    vs_currencies: vs_currency
                }
            });
            pricesData = data;
        } catch (cgError) {
            console.error('Error fetching prices from CoinGecko:', cgError.message);
            // We continue with empty pricesData to return holdings with null prices
        }

        let totalCurrentValue = 0;
        let totalInvestedValue = 0;

        const enrichedHoldings = portfolio.holdings.map(holding => {
            const h = holding.toObject();
            const currentPrice = pricesData[h.coinId]?.[vs_currency] || null;
            
            const investedValue = h.amount * h.avgBuyPrice;
            totalInvestedValue += investedValue;
            
            let currentValue = null;
            let gainLoss = null;
            let gainLossPercent = null;
            
            if (currentPrice !== null) {
                currentValue = h.amount * currentPrice;
                totalCurrentValue += currentValue;
                gainLoss = currentValue - investedValue;
                gainLossPercent = (gainLoss / investedValue) * 100;
            }

            return {
                ...h,
                currentPrice,
                currentValue,
                investedValue,
                gainLoss,
                gainLossPercent
            };
        });

        res.status(200).json({
            holdings: enrichedHoldings,
            totalCurrentValue,
            totalInvestedValue,
            totalGainLoss: totalCurrentValue - totalInvestedValue
        });

    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ message: 'Server error fetching portfolio' });
    }
};

const addOrUpdateHolding = async (req, res) => {
    try {
        const { coinId, amount, avgBuyPrice } = req.body;
        
        if (!coinId || amount === undefined || avgBuyPrice === undefined) {
            return res.status(400).json({ message: 'coinId, amount, and avgBuyPrice are required' });
        }
        
        if (amount <= 0 || avgBuyPrice <= 0) {
            return res.status(400).json({ message: 'amount and avgBuyPrice must be greater than 0' });
        }

        let portfolio = await Portfolio.findOne({ userId: req.user.userId });
        
        if (!portfolio) {
            portfolio = new Portfolio({
                userId: req.user.userId,
                holdings: [{ coinId, amount, avgBuyPrice }]
            });
            await portfolio.save();
            return res.status(201).json({ message: 'Portfolio created and holding added', holdings: portfolio.holdings });
        }

        const holdingIndex = portfolio.holdings.findIndex(h => h.coinId === coinId);
        
        if (holdingIndex >= 0) {
            portfolio.holdings[holdingIndex].amount = amount;
            portfolio.holdings[holdingIndex].avgBuyPrice = avgBuyPrice;
        } else {
            portfolio.holdings.push({ coinId, amount, avgBuyPrice });
        }
        
        await portfolio.save();
        res.status(200).json({ message: 'Holding saved', holdings: portfolio.holdings });
        
    } catch (error) {
        console.error('Error adding holding:', error);
        res.status(500).json({ message: 'Server error adding holding' });
    }
};

const removeHolding = async (req, res) => {
    try {
        const { coinId } = req.params;
        
        if (!coinId) {
            return res.status(400).json({ message: 'Coin ID is required' });
        }

        const portfolio = await Portfolio.findOneAndUpdate(
            { userId: req.user.userId },
            { $pull: { holdings: { coinId } } },
            { new: true }
        );

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        res.status(200).json({ message: 'Holding removed', holdings: portfolio.holdings });
        
    } catch (error) {
        console.error('Error removing holding:', error);
        res.status(500).json({ message: 'Server error removing holding' });
    }
};

const resetPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: { holdings: [] } },
            { new: true }
        );

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        res.status(200).json({ message: 'Portfolio reset', holdings: portfolio.holdings });
        
    } catch (error) {
        console.error('Error resetting portfolio:', error);
        res.status(500).json({ message: 'Server error resetting portfolio' });
    }
};

module.exports = {
    getPortfolio,
    addOrUpdateHolding,
    removeHolding,
    resetPortfolio
};
