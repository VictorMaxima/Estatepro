// src/config/api.js
const apiUrl = "https://wg5wq9tt-8000.uks1.devtunnels.ms/api"
const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';
export const API_URL = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
export const BASE_URL = baseUrl;

if (import.meta.env.DEV) {
  console.log('Using API base URL:', API_URL);
}

export default API_URL;