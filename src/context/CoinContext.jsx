import { createContext,useEffect,useState } from 'react';
import.meta.env.VITE_CG_API_KEY;
import api from '../services/api.js';
export const CoinContext = createContext();
const CoinContextProvider = (props) => {
    const [allCoins, setAllCoins] = useState([]);
    const [currency,setCurrency] = useState({
        name:'usd',
        symbol:'$'
    });

    const fetchAllCoins = async () => {
    try{
      const {data}=await  api.get('/markets', { params: { vs_currency: currency.name } });
      setAllCoins(data);
    }
    catch(err){
      console.error(err);
    }
    }

useEffect(() => {
  fetchAllCoins();
}, [currency])

    const contextValue={
      allCoins,
      currency,
      setCurrency
    }

  return(
    <CoinContext.Provider value={contextValue}>
      {props.children}
    </CoinContext.Provider>
  )

  }
  export default CoinContextProvider;






