// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '@/config/api';


const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🔑 This sends cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh - cookies are sent automatically
        await api.post('/token/refresh/');
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.removeItem('homemuUser'); // Clear user data
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedUser = localStorage.getItem('homemuUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse saved user data:', e);
        localStorage.removeItem('homemuUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/token/', { email, password });
      
      // Tokens are automatically stored in HttpOnly cookies by the server
      // We only store non-sensitive user info in localStorage
      const userInfo = {
        id: response.data.user_id,
        name: response.data.full_name || response.data.user.username,
        isAgent: response.data.is_agent || false,
      };

      localStorage.setItem('homemuUser', JSON.stringify(userInfo));
      setUser(userInfo);
      
      return { success: true, user: userInfo };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
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
        // Add other fields as needed
      });
      
      const newUser = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.first_name || userData.name,
        profilePic: null,
        isAgent: false,
      };

      localStorage.setItem('homemuUser', JSON.stringify(newUser));
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Signup failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Signup failed' 
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
      // Call logout endpoint to clear cookies on server
      await api.post('/logout/');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage regardless of API response
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
    api, // Export for making authenticated requests
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}