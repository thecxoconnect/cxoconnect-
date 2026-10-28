import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { eventService, commentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Calendar, MapPin, Users, MessageSquare, ThumbsUp, Send, CheckCircle, Clock } from 'lucide-react';

const categories = ['All', 'Leadership Summit', 'C-Suite Roundtable', 'Executive Masterclass'];

const Events = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'All');
  const [loading, setLoading] = useState(true);

  // Discussion state
  const [selectedEventForDiscussion, setSelectedEventForDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [activeCategory]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params = activeCategory !== 'All' ? { category: activeCategory } : {};
      const res = await eventService.getEvents(params);
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId) => {
    if (!isAuthenticated) {
      addToast('Please login to reserve a seat at this executive conclave.', 'warning');
      return;
    }

    try {
      const res = await eventService.rsvpEvent(eventId);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setEvents((prev) =>
          prev.map((e) => {
            if (e._id === eventId) {
              const attendees = [...(e.attendees || [])];
              if (res.data.isRegistered) {
                attendees.push({ _id: user._id, name: user.name, position: user.position });
              } else {
                return {
                  ...e,
                  attendees: attendees.filter((a) => (a._id || a) !== user._id)
                };
              }
              return { ...e, attendees };
            }
            return e;
          })
        );
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update RSVP.', 'error');
    }
  };

  const openDiscussion = async (evt) => {
    setSelectedEventForDiscussion(evt);
    try {
      const res = await commentService.getComments({ eventId: evt._id });
      if (res.data.success) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.error('Comments fetch error:', err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please login to contribute to executive discussions.', 'warning');
      return;
    }
    if (!newComment.trim()) return;

    try {
      setPostingComment(true);
      const res = await commentService.createComment({
        content: newComment,
        eventId: selectedEventForDiscussion?._id
      });
      if (res.data.success) {
        setComments((prev) => [res.data.data, ...prev]);
        setNewComment('');
        addToast('Insight shared with executive attendees.', 'success');
      }
    } catch (err) {
      addToast('Failed to post comment.', 'error');
    } finally {
      setPostingComment(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!isAuthenticated) {
      addToast('Please login to endorse.', 'info');
      return;
    }
    try {
      const res = await commentService.likeComment(commentId);
      if (res.data.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, likes: res.data.likes } : c))
        );
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  return (
    <div className="w-full bg-[#F7F7F4] min-h-screen pb-20">
      <PageHeader
        title="Executive Conclaves & Summits"
        subtitle="Exclusive national conclaves, high-level C-Suite roundtables, and masterclasses convening senior decision makers."
        badge="Curated Engagements"
        breadcrumbs={[{ label: 'Conclaves' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                activeCategory === cat
                  ? 'bg-[#111315] text-[#D99B26] shadow-md'
                  : 'bg-white text-[#64748B] hover:text-[#111315] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {events.map((evt) => {
            const isUserRegistered = evt.attendees?.some(
              (a) => (a._id || a) === user?._id
            );

            return (
              <div key={evt._id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#D99B26]/50 transition-all flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-200">
                    <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#111315]/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                      {evt.category}
                    </span>
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#D99B26] text-white text-[10px] font-bold uppercase tracking-wider">
                      {evt.status}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#D99B26] mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{evt.date}</span>
                      <span className="text-slate-300">•</span>
                      <Clock className="w-4 h-4 text-[#64748B]" />
                      <span className="text-[#64748B]">{evt.time}</span>
                    </div>

                    <h3 className="text-lg font-bold text-[#111315] mb-2 font-heading leading-snug">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-[#64748B] line-clamp-3 mb-4 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-[#64748B] mb-4 pb-4 border-b border-[#E2E8F0]">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-[#D99B26] flex-shrink-0 mt-0.5" />
                        <span>{evt.venue}, {evt.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                        <span>{evt.attendees?.length || 0} Registered Executives</span>
                      </div>
                    </div>

                    {/* Speakers Preview */}
                    {evt.speakers?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#64748B] mb-2">
                          Keynote Faculty
                        </p>
                        <div className="space-y-1.5">
                          {evt.speakers.map((spk, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <img src={spk.image} alt={spk.name} className="w-6 h-6 rounded-full object-cover" />
                              <span className="text-xs font-bold text-[#111315]">{spk.name}</span>
                              <span className="text-[11px] text-[#64748B]">({spk.company})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#E2E8F0] flex items-center justify-between gap-3 pt-4">
                  <button
                    onClick={() => openDiscussion(evt)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#F7F7F4] text-[#111315] hover:bg-slate-200 text-xs font-semibold transition-colors border border-[#E2E8F0]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Discussions</span>
                  </button>

                  <button
                    onClick={() => handleRSVP(evt._id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                      isUserRegistered
                        ? 'bg-emerald-600 text-white'
                        : 'btn-charcoal'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#D99B26]" />
                    <span>{isUserRegistered ? 'Seat Confirmed' : 'Reserve Seat'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Discussion Forum Modal */}
        {selectedEventForDiscussion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] flex flex-col max-h-[85vh]">
              <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <span className="category-subtitle">
                    Executive Dialogue
                  </span>
                  <h3 className="text-xl font-bold font-heading text-[#111315] mt-1">
                    {selectedEventForDiscussion.title}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Peer discussions & pre-conclave strategic insights
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEventForDiscussion(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-[#F7F7F4]"
                >
                  ✕
                </button>
              </div>

              {/* Comments Feed */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-[#64748B] text-xs">
                    No discussions yet. Be the first executive to post an insight for this conclave!
                  </div>
                ) : (
                  comments.map((cmt) => (
                    <div key={cmt._id} className="p-4 rounded-xl bg-[#F7F7F4] border border-[#E2E8F0] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {cmt.authorImage ? (
                            <img src={cmt.authorImage} alt={cmt.authorName} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D99B26] font-bold text-xs flex items-center justify-center">
                              {cmt.authorName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-[#111315]">{cmt.authorName}</p>
                            <p className="text-[11px] text-[#64748B]">{cmt.authorPosition} {cmt.authorCompany && `• ${cmt.authorCompany}`}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleLike(cmt._id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-[#111315] hover:text-[#D99B26]"
                        >
                          <ThumbsUp className="w-3 h-3 text-[#D99B26]" />
                          <span>{cmt.likes || 0}</span>
                        </button>
                      </div>
                      <p className="text-xs text-[#111315] leading-relaxed pl-10">
                        {cmt.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Post Insight Form */}
              <form onSubmit={handlePostComment} className="pt-4 border-t border-[#E2E8F0] flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isAuthenticated ? "Contribute an executive question or strategic perspective..." : "Please login to join the discussion"}
                  disabled={!isAuthenticated || postingComment}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                />
                <button
                  type="submit"
                  disabled={!isAuthenticated || postingComment || !newComment.trim()}
                  className="btn-charcoal text-xs py-2.5 px-5 rounded-xl disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>{postingComment ? 'Posting...' : 'Share'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
