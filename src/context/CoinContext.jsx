import { createContext,useEffect,useState } from 'react';
import.meta.env.VITE_CG_API_KEY;
export const CoinContext = createContext();
const CoinContextProvider = (props) => {
    const [allCoins, setAllCoins] = useState([]);
    const [currency,setCurrency] = useState({
        name:'usd',
        symbol:'$'
    });

    const fetchAllCoins = async () => {
const options = {method: 'GET', headers: {'x-cg-demo-api-key': import.meta.env.VITE_CG_API_KEY}};

fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.name}`, options)
  .then(res => res.json())
  .then(res => setAllCoins(res))
  .catch(err => console.error(err));
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






