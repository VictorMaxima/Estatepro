// src/config/api.js
const apiUrl = "https://maximavictor.pythonanywhere.com/api"
const baseUrl = 'https://maximavictor.pythonanywhere.com';
export const API_URL = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
export const BASE_URL = baseUrl;

if (import.meta.env.DEV) {
  console.log('Using API base URL:', API_URL);
}

export default API_URL;