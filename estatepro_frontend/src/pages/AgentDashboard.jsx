// src/pages/AgentDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

function AgentDashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingApplications: 0, // If you want to show this later
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');

  // Redirect if not logged in or not approved agent
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Optional: Check agent status from context or backend
    // if (user?.agentStatus !== 'approved') {
    //   navigate('/become-agent');
    //   return;
    // }
  }, [token, navigate]);

  // Fetch real stats (number of properties)
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}agent/properties`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Failed to load properties');
        }

        setStats({
          totalProperties: data.length || 0,
          pendingApplications: 0, // Add real API if available later
        });
      } catch (err) {
        setError('Could not load your stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="min-h-screen bg-bg-soft py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Welcome Section */}
        <div className="bg-white rounded-2xl shadow-card p-10 md:p-16 text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-text-primary mb-6">
            Welcome back, Agent!
          </h1>
          <p className="text-xl md:text-2xl text-text-muted max-w-4xl mx-auto leading-relaxed">
            You're a verified HomeMu agent — trusted by thousands of buyers, renters, and investors across Nigeria.
          </p>

          {loading ? (
            <div className="mt-10 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap justify-center gap-12 text-lg">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">{stats.totalProperties}</p>
                <p className="text-text-muted mt-2">Active Listings</p>
              </div>
              {/* Add more real stats later */}
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">Coming Soon</p>
                <p className="text-text-muted mt-2">Leads & Inquiries</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Cards */}
        <h2 className="text-4xl font-bold text-text-primary text-center mb-12">
          Your Agent Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* List New Property */}
          <Link
            to="/list-property"
            className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-12 text-center transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-7xl mb-6">🏠</div>
            <h3 className="text-3xl font-bold text-text-primary mb-4">
              List New Property
            </h3>
            <p className="text-text-muted text-lg">
              Add apartments, lands, shortlets, or commercial spaces to reach thousands of buyers
            </p>
          </Link>

          {/* My Listings */}
          <Link
            to="/agent/properties"
            className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-12 text-center transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-7xl mb-6">📋</div>
            <h3 className="text-3xl font-bold text-text-primary mb-4">
              My Listings
            </h3>
            <p className="text-text-muted text-lg">
              View, edit, and manage all your active properties
            </p>
          </Link>

          {/* Leads & Analytics (placeholder for future) */}
          <div className="bg-white rounded-2xl shadow-card p-12 text-center opacity-80 cursor-not-allowed">
            <div className="text-7xl mb-6">📊</div>
            <h3 className="text-3xl font-bold text-text-primary mb-4">
              Leads & Analytics
            </h3>
            <p className="text-text-muted text-lg">
              See inquiries, views, and insights (coming soon)
            </p>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-20 text-center">
          <p className="text-xl text-text-muted mb-6">
            Need help or have premium properties to list?
          </p>
          <a
            href="mailto:agents@homemu.ng"
            className="inline-block bg-primary text-white font-bold px-10 py-4 rounded-full hover:bg-primary-dark transition text-lg"
          >
            Contact Agent Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default AgentDashboard;