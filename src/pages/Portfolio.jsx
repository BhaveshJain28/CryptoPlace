import React, { useContext, useEffect, useState } from 'react';
import './Portfolio.css';
import '../pages/Home.css';
import { CoinContext } from '../context/CoinContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

function Portfolio() {
    const { allCoins, currency } = useContext(CoinContext);
    const { token } = useContext(AuthContext);
    
    const [portfolioData, setPortfolioData] = useState({
        holdings: [],
        totalCurrentValue: 0,
        totalInvestedValue: 0,
        totalGainLoss: 0
    });
    
    const [formInput, setFormInput] = useState({
        coinId: '',
        amount: '',
        avgBuyPrice: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const fetchPortfolio = async () => {
        if (!token) return;
        try {
            const { data } = await api.get('/portfolio', {
                params: { vs_currency: currency.name }
            });
            setPortfolioData(data);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, [currency, token]);

    const handleInputChange = (e) => {
        setFormInput({ ...formInput, [e.target.name]: e.target.value });
    };

    const handleAddHolding = async (e) => {
        e.preventDefault();
        
        // Find actual coinId from the input which might be a coin name
        const selectedCoin = allCoins.find(c => 
            c.id === formInput.coinId || 
            c.name.toLowerCase() === formInput.coinId.toLowerCase()
        );
        
        const actualCoinId = selectedCoin ? selectedCoin.id : formInput.coinId;

        if (!actualCoinId || !formInput.amount || !formInput.avgBuyPrice) return;

        setIsLoading(true);
        try {
            await api.post('/portfolio', {
                coinId: actualCoinId.toLowerCase(),
                amount: Number(formInput.amount),
                avgBuyPrice: Number(formInput.avgBuyPrice)
            });
            setFormInput({ coinId: '', amount: '', avgBuyPrice: '' });
            fetchPortfolio();
        } catch (error) {
            console.error('Error adding holding:', error);
            alert(error.response?.data?.message || 'Failed to add holding');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveHolding = async (coinId) => {
        if (!window.confirm('Are you sure you want to remove this holding?')) return;
        
        try {
            await api.delete(`/portfolio/${coinId}`);
            fetchPortfolio();
        } catch (error) {
            console.error('Error removing holding:', error);
        }
    };

    const totalGainLossPercent = portfolioData.totalInvestedValue > 0 
        ? (portfolioData.totalGainLoss / portfolioData.totalInvestedValue) * 100 
        : 0;

    return (
        <div className='portfolio'>
            <div className="portfolio-header">
                <h2>My Portfolio</h2>
                <div className="portfolio-totals">
                    <div className="total-item">
                        <span>Current Value</span>
                        <span>{currency.symbol}{portfolioData.totalCurrentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="total-item">
                        <span>Invested</span>
                        <span>{currency.symbol}{portfolioData.totalInvestedValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="total-item">
                        <span>Total P/L</span>
                        <span className={portfolioData.totalGainLoss >= 0 ? "green" : "red"} style={{ color: portfolioData.totalGainLoss >= 0 ? '#22c55e' : '#ef4444' }}>
                            {portfolioData.totalGainLoss >= 0 ? '+' : ''}
                            {currency.symbol}{Math.abs(portfolioData.totalGainLoss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            {" "}
                            ({portfolioData.totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>
            </div>

            <form className="add-holding-form" onSubmit={handleAddHolding}>
                <div className="form-group">
                    <label>Select Coin</label>
                    <input 
                        name="coinId"
                        type="text" 
                        placeholder="e.g. Bitcoin" 
                        value={formInput.coinId}
                        onChange={handleInputChange}
                        list="coin-options"
                        required
                    />
                    <datalist id="coin-options">
                        {allCoins.map((coin) => (
                            <option key={coin.id} value={coin.name} />
                        ))}
                    </datalist>
                </div>
                <div className="form-group">
                    <label>Amount Owned</label>
                    <input 
                        name="amount"
                        type="number" 
                        step="any"
                        placeholder="0.00" 
                        value={formInput.amount}
                        onChange={handleInputChange}
                        required
                        min="0.00000001"
                    />
                </div>
                <div className="form-group">
                    <label>Avg. Buy Price ({currency.name.toUpperCase()})</label>
                    <input 
                        name="avgBuyPrice"
                        type="number" 
                        step="any"
                        placeholder="0.00" 
                        value={formInput.avgBuyPrice}
                        onChange={handleInputChange}
                        required
                        min="0.00000001"
                    />
                </div>
                <button type="submit" className="add-btn" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Add Holding'}
                </button>
            </form>

            <div className="crypto_table">
                <div className="table-layout" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.5fr 0.5fr' }}>
                    <p>Coin</p>
                    <p>Amount</p>
                    <p>Avg Buy</p>
                    <p>Current</p>
                    <p style={{textAlign:'right'}}>P/L</p>
                    <p style={{textAlign:'center'}}>Actions</p>
                </div>
                
                {portfolioData.holdings.length > 0 ? portfolioData.holdings.map((item, index) => {
                    const coinDetails = allCoins.find(c => c.id === item.coinId);
                    
                    return (
                        <div className="table-layout" key={index} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.5fr 0.5fr', alignItems: 'center' }}>
                            <Link to={`/coin/${item.coinId}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit', textDecoration: 'none' }}>
                                {coinDetails ? <img src={coinDetails.image} alt={coinDetails.name} /> : <div style={{width: 36, height: 36, borderRadius: '50%', background: '#333'}}></div>}
                                <p style={{ margin: 0 }}>{coinDetails ? coinDetails.name : item.coinId}</p>
                            </Link>
                            <p>{item.amount.toLocaleString()}</p>
                            <p>{currency.symbol}{item.avgBuyPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}</p>
                            <p>{item.currentPrice ? `${currency.symbol}${item.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}` : 'N/A'}</p>
                            
                            <div style={{ textAlign: 'right' }}>
                                {item.gainLoss !== null ? (
                                    <>
                                        <p>{currency.symbol}{item.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                        <p className={item.gainLoss >= 0 ? "green" : "red"} style={{ fontSize: '12px' }}>
                                            {item.gainLoss >= 0 ? '+' : ''}{currency.symbol}{Math.abs(item.gainLoss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                                            {" "}({item.gainLossPercent >= 0 ? '+' : ''}{item.gainLossPercent.toFixed(2)}%)
                                        </p>
                                    </>
                                ) : (
                                    <p>N/A</p>
                                )}
                            </div>
                            
                            <div style={{ textAlign: 'center' }}>
                                <button 
                                    className="delete-btn"
                                    onClick={() => handleRemoveHolding(item.coinId)}
                                    title="Remove Holding"
                                >
                                    ✖
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <p style={{ textAlign: 'center', padding: '30px' }}>Your portfolio is empty. Add a holding above.</p>
                )}
            </div>
        </div>
    );
}

export default Portfolio;
