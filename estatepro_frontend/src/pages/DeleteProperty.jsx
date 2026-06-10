// src/pages/DeleteProperty.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DeleteProperty() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { api, user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [property, setProperty] = useState(null);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch property details on load
  useEffect(() => {
    const fetchProperty = async () => {
      // Check authentication
      if (!isAuthenticated) {
        setError('Please login to manage properties');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Using your axios instance with withCredentials
        const response = await api.get(`/properties/detail/${propertyId}`);
        
        setProperty(response.data);
      } catch (err) {
        console.error('Error fetching property:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response?.status === 403) {
          setError('You do not have permission to delete this property');
        } else if (err.response?.status === 404) {
          setError('Property not found');
        } else {
          setError(err.response?.data?.message || 'Could not load property details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, api, isAuthenticated, navigate]);

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
    setConfirmText('');
    setError('');
  };

  const handleConfirmDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      // Using axios delete with automatic cookie sending
      await api.delete(`/property/${propertyId}/delete`);
      
      setShowConfirmModal(false);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      successMessage.textContent = 'Property deleted successfully!';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);

      // Redirect to properties list
      setTimeout(() => {
        navigate('/agent/properties');
      }, 1500);
      
    } catch (err) {
      console.error('Error deleting property:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('You do not have permission to delete this property');
      } else if (err.response?.status === 404) {
        setError('Property not found or already deleted');
      } else {
        setError(err.response?.data?.message || 'An error occurred while deleting the property');
      }
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate('/agent/properties');
  };

  // Authentication check
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-card p-12 max-w-md">
          <h1 className="text-4xl font-bold text-text-primary mb-6">
            Authentication Required
          </h1>
          <p className="text-xl text-text-muted mb-8">
            Please log in to manage properties.
          </p>
          <Link to="/login" className="btn-primary py-4 px-8 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-bg-soft py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Property</h2>
            <p className="mb-6">{error}</p>
            <Link
              to="/agent/properties"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
            >
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/agent/properties"
            className="text-primary hover:text-primary-dark mb-4 inline-flex items-center gap-2 transition"
          >
            ← Back to Properties
          </Link>
          <h1 className="text-4xl font-bold text-text-primary mt-4">
            Delete Property
          </h1>
          <p className="text-text-muted text-lg mt-2">
            This action cannot be undone. Please review the property details below.
          </p>
        </div>

        {/* Warning Card */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚠️</div>
            <div>
              <h2 className="text-xl font-bold text-red-800 mb-2">
                Warning: Permanent Deletion
              </h2>
              <p className="text-red-700">
                Deleting this property will permanently remove all associated data including:
              </p>
              <ul className="list-disc list-inside mt-2 text-red-700 space-y-1">
                <li>Property details and descriptions</li>
                <li>All uploaded photos and images</li>
                <li>Amenities and specifications</li>
                <li>Any inquiries or saved searches referencing this property</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Property Details Card */}
        {property && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-8">
            <div className="p-6 border-b border-border-light">
              <h2 className="text-2xl font-bold text-text-primary">
                Property to Delete
              </h2>
            </div>

            <div className="p-6">
              {/* Main Property Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {property.photos && property.photos.length > 0 && (
                  <div className="md:col-span-2 mb-4">
                    <img
                      src={property.photos[0].image_url || property.photos[0]}
                      alt={property.title}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Title
                  </h3>
                  <p className="text-text-muted">{property.title}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Location
                  </h3>
                  <p className="text-text-muted">{property.location}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Price
                  </h3>
                  <p className="text-text-muted">
                    ₦{parseInt(property.price).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Property Type
                  </h3>
                  <p className="text-text-muted">
                    {property.property_type?.toUpperCase() || 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Bedrooms
                  </h3>
                  <p className="text-text-muted">{property.no_of_bedrooms || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Bathrooms
                  </h3>
                  <p className="text-text-muted">{property.no_of_bathrooms || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Size
                  </h3>
                  <p className="text-text-muted">
                    {property.size ? `${property.size} sqm` : 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Status
                  </h3>
                  <p className="text-text-muted">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      property.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {property.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Description
                  </h3>
                  <p className="text-text-muted whitespace-pre-wrap">{property.description}</p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities && Object.keys(property.amenities).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(property.amenities)
                      .filter(([_, value]) => value === true)
                      .map(([key]) => (
                        <span
                          key={key}
                          className="px-3 py-1 bg-bg-soft rounded-full text-sm text-text-muted capitalize"
                        >
                          {key.replace(/_/g, ' ')}
                        </span>
                      ))}
                    {Object.entries(property.amenities).filter(([_, value]) => value === true).length === 0 && (
                      <span className="text-text-muted">No amenities listed</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleCancel}
            className="px-8 py-3 border-2 border-border-light rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold shadow-md"
          >
            Delete Property
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border-light">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚠️</div>
                <h2 className="text-2xl font-bold text-text-primary">
                  Confirm Deletion
                </h2>
              </div>
            </div>

            <div className="p-6">
              <p className="text-text-primary mb-4">
                Are you sure you want to delete <strong className="text-red-600">{property?.title}</strong>?
              </p>
              <p className="text-red-600 text-sm mb-6">
                This action cannot be undone. All data associated with this property will be permanently removed.
              </p>

              <div className="mb-6">
                <label className="block text-text-primary font-semibold mb-2">
                  Type <span className="text-red-500 font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setError('');
                    setConfirmText('');
                  }}
                  className="flex-1 px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className={`flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold ${
                    deleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </span>
                  ) : (
                    'Permanently Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default DeleteProperty;