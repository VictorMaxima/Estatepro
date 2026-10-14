// src/pages/BecomeAgent.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function BecomeAgent() {
  const { api, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    ninNumber: '',
    yearsExperience: '',
  });
  const [files, setFiles] = useState({
    idProof: null,
    certificate: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Validation function with field-specific errors
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{11}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 11 digits';
    }

    if (!formData.ninNumber) {
      newErrors.ninNumber = 'NIN number is required';
    } else if (!/^\d{11}$/.test(formData.ninNumber)) {
      newErrors.ninNumber = 'NIN must be exactly 11 digits';
    }

    if (!formData.yearsExperience) {
      newErrors.yearsExperience = 'Years of experience is required';
    } else if (parseInt(formData.yearsExperience, 10) < 0) {
      newErrors.yearsExperience = 'Experience cannot be negative';
    } else if (parseInt(formData.yearsExperience, 10) > 60) {
      newErrors.yearsExperience = 'Please enter a realistic number of years';
    }

    if (!files.idProof) {
      newErrors.idProof = 'ID proof upload is required';
    } else if (files.idProof.size > MAX_FILE_SIZE) {
      newErrors.idProof = 'ID proof must be smaller than 5MB';
    }

    // Certificate/license is OPTIONAL — only validate size if provided
    if (files.certificate && files.certificate.size > MAX_FILE_SIZE) {
      newErrors.certificate = 'Certificate must be smaller than 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    const file = uploadedFiles[0] || null;
    // Use functional update to avoid stale state / shadowing issues
    setFiles((prev) => ({ ...prev, [name]: file }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setServerError('');
    setSuccess(false);

    try {
      const payload = new FormData();
      payload.append('full_name', formData.fullName);
      payload.append('phone_number', formData.phone);
      payload.append('nin_number', formData.ninNumber);
      payload.append('years_of_experience', formData.yearsExperience);
      if (files.idProof) payload.append('id_file', files.idProof);
      if (files.certificate) payload.append('license_file', files.certificate);

      await api.post('/agent_apply', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Show success screen; user decides when to leave
      setSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
      setServerError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'An error occurred while submitting your application'
      );
    } finally {
      setLoading(false);
    }
  };

  // Auth gate — rendered before the form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-card p-12 max-w-md">
          <div className="text-6xl mb-4" aria-hidden="true">🔐</div>
          <h1 className="text-4xl font-bold text-text-primary mb-6">
            Login Required
          </h1>
          <p className="text-xl text-text-muted mb-8">
            Please log in to apply as an agent.
          </p>
          <Link to="/login" className="btn-primary py-4 px-8 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-6">
          Become a Verified Agent
        </h1>
        <p className="text-lg md:text-xl text-text-muted text-center mb-12">
          Join our professional agent network — only verified agents can list properties
        </p>

        <div className="bg-white rounded-2xl shadow-card p-6 md:p-12">
          {success ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4" aria-hidden="true">✅</div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                Application Submitted!
              </h2>
              <p className="text-xl text-text-muted mb-8">
                Thank you! Our admin team will review your application shortly.
              </p>
              <button
                onClick={() => navigate('/')}
                className="btn-primary py-4 px-10"
              >
                Back to Home
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              noValidate
            >
              {serverError && (
                <div
                  role="alert"
                  className="md:col-span-2 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl text-center"
                >
                  {serverError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-lg font-semibold text-text-primary mb-2"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  className={`w-full px-6 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.fullName ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-red-500 text-sm mt-1">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-lg font-semibold text-text-primary mb-2"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 08012345678"
                  inputMode="numeric"
                  maxLength={11}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  className={`w-full px-6 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.phone ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-red-500 text-sm mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* NIN */}
              <div>
                <label
                  htmlFor="ninNumber"
                  className="block text-lg font-semibold text-text-primary mb-2"
                >
                  NIN Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="ninNumber"
                  type="text"
                  name="ninNumber"
                  value={formData.ninNumber}
                  onChange={handleChange}
                  placeholder="Your 11-digit NIN"
                  inputMode="numeric"
                  maxLength={11}
                  aria-invalid={!!errors.ninNumber}
                  aria-describedby={errors.ninNumber ? 'ninNumber-error' : undefined}
                  className={`w-full px-6 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.ninNumber ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                {errors.ninNumber && (
                  <p id="ninNumber-error" className="text-red-500 text-sm mt-1">
                    {errors.ninNumber}
                  </p>
                )}
              </div>

              {/* Years Experience */}
              <div>
                <label
                  htmlFor="yearsExperience"
                  className="block text-lg font-semibold text-text-primary mb-2"
                >
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  id="yearsExperience"
                  type="number"
                  name="yearsExperience"
                  value={formData.yearsExperience}
                  onChange={handleChange}
                  min="0"
                  max="60"
                  placeholder="e.g. 5"
                  aria-invalid={!!errors.yearsExperience}
                  aria-describedby={
                    errors.yearsExperience ? 'yearsExperience-error' : undefined
                  }
                  className={`w-full px-6 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.yearsExperience ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                {errors.yearsExperience && (
                  <p id="yearsExperience-error" className="text-red-500 text-sm mt-1">
                    {errors.yearsExperience}
                  </p>
                )}
              </div>

              {/* ID Proof (required) */}
              <div className="md:col-span-2">
                <label
                  htmlFor="idProof"
                  className="block text-lg font-semibold text-text-primary mb-2"
                >
                  Upload ID Proof (NIN Slip or Government ID){' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="idProof"
                  type="file"
                  name="idProof"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  aria-invalid={!!errors.idProof}
                  aria-describedby={errors.idProof ? 'idProof-error' : undefined}
                  className={`w-full px-6 py-4 border rounded-lg file:btn-primary file:text-white file:px-6 file:py-3 file:rounded file:mr-4 file:border-0 cursor-pointer ${
                    errors.idProof ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                {files.idProof && (
                  <p className="text-sm text-green-600 mt-2">✓ {files.idProof.name}</p>
                )}
                {errors.idProof && (
                  <p id="idProof-error" className="text-red-500 text-sm mt-1">
                    {errors.idProof}
                  </p>
                )}
                <p className="text-sm text-text-muted mt-1">
                  Max file size: 5MB. Accepted formats: images, PDF.
                </p>
              </div>

              {/* Certificate / License (OPTIONAL) */}
              <div className="md:col-span-2">
                <label
                  htmlFor="certificate"
                  className="block text-lg font-semibold text-text-primary mb-2"
                >
                  Upload Professional Certificate/License{' '}
                  <span className="text-text-muted font-normal text-base">
                    (optional)
                  </span>
                </label>
                <input
                  id="certificate"
                  type="file"
                  name="certificate"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  aria-invalid={!!errors.certificate}
                  aria-describedby={errors.certificate ? 'certificate-error' : undefined}
                  className={`w-full px-6 py-4 border rounded-lg file:btn-primary file:text-white file:px-6 file:py-3 file:rounded file:mr-4 file:border-0 cursor-pointer ${
                    errors.certificate ? 'border-red-500' : 'border-border-light'
                  }`}
                />
                {files.certificate && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {files.certificate.name}
                  </p>
                )}
                {errors.certificate && (
                  <p id="certificate-error" className="text-red-500 text-sm mt-1">
                    {errors.certificate}
                  </p>
                )}
                <p className="text-sm text-text-muted mt-1">
                  Optional — you can still apply without a certificate. Max file size: 5MB.
                </p>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full btn-primary py-5 text-xl font-bold transition ${
                    loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting Application...
                    </span>
                  ) : (
                    'Submit Agent Application'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-text-muted mt-8 text-sm">
          Your information and documents will be securely reviewed by our admin team.
        </p>
      </div>
    </div>
  );
}

export default BecomeAgent;
