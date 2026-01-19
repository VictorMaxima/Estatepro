// src/services/api.js
import axios from 'axios';
import API_URL from '@/config/api';

// Create Axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout - prevents hanging requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Automatically add Bearer token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Use 'accessToken' (consistent with login/logout)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token refresh on 401 (expired access token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we got 401 and it's not a retry (prevent infinite loop)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const refreshResponse = await axios.post(`${API_URL}api/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = refreshResponse.data;

        // Save new access token
        localStorage.setItem('accessToken', access);

        // Update original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Refresh failed → force logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Redirect to login
        window.location.href = '/login?session_expired=true';

        return Promise.reject(refreshError);
      }
    }

    // For all other errors, just reject
    return Promise.reject(error);
  }
);

export default api;