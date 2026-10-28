import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import CertificationCard from '../components/CertificationCard';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, ArrowRight, Eye, Sparkles } from 'lucide-react';

const frameworks = [
  {
    title: 'Enterprise AI Governance & Boardroom Accountability Matrix',
    category: 'Technology Strategy',
    author: 'CXO AI Advisory Council',
    readTime: '18 min read',
    summary: 'A proprietary decision architecture for CEOs and CIOs balancing autonomous generative agents against data confidentiality, model bias, and liability rails.',
    downloadUrl: '#'
  },
  {
    title: 'Cross-Border M&A Due Diligence: Navigating Geopolitical Shocks',
    category: 'Corporate Finance',
    author: 'CFO Leadership Taskforce',
    readTime: '24 min read',
    summary: 'A battlefield-tested playbook detailing debt restructuring, foreign currency hedging, and sovereign regulatory compliance for cross-border buyouts.',
    downloadUrl: '#'
  },
  {
    title: 'The High-Performance C-Suite Succession Playbook',
    category: 'Board Governance',
    author: 'Advisory Board Secretariat',
    readTime: '15 min read',
    summary: 'Strategic evaluation metrics and cultural alignment protocols for grooming internal executive successors and onboarding board directorships.',
    downloadUrl: '#'
  },
  {
    title: 'Zero-Trust Cyber Resilience for C-Suite Decision Makers',
    category: 'Risk Management',
    author: 'Enterprise Security Taskforce',
    readTime: '20 min read',
    summary: 'Translating technical threat vectors into financial risk quantification for executive boards and audit committees.',
    downloadUrl: '#'
  }
];

const certifications = [
  {
    title: 'Certified CXO Boardroom Director (CCBD)',
    issuer: 'CXO Connect Governance Academy',
    duration: '6 Weeks (Cohort-based)',
    level: 'Advanced Executive Track',
    modules: [
      'Fiduciary Duties & Audit Committee Mastery',
      'Crisis Governance & Stakeholder Alignment',
      'ESG Metrics & Capital Allocation Models',
      'Simulated Boardroom Hostile Takeover Defense'
    ]
  },
  {
    title: 'Executive AI Strategist & Transformational Leader',
    issuer: 'CXO Connect Technology Council',
    duration: '4 Weeks (Intensive)',
    level: 'C-Suite Certification',
    modules: [
      'Generative Enterprise Architecture & Unit Economics',
      'AI Ethics, IP Sovereignty & Data Governance',
      'GTM Velocity with Intelligent Autonomous Agents',
      'Executive Change Management for 5,000+ Employee Orgs'
    ]
  }
];

const KnowledgeHub = () => {
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedFramework, setSelectedFramework] = useState(null);

  const handleDownload = (frameworkTitle) => {
    if (!isAuthenticated) {
      addToast('Please login to download proprietary CXO frameworks.', 'warning');
      return;
    }
    addToast(`"${frameworkTitle}" PDF dispatched to your registered email.`, 'success');
  };

  const handleEnroll = (title) => {
    if (!isAuthenticated) {
      addToast('Please login to apply for executive certifications.', 'warning');
      return;
    }
    addToast(`Application initiated for "${title}". The admissions director will contact you.`, 'success');
  };

  return (
    <div className="w-full bg-[#F7F7F4] min-h-screen pb-20">
      <PageHeader
        title="Executive Knowledge Hub"
        subtitle="Proprietary decision-making frameworks, peer-researched whitepapers, and board certification tracks."
        badge="Strategic Intelligence"
        breadcrumbs={[{ label: 'Knowledge Hub' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Assessment Banner (Dark Navy #0E1622) */}
        <div className="mb-16 p-8 rounded-3xl bg-[#0E1622] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-white/10">
          <div className="space-y-2 max-w-xl">
            <span className="category-subtitle">
              Interactive Assessment
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Discover Your CXO Decision-Making Archetype
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Take our 4-minute executive evaluation to benchmark your leadership tendencies against 2,500+ C-suite peers.
            </p>
          </div>
          <Link
            to="/quiz"
            className="btn-ochre px-8 py-3.5 text-xs font-bold rounded-full flex-shrink-0"
          >
            <span>Launch CXO Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Frameworks Section */}
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="category-subtitle">
                Boardroom Briefings
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111315] mt-2 font-heading tracking-tight">
                Executive Frameworks & Research
              </h2>
            </div>
            <p className="text-xs text-[#64748B] mt-2 sm:mt-0">
              Updated monthly by the CXO Connect Advisory Taskforces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {frameworks.map((fw, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#D99B26]/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F7F7F4] text-[#D99B26] font-bold text-[10px] uppercase tracking-wider border border-[#E2E8F0]">
                      {fw.category}
                    </span>
                    <span>{fw.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-[#111315] mb-2 leading-snug">
                    {fw.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                    {fw.summary}
                  </p>
                  <p className="text-[11px] font-semibold text-[#64748B]">
                    Curated by: {fw.author}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedFramework(fw)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111315] hover:text-[#D99B26] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Executive Summary</span>
                  </button>

                  <button
                    onClick={() => handleDownload(fw.title)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111315] text-white hover:bg-[#D99B26] text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications Section */}
        <div id="certifications">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="category-subtitle">
              Executive Development
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111315] mt-2 mb-2 font-heading tracking-tight">
              Board Governance & Leadership Certifications
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Cohort-based programs led by veteran independent directors, former CEOs, and enterprise strategists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {certifications.map((cert, idx) => (
              <CertificationCard
                key={idx}
                {...cert}
                onEnroll={() => handleEnroll(cert.title)}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Framework Preview Modal */}
      {selectedFramework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <div>
                <span className="category-subtitle">
                  {selectedFramework.category}
                </span>
                <h3 className="text-lg font-bold font-heading text-[#111315] mt-1">
                  {selectedFramework.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFramework(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-[#F7F7F4]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#64748B] leading-relaxed py-2">
              <p><strong className="text-[#111315]">Overview:</strong> {selectedFramework.summary}</p>
              <div className="p-3 bg-[#F7F7F4] rounded-xl border border-[#E2E8F0] space-y-1">
                <p className="font-bold text-[#111315]">Included Playbooks:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[#64748B]">
                  <li>Executive Boardroom Briefing Slides (16:9)</li>
                  <li>Audit Committee Decision Rubric</li>
                  <li>Cross-functional KPI & Liability Matrix</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedFramework(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#64748B] hover:bg-[#F7F7F4]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedFramework.title);
                  setSelectedFramework(null);
                }}
                className="btn-charcoal px-5 py-2 text-xs rounded-full"
              >
                Download Complete PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeHub;
