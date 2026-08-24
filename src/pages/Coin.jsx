import React, { useEffect,useState,useContext } from 'react'
import './Coin.css'
import { CoinContext } from '../context/CoinContext'
import { useParams } from 'react-router-dom'
import LineChart from '../components/LineChart/LineChart';
import  api from '../services/api.js';

function Coin() {
  const { coinid } = useParams();
  const [coinData, setCoinData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const {currency}=useContext(CoinContext);


const fetchCoinData=async()=>{
 try{
 const {data}=await api.get(`/coins/${coinid}`);
 setCoinData(data);
 }
 catch(error){
  console.log(error);
  console.error(error);
 }
}

const fetchHistoricalData=async()=>{
  try{
    const {data}=await api.get(`/coins/${coinid}/market_chart`,{params:{vs_currency:currency.name,days:10,interval:'daily'}});
    setHistoricalData(data);
  }
  catch(err){
    console.log(err);
    console.error(err);
  }
}



useEffect(()=>{
  fetchCoinData();
  fetchHistoricalData();
},[currency])

if(coinData && historicalData){
  const currentPrice = coinData.market_data?.current_price?.[currency.name];
  const marketCap = coinData.market_data?.market_cap?.[currency.name];
  const high24h = coinData.market_data?.high_24h?.[currency.name];
  const low24h = coinData.market_data?.low_24h?.[currency.name];
  return (
    <div className='coin'>
      <div className="coin-top">
        <div className="coin-name">
          <img src={coinData.image?.large} alt=""/>
          <p><b>{coinData.name} ({coinData.symbol?.toUpperCase()})</b></p>
        </div>
        <div className="coin-info">
          <ul>
            <li>Crypto Market Rank</li>
            <li>{coinData.market_cap_rank ?? 'N/A'}</li>
          </ul>
          <ul>
            <li>Price</li>
            <li>{currentPrice != null ? `${currency.symbol}${currentPrice.toLocaleString()}` : 'N/A'}</li>
          </ul>
          <ul>
            <li>Market Cap</li>
            <li>{marketCap != null ? `${currency.symbol}${marketCap.toLocaleString()}` : 'N/A'}</li>
          </ul>
          <ul>
            <li>24 Hour High</li>
            <li>{high24h != null ? `${currency.symbol}${high24h.toLocaleString()}` : 'N/A'}</li>
          </ul>
          <ul>
            <li>24 Hour Low</li>
            <li>{low24h != null ? `${currency.symbol}${low24h.toLocaleString()}` : 'N/A'}</li>
          </ul>
        </div>
      </div>
      <div className="coin-chart">
        <LineChart historicalData={historicalData} />
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
