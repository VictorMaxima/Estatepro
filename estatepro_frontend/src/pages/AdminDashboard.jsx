// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '@/config/api';

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch all agent applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_URL}list_applications`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.message || 'Failed to load applications');
        }

        setApplications(data); // Expecting array of applications
      } catch (err) {
        setError(err.message || 'Could not load agent applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  // Approve an application
  const handleApprove = async (appId) => {
    if (!confirm('Are you sure you want to approve this agent?')) return;

    try {
      const response = await fetch(`${API_URL}approve_application/${appId}/`, {
        method: 'POST', // Change to 'PUT' if backend uses PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }), // Adjust body if different
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to approve application');
      }

      // Update UI immediately
      setApplications(prev =>
        prev.map(app =>
          app.id === appId ? { ...app, status: 'approved' } : app
        )
      );

      alert('Agent approved successfully!');
    } catch (err) {
      alert('Error approving: ' + err.message);
    }
  };

  // Reject an application (optional - add if backend supports reject)
  const handleReject = async (appId) => {
    if (!confirm('Are you sure you want to reject this agent?')) return;

    try {
      const response = await fetch(`${API_URL}approve_application/${appId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (!response.ok) throw new Error('Failed to reject application');

      setApplications(prev =>
        prev.map(app =>
          app.id === appId ? { ...app, status: 'rejected' } : app
        )
      );

      alert('Application rejected.');
    } catch (err) {
      alert('Error rejecting: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-xl text-text-primary">Loading agent applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-card p-12 max-w-md">
          <h1 className="text-4xl font-bold text-red-600 mb-6">Error</h1>
          <p className="text-xl text-text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-12">
          Admin Dashboard - Agent Reviews
        </h1>

        {applications.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-card p-16">
            <h2 className="text-3xl font-bold text-text-primary mb-6">
              No Pending Applications
            </h2>
            <p className="text-xl text-text-muted">
              There are currently no agent applications awaiting review.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {applications.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-2xl shadow-card p-8 hover:shadow-2xl transition-shadow"
              >
                <h2 className="text-3xl font-bold text-text-primary mb-6">
                  Applicant: {agent.full_name || 'Unnamed'}
                </h2>

                <p className="text-sm text-text-muted mb-6">
                  Submitted: {new Date(agent.submitted_at || agent.created_at).toLocaleString()}
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8 text-text-muted">
                  <p><strong>Email:</strong> {agent.email}</p>
                  <p><strong>Phone:</strong> {agent.phone}</p>
                  <p><strong>NIN:</strong> {agent.nin_number || agent.ninNumber}</p>
                  <p><strong>Experience:</strong> {agent.years_experience || agent.yearsExperience} years</p>
                  <p className="md:col-span-3">
                    <strong>Status:</strong>{' '}
                    <span
                      className={`font-bold ${
                        agent.status === 'approved'
                          ? 'text-green-600'
                          : agent.status === 'rejected'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {agent.status ? agent.status.toUpperCase() : 'PENDING'}
                    </span>
                  </p>
                </div>

                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-text-primary mb-6">Uploaded Documents</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="font-semibold text-lg mb-3">ID Proof</p>
                      {agent.id_proof ? (
                        <img
                          src={agent.id_proof}
                          alt="ID Proof"
                          className="w-full rounded-xl border-2 border-border-light shadow-md object-cover h-64"
                        />
                      ) : (
                        <p className="text-text-muted">No ID proof uploaded</p>
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-lg mb-3">Professional Certificate</p>
                      {agent.certificate ? (
                        <img
                          src={agent.certificate}
                          alt="Certificate"
                          className="w-full rounded-xl border-2 border-border-light shadow-md object-cover h-64"
                        />
                      ) : (
                        <p className="text-text-muted">No certificate uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                {agent.status !== 'approved' && agent.status !== 'rejected' && (
                  <div className="flex flex-col sm:flex-row gap-6">
                    <button
                      onClick={() => handleApprove(agent.id)}
                      className="flex-1 bg-green-600 text-white font-bold py-4 text-xl rounded-xl hover:bg-green-700 transition"
                    >
                      Approve Agent
                    </button>

                    <button
                      onClick={() => handleReject(agent.id)}
                      className="flex-1 bg-red-600 text-white font-bold py-4 text-xl rounded-xl hover:bg-red-700 transition"
                    >
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;