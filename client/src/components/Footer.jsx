import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Twitter, ArrowUpRight, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0b1120] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white font-serif font-black text-sm">
                CXO
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg tracking-tight leading-none">
                  CXO Connect
                </span>
                <span className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold mt-1">
                  Premier Executive Community
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              CXO Connect is the exclusive, invitation-only network connecting C-Suite Executives, VPs, and Founders across industries to foster strategic peer alliances, governance excellence, and enterprise innovation.
            </p>

            <div className="pt-2 flex items-center gap-3 text-slate-400">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-blue-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified C-Suite Network</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">Executive Conclaves</Link>
              </li>
              <li>
                <Link to="/knowledge-hub" className="hover:text-white transition-colors">Knowledge Hub</Link>
              </li>
              <li>
                <Link to="/quiz" className="hover:text-white transition-colors flex items-center gap-1 text-blue-400">
                  <span>CXO Quiz</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Community
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/membership" className="hover:text-white transition-colors">Membership Tiers</Link>
              </li>
              <li>
                <Link to="/partners" className="hover:text-white transition-colors">Partners & Sponsors</Link>
              </li>
              <li>
                <Link to="/about#committee" className="hover:text-white transition-colors">Advisory Board</Link>
              </li>
              <li>
                <Link to="/about#mentors" className="hover:text-white transition-colors">C-Suite Mentors</Link>
              </li>
              <li>
                <Link to="/about#chapters" className="hover:text-white transition-colors">Regional Chapters</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Secretarial Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Executive Secretariat
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>One BKC, Bandra Kurla Complex, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>secretariat@cxoconnect.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>+91 22 6123 4500</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CXO Connect. All rights reserved. Strictly confidential executive community.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-400 transition-colors">Terms of Membership</Link>
            <Link to="/contact" className="hover:text-slate-400 transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
