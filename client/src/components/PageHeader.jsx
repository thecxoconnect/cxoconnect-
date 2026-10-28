import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PageHeader = ({ title, subtitle, badge, breadcrumbs = [] }) => {
  return (
    <div className="relative bg-slate-900 text-white py-14 sm:py-20 overflow-hidden border-b border-slate-800">
      {/* Background Graphic Patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-blue-400 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-200">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Optional Pill Badge */}
        {badge && (
          <span className="inline-block px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-3">
            {badge}
          </span>
        )}

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-4">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="max-w-2xl text-slate-400 text-base sm:text-lg leading-relaxed">
            {subtitle}
          </p>
        )}

      </div>
    </div>
  );
};

export default PageHeader;
