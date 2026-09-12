const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
    coinId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0.00000001, 'Amount must be greater than 0']
    },
    avgBuyPrice: {
        type: Number,
        required: true,
        min: [0.00000001, 'Average buy price must be greater than 0']
    }
});

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    holdings: [holdingSchema]
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
