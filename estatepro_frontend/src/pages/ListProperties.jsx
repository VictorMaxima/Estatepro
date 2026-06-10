// src/pages/ListProperty.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '@/config/api';
import { useAuth } from '../context/AuthContext';

function ListProperty() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { api, user, logout } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    property_type: 'sale',
    size: '',
    no_of_bedrooms: '',
    no_of_bathrooms: '',
    swimming_pool: false,
    parking: false,
    air_conditioning: false,
    borehole: false,
    gym: false,
    garden: false,
    wifi: false,
    furnished: false,
    balcony: false,
    generator: false,
    serviced: false,
  });

  const [photos, setPhotos] = useState([]); 
  const [photoPreviews, setPhotoPreviews] = useState([]); 

  const propertyTypes = [
    { value: 'sale', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' },
    { value: 'lease', label: 'For Lease' },
    { value: 'shortLet', label: 'Shortlet' },
    { value: 'land', label: 'Land' },
  ];

  const navigate = useNavigate();

  

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
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

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation (keep all your existing validation)
    if (photos.length === 0) {
      setError('Please upload at least one photo');
      return;
    }

    if (!formData.title || formData.title.length > 33) {
      setError('Title is required and must be less than 33 characters');
      return;
    }

    if (!formData.description) {
      setError('Description is required');
      return;
    }

    if (!formData.location || formData.location.length > 50) {
      setError('Location is required and must be less than 50 characters');
      return;
    }

    const price = parseInt(formData.price);
    if (isNaN(price) || price < 100 || price > 1000000000) {
      setError('Price must be between ₦100 and ₦1,000,000,000');
      return;
    }

    const size = parseInt(formData.size);
    if (isNaN(size) || size < 100 || size > 1000000000) {
      setError('Size must be between 100 and 1,000,000,000 sqm');
      return;
    }

    const bedrooms = parseInt(formData.no_of_bedrooms);
    if (isNaN(bedrooms) || bedrooms < 1 || bedrooms > 1000) {
      setError('Number of bedrooms must be between 1 and 1000');
      return;
    }

    const bathrooms = parseInt(formData.no_of_bathrooms);
    if (isNaN(bathrooms) || bathrooms < 1 || bathrooms > 1000) {
      setError('Number of bathrooms must be between 1 and 1000');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        price: Number(formData.price),
        property_type: formData.property_type,
        size: Number(formData.size),
        no_of_bedrooms: Number(formData.no_of_bedrooms),
        no_of_bathrooms: Number(formData.no_of_bathrooms),
        swimming_pool: Boolean(formData.swimming_pool),
        parking: Boolean(formData.parking),
        air_conditioning: Boolean(formData.air_conditioning),
        borehole: Boolean(formData.borehole),
        gym: Boolean(formData.gym),
        garden: Boolean(formData.garden),
        wifi: Boolean(formData.wifi),
        furnished: Boolean(formData.furnished),
        balcony: Boolean(formData.balcony),
        generator: Boolean(formData.generator),
        serviced: Boolean(formData.serviced),
      };

      console.log('Submitting property data:', propertyData);

      // FIX 1: Use api.post() correctly - with HttpOnly cookies, we DON'T manually add Authorization header
      // The browser automatically sends the HttpOnly cookie with the request
      const propertyResponse = await api.post('agent/properties/add', propertyData);

      // FIX 2: api.post() should already return the parsed JSON response
      const propertyResponseData = propertyResponse.data;
      console.log(propertyResponseData)

      if (!propertyResponseData || propertyResponseData.error) {
        throw new Error(propertyResponseData?.message || 'Failed to create property');
      }

      const propertyId = propertyResponseData.property_id;

      // Upload photos one by one using fetch with credentials: 'include'
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const photoFormData = new FormData();
        photoFormData.append('image', photo);

        console.log(`Uploading photo ${i + 1}/${photos.length}`);

        // FIX 3: When using fetch directly, include credentials to send HttpOnly cookie
        const imageResponse = await fetch(`${API_URL}property/${propertyId}/add_image`, {
          method: 'POST',
          credentials: 'include', // CRITICAL: This sends the HttpOnly cookie
          body: photoFormData,
          // NO Authorization header needed!
        });

        if (!imageResponse.ok) {
          const imgError = await imageResponse.json().catch(() => ({}));
          throw new Error(`Failed to upload photo ${i + 1}: ${imgError.detail || 'Unknown error'}`);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/agent/properties');
      }, 2000);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while listing the property');
    } finally {
      setLoading(false);
    }
  };

  const getPropertyTypeLabel = (value) => {
    const type = propertyTypes.find(t => t.value === value);
    return type ? type.label : value;
  };

  return (
    // ... rest of your JSX remains exactly the same ...
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
              Your property and all photos are now live. Redirecting...
            </p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-700 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-8 md:p-12">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-8">
                <p className="font-semibold mb-2">Error:</p>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-text-primary mb-8">
                    Basic Information
                  </h2>

                  <div>
                    <label className="block text-lg font-semibold text-text-primary mb-2">
                      Property Title <span className="text-red-500">*</span>
                      <span className="text-sm text-text-muted ml-2">(Max 33 characters)</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Luxury 3-Bedroom Apartment"
                      maxLength="33"
                      required
                      className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-right text-sm text-text-muted mt-1">
                      {formData.title.length}/33
                    </p>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-text-primary mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Full description of the property..."
                      rows="6"
                      required
                      className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-semibold text-text-primary mb-2">
                        Price (₦) <span className="text-red-500">*</span>
                        <span className="text-sm text-text-muted ml-2">(Min: ₦100, Max: ₦1B)</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="e.g. 50000000"
                        min="100"
                        max="1000000000"
                        required
                        className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-lg font-semibold text-text-primary mb-2">
                        Location <span className="text-red-500">*</span>
                        <span className="text-sm text-text-muted ml-2">(Max 50 characters)</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Ikoyi, Lagos"
                        maxLength="50"
                        required
                        className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-right text-sm text-text-muted mt-1">
                        {formData.location.length}/50
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-text-primary mb-2">
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

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
                    <div>
                      <label className="block text-lg font-semibold text-text-primary mb-2">
                        Size (sqm) <span className="text-red-500">*</span>
                        <span className="text-sm text-text-muted ml-2">(Min: 100)</span>
                      </label>
                      <input
                        type="number"
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                        placeholder="e.g. 250"
                        min="100"
                        max="1000000000"
                        required
                        className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-lg font-semibold text-text-primary mb-2">
                        Bedrooms <span className="text-red-500">*</span>
                        <span className="text-sm text-text-muted ml-2">(Min: 1)</span>
                      </label>
                      <input
                        type="number"
                        name="no_of_bedrooms"
                        value={formData.no_of_bedrooms}
                        onChange={handleChange}
                        placeholder="e.g. 3"
                        min="1"
                        max="1000"
                        required
                        className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-lg font-semibold text-text-primary mb-2">
                        Bathrooms <span className="text-red-500">*</span>
                        <span className="text-sm text-text-muted ml-2">(Min: 1)</span>
                      </label>
                      <input
                        type="number"
                        name="no_of_bathrooms"
                        value={formData.no_of_bathrooms}
                        onChange={handleChange}
                        placeholder="e.g. 2"
                        min="1"
                        max="1000"
                        required
                        className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-text-primary mb-6">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-bg-soft rounded-lg transition">
                        <input
                          type="checkbox"
                          name="swimming_pool"
                          checked={formData.swimming_pool}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-text-muted">🏊 Swimming Pool</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-bg-soft rounded-lg transition">
                        <input
                          type="checkbox"
                          name="parking"
                          checked={formData.parking}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-text-muted">🅿️ Parking</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-bg-soft rounded-lg transition">
                        <input
                          type="checkbox"
                          name="air_conditioning"
                          checked={formData.air_conditioning}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-text-muted">❄️ Air Conditioning</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-bg-soft rounded-lg transition">
                        <input
                          type="checkbox"
                          name="borehole"
                          checked={formData.borehole}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-text-muted">💧 Borehole</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-bg-soft rounded-lg transition">
                        <input
                          type="checkbox"
                          name="gym"
                          checked={formData.gym}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-text-muted">💪 Gym</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-bg-soft rounded-lg transition">
                        <input
                          type="checkbox"
                          name="garden"
                          checked={formData.garden}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-text-muted">🌳 Garden</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-bg-soft rounded-lg transition">
                        <input
                          type="checkbox"
                          name="wifi"
                          checked={formData.wifi}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-text-muted">📡 Wi-Fi</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-bg-soft rounded-lg transition">
                        <input
                          type="checkbox"
                          name="furnished"
                          checked={formData.furnished}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-text-muted">🛋️ Furnished</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-bg-soft rounded-lg transition">
                        <input
                          type="checkbox"
                          name="balcony"
                          checked={formData.balcony}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-text-muted">🏞️ Balcony</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-bg-soft rounded-lg transition">
                        <input
                          type="checkbox"
                          name="generator"
                          checked={formData.generator}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-text-muted">⚡ Generator</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-bg-soft rounded-lg transition">
                        <input
                          type="checkbox"
                          name="serviced"
                          checked={formData.serviced}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-text-muted">🛎️ Serviced</span>
                      </label>
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
                      Upload Photos <span className="text-red-500">*</span>
                      <span className="text-sm text-text-muted ml-2">(Up to 20 photos)</span>
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
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-48 object-cover rounded-xl shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                              ×
                            </button>
                            <span className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-sm">
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
                    <div className="grid md:grid-cols-2 gap-4 text-lg">
                      <p><strong>Title:</strong> {formData.title || 'Not set'}</p>
                      <p><strong>Location:</strong> {formData.location || 'Not set'}</p>
                      <p><strong>Price:</strong> ₦{parseInt(formData.price).toLocaleString() || 'Not set'}</p>
                      <p><strong>Type:</strong> {getPropertyTypeLabel(formData.property_type)}</p>
                      <p><strong>Bedrooms:</strong> {formData.no_of_bedrooms || 'N/A'}</p>
                      <p><strong>Bathrooms:</strong> {formData.no_of_bathrooms || 'N/A'}</p>
                      <p><strong>Size:</strong> {formData.size || 'N/A'} sqm</p>
                      <p><strong>Photos:</strong> {photos.length} photo(s)</p>
                      <p className="md:col-span-2">
                        <strong>Amenities:</strong>{' '}
                        {Object.entries(formData)
                          .filter(([key, value]) => 
                            ['swimming_pool', 'parking', 'air_conditioning', 'borehole', 
                             'gym', 'garden', 'wifi', 'furnished', 'balcony', 'generator', 
                             'serviced'].includes(key) && value === true
                          )
                          .map(([key]) => key.replace(/_/g, ' '))
                          .join(', ') || 'None'}
                      </p>
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