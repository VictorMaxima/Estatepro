import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth(); // Get current user

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-primary sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo.jpeg"
              alt="HomeMu Logo"
              className="h-20 md:h-20 w-auto"
            />
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center">

            {/* Main Navigation */}
            <nav className="flex items-center mr-24">
              <Link
                to="/"
                onClick={closeMenu}
                className="px-8 text-white hover:text-accent font-medium transition border-r border-white/30"
              >
                Home
              </Link>

              <Link
                to="/about"
                onClick={closeMenu}
                className="px-8 text-white hover:text-accent font-medium transition border-r border-white/30"
              >
                About
              </Link>

              <Link
                to="/contact"
                onClick={closeMenu}
                className="px-8 text-white hover:text-accent font-medium transition"
              >
                Contact
              </Link>
            </nav>

            {/* Auth & CTA */}
            <div className="flex items-center gap-10">
              <Link
                to="/login"
                className="px-6 text-white hover:text-accent font-medium transition border-r border-white/30"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="px-6 text-accent hover:text-white font-medium transition border-r border-white/30"
              >
                Sign Up
              </Link>

              <Link
                to="/become-agent"
                className="ml-14 bg-white text-primary px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                Become An Agent
              </Link>

              <Link to="/logout" className="text-red-600 hover:text-red-800 font-medium">
                Logout
              </Link>

              {/* Only show "List Your Property" if user is an approved agent */}
              {user && user.agentStatus === 'approved' && (
                <Link
                  to="/list-property"
                  className="ml-14 bg-white text-primary px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition"
                >
                  List Your Property
                </Link>
              )}
            </div>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  mobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMenu}
          />

          {/* Drawer */}
          <div className="relative w-80 h-full bg-white shadow-2xl overflow-y-auto">
            {/* Logo */}
            <div className="p-6 border-b border-border text-center">
              <img
                src="/logo.jpeg"
                alt="HomeMu"
                className="h-16 mx-auto"
              />
            </div>

            {/* Navigation */}
            <nav className="p-6 space-y-8">
              <div className="space-y-4">
                <Link
                  to="/"
                  onClick={closeMenu}
                  className="block text-lg font-medium text-text-primary hover:text-primary"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  onClick={closeMenu}
                  className="block text-lg font-medium text-text-primary hover:text-primary"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  onClick={closeMenu}
                  className="block text-lg font-medium text-text-primary hover:text-primary"
                >
                  Contact
                </Link>
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block text-center font-medium text-text-primary py-3"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="block text-center font-medium text-primary py-3"
                >
                  Sign Up
                </Link>

                <Link
                  to="/become-agent"
                  onClick={closeMenu}
                  className="block text-center bg-white text-primary font-bold py-3 rounded-xl hover:bg-gray-100 transition"
                >
                  Become An Agent
                </Link>

                {/* Only show for approved agents in mobile too */}
                {user && user.agentStatus === 'approved' && (
                  <Link
                    to="/list-property"
                    onClick={closeMenu}
                    className="block text-center bg-white text-primary font-bold py-4 rounded-xl hover:bg-gray-100 transition"
                  >
                    List Your Property
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;