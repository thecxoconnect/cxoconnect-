import React from 'react';
import { Award, BookOpen, Clock, CheckCircle } from 'lucide-react';

const CertificationCard = ({ title, issuer, duration, level, modules = [], onEnroll }) => {
  return (
    <div className="premium-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
            {level}
          </span>
          <Award className="w-5 h-5 text-blue-600" />
        </div>

        <h3 className="text-xl font-serif font-bold text-slate-900 mb-1 leading-snug">
          {title}
        </h3>
        <p className="text-xs font-semibold text-slate-500 mb-4">{issuer}</p>

        <div className="flex items-center gap-4 text-xs text-slate-600 pb-4 border-b border-slate-100 mb-4">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {duration}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            {modules.length} Core Modules
          </span>
        </div>

        <div className="space-y-2 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Curriculum Highlights
          </p>
          {modules.map((mod, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{mod}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onEnroll}
        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
      >
        <span>Enroll in Executive Track</span>
      </button>
    </div>
  );
};

export default CertificationCard;
