import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { sponsorService } from '../services/api';
import { useToast } from '../components/Toast';
import { Building2, Handshake, CheckCircle2, Send, ExternalLink, ShieldCheck } from 'lucide-react';

const Partners = () => {
  const { addToast } = useToast();
  const [sponsors, setSponsors] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    tierInterest: 'Platinum Sponsor',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await sponsorService.getSponsors();
        if (res.data.success) {
          setSponsors(res.data.data);
          setGrouped(res.data.grouped || {});
        }
      } catch (err) {
        console.error('Sponsors fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSponsors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.email) {
      addToast('Please complete company name, contact person, and email.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await sponsorService.submitPartnerInquiry(formData);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setFormData({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          tierInterest: 'Platinum Sponsor',
          message: ''
        });
      }
    } catch (err) {
      addToast('Failed to submit partnership inquiry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#F7F7F4] min-h-screen pb-20">
      <PageHeader
        title="Partners & Sponsors"
        subtitle="Collaborating with industry pioneers to deliver premier executive gatherings and strategic intelligence."
        badge="Enterprise Ecosystem"
        breadcrumbs={[{ label: 'Partners' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Tier Sections */}
        {grouped.strategicPartners?.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <span className="category-subtitle">
                Tier One Collaboration
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111315] mt-2 font-heading tracking-tight">
                Strategic Partners
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {grouped.strategicPartners.map((sp) => (
                <div key={sp._id} className="card-dark-navy p-8 flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-[#D99B26]/30 flex items-center justify-center text-[#D99B26] font-bold text-2xl font-heading flex-shrink-0">
                    {sp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading text-white">{sp.name}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sp.description}</p>
                    {sp.website && (
                      <a
                        href={sp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#D99B26] mt-3 hover:underline"
                      >
                        <span>Visit Enterprise Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platinum & Gold Sponsors */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <span className="category-subtitle">
              Ecosystem Collaborators
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111315] mt-2 font-heading tracking-tight">
              Platinum & Knowledge Partners
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sponsors
              .filter((s) => s.tier !== 'Strategic Partner')
              .map((sp) => (
                <div key={sp._id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#D99B26]/50 transition-all p-6 flex flex-col items-center text-center justify-between">
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-[#F7F7F4] border border-[#E2E8F0] text-[#D99B26] flex items-center justify-center font-bold text-xl font-heading mb-3">
                      {sp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99B26] bg-[#F7F7F4] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                      {sp.tier}
                    </span>
                    <h4 className="text-base font-bold text-[#111315] mt-2 leading-tight">{sp.name}</h4>
                    <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{sp.description}</p>
                  </div>
                  {sp.website && (
                    <a
                      href={sp.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] hover:text-[#D99B26] mt-4"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Partnership Inquiry Form (Dark Navy #0E1622) */}
        <div className="max-w-3xl mx-auto card-dark-navy p-8 sm:p-12 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="category-subtitle">
              Corporate Relations
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-heading">
              Partner with CXO Connect
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Connect your brand with 2,500+ pre-vetted enterprise decision makers through sponsored roundtables and bespoke research.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Goldman Sachs Global"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Executive Contact Person *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="e.g. Anvi Sharma, VP Partnerships"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98200 12345"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Partnership Tier of Interest
              </label>
              <select
                name="tierInterest"
                value={formData.tierInterest}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0E1622] border border-white/10 text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
              >
                <option value="Strategic Partner">Strategic Partner</option>
                <option value="Platinum Sponsor">Platinum Sponsor</option>
                <option value="Gold Sponsor">Gold Sponsor</option>
                <option value="Knowledge Partner">Knowledge Partner</option>
                <option value="Roundtable Co-Host">C-Suite Roundtable Co-Host</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Strategic Objectives
              </label>
              <textarea
                rows={3}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your brand goals, target industry vertical, and timeline..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-ochre w-full py-3.5 rounded-full text-xs font-bold"
            >
              {submitting ? (
                <span>Submitting Proposal...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Corporate Partnership Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Partners;
