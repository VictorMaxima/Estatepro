// src/config/api.js
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
export const API_URL = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
export const BASE_URL = baseUrl;

if (import.meta.env.DEV) {
  console.log('Using API base URL:', API_URL);
}

export default API_URL;