// src/pages/Contact.jsx
import { useState } from 'react';
import API_URL from '@/config/api';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Please enter your message');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Failed to send message');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' }); // Clear form

    } catch (err) {
      setError(err.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-6">
          Contact Us
        </h1>
        <p className="text-xl text-text-muted text-center mb-12 max-w-3xl mx-auto">
          Have questions about properties, agent services, or anything else? We're here to help.
        </p>

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-8 py-12 rounded-2xl text-center shadow-card">
            <h2 className="text-3xl font-bold mb-4">Message Sent Successfully!</h2>
            <p className="text-xl mb-8">
              Thank you for reaching out. We'll get back to you within 24–48 hours.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="btn-primary py-4 px-10 text-lg"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-card p-8">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Get in Touch</h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (optional)"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
                />

                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  required
                  className="w-full px-6 py-4 border border-border-light rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full btn-primary py-5 text-xl font-bold transition ${
                    loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark'
                  }`}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-card p-8">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Contact Information</h2>
              <div className="space-y-8 text-text-muted">
                <div>
                  <p className="font-semibold text-text-primary text-lg">Email</p>
                  <p className="mt-2 text-xl">support@homemu.ng</p>
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-lg">Phone</p>
                  <p className="mt-2 text-xl">+234 800 000 0000</p>
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-lg">Office</p>
                  <p className="mt-2 text-xl">Victoria Island, Lagos, Nigeria</p>
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-lg">Business Hours</p>
                  <p className="mt-2 text-xl">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Contact;