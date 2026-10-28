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
        // Update local state
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
    <div className="w-full">
      <PageHeader
        title="Executive Conclaves & Summits"
        subtitle="Exclusive national conclaves, high-level C-Suite roundtables, and masterclasses convening senior decision makers."
        badge="Curated Engagements"
        breadcrumbs={[{ label: 'Events' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
              <div key={evt._id} className="premium-card flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-200">
                    <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold uppercase tracking-wider">
                      {evt.category}
                    </span>
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-semibold uppercase tracking-wider">
                      {evt.status}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{evt.date}</span>
                      <span className="text-slate-400">•</span>
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{evt.time}</span>
                    </div>

                    <h3 className="text-xl font-bold font-serif text-slate-900 mb-2 leading-snug">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{evt.venue}, {evt.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{evt.attendees?.length || 0} Registered Executives</span>
                      </div>
                    </div>

                    {/* Speakers Preview */}
                    {evt.speakers?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                          Keynote Faculty
                        </p>
                        <div className="space-y-1.5">
                          {evt.speakers.map((spk, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <img src={spk.image} alt={spk.name} className="w-6 h-6 rounded-full object-cover" />
                              <span className="text-xs font-semibold text-slate-800">{spk.name}</span>
                              <span className="text-[11px] text-slate-400">({spk.company})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 pt-4">
                  <button
                    onClick={() => openDiscussion(evt)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span>Discussions</span>
                  </button>

                  <button
                    onClick={() => handleRSVP(evt._id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                      isUserRegistered
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isUserRegistered ? 'Seat Confirmed' : 'Reserve Seat'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Discussion Forum Modal */}
        {selectedEventForDiscussion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Executive Dialogue
                  </span>
                  <h3 className="text-xl font-bold font-serif text-slate-900 mt-1">
                    {selectedEventForDiscussion.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Peer discussions & pre-conclave strategic insights
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEventForDiscussion(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Comments Feed */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No discussions yet. Be the first executive to post an insight for this conclave!
                  </div>
                ) : (
                  comments.map((cmt) => (
                    <div key={cmt._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {cmt.authorImage ? (
                            <img src={cmt.authorImage} alt={cmt.authorName} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                              {cmt.authorName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900">{cmt.authorName}</p>
                            <p className="text-[11px] text-slate-500">{cmt.authorPosition} {cmt.authorCompany && `• ${cmt.authorCompany}`}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleLike(cmt._id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{cmt.likes || 0}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pl-10">
                        {cmt.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Post Insight Form */}
              <form onSubmit={handlePostComment} className="pt-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isAuthenticated ? "Contribute an executive question or strategic perspective..." : "Please login to join the discussion"}
                  disabled={!isAuthenticated || postingComment}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!isAuthenticated || postingComment || !newComment.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md shadow-blue-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
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
