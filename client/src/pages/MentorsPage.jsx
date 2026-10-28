import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import MentorCards from '../components/MentorCards';
import { mentorService } from '../services/api';
import { Users, Award, Sparkles } from 'lucide-react';

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await mentorService.getMentors();
        if (res.data.success) {
          setMentors(res.data.data);
        }
      } catch (err) {
        console.error('Mentors load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  return (
    <div className="w-full bg-[#F7F7F4] min-h-screen pb-20">
      <PageHeader
        title="C-Suite Mentors & Advisory Faculty"
        subtitle="Book confidential one-on-one strategic consultations with accomplished CEOs, MDs, and Board Directors."
        badge="Executive Advisory Faculty"
        breadcrumbs={[{ label: 'C-Suite Mentors' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="category-subtitle">
            One-on-One Consultations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111315] mt-3 mb-4 tracking-tight">
            Learn from Proven Enterprise Leaders
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            Connect directly with verified C-Suite faculty members for targeted guidance on capital allocation, AI integration, and boardroom succession.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#64748B]">Loading mentors directory...</div>
        ) : (
          <MentorCards mentors={mentors} />
        )}
      </div>
    </div>
  );
};

export default MentorsPage;
