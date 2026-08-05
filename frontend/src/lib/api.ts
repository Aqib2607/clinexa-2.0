import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

// Base URL from centralized config
const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // withCredentials is NOT needed for token-based Sanctum auth.
    // The Authorization: Bearer <token> header handles authentication.
    // Enabling withCredentials with cross-origin requests requires
    // Access-Control-Allow-Origin to be an exact origin (not *),
    // which is already configured in cors.php.
});

// Request interceptor to add token if we decide to use Bearer tokens later
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized globally
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login if not already there
            localStorage.removeItem('auth_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
