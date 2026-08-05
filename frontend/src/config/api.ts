/**
 * API Configuration
 * Centralizes the base URL for the backend API.
 * Uses Vite's environment variable system, defaulting to production URL.
 */
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://clinexa-backend.onrender.com";


