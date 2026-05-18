// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '@/config/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic client-side validation
    if (!email.trim()) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();
      console.log(data);
      if (data.error === 'Invalid credentials') {
          setPopupMessage('Invalid email or password. Please try again.');
          setShowPopup(true);
          throw new Error('Invalid credentials');
      }

      if (!response.ok) {
        // Check for invalid credentials error
        if (data.error === 'Invalid credentials') {
          setPopupMessage('Invalid email or password. Please try again.');
          setShowPopup(true);
          throw new Error('Invalid credentials');
        }
        throw new Error(data.detail || data.message || 'Login failed');
      }

      // Store tokens securely
      localStorage.setItem('accessToken', data.access_token);
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh_token);
      }

      // Update auth context (extracts id + is_agent)
      login(data);

      // Redirect logic based on is_agent from backend
      if (data.is_agent === true) {
        navigate('/agent-dashboard');
      } else {
        navigate('/');
      }

    } catch (err) {
      if (err.message !== 'Invalid credentials') {
        setError(err.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setPopupMessage('');
  };

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center py-12 px-4">
      {/* Custom Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closePopup}
          />
          
          {/* Popup Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            {/* Message */}
            <h3 className="text-2xl font-bold text-text-primary text-center mb-4">
              Login Failed
            </h3>
            <p className="text-text-muted text-center mb-8">
              {popupMessage || 'Invalid email or password. Please try again.'}
            </p>
            
            {/* Button */}
            <button
              onClick={closePopup}
              className="w-full btn-primary py-4 text-lg font-semibold hover:bg-primary-dark transition"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 w-full max-w-md">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-8">
          Welcome Back
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-text-primary mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-text-primary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full btn-primary py-5 text-xl font-bold disabled:opacity-70 transition ${
              loading ? 'cursor-not-allowed' : 'hover:bg-primary-dark'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-8 text-text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;