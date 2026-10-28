import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import MentorCards from '../components/MentorCards';
import { committeeService, mentorService, chapterService } from '../services/api';
import { Shield, Target, Compass, Award, Linkedin, Mail, MapPin, Users } from 'lucide-react';

const About = () => {
  const [committee, setCommittee] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [commRes, mentRes, chapRes] = await Promise.all([
          committeeService.getCommittee(),
          mentorService.getMentors(),
          chapterService.getChapters()
        ]);
        if (commRes.data.success) setCommittee(commRes.data.data);
        if (mentRes.data.success) setMentors(mentRes.data.data);
        if (chapRes.data.success) setChapters(chapRes.data.data);
      } catch (err) {
        console.error('About data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="w-full">
      <PageHeader
        title="About CXO Connect"
        subtitle="Empowering top-tier C-Suite executives, Founders, and VPs with high-trust peer advisory, strategic foresight, and boardroom governance."
        badge="Enterprise Leadership Ecosystem"
        breadcrumbs={[{ label: 'About Us' }]}
      />

      {/* Mission & Purpose */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Our Foundation
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-4 mb-6 leading-tight">
                Where Visionary Executives Forge Tomorrow's Enterprise Realities
              </h2>
              <div className="space-y-4 text-slate-600 text-base leading-relaxed">
                <p>
                  CXO Connect was established to solve an undeniable modern leadership dilemma: the higher one rises in corporate governance, the more isolated executive decision-making becomes.
                </p>
                <p>
                  We provide a confidential, high-caliber environment strictly reserved for senior decision-makers—CEOs, CTOs, CFOs, CMOs, CHROs, and Founders. Here, leaders discard corporate posturing to dissect complex market shocks, AI disruptions, capital allocation, and talent governance.
                </p>
                <p>
                  Every member is vetted for authentic executive credentials, ensuring discussions maintain unmatched depth and relevance.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Chatham House Rule</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Strictly confidential discussions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Vetted Pedigree</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Peer-reviewed executive membership.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&q=80"
                  alt="Executive Boardroom Session"
                  className="w-full h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                    Core Mandate
                  </span>
                  <p className="text-lg font-serif font-bold text-white mt-1">
                    "Uniting leadership wisdom to steer resilient, human-centered enterprises."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory Board & Executive Committee */}
      <section id="committee" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/70 px-3 py-1 rounded-full">
              Governance & Stewardship
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-4 mb-4">
              Advisory Board & Executive Committee
            </h2>
            <p className="text-slate-600 text-base">
              Distinguished corporate titans and board chairpersons guiding the strategic roadmap of CXO Connect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {committee.map((member) => (
              <div key={member._id} className="premium-card p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/30 mb-4 shadow-md">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 mb-2">
                  {member.category}
                </span>
                <h3 className="text-lg font-bold font-serif text-slate-900 leading-tight">{member.name}</h3>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">{member.designation}</p>
                <p className="text-xs text-slate-500 mt-0.5">{member.company}</p>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* C-Suite Mentors */}
      <section id="mentors" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              One-on-One Advisory
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-4 mb-4">
              C-Suite Faculty & Mentors
            </h2>
            <p className="text-slate-600 text-base">
              Connect 1-on-1 with accomplished leaders for focused strategic consultation on growth, governance, and technology pivots.
            </p>
          </div>

          <MentorCards mentors={mentors} />
        </div>
      </section>

      {/* Regional Chapters */}
      <section id="chapters" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20">
              Global Presence
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-4 mb-4">
              Regional Executive Chapters
            </h2>
            <p className="text-slate-400 text-base">
              Active metropolitan leadership councils organizing quarterly summits and confidential dinners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chap) => (
              <div
                key={chap._id}
                className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-800/50 p-6 flex flex-col justify-between hover:border-blue-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <h3 className="text-xl font-bold font-serif text-white">{chap.city}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{chap.country}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p><strong className="text-slate-200">Chapter Lead:</strong> {chap.leadName}</p>
                    <p><strong className="text-slate-200">Secretariat:</strong> {chap.leadEmail}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
                    <Users className="w-4 h-4" />
                    <span>{chap.activeMembersCount}+ Executives</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
