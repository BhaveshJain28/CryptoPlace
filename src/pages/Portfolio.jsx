import React, { useContext, useEffect, useState } from 'react';
import './Portfolio.css';
import { CoinContext } from '../context/CoinContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { exportToCSV } from '../utils/exportToCSV';

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
    const [inventorySearch, setInventorySearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [portfolioLoading, setPortfolioLoading] = useState(true);
    const [portfolioError, setPortfolioError] = useState(null);

    const fetchPortfolio = async () => {
        if (!token) { setPortfolioLoading(false); return; }
        setPortfolioError(null);
        setPortfolioLoading(true);
        try {
            const { data } = await api.get('/portfolio', {
                params: { vs_currency: currency.name }
            });
            setPortfolioData(data);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            setPortfolioError('Failed to load portfolio. Please try again.');
        } finally {
            setPortfolioLoading(false);
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

    const handleResetPortfolio = async () => {
        if (!window.confirm('Are you sure you want to completely reset your portfolio? This action cannot be undone.')) return;
        
        try {
            await api.delete('/portfolio/reset');
            fetchPortfolio();
        } catch (error) {
            console.error('Error resetting portfolio:', error);
        }
    };

    const handleDownloadReport = () => {
        const headers = ['Asset', 'Units Held', 'Avg Cost', 'Spot Price', 'Position Value', 'Unrealized P&L'];
        const rows = [headers];
        
        portfolioData.holdings.forEach(item => {
            const coinDetails = allCoins.find(c => c.id === item.coinId);
            const assetName = coinDetails ? coinDetails.name : item.coinId;
            rows.push([
                assetName,
                item.amount,
                item.avgBuyPrice,
                item.currentPrice || 'N/A',
                item.currentValue,
                item.gainLoss !== null ? item.gainLoss : 'N/A'
            ]);
        });
        
        // Add Summary Row
        rows.push(['']);
        rows.push(['SUMMARY']);
        rows.push(['Total Cost Basis', portfolioData.totalInvestedValue]);
        rows.push(['Total Current Value', portfolioData.totalCurrentValue]);
        rows.push(['Total Gain/Loss', portfolioData.totalGainLoss]);
        
        exportToCSV('portfolio_report.csv', rows);
    };

    const totalGainLossPercent = portfolioData.totalInvestedValue > 0 
        ? (portfolioData.totalGainLoss / portfolioData.totalInvestedValue) * 100 
        : 0;

    // Compute real top gainer from holdings
    const topGainer = portfolioData.holdings.reduce((best, item) => {
        if (!best || (item.gainLossPercent ?? -Infinity) > (best.gainLossPercent ?? -Infinity)) return item;
        return best;
    }, null);
    const topGainerCoin = topGainer ? allCoins.find(c => c.id === topGainer.coinId) : null;

    // Filter inventory by search
    const filteredHoldings = inventorySearch.trim()
        ? portfolioData.holdings.filter(item => {
            const coin = allCoins.find(c => c.id === item.coinId);
            const q = inventorySearch.toLowerCase();
            return item.coinId.includes(q) || (coin && (coin.name.toLowerCase().includes(q) || coin.symbol.toLowerCase().includes(q)));
          })
        : portfolioData.holdings;

    if (portfolioLoading) {
        return (
            <div className="spinner"><div className="spin"></div></div>
        );
    }

    if (portfolioError) {
        return (
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', gap:'16px'}}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--drawdown-crimson)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                <p style={{color:'var(--text-secondary)', fontSize:'14px'}}>{portfolioError}</p>
                <button className="action-btn-primary" onClick={fetchPortfolio}>Retry</button>
            </div>
        );
    }

    return (
        <div className='portfolio-page'>
            <div className="breadcrumb">
                <span>Portfolio Simulator</span>
            </div>

            <div className="portfolio-top-grid">
                <div className="valuation-canvas">
                    <div className="canvas-header">
                        <div>
                            <span className="label-caps">SIMULATED VALUATION CANVAS</span>
                            <div className="canvas-main-val">
                                <h1>{currency.symbol}{portfolioData.totalCurrentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>
                                <span className={portfolioData.totalGainLoss >= 0 ? 'green-text' : 'red-text'}>
                                    {portfolioData.totalGainLoss >= 0 ? '↗' : '↘'} {currency.symbol}{Math.abs(portfolioData.totalGainLoss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({portfolioData.totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%) Total P&L
                                </span>
                            </div>
                        </div>
                        <div className="canvas-controls">
                            <button className="action-btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Holding</button>
                        </div>
                    </div>
                    
                    <div className="canvas-chart-area">
                        {portfolioData.holdings.length > 0 ? (() => {
                            // Build a simple bar chart from real holdings current values
                            const totalVal = portfolioData.totalCurrentValue || 1;
                            const colors = ['#8B5CF6', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#06B6D4', '#F97316'];
                            const barW = 800 / portfolioData.holdings.length;
                            return (
                                <svg width="100%" height="100%" viewBox="0 0 800 150" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
                                            <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                                        </linearGradient>
                                    </defs>
                                    {portfolioData.holdings.map((item, i) => {
                                        const pct = (item.currentValue || 0) / totalVal;
                                        const barH = Math.max(pct * 130, 4);
                                        return (
                                            <g key={i}>
                                                <rect
                                                    x={i * barW + barW * 0.1}
                                                    y={150 - barH}
                                                    width={barW * 0.8}
                                                    height={barH}
                                                    fill={colors[i % colors.length]}
                                                    opacity="0.7"
                                                    rx="2"
                                                />
                                            </g>
                                        );
                                    })}
                                </svg>
                            );
                        })() : (
                            <svg width="100%" height="100%" viewBox="0 0 800 150" preserveAspectRatio="none">
                                <line x1="0" y1="75" x2="800" y2="75" stroke="var(--border-structural)" strokeWidth="1" strokeDasharray="8,4" />
                                <circle cx="400" cy="75" r="4" fill="var(--text-tertiary)" />
                            </svg>
                        )}
                    </div>

                    <div className="canvas-footer">
                        {topGainerCoin && topGainer && (
                            <div className="footer-stat">
                                <span className="label-caps">TOP PERFORMER</span>
                                <span>{topGainerCoin.name} <span className={topGainer.gainLossPercent >= 0 ? 'green-text' : 'red-text'}>{topGainer.gainLossPercent >= 0 ? '+' : ''}{topGainer.gainLossPercent?.toFixed(2)}%</span></span>
                            </div>
                        )}
                        <div className="footer-stat">
                            <span className="label-caps">TOTAL COST BASIS</span>
                            <span>{currency.symbol}{portfolioData.totalInvestedValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="footer-actions">
                            <button className="action-btn-outline" onClick={handleResetPortfolio}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.57l-5.67 5.67"></path></svg> Reset Portfolio</button>
                            <button className="action-btn-outline" onClick={handleDownloadReport}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download Report</button>
                        </div>
                    </div>
                </div>

                <div className="allocation-vector">
                    <div className="vector-header">
                        <span className="label-caps">CAPITAL ALLOCATION VECTOR</span>
                        <span>{portfolioData.holdings.length} Core Assets</span>
                    </div>
                    <p className="vector-desc">Weighted target distribution adjusted for variance and current spot exposure.</p>
                    
                    <div className="vector-bars">
                        {portfolioData.holdings.map((item, index) => {
                            const coinDetails = allCoins.find(c => c.id === item.coinId);
                            const weight = portfolioData.totalCurrentValue > 0 ? (item.currentValue / portfolioData.totalCurrentValue) * 100 : 0;
                            const colors = ['#8B5CF6', '#10B981', '#6366F1', '#F59E0B', '#EF4444'];
                            return (
                                <div className="vector-item" key={index}>
                                    <div className="vector-item-top">
                                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                            <div className="status-dot" style={{backgroundColor: colors[index % colors.length]}}></div>
                                            <span>{coinDetails ? coinDetails.name : item.coinId}</span>
                                        </div>
                                        <span>{weight.toFixed(1)}%</span>
                                    </div>
                                    <div className="vector-bar-bg">
                                        <div className="vector-bar-fill" style={{width: `${weight}%`, backgroundColor: colors[index % colors.length]}}></div>
                                    </div>
                                </div>
                            )
                        })}
                        {portfolioData.holdings.length === 0 && (
                            <p style={{color:'var(--text-secondary)', fontSize:'13px'}}>No holdings yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <form id="add-holding-form" className={`add-holding-form hidden-form${showForm ? ' show' : ''}`} onSubmit={handleAddHolding}>
                <div className="form-group">
                    <label>Select Coin</label>
                    <input name="coinId" type="text" placeholder="e.g. Bitcoin" value={formInput.coinId} onChange={handleInputChange} list="coin-options" required />
                    <datalist id="coin-options">{allCoins.map((coin) => <option key={coin.id} value={coin.name} />)}</datalist>
                </div>
                <div className="form-group">
                    <label>Amount Owned</label>
                    <input name="amount" type="number" step="any" placeholder="0.00" value={formInput.amount} onChange={handleInputChange} required min="0.00000001" />
                </div>
                <div className="form-group">
                    <label>Avg. Buy Price</label>
                    <input name="avgBuyPrice" type="number" step="any" placeholder="0.00" value={formInput.avgBuyPrice} onChange={handleInputChange} required min="0.00000001" />
                </div>
                <button type="submit" className="action-btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Add Holding'}</button>
            </form>

            <div className="inventory-section">
                <div className="inventory-header">
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <h3>Simulated Position Inventory</h3>
                        <span className="label-caps">{portfolioData.holdings.length} Positions Active</span>
                    </div>
                    <div style={{display:'flex', gap:'16px'}}>
                            <div className="search-box" style={{width: '200px'}}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input
                                    type="text"
                                    placeholder="Filter positions..."
                                    value={inventorySearch}
                                    onChange={e => setInventorySearch(e.target.value)}
                                />
                            </div>
                        </div>
                </div>

                <div className="crypto_table portfolio-table-container">
                    <div className="watchlist-table-layout watchlist-header-row label-caps" style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid var(--border-structural)'}}>
                        <p>ASSET</p>
                        <p>ALLOCATION</p>
                        <p style={{textAlign:'right'}}>UNITS HELD</p>
                        <p style={{textAlign:'right'}}>AVG COST</p>
                        <p style={{textAlign:'right'}}>SPOT PRICE</p>
                        <p style={{textAlign:'right'}}>POSITION VALUE</p>
                        <p style={{textAlign:'right'}}>UNREALIZED P&L</p>
                        <p style={{textAlign:'right'}}>EXECUTION</p>
                    </div>
                    
                    {filteredHoldings.length > 0 ? filteredHoldings.map((item, index) => {
                        const coinDetails = allCoins.find(c => c.id === item.coinId);
                        const weight = portfolioData.totalCurrentValue > 0 ? (item.currentValue / portfolioData.totalCurrentValue) * 100 : 0;
                        const colors = ['#8B5CF6', '#10B981', '#6366F1', '#F59E0B', '#EF4444'];
                        
                        return (
                            <div className="watchlist-table-layout watchlist-row" key={index} style={{gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 1fr'}}>
                                <div className="asset-col">
                                    {allCoins.find(c => c.id === item.coinId)?.image 
                                        ? <img src={allCoins.find(c => c.id === item.coinId).image} alt="" style={{width:'28px', height:'28px', borderRadius:'50%'}} />
                                        : <div style={{width:'28px', height:'28px', borderRadius:'50%', background:'var(--surface-level-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:600}}>{item.coinId.charAt(0).toUpperCase()}</div>
                                    }
                                    <div>
                                        <p style={{fontWeight:500, fontSize:'14px', marginBottom:'2px'}}>{allCoins.find(c => c.id === item.coinId)?.name || item.coinId}</p>
                                        <p className="label-caps">{allCoins.find(c => c.id === item.coinId)?.symbol?.toUpperCase() || ''}</p>
                                    </div>
                                </div>
                                <div className="alloc-col" style={{display:'flex', flexDirection:'column', gap:'6px', width:'100%'}}>
                                    <span className="metric">{weight.toFixed(2)}%</span>
                                    <div className="vector-bar-bg" style={{height:'4px', width:'120px'}}><div className="vector-bar-fill" style={{width: `${weight}%`, backgroundColor: colors[index % colors.length]}}></div></div>
                                </div>
                                <p className="metric" style={{textAlign:'right', fontWeight:600}}>{item.amount.toLocaleString(undefined, {minimumFractionDigits: 8, maximumFractionDigits: 8})}</p>
                                <p className="metric" style={{textAlign:'right'}}>{currency.symbol}{item.avgBuyPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                <p className="metric" style={{textAlign:'right'}}>{currency.symbol}{item.currentPrice ? item.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'N/A'}</p>
                                <p className="metric" style={{textAlign:'right', fontWeight:600}}>{currency.symbol}{item.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {item.gainLoss !== null ? (
                                        <>
                                            <p className={`metric ${item.gainLoss >= 0 ? "green" : "red"}`} style={{fontWeight:600}}>
                                                {item.gainLoss >= 0 ? '+' : ''}{currency.symbol}{Math.abs(item.gainLoss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                            </p>
                                            <p className={`metric ${item.gainLoss >= 0 ? "green" : "red"}`} style={{ fontSize: '11px' }}>
                                                {item.gainLossPercent >= 0 ? '+' : ''}{item.gainLossPercent.toFixed(2)}%
                                            </p>
                                        </>
                                    ) : (
                                        <p className="metric">N/A</p>
                                    )}
                                </div>
                                <div className="row-actions" style={{justifyContent: 'flex-end', display: 'flex', gap: '8px'}}>
                                    <button className="export-btn" onClick={() => handleRemoveHolding(item.coinId)} style={{padding: '4px 8px', fontSize: '11px', color:'var(--drawdown-crimson)'}}>Remove</button>
                                </div>
                            </div>
                        );
                    }) : (
                        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No positions active. Add holdings via the simulator form.</p>
                    )}
                </div>
                
                <div className="inventory-footer">
                    <span style={{color: 'var(--text-secondary)', fontSize: '12px'}}>Prices updated live via CoinGecko API</span>
                    <span>Settlement Currency: {currency.name.toUpperCase()}</span>
                </div>
            </div>


        </div>
    );
}

export default Portfolio;
