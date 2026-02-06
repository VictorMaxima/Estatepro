// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
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
  }, []);

  const login = (loginData) => {
  const userInfo = {
    id: loginData.user_id,
    email: loginData.email || '',
    isAgent: !!loginData.is_agent,   // ← changed here
  };

  localStorage.setItem('homemuUser', JSON.stringify(userInfo));
  setUser(userInfo);

  return userInfo;
};


  const signup = (signupData) => {
    // Signup typically creates a normal user (is_agent = false)
    const newUser = {
      id: signupData.user_id || null,
      email: signupData.email || '',
      isAgent: false,
    };

    localStorage.setItem('homemuUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  const updateUser = (updatedFields) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    localStorage.setItem('homemuUser', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem('homemuUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const value = {
  user,
  isAuthenticated: !!user,
  isAgent: !!user?.isAgent,   // ← changed here
  login,
  signup,
  updateUser,
  logout,
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