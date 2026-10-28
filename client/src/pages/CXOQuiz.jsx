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
    <div className="w-full bg-[#F7F7F4] min-h-screen pb-20">
      <PageHeader
        title="CXO Strategic Assessment"
        subtitle="Evaluate your governance approach across four executive scenarios to benchmark your leadership archetype."
        badge="Executive Evaluation"
        breadcrumbs={[{ label: 'Knowledge Hub', path: '/knowledge-hub' }, { label: 'CXO Assessment' }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {result ? (
          <QuizResult result={result} onRetake={handleRetake} />
        ) : (
          <div className="bg-white p-6 sm:p-12 rounded-3xl shadow-xl border border-[#E2E8F0]">
            
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] mb-2">
                <span className="text-[#D99B26] font-bold uppercase tracking-widest text-[10px]">
                  Scenario {currentIndex + 1} of {questions.length}
                </span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="w-full bg-[#F7F7F4] rounded-full h-2 overflow-hidden border border-[#E2E8F0]">
                <div
                  className="bg-[#D99B26] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <span className="category-subtitle">
                {currentQ.category || 'Strategic Governance'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#111315] tracking-tight mt-3 leading-snug">
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
                        ? 'bg-[#F7F7F4] border-[#D99B26] shadow-md ring-1 ring-[#D99B26]'
                        : 'bg-white border-[#E2E8F0] hover:border-[#D99B26]/50 hover:bg-[#F7F7F4]/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? 'border-[#D99B26] bg-[#D99B26] text-white' : 'border-[#CBD5E1]'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className="text-sm sm:text-base font-medium text-[#111315] leading-relaxed">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#111315] disabled:opacity-30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="btn-charcoal text-xs sm:text-sm py-3 px-8 rounded-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D99B26]" />
                    <span>Evaluating Archetype...</span>
                  </>
                ) : (
                  <>
                    <span>{currentIndex === questions.length - 1 ? 'Reveal Archetype' : 'Next Scenario'}</span>
                    <ArrowRight className="w-4 h-4 text-[#D99B26]" />
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
