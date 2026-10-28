import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import MentorCards from '../components/MentorCards';
import { committeeService, mentorService, chapterService } from '../services/api';
import { Shield, Target, Award, ArrowRight, MapPin, Users, RefreshCw } from 'lucide-react';

const About = () => {
  const [committee, setCommittee] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [commRes, mentRes, chapRes] = await Promise.all([
          committeeService.getCommittee().catch(() => ({ data: { success: false, data: [] } })),
          mentorService.getMentors().catch(() => ({ data: { success: false, data: [] } })),
          chapterService.getChapters().catch(() => ({ data: { success: false, data: [] } }))
        ]);
        if (commRes.data?.success) setCommittee(commRes.data.data.slice(0, 4));
        if (mentRes.data?.success) setMentors(mentRes.data.data.slice(0, 4));
        if (chapRes.data?.success) setChapters(chapRes.data.data);
      } catch (err) {
        console.error('About data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="w-full bg-[#F7F7F4]">
      <PageHeader
        title="About CXO Connect"
        subtitle="Empowering top-tier C-Suite executives, Founders, and VPs with high-trust peer advisory, strategic foresight, and boardroom governance."
        badge="Enterprise Leadership Ecosystem"
        breadcrumbs={[{ label: 'About Us' }]}
      />

      {/* Mission & Purpose */}
      <section className="py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="category-subtitle">
                Our Foundation
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-3 mb-6 leading-tight font-heading tracking-tight">
                Where Visionary Executives Forge Tomorrow's Enterprise Realities
              </h2>
              <div className="space-y-4 text-[#64748B] text-sm sm:text-base leading-relaxed">
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

              <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-[#E2E8F0]">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#EBF5FF] border border-[#BFDBFE] text-[#0066CC]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">Chatham House Rule</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">Strictly confidential discussions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#EBF5FF] border border-[#BFDBFE] text-[#0066CC]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">Vetted Pedigree</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">Peer-reviewed executive membership.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#E2E8F0]">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&q=80"
                  alt="Executive Boardroom Session"
                  className="w-full h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1527]/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-xs font-bold text-[#0066CC] uppercase tracking-widest bg-white/90 px-2.5 py-0.5 rounded-full inline-block">
                    Core Mandate
                  </span>
                  <p className="text-lg font-bold text-white mt-2 font-heading">
                    "Uniting leadership wisdom to steer resilient, human-centered enterprises."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory Board Preview Section */}
      <section className="py-20 bg-[#F7F7F4] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="category-subtitle">
                Governance & Stewardship
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-2 font-heading tracking-tight">
                Advisory Board & Executive Committee
              </h2>
            </div>
            <Link
              to="/committee"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0066CC] hover:text-[#0052A3] transition-colors"
            >
              <span>View All Advisory Leaders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#64748B]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0066CC] mb-2" />
              <p className="text-xs">Loading leadership committee from MongoDB...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {committee.map((member) => (
                <div key={member._id} className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col items-center text-center hover:shadow-md transition-all">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#0066CC] p-0.5 mb-4 shadow-xs">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBF5FF] text-[#0066CC] border border-[#BFDBFE] mb-2">
                    {member.category}
                  </span>
                  <h3 className="text-base font-bold text-[#0F172A] leading-tight">{member.name}</h3>
                  <p className="text-xs font-semibold text-[#0066CC] mt-0.5">{member.designation}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{member.company}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* C-Suite Mentors Preview Section */}
      <section className="py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="category-subtitle">
                Boardroom Faculty
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-2 font-heading tracking-tight">
                One-on-One C-Suite Mentors
              </h2>
            </div>
            <Link
              to="/mentors"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0066CC] hover:text-[#0052A3] transition-colors"
            >
              <span>Explore All Mentors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <MentorCards mentors={mentors} />
        </div>
      </section>

      {/* Regional Chapters */}
      <section className="py-20 bg-[#0d1527] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="category-subtitle">
              Global Footprint
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-4 font-heading tracking-tight">
              Regional Executive Chapters
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Active metropolitan leadership councils organizing quarterly summits and confidential dinners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chap) => (
              <div
                key={chap._id}
                className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 p-6 flex flex-col justify-between hover:border-[#0066CC]/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#0066CC]" />
                      <h3 className="text-lg font-bold text-white font-heading">{chap.city}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{chap.country}</span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <p><strong className="text-white">Chapter Lead:</strong> {chap.leadName}</p>
                    <p><strong className="text-white">Secretariat:</strong> {chap.leadEmail}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#0066CC] font-semibold">
                    <Users className="w-4 h-4" />
                    <span>{chap.activeMembersCount}+ Executives</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Active</span>
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
