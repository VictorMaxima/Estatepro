// src/components/WithdrawButton.jsx
import { useState } from 'react';
import { PaystackButton } from 'react-paystack';

function WithdrawButton({ amount, onSuccess, onError, disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Paystack payout config
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  // Note: For payouts, Paystack uses a different flow.
  // You need to:
  // 1. Create a transfer recipient on backend (bank details)
  // 2. Initiate transfer from backend using secret key
  // 3. Frontend only confirms or triggers the process

  // This is a simplified trigger button — real payout logic must be backend-driven

  const handleWithdraw = () => {
    setLoading(true);
    setError('');

    // In real app, this button would call backend to initiate payout
    // Example: POST /api/initiate-withdrawal with amount + recipient code

    // Simulate for now (replace with real backend call)
    setTimeout(() => {
      if (amount < 5000) {
        setError('Minimum withdrawal is ₦5,000');
        setLoading(false);
        onError?.('Minimum not met');
        return;
      }

      // Mock success
      setLoading(false);
      onSuccess?.({ reference: 'mock-payout-ref-123' });
      alert('Withdrawal request sent! Funds will arrive in 1–2 business days.');
    }, 1500);
  };

  // PaystackButton is for collections (incoming payments).
  // For payouts (sending money out), Paystack recommends backend initiation.
  // So we're using a custom button that triggers backend logic.

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <button
        onClick={handleWithdraw}
        disabled={disabled || loading || amount < 5000}
        className={`w-full btn-primary py-5 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition ${
          loading ? 'cursor-wait' : ''
        }`}
      >
        {loading ? 'Processing...' : 'Withdraw Earnings'}
      </button>

      <p className="text-sm text-text-muted text-center">
        Minimum ₦5,000 • Processed monthly (1st–5th)
      </p>
    </div>
  );
}

export default WithdrawButton;