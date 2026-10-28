import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Twitter, ArrowUpRight, ShieldCheck, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#F7F7F4] text-[#0F172A] pt-16 pb-12 border-t border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#E2E8F0]">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-[#0d1527] border border-[#0066CC]/30 flex items-center justify-center shadow-xs">
                <div className="w-7 h-7 rounded-full border border-[#0066CC] flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-[#0066CC]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[#0F172A] font-extrabold text-lg tracking-tight leading-none font-heading">
                  CXO Connect
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#0066CC] font-bold mt-1">
                  STRONGER RELATIONSHIPS | STRONGER LEADERSHIP
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-sm">
              CXO Connect is the exclusive, invitation-only network connecting C-Suite Executives, VPs, and Founders across industries to foster strategic peer alliances, governance excellence, and enterprise innovation.
            </p>

            <div className="pt-2 flex items-center gap-3 text-[#64748B]">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] hover:border-[#0066CC] hover:text-[#0066CC] flex items-center justify-center transition-colors shadow-xs"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] hover:border-[#0066CC] hover:text-[#0066CC] flex items-center justify-center transition-colors shadow-xs"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] ml-2">
                <ShieldCheck className="w-4 h-4 text-[#0066CC]" />
                <span>Verified C-Suite Network</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#64748B]">
              <li>
                <Link to="/" className="hover:text-[#0066CC] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#0066CC] transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#0066CC] transition-colors">Executive Conclaves</Link>
              </li>
              <li>
                <Link to="/knowledge-hub" className="hover:text-[#0066CC] transition-colors">Knowledge Hub</Link>
              </li>
              <li>
                <Link to="/quiz" className="hover:text-[#0066CC] transition-colors flex items-center gap-1 text-[#0066CC] font-semibold">
                  <span>CXO Quiz</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Leadership & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">
              Leadership
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#64748B]">
              <li>
                <Link to="/committee" className="hover:text-[#0066CC] transition-colors">Advisory Board</Link>
              </li>
              <li>
                <Link to="/mentors" className="hover:text-[#0066CC] transition-colors">C-Suite Mentors</Link>
              </li>
              <li>
                <Link to="/membership" className="hover:text-[#0066CC] transition-colors">Membership Privileges</Link>
              </li>
              <li>
                <Link to="/partners" className="hover:text-[#0066CC] transition-colors">Partners & Sponsors</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Secretarial Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">
              Secretariat
            </h4>
            <ul className="space-y-3 text-xs text-[#64748B]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                <span>One BKC, Bandra Kurla Complex, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#0066CC] flex-shrink-0" />
                <span>secretariat@cxoconnect.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#0066CC] flex-shrink-0" />
                <span>+91 22 6123 4500</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <p>© {new Date().getFullYear()} CXO Connect. All rights reserved. Strictly confidential executive community.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-[#0066CC] transition-colors">Privacy Policy</Link>
            <Link to="/membership" className="hover:text-[#0066CC] transition-colors">Terms of Membership</Link>
            <Link to="/contact" className="hover:text-[#0066CC] transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
