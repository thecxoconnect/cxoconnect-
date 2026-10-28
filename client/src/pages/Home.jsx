import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ChromaGrid from '../components/ChromaGrid';
import DomeGallery from '../components/DomeGallery';
import MentorCards from '../components/MentorCards';
import StarBorder from '../components/StarBorder';
import { eventService, mentorService } from '../services/api';
import { Calendar, MapPin, ArrowRight, Users, ShieldCheck, Globe, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, mentorsRes] = await Promise.all([
          eventService.getEvents(),
          mentorService.getMentors()
        ]);
        if (eventsRes.data.success) setEvents(eventsRes.data.data.slice(0, 3));
        if (mentorsRes.data.success) setMentors(mentorsRes.data.data.slice(0, 4));
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full">
      {/* 1. Hero Section (Strictly matching user screenshot layout) */}
      <Hero />

      {/* 2. Executive Metrics Band */}
      <section className="bg-slate-900 text-white py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-serif font-extrabold text-blue-400">2,500+</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">C-Suite Leaders</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-serif font-extrabold text-blue-400">45+</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Annual Conclaves</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-serif font-extrabold text-blue-400">98%</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Boardroom Influence</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-serif font-extrabold text-blue-400">8</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Global Chapters</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Strategic Pillars (ChromaGrid) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
              The CXO Connect Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 mb-4">
              Designed for C-Suite Decision Makers
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Through focused peer conversations and curated engagements, leaders exchange practical foresight and forge lasting strategic alliances.
            </p>
          </div>

          <ChromaGrid />
        </div>
      </section>

      {/* 4. Upcoming Conclaves & Summits */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/70 px-3 py-1 rounded-full">
                Curated Engagements
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-3">
                Upcoming Executive Conclaves
              </h2>
            </div>
            <Link
              to="/events"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>View All Summits</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((evt) => (
              <div key={evt._id} className="premium-card flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-200">
                    <img
                      src={evt.banner}
                      alt={evt.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold uppercase tracking-wider">
                      {evt.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>

                    <h3 className="text-xl font-bold font-serif text-slate-900 mb-2 leading-snug">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.venue}, {evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-auto flex items-center justify-between pt-4">
                  <span className="text-xs text-slate-500 font-medium">
                    {evt.attendees?.length || 0} Registered Leaders
                  </span>
                  <Link
                    to={`/events?highlight=${evt._id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
                  >
                    <span>Reserve Seat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive Dome Gallery */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20">
            Executive Retrospectives
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mt-4 mb-4">
            Highlights from Recent Conclaves
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            Explore moments of closed-door strategic dialogue and peer exchanges across our premier global venues.
          </p>
        </div>

        <DomeGallery />
      </section>

      {/* 6. C-Suite Mentors Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Boardroom Mentors
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-3">
                Learn from Industry Titans
              </h2>
            </div>
            <Link
              to="/about#mentors"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>View Full Faculty</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <MentorCards mentors={mentors} />
        </div>
      </section>

      {/* 7. Call To Action Banner (StarBorder) */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <StarBorder>
            <div className="text-center max-w-2xl mx-auto space-y-5">
              <span className="inline-block px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest">
                By Invitation & Application Only
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                Step Into the Room Where Decisions Happen
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Connect directly with peer CEOs, CFOs, CTOs, and Founders. Elevate your strategic perspective through peer advisory and collaborative executive power.
              </p>
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={isAuthenticated ? "/profile" : "/membership"}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30"
                >
                  Apply for CXO Membership
                </Link>
                <Link
                  to="/quiz"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700"
                >
                  Take Leadership Assessment
                </Link>
              </div>
            </div>
          </StarBorder>
        </div>
      </section>
    </div>
  );
};

export default Home;
