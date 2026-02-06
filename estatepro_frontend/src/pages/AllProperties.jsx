// src/pages/Properties.jsx
import { useState, useEffect } from 'react';
import PropertyCard from '../components/common/PropertyCard';
import API_URL from '@/config/api';

function Properties() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all properties once
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_URL}properties`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.message || 'Failed to load properties');
        }

        setProperties(data);
        setFilteredProperties(data); // initial full list
      } catch (err) {
        setError(err.message || 'Could not load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter locally whenever search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties(properties);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = properties.filter((prop) =>
      prop.title?.toLowerCase().includes(term) ||
      prop.location?.toLowerCase().includes(term) ||
      prop.property_type?.toLowerCase().includes(term)
    );

    setFilteredProperties(filtered);
  }, [searchTerm, properties]);

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
        <h1 className="text-5xl font-bold text-text-primary text-center mb-8">
          All Properties
        </h1>

        {/* Search Input */}
        <div className="mb-12 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search by title, location, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-5 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
          />
        </div>

        {filteredProperties.length === 0 ? (
          <p className="text-center text-2xl text-text-muted">
            {searchTerm.trim() 
              ? 'No properties match your search' 
              : 'No properties found'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.slug || property.id || `prop-${Math.random().toString(36).slice(2)}`}
                property={property}
                linkTo={`/properties/detail/${property.slug || property.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Properties;