/**
 * API Configuration
 * Centralizes the base URL for the backend API.
 * Uses Vite's environment variable system.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
