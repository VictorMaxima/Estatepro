import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/common/PropertyCard';

function Rent() {
  const { api } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    location: 'All Locations',
    furnished: 'Any',
    minPrice: '',
    maxPrice: ''
  });
  
  // Sort state
  const [sortBy, setSortBy] = useState('newest');

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await api.get('/properties');
        setProperties(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Could not load properties. Please try again.');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [api]);

  // Filter properties for rent
  const rentProperties = properties.filter(p => p.property_type === 'rent');

  // Apply filters and sorting
  const getFilteredAndSortedProperties = () => {
    let filtered = [...rentProperties];

    // Apply location filter
    if (filters.location !== 'All Locations') {
      filtered = filtered.filter(p => 
        p.location?.toLowerCase() === filters.location.toLowerCase()
      );
    }

    // Apply furnished filter
    if (filters.furnished !== 'Any') {
      const isFurnished = filters.furnished === 'Furnished';
      filtered = filtered.filter(p => p.furnished === isFurnished);
    }

    // Apply price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseInt(filters.maxPrice));
    }

    // Apply sorting
    switch(sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
        break;
    }

    return filtered;
  };

  const finalFilteredProperties = getFilteredAndSortedProperties();

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      location: 'All Locations',
      furnished: 'Any',
      minPrice: '',
      maxPrice: ''
    });
    setSortBy('newest');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading properties...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-card p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-text-primary text-center mb-4">
          Rent Properties in Nigeria
        </h1>
        <p className="text-xl text-text-muted text-center mb-12">
          Comfortable apartments and houses available for rent — short or long term
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
              <h3 className="text-xl font-bold text-text-primary mb-6">Filters</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                  <select 
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option>All Locations</option>
                    <option>Lagos</option>
                    <option>Abuja</option>
                    <option>Port Harcourt</option>
                    <option>Ibadan</option>
                    <option>Kano</option>
                    <option>Enugu</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Furnished</label>
                  <select 
                    name="furnished"
                    value={filters.furnished}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option>Any</option>
                    <option>Furnished</option>
                    <option>Unfurnished</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Price Range (per year)</label>
                  <input 
                    type="number" 
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min Price" 
                    className="w-full px-4 py-3 border border-border-light rounded-lg mb-2 focus:ring-2 focus:ring-primary focus:outline-none" 
                  />
                  <input 
                    type="number" 
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max Price" 
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" 
                  />
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleResetFilters}
                    className="w-full btn-primary"
                  >
                    Apply Filters
                  </button>
                  <button 
                    onClick={handleResetFilters}
                    className="w-full px-4 py-3 border border-border-light rounded-lg text-text-primary hover:bg-gray-50 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <p className="text-text-muted">
                {finalFilteredProperties.length} rental propert{finalFilteredProperties.length !== 1 ? 'ies' : 'y'} found
              </p>
              <select 
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {finalFilteredProperties.length > 0 ? (
                finalFilteredProperties.map((property) => (
                  <PropertyCard key={property.id || property.slug} property={property} />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <div className="text-6xl mb-4">🏠</div>
                  <p className="text-text-muted text-lg mb-4">No rental properties found matching your criteria.</p>
                  <button 
                    onClick={handleResetFilters}
                    className="btn-primary inline-block"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rent;