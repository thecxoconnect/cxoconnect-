import React from 'react';
import { Award, BookOpen, Clock, CheckCircle } from 'lucide-react';

const CertificationCard = ({ title, issuer, duration, level, modules = [], onEnroll }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#0066CC]/50 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="px-2.5 py-0.5 rounded-full bg-[#EBF5FF] text-[#0066CC] text-[10px] font-bold uppercase tracking-wider border border-[#BFDBFE]">
            {level}
          </span>
          <Award className="w-5 h-5 text-[#0066CC]" />
        </div>

        <h3 className="text-lg font-bold font-heading text-[#0F172A] mb-1 leading-snug">
          {title}
        </h3>
        <p className="text-xs font-semibold text-[#64748B] mb-4">{issuer}</p>

        <div className="flex items-center gap-4 text-xs text-[#64748B] pb-4 border-b border-[#E2E8F0] mb-4">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#0066CC]" />
            {duration}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#0066CC]" />
            {modules.length} Core Modules
          </span>
        </div>

        <div className="space-y-2 mb-6">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#64748B]">
            Curriculum Highlights
          </p>
          {modules.map((mod, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-[#0F172A]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{mod}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onEnroll}
        className="w-full py-2.5 rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold transition-all shadow-xs"
      >
        <span>Apply for Executive Track</span>
      </button>
    </div>
  );
};

export default CertificationCard;
