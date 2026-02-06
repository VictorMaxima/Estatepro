// src/services/api.js
import axios from 'axios';
import API_URL from '@/config/api';


const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, 
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        
        const refreshResponse = await axios.post(`${API_URL}token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = refreshResponse.data;

        
        localStorage.setItem('accessToken', access);

        
        originalRequest.headers.Authorization = `Bearer ${access}`;

        
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        
        window.location.href = '/login?session_expired=true';

        return Promise.reject(refreshError);
      }
    }

    
    return Promise.reject(error);
  }
);

export default api;