import React, { useContext ,useEffect,useState} from 'react'
import './Home.css'
import { CoinContext } from '../context/CoinContext'
import { Link } from 'react-router-dom'
function Home() {
  const {allCoins,currency} = useContext(CoinContext);
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
        </div>
       {
          displayCoins.slice(0,10).map((item,index)=>(
            <Link to={`/coin/${item.id}`} className="table-layout" key={index}>
              <p>{item.market_cap_rank}</p>
              <div>
                <img src={item.image} alt="" />
                <p>{item.name +" - " +item.symbol}</p>
              </div>
              <p>{currency.symbol}{item.current_price}</p>

            </Link>
          ))
        }
      </div>
    </div>
  )
}

export default Home
