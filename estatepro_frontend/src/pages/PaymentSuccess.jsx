// src/pages/PaymentSuccess.jsx
// Paystack sends the buyer here after payment, with ?reference=... in the URL.
// Payment is only confirmed by the server-side webhook, so this page waits for it.
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MAX_TRIES = 20; // about 40 seconds
const INTERVAL_MS = 2000;

function PaymentSuccess() {
  const { api } = useAuth();
  const [params] = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');

  const [txn, setTxn] = useState(null);
  const [error, setError] = useState('');
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!reference) {
      setError('No payment reference found.');
      return undefined;
    }
    let cancelled = false;
    let tries = 0;
    let timer;

    const poll = async () => {
      try {
        const res = await api.get(`/payment/transaction/${reference}/`);
        if (cancelled) return;
        setTxn(res.data);
        if (res.data.status !== 'pending') return; // settled, stop polling
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.detail || 'Could not check your payment status.');
        return;
      }
      tries += 1;
      if (tries >= MAX_TRIES) {
        setTimedOut(true);
        return;
      }
      timer = setTimeout(poll, INTERVAL_MS);
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [api, reference]);

  const propertyLink = txn?.property_id ? `/properties/detail/${txn.property_id}` : '/properties';

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 max-w-lg w-full text-center space-y-6">
        {error ? (
          <>
            <h1 className="text-3xl font-bold text-text-primary">Something went wrong</h1>
            <p className="text-text-muted">{error}</p>
          </>
        ) : !txn || (txn.status === 'pending' && !timedOut) ? (
          <>
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-primary mx-auto"></div>
            <h1 className="text-2xl font-bold text-text-primary">Confirming your payment...</h1>
            <p className="text-text-muted">This usually takes a few seconds. Please don&apos;t close this page.</p>
          </>
        ) : txn.status === 'held' ? (
          <>
            <h1 className="text-3xl font-bold text-green-700">Payment received</h1>
            <p className="text-text-muted">
              Your money is held securely. The agent is paid only after you view the property. At the viewing, give
              the agent this code. Do not share it before you are at the property.
            </p>
            <p className="text-5xl font-bold tracking-widest text-primary">{txn.viewing_code || '------'}</p>
            {txn.viewing_deadline && (
              <p className="text-sm text-text-muted">
                Please view the property by {new Date(txn.viewing_deadline).toLocaleDateString()}. If it doesn&apos;t
                happen by then, you can request a refund.
              </p>
            )}
            <p className="text-sm text-text-muted">You can find this code again on the property page.</p>
          </>
        ) : txn.status === 'refunded' ? (
          <>
            <h1 className="text-3xl font-bold text-text-primary">Payment refunded</h1>
            <p className="text-text-muted">
              This property was taken by another buyer just before your payment was confirmed. Your money is being
              refunded.
            </p>
          </>
        ) : txn.status === 'failed' ? (
          <>
            <h1 className="text-3xl font-bold text-red-600">Payment could not be completed</h1>
            <p className="text-text-muted">
              If you were charged, please contact support with reference <strong>{reference}</strong>.
            </p>
          </>
        ) : timedOut ? (
          <>
            <h1 className="text-2xl font-bold text-text-primary">Still confirming</h1>
            <p className="text-text-muted">
              Your payment is taking longer than usual to confirm. Check the property page in a few minutes. If you
              were charged, quote reference <strong>{reference}</strong> to support.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-text-primary">Payment status: {txn.status}</h1>
            <p className="text-text-muted">Open the property page for the latest details.</p>
          </>
        )}

        <Link to={propertyLink} className="inline-block text-primary text-lg hover:underline">
          Go to the property page
        </Link>
      </div>
    </div>
  );
}

export default PaymentSuccess;
