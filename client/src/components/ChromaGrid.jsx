import React from 'react';
import './ChromaGrid.css';
import { Network, Target, Briefcase, Award } from 'lucide-react';

const defaultPillars = [
  {
    icon: <Network className="w-6 h-6 text-[#D99B26]" />,
    number: '01',
    title: 'Closed-Door Peer Advisory',
    description: 'Connect with seasoned C-Suite peers in confidential Chatham House Rule forums to solve high-stakes challenges.'
  },
  {
    icon: <Target className="w-6 h-6 text-[#D99B26]" />,
    number: '02',
    title: 'Cross-Industry Intelligence',
    description: 'Gain unfiltered strategic insights from leaders outside your sector, uncovering cross-market opportunities.'
  },
  {
    icon: <Briefcase className="w-6 h-6 text-[#D99B26]" />,
    number: '03',
    title: 'Executive Masterclasses',
    description: 'High-level sessions led by industry titans on macroeconomic strategy, sovereign AI, and balance sheet resilience.'
  },
  {
    icon: <Award className="w-6 h-6 text-[#D99B26]" />,
    number: '04',
    title: 'Boardroom Representation',
    description: 'Exclusive placement pathways for executive leadership roles, independent directorships, and advisory councils.'
  }
];

const ChromaGrid = ({ items = defaultPillars }) => {
  return (
    <div className="chroma-grid">
      {items.map((item, idx) => (
        <div key={idx} className="chroma-card group">
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#D99B26]/40 transition-colors">
              {item.icon}
            </div>
            <span className="text-xs font-mono font-bold text-[#D99B26]/60">
              {item.number}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 font-heading tracking-tight">
            {item.title}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ChromaGrid;
