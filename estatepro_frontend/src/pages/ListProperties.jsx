// src/pages/ListProperty.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '@/config/api';

function ListProperty() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    type: 'For Sale',
    size: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [],
  });

  const [photos, setPhotos] = useState([]); // Array of File objects
  const [photoPreviews, setPhotoPreviews] = useState([]); // Base64 previews

  const amenitiesOptions = [
    'Swimming Pool', 'Gym', '24/7 Security', 'Parking', 'Garden', 'Balcony',
    'Air Conditioning', 'Wi-Fi', 'Generator', 'Borehole', 'Furnished', 'Serviced',
  ];

  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!token) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-card p-12 max-w-md">
          <h1 className="text-4xl font-bold text-text-primary mb-6">
            Login Required
          </h1>
          <p className="text-xl text-text-muted mb-8">
            Please log in to list properties.
          </p>
          <Link to="/login" className="btn-primary py-4 px-8 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        amenities: checked
          ? [...formData.amenities, value]
          : formData.amenities.filter((a) => a !== value),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePhotoUpload = (e) => {
    const newFiles = Array.from(e.target.files);

    if (newFiles.length + photos.length > 20) {
      alert('Maximum 20 photos allowed');
      return;
    }

    setPhotos([...photos, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreviews((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (photos.length === 0) {
      setError('Please upload at least one photo');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Step 1: Create the property listing
      const propertyResponse = await fetch(`${API_URL}agent/properties/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price) || 0,
          location: formData.location.trim(),
          property_type: formData.type,
          size: parseFloat(formData.size) || 0,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          amenities: formData.amenities,
        }),
      });

      const propertyData = await propertyResponse.json();

      if (!propertyResponse.ok) {
        throw new Error(propertyData.detail || propertyData.message || 'Failed to create property');
      }

      const propertyId = propertyData.id; // Backend MUST return the new property ID

      // Step 2: Upload each photo using the correct endpoint
      for (const photo of photos) {
        const photoFormData = new FormData();
        photoFormData.append('image', photo); // Field name: 'image' — confirm with backend if different

        const imageResponse = await fetch(`${API_URL}api/property/${propertyId}/add_image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: photoFormData,
        });

        if (!imageResponse.ok) {
          const imgError = await imageResponse.json();
          throw new Error(imgError.detail || 'Failed to upload one or more photos');
        }
      }

      // All done!
      setSuccess(true);
      alert('Property listed and photos uploaded successfully!');
      navigate('/agent/properties'); // Or your agent's listing page

    } catch (err) {
      setError(err.message || 'An error occurred while listing the property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-text-primary text-center mb-8">
          List Your Property
        </h1>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    step >= num ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div
                    className={`w-32 h-1 ${step > num ? 'bg-primary' : 'bg-gray-300'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-8 py-12 rounded-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Property Listed Successfully!</h2>
            <p className="text-xl mb-8">
              Your property and all photos are now live.
            </p>
            <button
              onClick={() => navigate('/agent/properties')}
              className="btn-primary py-4 px-10"
            >
              View My Listings
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-8 md:p-12">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-8 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-text-primary mb-8">
                    Basic Information
                  </h2>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Property Title (e.g. Luxury 3-Bedroom Apartment)"
                    required
                    className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Full description of the property..."
                    rows="6"
                    required
                    className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Price (e.g. ₦500,000,000)"
                      required
                      className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Location (e.g. Ikoyi, Lagos)"
                      required
                      className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>For Sale</option>
                    <option>For Rent</option>
                    <option>For Lease</option>
                    <option>Shortlet</option>
                    <option>Land</option>
                  </select>

                  <div className="flex justify-end mt-8">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary py-4 px-10 text-lg"
                    >
                      Next: Details & Amenities
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Details & Amenities */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-text-primary mb-8">
                    Property Details
                  </h2>

                  <div className="grid md:grid-cols-3 gap-6">
                    <input
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      placeholder="Size (sqm)"
                      className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      min="0"
                      placeholder="Bedrooms"
                      className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      min="0"
                      placeholder="Bathrooms"
                      className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {amenitiesOptions.map((amenity) => (
                        <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value={amenity}
                            checked={formData.amenities.includes(amenity)}
                            onChange={handleChange}
                            className="w-5 h-5 text-primary rounded focus:ring-primary"
                          />
                          <span className="text-text-muted">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-8 py-4 border border-border-light rounded-lg hover:bg-bg-soft transition"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary py-4 px-10 text-lg"
                    >
                      Next: Photos & Review
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Photos & Final Review */}
              {step === 3 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-text-primary mb-8">
                    Photos & Final Review
                  </h2>

                  <div>
                    <label className="block text-xl font-semibold mb-4">
                      Upload Photos <span className="text-red-500">(Required - up to 20)</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full px-6 py-8 border-2 border-dashed border-border-light rounded-xl text-center cursor-pointer hover:border-primary transition bg-bg-soft"
                    />
                    <p className="text-center text-text-muted mt-3">
                      {photos.length} photo(s) selected
                    </p>
                  </div>

                  {photoPreviews.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-text-primary mb-6">
                        Photo Previews
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {photoPreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-48 object-cover rounded-xl shadow-md"
                            />
                            <span className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-sm">
                              {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-bg-soft rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-text-primary mb-6">
                      Final Review
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 text-lg">
                      <p><strong>Title:</strong> {formData.title || 'Not set'}</p>
                      <p><strong>Location:</strong> {formData.location || 'Not set'}</p>
                      <p><strong>Price:</strong> {formData.price || 'Not set'}</p>
                      <p><strong>Type:</strong> {formData.type}</p>
                      <p><strong>Bedrooms:</strong> {formData.bedrooms || 'N/A'}</p>
                      <p><strong>Bathrooms:</strong> {formData.bathrooms || 'N/A'}</p>
                      <p><strong>Size:</strong> {formData.size || 'N/A'}</p>
                      <p><strong>Amenities:</strong> {formData.amenities.join(', ') || 'None'}</p>
                      <p><strong>Photos Uploaded:</strong> {photos.length}</p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-10">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-8 py-4 border border-border-light rounded-lg hover:bg-bg-soft transition"
                    >
                      Previous
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`btn-primary py-4 px-10 text-xl font-bold ${
                        loading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Publishing...' : 'Publish Listing'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListProperty;