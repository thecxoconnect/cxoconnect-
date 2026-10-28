import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Check, ShieldCheck, ArrowRight } from 'lucide-react';

const tiers = [
  {
    name: 'Charter Member',
    subtitle: 'For individual C-Suite Executives, VPs & Founders',
    badge: 'Popular',
    features: [
      'Access to closed-door Chatham House Rule summits',
      'Direct directory access to 2,500+ verified C-Suite peers',
      'Exclusive admission to regional chapter dinners',
      'Full access to CXO Knowledge Hub & decision frameworks',
      'Priority RSVP for annual flagship conclaves'
    ],
    cta: 'Apply for Membership',
    isPrimary: true
  },
  {
    name: 'Executive Fellow',
    subtitle: 'For Board Directors, Senior Advisors & Industry Titans',
    badge: 'Faculty',
    features: [
      'All Charter Member privileges',
      'Advisory & mentorship listing on CXO Connect Faculty',
      'Keynote speaking & panel moderation opportunities',
      'Direct access to Global Advisory Board conclaves',
      'Bespoke executive branding and thought-leadership syndication'
    ],
    cta: 'Nominate as Fellow',
    isPrimary: false
  },
  {
    name: 'Corporate Patron',
    subtitle: 'For Enterprises & Multinationals seeking ecosystem engagement',
    badge: 'Enterprise',
    features: [
      'Up to 5 executive C-Suite memberships for your organization',
      'Co-hosting rights for specialized sector roundtables',
      'Prominent corporate brand placement across summits',
      'Direct pipeline to executive talent advisory networks',
      'Dedicated executive relationship manager'
    ],
    cta: 'Corporate Inquiry',
    isPrimary: false
  }
];

const Membership = () => {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to Profile / Dashboard
  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="w-full bg-[#F7F7F4] min-h-screen pb-20">
      <PageHeader
        title="Executive Membership Privileges"
        subtitle="Step into the premier community connecting enterprise leaders. Membership is curated and peer-reviewed."
        badge="Invitation & Application"
        breadcrumbs={[{ label: 'Membership' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                tier.isPrimary
                  ? 'bg-[#0E1622] text-white shadow-2xl border-2 border-[#D99B26] transform md:-translate-y-2'
                  : 'bg-white text-[#111315] shadow-sm border border-[#E2E8F0]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    tier.isPrimary ? 'bg-[#D99B26] text-white' : 'bg-[#F7F7F4] text-[#111315] border border-[#E2E8F0]'
                  }`}>
                    {tier.badge}
                  </span>
                  <ShieldCheck className={`w-5 h-5 ${tier.isPrimary ? 'text-[#D99B26]' : 'text-[#64748B]'}`} />
                </div>

                <h3 className="text-2xl font-bold font-heading mb-1">{tier.name}</h3>
                <p className={`text-xs leading-relaxed mb-6 ${tier.isPrimary ? 'text-slate-300' : 'text-[#64748B]'}`}>
                  {tier.subtitle}
                </p>

                <div className={`pt-4 border-t mb-6 space-y-3 ${tier.isPrimary ? 'border-white/10' : 'border-[#E2E8F0]'}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-widest ${tier.isPrimary ? 'text-[#D99B26]' : 'text-[#64748B]'}`}>
                    Privileges Included
                  </p>
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${tier.isPrimary ? 'text-[#D99B26]' : 'text-emerald-600'}`} />
                      <span className={tier.isPrimary ? 'text-slate-200' : 'text-[#64748B]'}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/login"
                className={`w-full py-3.5 rounded-full text-center text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  tier.isPrimary
                    ? 'btn-ochre shadow-lg'
                    : 'btn-charcoal'
                }`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Membership Application Process */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E2E8F0] text-center max-w-4xl mx-auto shadow-sm">
          <span className="category-subtitle">
            Application Journey
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111315] mt-3 mb-4 font-heading tracking-tight">
            How CXO Connect Membership Works
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto mb-10 leading-relaxed">
            We maintain strict credential verification to safeguard confidential discussions and high-caliber peer exchanges.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-[#F7F7F4] p-6 rounded-2xl border border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D99B26] flex items-center justify-center font-bold text-sm mb-3">1</div>
              <h4 className="text-sm font-bold text-[#111315]">Sign In with OTP</h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Provide your executive email or authenticate securely with LinkedIn.
              </p>
            </div>
            <div className="bg-[#F7F7F4] p-6 rounded-2xl border border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D99B26] flex items-center justify-center font-bold text-sm mb-3">2</div>
              <h4 className="text-sm font-bold text-[#111315]">Complete Profile</h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Input your corporate title, company, regional chapter, and LinkedIn credentials.
              </p>
            </div>
            <div className="bg-[#F7F7F4] p-6 rounded-2xl border border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D99B26] flex items-center justify-center font-bold text-sm mb-3">3</div>
              <h4 className="text-sm font-bold text-[#111315]">Admissions Review</h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Applications are reviewed within 24 hours for full voting and conclave access.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Membership;
