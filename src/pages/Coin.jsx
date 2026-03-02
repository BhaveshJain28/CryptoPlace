import React, { use,useEffect,useState,useContext } from 'react'
import './Coin.css'
import { CoinContext } from '../context/CoinContext'
import { useParams } from 'react-router-dom'

function Coin() {
  const { coinid } = useParams();
  const [coinData, setCoinData] = useState();
  const {currency}=useContext(CoinContext);


const fetchCoinData=async()=>{
  const options = {method: 'GET', headers: {'x-cg-demo-api-key': 'CG-Qn62MzZbK1kfsoxrCssPYdhB'}};

fetch(`https://api.coingecko.com/api/v3/coins/${coinid}`, options)
  .then(res => res.json())
  .then(res => setCoinData(res))
  .catch(err => console.error(err));
}
useEffect(()=>{
  fetchCoinData();
},[currency])
if(coinData){
  return (
    <div className='coin'>
      <div className="coin-name">
        <img src={coinData.image.large} alt="" srcset="" />
      <p><b>{coinData.name}({coinData.symbol.toUpperCase()})</b></p>
    
      </div>
      
    </div>
  )
}
else{
  return (
    <div className="spinner">
      <div className="spin"></div>
    </div>
  )
}
}

export default Coin
