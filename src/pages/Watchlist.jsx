import React, { useContext, useEffect, useState } from 'react'
import './Watchlist.css'
import { CoinContext } from '../context/CoinContext'
import { WatchlistContext } from '../context/WatchlistContext'
import { Link } from 'react-router-dom'
import { exportToCSV } from '../utils/exportToCSV'
import Sparkline from '../components/Sparkline/Sparkline'

function Watchlist() {
  const { allCoins, currency } = useContext(CoinContext);
  const { watchlist, removeFromWatchlist, addToWatchlist } = useContext(WatchlistContext);
  const [displayCoins, setDisplayCoins] = useState([]);
  const [suggestedCoins, setSuggestedCoins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Current Watchlist — filter by search query
    const watchedCoins = allCoins.filter(coin => watchlist.includes(coin.id));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      setDisplayCoins(watchedCoins.filter(c =>
        c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      ));
    } else {
      setDisplayCoins(watchedCoins);
    }

    // Suggested: top gainers not in watchlist
    if (allCoins.length > 0) {
      const nonWatched = allCoins.filter(coin => !watchlist.includes(coin.id));
      const sortedByGain = [...nonWatched].sort((a, b) => 
        (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
      );
      setSuggestedCoins(sortedByGain.slice(0, 4));
    }
  }, [allCoins, watchlist, searchQuery]);

  const handleExport = () => {
    const headers = ['Asset', 'Ticker', 'Price', '24H Change %', 'Market Cap'];
    const rows = [headers];
    displayCoins.forEach(coin => {
      rows.push([
        coin.name,
        coin.symbol.toUpperCase(),
        coin.current_price,
        coin.price_change_percentage_24h,
        coin.market_cap
      ]);
    });
    exportToCSV('watchlist.csv', rows);
  };

  const DownloadIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  );

  const totalWatched = allCoins.filter(c => watchlist.includes(c.id));
  const overallChange = totalWatched.length > 0
    ? totalWatched.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / totalWatched.length
    : null;

  return (
    <div className='watchlist-page'>
      {/* Header */}
      <div className="watchlist-header">
        <div className="pre-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          WATCHLIST
        </div>
        <div className="header-main">
          <div className="header-title-block">
            <h1>Your Monitored Assets</h1>
            <p>Track real-time prices and 24h changes for your selected assets.</p>
          </div>
          {overallChange != null && (
            <div className="status-bar">
              <span>
                <div className="status-dot"></div>
                {watchlist.length} assets tracked
              </span>
              <span className={overallChange >= 0 ? 'green-text' : 'red-text'}>
                Avg 24H: {overallChange >= 0 ? '+' : ''}{overallChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="watchlist-toolbar">
        <div className="filter-pills">
          <div className="pill active">All ({watchlist.length})</div>
        </div>
        <div className="toolbar-actions">
          <input
            type="text"
            id="watchlist-search"
            className="search-input"
            placeholder="Search watchlist..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {displayCoins.length > 0 && (
            <button className="export-btn" onClick={handleExport}>
              <DownloadIcon /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="crypto_table watchlist-table-container">
        <div className="watchlist-table-layout watchlist-header-row label-caps">
          <p>ASSET</p>
          <p style={{textAlign:'right'}}>PRICE</p>
          <p style={{textAlign:'center'}}>24H CHANGE</p>
          <p style={{textAlign:'center'}}>24H RANGE</p>
          <p style={{textAlign:'center'}}>7D TREND</p>
          <p style={{textAlign:'right'}}>MARKET CAP</p>
          <p style={{textAlign:'right'}}>ACTIONS</p>
        </div>
        
        {displayCoins.length > 0 ? displayCoins.map((item) => {
          const low = item.low_24h || 0;
          const high = item.high_24h || 0;
          const current = item.current_price || 0;
          const rangePercent = high > low ? ((current - low) / (high - low)) * 100 : 50;

          return (
            <div className="watchlist-table-layout watchlist-row" key={item.id}>
              {/* ASSET — entire cell navigates to coin */}
              <Link to={`/coin/${item.id}`} className="asset-col watchlist-asset-link">
                <img src={item.image} alt={item.name} />
                <div className="asset-name">
                  <p>{item.name}</p>
                  <p className="asset-badge">{item.symbol.toUpperCase()}</p>
                </div>
              </Link>

              <p className="metric" style={{textAlign:'right'}}>
                {currency.symbol}{current.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}
              </p>

              <div style={{display:'flex', justifyContent:'center'}}>
                <span className={`status-tag ${(item.price_change_percentage_24h || 0) >= 0 ? 'green' : 'red'}`}>
                  {(item.price_change_percentage_24h || 0) >= 0 ? '↗ +' : '↘ '}
                  {Math.abs(item.price_change_percentage_24h || 0).toFixed(2)}%
                </span>
              </div>

              <div className="range-bar-container">
                <div className="range-labels metric">
                  <span>{currency.symbol}{low >= 1000 ? (low / 1000).toFixed(1) + 'k' : low.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                  <span>{currency.symbol}{high >= 1000 ? (high / 1000).toFixed(1) + 'k' : high.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
                <div className="range-bar">
                  <div className="range-fill" style={{width: `${Math.min(Math.max(rangePercent, 0), 100)}%`}}></div>
                </div>
              </div>

              <div style={{display:'flex', justifyContent:'center'}}>
                <Sparkline
                  data={item.sparkline_in_7d?.price || []}
                  color={(item.price_change_percentage_7d_in_currency || 0) >= 0 ? '#10B981' : '#EF4444'}
                  width={80}
                  height={28}
                />
              </div>

              <p className="metric" style={{textAlign:'right'}}>
                {currency.symbol}{item.market_cap >= 1e9
                  ? (item.market_cap / 1e9).toFixed(1) + 'B'
                  : item.market_cap >= 1e6
                    ? (item.market_cap / 1e6).toFixed(1) + 'M'
                    : item.market_cap.toLocaleString()}
              </p>

              <div className="row-actions">
                <Link to={`/coin/${item.id}`}>
                  <button className="export-btn" style={{padding:'4px 8px', fontSize:'11px'}}>Details</button>
                </Link>
                <button
                  onClick={() => removeFromWatchlist(item.id)}
                  className="export-btn"
                  style={{padding:'4px 8px', fontSize:'11px', color:'var(--drawdown-crimson)'}}
                  title="Remove from watchlist"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="watchlist-empty">
            {watchlist.length === 0
              ? 'Your watchlist is empty. Add coins from the Markets page.'
              : `No results for "${searchQuery}"`}
          </div>
        )}

        {displayCoins.length > 0 && (
          <div className="table-footer">
            <span>Showing {displayCoins.length} of {watchlist.length} tracked assets</span>
          </div>
        )}
      </div>

      {/* Suggested Assets */}
      {suggestedCoins.length > 0 && (
        <div className="suggested-section">
          <div className="suggested-header">
            <div>
              <h3>Top Gainers — Add to Watchlist</h3>
              <p>Highest 24h gains from assets not currently in your watchlist.</p>
            </div>
          </div>
          
          <div className="suggested-grid">
            {suggestedCoins.map((coin) => (
              <div className="suggested-card" key={coin.id}>
                <div className="suggested-card-top">
                  <Link to={`/coin/${coin.id}`} className="asset-info" style={{textDecoration:'none'}}>
                    <img src={coin.image} alt={coin.name} />
                    <div>
                      <p style={{fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px'}}>{coin.name}</p>
                      <p style={{fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase'}}>
                        {coin.symbol} · {currency.symbol}{coin.current_price.toLocaleString(undefined, {maximumFractionDigits: 6})}
                      </p>
                    </div>
                  </Link>
                  <span className={`status-tag ${(coin.price_change_percentage_24h || 0) >= 0 ? 'green' : 'red'}`}>
                    {(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}{(coin.price_change_percentage_24h || 0).toFixed(2)}%
                  </span>
                </div>
                <div className="suggested-card-bottom">
                  <Sparkline
                    data={coin.sparkline_in_7d?.price || []}
                    color={(coin.price_change_percentage_7d_in_currency || 0) >= 0 ? '#10B981' : '#EF4444'}
                    width={80}
                    height={24}
                  />
                  <button 
                    className="add-watch-btn"
                    onClick={() => addToWatchlist(coin.id)}
                  >
                    + Add to Watchlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Watchlist
