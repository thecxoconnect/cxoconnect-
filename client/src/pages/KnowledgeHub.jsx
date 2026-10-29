import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import CertificationCard from '../components/CertificationCard';
import { resourceService } from '../services/api';
import { Download, Eye, ArrowRight, RefreshCw } from 'lucide-react';
import { useToast } from '../components/Toast';

const KnowledgeHub = () => {
  const { addToast } = useToast();
  const [frameworks, setFrameworks] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [fwRes, certRes] = await Promise.all([
          resourceService.getFrameworks().catch(() => ({ data: { success: false, data: [] } })),
          resourceService.getCertifications().catch(() => ({ data: { success: false, data: [] } }))
        ]);

        if (fwRes.data?.success) setFrameworks(fwRes.data.data);
        if (certRes.data?.success) setCertifications(certRes.data.data);
      } catch (err) {
        console.error('Failed to load Knowledge Hub resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleDownload = (title) => {
    addToast(`Preparing executive PDF for "${title}"...`, 'info');
    setTimeout(() => {
      addToast(`"${title}" download initiated.`, 'success');
    }, 1200);
  };

  const handleEnroll = (title) => {
    addToast(`Application request recorded for "${title}". Admissions committee will reach out.`, 'success');
  };

  return (
    <div className="w-full bg-[#F7F7F4] pb-20">
      <PageHeader
        title="Executive Knowledge Hub"
        subtitle="Proprietary governance frameworks, boardroom briefing playbooks, and directorship certification tracks curated by veteran enterprise chairs."
        badge="Governance & Foresight"
        breadcrumbs={[{ label: 'Knowledge Hub' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* CXO Quiz Callout Banner */}
        <div className="bg-[#111315] text-white rounded-3xl p-6 sm:p-10 mb-16 border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D99B26]">
              Self-Assessment Tool
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-heading">
              Benchmark Your Boardroom Leadership Quotient
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Take our 4-minute executive evaluation to benchmark your leadership tendencies against 2,500+ C-suite peers.
            </p>
          </div>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-xs font-bold rounded-full bg-[#D99B26] hover:bg-[#C2871E] text-[#111315] transition-all shadow-md flex-shrink-0"
          >
            <span>Launch CXO Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Frameworks Section (Dynamic from MongoDB) */}
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
            <p className="text-xs text-[#64748B] mt-2 sm:mt-0 font-medium">
              Real-time MongoDB intelligence repository
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#64748B]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D99B26] mb-2" />
              <p className="text-xs font-semibold">Loading frameworks from MongoDB...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {frameworks.map((fw) => (
                <div key={fw._id} className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#D99B26]/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#64748B] mb-3">
                      <span className="px-3 py-1 rounded-full bg-[#D99B26]/10 text-[#D99B26] font-bold text-[10px] uppercase tracking-wider border border-[#D99B26]/30">
                        {fw.category || 'Strategic Leadership'}
                      </span>
                      <span>{fw.readTime || '15 min read'}</span>
                    </div>

                    <h3 className="text-lg font-bold font-heading text-[#111315] mb-2 leading-snug">
                      {fw.title}
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                      {fw.summary || fw.description}
                    </p>
                    <p className="text-[11px] font-semibold text-[#D99B26]">
                      Curated by: {fw.author || 'CXO Advisory Council'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] mt-6 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedFramework(fw)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111315] hover:text-[#D99B26] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#D99B26]" />
                      <span>Executive Summary</span>
                    </button>

                    <button
                      onClick={() => handleDownload(fw.title)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111315] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D99B26]" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certifications Section (Dynamic from MongoDB) */}
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
            {certifications.map((cert) => (
              <CertificationCard
                key={cert._id}
                title={cert.title}
                issuer={cert.issuer || cert.issuingBody}
                duration={cert.duration}
                level={cert.level || cert.credentialType}
                modules={cert.modules || (cert.prerequisites ? [cert.prerequisites] : [])}
                onEnroll={() => handleEnroll(cert.title)}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Framework Preview Modal */}
      {selectedFramework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
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
              <p><strong className="text-[#111315]">Overview:</strong> {selectedFramework.summary || selectedFramework.description}</p>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
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
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#111315] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Download Complete PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeHub;
