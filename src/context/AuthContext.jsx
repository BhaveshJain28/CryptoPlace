import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // Decode JWT payload to restore user state (email) without an extra API call
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ email: payload.email, id: payload.userId });
            } catch {
                // malformed token — clear it
                setToken(null);
            }
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
    }, [token]);

    const register = async (email, password) => {
        try {
            const response = await api.post('/auth/register', { email, password });
            setToken(response.data.token);
            setUser(response.data.user);
            navigate('/');
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            setToken(response.data.token);
            setUser(response.data.user);
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;
