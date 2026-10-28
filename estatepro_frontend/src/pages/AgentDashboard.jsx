// src/pages/AgentDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AgentDashboard() {
  const [stats, setStats] = useState({ totalProperties: 0 });
  const [earnings, setEarnings] = useState(null);
  const [payoutAccount, setPayoutAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [error, setError] = useState('');
  const { api, user, logout } = useAuth(); // Added user and logout
  
  // Fixed: Added dependency array to prevent infinite loops
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/agent/properties');
        
        // No need for .json() - api instance already parses JSON
        const data = response.data;

        setStats({ totalProperties: data.length || 0 });
      } catch (err) {
        console.error('Failed to load stats:', err);
        setError('Could not load dashboard stats');
        
        // Handle unauthorized access
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [api, logout]); // Added dependency array

  // Real earnings data. A failure here must not break the rest of the dashboard.
  useEffect(() => {
    const fetchWallet = async () => {
      const [e, a] = await Promise.allSettled([
        api.get('/payment/earnings/'),
        api.get('/payment/payout-account/'),
      ]);
      if (e.status === 'fulfilled') setEarnings(e.value.data);
      if (a.status === 'fulfilled') setPayoutAccount(a.value.data);
      setWalletLoading(false);
    };
    fetchWallet();
  }, [api]);

  const naira = (kobo) => `₦${(Number(kobo || 0) / 100).toLocaleString()}`;
  const awaitingViewing = earnings?.sales?.filter((s) => s.status === 'held').length || 0;

  // Show loading state while checking authentication
  if (loading && walletLoading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Unable to Load Dashboard</h2>
          <p className="text-text-muted mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary py-3 px-6"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Welcome Section */}
        <div className="bg-white rounded-2xl shadow-card p-10 md:p-16 text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-text-primary mb-6">
            Welcome back, {user?.name || 'Agent'}!
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
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">Coming Soon</p>
                <p className="text-text-muted mt-2">Leads & Inquiries</p>
              </div>
            </div>
          )}
        </div>

        {/* Agent Tools */}
        <h2 className="text-4xl font-bold text-text-primary text-center mb-12">
          Your Agent Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Link
            to="/list-property"
            className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-12 text-center transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-7xl mb-6">🏠</div>
            <h3 className="text-3xl font-bold text-text-primary mb-4">
              List New Property
            </h3>
            <p className="text-text-muted text-lg">
              Add apartments, lands, shortlets, or commercial spaces
            </p>
          </Link>

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

        {/* Earnings Summary */}
        <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-10">My Earnings</h2>

          {walletLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto"></div>
            </div>
          ) : !earnings ? (
            <p className="text-center text-text-muted">Earnings are unavailable right now.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-bg-soft rounded-2xl p-6 text-center">
                  <p className="text-text-muted mb-2">In escrow</p>
                  <p className="text-3xl font-extrabold text-text-primary">{naira(earnings.in_escrow_kobo)}</p>
                  <p className="text-sm text-text-muted mt-2">Released after the buyer views the property</p>
                </div>
                <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-6 text-center">
                  <p className="opacity-90 mb-2">Next weekly payout</p>
                  <p className="text-3xl font-extrabold">{naira(earnings.next_payout_kobo)}</p>
                  <p className="text-sm opacity-90 mt-2">Paid automatically to your bank account</p>
                </div>
                <div className="bg-bg-soft rounded-2xl p-6 text-center">
                  <p className="text-text-muted mb-2">Paid out</p>
                  <p className="text-3xl font-extrabold text-text-primary">{naira(earnings.paid_out_kobo)}</p>
                  <p className="text-sm text-text-muted mt-2">Total received</p>
                </div>
              </div>

              {payoutAccount && !payoutAccount.configured && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-lg mb-6 text-center">
                  Add your bank account so we can pay you. Until then, your earnings stay on hold.
                </div>
              )}

              {awaitingViewing > 0 && (
                <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-lg mb-6 text-center">
                  {awaitingViewing} buyer{awaitingViewing > 1 ? 's are' : ' is'} waiting for a viewing. Enter the
                  buyer&apos;s code after the viewing to confirm it.
                </div>
              )}

              <div className="text-center">
                <Link
                  to="/wallet"
                  className="inline-block bg-primary text-white font-bold px-10 py-4 rounded-lg hover:bg-primary-dark transition text-lg"
                >
                  Manage Wallet &amp; Sales
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Support Section */}
        <div className="text-center mt-20">
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