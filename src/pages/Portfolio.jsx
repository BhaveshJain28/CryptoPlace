import React, { useContext, useEffect, useState, useCallback } from 'react';
import './Portfolio.css';
import { CoinContext } from '../context/CoinContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { exportToCSV } from '../utils/exportToCSV';
import Chart from 'react-google-charts';

function Portfolio() {
    const { allCoins, currency } = useContext(CoinContext);
    const { token } = useContext(AuthContext);
    
    const [portfolioData, setPortfolioData] = useState({
        holdings: [],
        totalCurrentValue: 0,
        totalInvestedValue: 0,
        totalGainLoss: 0,
        // Optional historical data - not yet provided by API
        history: null,
        change24hValue: null,
        change24hPercent: null,
        riskMetrics: null
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
    
    const [timeframe, setTimeframe] = useState('1M');
    const [advancedExpanded, setAdvancedExpanded] = useState(false);

    const fetchPortfolio = useCallback(async () => {
        if (!token) { 
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPortfolioLoading(false); 
            return; 
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPortfolioError(null);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPortfolioLoading(true);
        try {
            const { data } = await api.get('/portfolio', {
                params: { vs_currency: currency.name }
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPortfolioData(data);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPortfolioError('Failed to load portfolio. Please try again.');
        } finally {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPortfolioLoading(false);
        }
    }, [currency.name, token]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPortfolio();
    }, [fetchPortfolio]);

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
            setShowForm(false);
            fetchPortfolio();
        } catch (error) {
            console.error('Error adding holding:', error);
            alert(error.response?.data?.message || 'Failed to add holding');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditHolding = (item) => {
        setFormInput({
            coinId: item.coinId,
            amount: item.amount,
            avgBuyPrice: item.avgBuyPrice
        });
        setShowForm(true);
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

    const filteredHoldings = inventorySearch.trim()
        ? portfolioData.holdings.filter(item => {
            const coin = allCoins.find(c => c.id === item.coinId);
            const q = inventorySearch.toLowerCase();
            return item.coinId.includes(q) || (coin && (coin.name.toLowerCase().includes(q) || coin.symbol.toLowerCase().includes(q)));
          })
        : portfolioData.holdings;

    const colors = ['#8B5CF6', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#06B6D4', '#F97316'];

    const generateRealHistory = () => {
        if (!portfolioData.holdings || portfolioData.holdings.length === 0) return null;
        
        let minLength = Infinity;
        const validHoldings = portfolioData.holdings.filter(h => {
            const coin = allCoins.find(c => c.id === h.coinId);
            if (coin?.sparkline_in_7d?.price?.length > 0) {
                minLength = Math.min(minLength, coin.sparkline_in_7d.price.length);
                return true;
            }
            return false;
        });

        if (validHoldings.length === 0) return null;

        const historyData = [['Time', 'Portfolio Value']];
        for (let i = 0; i < minLength; i++) {
            let pointValue = 0;
            validHoldings.forEach(h => {
                const coin = allCoins.find(c => c.id === h.coinId);
                const sparkline = coin.sparkline_in_7d.price;
                const price = sparkline[sparkline.length - minLength + i];
                pointValue += h.amount * price;
            });
            historyData.push([i.toString(), pointValue]);
        }
        return historyData;
    };

    const displayHistory = portfolioData.history || generateRealHistory();

    if (portfolioLoading) {
        return <div className="spinner"><div className="spin"></div></div>;
    }

    if (portfolioError) {
        return (
            <div className="error-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                <p>{portfolioError}</p>
                <button className="btn-primary" onClick={fetchPortfolio}>Retry</button>
            </div>
        );
    }

    return (
        <div className='portfolio-page'>
            <div className="breadcrumb">
                <span>Markets / Portfolio Simulator</span>
                <div className="active-feed"><div className="dot"></div> Live Simulation Feed</div>
            </div>

            <div className="portfolio-card">
                <div className="summary-header">
                    <div className="summary-val-section">
                        <span className="label">Simulated Portfolio</span>
                        {/* Live total current value calculated from real-time API asset prices */}
                        <h1>{currency.symbol}{portfolioData.totalCurrentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>
                        <div className="summary-stats">
                            <div className={`pnl-badge ${portfolioData.totalGainLoss < 0 ? 'negative' : ''}`}>
                                {portfolioData.totalGainLoss >= 0 ? '↗' : '↘'} {currency.symbol}{Math.abs(portfolioData.totalGainLoss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({portfolioData.totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%) All Time P&L
                            </div>
                            <span className="stat-item">Starting Capital: <strong>{currency.symbol}{portfolioData.totalInvestedValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></span>
                            
                            {portfolioData.change24hValue !== null && portfolioData.change24hValue !== undefined ? (
                                <span className="stat-item">24h Change: <strong style={{color: portfolioData.change24hValue >= 0 ? '#10b981' : '#ef4444'}}>{portfolioData.change24hValue >= 0 ? '+' : ''}{currency.symbol}{Math.abs(portfolioData.change24hValue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({portfolioData.change24hValue >= 0 ? '+' : ''}{portfolioData.change24hPercent}%)</strong></span>
                            ) : (
                                <span className="stat-item" style={{color: '#94a3b8'}}>24h Change: <strong>N/A</strong></span>
                            )}
                        </div>
                    </div>
                    <div className="summary-controls">
                        <div className="timeframe-selector">
                            {['24H', '7D', '1M', '1Y', 'ALL'].map(t => (
                                <button key={t} className={`timeframe-pill ${timeframe === t ? 'active' : ''}`} onClick={() => setTimeframe(t)}>{t}</button>
                            ))}
                        </div>
                        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Holding</button>
                        <button className="btn-secondary" onClick={handleResetPortfolio}>Reset Simulator</button>
                        <button className="btn-icon" onClick={handleDownloadReport}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                    </div>
                </div>

                <div className="chart-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {displayHistory ? (
                        <Chart
                            chartType="AreaChart"
                            width="100%"
                            height="100%"
                            data={displayHistory}
                            options={{
                                backgroundColor: 'transparent',
                                colors: ['#818cf8'],
                                areaOpacity: 0.1,
                                lineWidth: 3,
                                curveType: 'function',
                                legend: { position: 'none' },
                                hAxis: { textPosition: 'none', gridlines: { color: 'transparent' }, baselineColor: 'transparent' },
                                vAxis: { textStyle: { color: '#94a3b8', fontSize: 11 }, gridlines: { color: '#1e293b' }, baselineColor: 'transparent', format: 'short' },
                                chartArea: { width: '100%', height: '85%', left: 40, right: 0, top: 10, bottom: 10 }
                            }}
                        />
                    ) : (
                        <div style={{color: '#94a3b8', fontSize: '13px', textAlign: 'center'}}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{opacity: 0.5, marginBottom: '8px', display: 'block', margin: '0 auto'}}>
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                            Historical chart data unavailable. Add assets to generate a chart.
                        </div>
                    )}
                </div>
            </div>

            <div className="portfolio-card">
                <div className="allocation-header">
                    <h3>Asset Allocation</h3>
                    {/* Live count of currently held assets */}
                    <span>{portfolioData.holdings.length} assets in portfolio</span>
                </div>
                
                {portfolioData.holdings.length > 0 ? (
                    <>
                        <div className="allocation-bar-container">
                            {portfolioData.holdings.map((item, index) => {
                                const weight = portfolioData.totalCurrentValue > 0 ? (item.currentValue / portfolioData.totalCurrentValue) * 100 : 0;
                                return (
                                    <div key={index} className="allocation-segment" style={{ width: `${weight}%`, backgroundColor: colors[index % colors.length] }}></div>
                                );
                            })}
                        </div>

                        <div className="allocation-legend">
                            {portfolioData.holdings.map((item, index) => {
                                const coinDetails = allCoins.find(c => c.id === item.coinId);
                                const weight = portfolioData.totalCurrentValue > 0 ? (item.currentValue / portfolioData.totalCurrentValue) * 100 : 0;
                                return (
                                    <div key={index} className="legend-item">
                                        <div className="legend-dot" style={{ backgroundColor: colors[index % colors.length] }}></div>
                                        <span><strong>{coinDetails?.name || item.coinId}</strong> {weight.toFixed(1)}% ({currency.symbol}{item.currentValue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})})</span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div style={{padding: '24px 0', color: '#94a3b8', fontSize: '13px'}}>No assets allocated.</div>
                )}
            </div>

            <div className="portfolio-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px' }}>
                    <div className="table-header">
                        <div className="table-title">
                            <h2>Current Holdings</h2>
                            {/* Live position count from API */}
                            <span>{portfolioData.holdings.length} positions in this simulation</span>
                        </div>
                        <div className="table-actions">
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Filter holdings..." 
                                value={inventorySearch}
                                onChange={e => setInventorySearch(e.target.value)}
                            />
                            <button className="btn-secondary" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3v18"></path><path d="M3 17l4 4 4-4"></path><path d="M7 21V3"></path><path d="M21 7l-4-4-4 4"></path></svg>
                                Rebalance
                            </button>
                        </div>
                    </div>

                    <div className="portfolio-table-container">
                        <table className="crypto-table">
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Allocation</th>
                                    <th>Holdings</th>
                                    <th>Avg Buy Price</th>
                                    <th>Current Price</th>
                                    <th>Total Value</th>
                                    <th>Unrealized P&L</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHoldings.length > 0 ? filteredHoldings.map((item, index) => {
                                    const coinDetails = allCoins.find(c => c.id === item.coinId);
                                    const weight = portfolioData.totalCurrentValue > 0 ? (item.currentValue / portfolioData.totalCurrentValue) * 100 : 0;
                                    const cColor = colors[index % colors.length];
                                    
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <div className="asset-cell">
                                                    {coinDetails?.image ? <img src={coinDetails.image} alt="" /> : <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'center'}}>{item.coinId.charAt(0).toUpperCase()}</div>}
                                                    <div>
                                                        <span className="name">{coinDetails?.name || item.coinId}</span>
                                                        <span className="ticker">{coinDetails?.symbol?.toUpperCase() || ''}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="alloc-cell">
                                                    <span className="pct">{weight.toFixed(1)}%</span>
                                                    <div className="mini-bar-bg">
                                                        <div className="mini-bar-fill" style={{width: `${weight}%`, backgroundColor: cColor}}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{fontWeight: 600}}>{item.amount.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</span> <span style={{fontSize: '12px', color: '#94a3b8'}}>{coinDetails?.symbol?.toUpperCase() || ''}</span>
                                            </td>
                                            <td>{currency.symbol}{item.avgBuyPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                            <td>{currency.symbol}{item.currentPrice ? item.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'N/A'}</td>
                                            <td style={{fontWeight: 600}}>{currency.symbol}{item.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                            <td>
                                                {item.gainLoss !== null ? (
                                                    <div className={`pnl-cell ${item.gainLoss >= 0 ? 'positive' : 'negative'}`}>
                                                        <span style={{fontWeight: 600}}>{item.gainLoss >= 0 ? '+' : ''}{currency.symbol}{Math.abs(item.gainLoss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                                        <span className="pct">{item.gainLossPercent >= 0 ? '+' : ''}{item.gainLossPercent.toFixed(2)}%</span>
                                                    </div>
                                                ) : 'N/A'}
                                            </td>
                                            <td>
                                                <div className="action-links">
                                                    <button onClick={() => handleEditHolding(item)}>Edit</button>
                                                    <button onClick={() => handleRemoveHolding(item.coinId)}>Remove</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="8" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>No positions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="advanced-analysis" onClick={() => setAdvancedExpanded(!advancedExpanded)} style={{ padding: '16px 24px', borderTop: '1px solid #1e293b' }}>
                    <div className="aa-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    </div>
                    <div className="aa-content">
                        <h4 className="aa-title">Advanced Risk & Scenario Analysis</h4>
                        <p className="aa-subtitle">Automated rebalancing suggestions & shock tests</p>
                        
                        <div className={`aa-details ${advancedExpanded ? 'expanded' : ''}`} onClick={e => e.stopPropagation()}>
                            {portfolioData.riskMetrics ? (
                                <>
                                    <div className="aa-metric">
                                        <span className="label">Sharpe Ratio (1Y)</span>
                                        <span className="val" style={{color: '#10b981'}}>{portfolioData.riskMetrics.sharpe}</span>
                                    </div>
                                    <div className="aa-metric">
                                        <span className="label">30D Portfolio Volatility</span>
                                        <span className="val">{portfolioData.riskMetrics.volatility}%</span>
                                    </div>
                                    <div className="aa-metric">
                                        <span className="label">Value at Risk (95%)</span>
                                        <span className="val" style={{color: '#ef4444'}}>-{currency.symbol}{portfolioData.riskMetrics.var}</span>
                                    </div>
                                    <div className="aa-metric">
                                        <span className="label">Rebalancing Status</span>
                                        <span className="val" style={{color: '#f59e0b'}}>{portfolioData.riskMetrics.status}</span>
                                    </div>
                                </>
                            ) : (
                                <div style={{gridColumn: '1 / -1', color: '#94a3b8', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center'}}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    Advanced metrics not currently available from API.
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="aa-toggle">
                        {advancedExpanded ? 'Hide details' : 'Show details'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{transform: advancedExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add/Edit Holding</h3>
                            <button className="close-btn" onClick={() => setShowForm(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddHolding}>
                            <div className="form-group">
                                <label>Select Asset</label>
                                <input name="coinId" type="text" placeholder="e.g. Bitcoin" value={formInput.coinId} onChange={handleInputChange} list="coin-options" required />
                                <datalist id="coin-options">{allCoins.map((coin) => <option key={coin.id} value={coin.name} />)}</datalist>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input name="amount" type="number" step="any" placeholder="0.00" value={formInput.amount} onChange={handleInputChange} required min="0.00000001" />
                            </div>
                            <div className="form-group">
                                <label>Average Buy Price (USD)</label>
                                <input name="avgBuyPrice" type="number" step="any" placeholder="0.00" value={formInput.avgBuyPrice} onChange={handleInputChange} required min="0.00000001" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Position'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Portfolio;
