// src/pages/Wallet.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import API_URL from '@/config/api'; 

function Wallet() {
  const { user } = useAuth(); 
  const [balance, setBalance] = useState(0);
  const [payouts, setPayouts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    amount: '',
  });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        
        setBalance(45000);
        setPayouts([
          { id: 1, date: '2026-01-01', amount: 12000, status: 'Paid' },
          { id: 2, date: '2025-12-15', amount: 8000, status: 'Pending' },
        ]);
      } catch (err) {
        setError('Could not load wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setWithdrawSuccess(false);

    // Basic validation
    if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
      setError('Please fill all bank details');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (formData.amount > balance) {
      setError('Insufficient balance');
      return;
    }

    setWithdrawLoading(true);

    try {
      
      setBalance(prev => prev - Number(formData.amount));
      setPayouts([
        {
          id: payouts.length + 1,
          date: new Date().toISOString().split('T')[0],
          amount: formData.amount,
          status: 'Pending',
        },
        ...payouts,
      ]);

      setWithdrawSuccess(true);
      setFormData({ bankName: '', accountNumber: '', accountName: '', amount: '' });
    } catch (err) {
      setError(err.message || 'Failed to process withdrawal');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-xl text-text-primary">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-12">
          My Wallet
        </h1>

        {/* Balance Card */}
        <div className="bg-white rounded-2xl shadow-card p-8 mb-12 text-center">
          <p className="text-xl text-text-muted mb-4">Available Balance</p>
          <p className="text-5xl font-bold text-primary">
            ₦{balance.toLocaleString()}
          </p>
          <p className="text-sm text-text-muted mt-2">
            Payouts processed monthly (1st–5th). Minimum ₦5,000.
          </p>
        </div>

        {/* Earnings History */}
        <div className="bg-white rounded-2xl shadow-card p-8 mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Earnings History
          </h2>

          {payouts.length === 0 ? (
            <p className="text-center text-text-muted">No earnings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="py-4 px-2 font-semibold">Date</th>
                    <th className="py-4 px-2 font-semibold">Amount</th>
                    <th className="py-4 px-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-border-light">
                      <td className="py-4 px-2">{payout.date}</td>
                      <td className="py-4 px-2">₦{payout.amount.toLocaleString()}</td>
                      <td className="py-4 px-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            payout.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Withdraw Earnings
          </h2>

          {withdrawSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Withdrawal request submitted! Funds will be processed by the 5th.
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-text-primary mb-2">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. GTBank, Zenith, Access"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-text-primary mb-2">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0123456789"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-text-primary mb-2">
                Account Name
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-text-primary mb-2">
                Amount (₦)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Minimum ₦5,000"
                min="5000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={withdrawLoading || balance < 5000}
              className={`w-full btn-primary py-5 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
                withdrawLoading ? 'cursor-wait' : ''
              }`}
            >
              {withdrawLoading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Wallet;