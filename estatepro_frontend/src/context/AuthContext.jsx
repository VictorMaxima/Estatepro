// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '@/config/api';

const getCSRFToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    for (const raw of document.cookie.split(';')) {
      const cookie = raw.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (config.method !== 'get') {
    const csrfToken = getCSRFToken();
    if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
}, (error) => Promise.reject(error));

// Endpoints that must NEVER trigger the refresh logic
const AUTH_ENDPOINTS = ['/token/', '/token/refresh/', '/logout/', '/register/'];
const isAuthEndpoint = (url = '') => AUTH_ENDPOINTS.some((p) => url.includes(p));

// Single-flight refresh promise — all concurrent 401s await the same call
let refreshPromise = null;

const performRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = api.post('/token/refresh/').finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

let redirecting = false;
const forceLogout = () => {
  localStorage.removeItem('homemuUser');
  if (!redirecting) {
    redirecting = true;
    window.location.href = '/login';
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const url = originalRequest.url || '';

    // 1. Don't touch auth endpoints — let their 401s bubble up as-is
    if (isAuthEndpoint(url)) {
      return Promise.reject(error);
    }

    // 2. CSRF failure — refresh token, retry once
    if (
      status === 403 &&
      error.response?.data?.detail === 'CSRF Failed: CSRF token missing or incorrect' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await api.get('/get-csrf-token/');
        const csrfToken = getCSRFToken();
        if (csrfToken) originalRequest.headers['X-CSRFToken'] = csrfToken;
        return api(originalRequest);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    // 3. 401 — try ONE refresh, then retry once
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await performRefresh();
        return api(originalRequest);
      } catch (refreshError) {
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    // 4. Any other 401 (already retried) → logout
    if (status === 401) {
      forceLogout();
    }

    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await api.get('/get-csrf-token/');
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
      }

      const savedUser = localStorage.getItem('homemuUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Optional: verify the session is still alive
          // await api.get('/me/');  // uncomment if you have such an endpoint
        } catch (e) {
          console.error('Failed to parse saved user data:', e);
          localStorage.removeItem('homemuUser');
        }
      }
      setLoading(false);
    };
    initializeApp();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/token/', { email, password });
      const userInfo = {
        id: response.data.user_id,
        name: response.data.full_name,
        email,
        isAgent: response.data.is_agent || false,
      };
      localStorage.setItem('homemuUser', JSON.stringify(userInfo));
      setUser(userInfo);
      return { success: true, user: userInfo };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/register/', {
        email: userData.email,
        username: userData.email,
        password: userData.password,
        first_name: userData.name,
      });
      const newUser = {
        id: response.data.user_id,
        email: response.data.email,
        name: response.data.full_name || userData.name,
        isAgent: false,
      };
      localStorage.setItem('homemuUser', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Signup failed',
      };
    }
  };

  const updateUser = (updatedFields) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    localStorage.setItem('homemuUser', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = async () => {
    try {
      await api.post('/logout/');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('homemuUser');
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAgent: !!user?.isAgent,
    loading,
    login,
    signup,
    updateUser,
    logout,
    api,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
