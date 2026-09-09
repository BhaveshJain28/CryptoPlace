import React, { useContext, useEffect, useState } from 'react'
import '../pages/Home.css' // Reuse Home.css for similar layout
import { CoinContext } from '../context/CoinContext'
import { WatchlistContext } from '../context/WatchlistContext'
import { Link } from 'react-router-dom'

function Watchlist() {
  const { allCoins, currency } = useContext(CoinContext);
  const { watchlist, removeFromWatchlist } = useContext(WatchlistContext);
  const [displayCoins, setDisplayCoins] = useState([]);

  useEffect(() => {
    const filteredCoins = allCoins.filter(coin => watchlist.includes(coin.id));
    setDisplayCoins(filteredCoins);
  }, [allCoins, watchlist]);

  return (
    <div className='home'>
      <div className="hero" style={{ padding: '40px 0', minHeight: 'auto' }}>
        <h2>My Watchlist</h2>
        <p>Keep track of your favorite cryptocurrencies.</p>
      </div>

      <div className="crypto_table">
        <div className="table-layout" style={{ gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1fr 0.5fr' }}>
            <p>#</p>
            <p>Coins</p>
            <p>Price</p>
            <p style={{textAlign:'center'}}>24H Change</p>
            <p className='market-cap' style={{textAlign:'right'}}>Market Cap</p>
            <p style={{textAlign:'center'}}>Watch</p>
        </div>
       {
          displayCoins.length > 0 ? displayCoins.map((item, index)=>(
            <div className="table-layout" key={index} style={{ gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1fr 0.5fr', alignItems: 'center' }}>
              <Link to={`/coin/${item.id}`} style={{ display: 'contents', color: 'inherit', textDecoration: 'none' }}>
                <p>{item.market_cap_rank}</p>
                <div>
                  <img src={item.image} alt="" />
                  <p>{item.name +" - " +item.symbol}</p>
                </div>
                <p>{currency.symbol}{item.current_price.toLocaleString()}</p>
                <p className={item.price_change_percentage_24h > 0 ? "green" : "red"} style={{textAlign:'center'}}>
                  {Math.floor(item.price_change_percentage_24h*100)/100}%
                </p>
                <p className='market-cap' style={{textAlign:'right'}}>
                  {currency.symbol}{item.market_cap.toLocaleString()}
                </p>
              </Link>
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWatchlist(item.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#ffb300' }}
                  title="Remove from Watchlist"
                >
                  ★
                </button>
              </div>
            </div>
          )) : (
            <p style={{ textAlign: 'center', padding: '20px' }}>Your watchlist is empty.</p>
          )
        }
      </div>
    </div>
  )
}

export default Watchlist
