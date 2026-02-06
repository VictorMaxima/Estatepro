// src/components/WithdrawButton.jsx
import { useState } from 'react';
import PaystackPop from '@paystack/inline-js';

function WithdrawButton({
  amount = 0,
  bankDetails = {}, // expected: { accountNumber, bankCode, accountName }
  onSuccess = () => {},
  onError = () => {},
  disabled = false,
  minAmount = 5000,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = () => {
    // 1. Client-side validation
    if (amount < minAmount) {
      setError(`Minimum withdrawal is ₦${minAmount.toLocaleString()}`);
      onError('minimum_not_met');
      return;
    }

    if (
      !bankDetails.accountNumber ||
      !bankDetails.bankCode ||
      !bankDetails.accountName
    ) {
      setError('Please complete bank details first');
      onError('incomplete_bank_details');
      return;
    }

    setLoading(true);
    setError('');

    // 2. Launch Paystack popup
    const handler = PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: 'agent@example.com', // ← REPLACE with real user email (from auth context)
      amount: amount * 100, // Convert Naira → kobo
      currency: 'NGN',
      ref: 'wd_' + Math.random().toString(36).substr(2, 9), // unique ref
      channels: ['bank_transfer'], // prefer bank transfer for payouts
      metadata: {
        type: 'withdrawal',
        amount_naira: amount,
        bank_account_number: bankDetails.accountNumber,
        bank_code: bankDetails.bankCode,
        account_name: bankDetails.accountName,
        // optional: user_id, wallet_id, etc.
      },
      callback: (response) => {
        console.log('Withdrawal initiated:', response);
        setLoading(false);
        onSuccess(response.reference);
        alert(`Withdrawal request submitted! Reference: ${response.reference}`);
        // VERY IMPORTANT: Verify on backend immediately
        // fetch(`${API_URL}api/verify-withdrawal`, {
        //   method: 'POST',
        //   body: JSON.stringify({ reference: response.reference })
        // })
      },
      onClose: () => {
        setLoading(false);
        setError('Withdrawal cancelled');
        onError('cancelled');
      },
    });

    handler.openIframe(); // opens Paystack popup
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleWithdraw}
        disabled={disabled || loading || amount < minAmount}
        className={`w-full btn-primary py-5 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition ${
          loading ? 'cursor-wait' : ''
        }`}
      >
        {loading ? 'Processing...' : 'Withdraw Earnings'}
      </button>

      <p className="text-sm text-text-muted text-center">
        Minimum ₦{minAmount.toLocaleString()} • Processed monthly (1st–5th)
      </p>
    </div>
  );
}

export default WithdrawButton;