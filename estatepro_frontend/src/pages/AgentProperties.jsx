// src/pages/AgentProperties.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '@/config/api';

function AgentProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch agent's properties
  useEffect(() => {
    const fetchProperties = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_URL}agent/properties`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.message || 'Failed to load your properties');
        }

        setProperties(data); // Backend should return array of properties
      } catch (err) {
        setError(err.message || 'Could not load your properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [token]);

  return (
    <div className="min-h-screen bg-bg-soft py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            My Properties
          </h1>
          <Link
            to="/list-property"
            className="mt-4 md:mt-0 btn-primary py-4 px-10 text-lg font-bold"
          >
            + List New Property
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
            <p className="text-xl text-text-primary">Loading your properties...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-12 rounded-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Error</h2>
            <p className="text-xl">{error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-16 text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-6">
              No Properties Listed Yet
            </h2>
            <p className="text-xl text-text-muted mb-8">
              Start listing your first property today!
            </p>
            <Link to="/list-property" className="btn-primary py-4 px-10">
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Main Image */}
                <div className="h-48 bg-gray-200 relative">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-primary mb-2 truncate">
                    {property.title}
                  </h3>

                  <p className="text-primary font-bold text-xl mb-4">
                    ₦{parseInt(property.price || 0).toLocaleString()}
                  </p>

                  <div className="space-y-2 text-text-muted mb-6">
                    <p><strong>Location:</strong> {property.location}</p>
                    <p><strong>Type:</strong> {property.property_type || property.type}</p>
                    <p><strong>Size:</strong> {property.size} sqm</p>
                    <p><strong>Rooms:</strong> {property.bedrooms || 0} bed • {property.bathrooms || 0} bath</p>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      to={`/property/${property.id}`}
                      className="flex-1 text-center py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
                    >
                      View Details
                    </Link>
                    <button
                      className="flex-1 py-3 bg-gray-200 text-text-muted rounded-lg hover:bg-gray-300 transition"
                      onClick={() => alert('Edit feature coming soon')}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentProperties;