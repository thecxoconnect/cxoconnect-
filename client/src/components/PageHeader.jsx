import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PageHeader = ({ title, subtitle, badge, breadcrumbs = [] }) => {
  return (
    <div className="relative bg-[#0E1622] text-white py-14 sm:py-20 overflow-hidden border-b border-[#E2E8F0]/10">
      {/* Background Graphic Patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D99B26_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D99B26]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-xs text-[#64748B] mb-4 font-medium">
            <Link to="/" className="hover:text-[#D99B26] transition-colors">Home</Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-[#D99B26] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-300">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Optional Category Subtitle Badge */}
        {badge && (
          <span className="category-subtitle mb-3">
            {badge}
          </span>
        )}

        {/* Heading in Plus Jakarta Sans */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 font-heading">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
            {subtitle}
          </p>
        )}

      </div>
    </div>
  );
};

export default PageHeader;
