import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Check, ShieldCheck, Star, Users, ArrowRight, HelpCircle } from 'lucide-react';

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
    <div className="w-full">
      <PageHeader
        title="Executive Membership"
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
                  ? 'bg-slate-900 text-white shadow-2xl border-2 border-blue-500 transform md:-translate-y-2'
                  : 'bg-white text-slate-900 shadow-xl border border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    tier.isPrimary ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tier.badge}
                  </span>
                  <ShieldCheck className={`w-5 h-5 ${tier.isPrimary ? 'text-blue-400' : 'text-slate-400'}`} />
                </div>

                <h3 className="text-2xl font-serif font-bold mb-1">{tier.name}</h3>
                <p className={`text-xs leading-relaxed mb-6 ${tier.isPrimary ? 'text-slate-300' : 'text-slate-500'}`}>
                  {tier.subtitle}
                </p>

                <div className={`pt-4 border-t mb-6 space-y-3 ${tier.isPrimary ? 'border-slate-800' : 'border-slate-100'}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${tier.isPrimary ? 'text-blue-400' : 'text-slate-400'}`}>
                    Privileges Included
                  </p>
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${tier.isPrimary ? 'text-blue-400' : 'text-emerald-600'}`} />
                      <span className={tier.isPrimary ? 'text-slate-200' : 'text-slate-600'}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/login"
                className={`w-full py-3.5 rounded-full text-center text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  tier.isPrimary
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Membership Process */}
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200 text-center max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            Application Journey
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-4 mb-4">
            How CXO Connect Membership Works
          </h3>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed">
            We maintain strict credential verification to safeguard confidential discussions and high-caliber peer exchanges.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-3">1</div>
              <h4 className="text-base font-bold text-slate-900">Sign In with OTP</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Provide your executive email or authenticate securely with LinkedIn.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-3">2</div>
              <h4 className="text-base font-bold text-slate-900">Complete Profile</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Input your corporate title, company, regional chapter, and LinkedIn credentials.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-3">3</div>
              <h4 className="text-base font-bold text-slate-900">Peer Committee Review</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
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
