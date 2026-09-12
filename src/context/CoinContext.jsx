import { createContext, useEffect, useState } from 'react';
import api from '../services/api.js';

export const CoinContext = createContext();

const CoinContextProvider = (props) => {
    const [allCoins, setAllCoins] = useState([]);
    const [globalData, setGlobalData] = useState(null);
    const [trendingCoins, setTrendingCoins] = useState([]);
    const [currency, setCurrency] = useState({
        name: 'usd',
        symbol: '$'
    });

    const fetchAllCoins = async () => {
        try {
            const { data } = await api.get('/markets', { 
                params: { 
                    vs_currency: currency.name,
                    sparkline: true,
                    price_change_percentage: '1h,24h,7d'
                } 
            });
            setAllCoins(data);
        } catch(err) {
            console.error('Error fetching coins:', err);
        }
    }

    const fetchGlobalData = async () => {
        try {
            const { data } = await api.get('/global');
            setGlobalData(data);
        } catch(err) {
            console.error('Error fetching global data:', err);
        }
    }

    const fetchTrendingCoins = async () => {
        try {
            const { data } = await api.get('/trending');
            setTrendingCoins(data);
        } catch(err) {
            console.error('Error fetching trending coins:', err);
        }
    }

    useEffect(() => {
        fetchAllCoins();
        fetchGlobalData();
        fetchTrendingCoins();
    }, [currency]);

    const contextValue = {
        allCoins,
        globalData,
        trendingCoins,
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
