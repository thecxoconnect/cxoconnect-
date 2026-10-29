import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConcentricEmblem } from './BrandLogo';

export default function Navbar({ user: propUser, onLogout: propLogout }) {
  const auth = useAuth?.() || {};
  const user = propUser !== undefined ? propUser : auth.user;
  const onLogout = propLogout || auth.logout;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <nav className="bg-[#F7F7F4] border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Emblem & Logo Lockup */}
          <Link to="/" className="flex items-center gap-3.5 group flex-shrink-0">
            <ConcentricEmblem size={42} className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#64748B] leading-none mb-0.5">
                THE
              </span>
              <span className="font-serif text-xl sm:text-2xl font-black text-[#111315] tracking-tight leading-none">
                CXO Connect<span className="text-[#D99B26] ml-0.5">•</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#D99B26] tracking-[0.2em] uppercase mt-1">
                STRONGER RELATIONSHIPS | STRONGER LEADERSHIP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-[#111315]">
            <Link to="/" className="hover:text-[#D99B26] transition-colors">Home</Link>
            <Link to="/about" className="hover:text-[#D99B26] transition-colors">About Us</Link>
            <Link to="/events" className="hover:text-[#D99B26] transition-colors">Events</Link>
            <Link to="/knowledge-hub" className="hover:text-[#D99B26] transition-colors">Knowledge Hub</Link>
            <Link to="/membership" className="hover:text-[#D99B26] transition-colors">Membership</Link>
            <Link to="/partners" className="hover:text-[#D99B26] transition-colors">Partners & Sponsors</Link>
            <Link to="/contact" className="hover:text-[#D99B26] transition-colors">Contact Us</Link>
          </div>

          {/* Right Action Section (Auth State) */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(user.role === 'admin' ? '/admin' : '/profile')}
                  className="flex items-center space-x-2 bg-[#111315] text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-all text-sm font-semibold shadow-sm border border-slate-700"
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name || 'User'} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#D99B26] text-[#111315] text-xs flex items-center justify-center font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <LayoutDashboard className="w-4 h-4 text-[#D99B26]" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-red-600 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 bg-[#111315] text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all text-sm font-semibold shadow-sm border border-slate-800 group"
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#D99B26] group-hover:translate-x-0.5 transition-transform" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#111315] hover:text-[#D99B26] focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E2E8F0] px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-[#111315] font-medium hover:bg-[#F7F7F4] rounded-md">Home</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-[#111315] font-medium hover:bg-[#F7F7F4] rounded-md">About Us</Link>
          <Link to="/events" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-[#111315] font-medium hover:bg-[#F7F7F4] rounded-md">Events</Link>
          <Link to="/knowledge-hub" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-[#111315] font-medium hover:bg-[#F7F7F4] rounded-md">Knowledge Hub</Link>
          <Link to="/membership" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-[#111315] font-medium hover:bg-[#F7F7F4] rounded-md">Membership</Link>
          <Link to="/partners" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-[#111315] font-medium hover:bg-[#F7F7F4] rounded-md">Partners & Sponsors</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-[#111315] font-medium hover:bg-[#F7F7F4] rounded-md">Contact Us</Link>
          
          <div className="pt-4 border-t border-[#E2E8F0]">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate(user.role === 'admin' ? '/admin' : '/profile'); }}
                  className="w-full text-left bg-[#111315] text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-between"
                >
                  <span>Go to Dashboard</span>
                  <LayoutDashboard className="w-5 h-5 text-[#D99B26]" />
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                  className="w-full text-left text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl font-medium flex items-center justify-between transition-colors"
                >
                  <span>Sign Out</span>
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-[#111315] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-800"
              >
                Sign In →
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
