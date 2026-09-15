import React, { useContext, useEffect, useState, useRef } from 'react'
import './Home.css'
import { CoinContext } from '../context/CoinContext'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { WatchlistContext } from '../context/WatchlistContext'
import Sparkline from '../components/Sparkline/Sparkline'
import { exportToCSV } from '../utils/exportToCSV'

function Home() {
  const { allCoins, globalData, currency } = useContext(CoinContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useContext(WatchlistContext);
  
  const [displayCoins, setDisplayCoin] = useState([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef(null);
  const searchRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced live suggestions from allCoins
  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setDisplayCoin(allCoins);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      const q = val.toLowerCase();
      const matches = allCoins.filter(c =>
        c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().startsWith(q)
      ).slice(0, 8);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0 || val.trim().length > 0);

      // Also filter the table
      setDisplayCoin(allCoins.filter(c =>
        c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      ));
    }, 250);
  };

  const handleSuggestionClick = (coin) => {
    setShowSuggestions(false);
    setInput('');
    navigate(`/coin/${coin.id}`);
  };

  const clearSearch = () => {
    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
    setDisplayCoin(allCoins);
  };

  const searchHandler = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (!input.trim()) return setDisplayCoin(allCoins);
    const q = input.toLowerCase();
    setDisplayCoin(allCoins.filter(c =>
      c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    ));
  };

  useEffect(() => {
    if (allCoins.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayCoin(allCoins);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [allCoins]);

  const formatNumber = (num) => {
    if (!num && num !== 0) return '—';
    if (num >= 1e18) return (num / 1e18).toFixed(2) + 'E';
    if (num >= 1e15) return (num / 1e15).toFixed(2) + 'P';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9)  return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6)  return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  const handleExport = () => {
    const headers = ['Rank', 'Name', 'Symbol', 'Price', '1H%', '24H%', '7D%', '24H Volume', 'Market Cap'];
    const rows = [headers, ...allCoins.map(c => [
      c.market_cap_rank, c.name, c.symbol.toUpperCase(),
      c.current_price, c.price_change_percentage_1h_in_currency,
      c.price_change_percentage_24h, c.price_change_percentage_7d_in_currency,
      c.total_volume, c.market_cap
    ])];
    exportToCSV('cryptoplace_dataset.csv', rows);
  };

  // Real global stats
  const totalMarketCap  = globalData?.total_market_cap?.[currency.name];
  const totalVolume     = globalData?.total_volume?.[currency.name];
  const btcDominance    = globalData?.market_cap_percentage?.btc;
  const ethDominance    = globalData?.market_cap_percentage?.eth;
  const activeCryptos   = globalData?.active_cryptocurrencies;
  const marketCapChange = globalData?.market_cap_change_percentage_24h_usd;

  return (
    <div className='home'>
      
      {/* Hero / Search */}
      <div className="home-top-ribbon"> 
        <div className="hero-text-block">
          <div>
            <h1>Track, Analyze, and Simulate Digital Assets in Real-Time</h1>
            <p>Real-time pricing, portfolio simulations, and watchlists across{' '}
              {activeCryptos ? activeCryptos.toLocaleString() : '...'}+ coins.</p>
          </div>
          <div className="hero-actions">
            <button className="action-btn-outline" onClick={handleExport} style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "10px"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export Dataset
            </button>
            <button
              className="action-btn-primary"
              onClick={() => navigate(token ? '/watchlist' : '/login')}
            >
              {token ? 'Go to Watchlist' : 'Sign in for Watchlist'}
            </button>
          </div>
        </div>

        {/* Search + Suggestions */}
        <div className="search-trending-bar">
          <div className="search-outer" ref={searchRef}>
            <form className="search-box" onSubmit={searchHandler}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                id="search-input"
                onChange={handleInput}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                value={input}
                type="text"
                placeholder="Search coins (e.g. BTC, Ethereum, Solana)..."
                autoComplete="off"
              />
              {input && (
                <button type="button" className="search-clear-btn" onClick={clearSearch}>✕</button>
              )}
              <button type="submit" className="search-inline-btn">Search</button>
            </form>

            {/* Live Suggestions Dropdown */}
            {showSuggestions && (
              <div className="search-suggestions">
                {suggestions.length > 0 ? suggestions.map(coin => (
                  <div
                    key={coin.id}
                    className="suggestion-item"
                    onMouseDown={() => handleSuggestionClick(coin)}
                  >
                    <img src={coin.image} alt={coin.name} />
                    <div className="suggestion-names">
                      <span className="suggestion-name">{coin.name}</span>
                      <span className="suggestion-symbol">{coin.symbol.toUpperCase()}</span>
                    </div>
                    <span className={`suggestion-pct ${(coin.price_change_percentage_24h || 0) >= 0 ? 'green-text' : 'red-text'}`}>
                      {(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                      {(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </span>
                    <span className="suggestion-price">
                      {currency.symbol}{coin.current_price?.toLocaleString(undefined, {maximumFractionDigits: 6})}
                    </span>
                  </div>
                )) : (
                  <div className="suggestion-empty">No coins found for "{input}"</div>
                )}
              </div>
            )}
          </div>

          {/* {trendingCoins.length > 0 && (
            <div className="trending-ribbon">
              <span className="trending-label">TRENDING:</span>
              {trendingCoins.slice(0, 5).map(coin => (
                <Link key={coin.item.id} to={`/coin/${coin.item.id}`} className="trending-item">
                  {coin.item.symbol.toUpperCase()}
                  <span className={(coin.item.data?.price_change_percentage_24h?.usd ?? 0) > 0 ? 'green-text' : 'red-text'}>
                    {(coin.item.data?.price_change_percentage_24h?.usd ?? 0) > 0 ? '+' : ''}
                    {(coin.item.data?.price_change_percentage_24h?.usd ?? 0).toFixed(1)}%
                  </span>
                </Link>
              ))}
            </div>
          )} */}
        </div>
      </div>

      {/* Global Market Dashboard — all live from CoinGecko globalData */}
      <div className="global-dashboard">
        <div className="global-card">
          <div className="card-top">
            <span className="label-caps">TOTAL MARKET CAP</span>
            {marketCapChange != null && (
              <span className={marketCapChange >= 0 ? 'green-text label-caps' : 'red-text label-caps'}>
                {marketCapChange >= 0 ? '+' : ''}{marketCapChange.toFixed(2)}%
              </span>
            )}
          </div>
          <div className="card-mid">
            {/* Sourced from live CoinGecko global data endpoint */}
            <h2>{globalData ? `${currency.symbol}${formatNumber(totalMarketCap)}` : <span className="skeleton-text">Loading...</span>}</h2>
          </div>
          <div className="card-bot">
            <span>Global valuation</span>
            <span>Vol: {currency.symbol}{globalData ? formatNumber(totalVolume) : '—'}</span>
          </div>
        </div>

        <div className="global-card">
          <div className="card-top">
            <span className="label-caps">24H TRADING VOLUME</span>
            <span className="label-caps">SPOT</span>
          </div>
          <div className="card-mid">
            {/* Live 24H volume aggregated via global API state */}
            <h2>{globalData ? `${currency.symbol}${formatNumber(totalVolume)}` : <span className="skeleton-text">Loading...</span>}</h2>
          </div>
          <div className="card-bot">
            <span>Liquidity aggregate</span>
            <span>Markets: {globalData?.markets ?? '—'}</span>
          </div>
        </div>

        <div className="global-card">
          <div className="card-top">
            <span className="label-caps">BTC DOMINANCE</span>
            <span className="label-caps">ETH: {ethDominance ? ethDominance.toFixed(1) + '%' : '—'}</span>
          </div>
          <div className="card-mid">
            {/* Live market cap percentage from CoinGecko */}
            <h2>{btcDominance ? btcDominance.toFixed(1) + '%' : <span className="skeleton-text">Loading...</span>}</h2>
          </div>
          <div className="card-bot bar-container">
            <div className="dom-bar">
              <div className="dom-fill btc-fill" style={{width: `${btcDominance || 0}%`}}></div>
              <div className="dom-fill eth-fill" style={{width: `${ethDominance || 0}%`, left: `${btcDominance || 0}%`}}></div>
            </div>
          </div>
        </div>

        <div className="global-card">
          <div className="card-top">
            <span className="label-caps">ACTIVE CRYPTOCURRENCIES</span>
          </div>
          <div className="card-mid">
            {/* Real active asset count from live global data */}
            <h2>{activeCryptos ? activeCryptos.toLocaleString() : <span className="skeleton-text">Loading...</span>}</h2>
          </div>
          <div className="card-bot">
            <span>Listed on CoinGecko</span>
            <span>Exchanges: {globalData?.markets ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* Table Toolbar */}
      {/* <div className="table-toolbar">
        <div className="filter-pills">
          <div className="pill active">All Assets</div>
        </div>
        <div className="table-toolbar-right">
          <span className="showing-text">
            {input
              ? `${displayCoins.length} result${displayCoins.length !== 1 ? 's' : ''} for "${input}"`
              : `Showing top ${Math.min(displayCoins.length, 20)} of ${displayCoins.length} assets`}
          </span>
        </div>
      </div> */}

      {/* Coin Table */}
      <div className="crypto_table home-table-container">
        <div className="home-table-layout watchlist-header-row label-caps">
          <p>#</p>
          <p>ASSET</p>
          <p style={{textAlign:'right'}}>PRICE</p>
          <p style={{textAlign:'right'}}>1H %</p>
          <p style={{textAlign:'right'}}>24H %</p>
          <p style={{textAlign:'right'}}>7D %</p>
          <p style={{textAlign:'right'}}>24H VOLUME</p>
          <p style={{textAlign:'right'}}>MARKET CAP</p>
          <p style={{textAlign:'center'}}>7D TREND</p>
          <p style={{textAlign:'right'}}>ACTIONS</p>
        </div>

        {loading ? (
          /* Loading skeletons */
          Array.from({length: 8}).map((_, i) => (
            <div className="home-table-layout skeleton-row" key={i}>
              {Array.from({length: 10}).map((_, j) => (
                <div key={j} className="skeleton-cell"></div>
              ))}
            </div>
          ))
        ) : displayCoins.length === 0 ? (
          <div className="table-empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <p>No coins match "{input}"</p>
            <button className="export-btn" onClick={clearSearch}>Clear search</button>
          </div>
        ) : (
          displayCoins.slice(0, 21).map((item) => (
            <div className="home-table-layout watchlist-row" key={item.id}>
              <p className="metric">{item.market_cap_rank}</p>

              <Link to={`/coin/${item.id}`} className="asset-col" style={{color:'inherit', textDecoration:'none', display:'flex'}}>
                <img src={item.image} alt={item.name} />
                <div className="asset-name">
                  <p>{item.name}</p>
                  <p className="asset-badge">{item.symbol.toUpperCase()}</p>
                </div>
              </Link>

              <p className="metric" style={{textAlign:'right'}}>
                {currency.symbol}{item.current_price?.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:6}) ?? '—'}
              </p>
              <p className={`metric ${(item.price_change_percentage_1h_in_currency ?? 0) >= 0 ? 'green' : 'red'}`} style={{textAlign:'right'}}>
                {(item.price_change_percentage_1h_in_currency ?? 0) >= 0 ? '+' : ''}{(item.price_change_percentage_1h_in_currency ?? 0).toFixed(2)}%
              </p>
              <p className={`metric ${(item.price_change_percentage_24h ?? 0) >= 0 ? 'green' : 'red'}`} style={{textAlign:'right'}}>
                {(item.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}{(item.price_change_percentage_24h ?? 0).toFixed(2)}%
              </p>
              <p className={`metric ${(item.price_change_percentage_7d_in_currency ?? 0) >= 0 ? 'green' : 'red'}`} style={{textAlign:'right'}}>
                {(item.price_change_percentage_7d_in_currency ?? 0) >= 0 ? '+' : ''}{(item.price_change_percentage_7d_in_currency ?? 0).toFixed(2)}%
              </p>
              <p className="metric" style={{textAlign:'right'}}>{currency.symbol}{item.total_volume != null ? formatNumber(item.total_volume) : '—'}</p>
              <p className="metric" style={{textAlign:'right'}}>{currency.symbol}{item.market_cap != null ? formatNumber(item.market_cap) : '—'}</p>

              <div style={{display:'flex', justifyContent:'center'}}>
                {/* 7D trend line driven directly by sparkline data array */}
                <Sparkline
                  data={item.sparkline_in_7d?.price || []}
                  color={(item.price_change_percentage_7d_in_currency ?? 0) >= 0 ? '#10B981' : '#EF4444'}
                  width={100}
                  height={30}
                />
              </div>

              <div style={{display:'flex', justifyContent:'flex-end', gap:'6px'}}>
                <Link to={`/coin/${item.id}`}>
                  <button className="export-btn" style={{padding:'4px 8px', fontSize:'11px'}}>Details</button>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (!token) return navigate('/login');
                    isInWatchlist(item.id) ? removeFromWatchlist(item.id) : addToWatchlist(item.id);
                  }}
                  className="export-btn watchlist-star-btn"
                  title={isInWatchlist(item.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  style={{color: isInWatchlist(item.id) ? '#F59E0B' : undefined}}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={isInWatchlist(item.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}

        {/* {!loading && displayCoins.length > 0 && (
          <div className="table-footer">
            <span>Showing {Math.min(displayCoins.length, 20)} of {displayCoins.length} assets — data via CoinGecko</span>
          </div>
        )} */}
      </div>
    </div>
  )
}

export default Home
