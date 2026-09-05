// src/pages/Logout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Logout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout, api, isAuthenticated } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      // Check if user is authenticated
      if (!isAuthenticated) {
        // Clear local state and redirect
        logout();
        setLoading(false);
        navigate('/login');
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Call logout endpoint using axios instance
        await api.post('/logout/');
        
        // Clear local storage (though axios interceptors might handle this)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Call the logout function from context
        logout();
        
        setLoading(false);
        navigate('/login');
        
      } catch (err) {
        console.error('Logout error:', err);
        setError(err.response?.data?.detail || err.response?.data?.message || 'An error occurred during logout');
        
        // Even if the server request fails, clear local session
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        logout();
        setLoading(false);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    performLogout();
  }, [logout, navigate, api, isAuthenticated]);

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
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold text-red-600 mb-6">Logout Error</h1>
          <p className="text-xl text-text-muted mb-4">{error}</p>
          <p className="text-text-muted mb-8">Redirecting you to login page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return null; 
}

export default Logout;