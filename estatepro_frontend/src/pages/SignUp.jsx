import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '@/config/api';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          password: formData.password,
          
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        
        throw new Error(data.detail || data.message || 'Signup failed. Please try again.');
      }

      // Success!
      alert('Account created successfully! Please log in.');
      navigate('/login');

    } catch (err) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl shadow-card p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-8">
          Create Account
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full btn-primary py-4 font-bold transition ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark'
            }`}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;