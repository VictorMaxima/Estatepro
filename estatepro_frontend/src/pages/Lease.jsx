import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/common/PropertyCard';

function Lease() {
  const { api } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    location: 'All Locations',
    minSize: '',
    maxSize: ''
  });
  
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

  // Get all lease properties (property_type === 'lease')
  const leaseProperties = properties.filter(p => p.property_type === 'lease');

  // Apply filters and sorting
  const getFilteredAndSortedProperties = () => {
    let filtered = [...leaseProperties];

    // Apply location filter
    if (filters.location !== 'All Locations') {
      filtered = filtered.filter(p => 
        p.location?.toLowerCase() === filters.location.toLowerCase()
      );
    }

    // Apply space size filter
    if (filters.minSize) {
      filtered = filtered.filter(p => 
        (p.size || p.squareFeet || p.area || 0) >= parseInt(filters.minSize)
      );
    }
    if (filters.maxSize) {
      filtered = filtered.filter(p => 
        (p.size || p.squareFeet || p.area || 0) <= parseInt(filters.maxSize)
      );
    }

    // Apply sorting
    switch(sortBy) {
      case 'size-low-high':
        filtered.sort((a, b) => (a.size || a.squareFeet || a.area || 0) - (b.size || b.squareFeet || b.area || 0));
        break;
      case 'size-high-low':
        filtered.sort((a, b) => (b.size || b.squareFeet || b.area || 0) - (a.size || a.squareFeet || a.area || 0));
        break;
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

  const filteredProperties = getFilteredAndSortedProperties();

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle apply filters button
  const handleApplyFilters = () => {
    // Triggers re-render with updated filters
    setFilters({ ...filters });
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
      maxSize: ''
    });
    setSortBy('newest');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading commercial properties...</p>
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
          Lease Commercial Properties
        </h1>
        <p className="text-xl text-text-muted text-center mb-12">
          Premium office spaces, shops, and warehouses for lease
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
                    <option>Victoria Island</option>
                    <option>Ikeja</option>
                    <option>Abuja CBD</option>
                    <option>Lekki</option>
                    <option>Ikoyi</option>
                    <option>Port Harcourt</option>
                    <option>Ibadan</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Space Size (sq ft)</label>
                  <input 
                    type="number" 
                    name="minSize"
                    value={filters.minSize}
                    onChange={handleFilterChange}
                    placeholder="Min Size" 
                    className="w-full px-4 py-3 border border-border-light rounded-lg mb-2 focus:ring-2 focus:ring-primary focus:outline-none" 
                  />
                  <input 
                    type="number" 
                    name="maxSize"
                    value={filters.maxSize}
                    onChange={handleFilterChange}
                    placeholder="Max Size" 
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" 
                  />
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleApplyFilters}
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

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <p className="text-text-muted">
                {filteredProperties.length} commercial space{filteredProperties.length !== 1 ? 's' : ''} found
              </p>
              <select 
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="size-low-high">Size: Small to Large</option>
                <option value="size-high-low">Size: Large to Small</option>
              </select>
            </div>

            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id || property.slug} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏢</div>
                <p className="text-text-muted text-lg mb-4">No commercial properties found matching your criteria.</p>
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
  );
}

export default Lease;