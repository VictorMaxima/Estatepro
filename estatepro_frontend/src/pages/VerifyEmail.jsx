// src/pages/VerifyEmail.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_URL from '@/config/api';

function VerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      // Get token from URL query (e.g. /verify-email?token=abc123)
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please request a new one.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}api/verify-email/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.detail || data.message || 'Verification failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    verify();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
      <div className="text-center bg-white rounded-2xl shadow-card p-12 max-w-md">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              Verifying Email...
            </h1>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-4xl font-bold text-green-600 mb-6">✓ Email Verified!</h1>
            <p className="text-xl text-text-muted mb-8">{message}</p>
            <p className="text-text-muted">Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-4xl font-bold text-red-600 mb-6">Verification Failed</h1>
            <p className="text-xl text-text-muted mb-8">{message}</p>
            <Link to="/login" className="btn-primary py-4 px-10">
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;