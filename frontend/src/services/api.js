import axios from 'axios';

// Resolve API base URL from Vite environment variables with graceful fallback
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
// Normalize URL to always include '/api' suffix without trailing slashes
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseURL = normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;

let currentToken = typeof window !== 'undefined' ? localStorage.getItem('settlein_token') : null;

export const setApiToken = (token) => {
    currentToken = token;
};

const api = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = currentToken || (typeof window !== 'undefined' ? localStorage.getItem('settlein_token') : null);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: clear expired token if unauthorized
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                localStorage.removeItem('settlein_token');
                localStorage.removeItem('settlein_user');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
