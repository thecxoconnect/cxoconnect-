import React, { useState } from 'react';
import { Calendar, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { mentorService } from '../services/api';

const MentorCards = ({ mentors = [] }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [topic, setTopic] = useState('Strategic Leadership & Growth');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestSession = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please login to request an executive advisory session.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await mentorService.requestMentorship({
        mentorId: selectedMentor._id,
        topic,
        notes
      });
      if (res.data.success) {
        addToast(res.data.message || 'Advisory session request submitted successfully.', 'success');
        setSelectedMentor(null);
        setNotes('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit advisory session request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mentors.map((mentor) => (
          <div
            key={mentor._id || mentor.name}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#D99B26]/50 transition-all flex flex-col justify-between overflow-hidden group"
          >
            <div>
              <div className="relative h-64 overflow-hidden bg-slate-100">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1622]/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h4 className="text-lg font-bold font-heading leading-tight">{mentor.name}</h4>
                  <p className="text-xs text-[#D99B26] font-bold bg-[#111315]/90 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-[#D99B26]/30">
                    {mentor.designation}
                  </p>
                  <p className="text-xs text-slate-300 truncate mt-0.5">{mentor.company}</p>
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed mb-4">
                  {mentor.bio}
                </p>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.expertise?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#F7F7F4] text-[#111315] text-[10px] font-semibold border border-[#E2E8F0]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-[#E2E8F0] mt-auto flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Available</span>
              </span>
              <button
                onClick={() => setSelectedMentor(mentor)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111315] hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm border border-slate-700"
              >
                <Calendar className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Book 1-on-1</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Advisory Request Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <div>
                <span className="category-subtitle">
                  Executive Consultation
                </span>
                <h3 className="text-xl font-bold text-[#111315] font-heading mt-1">
                  Request 1-on-1 Session
                </h3>
                <p className="text-xs text-[#64748B]">
                  With {selectedMentor.name} • {selectedMentor.designation}, {selectedMentor.company}
                </p>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-[#F7F7F4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                  Consultation Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                >
                  <option value="Strategic Leadership & Growth">Strategic Leadership & Growth</option>
                  <option value="Enterprise AI & Disruption">Enterprise AI & Disruption</option>
                  <option value="M&A and Capital Allocation">M&A and Capital Allocation</option>
                  <option value="Boardroom Governance & Directorships">Boardroom Governance & Directorships</option>
                  <option value="Executive Succession Planning">Executive Succession Planning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                  Strategic Brief / Goals
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Outline key strategic questions or business context for this consultation..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#64748B] hover:bg-[#F7F7F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-full bg-[#111315] hover:bg-slate-800 text-white shadow-sm transition-all border border-slate-700"
                >
                  {submitting ? 'Submitting...' : 'Confirm Advisory Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorCards;
