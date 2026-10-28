import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { quizService } from '../services/api';
import { defaultQuizQuestions } from './QuizData';
import QuizResult from './QuizResult';
import { useToast } from '../components/Toast';
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

const CXOQuiz = () => {
  const { addToast } = useToast();
  const [questions, setQuestions] = useState(defaultQuizQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionIndex]: { trait, points } }
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await quizService.getQuestions();
        if (res.data.success && res.data.data.length > 0) {
          setQuestions(res.data.data);
        }
      } catch (err) {
        console.warn('Using default quiz questions:', err.message);
      }
    };
    fetchQuestions();
  }, []);

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectOption = (opt) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        selectedTrait: opt.trait,
        points: opt.points || 25,
        text: opt.text
      }
    }));
  };

  const handleNext = () => {
    if (!selectedAnswers[currentIndex]) {
      addToast('Please select your preferred executive strategic approach.', 'warning');
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const answersPayload = Object.values(selectedAnswers);
    try {
      setSubmitting(true);
      const res = await quizService.submitQuiz(answersPayload);
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      addToast('Failed to evaluate assessment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setResult(null);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">
      <PageHeader
        title="CXO Decision-Making Assessment"
        subtitle="Evaluate your strategic governance approach across 4 executive scenarios to reveal your leadership archetype."
        badge="Executive Evaluation"
        breadcrumbs={[{ label: 'Knowledge Hub', path: '/knowledge-hub' }, { label: 'CXO Quiz' }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {result ? (
          <QuizResult result={result} onRetake={handleRetake} />
        ) : (
          <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-200">
            
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span className="text-blue-600 font-bold uppercase tracking-wider">
                  Scenario {currentIndex + 1} of {questions.length}
                </span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                {currentQ.category || 'Strategic Leadership'}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-3 leading-snug">
                {currentQ.questionText}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-10">
              {currentQ.options?.map((opt, idx) => {
                const isSelected = selectedAnswers[currentIndex]?.selectedTrait === opt.trait && selectedAnswers[currentIndex]?.text === opt.text;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-md transform -translate-y-0.5'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="px-8 py-3 rounded-full bg-[#0d1527] hover:bg-[#1a2642] text-white font-semibold text-sm transition-all shadow-lg shadow-slate-950/20 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Leadership Profile...</span>
                  </>
                ) : (
                  <>
                    <span>{currentIndex === questions.length - 1 ? 'Reveal Archetype' : 'Next Scenario'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CXOQuiz;
