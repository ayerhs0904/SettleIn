import React, { createContext, useState, useContext } from 'react';
import { setApiToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Note: Storing JWT in memory means it will be lost on page refresh.
    // In a production app, consider using httpOnly cookies or localStorage (with care).
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    const login = (jwt, userData) => {
        setToken(jwt);
        setUser(userData);
        setApiToken(jwt);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setApiToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
