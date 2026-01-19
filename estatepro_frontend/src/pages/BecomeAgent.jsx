import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '@/config/api';

function BecomeAgent() {
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken'); // From login

  // Validation
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
    } else if (parseInt(formData.yearsExperience) < 0) {
      newErrors.yearsExperience = 'Experience cannot be negative';
    }
    if (!files.idProof) newErrors.idProof = 'ID proof upload is required';
    if (!files.certificate) newErrors.certificate = 'Certificate upload is required';

    setError(Object.values(newErrors)[0] || ''); // Show first error
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    setFiles({ ...files, [name]: uploadedFiles[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!token) {
      setError('Please login first to apply as an agent');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.fullName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('nin_number', formData.ninNumber);
      formDataToSend.append('years_experience', formData.yearsExperience);
      formDataToSend.append('id_proof', files.idProof);
      formDataToSend.append('certificate', files.certificate);

      const response = await fetch(`${API_URL}agent_apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Do NOT set 'Content-Type' manually for FormData — browser handles it
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Application submission failed');
      }

      setSuccess(true);
      alert('Application submitted successfully! Our team will review it shortly.');
      navigate('/');

    } catch (err) {
      setError(err.message || 'An error occurred while submitting your application');
    } finally {
      setLoading(false);
    }
  };

  // Not logged in
  if (!token) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-card p-12 max-w-md">
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
    <div className="min-h-screen bg-bg-soft py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-6">
          Become a Verified Agent
        </h1>
        <p className="text-lg md:text-xl text-text-muted text-center mb-12">
          Join our professional agent network — only verified agents can list properties
        </p>

        <div className="bg-white rounded-2xl shadow-card p-6 md:p-12">
          {success ? (
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold text-green-600 mb-4">Application Submitted!</h2>
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
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {error && (
                <div className="md:col-span-2 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl text-center">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-lg font-semibold text-text-primary mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-lg font-semibold text-text-primary mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 08012345678"
                  className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {/* NIN Number */}
              <div>
                <label className="block text-lg font-semibold text-text-primary mb-2">
                  NIN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ninNumber"
                  value={formData.ninNumber}
                  onChange={handleChange}
                  placeholder="Your 11-digit NIN"
                  className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-lg font-semibold text-text-primary mb-2">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="yearsExperience"
                  value={formData.yearsExperience}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 5"
                  className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {/* ID Proof Upload */}
              <div className="md:col-span-2">
                <label className="block text-lg font-semibold text-text-primary mb-2">
                  Upload ID Proof (NIN Slip or Government ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="idProof"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full px-6 py-4 border border-border-light rounded-lg file:btn-primary file:text-white file:px-6 file:py-3 file:rounded file:mr-4 file:border-0 cursor-pointer"
                  required
                />
                {files.idProof && (
                  <p className="text-sm text-green-600 mt-2">✓ {files.idProof.name}</p>
                )}
              </div>

              {/* Certificate Upload */}
              <div className="md:col-span-2">
                <label className="block text-lg font-semibold text-text-primary mb-2">
                  Upload Professional Certificate/License <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="certificate"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full px-6 py-4 border border-border-light rounded-lg file:btn-primary file:text-white file:px-6 file:py-3 file:rounded file:mr-4 file:border-0 cursor-pointer"
                  required
                />
                {files.certificate && (
                  <p className="text-sm text-green-600 mt-2">✓ {files.certificate.name}</p>
                )}
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
                  {loading ? 'Submitting Application...' : 'Submit Agent Application'}
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