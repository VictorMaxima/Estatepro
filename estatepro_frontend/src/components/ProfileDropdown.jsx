import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProfileDropdown() {
  const { user, logout, isAgent } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const avatarUrl =
    user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.full_name || user.email.split('@')[0] || 'User'
    )}&background=6D28D9&color=fff&rounded=true&size=128`;

  const displayName =
  user.full_name?.split(' ')[0] ||               // preferred: first name
  user.name ||                              // full name if no split
  (user.email ? user.email.split('@')[0] : 'User') ||  // email prefix e.g. "victoria"
  'User';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 focus:outline-none group transition-all"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-royal-purple shadow-sm group-hover:border-royal-purple/80 transition"
          />
          {isAgent && (
            <span className="absolute -bottom-1 -right-1 bg-gold text-white text-[10px] font-bold px-1.5 rounded-full border border-white">
              Agent
            </span>
          )}
        </div>

        {/* Improved visibility for greeting */}
        <div className="hidden md:flex flex-col text-left leading-tight">
          <span className="font-semibold text-gray-300 group-hover:text-royal-purple transition-colors text-base">
             Hi {displayName}
          </span>
          <span className="text-sm font-medium text-gray-300">
            Welcome back
          </span>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="
            absolute right-0 mt-3 w-64 sm:w-72 
            bg-white rounded-xl shadow-2xl border border-gray-200/70 
            py-1.5 z-50 overflow-hidden animate-fade-in-up
            max-h-[70vh] overflow-y-auto
            max-w-[calc(100vw-2rem)]
          "
        >
          {/* User info header */}
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-royal-purple"
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate text-lg">
                  {user.name || displayName}
                </p>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
            {isAgent && (
              <p className="mt-1 text-xs text-gold font-medium">
                Registered Agent
              </p>
            )}
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              className="block px-5 py-3 text-gray-700 hover:bg-gray-50 hover:text-royal-purple transition text-base"
              onClick={() => setIsOpen(false)}
            >
              My Profile
            </Link>

            <Link
              to="/my-properties"
              className="block px-5 py-3 text-gray-700 hover:bg-gray-50 hover:text-royal-purple transition text-base"
              onClick={() => setIsOpen(false)}
            >
              My Properties
            </Link>
          </div>

          <div className="border-t border-gray-100 mt-1">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-5 py-3.5 text-red-600 hover:bg-red-50 transition font-medium text-base"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}