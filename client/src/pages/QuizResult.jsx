import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight, RotateCw, CheckCircle, Share2, Sparkles, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/Toast';

const QuizResult = ({ result, onRetake }) => {
  const { addToast } = useToast();
  const archetype = result?.archetype || {
    title: 'The Visionary Strategist',
    tagline: 'Long-term enterprise architect with keen foresight and market positioning instinct.',
    strengths: ['Market forecasting & foresight', 'M&A and strategic alliances', 'Ecosystem capitalization'],
    recommendation: 'Join CXO Connect Strategic Roundtables and Global Market Expansion working groups to spar with peer visionaries.'
  };

  const breakdown = result?.breakdown || {
    'Visionary Strategist': 75,
    'Agile Disruptor': 50,
    'Operational Maestro': 40,
    'Empathetic Leader': 35
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast('Result link copied to clipboard!', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-12 rounded-3xl shadow-2xl border border-[#E2E8F0]">
      
      {/* Header Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111315] text-[#D99B26] text-[10px] font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
          <span>Executive Leadership Archetype</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111315] tracking-tight leading-tight">
          {archetype.title}
        </h2>
        <p className="text-sm sm:text-base text-[#64748B] mt-2 max-w-xl mx-auto leading-relaxed">
          {archetype.tagline}
        </p>
      </div>

      {/* Trait Breakdown Bars */}
      <div className="p-6 rounded-2xl bg-[#F7F7F4] border border-[#E2E8F0] mb-8 space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#D99B26] mb-2">
          Dimension Breakdown
        </h4>
        {Object.entries(breakdown).map(([trait, score]) => (
          <div key={trait} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-[#111315]">
              <span>{trait}</span>
              <span className="text-[#D99B26] font-bold">{score} pts</span>
            </div>
            <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-[#E2E8F0]">
              <div
                className="bg-[#D99B26] h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(15, (score / 100) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Strengths */}
      <div className="mb-8 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-[#D99B26]">
          Core Strategic Capabilities
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {archetype.strengths?.map((str, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#F7F7F4] border border-[#E2E8F0] shadow-sm flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-[#111315] leading-snug">{str}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="p-5 rounded-2xl bg-[#111315] text-white border border-[#111315] mb-8 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#D99B26] flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-[#D99B26] block uppercase tracking-wider text-[11px] mb-1">CXO Connect Recommendation:</strong>
          <p className="text-slate-300 leading-relaxed">{archetype.recommendation}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E2E8F0]">
        <button
          onClick={onRetake}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#111315] transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Retake Assessment</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="p-3 rounded-full border border-[#E2E8F0] hover:bg-[#F7F7F4] text-[#111315] transition-colors"
            title="Share Archetype"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <Link
            to="/events"
            className="flex-1 sm:flex-none btn-charcoal py-3 px-6 rounded-full text-xs font-semibold flex items-center justify-center gap-2"
          >
            <span>Explore Aligned Conclaves</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D99B26]" />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default QuizResult;
