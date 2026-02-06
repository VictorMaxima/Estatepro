// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PaystackPop from '@paystack/inline-js'; // ← NEW: Official SDK
import API_URL from '@/config/api';
import { useAuth } from '../context/AuthContext';

function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${API_URL}properties/detail/${slug}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Property not found');
        }

        setProperty(data);
      } catch (err) {
        setError(err.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);

  const payWithPaystack = () => {
    if (!property?.price) {
      setError('Invalid property price');
      return;
    }

    setPaymentLoading(true);
    setError('');

    const handler = PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user?.email || 'buyer@example.com',
      amount: property.price * 100, // Convert to kobo
      currency: 'NGN',
      ref: '' + Math.floor((Math.random() * 1000000000) + 1), // unique ref
      firstname: user?.firstName || 'Customer',
      lastname: user?.lastName || '',
      metadata: {
        property_id: property.id,
        slug: property.slug,
        user_id: user?.id,
      },
      callback: (response) => {
        console.log('Payment successful:', response);
        alert('Payment successful! Reference: ' + response.reference);
        setPaymentLoading(false);
        // TODO: Call backend to verify payment
        // e.g. fetch(`${API_URL}api/verify-payment`, { method: 'POST', body: JSON.stringify({ reference: response.reference }) })
        navigate('/payment-success'); // or show success UI
      },
      onClose: () => {
        console.log('Payment window closed');
        setPaymentLoading(false);
        setError('Payment cancelled');
      },
    });

    handler.openIframe(); // Opens Paystack popup
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-xl text-text-primary">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-card p-12 max-w-md">
          <h1 className="text-5xl font-bold text-text-primary mb-4">Error</h1>
          <p className="text-xl text-text-muted mb-8">{error || 'Invalid property'}</p>
          <Link to="/properties" className="text-primary text-lg hover:underline">
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-12">
          Checkout - {property.title}
        </h1>

        <div className="bg-white rounded-2xl shadow-card p-8 md:p-12">
          {/* Property Summary */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <img
                src={property.images?.[0] || 'https://via.placeholder.com/600x400?text=Property'}
                alt={property.title}
                className="w-full h-64 md:h-80 object-cover rounded-xl shadow-md"
              />
            </div>
            <div className="space-y-6 flex flex-col justify-center">
              <div>
                <span className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold mb-4">
                  {property.property_type || 'Property'}
                </span>
                <h2 className="text-3xl font-bold text-text-primary mb-2">
                  {property.title}
                </h2>
                <p className="text-2xl font-bold text-primary">
                  ₦{parseInt(property.price || 0).toLocaleString()}
                </p>
                <p className="text-lg text-text-muted mt-2">
                  {property.location}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{property.bedrooms || '-'}</p>
                  <p className="text-text-muted text-sm">Bedrooms</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{property.bathrooms || '-'}</p>
                  <p className="text-text-muted text-sm">Bathrooms</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{property.size || '-'}</p>
                  <p className="text-text-muted text-sm">sqm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="border-t border-border-light pt-8">
            <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
              Complete Secure Payment
            </h3>

            <div className="max-w-md mx-auto text-center space-y-6">
              <p className="text-xl text-text-muted">
                Secure payment via Paystack
              </p>

              <button
                onClick={payWithPaystack}
                disabled={paymentLoading}
                className="btn-primary py-5 px-12 text-xl font-bold w-full md:w-auto mx-auto block disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? 'Processing...' : 'Pay Now'}
              </button>

              {error && (
                <p className="text-red-600 text-sm mt-4">{error}</p>
              )}

              <p className="text-sm text-text-muted mt-4">
                Your payment is protected. No charges until confirmation.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to={`/properties/detail/${slug}`} className="text-primary hover:underline text-lg">
            ← Back to Property Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Checkout;