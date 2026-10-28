// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Checkout() {
  const params = useParams();
  // The property id. Accepts whatever name the route uses (:id, :slug or :propertyId).
  const slug = params.id ?? params.propertyId ?? params.slug;
  const navigate = useNavigate();
  const { api, user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [showNotice, setShowNotice] = useState(true);
  const [hasAgreed, setHasAgreed] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!slug) {
        setError('No property id in the URL. Check the /checkout route in your router.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/properties/detail/${slug}`);
        setProperty(response.data);
      } catch (err) {
        console.error('Failed to load property:', err);
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            'Failed to load property'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [api, slug]);

  // The server decides the amount and the reference. The browser only says which property.
  const startPayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setPaymentLoading(true);
    setError('');
    try {
      const res = await api.post(`/payment/initialize/${property.id}/`);
      window.location.href = res.data.authorization_url; // Paystack's hosted payment page
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          'Could not start payment. Please try again.'
      );
      setPaymentLoading(false);
    }
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

  if (!property) {
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

  const unavailable = property.status && property.status !== 'available' && !property.transaction;
  const imageUrl = property.images?.[0]?.image_url || 'https://via.placeholder.com/600x400?text=Property';

  return (
    <div className="min-h-screen bg-bg-soft py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-12">
          Checkout - {property.title}
        </h1>

        {showNotice && !unavailable ? (
          // ── ANTI-SCAM NOTICE ──
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
              <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-5 text-center">
                ⚠️ Important: Protect Yourself
              </h2>

              <p className="text-lg mb-6 text-center leading-relaxed text-gray-800">
                Pay <strong>only</strong> through this secure checkout. Never send money to an agent&apos;s personal
                account or pay anyone outside this website.
              </p>

              <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg mb-6 text-sm md:text-base text-gray-800 space-y-2">
                <p className="font-semibold text-center">How your payment is protected</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your money is held securely, not paid to the agent immediately.</li>
                  <li>After paying you get a viewing code. Give it to the agent only when you are at the property.</li>
                  <li>The agent is paid only after your viewing is confirmed and the dispute window passes.</li>
                  <li>If no viewing happens in time, you can request a refund.</li>
                </ul>
              </div>

              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  id="scam-agree"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="h-5 w-5 mt-1 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="scam-agree" className="ml-3 text-gray-700 text-base">
                  I understand that I should pay <strong>only</strong> through this checkout and keep my viewing code
                  private until I am at the property.
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-gray-300 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-400 transition"
                >
                  Cancel & Go Back
                </button>
                <button
                  onClick={() => setShowNotice(false)}
                  disabled={!hasAgreed}
                  className={`flex-1 py-4 rounded-xl font-bold text-white transition ${
                    hasAgreed ? 'bg-primary hover:bg-primary/90' : 'bg-gray-400 cursor-not-allowed opacity-70'
                  }`}
                >
                  I Understand – Continue
                </button>
              </div>

              <p className="text-xs text-center mt-6 text-gray-500">
                We never ask for direct transfers to individuals. Report suspicious requests immediately.
              </p>
            </div>
          </div>
        ) : (
          // ── CHECKOUT CONTENT ──
          <div className="bg-white rounded-2xl shadow-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <img src={imageUrl} alt={property.title} className="w-full h-64 md:h-80 object-cover rounded-xl shadow-md" />
              </div>
              <div className="space-y-6 flex flex-col justify-center">
                <div>
                  <span className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold mb-4 capitalize">
                    {property.property_type || 'Property'}
                  </span>
                  <h2 className="text-3xl font-bold text-text-primary mb-2">{property.title}</h2>
                  <p className="text-2xl font-bold text-primary">₦{parseInt(property.price || 0).toLocaleString()}</p>
                  <p className="text-lg text-text-muted mt-2">{property.location}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{property.no_of_bedrooms || '-'}</p>
                    <p className="text-text-muted text-sm">Bedrooms</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{property.no_of_bathrooms || '-'}</p>
                    <p className="text-text-muted text-sm">Bathrooms</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{property.size || '-'}</p>
                    <p className="text-text-muted text-sm">sqm</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border-light pt-8">
              <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">Complete Secure Payment</h3>

              <div className="max-w-md mx-auto text-center space-y-6">
                {unavailable ? (
                  <p className="text-xl text-text-muted capitalize">This property is {property.status}.</p>
                ) : !user ? (
                  <>
                    <p className="text-xl text-text-muted">Please log in to continue.</p>
                    <Link to="/login" className="btn-primary py-5 px-12 text-xl font-bold block">
                      Log In
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-xl text-text-muted">
                      You will pay <strong>₦{parseInt(property.price || 0).toLocaleString()}</strong> securely via
                      Paystack.
                    </p>
                    <button
                      onClick={startPayment}
                      disabled={paymentLoading}
                      className="btn-primary py-5 px-12 text-xl font-bold w-full md:w-auto mx-auto block disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paymentLoading ? 'Redirecting...' : 'Pay Now'}
                    </button>
                  </>
                )}

                {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

                <p className="text-sm text-text-muted mt-4">
                  Your payment is held in escrow until you have viewed the property. The agent is not paid before
                  then.
                </p>
              </div>
            </div>
          </div>
        )}

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
