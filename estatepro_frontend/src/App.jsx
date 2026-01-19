// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from './components/common/ProtectedRoute';
import AllProperties from './pages/AllProperties';
import Logout from './pages/Logout';
import VerifyEmail from './pages/VerifyEmail';
import AgentProperties from './pages/AgentProperties';


function App() {
  return (
    // <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/rent" element={<Rent />} />
            <Route path="/lease" element={<Lease />} />
            <Route path="/shortlets" element={<Shortlets />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/list-property" element={<ProtectedRoute requireAgent={true}><ListProperties /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/land" element={<Land />} />
            <Route path="/become-agent" element={<BecomeAgent />} />
            <Route path='/hotels' element={<Hotels />} />
            <Route path="/event-halls" element={<EventHalls />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path='/agent-dashboard' element={<AgentDashboard />} />
            <Route path="/all-properties" element={<AllProperties />} />
           <Route path='/logout' element={<Logout />} />
           <Route path="/verify-email" element={<VerifyEmail />} />
           <Route path="/agent/properties" element={<AgentProperties />} />
          </Routes>
        </main>
        <Footer />
      </div>
    // </Router>
  );
  
}

export default App;