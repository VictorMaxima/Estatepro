// src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
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
import DeleteProperty from './pages/DeleteProperty';

function App() {
  const { user, isAuthenticated, isAgent } = useAuth();
  const location = useLocation();

  // Hide header/footer on auth pages
  const isAuthPage = ['/login', '/signup', '/verify-email'].includes(location.pathname);

  return (
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
                <Navigate to="/login" replace />
            } 
          />

// Add this route
          <Route path="/agent/properties/:propertyId/delete" element={<DeleteProperty />} />
          <Route
            path="/list-property"
            element={
              isAuthenticated && isAgent ? 
                <ListProperties /> : 
                <Navigate to="/login" replace />
            }
          />
          
          <Route
            path="/agent/properties"
            element={
              isAuthenticated && isAgent ? 
                <AgentProperties /> : 
                <Navigate to="/login" replace />
            }
          />
          
          <Route
            path="/wallet"
            element={
              isAuthenticated && isAgent ? 
                <Wallets /> : 
                <Navigate to="/login" replace />
            }
          />
          
          <Route
            path="/edit-property/:id"
            element={
              isAuthenticated && isAgent ? 
                <EditProperty /> : 
                <Navigate to="/login" replace />
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              isAuthenticated && user?.role === 'admin' ? 
                <AdminDashboard /> : 
                <Navigate to="/login" replace />
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
  );
}

export default App;