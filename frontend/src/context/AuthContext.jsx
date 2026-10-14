import React, { createContext, useState, useContext, useEffect } from 'react';
import { setApiToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initialize state from localStorage for persistent production login sessions
    const [token, setToken] = useState(() => {
        try {
            return localStorage.getItem('settlein_token') || null;
        } catch {
            return null;
        }
    });

    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('settlein_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (token) {
            setApiToken(token);
        }
    }, [token]);

    const login = (jwt, userData) => {
        setToken(jwt);
        setUser(userData);
        setApiToken(jwt);
        try {
            localStorage.setItem('settlein_token', jwt);
            localStorage.setItem('settlein_user', JSON.stringify(userData));
        } catch (err) {
            console.error('Failed to save auth state to localStorage', err);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setApiToken(null);
        try {
            localStorage.removeItem('settlein_token');
            localStorage.removeItem('settlein_user');
        } catch (err) {
            console.error('Failed to clear auth state from localStorage', err);
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
