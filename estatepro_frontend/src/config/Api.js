// src/config/api.js
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_URL = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

if (import.meta.env.DEV) {
  console.log('Using API base URL:', API_URL);
}

export default API_URL;