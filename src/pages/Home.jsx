import React, { useContext ,useEffect,useState} from 'react'
import './Home.css'
import { CoinContext } from '../context/CoinContext'
function Home() {
  const {allCoins,currency} = useContext(CoinContext);
  const [displayCoins,setDisplayCoin] = useState([]);
  useEffect(()=>{
    setDisplayCoin(allCoins);
  },
  [allCoins])


  return (
    <div className='home'>
        <div className="hero">
            <h1>Largest <br/> Crypto Marketplace</h1>
            <p>Welcome to the world's largest cryptocurrency market place. Sign up to explore more cryptos</p>
            <form >
        <input type="text" placeholder='Search crypto...' />
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
        </div>
        {
          displayCoins.slice(0,10).map((item,index)=>(
            <div className="table-layout" key={index}>
              <p>{item.market_cap_rank}</p>
              <div>
                <img src={item.image} alt="" />
                <p>{item.name +" - " +item.symbol}</p>
              </div>
              <p>{currency.symbol}{item.current_price}</p>

            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Home
