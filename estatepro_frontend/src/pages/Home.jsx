// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  House,
  Store,
  Bed,
  Hotel,
  Map,
  Calendar,
  Shield,
  CreditCard,
  Clock,
  Star,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import PropertyCard from '../components/common/PropertyCard';

function Home() {
  const { api } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await api.get('/properties');
        const data = response.data;
        
        setProperties(data || []);
        setFilteredProperties(data || []);
        setError('');
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Could not load properties. Please try again.');
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [api]);

  const services = [
    { name: 'Rent Apartment', path: '/rent', icon: House },
    { name: 'Shops for Lease', path: '/lease', icon: Store },
    { name: 'Shortlets / Airbnb', path: '/shortlets', icon: Bed },
    { name: 'Hotel Bookings', path: '/hotels', icon: Hotel },
    { name: 'Buy Land', path: '/land', icon: Map },
    { name: 'Event Halls Booking', path: '/event-halls', icon: Calendar },
  ];

  const quickBenefits = [
    { icon: Shield, title: 'Verified Properties', text: 'All listings are inspected & verified' },
    { icon: CreditCard, title: 'Pay Small Small', text: 'Flexible installment plans available' },
    { icon: Clock, title: '24/7 Support', text: 'We\'re here to help anytime' },
    { icon: Star, title: 'Premium Service', text: 'Best agents & customer experience' },
  ];

  const displayProperties = Array.isArray(properties) ? properties.slice(0, 6) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Unable to Load Properties</h2>
          <p className="text-text-muted mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative bg-primary min-h-[50vh] md:min-h-screen flex flex-col justify-center md:justify-end pb-12 md:pb-24 overflow-hidden">
        
        <div className="absolute inset-0 bg-primary" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          
          <div className="text-center text-white mb-8 md:mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight">
              Leisure at its<br />Peak
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              We help you rent houses/shops, buy land, and book hotels or short-stay apartments without stress.
            </p>
          </div>

          {/* MOBILE ONLY: 2-column service buttons */}
          <div className="md:hidden grid grid-cols-2 gap-4 mb-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.name}
                  to={service.path}
                  className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-manipulation"
                >
                  <Icon size={40} className="text-primary mb-2" />
                  <span className="text-sm font-medium text-text-primary leading-tight text-center">
                    {service.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* DESKTOP ONLY: Horizontal pill nav */}
          <div className="hidden md:block relative z-30 -mb-6">
            <div className="bg-white rounded-full shadow-card inline-flex flex-wrap justify-center p-1 gap-1 mx-auto">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.name}
                    to={service.path}
                    className="flex items-center gap-2 px-5 md:px-7 py-3 rounded-full font-semibold text-text-primary hover:bg-bg-soft transition whitespace-nowrap"
                  >
                    <Icon size={18} className="text-primary" />
                    <span className="text-sm md:text-base">{service.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-5xl mx-auto mb-8 md:mt-0 px-2 md:px-0">
            <SearchBar />
          </div>

          {/* Hamburger Menu Button - MOBILE ONLY */}
          <div className="md:hidden fixed top-4 right-4 z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-primary/90 backdrop-blur-sm p-3 rounded-full text-white shadow-lg"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </section>

      {/* ================= MOBILE HAMBURGER MENU ================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-md">
            <div className="flex flex-col space-y-6 text-center">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.name}
                    to={service.path}
                    className="flex items-center justify-center gap-3 py-4 text-xl font-medium text-text-primary hover:text-primary transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={24} />
                    {service.name}
                  </Link>
                );
              })}

              <Link
                to="/become-agent"
                className="bg-primary text-white py-5 text-xl font-bold rounded-lg hover:bg-primary-dark transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Become An Agent
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= FEATURED PROPERTIES ================= */}
      <section className="py-20 bg-bg-soft">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-text-primary mb-12">
            Featured Properties
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProperties.length > 0 ? (
              displayProperties.map((property) => (
                <PropertyCard key={property.id || property.slug} property={property} />
              ))
            ) : (
              <div className="col-span-3 text-center text-text-muted py-12">
                No properties available at the moment.
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/all-properties"
              className="text-primary text-lg font-semibold hover:underline"
            >
              View All Properties →
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-text-primary mb-12">
            Explore by Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.slice(0, 4).map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.name}
                  to={service.path}
                  className="group bg-white rounded-xl shadow-card hover:shadow-card-hover p-10 text-center transition-all duration-300"
                >
                  <Icon
                    size={48}
                    className="mx-auto mb-6 text-primary group-hover:scale-110 transition-transform"
                  />
                  <h3 className="text-xl font-bold text-text-primary mb-3">
                    {service.name}
                  </h3>
                  <p className="text-text-muted">
                    Browse verified listings nationwide
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= QUICK BENEFITS ================= */}
      <section className="py-20 bg-bg-soft">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {quickBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <Icon size={48} className="text-primary mb-4" />
                  <h3 className="text-xl font-bold text-text-primary mb-2">{benefit.title}</h3>
                  <p className="text-text-muted text-sm">{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= GET APARTMENT/SHOPS FOR RENT AND LEASE ================= */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                Get Apartment/Shops for Rent and Lease
              </h2>
              <p className="text-xl mb-8 opacity-90">
                At HomeMu, Your Comfort and Security comes first. We deliver seamless real estate solutions built on Trust, Quality and Legal Assurance.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4 items-start justify-center lg:justify-start">
                  <BookOpen size={32} className="text-white shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white text-left">
                      We provide well-maintained, comfortable, and conducive living spaces for leisure, rent, and long-term stays.
                    </h3>
                  </div>
                </div>

                <div className="flex gap-4 items-start justify-center lg:justify-start">
                  <BookOpen size={32} className="text-white shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white text-left">
                      Whether you're leasing or renting, we offer top-tier property options tailored to your lifestyle and budget.
                    </h3>
                  </div>
                </div>

                <div className="flex gap-4 items-start justify-center lg:justify-start">
                  <BookOpen size={32} className="text-white shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white text-left">
                      Experience convenience, comfort, and legal security—all in one place. Choose HomeMu today.
                    </h3>
                  </div>
                </div>
              </div>

              <Link
                to="/shortlets"
                className="inline-block mt-10 bg-white text-primary font-bold px-10 py-4 rounded-full hover:bg-gray-100 transition"
              >
                Explore HomeMu Services
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <img
                src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Modern holiday villa"
                className="rounded-xl shadow-2xl object-cover w-full h-64 lg:h-80"
              />
              <img
                src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Beach getaway villa"
                className="rounded-xl shadow-2xl object-cover w-full h-64 lg:h-80 mt-12 lg:mt-0"
              />
              <img
                src="https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Luxury shortlet interior"
                className="rounded-xl shadow-2xl object-cover w-full h-64 lg:h-80 -mt-12 lg:mt-0"
              />
              <img
                src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Luxury property"
                className="rounded-xl shadow-2xl object-cover w-full h-64 lg:h-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOTELS AND SHORTLETS TIPS ================= */}
      <section className="py-20 bg-bg-soft">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-6">
                Hotels, Shortlets and Event Halls Booking Tips
              </h2>
              <p className="text-xl text-text-muted mb-8">
                Get quick response on the best hotels, Event Halls, shortlets available in your location.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <BookOpen size={32} className="text-primary shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Comfortable Living Spaces – We offer quality shortlets designed to give you comfort and convenience.</h3>
                  </div>
                </div>
                <div className="flex gap-4">
                  <BookOpen size={32} className="text-primary shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Hassle-Free Hotel Booking – Booking a hotel through us is fast, simple, and stress-free.</h3>
                  </div>
                </div>
                <div className="flex gap-4">
                  <BookOpen size={32} className="text-primary shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Get access to verified venues with Flexible options for weddings, conferences, parties, and corporate events</h3>
                  </div>
                </div>
              </div>
              <Link to="/hotels" className="inline-block mt-10 text-primary font-bold hover:underline text-lg">
                Read All Tips →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <img src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Guide" className="rounded-xl shadow-2xl w-full h-64 object-cover" />
              <img src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Location guide" className="rounded-xl shadow-2xl mt-12 w-full h-64 object-cover" />
              <img src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Investment" className="rounded-xl shadow-2xl -mt-12 w-full h-64 object-cover" />
              <img src="https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Tips" className="rounded-xl shadow-2xl w-full h-64 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= PAY SMALL SMALL ================= */}
      <section className="py-20 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                <img src="https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Payment plan" className="rounded-xl shadow-2xl w-full h-64 object-cover" />
                <img src="https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Flexible payment" className="rounded-xl shadow-2xl mt-12 w-full h-64 object-cover" />
                <img src="https://images.pexels.com/photos/4386396/pexels-photo-4386396.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Easy payment" className="rounded-xl shadow-2xl w-full h-64 object-cover" />
                <img src="https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Installment" className="rounded-xl shadow-2xl mt-12 w-full h-64 object-cover" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-6">
                Own a Land Today!
              </h2>
              <p className="text-xl text-text-muted mb-8">
                We offer genuine plots at discounted prices, making land ownership easier and more affordable for everyone.
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-center gap-3">
                  <CreditCard size={24} className="text-primary" />
                  <span>Exclusive discount rates you won't find elsewhere</span>
                </li>
                <li className="flex items-center gap-3">
                  <CreditCard size={24} className="text-primary" />
                  <span>Flexible payment options to suit your budget</span>
                </li>
                <li className="flex items-center gap-3">
                  <CreditCard size={24} className="text-primary" />
                  <span>Verified and secure land documentation</span>
                </li>
              </ul>
              <Link to="/land" className="inline-block mt-10 btn-primary py-4 px-10">
                View Payment Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;