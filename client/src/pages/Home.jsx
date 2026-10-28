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
    <div className="w-full bg-[#F7F7F4]">
      {/* 1. Executive Hero (2-Column Layout) */}
      <Hero />

      {/* 2. Executive Stats Band */}
      <section className="bg-[#111315] text-white py-12 border-y border-[#E2E8F0]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#D99B26] font-heading">2,500+</p>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">C-Suite Leaders</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#D99B26] font-heading">45+</p>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Annual Conclaves</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#D99B26] font-heading">98%</p>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Boardroom Influence</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#D99B26] font-heading">8</p>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Global Chapters</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Strategic Pillars (ChromaGrid) */}
      <section className="py-20 bg-[#F7F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="category-subtitle">
              The CXO Connect Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111315] mt-3 mb-4 tracking-tight font-heading">
              Designed for C-Suite Decision Makers
            </h2>
            <p className="text-[#64748B] text-sm sm:text-base leading-relaxed">
              Through focused peer conversations and curated engagements, leaders exchange practical foresight and forge lasting strategic alliances.
            </p>
          </div>

          <ChromaGrid />
        </div>
      </section>

      {/* 4. Upcoming Conclaves & Summits */}
      <section className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="category-subtitle">
                Curated Engagements
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111315] mt-2 font-heading tracking-tight">
                Upcoming Executive Conclaves
              </h2>
            </div>
            <Link
              to="/events"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#D99B26] hover:text-[#C2871E] transition-colors"
            >
              <span>View All Summits</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((evt) => (
              <div
                key={evt._id}
                className="bg-[#F7F7F4] rounded-2xl border border-[#E2E8F0] hover:border-[#D99B26]/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-200">
                    <img
                      src={evt.banner}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#111315]/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                      {evt.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#D99B26] mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>

                    <h3 className="text-lg font-bold text-[#111315] mb-2 font-heading leading-snug">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-[#64748B] line-clamp-3 mb-4 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <MapPin className="w-3.5 h-3.5 text-[#D99B26]" />
                      <span>{evt.venue}, {evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#E2E8F0] mt-auto flex items-center justify-between pt-4">
                  <span className="text-xs text-[#64748B] font-medium">
                    {evt.attendees?.length || 0} Registered Leaders
                  </span>
                  <Link
                    to={`/events?highlight=${evt._id}`}
                    className="btn-charcoal text-xs py-2 px-4 rounded-full"
                  >
                    <span>Reserve Seat</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D99B26]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive Dome Gallery */}
      <section className="py-20 bg-[#111315] text-white border-t border-[#E2E8F0]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <span className="category-subtitle">
            Executive Retrospectives
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 mb-4 font-heading tracking-tight">
            Moments from Closed-Door Summits
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Explore moments of closed-door strategic dialogue and peer exchanges across our premier global venues.
          </p>
        </div>

        <DomeGallery />
      </section>

      {/* 6. C-Suite Mentors Preview */}
      <section className="py-20 bg-[#F7F7F4] border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="category-subtitle">
                Boardroom Faculty
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111315] mt-2 font-heading tracking-tight">
                Learn from Proven Leaders
              </h2>
            </div>
            <Link
              to="/mentors"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#D99B26] hover:text-[#C2871E] transition-colors"
            >
              <span>View Full Faculty</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <MentorCards mentors={mentors} />
        </div>
      </section>

      {/* 7. Call To Action Banner (StarBorder) */}
      <section className="py-16 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <StarBorder>
            <div className="text-center max-w-2xl mx-auto space-y-5">
              <span className="category-subtitle">
                By Invitation & Application Only
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight font-heading tracking-tight">
                Step Into the Room Where Decisions Happen
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Connect directly with peer CEOs, CFOs, CTOs, and Founders. Elevate your strategic perspective through peer advisory and collaborative executive power.
              </p>
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={isAuthenticated ? "/profile" : "/membership"}
                  className="btn-ochre px-8 py-3.5 text-sm font-bold"
                >
                  Request an Invitation
                </Link>
                <Link
                  to="/quiz"
                  className="btn-outline-executive px-8 py-3.5 text-sm font-bold text-white border-white/20 hover:border-[#D99B26] hover:text-[#D99B26]"
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
