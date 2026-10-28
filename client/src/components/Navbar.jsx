import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  Shield
} from 'lucide-react';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about', hasDropdown: true },
  { label: 'Events', path: '/events', hasDropdown: true },
  { label: 'Knowledge Hub', path: '/knowledge-hub', hasDropdown: true },
  { label: 'Membership', path: '/membership' },
  { label: 'Partners & Sponsors', path: '/partners' },
  { label: 'Contact Us', path: '/contact' }
];

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleDashboardClick = () => {
    if (isAdmin || user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F7F4]/95 backdrop-blur-md border-b border-[#E2E8F0] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Header: Circular Emblem + "STRONGER RELATIONSHIPS | STRONGER LEADERSHIP" */}
          <Link to="/" className="flex items-center gap-3.5 group focus:outline-none flex-shrink-0">
            <div className="relative w-11 h-11 rounded-full bg-[#0d1527] flex items-center justify-center shadow-md border border-[#0066CC]/30 group-hover:border-[#0066CC] transition-colors">
              <div className="w-8 h-8 rounded-full border-2 border-[#0066CC] flex items-center justify-center bg-gradient-to-tr from-[#0d1527] to-[#1e293b]">
                <Shield className="w-4 h-4 text-[#0066CC]" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-[#0F172A] tracking-tight leading-none font-heading">
                  CXO Connect
                </span>
                <span className="w-2 h-2 rounded-full bg-[#0066CC]" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#0066CC] mt-1">
                STRONGER RELATIONSHIPS | STRONGER LEADERSHIP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-[0.875rem] font-medium text-[#0F172A]">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-150 ${
                    active
                      ? 'text-[#0066CC] font-bold bg-white shadow-sm border border-[#E2E8F0]'
                      : 'text-[#0F172A] hover:text-[#0066CC] hover:bg-white/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <ChevronDown className={`w-3 h-3 transition-transform ${active ? 'text-[#0066CC]' : 'text-[#64748B]'}`} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Corner: Conditional Auth State Switcher */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              /* Exact Pill Dashboard Control: [ (Avatar) ⊞ Dashboard ] [ -> Logout ] */
              <div className="flex items-center bg-white border border-[#E2E8F0] rounded-full p-1 shadow-sm">
                <button
                  onClick={handleDashboardClick}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1527] text-white hover:bg-[#1a2744] transition-all shadow-sm text-xs font-bold"
                  title={`Open ${isAdmin ? 'Admin Console' : 'Member Profile'}`}
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name || 'User'}
                      className="w-5 h-5 rounded-full object-cover border border-[#0066CC]"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#0066CC] flex items-center justify-center text-[10px] font-bold text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#0066CC]" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-1.5 ml-1 rounded-full text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout from session"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* IF GUEST: Exact dark rounded pill button [ -> Sign In ] (#0d1527) */
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0d1527] hover:bg-[#1a2744] text-white text-xs font-bold tracking-wide transition-all shadow-sm border border-[#0d1527]"
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#0066CC]" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            {!isAuthenticated && (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d1527] text-white text-xs font-bold"
              >
                <ArrowRight className="w-3 h-3 text-[#0066CC]" />
                <span>Sign In</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#0F172A] hover:bg-white/80 focus:outline-none"
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
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive(item.path)
                  ? 'bg-white text-[#0066CC] shadow-sm border border-[#E2E8F0]'
                  : 'text-[#0F172A] hover:bg-white/60 hover:text-[#0066CC]'
              }`}
            >
              <span>{item.label}</span>
              {item.hasDropdown && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          ))}

          <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <button
                  onClick={handleDashboardClick}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0d1527]"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-[#0066CC]" />
                    <span>{isAdmin ? 'Admin Console' : 'Member Dashboard'}</span>
                  </span>
                  <span className="text-xs font-normal text-[#64748B]">{user?.email}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0d1527] text-white text-xs font-bold"
                >
                  <ArrowRight className="w-4 h-4 text-[#0066CC]" />
                  <span>Sign In</span>
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
