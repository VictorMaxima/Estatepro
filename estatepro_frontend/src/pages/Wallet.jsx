// src/pages/Wallet.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const naira = (kobo) => `₦${(Number(kobo || 0) / 100).toLocaleString()}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');

const SALE_LABELS = {
  held: 'Awaiting viewing',
  viewing_confirmed: 'Viewing done (dispute window)',
  released: 'Ready for payout',
  disputed: 'Under review',
  refunded: 'Refunded',
  paid_out: 'Paid',
};

const badge = (status) => {
  if (['paid_out', 'success', 'released'].includes(status)) return 'bg-green-100 text-green-800';
  if (['refunded', 'failed', 'reversed', 'disputed'].includes(status)) return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
};

function Wallet() {
  const { api } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [account, setAccount] = useState(null);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ bank_code: '', account_number: '' });
  const [saving, setSaving] = useState(false);
  const [codes, setCodes] = useState({}); // viewing code input per transaction id

  const load = useCallback(async () => {
    try {
      const [e, a, b] = await Promise.all([
        api.get('/payment/earnings/'),
        api.get('/payment/payout-account/'),
        api.get('/payment/banks/'),
      ]);
      setEarnings(e.data);
      setAccount(a.data);
      setBanks(b.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load wallet data');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const saveAccount = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!/^\d{10}$/.test(form.account_number)) {
      setError('Account number must be 10 digits');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/payment/payout-account/', form);
      setAccount({ configured: true, account_name: res.data.account_name, last4: res.data.last4 });
      setForm({ bank_code: '', account_number: '' });
      setNotice(`Saved. Payouts will go to ${res.data.account_name}.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save bank details');
    } finally {
      setSaving(false);
    }
  };

  const confirmViewing = async (id) => {
    setError('');
    setNotice('');
    try {
      await api.post(`/payment/confirm-viewing/${id}/`, { code: (codes[id] || '').trim() });
      setNotice('Viewing confirmed. Funds are released after the buyer’s dispute window.');
      setCodes((c) => ({ ...c, [id]: '' }));
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not confirm viewing');
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
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-12">My Wallet</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}
        {notice && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">{notice}</div>
        )}

        {earnings && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
              <p className="text-text-muted mb-2">In escrow</p>
              <p className="text-3xl font-bold text-text-primary">{naira(earnings.in_escrow_kobo)}</p>
              <p className="text-sm text-text-muted mt-2">Released after the buyer views the property</p>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
              <p className="text-text-muted mb-2">Next weekly payout</p>
              <p className="text-3xl font-bold text-primary">{naira(earnings.next_payout_kobo)}</p>
              <p className="text-sm text-text-muted mt-2">Paid automatically to your bank account</p>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
              <p className="text-text-muted mb-2">Paid out</p>
              <p className="text-3xl font-bold text-text-primary">{naira(earnings.paid_out_kobo)}</p>
              <p className="text-sm text-text-muted mt-2">Total received</p>
            </div>
          </div>
        )}

        {/* Payout account */}
        <div className="bg-white rounded-2xl shadow-card p-8 mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Payout Account</h2>
          {account?.configured ? (
            <p className="text-text-muted mb-6">
              Payouts go to <span className="font-semibold text-text-primary">{account.account_name}</span> (account
              ending {account.last4}). Submit new details below to change it.
            </p>
          ) : (
            <p className="text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-3 mb-6">
              Add your bank account so we can pay you. Without it, your earnings stay on hold.
            </p>
          )}
          <form onSubmit={saveAccount} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-text-primary mb-2">Bank</label>
              <select
                value={form.bank_code}
                onChange={(e) => setForm({ ...form, bank_code: e.target.value })}
                className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select your bank</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-semibold text-text-primary mb-2">Account Number</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={form.account_number}
                onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, '') })}
                className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0123456789"
                required
              />
              <p className="text-sm text-text-muted mt-2">We verify the account name with your bank.</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary py-5 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Verifying...' : 'Save Bank Details'}
            </button>
          </form>
        </div>

        {/* Sales */}
        <div className="bg-white rounded-2xl shadow-card p-8 mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Sales</h2>
          {!earnings?.sales?.length ? (
            <p className="text-center text-text-muted">No paid sales yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="py-4 px-2 font-semibold">Property</th>
                    <th className="py-4 px-2 font-semibold">Your share</th>
                    <th className="py-4 px-2 font-semibold">Status</th>
                    <th className="py-4 px-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.sales.map((s) => (
                    <tr key={s.id} className="border-b border-border-light">
                      <td className="py-4 px-2">{s.property_title}</td>
                      <td className="py-4 px-2">{naira(s.seller_kobo)}</td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${badge(s.status)}`}>
                          {SALE_LABELS[s.status] || s.status}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        {s.status === 'held' ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="Buyer's code"
                              value={codes[s.id] || ''}
                              onChange={(e) => setCodes({ ...codes, [s.id]: e.target.value.replace(/\D/g, '') })}
                              className="w-32 px-3 py-2 border border-border-light rounded-lg"
                            />
                            <button
                              onClick={() => confirmViewing(s.id)}
                              disabled={(codes[s.id] || '').length !== 6}
                              className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
                            >
                              Confirm viewing
                            </button>
                          </div>
                        ) : s.status === 'viewing_confirmed' ? (
                          <span className="text-sm text-text-muted">Releases after {fmtDate(s.dispute_deadline)}</span>
                        ) : s.status === 'held' ? null : (
                          '-'
                        )}
                        {s.status === 'held' && s.viewing_deadline && (
                          <p className="text-xs text-text-muted mt-1">Viewing due by {fmtDate(s.viewing_deadline)}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payout history */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Payout History</h2>
          {!earnings?.payouts?.length ? (
            <p className="text-center text-text-muted">No payouts yet</p>
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
                  {earnings.payouts.map((p) => (
                    <tr key={p.id} className="border-b border-border-light">
                      <td className="py-4 px-2">{fmtDate(p.created_at)}</td>
                      <td className="py-4 px-2">{naira(p.amount_kobo)}</td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1 rounded-full text-sm capitalize ${badge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wallet;
