import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const WatchlistContext = createContext();

const WatchlistContextProvider = ({ children }) => {
    const [watchlist, setWatchlist] = useState([]);
    const { token } = useContext(AuthContext);

    const fetchWatchlist = async () => {
        if (!token) {
            setWatchlist([]);
            return;
        }
        try {
            const response = await api.get('/watchlist');
            setWatchlist(response.data.coins || []);
        } catch (error) {
            console.error('Failed to fetch watchlist:', error);
            setWatchlist([]);
        }
    };

    useEffect(() => {
        fetchWatchlist();
    }, [token]);

    const addToWatchlist = async (coinId) => {
        if (!token) return;
        
        // Optimistic update
        setWatchlist((prev) => [...new Set([...prev, coinId])]);
        
        try {
            await api.post(`/watchlist/${coinId}`);
        } catch (error) {
            console.error('Failed to add to watchlist:', error);
            // Revert on failure
            fetchWatchlist();
        }
    };

    const removeFromWatchlist = async (coinId) => {
        if (!token) return;
        
        // Optimistic update
        setWatchlist((prev) => prev.filter(id => id !== coinId));
        
        try {
            await api.delete(`/watchlist/${coinId}`);
        } catch (error) {
            console.error('Failed to remove from watchlist:', error);
            // Revert on failure
            fetchWatchlist();
        }
    };

    const isInWatchlist = (coinId) => {
        return watchlist.includes(coinId);
    };

    return (
        <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
            {children}
        </WatchlistContext.Provider>
    );
};

export default WatchlistContextProvider;
