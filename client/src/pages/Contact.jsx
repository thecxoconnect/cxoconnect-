import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { contactService } from '../services/api';
import { useToast } from '../components/Toast';
import { Mail, Phone, MapPin, Send, ShieldCheck } from 'lucide-react';

const offices = [
  {
    city: 'Mumbai (Global HQ)',
    address: 'Executive Tower 2, One BKC, Bandra Kurla Complex',
    phone: '+91 22 6123 4500',
    email: 'mumbai@cxoconnect.com'
  },
  {
    city: 'Bengaluru Chapter',
    address: 'Prestige Trade Tower, Palace Road, High Grounds',
    phone: '+91 80 4123 6700',
    email: 'bengaluru@cxoconnect.com'
  },
  {
    city: 'Delhi NCR Chapter',
    address: 'DLF Cyber City, Tower 10, DLF Phase 2, Gurugram',
    phone: '+91 124 456 7890',
    email: 'delhi@cxoconnect.com'
  },
  {
    city: 'Singapore & APAC',
    address: 'Marina Bay Financial Centre, Tower 1, Singapore',
    phone: '+65 6789 0123',
    email: 'apac@cxoconnect.com'
  }
];

const Contact = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: 'Executive Membership Inquiry',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Name, Email, and Message are required.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await contactService.submitContact(formData);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: 'Executive Membership Inquiry',
          message: ''
        });
      }
    } catch (err) {
      addToast('Failed to submit message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#F7F7F4] min-h-screen pb-20">
      <PageHeader
        title="Executive Secretariat"
        subtitle="Connect with our membership admissions committee, corporate relations desk, or regional chapter leads."
        badge="Direct Inquiry"
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-[#E2E8F0]">
            <div className="mb-6">
              <span className="category-subtitle">
                Confidential Inquiry
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111315] mt-2 font-heading tracking-tight">
                Send a Message to Leadership
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                Our relationship team guarantees a response within 1 business day.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111315] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Vikramaditya Mehta"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111315] mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="v.mehta@enterprise.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111315] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98200 12345"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111315] mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Vanguard Group"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111315] mb-1">
                  Inquiry Topic
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                >
                  <option value="Executive Membership Inquiry">Executive Membership Inquiry</option>
                  <option value="Conclave Speaking / Panel Moderation">Conclave Speaking / Panel Moderation</option>
                  <option value="Corporate Sponsorship & Roundtable Co-hosting">Corporate Sponsorship & Roundtable Co-hosting</option>
                  <option value="Advisory Board Nomination">Advisory Board Nomination</option>
                  <option value="General Secretariat Support">General Secretariat Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111315] mb-1">
                  Message / Brief *
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Outline your inquiry, chapter location, or strategic goals..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-charcoal w-full py-3.5 text-xs rounded-full font-bold"
              >
                {submitting ? (
                  <span>Dispatching...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#D99B26]" />
                    <span>Submit Executive Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Regional Secretariat Offices */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card-dark-navy p-6 sm:p-8 space-y-6">
              <span className="category-subtitle">
                Global Operations
              </span>
              <h3 className="text-xl font-bold font-heading text-white mt-1">
                Secretariat Coordinates
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct access to regional administrative officers for priority calendar alignment and private conclave bookings.
              </p>

              <div className="space-y-3.5">
                {offices.map((off, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-heading">
                      <MapPin className="w-4 h-4 text-[#D99B26]" />
                      <span>{off.city}</span>
                    </h4>
                    <p className="text-xs text-slate-400 pl-5">{off.address}</p>
                    <div className="pt-1.5 pl-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#D99B26]">
                      <span>{off.phone}</span>
                      <span>•</span>
                      <span>{off.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-[#D99B26] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#64748B] leading-relaxed">
                <strong className="font-bold text-[#111315]">Strict Confidentiality Standard:</strong>
                <p className="mt-0.5">
                  All correspondence submitted to CXO Connect is maintained under non-disclosure governance. Inquiries are never shared with third parties or external recruiters.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
