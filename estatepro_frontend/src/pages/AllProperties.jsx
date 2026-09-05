// src/pages/Properties.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/common/PropertyCard';

function Properties() {
  const { api } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all properties once
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await api.get('/properties');
        
        setProperties(response.data);
        setFilteredProperties(response.data); // initial full list
        setError('');
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.detail || err.response?.data?.message || 'Could not load properties. Please try again.');
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [api]);

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
      prop.property_type?.toLowerCase().includes(term) ||
      prop.type?.toLowerCase().includes(term) ||
      prop.category?.toLowerCase().includes(term)
    );

    setFilteredProperties(filtered);
  }, [searchTerm, properties]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

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
          <div className="text-6xl mb-4">⚠️</div>
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
        <h1 className="text-5xl font-bold text-text-primary text-center mb-4">
          All Properties
        </h1>
        <p className="text-xl text-text-muted text-center mb-12">
          Discover your perfect property from our extensive collection
        </p>

        {/* Search Input */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, location, or type..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-6 py-5 pr-24 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Search stats */}
          {searchTerm && (
            <p className="text-text-muted mt-3 text-center">
              Found {filteredProperties.length} result{filteredProperties.length !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
          )}
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-2xl text-text-muted mb-4">
              {searchTerm.trim() 
                ? `No properties match "${searchTerm}"` 
                : 'No properties found'}
            </p>
            {searchTerm.trim() && (
              <button 
                onClick={handleClearSearch}
                className="btn-primary inline-block"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count and optional filter info */}
            <div className="mb-8 flex justify-between items-center">
              <p className="text-text-muted">
                Showing {filteredProperties.length} property{filteredProperties.length !== 1 ? 's' : ''}
              </p>
              {searchTerm && (
                <button 
                  onClick={handleClearSearch}
                  className="text-primary hover:text-primary-dark transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.slug || property.id || `prop-${Math.random().toString(36).slice(2)}`}
                  property={property}
                  linkTo={`/properties/detail/${property.slug || property.id}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Properties;