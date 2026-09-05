// src/pages/PropertyDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PropertyDetails() {
  const { id } = useParams();
  const { api, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images
  const getAllImages = () => {
    if (!property?.images || property.images.length === 0) {
      return [];
    }
    return property.images.map(img => img.image_url);
  };

  const images = getAllImages();

  // Navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        // Using axios instance from useAuth - no need for manual token
        const response = await api.get(`/properties/detail/${id}`);
        setProperty(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load property details');
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    } else {
      setError('No property id provided');
      setLoading(false);
    }
  }, [id, api]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-xl text-text-primary">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-card p-12 max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-5xl font-bold text-text-primary mb-4">Property Not Found</h1>
          <p className="text-xl text-text-muted mb-8">{error || 'Invalid property id'}</p>
          <Link to="/properties" className="text-primary text-lg hover:underline">
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Hero Image Carousel */}
      <div className="relative bg-gray-900">
        {images.length > 0 ? (
          <>
            <img 
              src={images[currentImageIndex]}
              alt={property.title}
              className="w-full h-[500px] object-contain"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/1200x800?text=Image+Not+Available';
              }}
            />
            
            {/* Left Arrow */}
            {images.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition duration-300 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {/* Right Arrow */}
            {images.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition duration-300 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm z-10">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
            
            {/* Thumbnail Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentImageIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 w-2 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        )}
        
        {/* Back Button - Positioned over the image */}
        <div className="absolute top-4 left-4 z-20">
          <Link
            to="/properties"
            className="inline-block bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-card p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
                <div>
                  <span className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold capitalize">
                    {property.property_type || 'Property'}
                  </span>
                  <h1 className="text-4xl font-bold text-text-primary mt-4">
                    {property.title}
                  </h1>
                  <p className="text-xl text-text-muted mt-2">{property.location}</p>
                </div>
                <p className="text-4xl font-bold text-primary whitespace-nowrap">
                  ₦{parseInt(property.price || 0).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 py-8 border-y border-border-light">
                <div className="text-center">
                  <p className="text-3xl font-bold text-text-primary">
                    {property.no_of_bedrooms || '-'}
                  </p>
                  <p className="text-text-muted">Bedrooms</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-text-primary">
                    {property.no_of_bathrooms || '-'}
                  </p>
                  <p className="text-text-muted">Bathrooms</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-text-primary">
                    {property.size || '-'}
                  </p>
                  <p className="text-text-muted">sqm</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Description</h2>
                <p className="text-text-muted leading-relaxed">
                  {property.description || 'No description available.'}
                </p>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries({
                    swimming_pool: property.swimming_pool,
                    parking: property.parking,
                    air_conditioning: property.air_conditioning,
                    borehole: property.borehole,
                    gym: property.gym,
                    garden: property.garden,
                    wifi: property.wifi,
                    furnished: property.furnished,
                    balcony: property.balcony,
                    generator: property.generator,
                    serviced: property.serviced,
                  }).map(([amenity, isAvailable]) => (
                    isAvailable ? (
                      <div key={amenity} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm">✓</div>
                        <span className="text-text-muted capitalize">
                          {amenity.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <div className="mt-12">
                <Link
                  to={`/checkout/${property.id}`}
                  className="block w-full bg-primary text-white text-center py-5 rounded-xl font-bold text-xl hover:bg-primary-dark transition"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-8 sticky top-24">
              <h3 className="text-2xl font-bold text-text-primary mb-6">Contact Agent</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl">
                  👤
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-xl">
                    {property.agent?.full_name || 'Agent Name'}
                  </p>
                  <p className="text-text-muted text-sm">
                    {property.agent?.email || 'agent@example.com'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-dark transition">
                  Schedule Viewing
                </button>

                <button className="w-full border-2 border-primary text-primary font-bold py-4 rounded-xl hover:bg-primary hover:text-white transition text-lg">
                  Send Message
                </button>

                <a
                  href={`tel:${property.agent?.phone_number || '+2348030000000'}`}
                  className="block w-full border border-border-light text-text-primary py-4 rounded-xl text-center hover:bg-bg-soft transition text-lg"
                >
                  Call: {property.agent?.phone_number || '+234 803 000 0000'}
                </a>

                <a
                  href={`mailto:${property.agent?.email || 'info@homemu.com'}`}
                  className="block w-full border border-border-light text-text-primary py-4 rounded-xl text-center hover:bg-bg-soft transition text-lg"
                >
                  Email Agent
                </a>
              </div>

              {/* Login prompt for unauthenticated users */}
              {!isAuthenticated && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 text-center">
                    🔐 <Link to="/login" className="font-semibold underline">Login</Link> to contact the agent directly
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;