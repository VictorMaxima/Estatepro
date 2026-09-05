import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/common/PropertyCard';

function Shortlets() {
  const { api, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1'
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

  // Get all shortlet properties
  const shortletProperties = properties.filter(p => 
    p.type === 'Shortlet' || 
    p.property_type?.toLowerCase() === 'shortlet'
  );

  // Apply filters and sorting
  const getFilteredAndSortedProperties = () => {
    let filtered = [...shortletProperties];

    // Apply guests filter (assuming property has a 'maxGuests' field)
    if (filters.guests && filters.guests !== '1') {
      const guestCount = parseInt(filters.guests);
      filtered = filtered.filter(p => 
        (p.maxGuests || p.capacity || 2) >= guestCount
      );
    }

    // Apply date range filter (if properties have availability data)
    if (filters.checkIn && filters.checkOut) {
      filtered = filtered.filter(p => {
        // This assumes property has an 'isAvailable' or booking check function
        // You would typically call a separate API endpoint for date checking
        return p.isAvailable !== false;
      });
    }

    // Apply sorting
    switch(sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
      checkIn: '',
      checkOut: '',
      guests: '1'
    });
    setSortBy('newest');
  };

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (filters.checkIn && filters.checkOut) {
      try {
        setLoading(true);
        // Optional: Fetch properties filtered by date from backend
        const response = await api.get('/properties/shortlets/available', {
          params: {
            checkIn: filters.checkIn,
            checkOut: filters.checkOut,
            guests: filters.guests
          }
        });
        
        if (response.data) {
          setProperties(response.data);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err.response?.data?.message || 'Could not search properties. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading shortlet properties...</p>
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
          Shortlet Bookings
        </h1>
        <p className="text-xl text-text-muted text-center mb-12">
          Luxury short stay apartments and villas — perfect for vacations and business trips
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
              <h3 className="text-xl font-bold text-text-primary mb-6">Search Availability</h3>
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Check-in / Check-out</label>
                  <input 
                    type="date" 
                    name="checkIn"
                    value={filters.checkIn}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-border-light rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                    required
                  />
                  <input 
                    type="date" 
                    name="checkOut"
                    value={filters.checkOut}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Guests</label>
                  <select 
                    name="guests"
                    value={filters.guests}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5+ Guests</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <button 
                    type="submit"
                    className="w-full btn-primary"
                  >
                    Search Shortlets
                  </button>
                  <button 
                    type="button"
                    onClick={handleResetFilters}
                    className="w-full px-4 py-3 border border-border-light rounded-lg text-text-primary hover:bg-gray-50 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <p className="text-text-muted">
                {finalFilteredProperties.length} shortlet{finalFilteredProperties.length !== 1 ? 's' : ''} available
              </p>
              <select 
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Rating: Highest First</option>
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
                <div className="text-6xl mb-4">🏨</div>
                <p className="text-2xl text-text-muted mb-4">
                  No shortlet properties found matching your criteria.
                </p>
                <p className="text-text-muted mb-6">
                  Try adjusting your search dates or guest count.
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

export default Shortlets;