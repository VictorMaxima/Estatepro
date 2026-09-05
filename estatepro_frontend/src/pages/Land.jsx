import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/common/PropertyCard';

function Land() {
  const { api, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    location: 'All Locations',
    minSize: '',
    maxSize: '',
    titleType: 'Any'
  });
  
  const [sortBy, setSortBy] = useState('newest');

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        // Using your axios instance from useAuth
        const response = await api.get('/properties');
        
        setProperties(response.data || []);
        setError('');
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

  // Get all land properties (case-insensitive filter)
  const landProperties = properties.filter(property => 
    property.property_type === 'land'
  );

  // Apply filters and sorting
  const getFilteredAndSortedProperties = () => {
    let filtered = [...landProperties];

    // Apply location filter
    if (filters.location !== 'All Locations') {
      filtered = filtered.filter(p => 
        p.location?.toLowerCase() === filters.location.toLowerCase()
      );
    }

    // Apply size filter
    if (filters.minSize) {
      filtered = filtered.filter(p => 
        (p.size || p.area || p.squareMeters || 0) >= parseInt(filters.minSize)
      );
    }
    if (filters.maxSize) {
      filtered = filtered.filter(p => 
        (p.size || p.area || p.squareMeters || 0) <= parseInt(filters.maxSize)
      );
    }

    // Apply title type filter
    if (filters.titleType !== 'Any') {
      filtered = filtered.filter(p => 
        p.titleType?.toLowerCase() === filters.titleType.toLowerCase() ||
        p.documentType?.toLowerCase() === filters.titleType.toLowerCase()
      );
    }

    // Apply sorting
    switch(sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'size-largest':
        filtered.sort((a, b) => (b.size || b.area || 0) - (a.size || a.area || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      minSize: '',
      maxSize: '',
      titleType: 'Any'
    });
    setSortBy('newest');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading land properties...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
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
          Buy Land in Nigeria
        </h1>
        <p className="text-xl text-text-muted text-center mb-12">
          Secure prime residential, commercial, and agricultural plots across the country
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
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>All Locations</option>
                    <option>Lagos</option>
                    <option>Abuja</option>
                    <option>Ibadan</option>
                    <option>Epe</option>
                    <option>Port Harcourt</option>
                    <option>Kano</option>
                    <option>Enugu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Size (sqm)</label>
                  <input 
                    type="number" 
                    name="minSize"
                    value={filters.minSize}
                    onChange={handleFilterChange}
                    placeholder="Min Size" 
                    className="w-full px-4 py-3 border border-border-light rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                  <input 
                    type="number" 
                    name="maxSize"
                    value={filters.maxSize}
                    onChange={handleFilterChange}
                    placeholder="Max Size" 
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Title Type</label>
                  <select 
                    name="titleType"
                    value={filters.titleType}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Any</option>
                    <option>C of O</option>
                    <option>Governor's Consent</option>
                    <option>Registered Survey</option>
                    <option>Deed of Assignment</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleResetFilters}
                    className="w-full btn-primary py-4"
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

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <p className="text-text-muted">
                {finalFilteredProperties.length} land plot{finalFilteredProperties.length !== 1 ? 's' : ''} available
              </p>
              <select 
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="size-largest">Size: Largest First</option>
              </select>
            </div>

            {finalFilteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {finalFilteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🌍</div>
                <p className="text-2xl text-text-muted mb-4">
                  No land listings found matching your criteria.
                </p>
                <p className="text-text-muted mb-6">
                  Try adjusting your filters or check back soon for new plots!
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="btn-primary inline-block"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Land;