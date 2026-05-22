// src/pages/AgentDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AgentDashboard() {
  const [stats, setStats] = useState({ totalProperties: 0 });
  const [walletBalance, setWalletBalance] = useState(0);
  const [payouts, setPayouts] = useState([]);
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

  // Fixed: Added dependency array for wallet fetch
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        // Replace with actual API call when backend is ready
        // const response = await api.get('/agent/wallet/');
        // setWalletBalance(response.data.balance);
        // setPayouts(response.data.payouts);
        
        // Temporary mock data
        setWalletBalance(45250);
        setPayouts([
          { id: 1, date: '2026-01-01', amount: 12500, status: 'Paid' },
          { id: 2, date: '2025-12-20', amount: 9800, status: 'Paid' },
          { id: 3, date: '2025-11-15', amount: 15200, status: 'Paid' },
        ]);
      } catch (err) {
        console.error('Wallet load error:', err);
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWallet();
  }, [api, logout]); // Added dependency array

  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    amount: '',
  });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const handleWithdrawChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess(false);

    if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
      setWithdrawError('Please fill all bank details');
      return;
    }
    if (!formData.amount || formData.amount < 5000) {
      setWithdrawError('Minimum withdrawal is ₦5,000');
      return;
    }
    if (formData.amount > walletBalance) {
      setWithdrawError('Insufficient balance');
      return;
    }

    setWithdrawLoading(true);

    try {
      // Replace with actual API call when backend is ready
      // const response = await api.post('/agent/withdraw/', {
      //   bank_name: formData.bankName,
      //   account_number: formData.accountNumber,
      //   account_name: formData.accountName,
      //   amount: formData.amount
      // });
      
      // Mock successful withdrawal
      setWalletBalance(prev => prev - Number(formData.amount));
      setPayouts([
        {
          id: payouts.length + 1,
          date: new Date().toISOString().split('T')[0],
          amount: Number(formData.amount),
          status: 'Pending',
        },
        ...payouts,
      ]);

      setWithdrawSuccess(true);
      setFormData({ bankName: '', accountNumber: '', accountName: '', amount: '' });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setWithdrawSuccess(false), 5000);
    } catch (err) {
      console.error('Withdrawal error:', err);
      setWithdrawError(err.response?.data?.message || 'Failed to submit withdrawal request');
      
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setWithdrawLoading(false);
    }
  };

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

        {/* Embedded Wallet Section */}
        <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-10">
            My Earnings Wallet
          </h2>

          {walletLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Balance Display */}
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 text-center mb-10">
                <p className="text-xl opacity-90 mb-4">Available Earnings</p>
                <p className="text-5xl md:text-6xl font-extrabold">
                  ₦{walletBalance.toLocaleString()}
                </p>
                <p className="text-sm opacity-90 mt-4">
                  Monthly payouts (1st–5th) • Minimum ₦5,000
                </p>
              </div>

              {/* Earnings History + Withdrawal Form Grid */}
              <div className="grid md:grid-cols-2 gap-10">
                {/* Earnings History */}
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-6">
                    Earnings History
                  </h3>

                  {payouts.length === 0 ? (
                    <p className="text-text-muted text-center py-8">No earnings yet</p>
                  ) : (
                    <div className="space-y-4">
                      {payouts.map((payout) => (
                        <div key={payout.id} className="flex justify-between items-center bg-bg-soft p-4 rounded-lg">
                          <div>
                            <p className="font-semibold">{payout.date}</p>
                            <p className="text-sm text-text-muted">Commission earnings</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₦{payout.amount.toLocaleString()}</p>
                            <p className={`text-sm ${
                              payout.status === 'Paid' 
                                ? 'text-green-600' 
                                : payout.status === 'Pending' 
                                ? 'text-yellow-600' 
                                : 'text-text-muted'
                            }`}>
                              {payout.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Withdrawal Form */}
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-6">
                    Request Withdrawal
                  </h3>

                  {withdrawSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg mb-6 text-center">
                      Withdrawal request submitted! Will be processed by the 5th.
                    </div>
                  )}

                  {withdrawError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6">
                      {withdrawError}
                    </div>
                  )}

                  {walletBalance < 5000 && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-lg mb-6 text-center">
                      Your balance is below ₦5,000 — cannot withdraw yet.
                    </div>
                  )}

                  <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleWithdrawChange}
                      placeholder="Bank Name"
                      className="w-full px-5 py-4 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleWithdrawChange}
                      placeholder="Account Number"
                      className="w-full px-5 py-4 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleWithdrawChange}
                      placeholder="Account Name"
                      className="w-full px-5 py-4 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleWithdrawChange}
                      placeholder="Amount (min ₦5,000)"
                      min="5000"
                      step="1000"
                      className="w-full px-5 py-4 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                      disabled={walletBalance < 5000}
                    />

                    <button
                      type="submit"
                      disabled={withdrawLoading || walletBalance < 5000}
                      className="w-full bg-primary text-white font-bold py-5 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition text-xl"
                    >
                      {withdrawLoading ? 'Processing...' : 'Request Withdrawal'}
                    </button>
                  </form>
                </div>
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