import React from 'react';
import './ChromaGrid.css';
import { Network, Target, Briefcase, Award } from 'lucide-react';

const defaultPillars = [
  {
    icon: <Network className="w-8 h-8 text-blue-600" />,
    title: 'Closed-Door Peer Advisory',
    description: 'Connect with seasoned C-Suite peers in confidential Chatham House Rule forums to solve high-stakes challenges.'
  },
  {
    icon: <Target className="w-8 h-8 text-blue-600" />,
    title: 'Cross-Industry Intelligence',
    description: 'Gain unfiltered strategic insights from leaders outside your sector, uncovering cross-market opportunities.'
  },
  {
    icon: <Briefcase className="w-8 h-8 text-blue-600" />,
    title: 'Executive Masterclasses',
    description: 'High-level sessions led by industry titans on macroeconomic strategy, sovereign AI, and balance sheet resilience.'
  },
  {
    icon: <Award className="w-8 h-8 text-blue-600" />,
    title: 'Boardroom Representation',
    description: 'Exclusive placement pathways for executive leadership roles, independent directorships, and advisory councils.'
  }
];

const ChromaGrid = ({ items = defaultPillars }) => {
  return (
    <div className="chroma-grid">
      {items.map((item, idx) => (
        <div key={idx} className="chroma-card">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
            {item.icon}
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">
            {item.title}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ChromaGrid;
