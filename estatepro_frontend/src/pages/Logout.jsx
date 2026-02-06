// src/pages/Logout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '@/config/api';

function Logout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth(); 
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const performLogout = async () => {
      if (!token) {
        
        logout();
        setLoading(false);
        navigate('/login');
        return;
      }

      setLoading(true);
      setError('');

      try {
        
        const response = await fetch(`${API_URL}logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || data.message || 'Logout failed on server');
        }

        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        logout(); 

        setLoading(false);
        navigate('/login');

      } catch (err) {
        console.error('Logout error:', err);
        setError(err.message || 'An error occurred during logout');

        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        logout();
        setLoading(false);
        navigate('/login');
      }
    };

    performLogout();
  }, [logout, navigate, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-xl text-text-primary">Logging you out...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-card p-12 max-w-md">
          <h1 className="text-4xl font-bold text-red-600 mb-6">Logout Error</h1>
          <p className="text-xl text-text-muted mb-8">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary py-4 px-10"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return null; 
}

export default Logout;