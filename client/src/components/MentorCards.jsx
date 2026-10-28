import React, { useState } from 'react';
import { Calendar, CheckCircle2, Linkedin, UserCheck, X } from 'lucide-react';
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
        addToast(res.data.message, 'success');
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
            className="premium-card flex flex-col justify-between overflow-hidden group"
          >
            <div>
              <div className="relative h-64 overflow-hidden bg-slate-100">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h4 className="text-lg font-bold font-serif leading-tight">{mentor.name}</h4>
                  <p className="text-xs text-blue-300 font-medium">{mentor.designation}</p>
                  <p className="text-xs text-slate-300 truncate">{mentor.company}</p>
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {mentor.bio}
                </p>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.expertise?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-0 border-t border-slate-100 mt-auto flex items-center justify-between pt-3">
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Available</span>
              </span>
              <button
                onClick={() => setSelectedMentor(mentor)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book 1-on-1</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Advisory Request Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Request Advisory Consultation
                </h3>
                <p className="text-xs text-slate-500">
                  With {selectedMentor.name} • {selectedMentor.designation}, {selectedMentor.company}
                </p>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Consultation Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Strategic Leadership & Growth">Strategic Leadership & Growth</option>
                  <option value="Enterprise AI & Disruption">Enterprise AI & Disruption</option>
                  <option value="M&A and Capital Allocation">M&A and Capital Allocation</option>
                  <option value="Boardroom Governance & Culture">Boardroom Governance & Culture</option>
                  <option value="Executive Succession Planning">Executive Succession Planning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Executive Brief / Objectives
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Outline key strategic questions or business context you'd like to consult on..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
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
