import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
  ArrowRight,
  LogIn
} from 'lucide-react';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Advisory Board', path: '/committee' },
  { label: 'Mentors', path: '/mentors' },
  { label: 'Conclaves', path: '/events' },
  { label: 'Knowledge Hub', path: '/knowledge-hub' },
  { label: 'Assessment', path: '/quiz' },
  { label: 'Membership', path: '/membership' },
  { label: 'Partners', path: '/partners' },
  { label: 'Contact', path: '/contact' }
];

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F7F4]/95 backdrop-blur-md border-b border-[#E2E8F0] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo with Gold Ring Accent Icon */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none flex-shrink-0">
            {/* Geometric Gold Ring Emblem */}
            <div className="relative w-10 h-10 rounded-full bg-[#111315] flex items-center justify-center shadow-sm">
              <div className="w-7 h-7 rounded-full border-2 border-[#D99B26] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#D99B26]" />
              </div>
            </div>

            {/* Brand Title */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold text-[#111315] tracking-tight leading-none">
                  CXO Connect
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D99B26]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D99B26] mt-0.5">
                Executive Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-[0.875rem] font-medium text-[#111315]">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg transition-all duration-150 ${
                    active
                      ? 'text-[#D99B26] font-bold bg-white/70 shadow-sm border border-[#E2E8F0]'
                      : 'text-[#111315] hover:text-[#D99B26] hover:bg-white/40'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Button(s) */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#111315] text-white hover:bg-[#1e2227] transition-all shadow-sm focus:outline-none"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border border-[#D99B26]"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#D99B26] flex items-center justify-center text-[11px] font-bold text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  <span className="text-xs font-semibold max-w-[110px] truncate">
                    {user?.name || 'Executive'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#D99B26]" />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-[#E2E8F0]">
                      <p className="text-[11px] text-[#64748B] font-medium">Logged in as</p>
                      <p className="text-xs font-bold text-[#111315] truncate">{user?.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        user?.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : user?.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        Status: {user?.status}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#111315] hover:bg-[#F7F7F4] hover:text-[#D99B26] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#64748B]" />
                      <span>Executive Dashboard</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#D99B26] hover:bg-[#F7F7F4] transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#D99B26]" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-[#111315] hover:text-[#D99B26] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/membership"
                  className="btn-charcoal text-xs py-2 px-4 rounded-full"
                >
                  <span>Request an Invitation</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D99B26]" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {!isAuthenticated && (
              <Link
                to="/membership"
                className="px-3 py-1.5 rounded-full bg-[#111315] text-white text-[11px] font-semibold"
              >
                Request Invite
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#111315] hover:bg-white/80 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Sliding Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F7F7F4] border-t border-[#E2E8F0] px-4 pt-3 pb-8 space-y-1 shadow-xl animate-fade-in max-h-[85vh] overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive(item.path)
                  ? 'bg-white text-[#D99B26] shadow-sm border border-[#E2E8F0]'
                  : 'text-[#111315] hover:bg-white/60 hover:text-[#D99B26]'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[#111315] bg-white border border-[#E2E8F0]"
                >
                  My Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[#D99B26] bg-white border border-[#E2E8F0]"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  className="py-2.5 text-center rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#111315]"
                >
                  Sign In
                </Link>
                <Link
                  to="/membership"
                  className="py-2.5 text-center rounded-xl bg-[#111315] text-white text-xs font-bold"
                >
                  Request Invite
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
