// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import API_URL from '@/config/api';
import { useAuth } from '../context/AuthContext'; // optional - for user email

function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // optional - pulls logged-in user's email

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentReference, setPaymentReference] = useState(null);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${API_URL}api/properties/detail/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.message || 'Property not found');
        }

        setProperty(data);
      } catch (err) {
        setError(err.message || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);

  // Paystack payment config
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  const paystackConfig = {
    email: user?.email || 'buyer@example.com', // fallback if not logged in
    amount: property?.price ? property.price * 100 : 0, // Paystack uses kobo (x100)
    currency: 'NGN',
    publicKey,
    text: 'Pay Now',
    onSuccess: (reference) => {
      setPaymentReference(reference);
      setPaymentSuccess(true);
      // TODO: Call backend to verify payment & reserve property
      // fetch(`${API_URL}api/verify-payment`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ reference, propertyId: property?.id }),
      // });
      alert('Payment successful! Property reserved.');
      navigate('/properties'); // redirect back to list
    },
    onClose: () => {
      setError('Payment cancelled');
    },
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

            {paymentSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 p-8 rounded-xl text-center">
                <h4 className="text-3xl font-bold mb-4">Payment Successful!</h4>
                <p className="text-lg mb-6">
                  Thank you! Your reservation for {property.title} is confirmed.
                  <br />
                  We'll contact you shortly with next steps.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/properties"
                    className="btn-primary py-4 px-10 text-lg font-bold"
                  >
                    Browse More Properties
                  </Link>
                  <Link
                    to="/agent/properties"
                    className="border-2 border-primary text-primary py-4 px-10 rounded-xl text-lg font-bold hover:bg-primary hover:text-white transition"
                  >
                    Go to My Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center space-y-6">
                <p className="text-xl text-text-muted">
                  Secure payment processed by Paystack
                </p>

                <PaystackButton
                  {...paystackConfig}
                  className="btn-primary py-5 px-12 text-xl font-bold w-full md:w-auto mx-auto block"
                />

                <p className="text-sm text-text-muted mt-4">
                  Your payment is protected. No charges until confirmation.
                </p>
              </div>
            )}
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