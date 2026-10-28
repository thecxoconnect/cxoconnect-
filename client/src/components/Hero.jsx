import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden bg-slate-100">
      {/* Background Image: Grayscale Executive Team (matching screenshot aesthetic) */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
          alt="C-Suite Executives in Strategy Discussion"
          className="w-full h-full object-cover object-center filter grayscale opacity-35"
        />
        {/* Soft radial and linear overlay to maintain pristine contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/75 to-slate-50/95" />
      </div>

      {/* Content Container (Exact layout alignment with user image) */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center flex flex-col items-center">
        
        {/* Top Centered Pill Badge (matching "SOCIAL IMPACT THROUGH HR" geometry) */}
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/90 text-blue-900 text-xs sm:text-[0.8125rem] font-bold tracking-widest uppercase mb-6 shadow-sm backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Executive Impact Through Leadership</span>
        </div>

        {/* Main Headline (Playfair Display serif styling from user image) */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-extrabold tracking-tight text-slate-900 leading-[1.05] sm:leading-none mb-6">
          <span className="block text-slate-900 drop-shadow-sm font-semibold">Welcome to</span>
          <span className="block text-blue-600 mt-1 sm:mt-2 tracking-tight drop-shadow-md">
            CXO Connect
          </span>
        </h1>

        {/* Executive Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg md:text-xl text-slate-600 font-normal leading-relaxed mb-10 text-center">
          Join a community of forward-thinking C-suite executives and senior leaders dedicated to meaningful strategic connections, peer advisory, and executive growth.
        </p>

        {/* 3 Horizontal Pill Action Buttons (Exact match to screenshot layout) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-3xl">
          
          {/* Button 1: Become CXO Member */}
          <Link
            to={isAuthenticated ? "/profile" : "/membership"}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#0d1527] text-white font-semibold text-sm sm:text-base hover:bg-[#1a2642] transition-all duration-200 shadow-lg shadow-slate-950/20 transform hover:-translate-y-0.5"
          >
            <span>Become CXO Member</span>
          </Link>

          {/* Button 2: Join CXO Executive Forum (Message icon) */}
          <Link
            to="/events#discussions"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0d1527] text-white font-semibold text-sm sm:text-base hover:bg-[#1a2642] transition-all duration-200 shadow-lg shadow-slate-950/20 transform hover:-translate-y-0.5"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            <span>Join CXO Executive Forum</span>
          </Link>

          {/* Button 3: Explore Engagements -> */}
          <Link
            to="/events"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#0d1527] text-white font-semibold text-sm sm:text-base hover:bg-[#1a2642] transition-all duration-200 shadow-lg shadow-slate-950/20 transform hover:-translate-y-0.5"
          >
            <span>Explore Engagements</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
          </Link>

        </div>

      </div>
    </section>
  );
};

export default Hero;
