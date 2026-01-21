// src/pages/Properties.jsx
import { useState, useEffect } from 'react';
import PropertyCard from '../components/common/PropertyCard';
import API_URL from '@/config/api';

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_URL}properties`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.message || 'Failed to load properties');
        }

        setProperties(data);
      } catch (err) {
        setError(err.message || 'Could not load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-xl text-text-primary">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4 py-20">
        <div className="text-center bg-white rounded-2xl shadow-card p-12 max-w-md">
          <h1 className="text-4xl font-bold text-red-600 mb-6">Error</h1>
          <p className="text-xl text-text-muted mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary py-4 px-10"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-text-primary text-center mb-12">
          All Properties
        </h1>

        {properties.length === 0 ? (
          <p className="text-center text-2xl text-text-muted">No properties found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard
                key={property.id || property.slug || `prop-${Math.random().toString(36).slice(2)}`}
                property={property}
                linkTo={`/properties/detail/${property.slug}`} // ← Links to detail using slug
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Properties;