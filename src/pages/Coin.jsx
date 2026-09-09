import React, { useEffect, useState, useContext } from 'react'
import './Coin.css'
import { CoinContext } from '../context/CoinContext'
import { useParams, useNavigate, Link } from 'react-router-dom'
import LineChart from '../components/LineChart/LineChart';
import api from '../services/api.js';
import { AuthContext } from '../context/AuthContext';
import { WatchlistContext } from '../context/WatchlistContext';

function Coin() {
  const { coinid } = useParams();
  const [coinData, setCoinData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [days, setDays] = useState(7);
  const [coinError, setCoinError] = useState(null);
  // Interactive simulator state
  const [simAmount, setSimAmount] = useState(1);
  const [simTarget, setSimTarget] = useState('');
  const { currency } = useContext(CoinContext);
  const { token } = useContext(AuthContext);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useContext(WatchlistContext);
  const navigate = useNavigate();

  const fetchCoinData = async () => {
    setCoinData(null);
    setCoinError(null);
    try {
      const { data } = await api.get(`/coins/${coinid}`);
      setCoinData(data);
    } catch (error) {
      console.error(error);
      setCoinError(
        error.response?.status === 404
          ? `Coin "${coinid}" not found.`
          : 'Failed to load coin data. The API may be rate-limited — please try again in a moment.'
      );
    }
  };

  const fetchHistoricalData = async (daysParam) => {
    try {
      const { data } = await api.get(`/coins/${coinid}/market_chart`, { 
        params: { vs_currency: currency.name, days: daysParam, interval: daysParam > 30 ? 'daily' : 'hourly' } 
      });
      setHistoricalData(data);
    } catch (err) {
      console.error(err);
      // Chart data failure is non-fatal — keep coinData visible
    }
  };

  useEffect(() => {
    fetchCoinData();
  }, [currency, coinid]);

  useEffect(() => {
    fetchHistoricalData(days);
  }, [currency, coinid, days]);

  if (coinError) {
    return (
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'16px', padding:'32px'}}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--drawdown-crimson)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        <p style={{color:'var(--text-secondary)', fontSize:'14px', textAlign:'center', maxWidth:'360px'}}>{coinError}</p>
        <div style={{display:'flex', gap:'12px'}}>
          <button className="action-btn-outline" onClick={() => navigate('/')}>← Back to Markets</button>
          <button className="action-btn-primary" onClick={fetchCoinData}>Retry</button>
        </div>
      </div>
    );
  }

  if (coinData && historicalData) {
    const currentPrice = coinData.market_data?.current_price?.[currency.name] || 0;
    const marketCap = coinData.market_data?.market_cap?.[currency.name] || 0;
    const volume = coinData.market_data?.total_volume?.[currency.name] || 0;
    const high24h = coinData.market_data?.high_24h?.[currency.name] || 0;
    const low24h = coinData.market_data?.low_24h?.[currency.name] || 0;
    const priceChange = coinData.market_data?.price_change_percentage_24h || 0;
    const priceChangeAmt = coinData.market_data?.price_change_24h_in_currency?.[currency.name] || 0;
    const marketCapChange24h = coinData.market_data?.market_cap_change_percentage_24h || 0;
    
    const rangePercent = high24h > low24h ? ((currentPrice - low24h) / (high24h - low24h)) * 100 : 50;

    // Simulator calculations
    const targetPrice = parseFloat(simTarget) || currentPrice;
    const currentPositionValue = currentPrice * simAmount;
    const projectedPositionValue = targetPrice * simAmount;
    const calculatedGain = projectedPositionValue - currentPositionValue;
    const gainPct = currentPositionValue > 0 ? (calculatedGain / currentPositionValue) * 100 : 0;

    // Dynamic description: first sentence
    const description = coinData.description?.en
      ? coinData.description.en.replace(/<[^>]*>/g, '').split('.')[0] + '.'
      : 'No description available.';

    // Categories
    const categories = coinData.categories?.filter(Boolean).slice(0, 3) || [];

    return (
      <div className='coin-detail-page'>
        <div className="breadcrumb">
          <Link to="/" style={{color: 'var(--text-secondary)'}}>Markets</Link>
          {' / '}
          <span>{coinData.name} ({coinData.symbol?.toUpperCase()})</span>
        </div>

        {/* Top Header Block */}
        <div className="coin-header-card">
          <div className="coin-identity">
            <img src={coinData.image?.large} alt={coinData.name} />
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap'}}>
                <h1>{coinData.name}</h1>
                <span className="coin-symbol">{coinData.symbol?.toUpperCase()}</span>
                <span className="coin-rank">RANK #{coinData.market_cap_rank || 'N/A'}</span>
              </div>
              {categories.length > 0 && (
                <div style={{display:'flex', gap:'6px', marginTop:'6px', flexWrap:'wrap'}}>
                  {categories.map((cat, i) => (
                    <span key={i} className="asset-badge" style={{fontSize:'10px'}}>{cat}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="coin-price-block">
            <div className="price-main">
              <h2>{currency.symbol}{currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}</h2>
              <div className={`price-badge ${priceChange >= 0 ? 'green' : 'red'}`}>
                {priceChange >= 0 ? '↗' : '↘'} {Math.abs(priceChange).toFixed(2)}%
                <br/>
                ({priceChangeAmt >= 0 ? '+' : ''}{currency.symbol}{Math.abs(priceChangeAmt).toLocaleString(undefined, {maximumFractionDigits:2})})
              </div>
            </div>
            <div className="price-sub">24h change</div>
          </div>

          <div className="coin-actions">
            <button 
              className="action-btn-outline"
              onClick={() => { 
                if (!token) return navigate('/login');
                isInWatchlist(coinid) ? removeFromWatchlist(coinid) : addToWatchlist(coinid);
              }}
            >
              {isInWatchlist(coinid) ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </button>
            <Link to="/portfolio">
              <button className="action-btn-primary">Simulate Position →</button>
            </Link>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="coin-stats-strip">
          <div className="stat-card">
            <div className="stat-top">
              <span className="label-caps">24h Range</span>
              <span className="label-caps">Low • High</span>
            </div>
            <div className="stat-mid range-nums">
              <span>{currency.symbol}{low24h.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}</span>
              <span>—</span>
              <span>{currency.symbol}{high24h.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}</span>
            </div>
            <div className="stat-bot">
              <div className="range-bar"><div className="range-fill" style={{width: `${Math.min(Math.max(rangePercent, 0), 100)}%`}}></div></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="label-caps">Market Capitalization</span>
              <span className={marketCapChange24h >= 0 ? 'green-text' : 'red-text'}>
                {marketCapChange24h >= 0 ? '+' : ''}{marketCapChange24h.toFixed(2)}%
              </span>
            </div>
            <div className="stat-mid">
              <h3>{currency.symbol}{(marketCap / 1e9).toFixed(2)}B</h3>
            </div>
            <div className="stat-bot">
              <span>Rank #{coinData.market_cap_rank}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="label-caps">24h Trading Volume</span>
              <span className="label-caps">Spot</span>
            </div>
            <div className="stat-mid">
              <h3>{currency.symbol}{(volume / 1e9).toFixed(2)}B</h3>
            </div>
            <div className="stat-bot">
              <span>Vol/MCap: {marketCap > 0 ? (volume / marketCap).toFixed(4) : '—'}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="label-caps">Circulating Supply</span>
            </div>
            <div className="stat-mid">
              <h3>{coinData.market_data?.circulating_supply?.toLocaleString(undefined, {maximumFractionDigits: 0})} {coinData.symbol?.toUpperCase()}</h3>
            </div>
            <div className="stat-bot">
              <span>Max: {coinData.market_data?.max_supply ? coinData.market_data.max_supply.toLocaleString(undefined, {maximumFractionDigits: 0}) : '∞'}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="coin-chart-container">
          <div className="chart-header">
            <div className="chart-title">
              <div className="status-dot purple"></div>
              {coinData.symbol?.toUpperCase()} / {currency.name.toUpperCase()} Price Chart
            </div>
            <div className="chart-timeframes">
              <span className={days === 1 ? 'active' : ''} onClick={() => setDays(1)}>24H</span>
              <span className={days === 7 ? 'active' : ''} onClick={() => setDays(7)}>7D</span>
              <span className={days === 30 ? 'active' : ''} onClick={() => setDays(30)}>30D</span>
              <span className={days === 90 ? 'active' : ''} onClick={() => setDays(90)}>90D</span>
              <span className={days === 365 ? 'active' : ''} onClick={() => setDays(365)}>1Y</span>
              <span className={days === 'max' ? 'active' : ''} onClick={() => setDays('max')}>ALL</span>
            </div>
          </div>
          <div className="chart-body">
            <div style={{height: '350px'}}>
              <LineChart historicalData={historicalData} />
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="coin-bottom-grid">
          
          <div className="bottom-card">
            <div className="card-heading">
              <h3>Asset Fundamentals & Statistics</h3>
              <p>Verified on-chain and market data</p>
            </div>
            <div className="stats-list">
              <div className="stat-row">
                <span>All-Time High</span>
                <div style={{textAlign: 'right'}}>
                  <span className="metric">
                    {currency.symbol}{coinData.market_data?.ath?.[currency.name]?.toLocaleString(undefined, {maximumFractionDigits: 6})}
                    {' '}<span className="red-text">{coinData.market_data?.ath_change_percentage?.[currency.name]?.toFixed(1)}%</span>
                  </span><br/>
                  <span className="sub-text">{new Date(coinData.market_data?.ath_date?.[currency.name]).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="stat-row">
                <span>All-Time Low</span>
                <div style={{textAlign: 'right'}}>
                  <span className="metric">
                    {currency.symbol}{coinData.market_data?.atl?.[currency.name]?.toLocaleString(undefined, {maximumFractionDigits: 6})}
                    {' '}<span className="green-text">+{coinData.market_data?.atl_change_percentage?.[currency.name]?.toLocaleString(undefined, {maximumFractionDigits: 0})}%</span>
                  </span><br/>
                  <span className="sub-text">{new Date(coinData.market_data?.atl_date?.[currency.name]).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="stat-row">
                <span>Genesis Date</span>
                <span className="metric">{coinData.genesis_date || 'N/A'}</span>
              </div>
              {categories.length > 0 && (
                <div className="stat-row">
                  <span>Categories</span>
                  <span className="metric" style={{textAlign:'right', maxWidth:'180px'}}>{categories.join(', ')}</span>
                </div>
              )}
              {coinData.links?.homepage?.[0] && (
                <div className="stat-row">
                  <span>Website</span>
                  <a href={coinData.links.homepage[0]} target="_blank" rel="noopener noreferrer" className="metric" style={{color: 'var(--accent-primary)'}}>
                    {coinData.links.homepage[0].replace('https://', '').replace('http://', '').replace(/\/$/, '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            <div className="bottom-card">
              <div className="card-heading">
                <h3>About {coinData.name}</h3>
              </div>
              <p className="thesis-text">{description}</p>
            </div>

            {/* Interactive Simulator */}
            <div className="bottom-card simulate-card">
              <div className="card-heading" style={{display:'flex', justifyContent:'space-between'}}>
                <h3 style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                  Simulate {coinData.symbol?.toUpperCase()} Position
                </h3>
                <span className="label-caps">Live Calc</span>
              </div>
              
              <div className="sim-inputs">
                <div className="input-group">
                  <label>Amount ({coinData.symbol?.toUpperCase()})</label>
                  <div className="input-wrap">
                    <input 
                      type="number" 
                      value={simAmount} 
                      onChange={e => setSimAmount(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="any"
                    />
                    <span>{coinData.symbol?.toUpperCase()}</span>
                  </div>
                </div>
                <div className="input-group">
                  <label>Target Price ({currency.name.toUpperCase()})</label>
                  <div className="input-wrap">
                    <input 
                      type="number"
                      value={simTarget}
                      onChange={e => setSimTarget(e.target.value)}
                      placeholder={currentPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}
                      min="0"
                      step="any"
                    />
                    <span>{currency.name.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="sim-results">
                <div className="sim-row">
                  <span>Current Value:</span>
                  <span className="metric">{currency.symbol}{currentPositionValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="sim-row">
                  <span>Projected Value:</span>
                  <span className="metric">{currency.symbol}{projectedPositionValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="sim-row sim-total">
                  <span>Gain / Loss:</span>
                  <span className={`metric ${calculatedGain >= 0 ? 'green-text' : 'red-text'}`}>
                    {calculatedGain >= 0 ? '+' : ''}{currency.symbol}{Math.abs(calculatedGain).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    {' '}({gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%)
                  </span>
                </div>
              </div>
              
              <Link to="/portfolio">
                <button className="sim-btn">Open Full Portfolio Simulator →</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
  else {
    return (
      <div className="spinner">
        <div className="spin"></div>
      </div>
    )
  }
}

export default Coin
