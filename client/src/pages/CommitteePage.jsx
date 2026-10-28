import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { committeeService } from '../services/api';
import { ShieldCheck, Award, Linkedin, ExternalLink } from 'lucide-react';

const CommitteePage = () => {
  const [committee, setCommittee] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommittee = async () => {
      try {
        const res = await committeeService.getCommittee();
        if (res.data.success) {
          setCommittee(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load committee:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommittee();
  }, []);

  return (
    <div className="w-full bg-[#F7F7F4] min-h-screen pb-20">
      <PageHeader
        title="Advisory Board & Executive Committee"
        subtitle="Distinguished corporate titans and board chairpersons guiding the strategic governance and vision of CXO Connect."
        badge="Platform Governance"
        breadcrumbs={[{ label: 'Advisory Board' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="category-subtitle">
            Boardroom Governance
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111315] mt-3 mb-4 tracking-tight">
            Guiding Principles & Stewardship
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            Our advisory leaders ensure CXO Connect maintains the highest standard of confidential peer exchange and enterprise insight.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#64748B]">Loading advisory board...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {committee.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#D99B26]/50 transition-all flex flex-col items-center text-center justify-between"
              >
                <div>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#D99B26] p-0.5 mb-4 shadow-sm">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F7F7F4] text-[#D99B26] border border-[#E2E8F0] mb-2">
                    {member.category}
                  </span>

                  <h3 className="text-lg font-bold text-[#111315] leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#D99B26] mt-0.5">{member.designation}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{member.company}</p>

                  <p className="text-xs text-[#64748B] mt-3 leading-relaxed line-clamp-3">
                    {member.bio}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2E8F0] w-full flex items-center justify-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#64748B]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D99B26]" />
                    <span>Executive Advisory</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitteePage;
