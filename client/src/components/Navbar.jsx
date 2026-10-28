import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogIn, User, ShieldCheck, LogOut, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [aboutOpen, setAboutOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const aboutRef = useRef(null);
  const eventsRef = useRef(null);
  const knowledgeRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target)) setAboutOpen(false);
      if (eventsRef.current && !eventsRef.current.contains(e.target)) setEventsOpen(false);
      if (knowledgeRef.current && !knowledgeRef.current.contains(e.target)) setKnowledgeOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setAboutOpen(false);
    setEventsOpen(false);
    setKnowledgeOpen(false);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Tagline (Replicating exact layout geometry from screenshot) */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            {/* Swirl/Emblem Icon */}
            <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-600 shadow-md">
              <div className="w-8 h-8 rounded-full border-2 border-white/80 flex items-center justify-center">
                <span className="text-white font-serif font-black text-sm tracking-tighter">CXO</span>
              </div>
            </div>

            {/* Brand Text + Two-line Tagline */}
            <div className="flex flex-col justify-center">
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-700 leading-none">
                Stronger Relationships
              </span>
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-600 leading-tight">
                Stronger Leadership
              </span>
              <span className="text-base font-bold text-slate-900 tracking-tight leading-none mt-0.5">
                CXO Connect
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-7 text-[0.9375rem] font-medium text-slate-700">
            {/* Home */}
            <Link
              to="/"
              className={`transition-colors py-2 ${
                isActive('/') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
              }`}
            >
              Home
            </Link>

            {/* About Us ⌄ */}
            <div className="relative" ref={aboutRef}>
              <button
                onClick={() => setAboutOpen(!aboutOpen)}
                className={`inline-flex items-center gap-1 py-2 focus:outline-none transition-colors ${
                  location.pathname.startsWith('/about') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
                }`}
              >
                <span>About Us</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${aboutOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
              </button>

              {aboutOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2.5 z-50 animate-fade-in">
                  <Link
                    to="/about"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    About CXO Connect
                  </Link>
                  <Link
                    to="/about#committee"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    Advisory Board & Committee
                  </Link>
                  <Link
                    to="/about#mentors"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    C-Suite Mentors
                  </Link>
                  <Link
                    to="/about#chapters"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    Regional Chapters
                  </Link>
                </div>
              )}
            </div>

            {/* Events ⌄ */}
            <div className="relative" ref={eventsRef}>
              <button
                onClick={() => setEventsOpen(!eventsOpen)}
                className={`inline-flex items-center gap-1 py-2 focus:outline-none transition-colors ${
                  location.pathname.startsWith('/events') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
                }`}
              >
                <span>Events</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${eventsOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
              </button>

              {eventsOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2.5 z-50 animate-fade-in">
                  <Link
                    to="/events"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    All Upcoming Summits
                  </Link>
                  <Link
                    to="/events?cat=Leadership+Summit"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    Leadership Conclaves
                  </Link>
                  <Link
                    to="/events?cat=C-Suite+Roundtable"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    C-Suite Roundtables
                  </Link>
                  <Link
                    to="/events?cat=Executive+Masterclass"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    Executive Masterclasses
                  </Link>
                </div>
              )}
            </div>

            {/* Knowledge Hub ⌄ */}
            <div className="relative" ref={knowledgeRef}>
              <button
                onClick={() => setKnowledgeOpen(!knowledgeOpen)}
                className={`inline-flex items-center gap-1 py-2 focus:outline-none transition-colors ${
                  location.pathname.startsWith('/knowledge-hub') || location.pathname.startsWith('/quiz')
                    ? 'text-blue-600 font-semibold'
                    : 'hover:text-blue-600'
                }`}
              >
                <span>Knowledge Hub</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${knowledgeOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
              </button>

              {knowledgeOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2.5 z-50 animate-fade-in">
                  <Link
                    to="/knowledge-hub"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    Executive Frameworks & Research
                  </Link>
                  <Link
                    to="/quiz"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium text-blue-600"
                  >
                    CXO Decision Assessment (Quiz)
                  </Link>
                  <Link
                    to="/knowledge-hub#certifications"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    Board Governance Certifications
                  </Link>
                </div>
              )}
            </div>

            {/* Membership */}
            <Link
              to="/membership"
              className={`transition-colors py-2 ${
                isActive('/membership') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
              }`}
            >
              Membership
            </Link>

            {/* Partners & Sponsors */}
            <Link
              to="/partners"
              className={`transition-colors py-2 ${
                isActive('/partners') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
              }`}
            >
              Partners & Sponsors
            </Link>

            {/* Contact Us */}
            <Link
              to="/contact"
              className={`transition-colors py-2 ${
                isActive('/contact') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Right Action: Exact Dark Rounded Pill Button from Screenshot */}
          <div className="hidden xl:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md focus:outline-none"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  <span className="text-sm font-semibold max-w-[120px] truncate">
                    {user?.name || 'Executive'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        user?.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700'
                          : user?.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        Status: {user?.status}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Executive Dashboard</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-700">Admin Console</span>
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0d1527] text-white font-semibold text-sm hover:bg-[#1c2948] transition-all shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-3">
            {!isAuthenticated && (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0d1527] text-white text-xs font-semibold"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-2 max-h-[80vh] overflow-y-auto animate-fade-in shadow-xl">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            About Us
          </Link>
          <Link
            to="/events"
            className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            Events & Summits
          </Link>
          <Link
            to="/knowledge-hub"
            className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            Knowledge Hub
          </Link>
          <Link
            to="/quiz"
            className="block px-3 py-2 rounded-md font-medium text-blue-600 bg-blue-50/50"
          >
            CXO Decision Quiz
          </Link>
          <Link
            to="/membership"
            className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            Membership
          </Link>
          <Link
            to="/partners"
            className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            Partners & Sponsors
          </Link>
          <Link
            to="/contact"
            className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            Contact Us
          </Link>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md font-semibold text-slate-900 bg-slate-100"
              >
                Dashboard / Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md font-semibold text-blue-700 bg-blue-50"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-md font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#0d1527] text-white font-semibold text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Executive Login</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
