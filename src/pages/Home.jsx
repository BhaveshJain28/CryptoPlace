import React, { useContext ,useEffect,useState} from 'react'
import './Home.css'
import { CoinContext } from '../context/CoinContext'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { WatchlistContext } from '../context/WatchlistContext'
function Home() {
  const {allCoins,currency} = useContext(CoinContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useContext(WatchlistContext);
  const [displayCoins,setDisplayCoin] = useState([]);
  const [input,setInput]=useState('');
  const inputHandler = (e) => {
    setInput(e.target.value);
    if(e.target.value ===""){
      setDisplayCoin(allCoins);
    }
  }

  const searchHandler=async(e)=>{
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
   const coins= await allCoins.filter((item)=>{
      return item.name.toLowerCase().includes(input.toLowerCase())
    })
  setDisplayCoin(coins);
  }


  useEffect(()=>{
    setDisplayCoin(allCoins);
  },
  [allCoins])


  return (
    <div className='home'>
        <div className="hero">
            <h1>Largest <br/> Crypto Marketplace</h1>
            <p>Welcome to the world's largest cryptocurrency market place.<br/> Sign up to explore more cryptos</p>
            <form onSubmit={searchHandler}>
        <input onChange={inputHandler} value={input} type="text" placeholder='Search crypto...' required list='coinlist'/>
      <datalist id="coinlist">{allCoins.map((item,index)=>(<option key={index} value={item.name}/>))}</datalist>


        <button type="submit">Search</button>
            </form>
        </div>
      <div className="crypto_table">
        <div className="table-layout">
            <p>#</p>
            <p>Coins</p>
            <p>Price</p>
            <p style={{textAlign:'center'}}>24H Change</p>
            < p className='market-cap'>Market Cap</p>
            <p style={{textAlign:'center'}}>Watch</p>
        </div>
       {
          displayCoins.slice(0,12).map((item,index)=>(            <Link to={`/coin/${item.id}`} className="table-layout" key={index}>
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
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    if (!token) {
                      navigate('/login');
                      return;
                    }
                    if (isInWatchlist(item.id)) {
                      removeFromWatchlist(item.id);
                    } else {
                      addToWatchlist(item.id);
                    }
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: isInWatchlist(item.id) ? '#ffb300' : '#888' }}
                  title={isInWatchlist(item.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                  {isInWatchlist(item.id) ? '★' : '☆'}
                </button>
              </div>
            </Link>
          ))
        }
      </div>
    </div>
  )
}

export default Home
