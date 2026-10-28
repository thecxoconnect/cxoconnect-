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
    <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-200">
      
      {/* Header Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Executive Leadership Archetype</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
          {archetype.title}
        </h2>
        <p className="text-base text-slate-600 mt-2 max-w-xl mx-auto leading-relaxed">
          {archetype.tagline}
        </p>
      </div>

      {/* Trait Breakdown Bars */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 mb-8 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Dimension Breakdown
        </h4>
        {Object.entries(breakdown).map(([trait, score]) => (
          <div key={trait} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>{trait}</span>
              <span className="text-blue-600">{score} pts</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(15, (score / 100) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Strengths */}
      <div className="mb-8 space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Core Strategic Capabilities
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {archetype.strengths?.map((str, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-slate-800 leading-snug">{str}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 mb-8 text-xs sm:text-sm text-blue-950 leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">CXO Connect Recommendation:</strong>
          <p className="mt-0.5 text-blue-900">{archetype.recommendation}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
        <button
          onClick={onRetake}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Retake Assessment</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="p-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title="Share Archetype"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <Link
            to="/events"
            className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <span>Explore Aligned Conclaves</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default QuizResult;
