// src/pages/EventHalls.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EVENT_TYPES = ['Wedding', 'Conference', 'Party', 'Corporate'];

function EventHalls() {
  const [hallListings, setHallListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    date: '',
    eventType: '',
  });
  const { api } = useAuth();

  useEffect(() => {
    const fetchHalls = async () => {
      setLoading(true);
      setError('');

      try {
        // Adjust the endpoint/params to match your backend
        const response = await api.get('/event-halls/', {
          params: {
            location: filters.location || undefined,
            date: filters.date || undefined,
            event_type: filters.eventType || undefined,
          },
        });
        setHallListings(Array.isArray(response.data) ? response.data : response.data.results || []);
      } catch (err) {
        console.error('Failed to load event halls:', err);
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            'Could not load event halls'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, [api, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511578314322-1a428e4b67e6?w=1600&q=80"
          alt="Event Hall"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary bg-opacity-60" />
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              Event Halls Booking
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Book the perfect venue for weddings, conferences, parties, and corporate events
            </p>
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="px-4 py-3 border rounded-lg"
                  />
                  <input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="px-4 py-3 border rounded-lg"
                  />
                  <select
                    name="eventType"
                    value={filters.eventType}
                    onChange={handleFilterChange}
                    className="px-4 py-3 border rounded-lg"
                  >
                    <option value="">Event Type</option>
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <button className="btn-primary">Find Venues</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Hall Listings */}
      <section className="py-20 bg-bg-soft">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-text-primary mb-12">
            Featured Event Halls
          </h2>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
              <p className="text-text-muted">Loading venues...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-card max-w-md mx-auto p-8">
              <h3 className="text-2xl font-bold text-red-600 mb-4">Error</h3>
              <p className="text-text-muted mb-6">{error}</p>
              <button
                onClick={() => setFilters({ ...filters })}
                className="btn-primary py-3 px-6"
              >
                Try Again
              </button>
            </div>
          ) : hallListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-card max-w-md mx-auto p-8">
              <h3 className="text-2xl font-bold text-text-primary mb-4">No Venues Found</h3>
              <p className="text-text-muted">
                No event halls match your search. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hallListings.map((hall) => (
                <div
                  key={hall.id}
                  className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-card-hover transition"
                >
                  <img src={hall.image} alt={hall.name} className="w-full h-64 object-cover" />
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-text-primary mb-2">{hall.name}</h3>
                    <p className="text-text-muted mb-4">{hall.location}</p>
                    <p className="text-lg text-text-primary mb-2">Capacity: {hall.capacity}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">{hall.price}</span>
                      <button className="btn-primary">Book Venue</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-text-primary mb-12">
            Popular Cities for Events
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Enugu', 'Calabar', 'Benin City', 'Kano'].map((city) => (
              <div key={city} className="group cursor-pointer">
                <div className="bg-white rounded-xl shadow-card overflow-hidden group-hover:shadow-card-hover transition">
                  <div className="h-48 bg-linear-to-br from-primary to-primary-dark flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">{city}</span>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-text-primary font-semibold group-hover:text-primary transition">
                      Venues in {city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Planning an Event?
          </h2>
          <p className="text-xl mb-10">
            Let us help you find the perfect venue
          </p>
          <Link
            to="/"
            className="inline-block bg-white text-primary font-bold px-10 py-4 rounded-full hover:bg-gray-100 transition"
          >
            Start Your Search
          </Link>
        </div>
      </section>
    </div>
  );
}

export default EventHalls;
