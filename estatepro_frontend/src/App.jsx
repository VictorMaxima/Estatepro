// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Buy from './pages/Buy';
import Rent from './pages/Rent';
import Lease from './pages/Lease';
import Shortlets from './pages/ShortLets';
import PropertyDetails from './pages/PropertyDetails';
import ListProperties from './pages/ListProperties';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import Land from './pages/Land';
import BecomeAgent from './pages/BecomeAgent';
import Hotels from './pages/Hotels';
import EventHalls from './pages/EventHalls';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import Properties from './pages/AllProperties';
import Logout from './pages/Logout';
import VerifyEmail from './pages/VerifyEmail';
import AgentProperties from './pages/AgentProperties';
import EditProperty from './pages/EditProperties';
import Wallets from './pages/Wallet';
import Checkout from './pages/Checkout';

function App() {
  const { user, isAuthenticated, isAgent } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();

  // Show login modal for unauthenticated users after delay, but NOT on auth pages
  useEffect(() => {
    // Don't show modal on auth pages or if user is authenticated
    const isAuthPage = ['/login', '/signup', '/verify-email'].includes(location.pathname);
    
    if (!isAuthenticated && !isAuthPage) {
      const timer = setTimeout(() => {
        setShowLoginModal(true);
      }, 4500); // 4.5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, location.pathname]); // ✅ Added proper dependencies

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  // Hide header/footer on these paths AND when modal is open
  const isAuthPage = ['/login', '/signup', '/verify-email'].includes(location.pathname);
  const hideHeaderFooter = isAuthPage || showLoginModal;

  return (
    <>
      {/* Login Modal - rendered outside layout so it can fully overlay */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Only render header, main content & footer when modal is closed */}
      {!showLoginModal && (
        <div className="min-h-screen flex flex-col">
          {!isAuthPage && <Header />}

          <main className="grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/buy" element={<Buy />} />
              <Route path="/rent" element={<Rent />} />
              <Route path="/lease" element={<Lease />} />
              <Route path="/shortlets" element={<Shortlets />} />
              <Route path="/land" element={<Land />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/event-halls" element={<EventHalls />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/become-agent" element={<BecomeAgent />} />

              {/* Properties */}
              <Route path="/properties" element={<Properties />} />
              <Route path="/all-properties" element={<Properties />} />
              
              <Route path="/properties/detail/:id" element={<PropertyDetails />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/checkout/:id" element={<Checkout />} />

              {/* Agent Protected Routes */}
              <Route 
                path="/agent-dashboard" 
                element={
                  isAuthenticated && isAgent ? 
                    <AgentDashboard /> : 
                    <Navigate to="/" replace />
                } 
              />
              <Route
                path="/list-property"
                element={
                  isAuthenticated && isAgent ? 
                    <ListProperties /> : 
                    <Navigate to="/" replace />
                }
                
              />
              
              <Route
                path="/agent/properties"
                element={
                  isAuthenticated && isAgent ? 
                    <AgentProperties /> : 
                    <Navigate to="/" replace />
                }
              />
              <Route
                path="/wallet"
                element={
                  isAuthenticated && isAgent ? 
                    <Wallets /> : 
                    <Navigate to="/" replace />
                }
              />
              <Route
  path="/edit-property/:id"
  element={isAuthenticated && isAgent ? <EditProperty /> : <Navigate to="/" replace />}
/>

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  isAuthenticated && user?.role === 'admin' ? 
                    <AdminDashboard /> : 
                    <Navigate to="/" replace />
                }
              />

              {/* 404 Route */}
              <Route 
                path="*" 
                element={
                  <div className="min-h-screen flex items-center justify-center text-2xl">
                    404 - Page Not Found
                  </div>
                } 
              />
            </Routes>
          </main>

          {!isAuthPage && <Footer />}
        </div>
      )}
    </>
  );
}

export default App;