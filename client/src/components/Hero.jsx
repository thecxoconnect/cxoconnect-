import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Calendar, Users, Sparkles, Building2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative w-full bg-[#F7F7F4] pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Subtitle & Action Pills */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Category Subtitle */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#0066CC] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0066CC]">
                Invitation-Only Executive Community
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0F172A] tracking-tight leading-[1.08] font-heading">
              Where enterprise leaders <span className="text-[#0066CC]">think together.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#64748B] max-w-2xl leading-relaxed font-sans">
              CXO Connect unites visionary C-Suite Executives, VPs, and Founders across industries for confidential peer advisory, board governance, and high-impact strategic alliances.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to={isAuthenticated ? "/profile" : "/membership"}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white shadow-md shadow-[#0066CC]/20 group transition-all"
              >
                <span>Request an Invitation</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/events"
                className="btn-outline-executive px-7 py-4 text-sm font-semibold rounded-full bg-white hover:border-[#0066CC] hover:text-[#0066CC]"
              >
                <Calendar className="w-4 h-4 text-[#0066CC]" />
                <span>Explore Conclaves</span>
              </Link>
            </div>

            {/* Trust Markers */}
            <div className="pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center gap-6 text-xs text-[#64748B] font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0066CC]" />
                <span>Chatham House Rule Confidentiality</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0066CC]" />
                <span>2,500+ Verified C-Suite Members</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Contrast Dark Card with Geometric Node Visuals */}
          <div className="lg:col-span-5 relative">
            
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#0066CC]/20 to-transparent rounded-3xl blur-2xl -z-10 pointer-events-none" />

            {/* Main Card Container (Dark Navy #0d1527) */}
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 text-white">
              
              {/* Card Header with Blue Accent */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#0066CC]/40 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#0066CC]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#0066CC]">
                      Spotlight Gathering
                    </p>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Annual Leadership Conclave
                    </h3>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-300">
                  Closed Door
                </span>
              </div>

              {/* Geometric Node Visuals */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#0066CC]/40 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-[#0066CC] tracking-wider block mb-1">
                    01. Strategic
                  </span>
                  <p className="text-xs font-semibold text-white">Boardroom AI & Sovereign Data</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#0066CC]/40 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-[#0066CC] tracking-wider block mb-1">
                    02. Capital
                  </span>
                  <p className="text-xs font-semibold text-white">Cross-Border Debt & M&A</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#0066CC]/40 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-[#0066CC] tracking-wider block mb-1">
                    03. Advisory
                  </span>
                  <p className="text-xs font-semibold text-white">1-on-1 Titan Consultations</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#0066CC]/40 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-[#0066CC] tracking-wider block mb-1">
                    04. Governance
                  </span>
                  <p className="text-xs font-semibold text-white">Directorship Certification</p>
                </div>
              </div>

              {/* Quote / Endorsement Box */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "CXO Connect removes the isolation of high-level decision making. It is the most candid boardroom you will enter."
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="font-bold text-white">Vikramaditya Mehta</span>
                  <span className="text-[#0066CC] font-semibold">Chairman, West Region</span>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <Link
                to="/events"
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-[#0066CC] hover:text-white text-white text-xs font-bold transition-all flex items-center justify-center gap-2 group"
              >
                <span>View All 2026 Conclaves</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
